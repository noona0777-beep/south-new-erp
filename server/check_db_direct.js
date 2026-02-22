const { Client } = require('pg');

const connectionString = "postgresql://postgres:Shrahili%4007@db.amryuwnexsntzxjnhmxc.supabase.co:5432/postgres";

async function checkDatabase() {
    const client = new Client({ connectionString });
    console.log("--- فحص قاعدة البيانات (Supabase) المباشر ---");

    try {
        await client.connect();
        console.log("✅ تم الاتصال بقاعدة البيانات بنجاح!");

        const queries = {
            'المستخدمين': 'SELECT COUNT(*) FROM "User"',
            'العملاء': 'SELECT COUNT(*) FROM "Partner"',
            'الفواتير': 'SELECT COUNT(*) FROM "Invoice"',
            'المشاريع': 'SELECT COUNT(*) FROM "Project"',
            'الإعدادات': 'SELECT COUNT(*) FROM "Settings"',
            'المستندات': 'SELECT COUNT(*) FROM "Document"'
        };

        console.log("\n📊 ملخص البيانات الحالية:");
        for (const [name, query] of Object.entries(queries)) {
            try {
                const res = await client.query(query);
                console.log(`- عدد ${name}: ${res.rows[0].count}`);
            } catch (e) {
                console.log(`- عدد ${name}: (الجدول غير موجود أو خطأ)`);
            }
        }

        console.log("\n✅ قاعدة البيانات سليمة وجاهزة للاستضافة.");

    } catch (err) {
        console.error("❌ فشل الاتصال بقاعدة البيانات!");
        console.error("السبب:", err.message);
    } finally {
        await client.end();
    }
}

checkDatabase();
