const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

// 1. Admin: List all tickets with advanced filtering
router.get('/', authenticate, async (req, res) => {
    try {
        const { status, priority, search } = req.query;
        
        let where = {};
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (search) {
            where.OR = [
                { subject: { contains: search, mode: 'insensitive' } },
                { ticketNo: { contains: search, mode: 'insensitive' } },
                { client: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        const tickets = await prisma.supportTicket.findMany({
            where,
            include: {
                client: { select: { name: true, phone: true } },
                project: { select: { name: true } },
                _count: { select: { messages: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Admin: Get statistics
router.get('/stats', authenticate, async (req, res) => {
    try {
        const stats = await prisma.supportTicket.groupBy({
            by: ['status'],
            _count: { _all: true }
        });
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Admin: Get ticket details and messages
router.get('/:id', authenticate, async (req, res) => {
    try {
        const ticket = await prisma.supportTicket.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                client: { select: { name: true, email: true, phone: true } },
                project: { select: { name: true } },
                messages: { 
                    orderBy: { createdAt: 'asc' },
                    include: { sender: { select: { name: true } } } // If needed
                }
            }
        });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Admin: Reply to ticket + Automation
router.post('/:id/reply', authenticate, async (req, res) => {
    try {
        const { message } = req.body;
        const ticketId = parseInt(req.params.id);

        const newMessage = await prisma.ticketMessage.create({
            data: {
                ticketId,
                senderId: req.user.id,
                senderType: 'ADMIN',
                senderName: req.user.name || 'Admin',
                message
            }
        });

        // Update status and timestamp
        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status: 'IN_PROGRESS', updatedAt: new Date() }
        });

        // Automation: WhatsApp Notification
        try {
            const ticket = await prisma.supportTicket.findUnique({
                where: { id: ticketId },
                include: { client: { select: { phone: true, name: true } } }
            });

            if (ticket?.client?.phone) {
                const { sendWhatsappMessage } = require('../lib/services');
                const whatsappMsg = `🔔 *تحديث دعم فني*\n\nمرحباً ${ticket.client.name}،\n\nتمت إضافة رد جديد من فريق العمل بخصوص طلبكم رقم (${ticket.ticketNo || '#' + ticket.id}).\n\n*الرد:* ${message.substring(0, 150)}${message.length > 150 ? '...' : ''}\n\nيمكنك الرد والمتابعة عبر بوابتك الخاصة في أي وقت. ✅`;
                await sendWhatsappMessage(ticket.client.phone, whatsappMsg);
            }
        } catch (wsErr) {
            console.error('WhatsApp Error in Support:', wsErr);
        }

        res.json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Admin: Update Status / Resolution
router.put('/:id/status', authenticate, async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await prisma.supportTicket.update({
            where: { id: parseInt(req.params.id) },
            data: { status, updatedAt: new Date() }
        });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
