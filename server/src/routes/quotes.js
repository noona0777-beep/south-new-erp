const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/', async (req, res) => {
    try {
        const quotes = await prisma.quote.findMany({
            include: { partner: true, items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(quotes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const quote = await prisma.quote.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { partner: true, items: { include: { product: true } } }
        });
        if (!quote) return res.status(404).json({ error: 'Quote not found' });
        res.json(quote);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
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
                subtotal, discount: Number(discount) || 0,
                taxAmount, total, notes,
                items: { create: quoteItemsData }
            },
            include: { items: true, partner: true }
        });

        // Archive
        try {
            await prisma.document.create({
                data: {
                    title: `عرض سعر رقم ${quote.quoteNumber}`,
                    category: 'OTHER',
                    fileUrl: `INTERNAL:QUOTE:${quote.id}`,
                    partnerId: quote.partnerId,
                    createdAt: quote.createdAt
                }
            });
        } catch (e) { }

        res.json(quote);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create quote' });
    }
});

router.put('/:id', async (req, res) => {
    const { partnerId, date, validUntil, items, discount, notes } = req.body;
    const id = parseInt(req.params.id);

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
        // Delete old items and recreate
        await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
        const quote = await prisma.quote.update({
            where: { id },
            data: {
                date: date ? new Date(date) : new Date(),
                validUntil: validUntil ? new Date(validUntil) : null,
                partnerId: partnerId ? Number(partnerId) : null,
                subtotal,
                discount: Number(discount) || 0,
                taxAmount,
                total,
                notes,
                items: { create: quoteItemsData }
            },
            include: { items: true, partner: true }
        });
        res.json(quote);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update quote: ' + error.message });
    }
});

router.patch('/:id/status', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.$transaction(async (tx) => {
            await tx.quoteItem.deleteMany({ where: { quoteId: id } });
            await tx.quote.delete({ where: { id: id } });
        });
        res.json({ message: 'Quote deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
