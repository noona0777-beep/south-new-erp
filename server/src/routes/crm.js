const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');


// --- LEADS ---

// 1. Get all leads
router.get('/leads', async (req, res) => {
    try {
        const leads = await prisma.lead.findMany({
            include: {
                assignedTo: true,
                opportunities: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(leads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

// 2. Create a lead
router.post('/leads', async (req, res) => {
    try {
        const { name, company, email, phone, source, status, notes, assignedToId } = req.body;
        const newLead = await prisma.lead.create({
            data: {
                name,
                company,
                email,
                phone,
                source: source || 'OTHER',
                status: status || 'NEW',
                notes,
                assignedToId: assignedToId ? parseInt(assignedToId) : null,
            },
            include: { assignedTo: true }
        });
        res.status(201).json(newLead);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create lead' });
    }
});

// 3. Update lead status
router.put('/leads/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedLead = await prisma.lead.update({
            where: { id: parseInt(id) },
            data: { status },
        });

        res.json(updatedLead);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update lead status' });
    }
});

// 4. Convert lead to Partner (Client)
router.post('/leads/:id/convert', async (req, res) => {
    try {
        const { id } = req.params;
        const lead = await prisma.lead.findUnique({ where: { id: parseInt(id) } });

        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        if (lead.partnerId) return res.status(400).json({ error: 'Lead is already converted' });

        // 1. Create a new Partner representing the client
        const newPartner = await prisma.partner.create({
            data: {
                name: lead.company || lead.name,
                type: 'CLIENT',
                phone: lead.phone,
                email: lead.email,
                // Default safe fallback password since it's required in schema logic now
                password: await require('bcryptjs').hash('client_123', 10),
            }
        });

        // 2. Link the Partner to the Lead and mark lead as CONVERTED
        const updatedLead = await prisma.lead.update({
            where: { id: parseInt(id) },
            data: {
                status: 'CONVERTED',
                partnerId: newPartner.id
            }
        });

        res.json({ message: 'Lead converted successfully', partner: newPartner, lead: updatedLead });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to convert lead' });
    }
});


// --- OPPORTUNITIES (Pipeline) ---

// 1. Get all opportunities
router.get('/opportunities', async (req, res) => {
    try {
        const opps = await prisma.opportunity.findMany({
            include: { lead: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(opps);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch opportunities' });
    }
});

// 2. Create opportunity
router.post('/opportunities', async (req, res) => {
    try {
        const { title, description, value, probability, expectedClose, stage, leadId } = req.body;
        const opp = await prisma.opportunity.create({
            data: {
                title,
                description,
                value: parseFloat(value) || 0,
                probability: parseInt(probability) || 0,
                expectedClose: expectedClose ? new Date(expectedClose) : null,
                stage: stage || 'DISCOVERY',
                leadId: parseInt(leadId)
            },
            include: { lead: true }
        });
        res.status(201).json(opp);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create opportunity' });
    }
});

// 3. Update opportunity stage (for Kanban drag & drop)
router.put('/opportunities/:id/stage', async (req, res) => {
    try {
        const { id } = req.params;
        const { stage } = req.body;
        const updatedOpp = await prisma.opportunity.update({
            where: { id: parseInt(id) },
            data: { stage }
        });
        res.json(updatedOpp);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update opportunity stage' });
    }
});

// --- ACTIVITIES ---

router.post('/activities', async (req, res) => {
    try {
        const { type, subject, description, leadId, employeeId } = req.body;
        const activity = await prisma.cRMActivity.create({
            data: {
                type,
                subject,
                description,
                leadId: parseInt(leadId),
                employeeId: employeeId ? parseInt(employeeId) : null,
            }
        });
        res.status(201).json(activity);
    } catch (error) {
        res.status(500).json({ error: 'Failed to log activity' });
    }
});

router.get('/leads/:leadId/activities', async (req, res) => {
    try {
        const activities = await prisma.cRMActivity.findMany({
            where: { leadId: parseInt(req.params.leadId) },
            orderBy: { date: 'desc' },
            include: { employee: true }
        });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

// --- DASHBOARD STATS ---
router.get('/stats', async (req, res) => {
    try {
        const totalLeads = await prisma.lead.count();
        const convertedLeads = await prisma.lead.count({ where: { status: 'CONVERTED' } });
        const totalOpps = await prisma.opportunity.count();
        const wonOpps = await prisma.opportunity.count({ where: { stage: 'WON' } });

        // Sum of all opportunities value where stage is not LOST
        const oppsSum = await prisma.opportunity.aggregate({
            _sum: { value: true },
            where: { stage: { not: 'LOST' } }
        });

        res.json({
            totalLeads,
            convertedLeads,
            conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0,
            totalOpps,
            wonOpps,
            pipelineValue: oppsSum._sum.value || 0
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

module.exports = router;
