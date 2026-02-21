/* --- South New System - Server Entry Point --- */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_south_new_system_2024';

// Initialize
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // For easy initial hosting, we'll allow all. You can restrict this later to your Vercel URL.
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' })); // Increase Payload Limit

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- System Routes ---

// Dashboard Stats API
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const [
            totalInvoices,
            totalQuotes,
            totalClients,
            totalProducts,
            totalProjects,
            totalEmployees,
            recentInvoices,
            recentQuotes,
            lowStockItems,
            invoiceStats
        ] = await Promise.all([
            prisma.invoice.count(),
            prisma.quote.count(),
            prisma.partner.count({ where: { type: 'CUSTOMER' } }),
            prisma.product.count(),
            prisma.project.count(),
            prisma.employee.count(),
            prisma.invoice.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { partner: true }
            }),
            prisma.quote.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { partner: true }
            }),
            prisma.stock.findMany({
                where: { quantity: { lt: 10 } },
                include: { product: true },
                take: 5
            }),
            prisma.invoice.aggregate({
                _sum: { total: true },
                where: { status: { not: 'CANCELLED' } }
            })
        ]);

        // Monthly revenue (last 6 months)
        const now = new Date();
        const monthlyRevenue = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const monthData = await prisma.invoice.aggregate({
                _sum: { total: true },
                where: {
                    date: { gte: date, lte: endDate },
                    status: { not: 'CANCELLED' }
                }
            });
            monthlyRevenue.push({
                label: date.toLocaleDateString('ar-SA', { month: 'short' }),
                value: monthData._sum.total || 0
            });
        }

        const pendingQuotes = await prisma.quote.count({ where: { status: 'DRAFT' } });
        const acceptedQuotes = await prisma.quote.count({ where: { status: 'ACCEPTED' } });
        const activeProjects = await prisma.project.count({ where: { status: { in: ['PLANNED', 'IN_PROGRESS'] } } });

        res.json({
            totals: {
                invoices: totalInvoices,
                quotes: totalQuotes,
                clients: totalClients,
                products: totalProducts,
                projects: totalProjects,
                employees: totalEmployees,
                revenue: invoiceStats._sum.total || 0
            },
            recentInvoices: recentInvoices.map(inv => ({
                id: inv.id,
                number: inv.invoiceNumber,
                client: inv.partner?.name || 'غير محدد',
                amount: inv.total,
                status: inv.status,
                date: inv.date
            })),
            recentQuotes: recentQuotes.map(qt => ({
                id: qt.id,
                number: qt.quoteNumber,
                client: qt.partner?.name || 'غير محدد',
                amount: qt.total,
                status: qt.status,
                date: qt.date
            })),
            lowStock: lowStockItems.map(s => ({
                name: s.product.name,
                quantity: s.quantity
            })),
            monthlyRevenue,
            quickStats: {
                pendingQuotes,
                acceptedQuotes,
                activeProjects,
                lowStockCount: lowStockItems.length
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/notifications', async (req, res) => {
    try {
        const alerts = [];

        // 1. Check Low Stock
        const lowStock = await prisma.stock.findMany({
            where: { quantity: { lt: 10 } },
            include: { product: true }
        });
        lowStock.forEach(s => {
            alerts.push({
                id: `stock-${s.id}`,
                text: `نقص في مخزون "${s.product.name}" (${s.quantity})`,
                type: 'stock',
                time: 'تنبيه فوري'
            });
        });

        // 2. Check Expiring Quotes
        const expiringQuotes = await prisma.quote.findMany({
            where: {
                status: 'SENT',
                validUntil: { lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }
            }
        });
        expiringQuotes.forEach(q => {
            alerts.push({
                id: `quote-${q.id}`,
                text: `عرض سعر #${q.quoteNumber} أوشك على الانتهاء`,
                type: 'quote',
                time: 'تحرك سريع'
            });
        });

        // 3. New Draft Invoices
        const draftInvoices = await prisma.invoice.findMany({
            where: { status: 'DRAFT' },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        draftInvoices.forEach(inv => {
            alerts.push({
                id: `inv-${inv.id}`,
                text: `فاتورة مسودة جديدة #${inv.invoiceNumber} معلقة`,
                type: 'invoice',
                time: 'بانتظار المراجعة'
            });
        });

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    try {
        const results = [];

        // Search Partners (Clients)
        const partners = await prisma.partner.findMany({
            where: {
                OR: [
                    { name: { contains: q } },
                    { phone: { contains: q } },
                    { vatNumber: { contains: q } }
                ]
            },
            take: 5
        });
        partners.forEach(p => results.push({ id: p.id, title: p.name, type: 'client', subtitle: `عميل - ${p.phone || ''}`, link: `/clients` }));

        // Search Invoices
        const invoices = await prisma.invoice.findMany({
            where: {
                OR: [
                    { invoiceNumber: { contains: q } }
                ]
            },
            take: 5
        });
        invoices.forEach(inv => results.push({ id: inv.id, title: `فاتورة ${inv.invoiceNumber}`, type: 'invoice', subtitle: `مبلغ: ${inv.total} ر.س`, link: `/invoices` }));

        // Search Quotes
        const quotes = await prisma.quote.findMany({
            where: {
                OR: [
                    { quoteNumber: { contains: q } }
                ]
            },
            take: 5
        });
        quotes.forEach(qte => results.push({ id: qte.id, title: `عرض سعر ${qte.quoteNumber}`, type: 'quote', subtitle: `مبلغ: ${qte.total} ر.س`, link: `/quotes` }));

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('<h1>South New System API v2.0.0</h1><p>Status: Online. <a href="/api/status">Check DB Status</a></p>');
});

// Health Check
app.get('/api/status', async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        const os = require('os');
        const interfaces = os.networkInterfaces();
        let localIp = '127.0.0.1';
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    localIp = iface.address;
                    break;
                }
            }
        }
        res.json({
            system: 'South New System',
            version: '2.0.0',
            status: 'Online',
            dbStatus: 'Connected',
            localIp: localIp,
            stats: { users: userCount }
        });
    } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({ system: 'South New System', status: 'Error', dbStatus: 'Disconnected', error: error.message });
    }
});

