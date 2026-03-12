import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
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
import AdminSupportPage from './components/Support/AdminSupportPage';
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
    ChevronLeft, FileText, Folder, UserPlus, Package, AlertOctagon, LogOut, Languages, ShieldCheck, Activity, HardHat, Target, TrendingUp, Brain, MessageSquare
} from 'lucide-react';

/* --- UI Components --- */

const NavLink = ({ to, icon, label, active, onClick, i18n }) => {
    const isRtl = i18n.language === 'ar';
    return (
        <motion.div {...buttonClick}>
            <Link to={to} onClick={onClick} className="nav-link-premium" style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 20px',
                color: active ? '#fff' : '#94a3b8',
                background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                textDecoration: 'none',
                borderRadius: '16px',
                marginBottom: '4px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: '0.95rem',
                fontWeight: active ? '700' : '500',
                border: active ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                flexDirection: isRtl ? 'row' : 'row-reverse',
                textAlign: isRtl ? 'right' : 'left',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {active && <motion.div layoutId="activeNav" style={{ position: 'absolute', left: isRtl ? 0 : 'auto', right: isRtl ? 'auto' : 0, width: '4px', height: '60%', background: '#6366f1', borderRadius: '4px' }} />}
                <div style={{ color: active ? '#818cf8' : 'inherit' }}>
                    {React.cloneElement(icon, { size: 20 })}
                </div>
                <span style={{ flex: 1 }}>{label}</span>
                {active && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <ChevronLeft size={16} style={{ transform: isRtl ? 'none' : 'rotate(180deg)', opacity: 0.5 }} />
                    </motion.div>
                )}
            </Link>
        </motion.div>
    );
};

