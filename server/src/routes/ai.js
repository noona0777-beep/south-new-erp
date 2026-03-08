const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-proj-dummy',
});

const isMockMode = () => !process.env.OPENAI_API_KEY
    || process.env.OPENAI_API_KEY === 'sk-proj-dummy'
    || process.env.OPENAI_API_KEY.includes('YOUR_');

// ======================================================
// Helper: Call OpenAI chat with a system + user prompt
// ======================================================
async function askAI(systemPrompt, userPrompt) {
    if (isMockMode()) {
        return null; // caller will handle mock
    }
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        response_format: { type: 'json_object' }
    });
    return JSON.parse(response.choices[0].message.content);
}

// =============================================
// 1. محلل مالي ذكي - Financial AI Analyst
// =============================================
router.get('/financial-insights', async (req, res) => {
    try {
        const [invoiceStats, quoteStats, projectStats, topClients] = await Promise.all([
            prisma.invoice.groupBy({ by: ['status'], _sum: { total: true }, _count: { id: true } }),
            prisma.quote.groupBy({ by: ['status'], _count: { id: true }, _sum: { total: true } }),
            prisma.project.groupBy({ by: ['status'], _count: { id: true }, _sum: { contractValue: true } }),
            prisma.invoice.groupBy({
                by: ['partnerId'], _sum: { total: true }, orderBy: { _sum: { total: 'desc' } }, take: 5,
                where: { partnerId: { not: null } }
            })
        ]);

        const totalRevenue = invoiceStats.find(s => s.status === 'PAID')?._sum?.total || 0;
        const pendingRevenue = invoiceStats.find(s => s.status === 'POSTED')?._sum?.total || 0;
        const quoteConversionRate = quoteStats.find(s => s.status === 'ACCEPTED')?._count?.id /
            Math.max(quoteStats.reduce((a, b) => a + b._count.id, 0), 1) * 100;

        const data = {
            totalRevenue, pendingRevenue, quoteConversionRate,
            invoiceStats, quoteStats, projectStats
        };

        if (isMockMode()) {
            return res.json({
                insights: [
                    { type: 'success', title: 'أداء الإيرادات', message: `إجمالي الإيرادات المحصلة ${totalRevenue.toLocaleString('ar')} ر.س. معدل تحويل عروض الأسعار ${quoteConversionRate?.toFixed(1)}%.` },
                    { type: 'warning', title: 'مستحقات غير محصلة', message: `يوجد ${pendingRevenue.toLocaleString('ar')} ر.س فواتير لم تُحصَّل بعد. يُنصح بمتابعة العملاء.` },
                    { type: 'info', title: 'توصية استراتيجية', message: 'للرفع من معدل التحويل، يُنصح بإرسال عروض أسعار مفصلة خلال 24 ساعة من الاستفسار.' },
                ],
                data
            });
        }

        const result = await askAI(
            'أنت محلل مالي خبير في شركات المقاولات والعقارات السعودية. قدم تحليلاً دقيقاً بصيغة JSON فقط.',
            `حلل هذه البيانات المالية وقدم 3 رؤى مهمة وتوصيات عملية: ${JSON.stringify(data)}`
        );

        res.json({ insights: result?.insights || [], data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================
// 2. توقع المناقصات والفرص - CRM AI Predictor
// =============================================
router.get('/crm-insights', async (req, res) => {
    try {
        const [leads, opportunities] = await Promise.all([
            prisma.lead.findMany({ include: { opportunities: true, activities: true }, take: 20, orderBy: { createdAt: 'desc' } }),
            prisma.opportunity.findMany({ orderBy: { value: 'desc' }, take: 10 })
        ]);

        const totalPipelineValue = opportunities.reduce((s, o) => s + o.value, 0);
        const weightedValue = opportunities.reduce((s, o) => s + (o.value * o.probability / 100), 0);
        const wonOpps = opportunities.filter(o => o.stage === 'WON').length;
        const winRate = wonOpps / Math.max(opportunities.length, 1) * 100;

        if (isMockMode()) {
            return res.json({
                insights: [
                    { type: 'success', title: 'حجم خط الفرص', message: `إجمالي قيمة الفرص المفتوحة ${totalPipelineValue.toLocaleString('ar')} ر.س، والقيمة المرجّحة ${weightedValue.toFixed(0)} ر.س.` },
                    { type: 'info', title: 'معدل الفوز', message: `معدل الفوز الحالي ${winRate.toFixed(1)}%. المتوسط العالمي في قطاع المقاولات 25-35%.` },
                    { type: 'warning', title: 'توصية المتابعة', message: 'العملاء غير النشطين لأكثر من 7 أيام يحتاجون مكالمة متابعة لتعظيم فرص الإغلاق.' },
                ],
                totalPipelineValue, weightedValue, winRate
            });
        }

        const result = await askAI(
            'أنت خبير CRM ومبيعات في قطاع المقاولات السعودي. قدم تحليلاً ذكياً.',
            `حلل بيانات مسار المبيعات وقدم 3 توصيات عملية: ${JSON.stringify({ leads: leads.length, opportunities, winRate })}`
        );

        res.json({ insights: result?.insights || [], totalPipelineValue, weightedValue, winRate });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================
// 3. تحليل أداء المشاريع - Project Health AI
// =============================================
router.get('/project-health', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            include: { tasks: true, invoices: true, siteVisits: true, client: true },
            where: { status: { in: ['PLANNED', 'IN_PROGRESS'] } }
        });

        const analysis = projects.map(p => {
            const completedTasks = p.tasks.filter(t => t.status === 'CLOSED').length;
            const taskProgress = p.tasks.length ? (completedTasks / p.tasks.length * 100) : 0;
            const invoiced = p.invoices.reduce((s, i) => s + i.total, 0);
            const financialProgress = p.contractValue ? (invoiced / p.contractValue * 100) : 0;
            const daysLeft = p.endDate ? Math.ceil((new Date(p.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
            const health = daysLeft < 7 && taskProgress < 90 ? 'CRITICAL' :
                daysLeft < 30 && taskProgress < 70 ? 'AT_RISK' : 'HEALTHY';
            return { id: p.id, name: p.name, client: p.client?.name, taskProgress, financialProgress, daysLeft, health, visitCount: p.siteVisits.length };
        });

        const critical = analysis.filter(p => p.health === 'CRITICAL');
        const atRisk = analysis.filter(p => p.health === 'AT_RISK');

        if (isMockMode()) {
            return res.json({
                insights: [
                    { type: critical.length > 0 ? 'danger' : 'success', title: 'صحة المشاريع', message: critical.length > 0 ? `${critical.length} مشروع في وضع حرج يحتاج تدخلاً فورياً.` : 'جميع المشاريع النشطة تسير بشكل جيد.' },
                    { type: atRisk.length > 0 ? 'warning' : 'info', title: 'مشاريع تحت المراقبة', message: atRisk.length > 0 ? `${atRisk.length} مشروع قد يتأخر عن موعده. يُنصح بزيادة الزيارات الميدانية.` : 'لا توجد مشاريع في خطر حالياً.' },
                    { type: 'info', title: 'نسبة الإنجاز المالي', message: `متوسط الإنجاز المالي ${(analysis.reduce((s, p) => s + p.financialProgress, 0) / Math.max(analysis.length, 1)).toFixed(1)}% من القيمة الكلية للعقود.` }
                ],
                projects: analysis
            });
        }

        const result = await askAI(
            'أنت مدير مشاريع خبير في المقاولات السعودية. قدم تحليلاً دقيقاً.',
            `حلل صحة هذه المشاريع وقدم 3 توصيات: ${JSON.stringify(analysis)}`
        );

        res.json({ insights: result?.insights || [], projects: analysis });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================
// 4. مولّد عرض السعر الذكي - AI Quote Generator
// =============================================
router.post('/generate-quote', async (req, res) => {
    try {
        const { projectType, area, location, requirements } = req.body;

        const products = await prisma.product.findMany({ take: 50, include: { category: true } });

        if (isMockMode()) {
            return res.json({
                suggestions: [
                    { description: 'أعمال الحفر والردم', quantity: area * 0.5, unit: 'م³', unitPrice: 45, total: area * 0.5 * 45 },
                    { description: 'أعمال الخرسانة المسلحة للأساسات', quantity: area * 0.3, unit: 'م³', unitPrice: 850, total: area * 0.3 * 850 },
                    { description: 'أعمال البناء والبلوك', quantity: area * 2.5, unit: 'م²', unitPrice: 120, total: area * 2.5 * 120 },
                    { description: 'أعمال التشطيبات الداخلية', quantity: area, unit: 'م²', unitPrice: 350, total: area * 350 },
                    { description: 'أعمال الكهرباء والسباكة', quantity: 1, unit: 'مقطوعية', unitPrice: area * 150, total: area * 150 },
                ],
                notes: `عرض سعر تقديري لمشروع ${projectType} بمساحة ${area}م² في ${location}. الأسعار تقديرية وتخضع للمراجعة بعد الكشف الميداني.`,
                estimatedTotal: area * 1515
            });
        }

        const result = await askAI(
            'أنت خبير مقاولات سعودي محترف. أنشئ عرض سعر تقديري دقيق بصيغة JSON فقط.',
            `أنشئ قائمة بنود عرض سعر لمشروع ${projectType} بمساحة ${area}م² في ${location}. المتطلبات: ${requirements}. القائمة بالمنتجات المتوفرة: ${JSON.stringify(products.slice(0, 20).map(p => ({ name: p.name, price: p.price, unit: p.unit })))}`
        );

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================
// 5. مساعد AI الشامل (Chatbot)
// =============================================
router.post('/chat', async (req, res) => {
    try {
        const { message, context } = req.body;

        // جلب ملخص سريع من قاعدة البيانات
        const [invoiceCount, projectCount, clientCount] = await Promise.all([
            prisma.invoice.count(),
            prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.partner.count({ where: { type: 'CUSTOMER' } })
        ]);

        const systemContext = `أنت مساعد ذكي متخصص في إدارة شركات المقاولات والعقارات السعودية. 
        تعمل لصالح "مؤسسة الجنوب الجديد" للمقاولات.
        البيانات الحالية: ${invoiceCount} فاتورة، ${projectCount} مشروع نشط، ${clientCount} عميل.
        أجب دائماً بالعربية بشكل احترافي ومفيد. قدم إجابتك بصيغة JSON: { "reply": "...", "suggestions": ["...", "..."] }`;

        if (isMockMode()) {
            const mockReplies = {
                'مشاريع': { reply: `يوجد حالياً ${projectCount} مشروع نشط. يمكنني مساعدتك في تحليل أداء أي مشروع محدد.`, suggestions: ['عرض تفاصيل المشاريع', 'تقرير صحة المشاريع', 'إضافة مشروع جديد'] },
                'فواتير': { reply: `إجمالي الفواتير في النظام ${invoiceCount} فاتورة. هل تريد تفاصيل الفواتير المعلقة؟`, suggestions: ['الفواتير غير المدفوعة', 'إنشاء فاتورة جديدة', 'تقرير الإيرادات'] },
                'عملاء': { reply: `يوجد ${clientCount} عميل مسجل. هل تريد تحليل أداء العملاء أو متابعة مستحقاتهم؟`, suggestions: ['أكثر العملاء إيراداً', 'العملاء غير النشطين', 'إضافة عميل جديد'] },
            };
            const key = Object.keys(mockReplies).find(k => message.includes(k));
            return res.json(mockReplies[key] || { reply: `شكراً على سؤالك حول "${message}". يمكنني مساعدتك في تحليل الأداء المالي، المشاريع، العملاء، والمخزون.`, suggestions: ['التحليل المالي', 'صحة المشاريع', 'تحليل CRM'] });
        }

        const result = await askAI(systemContext, message);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================
// 6. تقرير أتمتة: التنبيهات الذكية
// =============================================
router.get('/smart-alerts', async (req, res) => {
    try {
        const now = new Date();
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const [overdueInvoices, expiringSoon, lowStock, criticalTasks, expiringContracts] = await Promise.all([
            prisma.invoice.findMany({ where: { status: 'POSTED', dueDate: { lt: now } }, include: { partner: true } }),
            prisma.project.findMany({ where: { endDate: { lte: in7Days, gte: now }, status: { in: ['PLANNED', 'IN_PROGRESS'] } }, include: { client: true } }),
            prisma.stock.findMany({ where: { quantity: { lt: 5 } }, include: { product: true }, take: 10 }),
            prisma.task.findMany({ where: { status: { notIn: ['CLOSED'] }, riskLevel: 'CRITICAL' }, take: 5 }),
            prisma.realEstateContract.findMany({ where: { endDate: { lte: in30Days, gte: now }, status: 'ACTIVE' }, include: { unit: { include: { property: true } }, tenant: true } })
        ]);

        const alerts = [];

        if (overdueInvoices.length > 0) {
            alerts.push({
                type: 'danger', icon: '💸', title: 'فواتير متأخرة السداد',
                message: `${overdueInvoices.length} فاتورة تجاوزت موعد استحقاقها. إجمالي المبلغ: ${overdueInvoices.reduce((s, i) => s + i.total, 0).toLocaleString('ar')} ر.س`,
                items: overdueInvoices.map(i => `${i.partner?.name}: ${i.total.toLocaleString('ar')} ر.س`)
            });
        }

        if (expiringSoon.length > 0) {
            alerts.push({
                type: 'warning', icon: '⏰', title: 'مشاريع قاربت انتهاء موعدها',
                message: `${expiringSoon.length} مشروع ينتهي خلال 7 أيام. تأكد من اكتمال الأعمال.`,
                items: expiringSoon.map(p => `${p.name} - العميل: ${p.client?.name}`)
            });
        }

        if (lowStock.length > 0) {
            alerts.push({
                type: 'warning', icon: '📦', title: 'مخزون منخفض يحتاج تجديد',
                message: `${lowStock.length} منتج وصل لمستوى حرج (أقل من 5 وحدات).`,
                items: lowStock.map(s => `${s.product.name}: ${s.quantity} وحدة متبقية`)
            });
        }

        if (criticalTasks.length > 0) {
            alerts.push({
                type: 'danger', icon: '🚨', title: 'مهام في مستوى خطورة حرج',
                message: `${criticalTasks.length} مهام تحمل مستوى خطورة حرج تحتاج اهتماماً فورياً.`,
                items: criticalTasks.map(t => t.title)
            });
        }

        if (expiringContracts.length > 0) {
            alerts.push({
                type: 'info', icon: '📋', title: 'عقود إيجار قاربت انتهاءها',
                message: `${expiringContracts.length} عقد إيجار ينتهي خلال 30 يوماً.`,
                items: expiringContracts.map(c => `${c.unit?.property?.name} - ${c.tenant?.name}: ينتهي ${new Date(c.endDate).toLocaleDateString('ar-SA')}`)
            });
        }

        if (alerts.length === 0) {
            alerts.push({ type: 'success', icon: '✅', title: 'وضع النظام ممتاز', message: 'لا توجد تنبيهات مهمة. جميع المؤشرات تسير بشكل طبيعي.' });
        }

        res.json({ alerts, generatedAt: now });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================
// 7. تقرير KPIs التنفيذية
// =============================================
router.get('/executive-kpis', async (req, res) => {
    try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
        const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

        const [thisMonthRevenue, lastMonthRevenue, activeProjects, newLeads, avgInvoiceValue, completionRate] = await Promise.all([
            prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PAID', createdAt: { gte: startOfMonth } } }),
            prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PAID', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
            prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
            prisma.invoice.aggregate({ _avg: { total: true } }),
            prisma.task.aggregate({
                _count: { id: true },
                where: { status: 'CLOSED', updatedAt: { gte: startOfMonth } }
            })
        ]);

        const thisRev = thisMonthRevenue._sum.total || 0;
        const lastRev = lastMonthRevenue._sum.total || 1;
        const revenueGrowth = ((thisRev - lastRev) / lastRev * 100).toFixed(1);

        res.json({
            kpis: [
                { title: 'إيرادات هذا الشهر', value: `${thisRev.toLocaleString('ar')} ر.س`, change: `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}%`, trend: revenueGrowth > 0 ? 'up' : 'down', color: '#10b981' },
                { title: 'المشاريع النشطة', value: activeProjects, change: 'جارية', trend: 'neutral', color: '#3b82f6' },
                { title: 'عملاء محتملون جدد', value: newLeads, change: 'هذا الشهر', trend: 'up', color: '#8b5cf6' },
                { title: 'متوسط قيمة الفاتورة', value: `${(avgInvoiceValue._avg.total || 0).toLocaleString('ar')} ر.س`, change: 'متوسط عام', trend: 'neutral', color: '#f59e0b' },
                { title: 'مهام مُغلقة هذا الشهر', value: completionRate._count.id, change: 'ميداني', trend: 'up', color: '#06b6d4' },
            ]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
