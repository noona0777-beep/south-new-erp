const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { products: true } } },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/categories', async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await prisma.category.create({ data: { name, description } });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/categories/:id', async (req, res) => {
    try {
        await prisma.product.updateMany({
            where: { categoryId: parseInt(req.params.id) },
            data: { categoryId: null }
        });
        await prisma.category.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Products
router.get('/products', async (req, res) => {
    try {
        const { categoryId } = req.query;
        const where = categoryId ? { categoryId: parseInt(categoryId) } : {};
        const products = await prisma.product.findMany({
            where,
            include: { stocks: true, category: true },
            orderBy: { name: 'asc' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/products', async (req, res) => {
    const { name, price, cost, quantity, categoryId } = req.body;
    try {
        let warehouse = await prisma.warehouse.findFirst();
        if (!warehouse) {
            warehouse = await prisma.warehouse.create({
                data: { name: 'المستودع الرئيسي', location: 'المقر الرئيسي' }
            });
        }

        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                cost: parseFloat(cost),
                categoryId: categoryId ? parseInt(categoryId) : null,
                stocks: {
                    create: {
                        warehouseId: warehouse.id,
                        quantity: parseInt(quantity) || 0
                    }
                }
            }
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/products/:id', async (req, res) => {
    try {
        const { name, price, cost, categoryId } = req.body;
        const product = await prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data: {
                name,
                price: parseFloat(price),
                cost: parseFloat(cost),
                categoryId: categoryId ? parseInt(categoryId) : null
            },
            include: { stocks: true, category: true }
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.stock.deleteMany({ where: { productId: id } });
        await prisma.product.delete({ where: { id: id } });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stock Adjust
router.post('/products/:id/adjust', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { quantity, type } = req.body;
        let warehouse = await prisma.warehouse.findFirst();
        const currentStock = await prisma.stock.findFirst({
            where: { productId, warehouseId: warehouse.id }
        });
        if (currentStock) {
            const newQty = type === 'ADD' ? currentStock.quantity + parseInt(quantity) : currentStock.quantity - parseInt(quantity);
            await prisma.stock.update({
                where: { id: currentStock.id },
                data: { quantity: Math.max(0, newQty) }
            });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/products/:id/stock', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { quantity } = req.body;
        let warehouse = await prisma.warehouse.findFirst() || await prisma.warehouse.create({ data: { name: 'المستودع الرئيسي' } });
        const existingStock = await prisma.stock.findFirst({
            where: { productId, warehouseId: warehouse.id }
        });
        if (existingStock) {
            await prisma.stock.update({
                where: { id: existingStock.id },
                data: { quantity: Math.max(0, parseInt(quantity) || 0) }
            });
        } else {
            await prisma.stock.create({
                data: { productId, warehouseId: warehouse.id, quantity: Math.max(0, parseInt(quantity) || 0) }
            });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
