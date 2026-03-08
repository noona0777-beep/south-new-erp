import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './components/Login';
import InvoicesPage from './components/Invoices/InvoicesPage';
import InvoicePrint from './components/Invoices/InvoicePrint';
import InventoryPage from './components/Inventory/InventoryPage';
import ClientsPage from './components/Clients/ClientsPage';
import QuotesPage from './components/Quotes/QuotesPage';
import QuotePrint from './components/Quotes/QuotePrint';
import ProjectsPage from './components/Projects/ProjectsPage';
import HRPage from './components/HR/HRPage';
import RealEstatePage from './components/RealEstate/RealEstatePage';
import ClientStatement from './components/Clients/ClientStatement';
import ReportsPage from './components/Reports/ReportsPage';
import SettingsPage from './components/Settings/SettingsPage';
import ZatcaDashboard from './components/Settings/ZatcaDashboard';
import AccountingPage from './components/Accounting/AccountingPage';
import DocumentsPage from './components/Documents/DocumentsPage';
import ContractsPage from './components/Contracts/ContractsPage';
import ContractPrint from './components/Contracts/ContractPrint';
import FieldOpsPage from './components/FieldOps/FieldOpsPage';
import DataRecordSummary from './components/Common/DataRecordSummary';
import ClientLayout from './components/ClientPortal/ClientLayout';
import CRMDashboard from './components/CRM/CRMDashboard';
import LeadsPage from './components/CRM/LeadsPage';
import PipelineKanban from './components/CRM/PipelineKanban';
import AIDashboard from './components/AI/AIDashboard';
import API_URL from '@/config';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { buttonClick, fadeInUp } from './components/Common/MotionComponents';
import { ToastProvider, useToast } from './context/ToastContext';
import { PermissionProvider, usePermission } from './context/PermissionContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
});

// Global Axios Config
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

import {
    LayoutDashboard, ShoppingCart, Users, Briefcase, Building2,
    DollarSign, FileBarChart2, Settings, Bell, Search, Menu, X,
    ChevronLeft, FileText, Folder, UserPlus, Package, AlertOctagon, LogOut, Languages, ShieldCheck, Activity, HardHat, Target, TrendingUp, Brain
} from 'lucide-react';

/* --- UI Components --- */

const NavLink = ({ to, icon, label, active, onClick, i18n }) => {
    const isRtl = i18n.language === 'ar';
    return (
        <motion.div {...buttonClick}>
            <Link to={to} onClick={onClick} className="card-hover" style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 18px',
                color: active ? '#fff' : '#94a3b8',
                background: active ? '#2563eb' : 'transparent',
                textDecoration: 'none',
                borderRadius: '10px',
                marginBottom: '6px',
                transition: 'all 0.3s ease',
                fontSize: '1rem',
                fontWeight: active ? '600' : '400',
                flexDirection: isRtl ? 'row' : 'row-reverse',
                textAlign: isRtl ? 'right' : 'left'
            }}>
                {React.cloneElement(icon, { size: 20 })}
                <span style={{ flex: 1 }}>{label}</span>
                {active && (
                    <motion.div
                        initial={{ x: isRtl ? 10 : -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        style={{ marginLeft: isRtl ? 'auto' : '0', marginRight: isRtl ? '0' : 'auto' }}
                    >
                        {isRtl ? <ChevronLeft size={16} /> : <div style={{ transform: 'rotate(180deg)' }}><ChevronLeft size={16} /></div>}
                    </motion.div>
                )}
            </Link>
        </motion.div>
    );
};

