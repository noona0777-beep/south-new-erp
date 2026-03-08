const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { JWT_SECRET } = require('../middleware/auth');
const { transporter, whatsapp, getWhatsappStatus } = require('../lib/services');

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'البريد الإلكتروني غير مسجل' });

        if (user.status === 'BLOCKED') {
            return res.status(403).json({ error: 'ACCOUNT_BLOCKED', message: 'عذراً، هذا الحساب معطل حالياً من قبل الإدارة' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'كلمة المرور غير صحيحة' });

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

        await prisma.activityLog.create({
            data: { userId: user.id, action: 'LOGIN', details: 'User logged in successfully' }
        });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                phone: user.phone,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { contact } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: { OR: [{ email: contact }, { phone: contact }] }
        });

        if (!user) return res.status(404).json({ error: 'البيانات المدخلة غير مسجلة لدينا' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: { otp, otpExpiry }
        });

        const { status } = getWhatsappStatus();
        let sentViaWhatsApp = false;

        if (user.phone && (status === 'READY' || status === 'AUTHENTICATED')) {
            try {
                let cleanPhone = user.phone.replace(/\D/g, '');
                if (!cleanPhone.startsWith('966') && cleanPhone.startsWith('05')) {
                    cleanPhone = '966' + cleanPhone.substring(1);
                }
                const chatId = `${cleanPhone}@c.us`;
                const waMessage = `*نظام الجنوب الجديد*\n\nمرحباً ${user.name}،\n\nرمز استعادة كلمة المرور الخاص بك هو:\n\n*${otp}*\n\nصالح لمدة 10 دقائق.`;
                await whatsapp.sendMessage(chatId, waMessage);
                sentViaWhatsApp = true;
            } catch (waError) {
                console.error('WhatsApp OTP Fail:', waError.message);
            }
        }

        if (sentViaWhatsApp) {
            res.json({ message: 'تم إرسال رمز التحقق إلى الواتساب الخاص بك بنجاح ✅' });
        } else {
            try {
                if (!process.env.EMAIL_PASS) throw new Error('Email not configured');
                const mailOptions = {
                    from: '"South New System" <noona0777@gmail.com>',
                    to: user.email,
                    subject: 'رمز استعادة كلمة المرور - نظام الجنوب الجديد',
                    html: `<div dir="rtl"><h2>مرحباً ${user.name}،</h2><p>رمز التحقق: <b>${otp}</b></p></div>`
                };
                await transporter.sendMail(mailOptions);
                res.json({ message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني' });
            } catch (emailError) {
                console.error('Email fallback fail:', emailError.message);
                res.status(500).json({ error: 'تعذر إرسال الرمز. يرجى التأكد من ربط واتساب بالنظام أو التواصل مع الإدارة.' });
            }
        }
    } catch (error) {
        console.error('Forgot Pass Error:', error);
        res.status(500).json({ error: 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً' });
    }
});

// Forgot Username (Email recovery by phone)
router.post('/forgot-username', async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await prisma.user.findFirst({ where: { phone } });
        if (!user) return res.status(400).json({ error: 'لم يتم العثور على حساب مرتبط بهذا الرقم' });

        const status = getWhatsappStatus().status;

        if (status === 'READY' || status === 'AUTHENTICATED') {
            try {
                let cleanPhone = user.phone.replace(/\D/g, '');
                if (!cleanPhone.startsWith('966') && cleanPhone.startsWith('05')) {
                    cleanPhone = '966' + cleanPhone.substring(1);
                }
                const chatId = `${cleanPhone}@c.us`;
                const waMessage = `*نظام الجنوب الجديد*\n\nمرحباً ${user.name}،\n\nبناءً على طلبك، اسم المستخدم (البريد الإلكتروني) الخاص بحسابك هو:\n\n*${user.email}*\n\nيرجى الاحتفاظ به في مكان آمن.`;
                await whatsapp.sendMessage(chatId, waMessage);
                return res.json({ message: 'تم إرسال اسم المستخدم برسالة واتساب بنجاح ✅' });
            } catch (waError) {
                console.error('WhatsApp Forgot Username Fail:', waError.message);
                return res.status(500).json({ error: 'حدث خطأ أثناء إرسال رسالة الواتساب' });
            }
        } else {
            return res.status(400).json({ error: 'خدمة الواتساب غير متصلة حالياً، يرجى التواصل مع الدعم الفني' });
        }
    } catch (error) {
        res.status(500).json({ error: 'فشل في استرجاع البيانات' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { contact, otp } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: contact }, { phone: contact }],
                otp,
                otpExpiry: { gte: new Date() }
            }
        });
        if (!user) return res.status(400).json({ error: 'الرمز غير صحيح أو انتهت صلاحيته' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { contact, otp, newPassword } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: contact }, { phone: contact }],
                otp,
                otpExpiry: { gte: new Date() }
            }
        });
        if (!user) return res.status(400).json({ error: 'عذراً، لا يمكن إتمام العملية' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword, otp: null, otpExpiry: null }
        });
        res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
