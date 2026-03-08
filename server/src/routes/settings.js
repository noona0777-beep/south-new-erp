const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/:key', async (req, res) => {
    try {
        const setting = await prisma.settings.findUnique({ where: { key: req.params.key } });
        res.json(setting ? JSON.parse(setting.value) : {});
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/:key', async (req, res) => {
    try {
        const setting = await prisma.settings.upsert({
            where: { key: req.params.key },
            update: { value: JSON.stringify(req.body.value) },
            create: { key: req.params.key, value: JSON.stringify(req.body.value) }
        });
        res.json(JSON.parse(setting.value));
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
