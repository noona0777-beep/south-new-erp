const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===== الأقسام =====
const categories = [
    { name: 'الإنشائية', description: 'مواد البناء والتشييد الإنشائي' },
    { name: 'التشطيبات', description: 'مواد تشطيب الأرضيات والجدران والأسقف' },
    { name: 'الديكور', description: 'مواد الديكور والتزيين الداخلي' },
    { name: 'الأعمال الصحية', description: 'أنابيب ومواسير وأدوات السباكة' },
    { name: 'الكهرباء', description: 'كابلات ومفاتيح وأجهزة كهربائية' },
    { name: 'العزل', description: 'مواد العزل المائي والحراري والصوتي' },
    { name: 'الأخشاب والأبواب', description: 'أخشاب وأبواب ونوافذ وإطارات' },
    { name: 'الأسقف والواجهات', description: 'ألواح الأسقف والواجهات الخارجية' },
    { name: 'الدهانات والطلاء', description: 'دهانات وبويات ومواد طلاء' },
    { name: 'الأدوات والمواد المساعدة', description: 'مسامير وأسلاك وأدوات مساعدة' },
];

// ===== المنتجات مع أقسامها =====
const products = [
    // ===== الإنشائية =====
    { cat: 'الإنشائية', name: 'أسمنت بورتلاندي - كيس 50 كجم', cost: 14, price: 18, qty: 500 },
    { cat: 'الإنشائية', name: 'أسمنت أبيض - كيس 50 كجم', cost: 22, price: 28, qty: 200 },
    { cat: 'الإنشائية', name: 'جبس بناء - كيس 40 كجم', cost: 12, price: 16, qty: 300 },
    { cat: 'الإنشائية', name: 'أسمنت مقاوم للكبريتات - كيس 50 كجم', cost: 20, price: 26, qty: 180 },
    { cat: 'الإنشائية', name: 'مونة بناء جاهزة - كيس 50 كجم', cost: 16, price: 22, qty: 220 },
    { cat: 'الإنشائية', name: 'حديد تسليح 10 مم - طن', cost: 2800, price: 3200, qty: 50 },
    { cat: 'الإنشائية', name: 'حديد تسليح 12 مم - طن', cost: 2850, price: 3300, qty: 60 },
    { cat: 'الإنشائية', name: 'حديد تسليح 16 مم - طن', cost: 2900, price: 3350, qty: 45 },
    { cat: 'الإنشائية', name: 'حديد تسليح 20 مم - طن', cost: 2950, price: 3400, qty: 40 },
    { cat: 'الإنشائية', name: 'حديد تسليح 25 مم - طن', cost: 3000, price: 3500, qty: 30 },
    { cat: 'الإنشائية', name: 'طوب أحمر مزوي - 1000 حبة', cost: 320, price: 420, qty: 100 },
    { cat: 'الإنشائية', name: 'بلوك خرساني 20×20×40 - حبة', cost: 2.5, price: 3.5, qty: 5000 },
    { cat: 'الإنشائية', name: 'بلوك خرساني 15×20×40 - حبة', cost: 2.0, price: 3.0, qty: 4000 },
    { cat: 'الإنشائية', name: 'رمل بناء - متر مكعب', cost: 55, price: 80, qty: 200 },
    { cat: 'الإنشائية', name: 'حصى مدحول 1-3 - متر مكعب', cost: 75, price: 110, qty: 120 },
    { cat: 'الإنشائية', name: 'سلك رباط حديد - كيلو', cost: 8, price: 13, qty: 300 },
    { cat: 'الإنشائية', name: 'صفائح حديد مجلفن 1 مم - رول', cost: 120, price: 160, qty: 80 },
    { cat: 'الإنشائية', name: 'أنابيب حديد مربعة 50×50 - متر', cost: 45, price: 65, qty: 200 },

    // ===== التشطيبات =====
    { cat: 'التشطيبات', name: 'بلاط أرضي 60×60 فاخر - م²', cost: 55, price: 80, qty: 500 },
    { cat: 'التشطيبات', name: 'بلاط أرضي 40×40 - م²', cost: 35, price: 55, qty: 600 },
    { cat: 'التشطيبات', name: 'بلاط حائط 30×60 - م²', cost: 45, price: 65, qty: 400 },
    { cat: 'التشطيبات', name: 'سيراميك حمام 25×40 - م²', cost: 40, price: 60, qty: 300 },
    { cat: 'التشطيبات', name: 'بورسلان 80×80 - م²', cost: 95, price: 140, qty: 200 },
    { cat: 'التشطيبات', name: 'موزاييك رخام - م²', cost: 120, price: 170, qty: 100 },
    { cat: 'التشطيبات', name: 'غراء سيراميك أبيض - كيس 25 كجم', cost: 18, price: 26, qty: 400 },
    { cat: 'التشطيبات', name: 'فيوجات سيراميك ملونة - كيس 5 كجم', cost: 22, price: 32, qty: 200 },
    { cat: 'التشطيبات', name: 'جص جداري ناعم - كيس 25 كجم', cost: 18, price: 24, qty: 250 },
    { cat: 'التشطيبات', name: 'ملاط جاهز ألوان - كيس 25 كجم', cost: 25, price: 35, qty: 150 },
    { cat: 'التشطيبات', name: 'Hdf أرضيات لاميناتي - م²', cost: 65, price: 95, qty: 180 },
    { cat: 'التشطيبات', name: 'رمل ناعم للياسة - متر مكعب', cost: 65, price: 95, qty: 150 },

    // ===== الديكور =====
    { cat: 'الديكور', name: 'لوح جبس بورد ديكوري 12 مم', cost: 28, price: 42, qty: 200 },
    { cat: 'الديكور', name: 'سقف جبس مزخرف - م²', cost: 95, price: 140, qty: 100 },
    { cat: 'الديكور', name: 'ألواح PVC ديكور جداري - م²', cost: 35, price: 55, qty: 300 },
    { cat: 'الديكور', name: 'حجر صناعي للواجهات - م²', cost: 85, price: 130, qty: 150 },
    { cat: 'الديكور', name: 'ورق جدران فيلدا - رول', cost: 45, price: 70, qty: 120 },
    { cat: 'الديكور', name: 'شرائح خشب ديكور داكن - م²', cost: 75, price: 115, qty: 80 },
    { cat: 'الديكور', name: 'مرايا ديكورية للجدران - م²', cost: 110, price: 170, qty: 50 },
    { cat: 'الديكور', name: 'ألواح ألومنيوم ديكور مسقف - م²', cost: 120, price: 180, qty: 60 },

    // ===== الأعمال الصحية =====
    { cat: 'الأعمال الصحية', name: 'أنبوب PVC 110 مم - 6م', cost: 45, price: 65, qty: 150 },
    { cat: 'الأعمال الصحية', name: 'أنبوب PVC 75 مم - 6م', cost: 30, price: 45, qty: 180 },
    { cat: 'الأعمال الصحية', name: 'أنبوب PVC 50 مم - 6م', cost: 18, price: 28, qty: 220 },
    { cat: 'الأعمال الصحية', name: 'أنبوب PPR 20 مم - 4م', cost: 12, price: 18, qty: 300 },
    { cat: 'الأعمال الصحية', name: 'أنبوب PPR 25 مم - 4م', cost: 16, price: 24, qty: 250 },
    { cat: 'الأعمال الصحية', name: 'أنبوب PPR 32 مم - 4م', cost: 24, price: 36, qty: 200 },
    { cat: 'الأعمال الصحية', name: 'وصلة PVC كوع 90° 110مم', cost: 8, price: 13, qty: 200 },
    { cat: 'الأعمال الصحية', name: 'صمام تحكم بوصة', cost: 35, price: 55, qty: 80 },
    { cat: 'الأعمال الصحية', name: 'عداد مياه 1 بوصة', cost: 85, price: 130, qty: 30 },
    { cat: 'الأعمال الصحية', name: 'خزان مياه بلاستيك 1000 لتر', cost: 320, price: 450, qty: 20 },

    // ===== الكهرباء =====
    { cat: 'الكهرباء', name: 'كابل كهربائي 1.5 مم - متر', cost: 4.5, price: 7, qty: 1000 },
    { cat: 'الكهرباء', name: 'كابل كهربائي 2.5 مم - متر', cost: 6.5, price: 10, qty: 800 },
    { cat: 'الكهرباء', name: 'كابل كهربائي 4 مم - متر', cost: 10, price: 15, qty: 600 },
    { cat: 'الكهرباء', name: 'كابل كهربائي 6 مم - متر', cost: 15, price: 22, qty: 400 },
    { cat: 'الكهرباء', name: 'مفتاح كهربائي مزدوج', cost: 12, price: 18, qty: 200 },
    { cat: 'الكهرباء', name: 'بريزة كهربائية 3 خانة', cost: 15, price: 22, qty: 200 },
    { cat: 'الكهرباء', name: 'لمبة LED 18 واط', cost: 12, price: 18, qty: 300 },
    { cat: 'الكهرباء', name: 'لوح تحكم كهربائي 12 مدخل', cost: 120, price: 175, qty: 30 },
    { cat: 'الكهرباء', name: 'قاطع كهربائي 16 أمبير', cost: 18, price: 28, qty: 100 },
    { cat: 'الكهرباء', name: 'مقبس USB مزدوج مع بريزة', cost: 35, price: 55, qty: 80 },

    // ===== العزل =====
    { cat: 'العزل', name: 'لفة عزل مائي بيتومين 4 مم - 10م²', cost: 95, price: 130, qty: 100 },
    { cat: 'العزل', name: 'لفة عزل مائي بيتومين 3 مم - 10م²', cost: 75, price: 105, qty: 120 },
    { cat: 'العزل', name: 'لوح فوم عازل حراري 5 سم - م²', cost: 35, price: 50, qty: 500 },
    { cat: 'العزل', name: 'لوح فوم عازل حراري 3 سم - م²', cost: 25, price: 38, qty: 600 },
    { cat: 'العزل', name: 'لفة ألومنيوم عاكس حراري - 25م²', cost: 120, price: 165, qty: 80 },
    { cat: 'العزل', name: 'مادة عزل مائي سائلة - 20 لتر', cost: 180, price: 240, qty: 60 },
    { cat: 'العزل', name: 'عازل صوتي لفة رول - م²', cost: 45, price: 68, qty: 150 },

    // ===== الأخشاب والأبواب =====
    { cat: 'الأخشاب والأبواب', name: 'خشب صنوبر 4×4 - متر', cost: 22, price: 32, qty: 300 },
    { cat: 'الأخشاب والأبواب', name: 'خشب صنوبر 2×4 - متر', cost: 12, price: 18, qty: 400 },
    { cat: 'الأخشاب والأبواب', name: 'لوح MDF 18 مم - م²', cost: 45, price: 65, qty: 200 },
    { cat: 'الأخشاب والأبواب', name: 'لوح خشب رقائقي 12 مم - م²', cost: 38, price: 55, qty: 250 },
    { cat: 'الأخشاب والأبواب', name: 'باب خشبي داخلي 90×210 سم', cost: 350, price: 500, qty: 30 },
    { cat: 'الأخشاب والأبواب', name: 'باب حديد خارجي 90×210 سم', cost: 850, price: 1200, qty: 15 },
    { cat: 'الأخشاب والأبواب', name: 'نافذة ألومنيوم 100×120 سم', cost: 380, price: 550, qty: 25 },
    { cat: 'الأخشاب والأبواب', name: 'إطار باب خشبي - مجموعة', cost: 120, price: 180, qty: 50 },
    { cat: 'الأخشاب والأبواب', name: 'زجاج شفاف 6 مم - م²', cost: 55, price: 85, qty: 100 },

    // ===== الأسقف والواجهات =====
    { cat: 'الأسقف والواجهات', name: 'ألواح سقف ساندوتش 5 سم - م²', cost: 85, price: 125, qty: 200 },
    { cat: 'الأسقف والواجهات', name: 'ألواح زنك مموج لون رمادي - م²', cost: 45, price: 70, qty: 300 },
    { cat: 'الأسقف والواجهات', name: 'ألمنيوم كومبوند 3 مم - م²', cost: 120, price: 175, qty: 150 },
    { cat: 'الأسقف والواجهات', name: 'بروفايل سقف جبس C - متر', cost: 8, price: 13, qty: 500 },
    { cat: 'الأسقف والواجهات', name: 'بروفايل سقف جبس U - متر', cost: 6, price: 10, qty: 600 },
    { cat: 'الأسقف والواجهات', name: 'زجاج رفلكتيف 8 مم - م²', cost: 95, price: 145, qty: 60 },

    // ===== الدهانات والطلاء =====
    { cat: 'الدهانات والطلاء', name: 'دهان بلاستيك داخلي أبيض - 18 لتر', cost: 95, price: 135, qty: 80 },
    { cat: 'الدهانات والطلاء', name: 'دهان بلاستيك خارجي - 18 لتر', cost: 130, price: 175, qty: 60 },
    { cat: 'الدهانات والطلاء', name: 'بوية زيتية - 4 لتر', cost: 65, price: 90, qty: 100 },
    { cat: 'الدهانات والطلاء', name: 'دهان أساس بروفايلر - 18 لتر', cost: 75, price: 105, qty: 90 },
    { cat: 'الدهانات والطلاء', name: 'معجون تسوية جداري - 20 كجم', cost: 55, price: 75, qty: 150 },
    { cat: 'الدهانات والطلاء', name: 'دهان مطاطي للأسطح - 18 لتر', cost: 145, price: 195, qty: 40 },
    { cat: 'الدهانات والطلاء', name: 'مخفف تنر - لتر', cost: 8, price: 12, qty: 300 },

    // ===== الأدوات والمواد المساعدة =====
    { cat: 'الأدوات والمواد المساعدة', name: 'مسامير بناء 5 سم - كيلو', cost: 12, price: 18, qty: 200 },
    { cat: 'الأدوات والمواد المساعدة', name: 'مسامير تعليق 3 سم - كيلو', cost: 10, price: 15, qty: 200 },
    { cat: 'الأدوات والمواد المساعدة', name: 'شبك رابيتس للياسة - م²', cost: 5, price: 8, qty: 1000 },
    { cat: 'الأدوات والمواد المساعدة', name: 'شريط لاصق عازل - رول', cost: 5, price: 8, qty: 400 },
    { cat: 'الأدوات والمواد المساعدة', name: 'فيبر تاك شبك زجاجي - م²', cost: 15, price: 22, qty: 300 },
    { cat: 'الأدوات والمواد المساعدة', name: 'صاروخ بلاستيك S6 - علبة 100', cost: 8, price: 13, qty: 200 },
    { cat: 'الأدوات والمواد المساعدة', name: 'صاروخ بلاستيك S10 - علبة 100', cost: 12, price: 18, qty: 200 },
    { cat: 'الأدوات والمواد المساعدة', name: 'شريط قياس 5 متر', cost: 15, price: 25, qty: 50 },
];

