const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { logActivity, generateZatcaTLV } = require('../utils/helpers');

// Get All
router.get('/', async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            include: {
                partner: true,
                items: { include: { product: true } }
            },
            orderBy: { date: 'desc' }
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Single
router.get('/:id', async (req, res) => {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                partner: true,
                items: { include: { product: true } }
            }
        });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create
router.post('/', authenticate, async (req, res) => {
    const { partnerId, date, type, items, discount, constructionContractId } = req.body;

    let subtotal = 0;
    const invoiceItemsData = items.map(item => {
        const lineTotal = Number(item.quantity) * Number(item.unitPrice);
        subtotal += lineTotal;
        return {
            productId: item.productId ? Number(item.productId) : null,
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            taxRate: 0.15,
            total: lineTotal
        };
    });

    const totalBeforeTax = subtotal - (Number(discount) || 0);
    const taxAmount = totalBeforeTax * 0.15;
    const total = totalBeforeTax + taxAmount;

    try {
        const companySetting = await prisma.settings.findUnique({ where: { key: 'companyInfo' } });
        const companyInfo = companySetting ? JSON.parse(companySetting.value) : { name: 'مؤسسة الجنوب الجديد', vatNumber: '310123456700003' };

        const result = await prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.create({
                data: {
                    invoiceNumber: `INV-${Date.now()}`,
                    uuid: require('crypto').randomUUID(),
                    date: date ? new Date(date) : new Date(),
                    type: type || 'SALES_TAX',
                    status: 'POSTED',
                    partnerId: (partnerId && partnerId !== "") ? Number(partnerId) : null,
                    subtotal,
                    discount: Number(discount) || 0,
                    taxAmount,
                    total,
                    qrCode: generateZatcaTLV(
                        companyInfo.name,
                        companyInfo.vatNumber,
                        (date ? new Date(date) : new Date()).toISOString(),
                        total.toFixed(2),
                        taxAmount.toFixed(2)
                    ),
                    items: { create: invoiceItemsData },
                    constructionContractId: constructionContractId ? parseInt(constructionContractId) : null
                }
            });

            // Auto Journal Entry
            try {
                const arAccount = await tx.account.findFirst({ where: { code: '1103' } });
                const revAccount = await tx.account.findFirst({ where: { code: '42' } });
                const vatAccount = await tx.account.findFirst({ where: { code: '2102' } });

                if (arAccount && revAccount && vatAccount) {
                    const journalEntries = [
                        { accountId: arAccount.id, debit: total, credit: 0, description: 'عميل - ' + invoice.invoiceNumber },
                        { accountId: revAccount.id, debit: 0, credit: totalBeforeTax, description: 'إيراد مبيعات - ' + invoice.invoiceNumber },
                        { accountId: vatAccount.id, debit: 0, credit: taxAmount, description: 'ضريبة القيمة المضافة 15% - ' + invoice.invoiceNumber },
                    ];
                    await tx.transaction.create({
                        data: {
                            date: new Date(date),
                            description: `قيد فاتورة مبيعات ${invoice.invoiceNumber}`,
                            reference: invoice.invoiceNumber,
                            type: 'INVOICE',
                            entries: { create: journalEntries }
                        }
                    });
                    await tx.account.update({ where: { id: arAccount.id }, data: { balance: { increment: total } } });
                    await tx.account.update({ where: { id: revAccount.id }, data: { balance: { increment: -totalBeforeTax } } });
                    await tx.account.update({ where: { id: vatAccount.id }, data: { balance: { increment: -taxAmount } } });
                }
            } catch (err) { console.warn('Journal error:', err.message); }

            // Stock
            for (const item of invoiceItemsData) {
                if (item.productId) {
                    const warehouse = await tx.warehouse.findFirst() || await tx.warehouse.create({ data: { name: 'المستودع الرئيسي' } });
                    const stock = await tx.stock.findFirst({ where: { productId: item.productId, warehouseId: warehouse.id } });
                    if (stock) {
                        const newQty = stock.quantity - item.quantity;
                        await tx.stock.update({ where: { id: stock.id }, data: { quantity: newQty } });
                        if (newQty < 10) {
                            const p = await tx.product.findUnique({ where: { id: item.productId } });
                            await tx.notification.create({
                                data: { type: 'LOW_STOCK', title: 'نقص مخزون', message: `المنتج "${p.name}" وصل لـ ${newQty}` }
                            });
                        }
                    }
                }
            }

            // Archive
            await tx.document.create({
                data: {
                    title: `فاتورة مبيعات رقم ${invoice.invoiceNumber}`,
                    category: 'OTHER',
                    fileUrl: `INTERNAL:INVOICE:${invoice.id}`,
                    partnerId: invoice.partnerId,
                    createdAt: invoice.createdAt
                }
            });

            return invoice;
        });

        await logActivity(req.user.id, 'CREATE', 'INVOICE', result.id, `فاتورة #${result.invoiceNumber}`);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});

// Update
router.put('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { partnerId, date, type, items, discount } = req.body;
    let subtotal = 0;
    const invoiceItemsData = items.map(item => {
        const lineTotal = Number(item.quantity) * Number(item.unitPrice);
        subtotal += lineTotal;
        return {
            productId: item.productId ? Number(item.productId) : null,
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            taxRate: 0.15,
            total: lineTotal
        };
    });
    const totalBeforeTax = subtotal - (Number(discount) || 0);
    const taxAmount = totalBeforeTax * 0.15;
    const total = totalBeforeTax + taxAmount;

    try {
        const result = await prisma.$transaction(async (tx) => {
            await tx.invoiceItem.deleteMany({ where: { invoiceId: parseInt(id) } });
            return await tx.invoice.update({
                where: { id: parseInt(id) },
                data: {
                    date: date ? new Date(date) : undefined,
                    type: type || 'SALES_TAX',
                    partnerId: (partnerId && partnerId !== "") ? Number(partnerId) : null,
                    subtotal,
                    discount: Number(discount) || 0,
                    taxAmount,
                    total,
                    items: { create: invoiceItemsData }
                }
            });
        });
        await logActivity(req.user.id, 'UPDATE', 'INVOICE', result.id, `تعديل فاتورة #${result.invoiceNumber}`);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update invoice' });
    }
});

module.exports = router;
