const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Demo Data Seeding...');

    // 1. Create Admins and Engineers
    const hashedPassword = await bcrypt.hash('123456', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@south.com' },
        update: {},
        create: {
            email: 'admin@south.com',
            name: 'مدير النظام',
            password: hashedPassword,
            role: 'ADMIN',
            phone: '0500000000'
        }
    });

    const eng1 = await prisma.employee.upsert({
        where: { employeeId: 'ENG-001' },
        update: {},
        create: {
            employeeId: 'ENG-001',
            name: 'م. أحمد صالح',
            jobTitle: 'مهندس موقع',
            department: 'الإشراف الميداني',
            salary: 8000,
            phone: '0501111111'
        }
    });

    const eng2 = await prisma.employee.upsert({
        where: { employeeId: 'ENG-002' },
        update: {},
        create: {
            employeeId: 'ENG-002',
            name: 'م. فهد عبدالله',
            jobTitle: 'مدير مشاريع',
            department: 'الإدارة الهندسية',
            salary: 12000,
            phone: '0502222222'
        }
    });
    console.log('✅ Created Employees');

    // 2. Create Clients (Partners)
    const clientPassword = await bcrypt.hash('client123', 10);
    const client1 = await prisma.partner.upsert({
        where: { id: 99991 }, // Just checking by ID or we can use phone. better to not use id for matching if auto inc
        update: {},
        create: {
            name: 'مؤسسة الأفق العقارية',
            type: 'CLIENT',
            phone: '0500000781',
            email: 'horizon@example.com',
            password: clientPassword,
            balance: 0,
        }
    }).catch(async () => {
        // fallback if it exists by another mean, just create normally
        return prisma.partner.create({
            data: {
                name: 'مؤسسة الأفق العقارية',
                type: 'CLIENT',
                phone: `050000078${Math.floor(Math.random() * 10)}`, // avoid unique clash
                email: `horizon_${Math.floor(Math.random() * 1000)}@example.com`,
                password: clientPassword,
                balance: 0,
            }
        })
    });

    const client2 = await prisma.partner.create({
        data: {
            name: 'شركة سكن الحديثة',
            type: 'CLIENT',
            phone: `053333333${Math.floor(Math.random() * 10)}`,
            email: `sakan_${Math.floor(Math.random() * 1000)}@example.com`,
            password: clientPassword,
            balance: 15000, // They owe some money
        }
    });
    console.log('✅ Created Clients');

    // 3. Create Projects
    const project1 = await prisma.project.create({
        data: {
            name: 'مجمع الأفق السكني',
            description: 'إنشاء 10 فلل متصلة وتسليم مفتاح',
            location: 'الرياض - حي الياسمين',
            status: 'IN_PROGRESS',
            startDate: new Date('2025-10-01'),
            clientId: client1.id,
            contractValue: 5000000,
        }
    });

    const project2 = await prisma.project.create({
        data: {
            name: 'فيلا سكنية - الملقا',
            description: 'أعمال عظم ومباني',
            location: 'الرياض - حي الملقا',
            status: 'PLANNED',
            startDate: new Date('2026-04-01'),
            clientId: client2.id,
            contractValue: 850000,
        }
    });
    console.log('✅ Created Projects');

    // 4. Create Field Operations Tasks
    const task1 = await prisma.task.create({
        data: {
            title: 'صب خرسانة سقف الملحق',
            taskNumber: `TSK-${Math.floor(Math.random() * 10000)}`,
            description: 'التأكد من التمديدات والميول قبل الصب',
            type: 'FIELD',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            phase: 'STRUCTURE',
            riskLevel: 'MEDIUM',
            projectId: project1.id,
            engineerId: eng1.id,
        }
    });

    const task2 = await prisma.task.create({
        data: {
            title: 'تأسيس السباكة والكهرباء الدور الأول',
            taskNumber: `TSK-${Math.floor(Math.random() * 10000)}`,
            description: 'مطابقة المخطط الهندسي',
            type: 'FIELD',
            status: 'CLOSED',
            priority: 'MEDIUM',
            phase: 'MECHANICAL',
            riskLevel: 'LOW',
            projectId: project1.id,
            engineerId: eng2.id,
            dueDate: new Date(),
        }
    });
    console.log('✅ Created Field Tasks');

    // 5. Create AI Reports & Site Visits for Tasks
    await prisma.aIReport.create({
        data: {
            taskId: task2.id,
            imageUrl: 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80',
            analysisResult: {
                summary: "تم تحليل الصورة بنجاح وتطابق المخططات.",
                safety: "Good"
            },
            progressExtracted: 85,
            sbcViolations: "لا توجد أي مخالفات لكود البناء السعودي.",
        }
    });

    await prisma.siteVisit.create({
        data: {
            projectId: project1.id,
            engineerId: eng1.id,
            date: new Date(),
            notes: "تمت زيارة الموقع والتأكد من تواجد المقاول والعمالة وبدء أعمال الشدة الخشبية.",
        }
    });
    console.log('✅ Created Technical Reports & Visits');

    // 6. Create Invoices
    await prisma.invoice.create({
        data: {
            invoiceNumber: `INV-${Date.now()}-1`,
            uuid: Math.random().toString(36).substring(7),
            type: 'SALES',
            status: 'PAID',
            partnerId: client1.id,
            projectId: project1.id,
            subtotal: 100000,
            taxAmount: 15000,
            total: 115000,
            items: {
                create: [
                    { description: 'الدفعة الأولى المتفق عليها', quantity: 1, unitPrice: 100000, total: 100000 }
                ]
            }
        }
    });

    await prisma.invoice.create({
        data: {
            invoiceNumber: `INV-${Date.now()}-2`,
            uuid: Math.random().toString(36).substring(7),
            type: 'SALES',
            status: 'UNPAID',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
            partnerId: client2.id,
            projectId: project2.id,
            subtotal: 50000,
            taxAmount: 7500,
            total: 57500,
            items: {
                create: [
                    { description: 'أعمال حفر القواعد', quantity: 1, unitPrice: 50000, total: 50000 }
                ]
            }
        }
    });
    console.log('✅ Created Invoices');

    console.log('🎉 Seeding finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
