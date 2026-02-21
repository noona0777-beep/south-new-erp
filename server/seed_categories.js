/**
 * seed_categories.js
 * يضيف 7 أقسام + منتجات واقعية بأسعار سوق جازان المحلية
 * تشغيل:  node seed_categories.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════
// الأقسام السبعة
// ═══════════════════════════════════════════════════════
const CATEGORIES = [
    { name: 'مواد التشطيب', description: 'بلاط وسيراميك ورخام وبورسلان وباركيه' },
    { name: 'مواد إنشائية', description: 'أسمنت وحديد تسليح وبلوك وطوب ورمل وحصى' },
    { name: 'مواد ديكور', description: 'ورق جدران وألواح PVC وحجر صناعي وجبس ديكوري' },
    { name: 'مواد سباكة', description: 'أنابيب PVC وPPR وصمامات وخزانات ومضخات' },
    { name: 'مواد كهرباء', description: 'كابلات ومفاتيح وإضاءة وألواح تحكم' },
    { name: 'كماليات', description: 'مسامير وأدوات يدوية وشرائط وصواريخ' },
    { name: 'أخرى', description: 'عزل مائي وحراري ومواد متنوعة' },
];

// ═══════════════════════════════════════════════════════
// المنتجات (cat = اسم القسم، أسعار بالريال السعودي)
// ═══════════════════════════════════════════════════════
const PRODUCTS = [

    // ── مواد التشطيب ──────────────────────────────────
    { cat: 'مواد التشطيب', name: 'بلاط أرضي فاخر 60×60 سم - م²', cost: 60, price: 90, qty: 400 },
    { cat: 'مواد التشطيب', name: 'بلاط أرضي عادي 40×40 سم - م²', cost: 38, price: 58, qty: 500 },
    { cat: 'مواد التشطيب', name: 'بلاط حائط 30×60 سم - م²', cost: 48, price: 70, qty: 350 },
    { cat: 'مواد التشطيب', name: 'سيراميك حمام 25×40 سم - م²', cost: 42, price: 65, qty: 300 },
    { cat: 'مواد التشطيب', name: 'بورسلان 80×80 سم - م²', cost: 100, price: 150, qty: 200 },
    { cat: 'مواد التشطيب', name: 'رخام طبيعي أبيض - م²', cost: 160, price: 240, qty: 80 },
    { cat: 'مواد التشطيب', name: 'موزاييك رخام مزخرف - م²', cost: 130, price: 190, qty: 60 },
    { cat: 'مواد التشطيب', name: 'باركيه لاميناتي HDF - م²', cost: 68, price: 100, qty: 200 },
    { cat: 'مواد التشطيب', name: 'غراء سيراميك أبيض - كيس 25 كجم', cost: 20, price: 30, qty: 350 },
    { cat: 'مواد التشطيب', name: 'فيوجات سيراميك ملونة - كيس 5 كجم', cost: 24, price: 35, qty: 200 },
    { cat: 'مواد التشطيب', name: 'جص جداري ناعم - كيس 25 كجم', cost: 20, price: 28, qty: 250 },
    { cat: 'مواد التشطيب', name: 'ملاط جاهز ألوان - كيس 25 كجم', cost: 28, price: 40, qty: 150 },
    { cat: 'مواد التشطيب', name: 'رمل ناعم للياسة - م³', cost: 70, price: 100, qty: 100 },

    // ── مواد إنشائية ──────────────────────────────────
    { cat: 'مواد إنشائية', name: 'أسمنت بورتلاندي - كيس 50 كجم', cost: 15, price: 20, qty: 600 },
    { cat: 'مواد إنشائية', name: 'أسمنت مقاوم كبريتات - كيس 50 كجم', cost: 22, price: 28, qty: 300 },
    { cat: 'مواد إنشائية', name: 'أسمنت أبيض - كيس 50 كجم', cost: 24, price: 32, qty: 200 },
    { cat: 'مواد إنشائية', name: 'جبس بناء - كيس 40 كجم', cost: 13, price: 18, qty: 300 },
    { cat: 'مواد إنشائية', name: 'مونة بناء جاهزة - كيس 50 كجم', cost: 18, price: 25, qty: 220 },
    { cat: 'مواد إنشائية', name: 'حديد تسليح 10 مم - طن', cost: 2900, price: 3400, qty: 30 },
    { cat: 'مواد إنشائية', name: 'حديد تسليح 12 مم - طن', cost: 2950, price: 3450, qty: 30 },
    { cat: 'مواد إنشائية', name: 'حديد تسليح 16 مم - طن', cost: 3000, price: 3500, qty: 25 },
    { cat: 'مواد إنشائية', name: 'حديد تسليح 20 مم - طن', cost: 3050, price: 3600, qty: 20 },
    { cat: 'مواد إنشائية', name: 'بلوك خرساني 20×20×40 - حبة', cost: 2.8, price: 4.0, qty: 4000 },
    { cat: 'مواد إنشائية', name: 'بلوك خرساني 15×20×40 - حبة', cost: 2.2, price: 3.2, qty: 3000 },
    { cat: 'مواد إنشائية', name: 'طوب أحمر مزوي - 1000 حبة', cost: 340, price: 450, qty: 80 },
    { cat: 'مواد إنشائية', name: 'رمل بناء - م³', cost: 60, price: 90, qty: 200 },
    { cat: 'مواد إنشائية', name: 'حصى مدحول 1-3 - م³', cost: 80, price: 120, qty: 120 },
    { cat: 'مواد إنشائية', name: 'سلك رباط حديد - كيلو', cost: 9, price: 14, qty: 300 },
    { cat: 'مواد إنشائية', name: 'أنابيب حديد مربع 50×50 - متر', cost: 50, price: 72, qty: 150 },
    { cat: 'مواد إنشائية', name: 'صفائح حديد مجلفن 1 مم - رول', cost: 130, price: 175, qty: 60 },

    // ── مواد ديكور ────────────────────────────────────
    { cat: 'مواد ديكور', name: 'ورق جدران فيلدا - رول', cost: 50, price: 78, qty: 100 },
    { cat: 'مواد ديكور', name: 'ألواح PVC جداري ديكوري - م²', cost: 38, price: 60, qty: 250 },
    { cat: 'مواد ديكور', name: 'حجر صناعي للواجهات - م²', cost: 90, price: 140, qty: 120 },
    { cat: 'مواد ديكور', name: 'سقف جبس مزخرف - م²', cost: 100, price: 150, qty: 80 },
    { cat: 'مواد ديكور', name: 'لوح جبس بورد ديكوري 12 مم', cost: 30, price: 45, qty: 200 },
    { cat: 'مواد ديكور', name: 'ألمنيوم كومبوند 3 مم - م²', cost: 130, price: 190, qty: 100 },
    { cat: 'مواد ديكور', name: 'مرايا ديكورية - م²', cost: 120, price: 180, qty: 40 },
    { cat: 'مواد ديكور', name: 'شرائح خشب ديكور داكن - م²', cost: 80, price: 125, qty: 60 },
    { cat: 'مواد ديكور', name: 'ألواح ساندوتش ديكوري 5 سم - م²', cost: 90, price: 135, qty: 80 },
    { cat: 'مواد ديكور', name: 'دهان بلاستيك داخلي أبيض - 18 لتر', cost: 100, price: 145, qty: 70 },
    { cat: 'مواد ديكور', name: 'دهان بلاستيك خارجي - 18 لتر', cost: 135, price: 190, qty: 50 },
    { cat: 'مواد ديكور', name: 'بوية زيتية لامعة - 4 لتر', cost: 70, price: 100, qty: 80 },
    { cat: 'مواد ديكور', name: 'دهان أساس بروفايلر - 18 لتر', cost: 80, price: 115, qty: 70 },
    { cat: 'مواد ديكور', name: 'معجون تسوية جداري - 20 كجم', cost: 60, price: 85, qty: 100 },

    // ── مواد سباكة ────────────────────────────────────
    { cat: 'مواد سباكة', name: 'أنبوب PVC 110 مم - 6 متر', cost: 48, price: 70, qty: 120 },
    { cat: 'مواد سباكة', name: 'أنبوب PVC 75 مم - 6 متر', cost: 32, price: 50, qty: 150 },
    { cat: 'مواد سباكة', name: 'أنبوب PVC 50 مم - 6 متر', cost: 20, price: 32, qty: 180 },
    { cat: 'مواد سباكة', name: 'أنبوب PPR 20 مم - 4 متر', cost: 13, price: 20, qty: 250 },
    { cat: 'مواد سباكة', name: 'أنبوب PPR 25 مم - 4 متر', cost: 18, price: 27, qty: 200 },
    { cat: 'مواد سباكة', name: 'أنبوب PPR 32 مم - 4 متر', cost: 26, price: 40, qty: 150 },
    { cat: 'مواد سباكة', name: 'وصلة PVC كوع 90° 110 مم', cost: 9, price: 15, qty: 150 },
    { cat: 'مواد سباكة', name: 'صمام تحكم نحاس بوصة', cost: 38, price: 60, qty: 80 },
    { cat: 'مواد سباكة', name: 'صمام تحكم بوصة ونصف', cost: 55, price: 85, qty: 50 },
    { cat: 'مواد سباكة', name: 'عداد مياه 1 بوصة', cost: 90, price: 140, qty: 30 },
    { cat: 'مواد سباكة', name: 'خزان مياه بلاستيك 500 لتر', cost: 180, price: 260, qty: 20 },
    { cat: 'مواد سباكة', name: 'خزان مياه بلاستيك 1000 لتر', cost: 330, price: 480, qty: 15 },
    { cat: 'مواد سباكة', name: 'مضخة مياه نصف حصان', cost: 290, price: 420, qty: 15 },
    { cat: 'مواد سباكة', name: 'مضخة مياه حصان واحد', cost: 380, price: 550, qty: 10 },
    { cat: 'مواد سباكة', name: 'سيفون حمام مقيس', cost: 25, price: 40, qty: 80 },
    { cat: 'مواد سباكة', name: 'سيفون مطبخ ستانلس', cost: 35, price: 55, qty: 60 },

    // ── مواد كهرباء ───────────────────────────────────
    { cat: 'مواد كهرباء', name: 'كابل كهربائي 1.5 مم - متر', cost: 5, price: 8, qty: 1000 },
    { cat: 'مواد كهرباء', name: 'كابل كهربائي 2.5 مم - متر', cost: 7, price: 11, qty: 800 },
    { cat: 'مواد كهرباء', name: 'كابل كهربائي 4 مم - متر', cost: 11, price: 17, qty: 600 },
    { cat: 'مواد كهرباء', name: 'كابل كهربائي 6 مم - متر', cost: 16, price: 25, qty: 400 },
    { cat: 'مواد كهرباء', name: 'كابل كهربائي 10 مم - متر', cost: 26, price: 40, qty: 200 },
    { cat: 'مواد كهرباء', name: 'مفتاح كهربائي مفرد', cost: 8, price: 14, qty: 200 },
    { cat: 'مواد كهرباء', name: 'مفتاح كهربائي مزدوج', cost: 13, price: 20, qty: 200 },
    { cat: 'مواد كهرباء', name: 'بريزة كهربائية 3 خانة', cost: 16, price: 25, qty: 200 },
    { cat: 'مواد كهرباء', name: 'مقبس USB مزدوج مع بريزة', cost: 38, price: 60, qty: 80 },
    { cat: 'مواد كهرباء', name: 'لمبة LED 12 واط', cost: 8, price: 14, qty: 300 },
    { cat: 'مواد كهرباء', name: 'لمبة LED 18 واط', cost: 13, price: 20, qty: 300 },
    { cat: 'مواد كهرباء', name: 'لمبة LED بانل 24 واط', cost: 22, price: 35, qty: 150 },
    { cat: 'مواد كهرباء', name: 'لوح تحكم كهربائي 12 مدخل', cost: 130, price: 190, qty: 20 },
    { cat: 'مواد كهرباء', name: 'لوح تحكم كهربائي 24 مدخل', cost: 220, price: 320, qty: 10 },
    { cat: 'مواد كهرباء', name: 'قاطع كهربائي 16 أمبير', cost: 20, price: 32, qty: 100 },
    { cat: 'مواد كهرباء', name: 'قاطع كهربائي 32 أمبير', cost: 28, price: 44, qty: 80 },
    { cat: 'مواد كهرباء', name: 'أنبوب كهربائي مموج مرن - متر', cost: 2, price: 4, qty: 500 },

    // ── كماليات ───────────────────────────────────────
    { cat: 'كماليات', name: 'مسامير بناء 5 سم - كيلو', cost: 13, price: 20, qty: 200 },
    { cat: 'كماليات', name: 'مسامير خشب 4 سم - كيلو', cost: 11, price: 17, qty: 200 },
    { cat: 'كماليات', name: 'صاروخ بلاستيك S6 - علبة 100', cost: 9, price: 15, qty: 200 },
    { cat: 'كماليات', name: 'صاروخ بلاستيك S10 - علبة 100', cost: 13, price: 20, qty: 150 },
    { cat: 'كماليات', name: 'شريط لاصق قوي 48مم - رول', cost: 6, price: 10, qty: 150 },
    { cat: 'كماليات', name: 'شريط عازل كهربائي - رول', cost: 4, price: 7, qty: 200 },
    { cat: 'كماليات', name: 'شريط قياس 5 متر', cost: 16, price: 28, qty: 50 },
    { cat: 'كماليات', name: 'شريط قياس 10 متر', cost: 28, price: 45, qty: 30 },
    { cat: 'كماليات', name: 'شبك رابيتس للياسة - م²', cost: 6, price: 10, qty: 600 },
    { cat: 'كماليات', name: 'فيبر تاك شبك زجاجي - م²', cost: 16, price: 25, qty: 300 },
    { cat: 'كماليات', name: 'أدوات يدوية مجموعة كاملة', cost: 160, price: 250, qty: 10 },
    { cat: 'كماليات', name: 'فرشاة دهان 4 بوصة', cost: 9, price: 15, qty: 100 },
    { cat: 'كماليات', name: 'رول دهان 9 بوصة', cost: 14, price: 22, qty: 80 },
    { cat: 'كماليات', name: 'مخفف تنر - لتر', cost: 9, price: 14, qty: 200 },

    // ── أخرى ──────────────────────────────────────────
    { cat: 'أخرى', name: 'لفة عزل مائي بيتومين 4 مم - 10م²', cost: 100, price: 145, qty: 80 },
    { cat: 'أخرى', name: 'لفة عزل مائي بيتومين 3 مم - 10م²', cost: 80, price: 115, qty: 100 },
    { cat: 'أخرى', name: 'مادة عزل مائي سائلة - 20 لتر', cost: 190, price: 260, qty: 50 },
    { cat: 'أخرى', name: 'لوح فوم عازل حراري 5 سم - م²', cost: 38, price: 56, qty: 400 },
    { cat: 'أخرى', name: 'لوح فوم عازل حراري 3 سم - م²', cost: 27, price: 42, qty: 500 },
    { cat: 'أخرى', name: 'لفة ألومنيوم عاكس حراري - 25م²', cost: 130, price: 180, qty: 60 },
    { cat: 'أخرى', name: 'عازل صوتي لفة - م²', cost: 48, price: 75, qty: 100 },
    { cat: 'أخرى', name: 'زجاج شفاف 6 مم - م²', cost: 60, price: 95, qty: 80 },
    { cat: 'أخرى', name: 'زجاج رفلكتيف 8 مم - م²', cost: 100, price: 155, qty: 40 },
    { cat: 'أخرى', name: 'سيليكون بناء شفاف - انبوبة', cost: 14, price: 22, qty: 100 },
    { cat: 'أخرى', name: 'رغوة بناء عازلة - علبة', cost: 18, price: 30, qty: 80 },
];

// ═══════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════
async function main() {
    console.log('\n══════════════════════════════════');
    console.log(' 🚀 Seed: أقسام + منتجات جازان');
    console.log('══════════════════════════════════\n');

    // 1. Warehouse
    let warehouse = await prisma.warehouse.findFirst();
    if (!warehouse) {
        warehouse = await prisma.warehouse.create({
            data: { name: 'المستودع الرئيسي', location: 'جازان' }
        });
        console.log('🏭 أُنشئ المستودع الرئيسي\n');
    }

    // 2. Categories
    console.log('📂 الأقسام:');
    const catMap = {};
    for (const cat of CATEGORIES) {
        let rec = await prisma.category.findFirst({ where: { name: cat.name } });
        if (!rec) {
            rec = await prisma.category.create({ data: cat });
            console.log(`   ✅ ${cat.name}`);
        } else {
            console.log(`   ⏭️  ${cat.name} (موجود)`);
        }
        catMap[cat.name] = rec.id;
    }

    // 3. Products
    console.log('\n📦 المنتجات:');
    let added = 0, skipped = 0;
    for (const p of PRODUCTS) {
        const exists = await prisma.product.findFirst({ where: { name: p.name } });
        if (exists) {
            // Update categoryId if missing
            if (!exists.categoryId && catMap[p.cat]) {
                await prisma.product.update({
                    where: { id: exists.id },
                    data: { categoryId: catMap[p.cat] }
                });
            }
            skipped++;
        } else {
            await prisma.product.create({
                data: {
                    name: p.name,
                    price: p.price,
                    cost: p.cost,
                    categoryId: catMap[p.cat] || null,
                    stocks: {
                        create: { warehouseId: warehouse.id, quantity: p.qty }
                    }
                }
            });
            added++;
        }
        process.stdout.write(`\r   📦 مضاف: ${added}  |  موجود: ${skipped}  `);
    }

    console.log(`\n\n🎉 انتهى بنجاح!`);
    console.log(`   ✅ أقسام: ${Object.keys(catMap).length}`);
    console.log(`   ✅ منتجات مضافة: ${added}`);
    console.log(`   ⏭️  منتجات موجودة: ${skipped}\n`);
}

main()
    .catch(e => { console.error('\n❌ خطأ:', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
