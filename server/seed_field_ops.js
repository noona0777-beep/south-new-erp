const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- البدأ بحقن البيانات التجريبية للعمليات الميدانية ---');

    // 1. Ensure at least one Partner (Client)
    let client = await prisma.partner.findFirst({ where: { type: 'CUSTOMER' } });
    if (!client) {
        client = await prisma.partner.create({
            data: { name: 'شركة أعمار الحديثة للتطوير', type: 'CUSTOMER', phone: '0501234567' }
        });
        console.log('تم إنشاء عميل جديد:', client.name);
    }

    // 2. Ensure at least one Project
    let project = await prisma.project.findFirst();
    if (!project) {
        project = await prisma.project.create({
            data: {
                name: 'مشروع إنشاء برج سكني بالياسمين',
                clientId: client.id,
                status: 'IN_PROGRESS',
                location: 'الرياض, حي الياسمين',
                contractValue: 5000000,
            }
        });
        console.log('تم إنشاء مشروع جديد:', project.name);
    }

    // 3. Ensure at least two Engineers (Employees)
    let eng1 = await prisma.employee.findFirst({ where: { jobTitle: 'مهندس مدني' } });
    if (!eng1) {
        eng1 = await prisma.employee.create({
            data: { employeeId: 'E-CIV-001', name: 'م. أحمد خالد', jobTitle: 'مهندس مدني', salary: 12000, department: 'المشاريع' }
        });
    }
    let eng2 = await prisma.employee.findFirst({ where: { jobTitle: 'مهندس معماري' } });
    if (!eng2) {
        eng2 = await prisma.employee.create({
            data: { employeeId: 'E-ARC-002', name: 'م. فهد عبدالله', jobTitle: 'مهندس معماري', salary: 11000, department: 'المشاريع' }
        });
    }
    console.log('تم جلب/إنشاء المهندسين للعمليات.');

    // 4. Create dummy Field Tasks
    const phaseList = ['FOUNDATION', 'STRUCTURE', 'ISOLATION', 'FINISHING', 'ELECTRICAL', 'MECHANICAL', 'ARCHITECTURAL'];
    console.log('جاري إنشاء مهام ميدانية...');
    const t1 = await prisma.task.upsert({
        where: { taskNumber: 'TSK-2024-0001' },
        update: {},
        create: {
            taskNumber: 'TSK-2024-0001', title: 'فحص استلام حديد تسليح القواعد', description: 'التأكد من أقطار الحديد والمسافات حسب المخطط المعتمد',
            type: 'FIELD', phase: 'FOUNDATION', sbcClause: 'SBC-304', riskLevel: 'CRITICAL', status: 'IN_PROGRESS',
            projectId: project.id, engineerId: eng1.id, dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
            measurements: { Cover: '7.5 cm', BarDiameter: '16 mm' }, gpsLocation: '14.542, 45.2312'
        }
    });

    const t2 = await prisma.task.upsert({
        where: { taskNumber: 'TSK-2024-0002' },
        update: {},
        create: {
            taskNumber: 'TSK-2024-0002', title: 'استلام صبة الميد', description: 'فحص الخرسانة المتصلدة وأخذ العينات القياسية',
            type: 'FIELD', phase: 'STRUCTURE', sbcClause: 'SBC-301', riskLevel: 'MEDIUM', status: 'CLOSED',
            projectId: project.id, engineerId: eng2.id, dueDate: new Date(),
            measurements: { Slump: '12 cm', CompressiveStrength: '35 MPa' }
        }
    });

    const t3 = await prisma.task.upsert({
        where: { taskNumber: 'TSK-2024-0003' },
        update: {},
        create: {
            taskNumber: 'TSK-2024-0003', title: 'اعتماد عينة البلاط الأرضي', description: 'التأكد من السماكة واللون والمعالجة حسب العقد',
            type: 'OFFICE', phase: 'FINISHING', riskLevel: 'LOW', status: 'PENDING_CLOSURE',
            projectId: project.id, engineerId: eng2.id, dueDate: new Date(new Date().setDate(new Date().getDate() - 1))
        }
    });

    // 5. Create Tickets and Risks
    console.log('جاري إنشاء ملاحظات وتذاكر...');
    await prisma.ticket.create({ data: { taskId: t1.id, title: 'نقص في بسكوت الحماية', description: 'لوحظ نقص في بسكوت الغطاء الخرساني في الجهة الغربية.', status: 'OPEN' } });
    await prisma.risk.create({ data: { taskId: t1.id, description: 'احتمالية عدم تحقيق الغطاء الخرساني المطلوب مما يؤدي للصدأ.', severity: 'CRITICAL', mitigationPlan: 'طلب زيادة البسكوت لحين الاستلام النهائي.' } });

    // 6. Create AI Reports
    console.log('جاري إنشاء تقارير AI...');
    await prisma.aIReport.create({
        data: {
            taskId: t2.id, imageUrl: 'https://images.unsplash.com/photo-1541888081-344c9b9cb7b0',
            analysisResult: { cracksDetected: false, anomalies: ["توزيع الحديد يحتاج دقة أكبر"] },
            progressExtracted: 15.5, sbcViolations: 'لا توجد مخالفات حرجة.'
        }
    });

    // 7. Site Visits
    console.log('جاري إنشاء زيارات...');
    await prisma.siteVisit.create({
        data: { projectId: project.id, engineerId: eng1.id, notes: 'زيارة تفقدية عامة لموقع العمل. العمالة متواجدة والتقدم جيد.', gpsLocation: '14.542, 45.2312' }
    });

    // 8. Engineer Scores
    console.log('توليد تقييم المهندسين...');
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    await prisma.engineerScore.upsert({
        where: { engineerId_month_year: { engineerId: eng1.id, month: currentMonth, year: currentYear } },
        update: {},
        create: { engineerId: eng1.id, month: currentMonth, year: currentYear, tasksCompletedScore: 85, closureSpeedScore: 90, reportQualityScore: 80, aiAccuracyScore: 88, attendanceScore: 100, finalScore: 87.85 }
    });

    await prisma.engineerScore.upsert({
        where: { engineerId_month_year: { engineerId: eng2.id, month: currentMonth, year: currentYear } },
        update: {},
        create: { engineerId: eng2.id, month: currentMonth, year: currentYear, tasksCompletedScore: 95, closureSpeedScore: 85, reportQualityScore: 92, aiAccuracyScore: 90, attendanceScore: 90, finalScore: 90.65 }
    });

    console.log('✅ اكتمل حقن البيانات التجريبية بنجاح!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
