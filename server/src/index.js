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

// Prisma Client setup for Serverless (prevent too many connections)
let prisma;
if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
        datasources: {
            db: {
                url: "postgresql://postgres.amryuwnexsntzxjnhmxc:Shrahili%4007@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
            }
        }
    });
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // For easy initial hosting, we'll allow all. You can restrict this later to your Vercel URL.
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' })); // Increase Payload Limit

// Middleware to authenticate JWT
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access Denied: No Token Provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid Token' });
        req.user = user;
        next();
    });
};

// Middleware to authorize roles
const authorize = (roles = []) => {
    if (typeof roles === 'string') roles = [roles];
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Unauthorized: You do not have permission for this action' });
        }
        next();
    };
};

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- Health Checks ---
app.get('/api/test', (req, res) => res.json({ msg: 'API REACHED', path: req.url }));
app.get('/api', (req, res) => res.json({ status: 'API Working', version: '1.0.0', server: 'Vercel Serverless' }));
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV }));

// API Database Ping Test
app.get('/api/ping-db', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'connected', timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Helper to log activities
async function logActivity(userId, action, entity, entityId, details) {
    try {
        if (!userId) return;
        await prisma.activityLog.create({
            data: {
                userId,
                action,
                entity,
                entityId: entityId ? parseInt(entityId) : null,
                details
            }
        });
    } catch (e) {
        console.error('Logging failed', e);
    }
}

// ZATCA QR Helper (TLV Format)
function generateZatcaTLV(seller, vatNo, timestamp, total, vatTotal) {
    const tags = [seller, vatNo, timestamp, total, vatTotal];
    let tlv = Buffer.alloc(0);
    tags.forEach((val, i) => {
        const tag = i + 1;
        const value = Buffer.from(val.toString(), 'utf8');
        const tagBuf = Buffer.from([tag]);
        const lenBuf = Buffer.from([value.length]);
        tlv = Buffer.concat([tlv, tagBuf, lenBuf, value]);
    });
    return tlv.toString('base64');
}

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

// (Old notifications route removed - now using persistent database-backed notifications at the end of the file)

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

// Basic root route removed to allow static frontend serving

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
        res.status(500).json({
            error: `فشل الدخول: ${error.message} (Code: ${error.code})`,
            details: error.message,
            code: error.code
        });
    }
});

// --- User Management Routes ---

// Get All Users
app.get('/api/users', authenticate, authorize(['ADMIN']), async (req, res) => {
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
app.post('/api/users', authenticate, authorize(['ADMIN']), async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: role || 'USER' },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        await logActivity(req.user.id, 'CREATE', 'USER', user.id, `إضافة مستخدم جديد: ${user.name}`);
        res.json(user);
    } catch (error) {
        if (error.code === 'P2002') return res.status(400).json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' });
        res.status(500).json({ error: error.message });
    }
});

