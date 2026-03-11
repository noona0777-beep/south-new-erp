const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// ─── Employees ────────────────────────────────────────────────
router.get('/employees', async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            include: { salaries: { orderBy: { paymentDate: 'desc' }, take: 3 }, scores: { orderBy: { year: 'desc' }, take: 1 } },
            orderBy: { name: 'asc' }
        });
        res.json(employees);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/employees', async (req, res) => {
    try {
        const { name, jobTitle, department, phone, email, salary, status, joinDate, allowances, notes } = req.body;
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
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/employees/:id', async (req, res) => {
    try {
        const employee = await prisma.employee.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                salaries: { orderBy: { paymentDate: 'desc' } },
                scores: { orderBy: { year: 'desc' } },
                tasks: { take: 5, orderBy: { createdAt: 'desc' } },
                siteVisits: { take: 5, orderBy: { date: 'desc' } },
                leads: { take: 5 }
            }
        });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json(employee);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/employees/:id', async (req, res) => {
    try {
        const { name, jobTitle, department, phone, email, salary, status, joinDate } = req.body;
        const employee = await prisma.employee.update({
            where: { id: parseInt(req.params.id) },
            data: { name, jobTitle, department, phone, email, salary: parseFloat(salary), status, joinDate: joinDate ? new Date(joinDate) : undefined }
        });
        res.json(employee);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/employees/:id', async (req, res) => {
    try {
        await prisma.employee.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── Payroll ────────────────────────────────────────────────────
router.post('/employees/:id/pay-salary', async (req, res) => {
    const employeeId = parseInt(req.params.id);
    const { allowances = 0, deductions = 0, month, year, notes } = req.body;
    try {
        const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        // Check duplicate month/year
        const existing = await prisma.salaryRecord.findFirst({
            where: { employeeId, month: parseInt(month), year: parseInt(year) }
        });
        if (existing) return res.status(400).json({ error: `تم صرف راتب ${employee.name} لهذا الشهر مسبقاً` });

        const baseSalary = employee.salary;
        const netSalary = baseSalary + parseFloat(allowances) - parseFloat(deductions);
        const periodLabel = `${month}/${year}`;

        await prisma.$transaction(async (tx) => {
            const salaryAccount = await tx.account.findFirst({ where: { code: '5101' } });
            const cashAccount = await tx.account.findFirst({ where: { code: '1101' } });
            if (salaryAccount && cashAccount) {
                await tx.transaction.create({
                    data: {
                        date: new Date(), description: `صرف راتب ${employee.name} - ${periodLabel}`,
                        reference: `SAL-${employee.employeeId}-${Date.now()}`, type: 'JOURNAL',
                        entries: {
                            create: [
                                { accountId: salaryAccount.id, debit: netSalary, credit: 0, description: `راتب ${employee.name}` },
                                { accountId: cashAccount.id, debit: 0, credit: netSalary, description: `صرف راتب ${employee.name}` },
                            ]
                        }
                    }
                });
                await tx.account.update({ where: { id: salaryAccount.id }, data: { balance: { increment: netSalary } } });
                await tx.account.update({ where: { id: cashAccount.id }, data: { balance: { increment: -netSalary } } });
            }
            await tx.salaryRecord.create({
                data: { employeeId, month: parseInt(month), year: parseInt(year), baseSalary, allowances: parseFloat(allowances), deductions: parseFloat(deductions), netSalary, status: 'PAID' }
            });
        });
        res.json({ success: true, netSalary });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── Bulk Payroll (كشف رواتب جماعي) ────────────────────────────
router.post('/payroll/run', async (req, res) => {
    const { month, year } = req.body;
    try {
        const result = await prisma.$transaction(async (tx) => {
            const employees = await tx.employee.findMany({ where: { status: 'ACTIVE' } });
            const results = [];
            let totalPayroll = 0;

            for (const emp of employees) {
                const existing = await tx.salaryRecord.findFirst({
                    where: { employeeId: emp.id, month: parseInt(month), year: parseInt(year) }
                });
                if (!existing) {
                    await tx.salaryRecord.create({
                        data: { employeeId: emp.id, month: parseInt(month), year: parseInt(year), baseSalary: emp.salary, netSalary: emp.salary, status: 'PAID' }
                    });
                    totalPayroll += emp.salary;
                    results.push({ name: emp.name, salary: emp.salary, status: 'processed' });
                } else {
                    results.push({ name: emp.name, salary: emp.salary, status: 'skipped' });
                }
            }

            // Auto Journal Entry for Bulk Payroll
            if (totalPayroll > 0) {
                const salaryAccount = await tx.account.findFirst({ where: { code: '5101' } });
                const cashAccount = await tx.account.findFirst({ where: { code: '1101' } });
                
                if (salaryAccount && cashAccount) {
                    await tx.transaction.create({
                        data: {
                            date: new Date(),
                            description: `صرف رواتب جماعي - ${month}/${year}`,
                            reference: `BULK-SAL-${month}-${year}-${Date.now()}`,
                            type: 'JOURNAL',
                            entries: {
                                create: [
                                    { accountId: salaryAccount.id, debit: totalPayroll, credit: 0, description: `إجمالي رواتب ${month}/${year}` },
                                    { accountId: cashAccount.id, debit: 0, credit: totalPayroll, description: `صرف رواتب ${month}/${year}` },
                                ]
                            }
                        }
                    });
                    await tx.account.update({ where: { id: salaryAccount.id }, data: { balance: { increment: totalPayroll } } });
                    await tx.account.update({ where: { id: cashAccount.id }, data: { balance: { increment: -totalPayroll } } });
                }
            }
            return { results, totalPayroll };
        });

        res.json({ success: true, results: result.results, total: result.totalPayroll });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── Salary Records ─────────────────────────────────────────────
router.get('/salary-records', async (req, res) => {
    try {
        const { month, year } = req.query;
        const where = {};
        if (month) where.month = parseInt(month);
        if (year) where.year = parseInt(year);
        const records = await prisma.salaryRecord.findMany({
            where,
            include: { employee: true },
            orderBy: { paymentDate: 'desc' }
        });
        res.json(records);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ─── HR Summary for Dashboard ────────────────────────────────────
router.get('/hr-summary', async (req, res) => {
    try {
        const now = new Date();
        const thisMonth = now.getMonth() + 1;
        const thisYear = now.getFullYear();

        const [totalEmployees, activeEmployees, onLeave, totalSalaryCost, paidThisMonth, departments] = await Promise.all([
            prisma.employee.count(),
            prisma.employee.count({ where: { status: 'ACTIVE' } }),
            prisma.employee.count({ where: { status: 'ON_LEAVE' } }),
            prisma.employee.aggregate({ _sum: { salary: true }, where: { status: 'ACTIVE' } }),
            prisma.salaryRecord.aggregate({ _sum: { netSalary: true }, where: { month: thisMonth, year: thisYear } }),
            prisma.employee.groupBy({ by: ['department'], _count: { id: true } }),
        ]);

        res.json({
            totalEmployees, activeEmployees, onLeave,
            totalSalaryCost: totalSalaryCost._sum.salary || 0,
            paidThisMonth: paidThisMonth._sum.netSalary || 0,
            departments: departments.filter(d => d.department).map(d => ({ name: d.department, count: d._count.id }))
        });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
