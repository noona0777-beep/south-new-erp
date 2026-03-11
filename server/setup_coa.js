const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    try {
        let parent1 = await prisma.account.findFirst({ where: { code: '11' } }) || await prisma.account.create({ data: { code: '11', name: 'الأصول المتداولة', type: 'ASSET' } });
        await prisma.account.upsert({
            where: { code: '1101' },
            update: {},
            create: { code: '1101', name: 'الصندوق (نقدية)', type: 'ASSET', parentId: parent1.id }
        });
        
        let parent5 = await prisma.account.findFirst({ where: { code: '51' } }) || await prisma.account.create({ data: { code: '51', name: 'المصروفات التشغيلية', type: 'EXPENSE' } });
        await prisma.account.upsert({
            where: { code: '5101' },
            update: {},
            create: { code: '5101', name: 'الرواتب والأجور', type: 'EXPENSE', parentId: parent5.id }
        });
        console.log('✅ تم تصحيح الدليل المحاسبي وإضافة حساب النقدية والرواتب');
    } catch(e) { console.error('Error:', e.message); }
    finally { await prisma.$disconnect(); }
}
run();