// Delete User
app.delete('/api/users/:id', authenticate, authorize(['ADMIN']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (id === req.user.id) return res.status(400).json({ error: 'لا يمكنك حذف حسابك الخاص' });
        await prisma.user.delete({ where: { id } });
        await logActivity(req.user.id, 'DELETE', 'USER', id, `حذف مستخدم رقم ${id}`);
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
async function getOrCreateWarehouse(prismaInstance = prisma) {
    let warehouse = await prismaInstance.warehouse.findFirst();
    if (!warehouse) {
        warehouse = await prismaInstance.warehouse.create({
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
app.post('/api/invoices', authenticate, async (req, res) => {
    const { partnerId, date, type, items, discount } = req.body;

    // Calculate Totals
    let subtotal = 0;
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

    const totalBeforeTax = subtotal - (Number(discount) || 0);
    const taxAmount = totalBeforeTax * 0.15;
    const total = totalBeforeTax + taxAmount;

    try {
        // Fetch Company Info for ZATCA QR
        const companySetting = await prisma.settings.findUnique({ where: { key: 'companyInfo' } });
        const companyInfo = companySetting ? JSON.parse(companySetting.value) : { name: 'مؤسسة الجنوب الجديد', vatNumber: '310123456700003' };

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Invoice
            const invoice = await tx.invoice.create({
                data: {
                    invoiceNumber: `INV-${Date.now()}`,
                    uuid: require('crypto').randomUUID(),
                    date: date ? new Date(date) : new Date(),
                    type: type || 'SALES_TAX',
                    status: 'POSTED',
                    partnerId: (partnerId && partnerId !== "") ? Number(partnerId) : null,
                    subtotal,
                    discount: Number(discount) || 0,
                    taxAmount,
                    total,
                    qrCode: generateZatcaTLV(
                        companyInfo.name,
                        companyInfo.vatNumber,
                        (date ? new Date(date) : new Date()).toISOString(),
                        total.toFixed(2),
                        taxAmount.toFixed(2)
                    ),
                    items: { create: invoiceItemsData }
                }
            });

            // 2. Auto Journal Entry (if accounting accounts exist)
            try {
                // Find required accounts
                const arAccount = await tx.account.findFirst({ where: { code: '1103' } }); // Accounts Receivable
                const revAccount = await tx.account.findFirst({ where: { code: '42' } });   // Sales Revenue
                const vatAccount = await tx.account.findFirst({ where: { code: '2102' } }); // VAT Payable

                if (arAccount && revAccount && vatAccount) {
                    // Dr. AR, Cr. Revenue, Cr. VAT
                    const journalEntries = [
                        { accountId: arAccount.id, debit: total, credit: 0, description: 'عميل - ' + invoice.invoiceNumber },
                        { accountId: revAccount.id, debit: 0, credit: totalBeforeTax, description: 'إيراد مبيعات - ' + invoice.invoiceNumber },
                        { accountId: vatAccount.id, debit: 0, credit: taxAmount, description: 'ضريبة القيمة المضافة 15% - ' + invoice.invoiceNumber },
                    ];

                    await tx.transaction.create({
                        data: {
                            date: new Date(date),
                            description: `قيد فاتورة مبيعات ${invoice.invoiceNumber}`,
                            reference: invoice.invoiceNumber,
                            type: 'INVOICE',
                            entries: { create: journalEntries }
                        }
                    });

                    // Update account balances
                    await tx.account.update({ where: { id: arAccount.id }, data: { balance: { increment: total } } });
                    await tx.account.update({ where: { id: revAccount.id }, data: { balance: { increment: -totalBeforeTax } } });
                    await tx.account.update({ where: { id: vatAccount.id }, data: { balance: { increment: -taxAmount } } });
                }
            } catch (journalErr) {
                // Journal entry failure should NOT block invoice creation
                console.warn('⚠️ Auto-journal skipped (accounts may not be seeded):', journalErr.message);
            }

            // 3. Update Stock and Check for Low Stock
            for (const item of invoiceItemsData) {
                if (item.productId) {
                    const warehouse = await getOrCreateWarehouse(tx);
                    const stock = await tx.stock.findFirst({
                        where: { productId: item.productId, warehouseId: warehouse.id }
                    });

                    if (stock) {
                        const newQty = stock.quantity - item.quantity;
                        await tx.stock.update({
                            where: { id: stock.id },
                            data: { quantity: newQty }
                        });

                        // Notify if low stock
                        if (newQty < 10) {
                            const product = await tx.product.findUnique({ where: { id: item.productId } });
                            await tx.notification.create({
                                data: {
                                    type: 'LOW_STOCK',
                                    title: 'تنبيه: نقص في المخزون',
                                    message: `المنتج "${product.name}" وصل لمستوى منخفض (${newQty} وحدة متبقية)`
                                }
                            });
                        }
                    }
                }
            }

            return invoice;
        });

        // Log Activity
        await logActivity(req.user.id, 'CREATE', 'INVOICE', result.id, `إنشاء فاتورة #${result.invoiceNumber} بمبلغ ${result.total} ر.س`);

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

// Pay Salary (creates payroll journal entry)
app.post('/api/employees/:id/pay-salary', async (req, res) => {
    const employeeId = parseInt(req.params.id);
    const { amount, month, year, notes } = req.body;

    try {
        const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        const salaryAmount = parseFloat(amount) || employee.salary;
        const periodLabel = `${month || new Date().toLocaleString('ar-SA', { month: 'long' })} ${year || new Date().getFullYear()}`;

        const result = await prisma.$transaction(async (tx) => {
            // Find accounts
            const salaryExpenseAccount = await tx.account.findFirst({ where: { code: '5101' } }); // Salary Expense
            const cashAccount = await tx.account.findFirst({ where: { code: '1101' } }); // Cash
            const salaryPayableAccount = await tx.account.findFirst({ where: { code: '2103' } }); // Salaries Payable

            if (salaryExpenseAccount && cashAccount) {
                // Dr. Salary Expense, Cr. Cash (or Salaries Payable)
                const creditAccount = salaryPayableAccount || cashAccount;
                await tx.transaction.create({
                    data: {
                        date: new Date(),
                        description: `صرف راتب ${employee.name} - ${periodLabel}`,
                        reference: `SAL-${employee.employeeId}-${Date.now()}`,
                        type: 'JOURNAL',
                        entries: {
                            create: [
                                { accountId: salaryExpenseAccount.id, debit: salaryAmount, credit: 0, description: `راتب ${employee.name} - ${periodLabel}` },
                                { accountId: creditAccount.id, debit: 0, credit: salaryAmount, description: `صرف راتب ${employee.name}` },
                            ]
                        }
                    }
                });
                await tx.account.update({ where: { id: salaryExpenseAccount.id }, data: { balance: { increment: salaryAmount } } });
                await tx.account.update({ where: { id: creditAccount.id }, data: { balance: { increment: -salaryAmount } } });
            }

            // Record salary payment in SalaryRecord
            const salary = await tx.salaryRecord.create({
                data: {
                    employeeId,
                    month: parseInt(month) || new Date().getMonth() + 1,
                    year: parseInt(year) || new Date().getFullYear(),
                    baseSalary: salaryAmount,
                    allowances: 0,
                    deductions: 0,
                    netSalary: salaryAmount,
                    paymentDate: new Date(),
                    status: 'PAID'
                }
            });
            return salary;
        });

        res.json(result);
    } catch (error) {
        console.error('Pay salary error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Salary History for Employee
app.get('/api/employees/:id/salaries', async (req, res) => {
    try {
        const salaries = await prisma.salaryRecord.findMany({
            where: { employeeId: parseInt(req.params.id) },
            orderBy: [{ year: 'desc' }, { month: 'desc' }]
        });
        res.json(salaries);
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

// --- Accounting & General Ledger Routes ---

// Get Chart of Accounts (Hierarchical)
app.get('/api/accounts', async (req, res) => {
    try {
        const accounts = await prisma.account.findMany({
            include: { children: true },
            orderBy: { code: 'asc' }
        });

        // Transform into a tree structure if needed, or send as is
        // For simplicity, we'll send a flat list and handle tree structure in frontend
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create New Account
app.post('/api/accounts', async (req, res) => {
    const { name, code, type, parentId } = req.body;
    try {
        const account = await prisma.account.create({
            data: {
                name,
                code,
                type,
                parentId: parentId ? parseInt(parentId) : null
            }
        });
        res.json(account);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Journal Entry
app.post('/api/journal', async (req, res) => {
    const { date, description, reference, entries } = req.body;
    try {
        const result = await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    date: new Date(date),
                    description,
                    reference,
                    type: 'JOURNAL',
                    entries: {
                        create: entries.map(e => ({
                            accountId: parseInt(e.accountId),
                            debit: parseFloat(e.debit || 0),
                            credit: parseFloat(e.credit || 0),
                            description: e.description
                        }))
                    }
                }
            });

            // Update Account Balances
            for (const entry of entries) {
                const diff = (parseFloat(entry.debit || 0) - parseFloat(entry.credit || 0));
                await tx.account.update({
                    where: { id: parseInt(entry.accountId) },
                    data: { balance: { increment: diff } }
                });
            }

            return transaction;
        });
        res.json(result);
    } catch (error) {
        console.error('Invoice Creation Failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get All Journal Entries
app.get('/api/journal', async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            include: { entries: { include: { account: true } } },
            orderBy: { date: 'desc' }
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Financial Reports Endpoints ---

// 1. Trial Balance (ميزان المراجعة)
app.get('/api/reports/trial-balance', async (req, res) => {
    try {
        const { date } = req.query;
        const asOfDate = date ? new Date(date) : new Date();

        // Get all accounts
        const accounts = await prisma.account.findMany({
            orderBy: { code: 'asc' }
        });

        // For each account, calculate balance as of date from journal entries
        const trialBalance = await Promise.all(accounts.map(async (acc) => {
            const entries = await prisma.journalEntry.findMany({
                where: {
                    accountId: acc.id,
                    transaction: {
                        date: { lte: asOfDate }
                    }
                }
            });

            const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
            const totalCredit = entries.reduce((s, e) => s + e.credit, 0);
            const calculatedBalance = totalDebit - totalCredit;

            return {
                ...acc,
                balance: calculatedBalance
            };
        }));

        res.json(trialBalance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Income Statement (قائمة الدخل)
app.get('/api/reports/income-statement', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();

        const accounts = await prisma.account.findMany({
            where: {
                OR: [
                    { code: { startsWith: '4' } }, // Revenue
                    { code: { startsWith: '5' } }  // Expenses
                ]
            }
        });

        const reportData = await Promise.all(accounts.map(async (acc) => {
            const entries = await prisma.journalEntry.findMany({
                where: {
                    accountId: acc.id,
                    transaction: {
                        date: { gte: start, lte: end }
                    }
                }
            });

            const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
            const totalCredit = entries.reduce((s, e) => s + e.credit, 0);

            let balance = 0;
            if (acc.code.startsWith('4')) {
                balance = totalCredit - totalDebit;
            } else {
                balance = totalDebit - totalCredit;
            }

            return { ...acc, balance };
        }));

        const revenues = reportData.filter(a => a.code.startsWith('4'));
        const expenses = reportData.filter(a => a.code.startsWith('5'));

        const totalRevenue = revenues.reduce((s, a) => s + a.balance, 0);
        const totalExpenses = expenses.reduce((s, a) => s + a.balance, 0);

        res.json({
            revenues,
            expenses,
            totalRevenue,
            totalExpenses,
            netIncome: totalRevenue - totalExpenses
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Balance Sheet (الميزانية العمومية)
app.get('/api/reports/balance-sheet', async (req, res) => {
    try {
        const { date } = req.query;
        const asOfDate = date ? new Date(date) : new Date();

        // Assets (1), Liabilities (2), Equity (3)
        const accounts = await prisma.account.findMany({
            where: {
                OR: [
                    { code: { startsWith: '1' } }, // Assets
                    { code: { startsWith: '2' } }, // Liabilities
                    { code: { startsWith: '3' } }  // Equity
                ]
            }
        });

        const reportData = await Promise.all(accounts.map(async (acc) => {
            const entries = await prisma.journalEntry.findMany({
                where: {
                    accountId: acc.id,
                    transaction: {
                        date: { lte: asOfDate }
                    }
                }
            });

            const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
            const totalCredit = entries.reduce((s, e) => s + e.credit, 0);

            // Assets: Dr - Cr
            // Liabilities/Equity: Cr - Dr
            let balance = 0;
            if (acc.code.startsWith('1')) {
                balance = totalDebit - totalCredit;
            } else {
                balance = totalCredit - totalDebit;
            }

            return { ...acc, balance };
        }));

        const assets = reportData.filter(a => a.code.startsWith('1'));
        const liabilities = reportData.filter(a => a.code.startsWith('2'));
        const equity = reportData.filter(a => a.code.startsWith('3'));

        const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
        const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
        const totalEquity = equity.reduce((s, a) => s + a.balance, 0);

        res.json({
            assets,
            liabilities,
            equity,
            totalAssets,
            totalLiabilities,
            totalEquity
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. General Ledger (دفتر الأستاذ / كشف حساب)
app.get('/api/reports/general-ledger', async (req, res) => {
    try {
        const { accountId, startDate, endDate } = req.query;
        if (!accountId) return res.status(400).json({ error: 'Account ID is required' });

        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();

        // 1. Get account info
        const account = await prisma.account.findUnique({ where: { id: parseInt(accountId) } });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        // 2. Calculate Opening Balance (sum of all entries before startDate)
        const prevEntries = await prisma.journalEntry.findMany({
            where: {
                accountId: account.id,
                transaction: { date: { lt: start } }
            }
        });
        const openingDebit = prevEntries.reduce((s, e) => s + e.debit, 0);
        const openingCredit = prevEntries.reduce((s, e) => s + e.credit, 0);
        let openingBalance = openingDebit - openingCredit;

        // 3. Get entries during period
        const entries = await prisma.journalEntry.findMany({
            where: {
                accountId: account.id,
                transaction: { date: { gte: start, lte: end } }
            },
            include: {
                transaction: true
            },
            orderBy: {
                transaction: { date: 'asc' }
            }
        });

        // 4. Transform entries with running balance
        let runningBalance = openingBalance;
        const movements = entries.map(e => {
            runningBalance += (e.debit - e.credit);
            return {
                id: e.id,
                date: e.transaction.date,
                description: e.description || e.transaction.description,
                reference: e.transaction.reference,
                debit: e.debit,
                credit: e.credit,
                balance: runningBalance
            };
        });

        res.json({
            account,
            openingBalance,
            movements,
            closingBalance: runningBalance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Document & Archive Routes ---

// Get All Documents
app.get('/api/documents', async (req, res) => {
    try {
        const { partnerId, employeeId, projectId } = req.query;
        const where = {};
        if (partnerId) where.partnerId = parseInt(partnerId);
        if (employeeId) where.employeeId = parseInt(employeeId);
        if (projectId) where.projectId = parseInt(projectId);

        const documents = await prisma.document.findMany({
            where,
            include: { partner: true, employee: true, project: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Document Entry
app.post('/api/documents', async (req, res) => {
    try {
        const { title, category, fileUrl, fileType, fileSize, partnerId, employeeId, projectId } = req.body;
        const document = await prisma.document.create({
            data: {
                title,
                category,
                fileUrl,
                fileType,
                fileSize: parseInt(fileSize) || 0,
                partnerId: partnerId ? parseInt(partnerId) : null,
                employeeId: employeeId ? parseInt(employeeId) : null,
                projectId: projectId ? parseInt(projectId) : null,
            }
        });
        res.json(document);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Document
app.delete('/api/documents/:id', async (req, res) => {
    try {
        await prisma.document.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Internal helper to create persistent notifications without duplicates
async function addNotification(type, title, message) {
    try {
        // Check if a similar unread notification exists to avoid spam
        const existing = await prisma.notification.findFirst({
            where: { type, title, isRead: false }
        });
        if (!existing) {
            return await prisma.notification.create({
                data: { type, title, message }
            });
        }
    } catch (e) {
        console.error('Add notification failed', e);
    }
}

// Refresh/Sync notifications (Triggered by frontend or cron)
app.post('/api/notifications/refresh', async (req, res) => {
    try {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // 1. Check Low Stock
        const lowStock = await prisma.stock.findMany({
            where: { quantity: { lt: 10 } },
            include: { product: true }
        });
        for (const s of lowStock) {
            await addNotification('LOW_STOCK', 'تنبيه مخزون', `المنتج "${s.product.name}" وصل لمستوى منخفض (${s.quantity})`);
        }

        // 2. Check Upcoming Project Deadlines
        const upcomingProjects = await prisma.project.findMany({
            where: {
                status: { in: ['PLANNED', 'IN_PROGRESS'] },
                endDate: { lte: nextWeek, gte: now }
            }
        });
        for (const p of upcomingProjects) {
            await addNotification('PROJECT_DEADLINE', 'موعد تسليم مشروع', `المشروع "${p.name}" يقترب من موعد التسليم (${p.endDate.toLocaleDateString('ar-SA')})`);
        }

        // 3. Check Overdue Tasks
        const overdueTasks = await prisma.task.findMany({
            where: {
                status: { not: 'DONE' },
                dueDate: { lt: now }
            },
            include: { project: true }
        });
        for (const t of overdueTasks) {
            await addNotification('TASK_OVERDUE', 'مهمة متأخرة', `المهمة "${t.title}" في مشروع "${t.project?.name}" تجاوزت موعدها`);
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all notifications
app.get('/api/notifications', async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        const notification = await prisma.notification.update({
            where: { id: parseInt(req.params.id) },
            data: { isRead: true }
        });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark all as read
app.put('/api/notifications/read-all', async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const path = require('path');

// --- Audit Logs ---
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await prisma.activityLog.findMany({
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve static files from React frontend
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Fallback for SPA: serve index.html for any unknown routes (except /api)
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Export for Vercel Serverless
module.exports = app;

// Start Server
const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
if (!isVercel) {
    const startServer = async () => {
        try {
            await prisma.$connect();
            console.log('✅ Database Connected Successfully (PostgreSQL)');

            // --- Auto Initialization ---
            try {
                // 1. Initialize Default Warehouse
                await getOrCreateWarehouse();
                console.log('📦 Default Warehouse Initialized');

                // 2. Initialize Default Company Settings if not exists
                const companyInfo = await prisma.settings.findUnique({ where: { key: 'companyInfo' } });
                if (!companyInfo) {
                    await prisma.settings.create({
                        data: {
                            key: 'companyInfo',
                            value: JSON.stringify({
                                name: 'مؤسسة الجنوب الجديد',
                                vatNumber: '310123456700003',
                                address: 'المملكة العربية السعودية',
                                phone: '0500000000'
                            })
                        }
                    });
                    console.log('🏢 Default Company Settings Created');
                }
            } catch (initErr) {
                console.warn('⚠️ Initialization warning:', initErr.message);
            }

            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
            });
        } catch (error) {
            console.error('❌ Database Connection Failed:', error);
            process.exit(1);
        }
    };
    startServer();
}
