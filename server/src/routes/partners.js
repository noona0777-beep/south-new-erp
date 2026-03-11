const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

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
        const { name, type, phone, address, vatNumber, email, password } = req.body;
        
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const partner = await prisma.partner.create({
            data: {
                name,
                type: type || 'CUSTOMER',
                phone,
                address,
                vatNumber,
                email,
                password: hashedPassword
            }
        });
        res.json(partner);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        
        if (data.password && data.password.trim() !== '') {
            data.password = await bcrypt.hash(data.password, 10);
        } else {
            delete data.password; // Don't overwrite with empty string
        }

        const partner = await prisma.partner.update({
            where: { id: parseInt(id) },
            data
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
