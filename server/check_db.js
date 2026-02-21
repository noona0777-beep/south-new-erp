const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log('\n══════════════════════════════════');
    console.log('  🔍 فحص قاعدة البيانات');
    console.log('══════════════════════════════════\n');

    const warehouses = await prisma.warehouse.count();
    const categories = await prisma.category.count();
    const products = await prisma.product.count();
    const partners = await prisma.partner.count();
    const users = await prisma.user.count();
    const invoices = await prisma.invoice.count();
    const quotes = await prisma.quote.count();

    console.log('🏭 المستودعات    :', warehouses);
    console.log('📦 الأقسام       :', categories);
    console.log('🛒 المنتجات      :', products);
    console.log('👥 العملاء/شركاء :', partners);
    console.log('👤 المستخدمون    :', users);
    console.log('🧾 الفواتير      :', invoices);
    console.log('📄 عروض الأسعار  :', quotes);

    console.log('\n══════════════════════════════════');
    if (warehouses === 0 && categories === 0 && products === 0) {
        console.log('⚠️  قاعدة البيانات فارغة - يجب تشغيل seed');
        console.log('   شغّل: node seed_categories.js');
    } else {
        console.log('✅ قاعدة البيانات تحتوي على بيانات');
    }
    console.log('══════════════════════════════════\n');

    await prisma.$disconnect();
}

check().catch(e => {
    console.error('❌ خطأ:', e.message);
    process.exit(1);
});
