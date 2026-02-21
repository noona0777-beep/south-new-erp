const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createOpeningEntry() {
    console.log('🚀 جاري إنشاء القيد الافتتاحي (إثبات رأس المال) في السحابة...');

    try {
        // 1. العثور على الحسابات المطلوبة
        const bankAccount = await prisma.account.findUnique({ where: { code: '1102' } }); // البنك
        const equityAccount = await prisma.account.findUnique({ where: { code: '31' } }); // رأس المال

        if (!bankAccount || !equityAccount) {
            throw new Error('لم يتم العثور على الحسابات المطلوبة (البنك أو رأس المال).');
        }

        const amount = 100000.0; // 100 ألف ريال

        // 2. إنشاء المعاملة والقيود بتنسيق Double-Entry
        const result = await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    date: new Date(),
                    description: 'القيد الافتتاحي - إثبات رأس المال في البنك',
                    reference: 'JV-0001',
                    type: 'JOURNAL',
                    entries: {
                        create: [
                            {
                                accountId: bankAccount.id,
                                debit: amount,
                                credit: 0,
                                description: 'إيداع رأس مال في البنك'
                            },
                            {
                                accountId: equityAccount.id,
                                debit: 0,
                                credit: amount,
                                description: 'إثبات رأس مال المؤسسة'
                            }
                        ]
                    }
                }
            });

            // 3. تحديث أرصدة الحسابات
            // البنك: مدين (+)
            await tx.account.update({
                where: { id: bankAccount.id },
                data: { balance: { increment: amount } }
            });

            // رأس المال: دائن (-) في المحاسبة حقوق الملكية تزيد بالدائن
            // لكن في نظامنا، سنخزنها كفرق (مدين - دائن)
            await tx.account.update({
                where: { id: equityAccount.id },
                data: { balance: { increment: -amount } }
            });

            return transaction;
        });

        console.log('✅ تم إنشاء القيد بنجاح وتحديث الأرصدة أونلاين!');
        console.log(`📝 المرجع: ${result.reference}`);
    } catch (error) {
        console.error('❌ فشل إنشاء القيد:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createOpeningEntry();
