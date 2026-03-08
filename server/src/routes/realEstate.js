const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/properties', async (req, res) => {
    try {
        const properties = await prisma.property.findMany({ include: { units: true } });
        res.json(properties);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/properties', async (req, res) => {
    try {
        const property = await prisma.property.create({ data: req.body });
        res.json(property);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/properties/:id/units', async (req, res) => {
    try {
        const units = await prisma.unit.findMany({
            where: { propertyId: parseInt(req.params.id) },
            include: { contracts: { include: { tenant: true } } }
        });
        res.json(units);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/units', async (req, res) => {
    try {
        const { propertyId, unitNumber, floor, type, status } = req.body;
        const unit = await prisma.unit.create({
            data: { propertyId: parseInt(propertyId), unitNumber, floor, type, status: status || 'VACANT' }
        });
        res.json(unit);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/contracts', async (req, res) => {
    try {
        const { unitId, tenantId, startDate, endDate, rentAmount, paymentFrequency } = req.body;
        const contract = await prisma.realEstateContract.create({
            data: {
                contractNumber: `CONT-${Date.now()}`,
                unitId: parseInt(unitId), tenantId: parseInt(tenantId),
                startDate: new Date(startDate), endDate: new Date(endDate),
                rentAmount: parseFloat(rentAmount), paymentFrequency, status: 'ACTIVE'
            }
        });
        await prisma.unit.update({ where: { id: parseInt(unitId) }, data: { status: 'OCCUPIED' } });
        res.json(contract);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
