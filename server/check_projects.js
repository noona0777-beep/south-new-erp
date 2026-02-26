const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const projects = await prisma.project.findMany();
    projects.forEach(p => console.log('Project ID:', p.id, 'Name:', p.name));
}
main().catch(console.error).finally(() => prisma.$disconnect());
