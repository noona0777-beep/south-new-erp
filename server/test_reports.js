const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testReports() {
    console.log('\n=== اختبار تقارير المحاسبة ===\n');

    // 1. Test balance sheet logic
    try {
        const accounts = await prisma.account.findMany({ orderBy: { code: 'asc' }, take: 5 });
        console.log(`✅ الحسابات موجودة: ${accounts.length} حساب`);

        const assets = accounts.filter(a => a.code?.startsWith('1'));
        const liabilities = accounts.filter(a => a.code?.startsWith('2'));
        const equity = accounts.filter(a => a.code?.startsWith('3'));
        console.log(`   أصول(1xx): ${assets.length} | التزامات(2xx): ${liabilities.length} | حقوق ملكية(3xx): ${equity.length}`);
    } catch (e) {
        console.error('❌ خطأ في الحسابات:', e.message);
    }

    // 2. Test journal entries
    try {
        const entries = await prisma.journalEntry.findMany({ take: 3, include: { transaction: true, account: true } });
        console.log(`\n✅ القيود المحاسبية: ${entries.length} قيد`);
        entries.forEach(e => {
            console.log(`   - ${e.account?.name}: مدين=${e.debit}, دائن=${e.credit}`);
        });
    } catch (e) {
        console.error('❌ خطأ في القيود:', e.message);
    }

    // 3. Test balance sheet calculation
    try {
        const now = new Date();
        const allAccounts = await prisma.account.findMany({ orderBy: { code: 'asc' } });
        const withBalance = await Promise.all(allAccounts.map(async (acc) => {
            const entries = await prisma.journalEntry.findMany({
                where: { accountId: acc.id, transaction: { date: { lte: now } } }
            });
            const debit = entries.reduce((s, e) => s + e.debit, 0);
            const credit = entries.reduce((s, e) => s + e.credit, 0);
            let balance = (acc.code?.startsWith('1') || acc.code?.startsWith('5'))
                ? debit - credit : credit - debit;
            return { ...acc, balance };
        }));

        const assets = withBalance.filter(a => a.code?.startsWith('1') && a.balance !== 0);
        const liabilities = withBalance.filter(a => a.code?.startsWith('2') && a.balance !== 0);
        const equity = withBalance.filter(a => a.code?.startsWith('3') && a.balance !== 0);

        console.log(`\n✅ الميزانية العمومية:`);
        console.log(`   إجمالي الأصول: ${assets.reduce((s, a) => s + a.balance, 0).toFixed(2)} ر.س (${assets.length} حساب)`);
        console.log(`   إجمالي الالتزامات: ${liabilities.reduce((s, a) => s + a.balance, 0).toFixed(2)} ر.س (${liabilities.length} حساب)`);
        console.log(`   إجمالي حقوق الملكية: ${equity.reduce((s, a) => s + a.balance, 0).toFixed(2)} ر.س (${equity.length} حساب)`);
    } catch (e) {
        console.error('❌ خطأ في حساب الميزانية:', e.message);
    }

    // 4. Test general ledger for first account with entries
    try {
        const firstAccount = await prisma.journalEntry.findFirst({
            include: { account: true }
        });
        if (firstAccount) {
            const entries = await prisma.journalEntry.findMany({
                where: { accountId: firstAccount.accountId },
                include: { transaction: true },
                orderBy: { transaction: { date: 'asc' } },
                take: 5
            });
            console.log(`\n✅ كشف الحساب - ${firstAccount.account?.name}:`);
            console.log(`   عدد الحركات: ${entries.length}`);
        } else {
            console.log('\n⚠️  لا توجد قيود محاسبية في قاعدة البيانات');
        }
    } catch (e) {
        console.error('❌ خطأ في كشف الحساب:', e.message);
    }

    await prisma.$disconnect();
    console.log('\n=== انتهى الاختبار ===\n');
}

testReports();
