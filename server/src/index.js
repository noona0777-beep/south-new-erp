/* --- South New System - Final Modular Server Entry Point --- */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

// 1. Libs & Utils
const prisma = require('./lib/prisma');
const { getWhatsappStatus } = require('./lib/services');
const { authenticate } = require('./middleware/auth');
const { getOrCreateWarehouse } = require('./utils/helpers');

// 2. Initialize App
const app = express();
const PORT = process.env.PORT || 5000;

// 3. Performance & Security Middleware
try {
    const compression = require('compression');
    app.use(compression()); // gzip all responses
} catch (e) { console.log('⚠️ compression not installed yet'); }

try {
    const rateLimit = require('express-rate-limit');
    const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: { error: 'Too many requests, please try again later.' } });
    app.use('/api/', limiter);
} catch (e) { console.log('⚠️ express-rate-limit not installed yet'); }

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '50mb' }));

// 4. Routes Mapping
const routes = {
    auth: require('./routes/auth'),
    dashboard: require('./routes/dashboard'),
    inventory: require('./routes/inventory'),
    invoices: require('./routes/invoices'),
    projects: require('./routes/projects'),
    tasks: require('./routes/tasks'),
    quotes: require('./routes/quotes'),
    hr: require('./routes/hr'),
    partners: require('./routes/partners'),
    users: require('./routes/users'),
    accounting: require('./routes/accounting'),
    realEstate: require('./routes/realEstate'),
    constructionContracts: require('./routes/constructionContracts'),
    documents: require('./routes/documents'),
    notifications: require('./routes/notifications'),
    settings: require('./routes/settings'),
    fieldOps: require('./routes/fieldOps'),
    clientPortal: require('./routes/clientPortal'),
    crm: require('./routes/crm'),
    materialRequests: require('./routes/materialRequests'),
    logs: require('./routes/logs'),
    ai: require('./routes/ai'),
    attendance: require('./routes/attendance'),
    support: require('./routes/support')
};

// --- Basic APIs ---
app.get('/api/status', (req, res) => res.json({ status: 'Online', version: '2.5.0-Modular' }));
app.get('/api/whatsapp/status', (req, res) => res.json(getWhatsappStatus()));
app.get('/api/whatsapp/qr', (req, res) => {
    const qrPath = path.join(__dirname, '../whatsapp-qr.png');
    if (fs.existsSync(qrPath)) {
        res.sendFile(qrPath);
    } else {
        res.status(404).send('QR code not outputted yet');
    }
});

// --- Mount Routes ---
// Category 1: Explicit Prefixes (Specific Resources)
app.use('/api/dashboard', routes.dashboard);
app.use('/api/invoices', routes.invoices);
app.use('/api/projects', routes.projects);
app.use('/api/tasks', routes.tasks);
app.use('/api/quotes', routes.quotes);
app.use('/api/partners', routes.partners);
app.use('/api/users', routes.users);
app.use('/api/construction-contracts', routes.constructionContracts);
app.use('/api/documents', routes.documents);
app.use('/api/notifications', routes.notifications);
app.use('/api/settings', routes.settings);
app.use('/api/logs', routes.logs);
app.use('/api/field-ops', authenticate, routes.fieldOps);
app.use('/api/client-portal', routes.clientPortal);
app.use('/api/crm', authenticate, routes.crm);
app.use('/api/material-requests', authenticate, routes.materialRequests);
app.use('/api/ai', authenticate, routes.ai);
app.use('/api/attendance', authenticate, routes.attendance);
app.use('/api/support', authenticate, routes.support);

// Category 2: Generic /API Mount (For routers that define their own top-level paths like /products, /accounts, /employees)
app.use('/api', routes.auth);
app.use('/api', routes.inventory);
app.use('/api', routes.hr);
app.use('/api', routes.accounting);
app.use('/api', routes.realEstate);

// 5. Static Files (React SPA)
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
}

// 6. Global Initializer & Start
const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Connected to Cloud Database');

        // Init Data
        await getOrCreateWarehouse();

        const companyInfo = await prisma.settings.findUnique({ where: { key: 'companyInfo' } });
        if (!companyInfo) {
            await prisma.settings.create({
                data: {
                    key: 'companyInfo',
                    value: JSON.stringify({ name: 'مؤسسة الجنوب الجديد', vatNumber: '310123456700003' })
                }
            });
        }

        if (process.env.NODE_ENV !== 'test') {
            app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
        }
    } catch (err) {
        console.error('❌ Server start failed:', err);
        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = app;
