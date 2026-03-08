const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/employees', async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            include: { salaries: true },
            orderBy: { name: 'asc' }
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/employees', async (req, res) => {
    try {
        const { name, jobTitle, department, phone, email, salary, status, joinDate } = req.body;
        const employee = await prisma.employee.create({
            data: {
                employeeId: `EMP-${Date.now()}`,
                name, jobTitle, department, phone, email,
                salary: parseFloat(salary) || 0,
                status: status || 'ACTIVE',
                joinDate: joinDate ? new Date(joinDate) : new Date()
            }
        });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/employees/:id', async (req, res) => {
    try {
        const employee = await prisma.employee.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { salaries: true }
        });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/employees/:id', async (req, res) => {
    try {
        const { name, jobTitle, department, phone, email, salary, status, joinDate } = req.body;
        const employee = await prisma.employee.update({
            where: { id: parseInt(req.params.id) },
            data: {
                name, jobTitle, department, phone, email,
                salary: parseFloat(salary),
                status,
                joinDate: joinDate ? new Date(joinDate) : undefined
            }
        });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/employees/:id', async (req, res) => {
    try {
        await prisma.employee.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Employee deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/employees/:id/pay-salary', async (req, res) => {
    const employeeId = parseInt(req.params.id);
    const { amount, month, year } = req.body;
    try {
        const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        const salaryAmount = parseFloat(amount) || employee.salary;
        const periodLabel = `${month || 'N/A'} ${year || ''}`;

        await prisma.$transaction(async (tx) => {
            const salaryExpenseAccount = await tx.account.findFirst({ where: { code: '5101' } });
            const cashAccount = await tx.account.findFirst({ where: { code: '1101' } });
            if (salaryExpenseAccount && cashAccount) {
                await tx.transaction.create({
                    data: {
                        date: new Date(),
                        description: `صرف راتب ${employee.name} - ${periodLabel}`,
                        reference: `SAL-${employee.employeeId}-${Date.now()}`,
                        type: 'JOURNAL',
                        entries: {
                            create: [
                                { accountId: salaryExpenseAccount.id, debit: salaryAmount, credit: 0, description: `راتب ${employee.name}` },
                                { accountId: cashAccount.id, debit: 0, credit: salaryAmount, description: `صرف راتب ${employee.name}` },
                            ]
                        }
                    }
                });
                await tx.account.update({ where: { id: salaryExpenseAccount.id }, data: { balance: { increment: salaryAmount } } });
                await tx.account.update({ where: { id: cashAccount.id }, data: { balance: { increment: -salaryAmount } } });
            }
            await tx.salaryRecord.create({
                data: { employeeId, month: parseInt(month) || 0, year: parseInt(year) || 0, baseSalary: employee.salary, netSalary: salaryAmount }
            });
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
