const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.post('/', async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, projectId, assignedTo } = req.body;
        const task = await prisma.task.create({
            data: {
                title, description,
                status: status || 'TODO',
                priority: priority || 'MEDIUM',
                dueDate: dueDate ? new Date(dueDate) : null,
                projectId: projectId ? parseInt(projectId) : null,
                assignedTo
            }
        });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const task = await prisma.task.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