// --- Auth Routes ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'البريد الإلكتروني غير مسجل' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'كلمة المرور غير صحيحة' });

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

        // Log Activity
        await prisma.activityLog.create({
            data: { userId: user.id, action: 'LOGIN', details: 'User logged in successfully' }
        });

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'فشل في عملية تسجيل الدخول' });
    }
});

// --- User Management Routes ---

// Get All Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: 'asc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create New User
app.post('/api/users', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: role || 'USER' },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        res.json(user);
    } catch (error) {
        if (error.code === 'P2002') return res.status(400).json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' });
        res.status(500).json({ error: error.message });
    }
});

// Delete User
app.delete('/api/users/:id', async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Master Data Routes (Partners & Products) ---

// Get All Partners (Customers)
app.get('/api/partners', async (req, res) => {
    try {
        const partners = await prisma.partner.findMany({
            where: { type: 'CUSTOMER' },
            orderBy: { name: 'asc' }
        });
        res.json(partners);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add New Partner (Client)
app.post('/api/partners', async (req, res) => {
    try {
        const partner = await prisma.partner.create({
            data: {
                name: req.body.name,
                type: 'CUSTOMER',
                phone: req.body.phone,
                address: req.body.address,
                vatNumber: req.body.vatNumber
            }
        });
        res.json(partner);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Partner
app.put('/api/partners/:id', async (req, res) => {
    try {
        const partner = await prisma.partner.update({
            where: { id: parseInt(req.params.id) },
            data: req.body
        });
        res.json(partner);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Partner Details with Invoices (Mini Statement)
app.get('/api/partners/:id', async (req, res) => {
    try {
        const partner = await prisma.partner.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { invoices: { orderBy: { date: 'desc' } } }
        });
        res.json(partner);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Products
app.get('/api/products', async (req, res) => {
    try {
        const { categoryId } = req.query;
        const where = categoryId ? { categoryId: parseInt(categoryId) } : {};
        const products = await prisma.product.findMany({
            where,
            include: { stocks: true, category: true },
            orderBy: { name: 'asc' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { products: true } } },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Category
app.post('/api/categories', async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await prisma.category.create({ data: { name, description } });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Category
app.delete('/api/categories/:id', async (req, res) => {
    try {
        // Unlink products first
        await prisma.product.updateMany({
            where: { categoryId: parseInt(req.params.id) },
            data: { categoryId: null }
        });
        await prisma.category.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { name, price, cost, categoryId } = req.body;
        const product = await prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data: {
                name,
                price: parseFloat(price),
                cost: parseFloat(cost),
                categoryId: categoryId ? parseInt(categoryId) : null
            },
            include: { stocks: true, category: true }
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.stock.deleteMany({ where: { productId: id } });
        await prisma.product.delete({ where: { id: id } });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper: Get or create default warehouse
async function getOrCreateWarehouse() {
    let warehouse = await prisma.warehouse.findFirst();
    if (!warehouse) {
        warehouse = await prisma.warehouse.create({
            data: { name: 'المستودع الرئيسي', location: 'المقر الرئيسي' }
        });
    }
    return warehouse;
}

// Stock Adjustment (ADD or SUBTRACT)
app.post('/api/products/:id/adjust', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { quantity, type } = req.body;
        const warehouse = await getOrCreateWarehouse();
        const currentStock = await prisma.stock.findFirst({
            where: { productId, warehouseId: warehouse.id }
        });
        if (currentStock) {
            const newQty = type === 'ADD' ? currentStock.quantity + parseInt(quantity) : currentStock.quantity - parseInt(quantity);
            await prisma.stock.update({
                where: { id: currentStock.id },
                data: { quantity: Math.max(0, newQty) }
            });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Set Stock Quantity Directly (inline edit)
app.put('/api/products/:id/stock', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { quantity } = req.body;
        const warehouse = await getOrCreateWarehouse();
        const existingStock = await prisma.stock.findFirst({
            where: { productId, warehouseId: warehouse.id }
        });
        if (existingStock) {
            await prisma.stock.update({
                where: { id: existingStock.id },
                data: { quantity: Math.max(0, parseInt(quantity) || 0) }
            });
        } else {
            await prisma.stock.create({
                data: { productId, warehouseId: warehouse.id, quantity: Math.max(0, parseInt(quantity) || 0) }
            });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create New Product
app.post('/api/products', async (req, res) => {
    const { name, price, cost, quantity } = req.body;
    try {
        // Get or create default warehouse
        const warehouse = await getOrCreateWarehouse();

        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                cost: parseFloat(cost),
                stocks: {
                    create: {
                        warehouseId: warehouse.id,
                        quantity: parseInt(quantity) || 0
                    }
                }
            }
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Invoice Routes ---

// Get All Invoices
app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            include: {
                partner: true,
                items: { include: { product: true } }
            },
            orderBy: { date: 'desc' }
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Single Invoice by ID
app.get('/api/invoices/:id', async (req, res) => {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                partner: true,
                items: { include: { product: true } }
            }
        });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create New Invoice
app.post('/api/invoices', async (req, res) => {
    const { partnerId, date, type, items, discount } = req.body;

    // Calculate Totals
    let subtotal = 0;
    let taxAmount = 0;

    const invoiceItemsData = items.map(item => {
        const lineTotal = Number(item.quantity) * Number(item.unitPrice);
        subtotal += lineTotal;
        return {
            productId: item.productId ? Number(item.productId) : null,
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            taxRate: 0.15,
            total: lineTotal
        };
    });

    const totalBeforeTax = subtotal - (discount || 0);
    taxAmount = totalBeforeTax * 0.15;
    const total = totalBeforeTax + taxAmount;

    try {
        // Transaction: Create Invoice + Items
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Create Invoice
            const invoice = await prisma.invoice.create({
                data: {
                    invoiceNumber: `INV-${Date.now()}`, // Temporary numbering
                    uuid: require('crypto').randomUUID(),
                    date: new Date(date),
                    type: type || 'SALES_TAX',
                    status: 'POSTED',
                    partnerId: partnerId ? Number(partnerId) : null,
                    subtotal,
                    discount: Number(discount) || 0,
                    taxAmount,
                    total,
                    items: {
                        create: invoiceItemsData
                    }
                }
            });

            // 2. Update Stock (Optional for now)
            // for (const item of items) { ... }

            return invoice;
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});


// --- Project Routes ---

// Get All Projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                client: true,
                tasks: true,
                _count: { select: { tasks: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Single Project with Details
app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                client: true,
                tasks: { orderBy: { createdAt: 'desc' } },
                invoices: { orderBy: { date: 'desc' } }
            }
        });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create New Project
app.post('/api/projects', async (req, res) => {
    try {
        const { name, description, partnerId, clientId, location, startDate, endDate, budget, contractValue, status } = req.body;

        // Use either partnerId or clientId, and budget or contractValue for flexibility
        const targetClientId = parseInt(partnerId || clientId);
        if (!targetClientId) {
            return res.status(400).json({ error: ' clientId مطلوب للمشروع' });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                clientId: targetClientId,
                location,
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : null,
                contractValue: parseFloat(budget || contractValue || 0),
                status: status || 'PLANNED'
            }
        });
        res.json(project);
    } catch (error) {
        console.error('Project Create Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update Project
app.put('/api/projects/:id', async (req, res) => {
    try {
        const project = await prisma.project.update({
            where: { id: parseInt(req.params.id) },
            data: req.body
        });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Task Routes ---

// Get Tasks for a Project
app.get('/api/projects/:id/tasks', async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { projectId: parseInt(req.params.id) },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create New Task
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, projectId, assignedTo } = req.body;
        const task = await prisma.task.create({
            data: {
                title,
                description,
                status: status || 'TODO',
                priority: priority || 'MEDIUM',
                dueDate: dueDate ? new Date(dueDate) : null,
                projectId: projectId ? parseInt(projectId) : null,
                assignedTo
            }
        });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Task Status
app.patch('/api/tasks/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const task = await prisma.task.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Quote Routes ---

// Get All Quotes
app.get('/api/quotes', async (req, res) => {
    try {
        const quotes = await prisma.quote.findMany({
            include: {
                partner: true,
                items: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(quotes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Single Quote
app.get('/api/quotes/:id', async (req, res) => {
    try {
        const quote = await prisma.quote.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                partner: true,
                items: { include: { product: true } }
            }
        });
        if (!quote) return res.status(404).json({ error: 'Quote not found' });
        res.json(quote);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create New Quote
app.post('/api/quotes', async (req, res) => {
    const { partnerId, date, validUntil, items, discount, notes } = req.body;

    let subtotal = 0;
    const quoteItemsData = items.map(item => {
        const lineTotal = Number(item.quantity) * Number(item.unitPrice);
        subtotal += lineTotal;
        return {
            productId: item.productId ? Number(item.productId) : null,
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            taxRate: 0.15,
            total: lineTotal
        };
    });

    const totalBeforeTax = subtotal - (discount || 0);
    const taxAmount = totalBeforeTax * 0.15;
    const total = totalBeforeTax + taxAmount;

    try {
        const quote = await prisma.quote.create({
            data: {
                quoteNumber: `QT-${Date.now()}`,
                date: date ? new Date(date) : new Date(),
                validUntil: validUntil ? new Date(validUntil) : null,
                status: 'DRAFT',
                partnerId: partnerId ? Number(partnerId) : null,
                subtotal,
                discount: Number(discount) || 0,
                taxAmount,
                total,
                notes,
                items: {
                    create: quoteItemsData
                }
            },
            include: {
                items: true,
                partner: true
            }
        });
        res.json(quote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create quote' });
    }
});

// Update Quote Status
app.patch('/api/quotes/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const quote = await prisma.quote.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        res.json(quote);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- HR Routes ---

// Get All Employees
app.get('/api/employees', async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            include: { salaries: true },
            orderBy: { name: 'asc' }
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add New Employee
app.post('/api/employees', async (req, res) => {
    try {
        const { name, jobTitle, department, phone, email, salary, status, joinDate } = req.body;
        const employee = await prisma.employee.create({
            data: {
                employeeId: `EMP-${Date.now()}`,
                name,
                jobTitle,
                department,
                phone,
                email,
                salary: parseFloat(salary) || 0,
                status: status || 'ACTIVE',
                joinDate: joinDate ? new Date(joinDate) : new Date()
            }
        });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Single Employee
app.get('/api/employees/:id', async (req, res) => {
    try {
        const employee = await prisma.employee.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { salaries: true }
        });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Employee
app.put('/api/employees/:id', async (req, res) => {
    try {
        const { name, jobTitle, department, phone, email, salary, status, joinDate } = req.body;
        const employee = await prisma.employee.update({
            where: { id: parseInt(req.params.id) },
            data: {
                name, jobTitle, department, phone, email,
                salary: parseFloat(salary),
                status,
                joinDate: joinDate ? new Date(joinDate) : undefined
            }
        });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Employee
app.delete('/api/employees/:id', async (req, res) => {
    try {
        await prisma.employee.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Employee deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Real Estate Routes ---

// Get All Properties
app.get('/api/properties', async (req, res) => {
    try {
        const properties = await prisma.property.findMany({
            include: { units: true }
        });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Property
app.post('/api/properties', async (req, res) => {
    try {
        const property = await prisma.property.create({ data: req.body });
        res.json(property);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Units for Property
app.get('/api/properties/:id/units', async (req, res) => {
    try {
        const units = await prisma.unit.findMany({
            where: { propertyId: parseInt(req.params.id) },
            include: { contracts: { include: { tenant: true } } }
        });
        res.json(units);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Unit
app.post('/api/units', async (req, res) => {
    try {
        const { propertyId, unitNumber, floor, type, status } = req.body;
        const unit = await prisma.unit.create({
            data: {
                propertyId: parseInt(propertyId),
                unitNumber,
                floor,
                type,
                status: status || 'VACANT'
            }
        });
        res.json(unit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Lease Contract
app.post('/api/contracts', async (req, res) => {
    try {
        const { unitId, tenantId, startDate, endDate, rentAmount, paymentFrequency } = req.body;
        const contract = await prisma.realEstateContract.create({
            data: {
                contractNumber: `CONT-${Date.now()}`,
                unitId: parseInt(unitId),
                tenantId: parseInt(tenantId),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                rentAmount: parseFloat(rentAmount),
                paymentFrequency,
                status: 'ACTIVE'
            }
        });

        // Update unit status to OCCUPIED
        await prisma.unit.update({
            where: { id: parseInt(unitId) },
            data: { status: 'OCCUPIED' }
        });

        res.json(contract);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Settings Routes ---
app.get('/api/settings/:key', async (req, res) => {
    try {
        const setting = await prisma.settings.findUnique({ where: { key: req.params.key } });
        res.json(setting ? JSON.parse(setting.value) : {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/settings/:key', async (req, res) => {
    try {
        const { value } = req.body;
        const setting = await prisma.settings.upsert({
            where: { key: req.params.key },
            update: { value: JSON.stringify(value) },
            create: { key: req.params.key, value: JSON.stringify(value) }
        });
        res.json(JSON.parse(setting.value));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start Server
const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Database Connected Successfully (PostgreSQL)');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`👉 API Health Check: http://localhost:${PORT}/api/status`);
        });
    } catch (error) {
        console.error('❌ Database Connection Failed:', error);
        process.exit(1);
    }
};

startServer();
