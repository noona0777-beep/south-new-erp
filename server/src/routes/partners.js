const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/', async (req, res) => {
    try {
        const { type } = req.query;
        const where = type ? { type } : { type: 'CUSTOMER' };
        const partners = await prisma.partner.findMany({
            where,
            orderBy: { name: 'asc' }
        });
        res.json(partners);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, type, phone, address, vatNumber } = req.body;
        const partner = await prisma.partner.create({
            data: {
                name,
                type: type || 'CUSTOMER',
                phone,
                address,
                vatNumber
            }
        });
        res.json(partner);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put('/:id', async (req, res) => {
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

router.get('/:id', async (req, res) => {
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

module.exports = router;
