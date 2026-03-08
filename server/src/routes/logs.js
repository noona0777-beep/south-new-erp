const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
    try {
        const logs = await prisma.activityLog.findMany({
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
