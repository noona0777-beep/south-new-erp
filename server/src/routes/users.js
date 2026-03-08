const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { logActivity } = require('../utils/helpers');

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    const { name, email, password, role, phone, status, jobTitle, department, permissions } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name, email, password: hashedPassword,
                role: role || 'USER',
                phone: phone || null,
                status: status || 'ACTIVE',
                jobTitle: jobTitle || null,
                department: department || null,
                permissions: permissions || null
            }
        });
        await logActivity(req.user.id, 'CREATE', 'USER', user.id, `إضافة مستخدم: ${user.name}`);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, role, phone, status, jobTitle, department, permissions, password } = req.body;
    try {
        const updateData = { name, email, role, phone, status, jobTitle, department, permissions };
        if (password && password.trim() !== "") {
            updateData.password = await bcrypt.hash(password, 10);
        }
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData
        });
        await logActivity(req.user.id, 'UPDATE', 'USER', user.id, `تعديل مستخدم: ${user.name}`);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (id === req.user.id) return res.status(400).json({ error: 'لا يمكنك حذف نفسك' });
        await prisma.user.delete({ where: { id } });
        await logActivity(req.user.id, 'DELETE', 'USER', id, `حذف مستخدم ${id}`);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
