const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// All Projects
router.get('/', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            include: { client: true, tasks: true, _count: { select: { tasks: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
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

router.post('/', async (req, res) => {
    try {
        const { name, description, partnerId, clientId, location, startDate, endDate, budget, contractValue, status } = req.body;
        const targetClientId = parseInt(partnerId || clientId);
        if (!targetClientId) return res.status(400).json({ error: 'clientId مطلوب' });

        const project = await prisma.project.create({
            data: {
                name, description, location,
                clientId: targetClientId,
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : null,
                contractValue: parseFloat(budget || contractValue || 0),
                status: status || 'PLANNED'
            }
        });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
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

// Tasks
router.get('/:id/tasks', async (req, res) => {
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

module.exports = router;
