require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
    console.log('🌱 Starting setup...');

    try {
        // 1. Ensure Admin User
        const existing = await prisma.user.findUnique({ where: { email: 'admin@south.com' } });
        if (!existing) {
            const hashedPassword = await bcrypt.hash('123456', 10);
            await prisma.user.create({
                data: { email: 'admin@south.com', password: hashedPassword, name: 'مدير النظام', role: 'ADMIN' }
            });
            console.log('✅ Admin user created.');
        } else {
            console.log('ℹ️  Admin user exists.');
        }

        // 2. Ensure Default Warehouse
        const warehouse = await prisma.warehouse.findFirst();
        if (!warehouse) {
            await prisma.warehouse.create({
                data: { name: 'المستودع الرئيسي', location: 'المقر الرئيسي - أحد المسارحة، جازان' }
            });
            console.log('✅ Default warehouse created.');
        } else {
            console.log(`ℹ️  Warehouse exists: ${warehouse.name}`);
        }

        console.log('\n🎉 Setup completed! System is ready.');
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
