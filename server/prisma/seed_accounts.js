const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 بدء زراعة شجرة الحسابات السعودية (SOCPA)...');

    const accounts = [
        // 1. الأصول (Assets)
        { code: '1', name: 'الأصول', type: 'ASSET' },
        { code: '11', name: 'الأصول المتداولة', type: 'ASSET', parentCode: '1' },
        { code: '1101', name: 'الصندوق (نقدية)', type: 'ASSET', parentCode: '11' },
        { code: '1102', name: 'البنك (الراجحي - رئيسي)', type: 'ASSET', parentCode: '11' },
        { code: '1103', name: 'العملاء (AR)', type: 'ASSET', parentCode: '11' },
        { code: '1104', name: 'المخزون السلعي', type: 'ASSET', parentCode: '11' },
        { code: '12', name: 'الأصول غير المتداولة', type: 'ASSET', parentCode: '1' },
        { code: '1201', name: 'المعدات والآلات', type: 'ASSET', parentCode: '12' },
        { code: '1202', name: 'السيارات والشاحنات', type: 'ASSET', parentCode: '12' },

        // 2. الخصوم (Liabilities)
        { code: '2', name: 'الخصوم', type: 'LIABILITY' },
        { code: '21', name: 'الخصوم المتداولة', type: 'LIABILITY', parentCode: '2' },
        { code: '2101', name: 'الموردون (AP)', type: 'LIABILITY', parentCode: '21' },
        { code: '2102', name: 'مصلحة الزكاة والضريبة', type: 'LIABILITY', parentCode: '21' },
        { code: '2103', name: 'رواتب مستحقة', type: 'LIABILITY', parentCode: '21' },

        // 3. حقوق الملكية (Equity)
        { code: '3', name: 'حقوق الملكية', type: 'EQUITY' },
        { code: '31', name: 'رأس المال المدوّن', type: 'EQUITY', parentCode: '3' },
        { code: '32', name: 'الأرباح والخسائر المبقاة', type: 'EQUITY', parentCode: '3' },

        // 4. الإيرادات (Revenue)
        { code: '4', name: 'الإيرادات', type: 'REVENUE' },
        { code: '41', name: 'إيرادات عقود المقاولات', type: 'REVENUE', parentCode: '4' },
        { code: '42', name: 'إيرادات مبيعات المتجر', type: 'REVENUE', parentCode: '4' },

        // 5. المصروفات (Expenses)
        { code: '5', name: 'المصروفات', type: 'EXPENSE' },
        { code: '51', name: 'المصاريف العمومية والإدارية', type: 'EXPENSE', parentCode: '5' },
        { code: '5101', name: 'رواتب وأجور موظفين', type: 'EXPENSE', parentCode: '51' },
        { code: '5102', name: 'إيجار المكاتب', type: 'EXPENSE', parentCode: '51' },
        { code: '5103', name: 'كهرباء ومياه وانترنت', type: 'EXPENSE', parentCode: '51' },
        { code: '52', name: 'تكاليف النشاط (COGS)', type: 'EXPENSE', parentCode: '5' },
    ];

    // Delete existing accounts to prevent duplicates in this seed
    await prisma.journalEntry.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.account.deleteMany({});

    // Map to keep track of created accounts for hierarchy
    const createdAccounts = {};

    for (const acc of accounts) {
        const parent = acc.parentCode ? createdAccounts[acc.parentCode] : null;

        const created = await prisma.account.create({
            data: {
                name: acc.name,
                code: acc.code,
                type: acc.type,
                parentId: parent ? parent.id : null,
                balance: 0.0
            }
        });

        createdAccounts[acc.code] = created;
    }

    console.log('✅ تم بنجاح إنشاء شجرة الحسابات المتكاملة أونلاين!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
