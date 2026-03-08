const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
        datasources: {
            db: {
                url: "postgresql://postgres.amryuwnexsntzxjnhmxc:Shrahili%4007@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
            }
        }
    });
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

module.exports = prisma;
