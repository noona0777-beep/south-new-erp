const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fullDataAudit() {
    console.log("--- 📊 جرد شامل لجميع بيانات النظام 📊 ---");
    try {
        await prisma.$connect();

        const audit = {
            "لوحة القيادة و المبيعات": {
                "عدد الفواتير": await prisma.invoice.count(),
                "عدد بنود الفواتير": await prisma.invoiceItem.count(),
                "عدد عروض الأسعار": await prisma.quote.count(),
                "عدد بنود عروض الأسعار": await prisma.quoteItem.count(),
            },
            "المخزون": {
                "عدد المستودعات": await prisma.warehouse.count(),
                "عدد الأقسام (Categories)": await prisma.category.count(),
                "عدد المنتجات": await prisma.product.count(),
                "عدد سجلات المخزون": await prisma.stock.count(),
                "عدد حركات المخزون": await prisma.stockMovement.count(),
            },
            "العملاء والمشاريع": {
                "عدد الشركاء/العملاء": await prisma.partner.count(),
                "عدد المشاريع": await prisma.project.count(),
                "عدد عقود المقاولات": await prisma.constructionContract.count(),
                "عدد المهام": await prisma.task.count(),
            },
            "المحاسبة والمالية": {
                "عدد الحسابات (شجرة الحسابات)": await prisma.account.count(),
                "عدد المعاملات (Transactions)": await prisma.transaction.count(),
                "عدد قيود اليومية": await prisma.journalEntry.count(),
                "عدد عمليات الدفع (Payments)": await prisma.payment.count(),
            },
            "الموارد البشرية": {
                "عدد الموظفين": await prisma.employee.count(),
                "عدد سجلات الحضور": await prisma.attendanceRecord.count(),
                "عدد رواتب الموظفين": await prisma.salaryRecord.count(),
                "عدد تقييمات المهندسين": await prisma.engineerScore.count(),
            },
            "CRM (المبيعات)": {
                "عدد العملاء المحتملين (Leads)": await prisma.lead.count(),
                "عدد الفرص البيعية (Opportunities)": await prisma.opportunity.count(),
                "عدد التفاعلات (Activities)": await prisma.cRMActivity.count(),
            },
            "بوابة العميل و الإشراف الميداني": {
                "عدد تذاكر الدعم": await prisma.supportTicket.count(),
                "عدد رسائل التذاكر": await prisma.ticketMessage.count(),
                "عدد الزيارات الميدانية": await prisma.siteVisit.count(),
                "عدد تقارير الذكاء الاصطناعي": await prisma.aIReport.count(),
                "عدد المستندات (الأرشيف)": await prisma.document.count(),
            },
            "الإعدادات والمستخدمين": {
                "عدد المستخدمين (النظام)": await prisma.user.count(),
                "عدد إعدادات النظام": await prisma.settings.count(),
                "عدد الإشعارات": await prisma.notification.count(),
            }
        };

        for (const [section, data] of Object.entries(audit)) {
            console.log(`\n📂 [${section}]`);
            for (const [key, value] of Object.entries(data)) {
                const status = value > 0 ? "✅" : "⚠️ (فارغ)";
                console.log(`  ${status} ${key}: ${value}`);
            }
        }

        console.log("\n--- ✅ انتهى الجرد الشامل ---");
        console.log("ملاحظة: إذا كانت الأرقام تظهر، فإن البيانات موجودة في السحابة ومستقرة.");

    } catch (error) {
        console.error("❌ خطأ أثناء الجرد:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fullDataAudit();
