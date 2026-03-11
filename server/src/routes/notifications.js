const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// ─── Helper: Create Notification (avoid duplicates) ──────────────────────────
async function createNotif(type, title, message, link = null) {
    try {
        // Check if same notification exists in last 24h
        const recent = await prisma.notification.findFirst({
            where: {
                type,
                message,
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }
        });
        if (recent) return; // skip duplicate
        await prisma.notification.create({ data: { type, title, message, link } });
    } catch (e) { /* ignore */ }
}

// ─── POST /refresh - Smart Auto-notifications Engine ─────────────────────────
router.post('/refresh', async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const in3Days = new Date(today.getTime() + 3 * 86400000);
        const in7Days = new Date(today.getTime() + 7 * 86400000);
        const in14Days = new Date(today.getTime() + 14 * 86400000);
        const in30Days = new Date(today.getTime() + 30 * 86400000);

        // 1. ── OVERDUE INVOICES (فواتير متأخرة) ──────────────────────────────
        try {
            const overdueInvoices = await prisma.invoice.findMany({
                where: {
                    status: { notIn: ['PAID', 'CANCELLED'] },
                    date: { lt: new Date(today.getTime() - 30 * 86400000) } // older than 30 days
                },
                include: { partner: true },
                take: 10
            });
            for (const inv of overdueInvoices) {
                const daysOld = Math.floor((today - new Date(inv.date)) / 86400000);
                await createNotif(
                    'OVERDUE_INVOICE',
                    '⚠️ فاتورة متأخرة',
                    `فاتورة ${inv.invoiceNumber} للعميل "${inv.partner?.name || 'غير محدد'}" متأخرة ${daysOld} يوم - المبلغ: ${inv.total?.toLocaleString('ar-SA')} ر.س`,
                    `/invoices`
                );
            }
        } catch (e) { console.warn('Invoice notif error:', e.message); }

        // 2. ── PROJECTS DUE SOON / OVERDUE (مشاريع منتهية المدة) ─────────────
        try {
            const projectsDue = await prisma.project.findMany({
                where: {
                    status: { notIn: ['COMPLETED', 'CANCELLED'] },
                    endDate: { not: null, lte: in7Days }
                },
                take: 10
            });
            for (const proj of projectsDue) {
                const isOverdue = new Date(proj.endDate) < today;
                const daysLeft = Math.floor((new Date(proj.endDate) - today) / 86400000);
                await createNotif(
                    isOverdue ? 'PROJECT_OVERDUE' : 'PROJECT_DUE',
                    isOverdue ? '🔴 مشروع متأخر' : '🟡 مشروع على وشك الانتهاء',
                    isOverdue
                        ? `مشروع "${proj.name}" تجاوز موعد الانتهاء بـ ${Math.abs(daysLeft)} يوم`
                        : `مشروع "${proj.name}" ينتهي خلال ${daysLeft} أيام`,
                    `/projects`
                );
            }
        } catch (e) { console.warn('Project notif error:', e.message); }

        // 3. ── EXPIRING CONTRACTS (عقود تنتهي قريباً) ────────────────────────
        try {
            const contracts = await prisma.constructionContract.findMany({
                where: {
                    status: { notIn: ['CANCELLED', 'COMPLETED'] },
                    endDate: { gte: today, lte: in30Days }
                },
                include: { partner: true },
                take: 10
            });
            for (const c of contracts) {
                const daysLeft = Math.floor((new Date(c.endDate) - today) / 86400000);
                const urgency = daysLeft <= 7 ? '🔴' : daysLeft <= 14 ? '🟠' : '🟡';
                await createNotif(
                    'EXPIRING_CONTRACT',
                    `${urgency} عقد ينتهي قريباً`,
                    `عقد "${c.title}" للعميل "${c.client?.name || 'غير محدد'}" ينتهي خلال ${daysLeft} يوم`,
                    `/contracts`
                );
            }
        } catch (e) { console.warn('Contract notif error:', e.message); }

        // 4. ── LOW STOCK (مخزون منخفض) ───────────────────────────────────────
        try {
            const lowStock = await prisma.stock.findMany({
                where: { quantity: { lte: 10, gt: 0 } },
                include: { product: true },
                take: 10
            });
            for (const s of lowStock) {
                await createNotif(
                    'LOW_STOCK',
                    '📦 مخزون منخفض',
                    `المنتج "${s.product?.name}" وصل إلى ${s.quantity} وحدات فقط`,
                    `/inventory`
                );
            }

            // Out of stock completely
            const outOfStock = await prisma.stock.findMany({
                where: { quantity: { lte: 0 } },
                include: { product: true },
                take: 5
            });
            for (const s of outOfStock) {
                await createNotif(
                    'OUT_OF_STOCK',
                    '🚨 نفاذ المخزون',
                    `المنتج "${s.product?.name}" نفد من المخزون تماماً`,
                    `/inventory`
                );
            }
        } catch (e) { console.warn('Stock notif error:', e.message); }

        // 5. ── PENDING TASKS (مهام متأخرة) ───────────────────────────────────
        try {
            const overdueTasks = await prisma.task.findMany({
                where: {
                    status: { notIn: ['DONE', 'CANCELLED'] },
                    dueDate: { not: null, lt: today }
                },
                take: 5
            });
            for (const t of overdueTasks) {
                const daysLate = Math.floor((today - new Date(t.dueDate)) / 86400000);
                await createNotif(
                    'OVERDUE_TASK',
                    '📌 مهمة متأخرة',
                    `المهمة "${t.title}" متأخرة ${daysLate} يوم`,
                    `/projects`
                );
            }
        } catch (e) { console.warn('Task notif error:', e.message); }

        // 6. ── EXPIRING QUOTES (عروض أسعار منتهية الصلاحية) ─────────────────
        try {
            const expiredQuotes = await prisma.quote.findMany({
                where: {
                    status: 'SENT',
                    validUntil: { not: null, lt: today }
                },
                include: { partner: true },
                take: 5
            });
            for (const q of expiredQuotes) {
                await createNotif(
                    'EXPIRED_QUOTE',
                    '📄 عرض سعر منتهي',
                    `عرض السعر ${q.quoteNumber} للعميل "${q.partner?.name || 'غير محدد'}" انتهت صلاحيته`,
                    `/quotes`
                );
            }
        } catch (e) { console.warn('Quote notif error:', e.message); }

        // 7. ── HIGH OUTSTANDING BALANCE (أرصدة مستحقة كبيرة) ────────────────
        try {
            const highBalance = await prisma.partner.findMany({
                where: { balance: { gt: 50000 }, type: 'CLIENT' },
                orderBy: { balance: 'desc' },
                take: 3
            });
            for (const p of highBalance) {
                await createNotif(
                    'HIGH_BALANCE',
                    '💰 رصيد مستحق كبير',
                    `العميل "${p.name}" لديه رصيد مستحق ${p.balance?.toLocaleString('ar-SA')} ر.س`,
                    `/partners`
                );
            }
        } catch (e) { console.warn('Balance notif error:', e.message); }

        res.json({ success: true, message: 'Notifications refreshed' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ─── GET / - All Notifications ───────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            take: 30
        });
        res.json(notifications);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── GET /summary - Count by type ────────────────────────────────────────────
router.get('/summary', async (req, res) => {
    try {
        const unread = await prisma.notification.count({ where: { isRead: false } });
        const byType = await prisma.notification.groupBy({
            by: ['type'],
            _count: { id: true },
            where: { isRead: false }
        });
        res.json({ unread, byType });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── PUT /:id/read ────────────────────────────────────────────────────────────
router.put('/:id/read', async (req, res) => {
    try {
        await prisma.notification.update({ where: { id: parseInt(req.params.id) }, data: { isRead: true } });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── PUT /read-all ────────────────────────────────────────────────────────────
router.put('/read-all', async (req, res) => {
    try {
        await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── DELETE /clear-old - Delete notifications older than 7 days ──────────────
router.delete('/clear-old', async (req, res) => {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
        const result = await prisma.notification.deleteMany({
            where: { createdAt: { lt: sevenDaysAgo }, isRead: true }
        });
        res.json({ success: true, deleted: result.count });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
