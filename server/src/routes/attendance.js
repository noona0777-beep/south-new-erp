const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate } = require('../middleware/auth');

// 1. تسجيل الدخول (Clock In) مع الإحداثيات
router.post('/clock-in', authenticate, async (req, res) => {
    try {
        const { lat, lng, notes } = req.body;
        // افتراضياً الموظف هو المستخدم الحالي
        const user = req.user; 
        
        // جلب معرف الموظف المرتبط بهذا المستخدم
        const employeeId = Number(req.body.employeeId) || 1; // كمثال يجب ربط المستخدم برقم الموظف الفعلي 

        // التحقق مما إذا كان قد سجل دخول اليوم بالفعل
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existing = await prisma.attendanceRecord.findFirst({
            where: {
                employeeId,
                date: { gte: today }
            }
        });

        if (existing && existing.checkIn) {
            return res.status(400).json({ error: 'لقد قمت بتسجيل الدخول مسبقاً لهذا اليوم' });
        }

        const record = await prisma.attendanceRecord.create({
            data: {
                employeeId,
                date: new Date(),
                checkIn: new Date(),
                checkInLat: lat,
                checkInLng: lng,
                status: 'PRESENT',
                notes
            }
        });

        res.status(201).json(record);
    } catch (error) {
        console.error('Clock-in error:', error);
        res.status(500).json({ error: 'فشل في تسجيل الدخول' });
    }
});

// 2. تسجيل الخروج (Clock Out) مع الإحداثيات
router.post('/clock-out', authenticate, async (req, res) => {
    try {
        const { lat, lng, notes } = req.body;
        const employeeId = Number(req.body.employeeId) || 1;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existing = await prisma.attendanceRecord.findFirst({
            where: {
                employeeId,
                date: { gte: today }
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'لم يتم العثور على سجل دخول لهذا اليوم' });
        }

        if (existing.checkOut) {
            return res.status(400).json({ error: 'لقد قمت بتسجيل الخروج مسبقاً' });
        }

        const record = await prisma.attendanceRecord.update({
            where: { id: existing.id },
            data: {
                checkOut: new Date(),
                checkOutLat: lat,
                checkOutLng: lng,
                notes: notes ? (existing.notes + '\n' + notes) : existing.notes
            }
        });

        res.json(record);
    } catch (error) {
        console.error('Clock-out error:', error);
        res.status(500).json({ error: 'فشل في تسجيل الانصراف' });
    }
});

// 3. جلب سجلات الحضور مع الفلترة (للإدارة)
router.get('/', authenticate, async (req, res) => {
    try {
        const { date, employeeId } = req.query;
        let where = {};
        
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            where.date = { gte: startDate, lt: endDate };
        }
        
        if (employeeId) {
            where.employeeId = Number(employeeId);
        }

        const records = await prisma.attendanceRecord.findMany({
            where,
            include: {
                employee: {
                    select: { id: true, name: true, jobTitle: true, department: true }
                }
            },
            orderBy: { date: 'desc' }
        });
        
        res.json(records);
    } catch (error) {
        console.error('Fetch attendance error:', error);
        res.status(500).json({ error: 'فشل في جلب سجلات الحضور' });
    }
});

module.exports = router;
