require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Extended Data...');

    // 1. Get Default Warehouse
    const warehouse = await prisma.warehouse.findFirst();
    if (!warehouse) {
        console.error('❌ No warehouse found. Run basic seed first.');
        return;
    }

    // 2. Create Customers
    const customersData = [
        { name: 'شركة أعمار الجنوب للمقاولات', type: 'CUSTOMER', phone: '0555111222', vatNumber: '300123456700003', address: 'جازان - المنطقة الصناعية' },
        { name: 'مؤسسة خالد عبد الرحمن التجارية', type: 'CUSTOMER', phone: '0505333444', vatNumber: '300987654300003', address: 'أبوعريش - الشارع العام' },
        { name: 'صالح محمد القحطاني (عميل نقدي)', type: 'CUSTOMER', phone: '0599888777', address: 'أحد المسارحة' },
        { name: 'فندق نزل الجنوب', type: 'CUSTOMER', phone: '0173210000', vatNumber: '310555666700003', address: 'جازان - الكورنيش' },
        { name: 'مجمع مدارس الأجيال الأهلية', type: 'CUSTOMER', phone: '0544222111', address: 'صامطة' }
    ];

    for (const c of customersData) {
        await prisma.partner.create({ data: c });
    }
    console.log(`✅ Added ${customersData.length} Customers`);

    // 3. Create Products (Materials & Services)
    const productsData = [
        { name: 'بلك بركاني 20*40*20 (ألف حبة)', price: 1600.00, cost: 1450.00, qty: 50 },
        { name: 'دهان جوتن فينوماستيك (جالون)', price: 120.00, cost: 95.00, qty: 200 },
        { name: 'بلاط سيراميك وطني 60*60 (متر)', price: 28.00, cost: 22.00, qty: 5000 },
        { name: 'كيبل كهرباء الفنار 16 ملم (لفة)', price: 450.00, cost: 380.00, qty: 8 }, // Low stock
        { name: 'أنبوب سباكة نيبرو 4 بوصة (6 متر)', price: 85.00, cost: 65.00, qty: 150 },
        { name: 'خدمة تركيب بلاط (متر)', price: 25.00, cost: 15.00, qty: 9999 }, // Service
        { name: 'خدمة تمديد كهرباء (نقطة)', price: 15.00, cost: 8.00, qty: 9999 }, // Service
        { name: 'خزان مياه 2000 لتر (المهيدب)', price: 1200.00, cost: 950.00, qty: 3 }, // Very Low Stock
        { name: 'اسمنت أبيض (كيس 50 كجم)', price: 45.00, cost: 35.00, qty: 40 },
        { name: 'رمل أحمر (تريلا 24 متر)', price: 400.00, cost: 300.00, qty: 100 }
    ];

    for (const p of productsData) {
        await prisma.product.create({
            data: {
                name: p.name,
                price: p.price,
                cost: p.cost,
                stocks: { create: { warehouseId: warehouse.id, quantity: p.qty } }
            }
        });
    }
    console.log(`✅ Added ${productsData.length} Products`);

    // 4. Create Dummy Invoices
    // We need to fetch Partners & Products first to link them
    const partners = await prisma.partner.findMany();
    const products = await prisma.product.findMany();

    // Helper to create invoice
    const createInvoice = async (partner, itemsArr, dateOffsetDays = 0) => {
        let subtotal = 0;
        const invoiceItems = itemsArr.map(itemIdx => {
            const product = products[itemIdx.idx];
            const qty = itemIdx.qty;
            const total = product.price * qty;
            subtotal += total;
            return {
                productId: product.id,
                description: product.name,
                quantity: qty,
                unitPrice: product.price,
                taxRate: 0.15,
                total: total
            };
        });

        const taxAmount = subtotal * 0.15;
        const total = subtotal + taxAmount;
        const date = new Date();
        date.setDate(date.getDate() - dateOffsetDays);

        await prisma.invoice.create({
            data: {
                invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
                uuid: require('crypto').randomUUID(),
                date: date,
                type: 'SALES_TAX',
                status: 'POSTED',
                partnerId: partner.id,
                subtotal,
                discount: 0,
                taxAmount,
                total,
                items: { create: invoiceItems }
            }
        });
    };

    if (partners.length > 0 && products.length > 5) {
        // Invoice 1: Yesterday
        await createInvoice(partners[0], [{ idx: 0, qty: 2 }, { idx: 1, qty: 5 }], 1);
        // Invoice 2: Today
        await createInvoice(partners[1], [{ idx: 2, qty: 100 }, { idx: 5, qty: 100 }], 0);
        // Invoice 3: Last Week
        await createInvoice(partners[2], [{ idx: 3, qty: 2 }, { idx: 7, qty: 1 }], 7);

        console.log('✅ Created 3 Dummy Invoices');
    }

}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
