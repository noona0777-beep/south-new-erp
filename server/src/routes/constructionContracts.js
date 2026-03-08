const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { logActivity } = require('../utils/helpers');

router.use(authenticate);

router.get('/', async (req, res) => {
    try {
        const contracts = await prisma.constructionContract.findMany({
            include: { partner: true, project: true, items: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(contracts);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
    try {
        const contract = await prisma.constructionContract.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { partner: true, project: true, items: true }
        });
        if (!contract) return res.status(404).json({ error: 'عقد غير موجود' });
        res.json(contract);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
    const { partnerId, projectId, title, type, startDate, endDate, advancePayment, retentionPercent, items, clauses, location, signatureName } = req.body;
    try {
        let netValue = 0;
        const contractItems = items.map(item => {
            const total = Number(item.quantity) * Number(item.unitPrice);
            netValue += total;
            return { description: item.description, unit: item.unit, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice), total };
        });
        const taxAmount = netValue * 0.15;
        const totalValue = netValue + taxAmount;

        const result = await prisma.$transaction(async (tx) => {
            return await tx.constructionContract.create({
                data: {
                    contractNumber: `CONT-SCA-${Date.now()}`, title, type,
                    partnerId: parseInt(partnerId), projectId: projectId ? parseInt(projectId) : null,
                    startDate: new Date(startDate), endDate: new Date(endDate),
                    advancePayment: parseFloat(advancePayment || 0), retentionPercent: parseFloat(retentionPercent || 0),
                    netValue, taxAmount, totalValue, clauses: clauses || {}, location, signatureName,
                    items: { create: contractItems }
                }
            });
        });
        await logActivity(req.user.id, 'CREATE', 'CONSTRUCTION_CONTRACT', result.id, `عقد رقم #${result.contractNumber}`);
        res.json(result);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
