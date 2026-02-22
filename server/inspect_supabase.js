const { Client } = require('pg');

const connectionString = "postgresql://postgres:Shrahili%4007@db.amryuwnexsntzxjnhmxc.supabase.co:5432/postgres";

async function deepInspect() {
    const client = new Client({ connectionString });
    console.log("--- فحص عميق لقاعدة بيانات Supabase ---");

    try {
        await client.connect();
        console.log("✅ تم الاتصال بنجاح.");

        // 1. Check Tables and Relations
        console.log("\n🔍 1. التدقيق في الجداول والهيكل:");
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        const tables = tablesRes.rows.map(r => r.table_name);
        console.log(`- إجمالي الجداول الموجودة: ${tables.length}`);
        console.log(`- الجداول: ${tables.join(', ')}`);

        // 2. Check Specific Schema Integrity for Invoices & Documents
        console.log("\n🔍 2. فحص الحقول الهامة (Compliance & Archiving):");

        // Check Invoice table for qrCode
        const invoiceCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Invoice'");
        const hasQrCode = invoiceCols.rows.some(c => c.column_name === 'qrCode');
        console.log(`- حقل الـ QR Code في الفواتير: ${hasQrCode ? '✅ موجود' : '❌ مفقود (يحتاج تحديث)'}`);

        // Check Document table for new fields
        const docCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Document'");
        const hasDocFields = docCols.rows.some(c => c.column_name === 'fileUrl');
        console.log(`- هيكل جدول الأرشيف (Documents): ${hasDocFields ? '✅ مكتمل' : '❌ مفقود (يحتاج إنشاء)'}`);

        // 3. Data Integration Check
        console.log("\n🔍 3. فحص تكامل البيانات:");
        const companyInfo = await client.query("SELECT * FROM \"Settings\" WHERE key = 'companyInfo'");
        console.log(`- إعدادات الشركة: ${companyInfo.rows.length > 0 ? '✅ موجودة' : '⚠️ غير محددة بعد (سيتم استخدام الافتراضي)'}`);

        const adminUser = await client.query("SELECT email, role FROM \"User\" LIMIT 1");
        if (adminUser.rows.length > 0) {
            console.log(`- المستخدم المسؤول: ✅ ${adminUser.rows[0].email} (${adminUser.rows[0].role})`);
        } else {
            console.log("⚠️ تحذير: لا يوجد مستخدمين مسجلين!");
        }

        console.log("\n--- نتيجة الفحص النهائية ---");
        if (hasQrCode && hasDocFields) {
            console.log("🚀 القاعدة متوافقة تماماً مع آخر تحديثات الكود (ZATCA + Archive).");
        } else {
            console.log("⚠️ القاعدة تحتاج لمزامنة (Db Push) لتتوافق مع ميزات الـ QR والأرشيف.");
        }

    } catch (err) {
        console.error("❌ خطأ أثناء الفحص:", err.message);
    } finally {
        await client.end();
    }
}

deepInspect();