const HeaderStat = ({ title, value, subtext, icon, color }) => (
    <motion.div
        {...buttonClick}
        className="glass-card card-hover fade-in"
        style={{
            padding: '28px', borderRadius: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden'
        }}
    >
        <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', background: `${color}10`, borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#a1a1aa', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h4>
            <p style={{ margin: '0 0 8px 0', fontSize: '2.2rem', fontWeight: '800', color: '#fff', fontFamily: 'Outfit, Cairo' }}>{value}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                    fontSize: '0.8rem', 
                    color: subtext?.includes('+') ? '#10b981' : '#ef4444', 
                    fontWeight: '800', 
                    background: subtext?.includes('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    padding: '4px 10px', 
                    borderRadius: '20px',
                    border: `1px solid ${subtext?.includes('+') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                }}>
                    {subtext}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#71717a' }}>vs الشهر الماضي</span>
            </div>
        </div>
        <div style={{ 
            padding: '16px', 
            background: `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)`, 
            borderRadius: '20px', 
            color: color, 
            boxShadow: `0 8px 20px ${color}20`,
            position: 'relative',
            zIndex: 2
        }}>
            {React.cloneElement(icon, { size: 28 })}
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
        const userName = user?.name || 'المستخدم';
        if (hour < 12) return { text: `صباح الخير، ${userName}`, icon: '☀️' };
        if (hour < 18) return { text: `طابت أوقاتك، ${userName}`, icon: '🌤️' };
        return { text: `مساء الخير، ${userName}`, icon: '🌙' };
    };
    const greeting = getGreeting();

    const formatMoney = (val) => {
        if (!val) return '0';
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
        return typeof val === 'number' ? val.toLocaleString() : val;
    };

    if (statsLoading) {
        return (
            <div style={{ marginTop: '10px' }}>
                <div className="glass-card animate-pulse" style={{ height: '200px', borderRadius: '30px', marginBottom: '35px', background: 'rgba(255,255,255,0.02)' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="glass-card animate-pulse" style={{ height: '140px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)' }} />
                    ))}
                </div>
            </div>
        );
    }

    const chartData = stats?.monthlyRevenue || [];
    const statusLabel = (s) => ({ DRAFT: 'مسودة', POSTED: 'مرسلة', PAID: 'مدفوعة', ACCEPTED: 'مقبول', REJECTED: 'مرفوض', SENT: 'تم الإرسال' }[s] || s);
    const statusColor = (s) => ({ DRAFT: '#94a3b8', POSTED: '#6366f1', PAID: '#10b981', ACCEPTED: '#10b981', REJECTED: '#ef4444', SENT: '#f59e0b' }[s] || '#94a3b8');

    return (
        <div style={{ marginTop: '10px' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                    marginBottom: '35px', 
                    padding: '40px', 
                    borderRadius: '35px', 
                    color: 'white', 
                    position: 'relative', 
                    overflow: 'hidden', 
                    background: 'linear-gradient(225deg, #4f46e5 0%, #06b6d4 100%)',
                    boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.3)'
                }}
            >
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")', opacity: 0.05 }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                        <span style={{ fontSize: '3rem' }}>{greeting.icon}</span>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>{greeting.text}</h2>
                            <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '1.1rem', fontWeight: '500' }}>
                                {t('welcome_desc', 'نظام إدارة موارد')} {companyInfo.name || 'مؤسسة الجنوب الجديد'} • {new Date().toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '35px' }}>
                <HeaderStat title="إجمالي الإيرادات" value={`${formatMoney(stats?.totals?.revenue)} ر.س`} subtext={`${stats?.totals?.invoices || 0} فاتورة`} icon={<DollarSign />} color="#818cf8" />
                <HeaderStat title="العملاء المسجلون" value={stats?.totals?.clients || 0} subtext={`+${stats?.quickStats?.activeProjects || 0} مشروع نشط`} icon={<UserPlus />} color="#4fd1c5" />
                <HeaderStat title="عروض الأسعار" value={stats?.totals?.quotes || 0} subtext={`${stats?.quickStats?.pendingQuotes || 0} معلقة`} icon={<FileText />} color="#c084fc" />
                <HeaderStat title="المنتجات في المخزن" value={stats?.totals?.products || 0} subtext={stats?.quickStats?.lowStockCount > 0 ? `⚠️ ${stats.quickStats.lowStockCount} نقص` : '✅ مخزون جيد'} icon={<Package />} color="#fbbf24" />
            </div>

            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '30px' }}>
                <div className="glass-card card-hover" style={{ padding: '30px', borderRadius: '30px', minHeight: '450px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '35px', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: '800' }}>تحليل الإيرادات والنمو</h3>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#a1a1aa' }}>تطور المبيعات خلال الـ 12 شهراً الماضية</p>
                        </div>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px 20px', borderRadius: '15px', color: '#818cf8', fontSize: '0.9rem', fontWeight: '800', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            النمو السنوي +12.5%
                        </div>
                    </div>

                    <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }}
                                    tickFormatter={(val) => formatMoney(val)}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(9, 9, 11, 0.9)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        fontFamily: 'Cairo, Outfit',
                                        direction: 'rtl',
                                        padding: '12px',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value) => [`${value?.toLocaleString()} ر.س`, 'الإيرادات']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass-card card-hover" style={{ padding: '25px', borderRadius: '25px', flex: 1 }}>
                        <h4 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Activity size={20} color="#818cf8" /> مؤشرات الأداء
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {[
                                { label: 'المشاريع المنفذة', value: stats?.quickStats?.activeProjects || 0, color: '#6366f1', total: 50 },
                                { label: 'نسبة التحصيل', value: 85, color: '#10b981', total: 100, suffix: '%' },
                                { label: 'رضا العملاء', value: 92, color: '#f59e0b', total: 100, suffix: '%' },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#a1a1aa', fontWeight: '600' }}>{item.label}</span>
                                        <span style={{ color: '#fff', fontWeight: '800' }}>{item.value}{item.suffix || ''}</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.value / item.total) * 100}%` }}
                                            transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                                            style={{ height: '100%', background: item.color, borderRadius: '10px' }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {stats?.lowStock?.length > 0 && (
                        <div className="glass-card card-hover" style={{ padding: '20px', borderRadius: '25px', border: '1px solid rgba(249, 115, 22, 0.2)', background: 'rgba(249, 115, 22, 0.05)' }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#fb923c', fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <AlertOctagon size={20} /> تنبيهات المخزون
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {stats.lowStock.slice(0, 3).map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>{item.name}</span>
                                        <span style={{ color: '#ef4444', fontWeight: '800', fontSize: '0.85rem' }}>{item.quantity} متبقي</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>


            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <div className="glass-card card-hover" style={{ padding: '30px', borderRadius: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: '800' }}>أحدث العمليات المالية</h3>
                        <Link to="/invoices" style={{ fontSize: '0.85rem', color: '#818cf8', textDecoration: 'none', fontWeight: '700' }}>السجل الكامل</Link>
                    </div>
                    <table className="table-glass">
                        <tbody>
                            {stats?.recentInvoices?.slice(0, 5).map((inv, i) => (
                                <tr key={i}>
                                    <td>
                                        <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>#{inv.number}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '2px' }}>{inv.client}</div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="status-pill" style={{ background: `${statusColor(inv.status)}20`, color: statusColor(inv.status), border: `1px solid ${statusColor(inv.status)}30` }}>
                                            {statusLabel(inv.status)}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: '900', color: '#fff', fontSize: '1.1rem' }}>{formatMoney(inv.amount)}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#52525b' }}>ريال سعودي</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="glass-card card-hover" style={{ padding: '30px', borderRadius: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: '800' }}>عروض الأسعار الأخيرة</h3>
                        <Link to="/quotes" style={{ fontSize: '0.85rem', color: '#818cf8', textDecoration: 'none', fontWeight: '700' }}>كل العروض</Link>
                    </div>
                    <table className="table-glass">
                        <tbody>
                            {stats?.recentQuotes?.slice(0, 5).map((qt, i) => (
                                <tr key={i}>
                                    <td>
                                        <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>#{qt.number}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '2px' }}>{qt.client}</div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="status-pill" style={{ background: `${statusColor(qt.status)}20`, color: statusColor(qt.status), border: `1px solid ${statusColor(qt.status)}30` }}>
                                            {statusLabel(qt.status)}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: '900', color: '#fff', fontSize: '1.1rem' }}>{formatMoney(qt.amount)}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#52525b' }}>ريال سعودي</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
    const navigate = useNavigate();
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

    const handleNotificationClick = async (n) => {
        if (!n.isRead) {
            await axios.put(`${API_URL}/notifications/${n.id}/read`);
            refetchNotifications();
        }
        if (n.link) {
            navigate(n.link);
            setShowNotifications(false);
        }
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
        <div style={{ 
            display: 'flex', 
            height: '100vh', 
            direction: isRtl ? 'rtl' : 'ltr', 
            fontFamily: 'Cairo, Outfit, sans-serif', 
            background: '#09090b', 
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorative Elements */}
            <div style={{ position: 'absolute', top: '10%', right: '5%', width: '400px', height: '400px', background: 'rgba(99, 102, 241, 0.05)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '300px', height: '300px', background: 'rgba(14, 165, 233, 0.05)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }} />

            {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

            {/* Premium Sidebar */}
            <motion.div 
                initial={false}
                animate={{ width: isSidebarOpen || window.innerWidth > 768 ? '280px' : '0px' }}
                className={`no-print ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} 
                style={{
                    background: 'rgba(9, 9, 11, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderLeft: isRtl ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                    borderRight: isRtl ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                    color: 'white', padding: '30px 20px',
                    display: 'flex', flexDirection: 'column',
                    zIndex: 50,
                    position: window.innerWidth > 768 ? 'relative' : 'fixed',
                    top: 0, right: isRtl ? 0 : 'auto', left: isRtl ? 'auto' : 0,
                    bottom: 0, height: '100vh',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden'
                }}
            >
                <div style={{ marginBottom: '40px', textAlign: 'center', position: 'relative' }}>
                    <button className="show-mobile" onClick={closeSidebar} style={{ position: 'absolute', left: isRtl ? 'auto' : '0', right: isRtl ? '0' : 'auto', top: '0', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer', borderRadius: '50%', padding: '8px' }}>
                        <X size={20} />
                    </button>
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        style={{ marginBottom: '15px', color: '#6366f1', display: 'flex', justifyContent: 'center' }}
                    >
                        <img src="/logo.png" alt="Logo" style={{ height: '50px', filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.3))' }} />
                    </motion.div>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', letterSpacing: '0.5px' }} className="gradient-text">
                        {companyInfo.name || 'مؤسسة الجنوب الجديد'}
                    </h2>
                </div>

                <nav className="main-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
                    {hasPermission('dashboard') && <NavLink to="/" icon={<LayoutDashboard />} label={t('dashboard')} active={isActive('/')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('invoices') && <NavLink to="/invoices" icon={<ShoppingCart />} label={t('sales_invoices')} active={isActive('/invoices')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('quotes') && <NavLink to="/quotes" icon={<FileText />} label={t('quotes')} active={isActive('/quotes')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('inventory') && <NavLink to="/inventory" icon={<Package />} label={t('inventory')} active={isActive('/inventory')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('clients') && <NavLink to="/clients" icon={<Users />} label={t('clients')} active={isActive('/clients')} onClick={closeSidebar} i18n={i18n} />}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '15px 10px' }} />
                    {hasPermission('accounting') && <NavLink to="/accounting" icon={<DollarSign />} label={t('accounting')} active={isActive('/accounting')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('hr') && <NavLink to="/hr" icon={<Users />} label={t('hr')} active={isActive('/hr')} onClick={closeSidebar} i18n={i18n} />}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '15px 10px' }} />
                    {hasPermission('projects') && <NavLink to="/projects" icon={<Briefcase />} label={t('projects')} active={isActive('/projects')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('contracts') && <NavLink to="/contracts" icon={<FileText />} label={t('contracts')} active={isActive('/contracts')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('real_estate') && <NavLink to="/real-estate" icon={<Building2 />} label={t('real_estate')} active={isActive('/real-estate')} i18n={i18n} onClick={closeSidebar} />}
                    {hasPermission('archive') && <NavLink to="/archive" icon={<Folder />} label={t('archive')} active={isActive('/archive')} i18n={i18n} onClick={closeSidebar} />}
                    {hasPermission('reports') && <NavLink to="/reports" icon={<FileBarChart2 />} label={t('reports')} active={isActive('/reports')} i18n={i18n} onClick={closeSidebar} />}
                    {hasPermission('all') && <NavLink to="/field-ops" icon={<HardHat />} label={t('field_ops', 'الإشراف الميداني')} active={isActive('/field-ops')} i18n={i18n} onClick={closeSidebar} />}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '15px 10px' }} />
                    {hasPermission('all') && <NavLink to="/crm" icon={<TrendingUp />} label={t('crm_dashboard', 'لوحة المبيعات')} active={isActive('/crm')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('all') && <NavLink to="/crm/leads" icon={<Target />} label={t('crm_leads', 'العملاء المحتملين')} active={isActive('/crm/leads')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('all') && <NavLink to="/crm/pipeline" icon={<Activity />} label={t('crm_pipeline', 'مسار المبيعات')} active={isActive('/crm/pipeline')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('all') && <NavLink to="/ai" icon={<Brain />} label={'AI Advisor مركز الرؤى'} active={isActive('/ai')} onClick={closeSidebar} i18n={i18n} />}
                    {hasPermission('all') && <NavLink to="/zatca" icon={<ShieldCheck />} label={t('zatca_dashboard', 'مراقبة زاتكا')} active={isActive('/zatca')} i18n={i18n} onClick={closeSidebar} />}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '15px 10px' }} />
                    {hasPermission('settings') && <NavLink to="/settings" icon={<Settings />} label={t('settings')} active={isActive('/settings')} i18n={i18n} onClick={closeSidebar} />}
                    {hasPermission('all') && <NavLink to="/support" icon={<MessageSquare />} label={'Tickets الدعم الفني'} active={isActive('/support')} i18n={i18n} onClick={closeSidebar} />}

                </nav>

                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '14px', overflow: 'hidden', border: '2px solid rgba(99, 102, 241, 0.4)' }}>
                            <img src={user.profileImage || "/naif.png"} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '700' }}>{user.role}</div>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.1, color: '#ef4444' }}
                            onClick={onLogout} 
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}
                        >
                            <LogOut size={20} />
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', zIndex: 10, background: 'transparent' }}>
                <header className="fade-in no-print glass-header" style={{
                    padding: '15px 40px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 20
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                        <button className="show-mobile" onClick={toggleSidebar} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px', borderRadius: '14px', color: '#fff' }}>
                            <Menu size={20} />
                        </button>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                            <Search size={18} style={{ 
                                position: 'absolute', 
                                right: isRtl ? '16px' : 'auto', 
                                left: isRtl ? 'auto' : '16px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: '#71717a' 
                            }} />
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                value={searchQuery}
                                onChange={handleSearch}
                                style={{ 
                                    width: '100%', 
                                    padding: isRtl ? '12px 50px 12px 20px' : '12px 20px 12px 50px', 
                                    borderRadius: '16px', 
                                    border: '1px solid rgba(255, 255, 255, 0.08)', 
                                    background: 'rgba(255, 255, 255, 0.03)', 
                                    outline: 'none', 
                                    fontFamily: 'Cairo', 
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.4)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                            />
                            <AnimatePresence>
                                {showSearchResults && searchResults.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="glass-card" 
                                        style={{ position: 'absolute', top: '55px', right: 0, left: 0, borderRadius: '20px', zIndex: 1000, maxHeight: '400px', overflowY: 'auto', padding: '12px' }}
                                    >
                                        {searchResults.map((res, i) => (
                                            <Link key={i} to={res.link} onClick={() => setShowSearchResults(false)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '12px', textDecoration: 'none', color: '#fff', transition: 'background 0.2s' }} className="hover-item">
                                                <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', borderRadius: '12px' }}>
                                                    {res.type === 'client' ? <Users size={18} /> : <FileText size={18} />}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{res.title}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{res.subtitle}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* Time Widget */}
                        <div className="hide-mobile" style={{ marginRight: '20px', textAlign: 'left', direction: 'ltr' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', fontFamily: 'Outfit' }}>
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#71717a', fontWeight: '600' }}>
                                {currentTime.toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </div>
                        </div>

                        {/* Language Switcher */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => i18n.changeLanguage(isRtl ? 'en' : 'ar')}
                            style={{
                                padding: '10px 16px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '14px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.85rem',
                                fontWeight: '700'
                            }}
                        >
                            <Languages size={18} color="#818cf8" />
                            <span className="hide-mobile">{isRtl ? 'English' : 'عربي'}</span>
                        </motion.button>

                        {/* Notifications */}
                        <div style={{ position: 'relative' }}>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowNotifications(!showNotifications)} 
                                style={{ 
                                    cursor: 'pointer', padding: '10px', 
                                    background: 'rgba(255, 255, 255, 0.03)', 
                                    borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)',
                                    color: '#fff', position: 'relative'
                                }}
                            >
                                <Bell size={20} color={notifications.some(n => !n.isRead) ? '#818cf8' : '#fff'} />
                                {notifications.some(n => !n.isRead) && (
                                    <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #09090b' }} />
                                )}
                            </motion.button>
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 15, x: isRtl ? 0 : 0 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 15 }}
                                        className="glass-card" 
                                        style={{ position: 'absolute', top: '60px', left: isRtl ? '0' : 'auto', right: isRtl ? 'auto' : '0', width: '350px', borderRadius: '24px', zIndex: 100, padding: '20px', direction: isRtl ? 'rtl' : 'ltr' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>{t('notifications')}</h4>
                                            <button onClick={markAllAsRead} style={{ color: '#818cf8', border: 'none', background: 'none', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '700' }}>{t('mark_read')}</button>
                                        </div>
                                        <div className="main-scroll" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '30px', color: '#71717a' }}>لا توجد تنبيهات جديدة</div>
                                            ) : notifications.map(n => (
                                                <div 
                                                    key={n.id} 
                                                    onClick={() => handleNotificationClick(n)}
                                                    style={{ 
                                                        cursor: n.link ? 'pointer' : 'default', 
                                                        padding: '12px', borderRadius: '16px', 
                                                        background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.05)', 
                                                        marginBottom: '10px', border: '1px solid rgba(255,255,255,0.03)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    className="hover-item"
                                                >
                                                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: n.isRead ? '#a1a1aa' : '#fff' }}>{n.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '4px' }}>{n.message}</div>
                                                    <div style={{ fontSize: '0.65rem', color: '#52525b', marginTop: '8px' }}>منذ قليل</div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>
                
                <main className="main-scroll" style={{ flex: 1, padding: '30px 40px', background: 'transparent' }}>
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={location.pathname} 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, cubicBezier: [0.23, 1, 0.32, 1] }}
                        >
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
                                <Route path="/settings" element={<SettingsPage />} />
                                <Route path="/users" element={<SettingsPage />} />
                                <Route path="/support" element={<AdminSupportPage />} />
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
        ) : (
            <Routes>
                {/* Public/Shared Printable Routes (Accessible by both Staff and Clients) */}
                <Route path="/invoices/:id/print" element={<InvoicePrint />} />
                <Route path="/quotes/:id/print" element={<QuotePrint />} />
                <Route path="/contracts/:id/print" element={<ContractPrint />} />
                <Route path="/clients/:id/statement" element={<ClientStatement />} />
                <Route path="/archive/summary/:type/:id" element={<DataRecordSummary />} />

                {/* Role-Based Layouts */}
                {user.role === 'CLIENT' ? (
                    <Route path="/*" element={<ClientLayout user={user} onLogout={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); }} />} />
                ) : (
                    <Route path="/*" element={<Layout user={user} onLogout={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); }} />} />
                )}
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
