const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function auditSystem() {
    console.log("--- تقرير تدقيق جهوزية الأنظمة (Cloud Audit) ---");

    const results = [];

    const check = async (name, model) => {
        try {
            const count = await prisma[model].count();
            results.push({ name, status: 'YES', count });
        } catch (e) {
            results.push({ name, status: 'NO', error: e.message });
        }
    };

    await check("المبيعات والفواتير", "invoice");
    await check("عروض الأسعار", "quote");
    await check("المخازن والمستودعات", "product");
    await check("العملاء", "partner");
    await check("إدارة المشاريع", "project");
    await check("العقارات", "property");
    await check("المحاسبة المالية", "account");
    await check("الموارد البشرية", "employee");
    await check("الأرشيف والوثائق", "document");
    await check("لوحة زاتكا", "invoice"); // Uses invoice table

    console.table(results);

    // Check specific critical fields for ZATCA
    try {
        const inv = await prisma.invoice.findFirst();
        if (inv && 'qrCode' in inv) {
            console.log("\n✅ ميزة الـ QR Code والربط متوفرة في قاعدة البيانات.");
        } else {
            console.log("\n⚠️ تحذير: حقول زاتكا (QR/XML) مفقودة في قاعدة البيانات الحالية.");
        }
    } catch (e) { }

    await prisma.$disconnect();
}

auditSystem();