const HeaderStat = ({ title, value, subtext, icon, color }) => (
    <motion.div
        {...buttonClick}
        className="glass-card premium-shadow card-hover fade-in"
        style={{
            padding: '24px', borderRadius: '16px',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}
    >
        <div>
            <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>{title}</h4>
            <p style={{ margin: '0 0 5px 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a', fontFamily: 'Cairo' }}>{value}</p>
            <span style={{ fontSize: '0.85rem', color: subtext?.includes('+') ? '#10b981' : '#ef4444', fontWeight: 'bold', background: subtext?.includes('+') ? '#ecfdf5' : '#fef2f2', padding: '2px 8px', borderRadius: '12px' }}>
                {subtext}
            </span>
        </div>
        <div style={{ padding: '12px', background: `${color}20`, borderRadius: '12px', color: color }}>
            {React.cloneElement(icon, { size: 24 })}
        </div>
    </motion.div>
);

const Dashboard = () => {
    const { t } = useTranslation();
    const [user] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'المستخدم' });

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: async () => (await axios.get(`${API_URL}/dashboard/stats`)).data
    });

    const { data: companyInfo } = useQuery({
        queryKey: ['companyInfo'],
        queryFn: async () => (await axios.get(`${API_URL}/settings/companyInfo`)).data,
        initialData: {}
    });

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: t('welcome') + ' ' + (t('welcome_morning') || 'صباح الخير'), icon: '☀️' };
        if (hour < 18) return { text: t('welcome') + ' ' + (t('welcome_day') || 'طاب يومك'), icon: '🌤️' };
        return { text: t('welcome') + ' ' + (t('welcome_evening') || 'مساء الخير'), icon: '🌙' };
    };
    const greeting = getGreeting();

    const formatMoney = (val) => {
        if (!val) return '0';
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
        return typeof val === 'number' ? val.toFixed(0) : val;
    };

    if (statsLoading) {
        return (
            <div style={{ marginTop: '10px' }}>
                <div className="glass-card premium-shadow animate-pulse" style={{ height: '200px', borderRadius: '24px', background: '#f1f5f9', marginBottom: '35px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="glass-card premium-shadow animate-pulse" style={{ height: '140px', borderRadius: '16px', background: '#f1f5f9' }} />
                    ))}
                </div>
            </div>
        );
    }

    const chartData = stats?.monthlyRevenue || [];
    const maxVal = Math.max(...chartData.map(d => d.value), 1);
    const statusLabel = (s) => ({ DRAFT: 'مسودة', POSTED: 'مرسلة', PAID: 'مدفوعة', ACCEPTED: 'مقبول', REJECTED: 'مرفوض', SENT: 'تم الإرسال' }[s] || s);
    const statusColor = (s) => ({ DRAFT: '#94a3b8', POSTED: '#3b82f6', PAID: '#10b981', ACCEPTED: '#10b981', REJECTED: '#ef4444', SENT: '#f59e0b' }[s] || '#94a3b8');

    return (
        <div style={{ marginTop: '10px' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="aurora-bg pulse-glow"
                style={{ marginBottom: '35px', padding: '32px', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)' }}
            >
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '2.5rem' }}>{greeting.icon}</span>
                        <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-0.5px' }}>{greeting.text}، {user.name}</h2>
                    </div>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem', fontWeight: '500', maxWidth: '600px', lineHeight: '1.5' }}>
                        {t('welcome_desc', 'أهلاً بك في نظام إدارة موارد')} {companyInfo.name || 'مؤسسة الجنوب الجديد'}. {t('welcome_sub', 'إليك نظرة سريعة على أداء المؤسسة.')}
                    </p>
                </div>
            </motion.div>

            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <HeaderStat title="إجمالي الإيرادات" value={`${formatMoney(stats?.totals?.revenue)} ر.س`} subtext={`${stats?.totals?.invoices || 0} فاتورة`} icon={<DollarSign />} color="#2563eb" />
                <HeaderStat title="العملاء المسجلون" value={stats?.totals?.clients || 0} subtext={`+${stats?.quickStats?.activeProjects || 0} مشروع نشط`} icon={<UserPlus />} color="#10b981" />
                <HeaderStat title="عروض الأسعار" value={stats?.totals?.quotes || 0} subtext={`${stats?.quickStats?.pendingQuotes || 0} معلقة`} icon={<FileText />} color="#8b5cf6" />
                <HeaderStat title="المنتجات في المخزن" value={stats?.totals?.products || 0} subtext={stats?.quickStats?.lowStockCount > 0 ? `⚠️ ${stats.quickStats.lowStockCount} نقص` : '✅ مخزون جيد'} icon={<Package />} color="#f59e0b" />
            </div>

            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <div className="card-hover fade-in" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 'bold' }}>تحليل الإيرادات والنمو</h3>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>مقارنة أداء المبيعات الشهور الأخيرة</span>
                        </div>
                        <div style={{ background: '#eff6ff', padding: '8px 16px', borderRadius: '20px', color: '#2563eb', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(37,99,235,0.1)' }}>
                            {formatMoney(stats?.totals?.revenue)} ر.س إجمالي
                        </div>
                    </div>

                    <div style={{ flex: 1, width: '100%', minHeight: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(val) => formatMoney(val)}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                        fontFamily: 'Cairo',
                                        direction: 'rtl',
                                        padding: '12px'
                                    }}
                                    formatter={(value) => [`${value?.toLocaleString()} ر.س`, 'الإيرادات']}
                                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {stats?.lowStock?.length > 0 && (
                        <div className="card-hover fade-in" style={{ background: '#fff7ed', padding: '16px', borderRadius: '14px', border: '1px solid #fed7aa' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#c2410c', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <AlertOctagon size={16} /> تنبيه نقص المخزون
                            </h4>
                            {stats.lowStock.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < stats.lowStock.length - 1 ? '1px solid #fed7aa' : 'none', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#7c2d12', fontWeight: '500' }}>{item.name}</span>
                                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{item.quantity} ق</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="card-hover fade-in" style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #f1f5f9', flex: 1 }}>
                        <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '0.95rem' }}>ملخص سريع</h4>
                        {[
                            { label: 'المشاريع النشطة', value: stats?.quickStats?.activeProjects || 0, color: '#2563eb', bg: '#eff6ff' },
                            { label: 'عروض مقبولة', value: stats?.quickStats?.acceptedQuotes || 0, color: '#10b981', bg: '#ecfdf5' },
                            { label: 'عروض معلقة', value: stats?.quickStats?.pendingQuotes || 0, color: '#f59e0b', bg: '#fffbeb' },
                            { label: 'الموظفون', value: stats?.totals?.employees || 0, color: '#8b5cf6', bg: '#f5f3ff' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid #f8fafc' : 'none' }}>
                                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{item.label}</span>
                                <span style={{ background: item.bg, color: item.color, padding: '3px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.9rem' }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="card-hover fade-in" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>آخر الفواتير</h3>
                        <Link to="/invoices" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none' }}>عرض الكل ←</Link>
                    </div>
                    {stats?.recentInvoices?.map((inv, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < stats.recentInvoices.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#1e293b' }}>{inv.number}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{inv.client}</div>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '0.875rem' }}>{formatMoney(inv.amount)} ر.س</div>
                                <span style={{ fontSize: '0.7rem', color: statusColor(inv.status), fontWeight: 'bold' }}>{statusLabel(inv.status)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card-hover fade-in" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>آخر عروض الأسعار</h3>
                        <Link to="/quotes" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none' }}>عرض الكل ←</Link>
                    </div>
                    {stats?.recentQuotes?.map((qt, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < stats.recentQuotes.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#1e293b' }}>{qt.number}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{qt.client}</div>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '0.875rem' }}>{formatMoney(qt.amount)} ر.س</div>
                                <span style={{ fontSize: '0.7rem', color: statusColor(qt.status), fontWeight: 'bold' }}>{statusLabel(qt.status)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* --- Layout --- */

const Layout = ({ user, onLogout }) => {
    const { t, i18n } = useTranslation();
    const { hasPermission } = usePermission();
    const isRtl = i18n.language === 'ar';
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const [currentTime, setCurrentTime] = useState(new Date());
    const { data: companyInfo } = useQuery({
        queryKey: ['companyInfo'],
        queryFn: async () => (await axios.get(`${API_URL}/settings/companyInfo`)).data,
        initialData: {}
    });

    const { data: notifications = [], refetch: refetchNotifications } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            await axios.post(`${API_URL}/notifications/refresh`);
            return (await axios.get(`${API_URL}/notifications`)).data;
        },
        refetchInterval: 30000,
    });

    const markAllAsRead = async () => {
        await axios.put(`${API_URL}/notifications/read-all`);
        refetchNotifications();
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 1) {
            try {
                const res = await axios.get(`${API_URL}/search?q=${query}`);
                setSearchResults(res.data);
                setShowSearchResults(true);
            } catch (err) {
                console.error('Search failed', err);
            }
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
    };

    return (
        <div style={{ display: 'flex', height: '100vh', direction: isRtl ? 'rtl' : 'ltr', fontFamily: 'Cairo, sans-serif', background: '#f8fafc', position: 'relative' }}>
            {isSidebarOpen && <div className="sidebar-overlay show-mobile" onClick={closeSidebar} />}

            <div className={`sidebar-scroll no-print ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} style={{
                width: '280px', background: '#0f172a', color: 'white', padding: '24px',
                display: 'flex', flexDirection: 'column', overflowY: 'auto',
                boxShadow: isRtl ? '4px 0 20px rgb(0 0 0 / 0.05)' : '-4px 0 20px rgb(0 0 0 / 0.05)',
                zIndex: 50,
                position: window.innerWidth > 768 ? 'sticky' : 'fixed',
                top: 0,
                right: isRtl ? 0 : 'auto',
                left: isRtl ? 'auto' : 0,
                bottom: 0, height: '100vh',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div style={{ marginBottom: '40px', textAlign: 'center', paddingBottom: '24px', borderBottom: '1px solid #1e293b', position: 'relative' }}>
                    <button className="show-mobile" onClick={closeSidebar} style={{ position: 'absolute', left: '-10px', top: '-10px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                    <div className="logo-emblem" style={{ marginBottom: '20px' }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '150px', height: 'auto', display: 'block', margin: '0 auto' }} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>{companyInfo.name || 'مؤسسة الجنوب الجديد'}</h2>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {hasPermission('dashboard') && <NavLink to="/" icon={<LayoutDashboard />} label={t('dashboard')} active={isActive('/')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('invoices') && <NavLink to="/invoices" icon={<ShoppingCart />} label={t('sales_invoices')} active={isActive('/invoices')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('quotes') && <NavLink to="/quotes" icon={<FileText />} label={t('quotes')} active={isActive('/quotes')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('inventory') && <NavLink to="/inventory" icon={<Package />} label={t('inventory')} active={isActive('/inventory')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('clients') && <NavLink to="/clients" icon={<Users />} label={t('clients')} active={isActive('/clients')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('projects') && <NavLink to="/projects" icon={<Briefcase />} label={t('projects')} active={isActive('/projects')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('contracts') && <NavLink to="/contracts" icon={<FileText />} label={t('contracts')} active={isActive('/contracts')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('accounting') && <NavLink to="/accounting" icon={<DollarSign />} label={t('accounting')} active={isActive('/accounting')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('hr') && <NavLink to="/hr" icon={<Users />} label={t('hr')} active={isActive('/hr')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('real_estate') && <NavLink to="/real-estate" icon={<Building2 />} label={t('real_estate')} active={isActive('/real-estate')} i18n={i18n} onClick={closeSidebar} />}
                    {hasPermission('archive') && <NavLink to="/archive" icon={<Folder />} label={t('archive')} active={isActive('/archive')} i18n={i18n} onClick={closeSidebar} />}
                    {hasPermission('reports') && <NavLink to="/reports" icon={<FileBarChart2 />} label={t('reports')} active={isActive('/reports')} i18n={i18n} onClick={closeSidebar} />}
                    {hasPermission('all') && <NavLink to="/field-ops" icon={<HardHat />} label={t('field_ops', 'الإشراف الميداني')} active={isActive('/field-ops')} i18n={i18n} onClick={closeSidebar} />}
                    {hasPermission('all') && <NavLink to="/crm" icon={<TrendingUp />} label={t('crm_dashboard', 'لوحة المبيعات')} active={isActive('/crm')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('all') && <NavLink to="/crm/leads" icon={<Target />} label={t('crm_leads', 'العملاء المحتملين')} active={isActive('/crm/leads')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('all') && <NavLink to="/crm/pipeline" icon={<Activity />} label={t('crm_pipeline', 'مسار المبيعات')} active={isActive('/crm/pipeline')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('all') && <NavLink to="/ai" icon={<Brain />} label={'مركز الذكاء الاصطناعي'} active={isActive('/ai')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('all') && <NavLink to="/zatca" icon={<ShieldCheck />} label={t('zatca_dashboard', 'مراقبة زاتكا')} active={isActive('/zatca')} i18n={i18n} onClick={closeSidebar} />}
                    <NavLink to="/users" icon={<Settings />} label={t('settings')} active={isActive('/users')} i18n={i18n} onClick={closeSidebar} />
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #1e293b' }}>
                    <div style={{ background: '#1e293b', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <img src="/naif.png" alt="Naif" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>{user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '700' }}>Naif</div>
                        </div>
                        <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className={window.innerWidth > 768 ? 'main-content-fluid' : ''} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <header className="fade-in no-print" style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    padding: '12px 30px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #f1f5f9',
                    zIndex: 20
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'center' }}>
                        <button className="show-mobile" onClick={toggleSidebar} style={{ position: 'absolute', right: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '10px' }}>
                            <Menu size={20} />
                        </button>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
                            <Search size={18} style={{ position: isRtl ? 'absolute' : 'none', right: isRtl ? '14px' : 'auto', left: isRtl ? 'auto' : '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                value={searchQuery}
                                onChange={handleSearch}
                                style={{ width: '100%', padding: isRtl ? '12px 45px 12px 15px' : '12px 15px 12px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'rgba(248, 250, 252, 0.8)', outline: 'none', fontFamily: 'Cairo' }}
                            />
                            <AnimatePresence>
                                {showSearchResults && (
                                    <motion.div {...fadeInUp} style={{ ...glassStyle, position: 'absolute', top: '45px', right: 0, left: 0, borderRadius: '16px', zIndex: 1000, maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                                        {searchResults.map((res, i) => (
                                            <Link key={i} to={res.link} onClick={() => setShowSearchResults(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}>
                                                <div style={{ padding: '8px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px' }}>
                                                    {res.type === 'client' && <Users size={16} />}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{res.title}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{res.subtitle}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {/* Language Switcher */}
                        <motion.button
                            {...buttonClick}
                            onClick={() => i18n.changeLanguage(isRtl ? 'en' : 'ar')}
                            style={{
                                padding: '8px 12px',
                                background: 'rgba(248, 250, 252, 0.8)',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                color: '#64748b',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: 'bold'
                            }}
                        >
                            <Languages size={18} />
                            <span>{isRtl ? 'English' : 'عربي'}</span>
                        </motion.button>

                        <div style={{ position: 'relative' }}>
                            <motion.div {...buttonClick} onClick={() => setShowNotifications(!showNotifications)} style={{ cursor: 'pointer', padding: '8px', background: 'rgba(248, 250, 252, 0.8)', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <Bell size={20} color={notifications.some(n => !n.isRead) ? '#2563eb' : '#64748b'} />
                                {notifications.some(n => !n.isRead) && (
                                    <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
                                )}
                            </motion.div>
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div {...fadeInUp} style={{ ...glassStyle, position: 'absolute', top: '50px', left: isRtl ? '0' : 'auto', right: isRtl ? 'auto' : '0', width: '320px', borderRadius: '16px', zIndex: 100, padding: '16px', direction: isRtl ? 'rtl' : 'ltr' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{t('notifications')}</h4>
                                            <button onClick={markAllAsRead} style={{ color: '#2563eb', border: 'none', background: 'none', fontSize: '0.8rem', cursor: 'pointer' }}>{t('mark_read')}</button>
                                        </div>
                                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                            {notifications.map(n => (
                                                <div key={n.id} style={{ padding: '10px', borderRadius: '8px', background: n.isRead ? 'transparent' : 'rgba(37, 99, 235, 0.05)', marginBottom: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{n.title}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{n.message}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>
                <main style={{ flex: 1, padding: '24px 40px', overflowY: 'auto' }}>
                    <AnimatePresence mode="wait">
                        <motion.div key={location.pathname} initial="initial" animate="animate" exit="exit" variants={fadeInUp}>
                            <Routes location={location}>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/invoices" element={<InvoicesPage />} />
                                <Route path="/quotes" element={<QuotesPage />} />
                                <Route path="/inventory" element={<InventoryPage />} />
                                <Route path="/clients" element={<ClientsPage />} />
                                <Route path="/projects" element={<ProjectsPage />} />
                                <Route path="/contracts" element={<ContractsPage />} />
                                <Route path="/hr" element={<HRPage />} />
                                <Route path="/accounting" element={<AccountingPage />} />
                                <Route path="/real-estate" element={<RealEstatePage />} />
                                <Route path="/archive" element={<DocumentsPage />} />
                                <Route path="/reports" element={<ReportsPage />} />
                                <Route path="/field-ops" element={<FieldOpsPage />} />
                                <Route path="/crm" element={<CRMDashboard />} />
                                <Route path="/crm/leads" element={<LeadsPage />} />
                                <Route path="/crm/pipeline" element={<PipelineKanban />} />
                                <Route path="/ai" element={<AIDashboard />} />
                                <Route path="/zatca" element={<ZatcaDashboard />} />
                                <Route path="/users" element={<SettingsPage />} />
                            </Routes>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

const AppContent = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try { setUser(JSON.parse(savedUser)); } catch (e) { localStorage.removeItem('user'); }
        }
        setLoading(false);
    }, []);

    if (loading) return null;

    return (
        !user ? (
            <Login onSuccess={setUser} />
        ) : user.role === 'CLIENT' ? (
            <Routes>
                <Route path="/*" element={<ClientLayout user={user} onLogout={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); }} />} />
            </Routes>
        ) : (
            <Routes>
                <Route path="/invoices/:id/print" element={<InvoicePrint />} />
                <Route path="/quotes/:id/print" element={<QuotePrint />} />
                <Route path="/contracts/:id/print" element={<ContractPrint />} />
                <Route path="/clients/:id/statement" element={<ClientStatement />} />
                <Route path="/archive/summary/:type/:id" element={<DataRecordSummary />} />
                <Route path="/*" element={<Layout user={user} onLogout={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); }} />} />
            </Routes>
        )
    );
};

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <PermissionProvider>
                    <BrowserRouter>
                        <AppContent />
                    </BrowserRouter>
                </PermissionProvider>
            </ToastProvider>
        </QueryClientProvider>
    );
}

export default App;
