require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Seeding...');

    // Create Admin User if not exists
    const hashedPassword = await bcrypt.hash('123456', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@south.com' },
        update: {},
        create: {
            email: 'admin@south.com',
            name: 'المدير العام',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log('✅ Admin user created:', admin.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
