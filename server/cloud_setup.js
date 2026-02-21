/* 
  Cloud Setup Script (South New System)
  ------------------------------------
  This script will:
  1. Synchronize the schema with the cloud database.
  2. Create/update the Admin user (admin@south.com) with password (123456).
*/

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Direct connect URL (provided by user for Supabase)
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function setup() {
    console.log('🚀 Starting Cloud Database Setup...');

    try {
        // 1. Test Connection
        await prisma.$connect();
        console.log('✅ Connected to Cloud Database.');

        // 2. Clear/Update Admin User
        const adminEmail = 'admin@south.com';
        const hashedPassword = await bcrypt.hash('123456', 10);

        const user = await prisma.user.upsert({
            where: { email: adminEmail },
            update: {
                password: hashedPassword,
                name: 'مدير النظام',
                role: 'ADMIN'
            },
            create: {
                email: adminEmail,
                password: hashedPassword,
                name: 'مدير النظام',
                role: 'ADMIN'
            }
        });

        console.log(`✅ Admin User Ready: ${user.email}`);
        console.log('--- SETUP COMPLETE ---');
        console.log('Now you can try logging into the online system.');

    } catch (error) {
        console.error('❌ Setup Failed:', error);
        console.log('\nTIP: Make sure your DATABASE_URL is correct and you can reach Supabase.');
    } finally {
        await prisma.$disconnect();
    }
}

setup();
