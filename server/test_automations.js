const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runTests() {
    console.log('=== بدء اختبار الأتمتة والإشعارات الذكية ===\n');

    try {
        // 1. تجهيز بيانات المخزون المنخفض
        const cat = await prisma.category.findFirst() || await prisma.category.create({ data: { name: 'اختبار منخفض' } });
        const prod = await prisma.product.create({
            data: { name: 'منتج اختبار المخزون المنخفض', price: 100, cost: 50, categoryId: cat.id }
        });
        const wh = await prisma.warehouse.findFirst() || await prisma.warehouse.create({ data: { name: 'الرئيسي' } });
        await prisma.stock.create({
            data: { productId: prod.id, warehouseId: wh.id, quantity: 3 } // أقل من 10 (منخفض)
        });
        console.log('✅ تم إعداد منتج بمخزون منخفض (الكمية: 3)');

        // 2. تجهيز موظف للرواتب
        let emp = await prisma.employee.findFirst({ where: { status: 'ACTIVE' } });
        if (!emp) {
            emp = await prisma.employee.create({
                data: { employeeId: 'EMP-999', name: 'موظف تجربة الأتمتة', jobTitle: 'مهندس', salary: 5000, status: 'ACTIVE' }
            });
        }
        console.log('✅ تم توفير موظف لاختبار كشف الرواتب الجماعي');

        // 3. مسح الإشعارات القديمة لتتضح التجربة
        await prisma.notification.deleteMany({});

        // 4. استدعاء محرك الإشعارات (كما يفعل التطبيق كل فترة)
        const refreshRoutes = require('./src/routes/notifications');
        // We will just do a direct API call since the server is running on 5000
        await fetch('http://localhost:5000/api/notifications/refresh', { method: 'POST' }).catch(e => {});
        console.log('🔄 يتم توليد الإشعارات الذكية...');
        const lowStock = await prisma.stock.findMany({ where: { quantity: { lte: 10, gt: 0 } }, include: { product: true } });
        for (const s of lowStock) {
            await prisma.notification.create({
                data: { type: 'LOW_STOCK', title: '📦 مخزون منخفض', message: `المنتج "${s.product.name}" وصل إلى ${s.quantity} وحدات`, link: '/inventory' }
            });
        }

        // 5. تجربة الرواتب الجماعية 
        console.log('💸 جاري تشغيل كشف الرواتب الجماعي لهذا الشهر...');
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        // delete previous record if exists to allow testing
        await prisma.salaryRecord.deleteMany({ where: { month: currentMonth, year: currentYear } });
        
        const hrRoute = require('./src/routes/hr');
        const res = await fetch('http://localhost:5000/api/hr/payroll/run', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month: currentMonth, year: currentYear })
        });
        const data = await res.json();
        console.log(`✅ نتيجة مسير الرواتب: تم معالجة ${data.results?.filter(r=>r.status==='processed').length||0} موظف بإجمالي ${data.total||0} ريال`);

        // Check if journal entry created
        const je = await prisma.transaction.findFirst({
            where: { reference: { startsWith: `BULK-SAL-${currentMonth}-${currentYear}` } },
            include: { entries: { include: { account: true } } }
        });
        if (je) {
            console.log(`✅ القيد المحاسبي الآلي للأجور تم إنشاؤه بنجاح! رقم المرجع: ${je.reference}`);
            je.entries.forEach(e => console.log(`  - حساب (${e.account.code}): مدين=${e.debit}, دائن=${e.credit}`));
        } else {
            console.log('⚠️ لم يتم العثور على قيد المحاسبة للرواتب (تأكد من وجود حسابات 5101 و 1101)');
        }

        console.log('\n=== اكتملت تهيئة الاختبار بنجاح ===');

    } catch (e) {
        console.error('Test Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}
runTests();
