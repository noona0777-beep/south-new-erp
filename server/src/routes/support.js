const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth'); // Assuming this exists for Admin

// 1. Admin: List all tickets
router.get('/', authenticate, async (req, res) => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            include: {
                client: { select: { name: true } },
                project: { select: { name: true } },
                messages: { orderBy: { createdAt: 'asc' } }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Admin: Get ticket details and messages
router.get('/:id', authenticate, async (req, res) => {
    try {
        const ticket = await prisma.supportTicket.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                client: { select: { name: true, email: true, phone: true } },
                project: { select: { name: true } },
                messages: { orderBy: { createdAt: 'asc' } }
            }
        });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Admin: Reply to ticket
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

        // Update status to IN_PROGRESS when admin replies
        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status: 'IN_PROGRESS', updatedAt: new Date() }
        });

        // 5. WhatsApp Notification to Client
        try {
            const ticket = await prisma.supportTicket.findUnique({
                where: { id: ticketId },
                include: { client: { select: { phone: true, name: true } } }
            });

            if (ticket?.client?.phone) {
                const { sendWhatsappMessage } = require('../lib/services');
                const whatsappMsg = `مرحباً ${ticket.client.name}،\n\nتمت إضافة رد جديد على تذكرتك رقم (${ticket.ticketNo}): "${ticket.subject}"\n\nالرد: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}\n\nيمكنك متابعة المحادثة عبر بوابة العملاء.`;
                await sendWhatsappMessage(ticket.client.phone, whatsappMsg);
            }
        } catch (wsErr) {
            console.error('WhatsApp Support Notify Error:', wsErr);
        }

        res.json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Admin: Update Status (Closure, etc)
router.patch('/:id/status', authenticate, async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await prisma.supportTicket.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
