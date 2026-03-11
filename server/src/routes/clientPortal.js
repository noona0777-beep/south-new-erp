const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = require('../lib/prisma');
const router = express.Router();


    // 1. Client Login
    router.post('/login', async (req, res) => {
        try {
            const { identifier, password } = req.body; // identifier can be email or phone
            if (!identifier || !password) {
                return res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني أو رقم الجوال مع كلمة المرور' });
            }

            // Find Partner
            const partner = await prisma.partner.findFirst({
                where: {
                    OR: [
                        { email: identifier },
                        { phone: identifier }
                    ]
                }
            });

            if (!partner) {
                return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
            }

            if (!partner.password) {
                return res.status(401).json({ error: 'لم يتم إعداد كلمة مرور لهذا الحساب بعد. يرجى التواصل مع الإدارة.' });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, partner.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
            }

            // Generate JWT Token
            const token = jwt.sign(
                { id: partner.id, role: 'CLIENT', name: partner.name },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '7d' }
            );

            res.json({ token, user: { id: partner.id, name: partner.name, role: 'CLIENT' } });

        } catch (error) {
            console.error('Client Login Error:', error);
            res.status(500).json({ error: 'حدث خطأ في السيرفر' });
        }
    });

    // ==========================================
    // MIDDLEWARE: Check Client Authentication
    // ==========================================
    const authenticateClient = async (req, res, next) => {
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'غير مصرح للوصول' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            if (decoded.role !== 'CLIENT') {
                return res.status(403).json({ error: 'صلاحيات غير كافية' });
            }
            
            // Fetch latest permissions from DB
            const partner = await prisma.partner.findUnique({
                where: { id: decoded.id },
                select: { portalPermissions: true }
            });

            req.client = { ...decoded, permissions: partner?.portalPermissions || {} };
            next();
        } catch (err) {
            res.status(400).json({ error: 'الرمز السري (Token) غير صالح' });
        }
    };

    // Apply middleware to all routes below
    router.use(authenticateClient);

    // 2. Client Dashboard Stats
    router.get('/dashboard', async (req, res) => {
        try {
            const partnerId = req.client.id;

            // Get Projects count
            const projectsCount = await prisma.project.count({ where: { clientId: partnerId } });

            // Get Total Invoices Value
            const invoices = await prisma.invoice.findMany({ where: { partnerId: partnerId } });
            const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);

            // Get Total Payments Value
            const payments = await prisma.payment.findMany({ where: { partnerId: partnerId } });
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

            // Get Open Tickets/Notes (where task belongs to their project)
            const openTicketsCount = await prisma.ticket.count({
                where: {
                    status: 'OPEN',
                    task: { project: { clientId: partnerId } }
                }
            });

            const canViewFinancials = req.client.permissions.viewFinancials === true;

            res.json({
                projectsCount,
                totalInvoiced: canViewFinancials ? totalInvoiced : 0,
                totalPaid: canViewFinancials ? totalPaid : 0,
                balance: canViewFinancials ? totalInvoiced - totalPaid : 0,
                openTicketsCount,
                permissions: req.client.permissions // Send to frontend to hide UI parts
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 3. Client Projects
    router.get('/projects', async (req, res) => {
        try {
            const partnerId = req.client.id;
            const projects = await prisma.project.findMany({
                where: { clientId: partnerId },
                include: {
                    tasks: { include: { aiReports: true } },
                    siteVisits: true
                },
                orderBy: { createdAt: 'desc' }
            });

            // Calculate overall progress based on latest AI report or similar logic
            const formattedProjects = projects.map(p => {
                let latestProgress = 0;
                let hasAIReport = false;

                // Simple logic: get max progress from AI reports of tasks
                p.tasks.forEach(t => {
                    t.aiReports.forEach(r => {
                        if (r.progressExtracted && r.progressExtracted > latestProgress) {
                            latestProgress = r.progressExtracted;
                            hasAIReport = true;
                        }
                    });
                });

                return {
                    id: p.id,
                    name: p.name,
                    status: p.status,
                    startDate: p.startDate,
                    progress: (req.client.permissions.trackProjects !== false) && hasAIReport ? latestProgress : null, 
                    tasksCount: p.tasks.length,
                    visitsCount: p.siteVisits.length
                };
            });

            res.json(formattedProjects);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 4. Client Invoices
    router.get('/invoices', async (req, res) => {
        try {
            const partnerId = req.client.id;
            
            // Check permission
            if (req.client.permissions.viewFinancials !== true) {
                return res.json([]); // Return empty if not permitted, or 403
            }

            const invoices = await prisma.invoice.findMany({
                where: { partnerId: partnerId },
                orderBy: { date: 'desc' }
            });

            res.json(invoices);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 4. Project Details (Tasks and Visits)
    router.get('/projects/:id/field-updates', async (req, res) => {
        try {
            // Ensure project belongs to client
            const project = await prisma.project.findFirst({
                where: { id: parseInt(req.params.id), clientId: req.client.id }
            });

            if (!project) return res.status(404).json({ error: 'المشروع غير موجود أو غير مصرح لك' });

            const canViewVisits = req.client.permissions.viewVisits !== false;
            const canViewAI = req.client.permissions.viewAI !== false;

            const visits = canViewVisits ? await prisma.siteVisit.findMany({
                where: { projectId: project.id },
                orderBy: { date: 'desc' },
                include: { engineer: { select: { name: true } } }
            }) : [];

            let tasks = await prisma.task.findMany({
                where: { projectId: project.id, type: 'FIELD' },
                orderBy: { createdAt: 'desc' },
                include: {
                    aiReports: canViewAI,
                    attachments: true
                }
            });

            res.json({ visits, tasks, permissions: req.client.permissions });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // 6. Submit Review/Rating for an Engineer/Task/Visit
    router.post('/rate', async (req, res) => {
        try {
            const { taskId, engineerId, visitId, rating, comment } = req.body;
            const clientId = req.client.id;

            if (req.client.permissions.canRate === false) {
                return res.status(403).json({ error: 'صلاحية التقييم معطلة لحسابك حالياً' });
            }

            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ error: 'الرجاء تقديم تقييم صحيح من 1 إلى 5' });
            }

            // 1. If visitId is provided, update the SiteVisit rating directly
            if (visitId) {
                await prisma.siteVisit.update({
                    where: { id: parseInt(visitId) },
                    data: { rating: parseInt(rating) }
                });
            }

            // 2. Create or update in generic Feedback table
            const feedback = await prisma.feedback.upsert({
                where: { taskId: taskId ? parseInt(taskId) : -1 },
                update: { rating, comment },
                create: {
                    clientId,
                    engineerId: parseInt(engineerId),
                    taskId: taskId ? parseInt(taskId) : null,
                    rating,
                    comment: comment || (visitId ? `تقييم للزيارة رقم ${visitId}` : '')
                }
            });
            res.json({ message: 'شكراً لتقييمك! تم تسجيل رأيك بنجاح', feedback });
        } catch (error) {
            console.error('Rating Error:', error);
            res.status(500).json({ error: 'فشل تسجيل التقييم' });
        }
    });
    
    // 7. Client Documents (Archive)
    router.get('/documents', async (req, res) => {
        try {
            const partnerId = req.client.id;
            
            const documents = await prisma.document.findMany({
                where: {
                    OR: [
                        { partnerId: partnerId },
                        { project: { clientId: partnerId } }
                    ]
                },
                include: {
                    project: { select: { name: true } }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.json(documents);
        } catch (error) {
            console.error('Fetch Documents Error:', error);
            res.status(500).json({ error: 'فشل جلب المستندات' });
        }
    });

    // 9. Support Tickets List
    router.get('/support-tickets', async (req, res) => {
        try {
            const tickets = await prisma.supportTicket.findMany({
                where: { clientId: req.client.id },
                include: { project: { select: { name: true } } },
                orderBy: { updatedAt: 'desc' }
            });
            res.json(tickets);
        } catch (error) {
            res.status(500).json({ error: 'فشل جلب تذاكر الدعم' });
        }
    });

    // 10. Create Support Ticket
    router.post('/support-tickets', async (req, res) => {
        try {
            const { subject, description, category, projectId, priority } = req.body;
            
            const ticket = await prisma.supportTicket.create({
                data: {
                    clientId: req.client.id,
                    projectId: projectId ? parseInt(projectId) : null,
                    subject,
                    description,
                    category: category || 'GENERAL',
                    priority: priority || 'MEDIUM',
                    status: 'OPEN',
                    ticketNo: `TK-${Date.now().toString().slice(-6)}`
                }
            });

            // Add the initial message
            await prisma.ticketMessage.create({
                data: {
                    ticketId: ticket.id,
                    senderId: req.client.id,
                    senderType: 'CLIENT',
                    senderName: req.client.name,
                    message: description
                }
            });

            res.status(201).json(ticket);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'فشل إنشاء التذكرة' });
        }
    });

    // 11. Get Ticket Details (including messages)
    router.get('/support-tickets/:id', async (req, res) => {
        try {
            const ticket = await prisma.supportTicket.findFirst({
                where: { id: parseInt(req.params.id), clientId: req.client.id },
                include: {
                    messages: { orderBy: { createdAt: 'asc' } },
                    project: { select: { name: true } }
                }
            });
            if (!ticket) return res.status(404).json({ error: 'التذكرة غير موجودة' });
            res.json(ticket);
        } catch (error) {
            res.status(500).json({ error: 'فشل جلب تفاصيل التذكرة' });
        }
    });

    // 12. Add Message to Ticket
    router.post('/support-tickets/:id/messages', async (req, res) => {
        try {
            const { message } = req.body;
            const ticketId = parseInt(req.params.id);

            // Verify ownership
            const ticket = await prisma.supportTicket.findFirst({
                where: { id: ticketId, clientId: req.client.id }
            });

            if (!ticket) return res.status(404).json({ error: 'التذكرة غير موجودة' });

            const newMessage = await prisma.ticketMessage.create({
                data: {
                    ticketId,
                    senderId: req.client.id,
                    senderType: 'CLIENT',
                    senderName: req.client.name,
                    message
                }
            });

            // Update ticket status to OPEN or IN_PROGRESS if client replies
            await prisma.supportTicket.update({
                where: { id: ticketId },
                data: { updatedAt: new Date() }
            });

            res.status(201).json(newMessage);
        } catch (error) {
            res.status(500).json({ error: 'فشل إرسال الرد' });
        }
    });

    module.exports = router;

