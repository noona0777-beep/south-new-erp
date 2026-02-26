const express = require('express');

module.exports = function (prisma) {
    const router = express.Router();

    // ==========================================
    // 1. TASKS (إدارة المهام الميدانية والمكتبية)
    // ==========================================

    // Create Task
    router.post('/tasks', async (req, res) => {
        try {
            const { title, description, type, phase, sbcClause, riskLevel, dueDate, projectId, engineerId, engineerNotes, gpsLocation, status } = req.body;

            // Generate random Task Number like TSK-YYYYMMDD-XXXX
            const taskNumber = `TSK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

            const task = await prisma.task.create({
                data: {
                    taskNumber,
                    title,
                    description,
                    type: type || 'OFFICE',
                    phase,
                    sbcClause,
                    riskLevel: riskLevel || 'LOW',
                    dueDate: dueDate ? new Date(dueDate) : null,
                    projectId: projectId ? parseInt(projectId) : null,
                    engineerId: engineerId ? parseInt(engineerId) : null,
                    engineerNotes,
                    gpsLocation,
                    status: status || 'NEW'
                }
            });
            res.status(201).json(task);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get Project Tasks
    router.get('/tasks/project/:projectId', async (req, res) => {
        try {
            const tasks = await prisma.task.findMany({
                where: { projectId: parseInt(req.params.projectId) },
                include: {
                    engineer: true,
                    attachments: true,
                    tickets: true,
                    risks: true
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Update Task (measurements, signatures, status)
    router.put('/tasks/:id', async (req, res) => {
        try {
            const { status, engineerNotes, gpsLocation, supervisorSignature, contractorSignature, measurements } = req.body;
            const task = await prisma.task.update({
                where: { id: parseInt(req.params.id) },
                data: {
                    ...(status && { status }),
                    ...(engineerNotes && { engineerNotes }),
                    ...(gpsLocation && { gpsLocation }),
                    ...(supervisorSignature && { supervisorSignature }),
                    ...(contractorSignature && { contractorSignature }),
                    ...(measurements && { measurements })
                }
            });
            res.json(task);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // ==========================================
    // 2. TICKETS & RISKS (طמلاحﻈات ومخاطر)
    // ==========================================

    router.post('/tickets', async (req, res) => {
        try {
            const { taskId, title, description } = req.body;
            const ticket = await prisma.ticket.create({
                data: { taskId: parseInt(taskId), title, description }
            });
            res.status(201).json(ticket);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/risks', async (req, res) => {
        try {
            const { taskId, description, severity, mitigationPlan } = req.body;
            const risk = await prisma.risk.create({
                data: { taskId: parseInt(taskId), description, severity, mitigationPlan }
            });
            res.status(201).json(risk);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // ==========================================
    // 3. SITE VISITS (الزيارات الميدانية)
    // ==========================================

    router.post('/visits', async (req, res) => {
        try {
            const { projectId, engineerId, notes, gpsLocation } = req.body;
            const visit = await prisma.siteVisit.create({
                data: {
                    projectId: parseInt(projectId),
                    engineerId: parseInt(engineerId),
                    notes,
                    gpsLocation
                }
            });
            res.status(201).json(visit);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/visits/project/:projectId', async (req, res) => {
        try {
            const visits = await prisma.siteVisit.findMany({
                where: { projectId: parseInt(req.params.projectId) },
                include: { engineer: true },
                orderBy: { date: 'desc' }
            });
            res.json(visits);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // ==========================================
    // 4. AI INTEGRATION (الذכاء الاصطناعي)
    // ==========================================

    // Mocking AI analysis for now. Returns detected violations.
    router.post('/ai/analyze-image', async (req, res) => {
        try {
            const { taskId, imageUrl } = req.body;
            // Mock AI Results
            const analysisResult = {
                detectedObjects: ["Rebar", "Concrete", "Formwork"],
                cracksDetected: Math.random() > 0.5,
                coverDepthEstimated: "5cm",
                anomalies: ["Exposed rebar rust", "Insufficient vibration near edges"]
            };
            const aiReport = await prisma.aIReport.create({
                data: {
                    taskId: parseInt(taskId),
                    imageUrl,
                    analysisResult,
                    progressExtracted: Math.floor(Math.random() * 30) + 10, // random 10-40% progress addition
                    sbcViolations: "SBC-304: Insufficient curing time observed."
                }
            });
            res.json(aiReport);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/ai/compare-plan', async (req, res) => {
        try {
            const { taskId, planUrl, siteImageUrl } = req.body;
            // Mock DB Insert
            const comp = await prisma.planComparison.create({
                data: {
                    taskId: parseInt(taskId),
                    planUrl,
                    siteImageUrl,
                    differenceMapUrl: "https://dummyimage.com/600x400/ff0000/fff&text=Difference+Map",
                    progressPercentage: Math.floor(Math.random() * 100)
                }
            });
            res.json(comp);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/ai/task/:taskId', async (req, res) => {
        try {
            const reports = await prisma.aIReport.findMany({
                where: { taskId: parseInt(req.params.taskId) },
                orderBy: { createdAt: 'desc' }
            });
            const comparisons = await prisma.planComparison.findMany({
                where: { taskId: parseInt(req.params.taskId) },
                orderBy: { createdAt: 'desc' }
            });
            res.json({ reports, comparisons });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // ==========================================
    // 5. ENGINEER EVALUATION (تقييم المهندسين)
    // ==========================================

    router.get('/scores', async (req, res) => {
        try {
            const { month, year } = req.query;
            let where = {};
            if (month && year) {
                where = { month: parseInt(month), year: parseInt(year) };
            }
            const scores = await prisma.engineerScore.findMany({
                where,
                include: { engineer: true },
                orderBy: { finalScore: 'desc' }
            });
            res.json(scores);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/scores/calculate', async (req, res) => {
        try {
            const { engineerId, month, year } = req.body;
            // Equation: 
            // final = (tasksCompleted * 0.25) + (closureSpeed * 0.20) + (reportQuality * 0.20) + (aiAccuracy * 0.20) + (attendance * 0.15)

            // Mock algorithm values
            const tasksCompletedScore = Math.floor(Math.random() * 30) + 70; // 70-100
            const closureSpeedScore = Math.floor(Math.random() * 20) + 80; // 80-100
            const reportQualityScore = Math.floor(Math.random() * 25) + 75; // 75-100
            const aiAccuracyScore = Math.floor(Math.random() * 40) + 60; // 60-100
            const attendanceScore = Math.floor(Math.random() * 10) + 90; // 90-100

            const finalScore =
                (tasksCompletedScore * 0.25) +
                (closureSpeedScore * 0.20) +
                (reportQualityScore * 0.20) +
                (aiAccuracyScore * 0.20) +
                (attendanceScore * 0.15);

            const record = await prisma.engineerScore.upsert({
                where: {
                    engineerId_month_year: {
                        engineerId: parseInt(engineerId),
                        month: parseInt(month),
                        year: parseInt(year)
                    }
                },
                update: {
                    tasksCompletedScore, closureSpeedScore, reportQualityScore, aiAccuracyScore, attendanceScore, finalScore
                },
                create: {
                    engineerId: parseInt(engineerId),
                    month: parseInt(month),
                    year: parseInt(year),
                    tasksCompletedScore, closureSpeedScore, reportQualityScore, aiAccuracyScore, attendanceScore, finalScore
                }
            });
            res.json(record);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // ==========================================
    // 6. ATTACHMENTS (المرفقات)
    // ==========================================
    router.post('/attachments', async (req, res) => {
        try {
            const { taskId, fileUrl, fileType, name } = req.body;
            const attachment = await prisma.taskAttachment.create({
                data: { taskId: parseInt(taskId), fileUrl, fileType, name }
            });
            res.status(201).json(attachment);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
