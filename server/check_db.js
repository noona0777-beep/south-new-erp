const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const count = await prisma.account.count();
        const roots = await prisma.account.findMany({
            where: { parentId: null },
            select: { name: true, code: true }
        });

        console.log('\n--- نتائج فحص النظام السحابي ---');
        console.log(`✅ حالة القاعدة: متصلة أونلاين`);
        console.log(`📊 إجمالي الحسابات: ${count}`);
        console.log('🌳 الحسابات الرئيسية المتاحة:');
        roots.forEach(r => console.log(`   - [${r.code}] ${r.name}`));

        if (count > 0) {
            console.log('\n✨ النتيجة: النظام جاهز ومستقر للعمليات المحاسبية.');
        } else {
            console.log('\n⚠️ النتيجة: شجرة الحسابات تحتاج إلى إعادة زراعة.');
        }
    } catch (e) {
        console.error('❌ خطأ في الاتصال:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
