const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true, role: true }
        });
        console.log("--- قائمة المستخدمين ---");
        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}
listUsers();
