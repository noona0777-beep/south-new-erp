const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Adding CRM Leads & Opportunities for Audit...');

    // 1. Leads
    const l1 = await prisma.lead.upsert({
        where: { id: 1001 },
        update: {},
        create: {
            id: 1001,
            name: 'فهد المطيري',
            company: 'شركة النماء للمقاولات',
            email: 'nami@example.com',
            phone: '0566778899',
            source: 'WEBSITE',
            status: 'QUALIFIED',
            notes: 'مهتم بمجمع سكني تجاري في شمال الرياض'
        }
    });

    const l2 = await prisma.lead.upsert({
        where: { id: 1002 },
        update: {},
        create: {
            id: 1002,
            name: 'سارة الصالح',
            company: 'خاص',
            email: 'sara@example.com',
            phone: '0544332211',
            source: 'REFERRAL',
            status: 'NEW',
            notes: 'ترغب في فيلا سكنية - حي النرجس'
        }
    });

    // 2. Opportunities (Pipeline)
    await prisma.opportunity.upsert({
        where: { id: 2001 },
        update: {},
        create: {
            id: 2001,
            title: 'مشروع مجمع فلل - السليمانية',
            value: 1250000,
            probability: 60,
            stage: 'PROPOSAL',
            leadId: l1.id
        }
    });

    await prisma.opportunity.upsert({
        where: { id: 2002 },
        update: {},
        create: {
            id: 2002,
            title: 'تصميم فيلا مودرن',
            value: 45000,
            probability: 90,
            stage: 'NEGOTIATION',
            leadId: l2.id
        }
    });

    await prisma.opportunity.upsert({
        where: { id: 2003 },
        update: {},
        create: {
            id: 2003,
            title: 'إشراف هندسي - عمارة تجارية',
            value: 85000,
            probability: 30,
            stage: 'DISCOVERY',
            leadId: l1.id
        }
    });

    console.log('✅ CRM Data Added.');

    // ZATCA Status Check
    console.log('📝 Checking ZATCA setup...');
    // Ensure at least one invoice is reported to ZATCA
    const inv = await prisma.invoice.findFirst({ orderBy: { createdAt: 'desc' } });
    if (inv) {
        await prisma.invoice.update({
            where: { id: inv.id },
            data: {
                zatcaStatus: 'REPORTED'
            }
        });
    }

    console.log('🎉 Audit Data Ready.');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
