import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    ar: {
        translation: {
            "dashboard": "لوحة القيادة",
            "sales_invoices": "المبيعات والفواتير",
            "quotes": "عروض الأسعار",
            "inventory": "المخزون",
            "clients": "العملاء",
            "projects": "المشاريع والمقاولات",
            "contracts": "عقود المقاولات",
            "accounting": "المحاسبة والمالية",
            "hr": "الموارد البشرية",
            "real_estate": "إدارة الأملاك",
            "archive": "الأرشيف والوثائق",
            "reports": "التقارير",
            "settings": "الإعدادات",
            "logout": "تسجيل الخروج",
            "search_placeholder": "بحث شامل في أرشيف المشروع والنظام...",
            "notifications": "التنبيهات المركزية",
            "mark_read": "تحديد المقروء",
            "welcome": "أهلاً بك",
            "revenue": "الإيرادات",
            "active_projects": "المشاريع النشطة",
            "pending_quotes": "عروض معلقة",
            "low_stock": "نقص المخزون",
            "quick_summary": "ملخص سريع"
        }
    },
    en: {
        translation: {
            "dashboard": "Dashboard",
            "sales_invoices": "Sales & Invoices",
            "quotes": "Quotes",
            "inventory": "Inventory",
            "clients": "Clients",
            "projects": "Projects & Contracting",
            "contracts": "Contracting Contracts",
            "accounting": "Accounting & Finance",
            "hr": "Human Resources",
            "real_estate": "Real Estate Management",
            "archive": "Archive & Documents",
            "reports": "Reports",
            "settings": "Settings",
            "logout": "Logout",
            "search_placeholder": "Global search in project archive...",
            "notifications": "Central Notifications",
            "mark_read": "Mark as read",
            "welcome": "Welcome",
            "revenue": "Revenue",
            "active_projects": "Active Projects",
            "pending_quotes": "Pending Quotes",
            "low_stock": "Low Stock",
            "quick_summary": "Quick Summary"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'ar',
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

export default i18n;
