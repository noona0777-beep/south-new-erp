const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const res = await prisma.task.updateMany({
        where: { status: 'DONE' },
        data: { status: 'CLOSED' }
    });
    console.log(`Updated ${res.count} tasks from DONE to CLOSED`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
