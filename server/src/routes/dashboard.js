const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/stats', async (req, res) => {
    try {
        const [
            totalInvoices, totalQuotes, totalClients, totalProducts, totalProjects, totalEmployees,
            recentInvoices, recentQuotes, lowStockItems, invoiceStats, contractStats
        ] = await Promise.all([
            prisma.invoice.count(),
            prisma.quote.count(),
            prisma.partner.count({ where: { type: 'CUSTOMER' } }),
            prisma.product.count(),
            prisma.project.count(),
            prisma.employee.count(),
            prisma.invoice.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { partner: true } }),
            prisma.quote.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { partner: true } }),
            prisma.stock.findMany({ where: { quantity: { lt: 10 } }, include: { product: true }, take: 5 }),
            prisma.invoice.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
            prisma.constructionContract.aggregate({ _sum: { totalValue: true }, _count: { id: true } })
        ]);

        const pendingQuotes = await prisma.quote.count({ where: { status: 'DRAFT' } });
        const acceptedQuotes = await prisma.quote.count({ where: { status: 'ACCEPTED' } });
        const activeProjects = await prisma.project.count({ where: { status: { in: ['PLANNED', 'IN_PROGRESS'] } } });

        res.json({
            totals: {
                invoices: totalInvoices, quotes: totalQuotes, clients: totalClients,
                products: totalProducts, projects: totalProjects, employees: totalEmployees,
                revenue: invoiceStats._sum.total || 0,
                contractsCount: contractStats._count.id || 0,
                contractsValue: contractStats._sum.totalValue || 0
            },
            recentInvoices: recentInvoices.map(inv => ({ id: inv.id, number: inv.invoiceNumber, client: inv.partner?.name || 'غير محدد', amount: inv.total, status: inv.status, date: inv.date })),
            recentQuotes: recentQuotes.map(qt => ({ id: qt.id, number: qt.quoteNumber, client: qt.partner?.name || 'غير محدد', amount: qt.total, status: qt.status, date: qt.date })),
            lowStock: lowStockItems.map(s => ({ name: s.product.name, quantity: s.quantity })),
            quickStats: { pendingQuotes, acceptedQuotes, activeProjects, lowStockCount: lowStockItems.length }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    try {
        const results = [];
        const partners = await prisma.partner.findMany({ where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { phone: { contains: q, mode: 'insensitive' } }] }, take: 3 });
        partners.forEach(p => results.push({ id: p.id, title: p.name, type: 'client', subtitle: 'عميل', link: `/clients` }));

        const invoices = await prisma.invoice.findMany({ where: { invoiceNumber: { contains: q, mode: 'insensitive' } }, take: 3 });
        invoices.forEach(inv => results.push({ id: inv.id, title: `فاتورة ${inv.invoiceNumber}`, type: 'invoice', subtitle: `${inv.total} ر.س`, link: `/invoices` }));

        const products = await prisma.product.findMany({ where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { sku: { contains: q, mode: 'insensitive' } }] }, take: 3 });
        products.forEach(prod => results.push({ id: prod.id, title: prod.name, type: 'product', subtitle: `مخزون - ${prod.sku || ''}`, link: `/inventory` }));

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
