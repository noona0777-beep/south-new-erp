const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');


// 1. Get all requests (for Admin/Manager)
router.get('/', async (req, res) => {
    try {
        const requests = await prisma.materialRequest.findMany({
            include: {
                engineer: { select: { name: true } },
                product: { select: { name: true, unit: true } },
                siteVisit: { select: { date: true } },
                task: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Submit a new request (from Field Ops)
router.post('/', async (req, res) => {
    try {
        const { siteVisitId, taskId, engineerId, productId, quantity, urgency, notes } = req.body;

        const reqNumber = `REQ-${Date.now().toString().slice(-6)}`;

        const request = await prisma.materialRequest.create({
            data: {
                reqNumber,
                siteVisitId: siteVisitId ? parseInt(siteVisitId) : null,
                taskId: taskId ? parseInt(taskId) : null,
                engineerId: parseInt(engineerId),
                productId: parseInt(productId),
                quantity: parseFloat(quantity),
                urgency: urgency || 'NORMAL',
                notes
            }
        });

        // Create notification for admin
        await prisma.notification.create({
            data: {
                type: 'MATERIAL_REQUEST',
                title: `طلب مواد جديد: ${reqNumber}`,
                message: `طلب المهندس كمية ${quantity} من المنتج الجديد. حالة الاستعجال: ${urgency || 'عادي'}`
            }
        });

        res.json(request);
    } catch (error) {
        console.error('Material Request Error:', error);
        res.status(500).json({ error: 'فشل إرسال طلب المواد' });
    }
});

// 3. Update request status (Admin approval)
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const request = await prisma.materialRequest.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.json(request);
    } catch (error) {
        res.status(500).json({ error: 'فشل تحديث حالة الطلب' });
    }
});

module.exports = router;