async function seedAll() {
    console.log('🚀 Starting full inventory seed...\n');

    try {
        const warehouse = await prisma.warehouse.findFirst();
        if (!warehouse) {
            console.error('❌ No warehouse found! Run: node seed.js first');
            return;
        }

        // ===== 1. إنشاء الأقسام =====
        console.log('📂 Creating categories...');
        const categoryMap = {};
        for (const cat of categories) {
            const exists = await prisma.category.findFirst({ where: { name: cat.name } });
            if (exists) {
                categoryMap[cat.name] = exists.id;
                console.log(`   ℹ️  ${cat.name} - already exists`);
            } else {
                const created = await prisma.category.create({ data: cat });
                categoryMap[cat.name] = created.id;
                console.log(`   ✅ ${cat.name}`);
            }
        }

        // ===== 2. إنشاء المنتجات =====
        console.log('\n📦 Adding products...');
        let added = 0, skipped = 0;

        for (const p of products) {
            const exists = await prisma.product.findFirst({ where: { name: p.name } });
            if (exists) {
                // Update category if missing
                if (!exists.categoryId && categoryMap[p.cat]) {
                    await prisma.product.update({
                        where: { id: exists.id },
                        data: { categoryId: categoryMap[p.cat] }
                    });
                }
                skipped++;
                continue;
            }

            await prisma.product.create({
                data: {
                    name: p.name,
                    price: p.price,
                    cost: p.cost,
                    categoryId: categoryMap[p.cat] || null,
                    stocks: {
                        create: { warehouseId: warehouse.id, quantity: p.qty }
                    }
                }
            });
            added++;
            process.stdout.write(`\r   📦 Added: ${added} | Skipped: ${skipped}`);
        }

        console.log(`\n\n🎉 Done!`);
        console.log(`   ✅ Categories: ${Object.keys(categoryMap).length}`);
        console.log(`   ✅ Products added: ${added}`);
        console.log(`   ℹ️  Products skipped (already exist): ${skipped}`);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAll();
