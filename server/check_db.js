const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
    console.log("--- فحص قاعدة البيانات (Supabase) ---");
    try {
        await prisma.$connect();
        console.log("✅ تم الاتصال بقاعدة البيانات بنجاح!");

        const counts = {
            users: await prisma.user.count(),
            partners: await prisma.partner.count(),
            invoices: await prisma.invoice.count(),
            projects: await prisma.project.count(),
            settings: await prisma.settings.count(),
            documents: await prisma.document.count()
        };

        console.log("\n📊 ملخص البيانات الحالية:");
        console.log(`- عدد المستخدمين: ${counts.users}`);
        console.log(`- عدد العملاء: ${counts.partners}`);
        console.log(`- عدد الفواتير: ${counts.invoices}`);
        console.log(`- عدد المشاريع: ${counts.projects}`);
        console.log(`- عدد إعدادات النظام: ${counts.settings}`);
        console.log(`- عدد المستندات (الأرشيف): ${counts.documents}`);

        console.log("\n✅ قاعدة البيانات سليمة وجاهزة للاستخدام.");

    } catch (error) {
        console.error("❌ فشل الاتصال بقاعدة البيانات!");
        console.error("السبب:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
