const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Products & Partners...');

    // Create Customer
    const customer = await prisma.partner.create({
        data: {
            name: 'مؤسسة المقاولات الأولى',
            type: 'CUSTOMER',
            vatNumber: '310123456700003',
            address: 'الرياض - حي الملز',
            phone: '0505123456',
        }
    });

    // Create Warehouse
    const warehouse = await prisma.warehouse.create({
        data: { name: 'المستودع الرئيسي', location: 'أحد المسارحة' }
    });

    // Create Products
    const p1 = await prisma.product.create({
        data: {
            name: 'أسمنت بورتلاندي (كيس 50 كجم)',
            price: 18.50,
            cost: 14.00,
            stocks: { create: { warehouseId: warehouse.id, quantity: 500 } }
        }
    });

    const p2 = await prisma.product.create({
        data: {
            name: 'حديد تسليح 12مم (طن)',
            price: 2800.00,
            cost: 2650.00,
            stocks: { create: { warehouseId: warehouse.id, quantity: 50 } }
        }
    });

    const p3 = await prisma.product.create({
        data: {
            name: 'طوب أحمر 20x40',
            price: 2.50,
            cost: 1.80,
            stocks: { create: { warehouseId: warehouse.id, quantity: 10000 } }
        }
    });

    console.log('✅ Created:', customer.name, p1.name, p2.name);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
