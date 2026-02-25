const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.user.updateMany({
        where: { email: 'admin@south.com' },
        data: { phone: '0503777963' }
    });
    console.log('Update result:', result);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
