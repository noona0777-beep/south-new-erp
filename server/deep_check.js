const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deepCheck() {
    console.log('--- فحص معمق للبيانات ---');
    try {
        const users = await prisma.user.findMany();
        console.log('--- Users ---');
        users.forEach(u => console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`));
        
        const partners = await prisma.partner.findMany({ take: 5 });
        console.log('\n--- Partners (Top 5) ---');
        partners.forEach(p => console.log(`ID: ${p.id}, Name: ${p.name}`));

        const projects = await prisma.project.findMany({ take: 5 });
        console.log('\n--- Projects (Top 5) ---');
        projects.forEach(p => console.log(`ID: ${p.id}, Name: ${p.name}`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

deepCheck();
