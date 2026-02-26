const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tasks = await prisma.task.findMany({ include: { project: true } });
    console.log('Total Tasks in DB:', tasks.length);
    if (tasks.length > 0) {
        tasks.forEach(t => {
            console.log(`Task ID: ${t.id}, Project ID: ${t.projectId}, Status: ${t.status}`);
        });
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
