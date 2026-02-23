const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const clients = await prisma.partner.findMany({
            where: { vatNumber: 'لا يوجد' }
        });
        console.log('Clients with VAT "لا يوجد":', clients.length);
        clients.forEach(c => console.log(`- ${c.name} (ID: ${c.id})`));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
