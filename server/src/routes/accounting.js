const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Accounts
router.get('/accounts', async (req, res) => {
    try {
        const accounts = await prisma.account.findMany({
            include: { children: true },
            orderBy: { code: 'asc' }
        });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/accounts', async (req, res) => {
    const { name, code, type, parentId } = req.body;
    try {
        const account = await prisma.account.create({
            data: { name, code, type, parentId: parentId ? parseInt(parentId) : null }
        });
        res.json(account);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Journal
router.get('/journal', async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            include: { entries: { include: { account: true } } },
            orderBy: { date: 'desc' }
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/journal', async (req, res) => {
    const { date, description, reference, entries } = req.body;
    try {
        const result = await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    date: new Date(date),
                    description, reference, type: 'JOURNAL',
                    entries: {
                        create: entries.map(e => ({
                            accountId: parseInt(e.accountId),
                            debit: parseFloat(e.debit || 0),
                            credit: parseFloat(e.credit || 0),
                            description: e.description
                        }))
                    }
                }
            });
            for (const entry of entries) {
                const diff = (parseFloat(entry.debit || 0) - parseFloat(entry.credit || 0));
                await tx.account.update({
                    where: { id: parseInt(entry.accountId) },
                    data: { balance: { increment: diff } }
                });
            }
            return transaction;
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reports
router.get('/reports/trial-balance', async (req, res) => {
    try {
        const { date } = req.query;
        const asOfDate = date ? new Date(date) : new Date();
        const accounts = await prisma.account.findMany({ orderBy: { code: 'asc' } });
        const trialBalance = await Promise.all(accounts.map(async (acc) => {
            const entries = await prisma.journalEntry.findMany({
                where: { accountId: acc.id, transaction: { date: { lte: asOfDate } } }
            });
            const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
            const totalCredit = entries.reduce((s, e) => s + e.credit, 0);
            return { ...acc, balance: totalDebit - totalCredit };
        }));
        res.json(trialBalance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/reports/income-statement', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();
        const accounts = await prisma.account.findMany({
            where: { OR: [{ code: { startsWith: '4' } }, { code: { startsWith: '5' } }] }
        });
        const reportData = await Promise.all(accounts.map(async (acc) => {
            const entries = await prisma.journalEntry.findMany({
                where: { accountId: acc.id, transaction: { date: { gte: start, lte: end } } }
            });
            const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
            const totalCredit = entries.reduce((s, e) => s + e.credit, 0);
            let balance = acc.code.startsWith('4') ? totalCredit - totalDebit : totalDebit - totalCredit;
            return { ...acc, balance };
        }));
        const revenues = reportData.filter(a => a.code.startsWith('4'));
        const expenses = reportData.filter(a => a.code.startsWith('5'));
        const totalRevenue = revenues.reduce((s, a) => s + a.balance, 0);
        const totalExpenses = expenses.reduce((s, a) => s + a.balance, 0);
        res.json({ revenues, expenses, totalRevenue, totalExpenses, netIncome: totalRevenue - totalExpenses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/reports/balance-sheet', async (req, res) => {
    try {
        const { date } = req.query;
        const asOfDate = date ? new Date(date) : new Date();
        const accounts = await prisma.account.findMany({ orderBy: { code: 'asc' } });

        const withBalance = await Promise.all(accounts.map(async (acc) => {
            const entries = await prisma.journalEntry.findMany({
                where: { accountId: acc.id, transaction: { date: { lte: asOfDate } } }
            });
            const debit = entries.reduce((s, e) => s + e.debit, 0);
            const credit = entries.reduce((s, e) => s + e.credit, 0);
            // Assets/Expenses: debit nature. Liabilities/Equity/Revenue: credit nature
            let balance = 0;
            if (acc.code.startsWith('1') || acc.code.startsWith('5')) {
                balance = debit - credit;
            } else {
                balance = credit - debit;
            }
            return { ...acc, balance };
        }));

        const assets = withBalance.filter(a => a.code.startsWith('1') && a.balance !== 0);
        const liabilities = withBalance.filter(a => a.code.startsWith('2') && a.balance !== 0);
        const equity = withBalance.filter(a => a.code.startsWith('3') && a.balance !== 0);

        const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
        const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
        const totalEquity = equity.reduce((s, a) => s + a.balance, 0);

        res.json({ assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/reports/general-ledger', async (req, res) => {
    try {
        const { accountId, startDate, endDate } = req.query;
        if (!accountId) return res.status(400).json({ error: 'accountId required' });

        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        const account = await prisma.account.findUnique({ where: { id: parseInt(accountId) } });
        if (!account) return res.status(404).json({ error: 'Account not found' });

        // Opening balance: all entries before startDate
        const openingEntries = await prisma.journalEntry.findMany({
            where: { accountId: parseInt(accountId), transaction: { date: { lt: start } } }
        });
        const openingDebit = openingEntries.reduce((s, e) => s + e.debit, 0);
        const openingCredit = openingEntries.reduce((s, e) => s + e.credit, 0);
        const isDebitNature = account.code.startsWith('1') || account.code.startsWith('5');
        const openingBalance = isDebitNature ? openingDebit - openingCredit : openingCredit - openingDebit;

        // Period movements
        const entries = await prisma.journalEntry.findMany({
            where: { accountId: parseInt(accountId), transaction: { date: { gte: start, lte: end } } },
            include: { transaction: true },
            orderBy: { transaction: { date: 'asc' } }
        });

        let runningBalance = openingBalance;
        const movements = entries.map(e => {
            const debit = e.debit || 0;
            const credit = e.credit || 0;
            if (isDebitNature) runningBalance += debit - credit;
            else runningBalance += credit - debit;
            return {
                id: e.id,
                date: e.transaction.date,
                description: e.description || e.transaction.description,
                reference: e.transaction.reference || e.transaction.id,
                debit, credit,
                balance: runningBalance
            };
        });

        res.json({ account, openingBalance, movements, closingBalance: runningBalance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
