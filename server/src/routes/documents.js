const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/', async (req, res) => {
    try {
        const { partnerId, employeeId, projectId, constructionContractId } = req.query;
        const where = {};
        if (partnerId) where.partnerId = parseInt(partnerId);
        if (employeeId) where.employeeId = parseInt(employeeId);
        if (projectId) where.projectId = parseInt(projectId);
        if (constructionContractId) where.constructionContractId = parseInt(constructionContractId);

        const documents = await prisma.document.findMany({
            where, include: { partner: true, employee: true, project: true, constructionContract: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(documents);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
    try {
        const { title, category, fileUrl, fileType, fileSize, partnerId, employeeId, projectId, constructionContractId } = req.body;
        const document = await prisma.document.create({
            data: {
                title, category, fileUrl, fileType, fileSize: parseInt(fileSize) || 0,
                partnerId: partnerId ? parseInt(partnerId) : null,
                employeeId: employeeId ? parseInt(employeeId) : null,
                projectId: projectId ? parseInt(projectId) : null,
                constructionContractId: constructionContractId ? parseInt(constructionContractId) : null,
            }
        });
        res.json(document);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
