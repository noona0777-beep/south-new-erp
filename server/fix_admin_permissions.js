const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPermissions() {
    try {
        const user = await prisma.user.findFirst(); // جلب أول مستخدم (المدير)
        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    permissions: {
                        all: true,
                        dashboard: true,
                        invoices: true,
                        projects: true,
                        clients: true,
                        hr: true,
                        inventory: true,
                        accounting: true,
                        quotes: true,
                        contracts: true,
                        real_estate: true,
                        archive: true,
                        settings: true,
                        reports: true
                    }
                }
            });
            console.log('✅ تم تفعيل كافة الصلاحيات للحساب:', user.name);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
fixPermissions();
