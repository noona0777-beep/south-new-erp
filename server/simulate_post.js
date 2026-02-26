const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const data = {
        title: 'test error',
        description: '',
        type: 'FIELD',
        phase: 'FOUNDATION',
        sbcClause: '',
        riskLevel: 'LOW',
        dueDate: '',
        engineerId: '',
        gpsLocation: '',
        status: 'NEW',
        projectId: '2'
    };

    // Simulate what fieldOps.js does
    const taskNumber = `TSK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
        const task = await prisma.task.create({
            data: {
                taskNumber,
                title: data.title,
                description: data.description,
                type: data.type || 'OFFICE',
                phase: data.phase,
                sbcClause: data.sbcClause,
                riskLevel: data.riskLevel || 'LOW',
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                projectId: data.projectId ? parseInt(data.projectId) : null,
                engineerId: data.engineerId ? parseInt(data.engineerId) : null,
                engineerNotes: data.engineerNotes,
                gpsLocation: data.gpsLocation,
                status: data.status || 'NEW'
            }
        });
        console.log("Task created successfully:", task);
    } catch (e) {
        console.error("Prisma error:", e.message);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
