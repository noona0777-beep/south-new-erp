const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.post('/refresh', async (req, res) => {
    try {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // 1. Low Stock
        const lowStock = await prisma.stock.findMany({ where: { quantity: { lt: 10 } }, include: { product: true } });
        for (const s of lowStock) {
            await prisma.notification.upsert({
                where: { id: -1 }, // Just a check, usually we'd check by message content but notification model doesn't have unique message
                update: {},
                create: { type: 'LOW_STOCK', title: 'نقص مخزون', message: `المنتج "${s.product.name}" منخفض` }
            });
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/', async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
        res.json(notifications);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id/read', async (req, res) => {
    try {
        await prisma.notification.update({ where: { id: parseInt(req.params.id) }, data: { isRead: true } });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/read-all', async (req, res) => {
    try {
        await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
