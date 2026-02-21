require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding new modules data...');

    // 1. Get a partner and a product for references
    const partner = await prisma.partner.findFirst({ where: { type: 'CUSTOMER' } });
    const product = await prisma.product.findFirst();

    if (!partner || !product) {
        console.log('Master data (Partner/Product) missing. Please run main seed first.');
        return;
    }

    // 2. Seed Employees
    await prisma.employee.upsert({
        where: { employeeId: 'EMP-001' },
        update: {},
        create: {
            employeeId: 'EMP-001',
            name: 'أحمد المحمد',
            jobTitle: 'مهندس مدني',
            department: 'قسم الإنشاءات',
            salary: 12000,
            status: 'ACTIVE',
            joinDate: new Date('2023-01-01'),
        }
    });

    await prisma.employee.upsert({
        where: { employeeId: 'EMP-002' },
        update: {},
        create: {
            employeeId: 'EMP-002',
            name: 'سارة خالد',
            jobTitle: 'محاسبة',
            department: 'المالية',
            salary: 8500,
            status: 'ACTIVE',
            joinDate: new Date('2023-06-15'),
        }
    });

    // 3. Seed Quotes
    await prisma.quote.upsert({
        where: { quoteNumber: 'QT-2024-001' },
        update: {},
        create: {
            quoteNumber: 'QT-2024-001',
            partnerId: partner.id,
            status: 'SENT',
            subtotal: 5000,
            taxAmount: 750,
            total: 5750,
            items: {
                create: [
                    {
                        productId: product.id,
                        description: 'عرض سعر أولي لمواد البناء',
                        quantity: 10,
                        unitPrice: 500,
                        total: 5000
                    }
                ]
            }
        }
    });

    // 4. Seed Tasks for existing projects
    const project = await prisma.project.findFirst();
    if (project) {
        // Use createMany but wrapped in try/catch to avoid duplicates if rerun
        try {
            await prisma.task.createMany({
                data: [
                    {
                        title: 'تصميم المخططات الأولية',
                        status: 'DONE',
                        priority: 'HIGH',
                        projectId: project.id,
                        assignedTo: 'أحمد المحمد'
                    },
                    {
                        title: 'شراء مواد الأساسات',
                        status: 'IN_PROGRESS',
                        priority: 'MEDIUM',
                        projectId: project.id,
                        assignedTo: 'سارة خالد'
                    }
                ]
            });
        } catch (e) { console.log('Tasks already seeded or error'); }
    }

    // 5. Seed Real Estate
    const prop1 = await prisma.property.upsert({
        where: { code: 'PROP-001' },
        update: {},
        create: {
            code: 'PROP-001',
            name: 'مجمع التحلية السكني',
            type: 'RESIDENTIAL',
            address: 'جازان، حي التحلية'
        }
    });

    const unitsCount = await prisma.unit.count();
    if (unitsCount === 0) {
        const unit1 = await prisma.unit.create({
            data: {
                propertyId: prop1.id,
                unitNumber: 'A1',
                floor: 'الأرضي',
                type: 'APARTMENT',
                status: 'VACANT'
            }
        });

        const unit2 = await prisma.unit.create({
            data: {
                propertyId: prop1.id,
                unitNumber: 'S1',
                floor: 'الأرضي',
                type: 'STORE',
                status: 'OCCUPIED'
            }
        });

        await prisma.realEstateContract.create({
            data: {
                contractNumber: 'CONT-2024-001',
                unitId: unit2.id,
                tenantId: partner.id,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2025-01-01'),
                rentAmount: 25000,
                paymentFrequency: 'YEARLY',
                status: 'ACTIVE'
            }
        });
    }

    console.log('✅ Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
