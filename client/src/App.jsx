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
import AccountingPage from './components/Accounting/AccountingPage';
import DocumentsPage from './components/Documents/DocumentsPage';
import ContractsPage from './components/Contracts/ContractsPage';
import ContractPrint from './components/Contracts/ContractPrint';
import DataRecordSummary from './components/Common/DataRecordSummary';
import API_URL from './config';

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
    ChevronLeft, FileText, Folder, UserPlus, Package, AlertOctagon, LogOut
} from 'lucide-react';

/* --- UI Components --- */

const NavLink = ({ to, icon, label, active, onClick }) => {
    return (
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
            fontWeight: active ? '600' : '400'
        }}>
            {React.cloneElement(icon, { size: 20 })}
            <span>{label}</span>
            {active && <ChevronLeft size={16} style={{ marginRight: 'auto' }} />}
        </Link>
    );
};

const HeaderStat = ({ title, value, subtext, icon, color }) => (
    <div className="card-hover fade-in" style={{
        background: 'white', padding: '24px', borderRadius: '16px',
        border: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
    }}>
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
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [companyInfo, setCompanyInfo] = useState({});
    const [user] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'المستخدم' });

    useEffect(() => {
        // Fetch Stats
        axios.get(`${API_URL}/dashboard/stats`)
            .then(res => { setStats(res.data); setLoading(false); })
            .catch(() => setLoading(false));

        // Fetch Company Info
        axios.get(`${API_URL}/settings/companyInfo`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => setCompanyInfo(res.data))
            .catch(() => { });
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: 'صباح الخير', icon: '☀️' };
        if (hour < 18) return { text: 'طاب يومك', icon: '🌤️' };
        return { text: 'مساء الخير', icon: '🌙' };
    };
    const greeting = getGreeting();

    const formatMoney = (val) => {
        if (!val) return '0';
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
        return val.toFixed(0);
    };

    const chartData = stats?.monthlyRevenue || [];
    const maxVal = Math.max(...chartData.map(d => d.value), 1);

    const statusLabel = (s) => ({ DRAFT: 'مسودة', POSTED: 'مرسلة', PAID: 'مدفوعة', ACCEPTED: 'مقبول', REJECTED: 'مرفوض', SENT: 'تم الإرسال' }[s] || s);
    const statusColor = (s) => ({ DRAFT: '#94a3b8', POSTED: '#3b82f6', PAID: '#10b981', ACCEPTED: '#10b981', REJECTED: '#ef4444', SENT: '#f59e0b' }[s] || '#94a3b8');

    return (
        <div style={{ marginTop: '10px' }}>
            <div className="aurora-bg pulse-glow" style={{ marginBottom: '35px', padding: '32px', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '2.5rem' }}>{greeting.icon}</span>
                        <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-0.5px' }}>{greeting.text}، {user.name}</h2>
                    </div>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem', fontWeight: '500', maxWidth: '600px', lineHeight: '1.5' }}>
                        أهلاً بك في نظام إدارة موارد {companyInfo.name || 'مؤسسة الجنوب الجديد'}. إليك نظرة سريعة على أداء المؤسسة.
                    </p>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '1.1rem' }}>⏳ جاري تحميل الإحصائيات...</div>
            ) : (
                <>
                    <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <HeaderStat title="إجمالي الإيرادات" value={`${formatMoney(stats?.totals?.revenue)} ر.س`} subtext={`${stats?.totals?.invoices || 0} فاتورة`} icon={<DollarSign />} color="#2563eb" />
                        <HeaderStat title="العملاء المسجلون" value={stats?.totals?.clients || 0} subtext={`+${stats?.quickStats?.activeProjects || 0} مشروع نشط`} icon={<UserPlus />} color="#10b981" />
                        <HeaderStat title="عروض الأسعار" value={stats?.totals?.quotes || 0} subtext={`${stats?.quickStats?.pendingQuotes || 0} معلقة`} icon={<FileText />} color="#8b5cf6" />
                        <HeaderStat title="المنتجات في المخزن" value={stats?.totals?.products || 0} subtext={stats?.quickStats?.lowStockCount > 0 ? `⚠️ ${stats.quickStats.lowStockCount} نقص` : '✅ مخزون جيد'} icon={<Package />} color="#f59e0b" />
                    </div>

                    <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                        <div className="card-hover fade-in" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>الإيرادات الشهرية</h3>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>آخر 6 أشهر</span>
                                </div>
                                <div style={{ background: '#eff6ff', padding: '6px 14px', borderRadius: '20px', color: '#2563eb', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                    {formatMoney(stats?.totals?.revenue)} ر.س إجمالي
                                </div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '16px', minHeight: '200px' }}>
                                {chartData.map((d, i) => (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                        <div className="hide-mobile" style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '4px' }}>
                                            {d.value > 0 ? formatMoney(d.value) : ''}
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: `${maxVal > 0 ? Math.max((d.value / maxVal) * 100, d.value > 0 ? 8 : 3) : 3}%`,
                                            background: i === chartData.length - 1 ? 'linear-gradient(to top, #2563eb, #60a5fa)' : '#dbeafe',
                                            borderRadius: '6px 6px 3px 3px',
                                            transition: 'height 0.8s ease'
                                        }} />
                                        <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '0.72rem', fontWeight: '600' }}>{d.label}</div>
                                    </div>
                                ))}
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
                            {stats?.recentInvoices?.length > 0 ? stats.recentInvoices.map((inv, i) => (
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
                            )) : (
                                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '0.85rem' }}>لا توجد فواتير بعد</div>
                            )}
                        </div>

                        <div className="card-hover fade-in" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>آخر عروض الأسعار</h3>
                                <Link to="/quotes" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none' }}>عرض الكل ←</Link>
                            </div>
                            {stats?.recentQuotes?.length > 0 ? stats.recentQuotes.map((qt, i) => (
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
                            )) : (
                                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '0.85rem' }}>لا توجد عروض أسعار بعد</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

/* --- Layout --- */

const Layout = ({ user, onLogout }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const [currentTime, setCurrentTime] = useState(new Date());
    const [companyInfo, setCompanyInfo] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchNotifications = () => {
            axios.post(`${API_URL}/notifications/refresh`)
                .then(() => axios.get(`${API_URL}/notifications`))
                .then(res => setNotifications(res.data))
                .catch(err => console.error('Notifications fetch failed', err));
        };
        const fetchCompany = () => {
            axios.get(`${API_URL}/settings/companyInfo`)
                .then(res => setCompanyInfo(res.data))
                .catch(() => { });
        };
        fetchNotifications();
        fetchCompany();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

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

    return (
        <div style={{ display: 'flex', height: '100vh', direction: 'rtl', fontFamily: 'Cairo, sans-serif', background: '#f8fafc', position: 'relative' }}>
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && <div className="sidebar-overlay show-mobile" onClick={closeSidebar} />}

            {/* Sidebar */}
            <div className={`sidebar-scroll no-print ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} style={{
                width: '280px', background: '#0f172a', color: 'white', padding: '24px',
                display: 'flex', flexDirection: 'column', overflowY: 'auto',
                boxShadow: '4px 0 20px rgb(0 0 0 / 0.05)', zIndex: 50,
                position: window.innerWidth > 768 ? 'sticky' : 'fixed',
                top: 0, right: 0, bottom: 0, height: '100vh',
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
                    <NavLink to="/" icon={<LayoutDashboard />} label="لوحة القيادة" active={isActive('/')} onClick={closeSidebar} />
                    <NavLink to="/invoices" icon={<ShoppingCart />} label="المبيعات والفواتير" active={isActive('/invoices')} onClick={closeSidebar} />
                    <NavLink to="/quotes" icon={<FileText />} label="عروض الأسعار" active={isActive('/quotes')} onClick={closeSidebar} />
                    <NavLink to="/inventory" icon={<Package />} label="المخزون" active={isActive('/inventory')} onClick={closeSidebar} />
                    <NavLink to="/clients" icon={<Users />} label="العملاء" active={isActive('/clients')} onClick={closeSidebar} />
                    <NavLink to="/projects" icon={<Briefcase />} label="المشاريع والمقاولات" active={isActive('/projects')} onClick={closeSidebar} />
                    <NavLink to="/contracts" icon={<FileText />} label="عقود المقاولات" active={isActive('/contracts')} onClick={closeSidebar} />
                    <NavLink to="/accounting" icon={<DollarSign />} label="المحاسبة والمالية" active={isActive('/accounting')} onClick={closeSidebar} />
                    <NavLink to="/hr" icon={<Users />} label="الموارد البشرية" active={isActive('/hr')} onClick={closeSidebar} />
                    <NavLink to="/real-estate" icon={<Building2 />} label="إدارة الأملاك" active={isActive('/real-estate')} />
                    <NavLink to="/archive" icon={<Folder />} label="الأرشيف والوثائق" active={isActive('/archive')} />
                    <NavLink to="/reports" icon={<FileBarChart2 />} label="التقارير" active={isActive('/reports')} />
                    <NavLink to="/users" icon={<Settings />} label="الإعدادات" active={isActive('/users')} />
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #1e293b' }}>
                    <div style={{ background: '#1e293b', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {user.name?.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user.role}</div>
                        </div>
                        <button
                            onClick={onLogout}
                            style={{
                                background: 'transparent', border: 'none', color: '#ef4444',
                                cursor: 'pointer', padding: '8px', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            title="تسجيل الخروج"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={window.innerWidth > 768 ? 'main-content-fluid' : ''} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
                transition: 'all 0.4s ease'
            }}>
                <header className="fade-in no-print" style={{
                    background: 'white',
                    padding: '12px 30px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01), 0 2px 4px -1px rgba(0,0,0,0.01)',
                    borderBottom: '1px solid #f1f5f9',
                    zIndex: 20
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'center' }}>
                        <button className="show-mobile" onClick={toggleSidebar} style={{ position: 'absolute', right: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '10px', color: '#1e293b', cursor: 'pointer' }}>
                            <Menu size={20} />
                        </button>

                        <div style={{ position: 'relative', width: '100%', maxWidth: '450px', transition: 'all 0.3s' }}>
                            <Search size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="بحث شامل في أرشيف المشروع والنظام..."
                                value={searchQuery}
                                onChange={handleSearch}
                                style={{
                                    width: '100%',
                                    padding: '12px 45px 12px 15px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    background: '#f8fafc',
                                    outline: 'none',
                                    fontFamily: 'Cairo',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s ease',
                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.background = 'white';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.background = '#f8fafc';
                                    e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)';
                                }}
                            />

                            {showSearchResults && (
                                <div style={{
                                    position: 'absolute', top: '45px', right: 0, left: 0,
                                    background: 'white', borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    border: '1px solid #f1f5f9', zIndex: 1000,
                                    maxHeight: '400px', overflowY: 'auto', padding: '8px'
                                }}>
                                    {searchResults.length === 0 ? (
                                        <div style={{ padding: '15px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>لا توجد نتائج مطابقة</div>
                                    ) : (
                                        searchResults.map((res, i) => (
                                            <Link
                                                key={i}
                                                to={res.link}
                                                onClick={() => setShowSearchResults(false)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                    padding: '10px 12px', borderRadius: '8px',
                                                    textDecoration: 'none', color: 'inherit',
                                                    transition: 'background 0.2s', borderBottom: i < searchResults.length - 1 ? '1px solid #f8fafc' : 'none'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{ padding: '8px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', display: 'flex' }}>
                                                    {res.type === 'client' && <Users size={16} />}
                                                    {res.type === 'invoice' && <ShoppingCart size={16} />}
                                                    {res.type === 'project' && <Briefcase size={16} />}
                                                    {res.type === 'employee' && <UserPlus size={16} />}
                                                    {res.type === 'property' && <Building2 size={16} />}
                                                    {res.type === 'document' && <Folder size={16} />}
                                                    {res.type === 'product' && <Package size={16} />}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#1e293b' }}>{res.title}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{res.subtitle}</div>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div className="hide-mobile" style={{ textAlign: 'left' }}>
                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{currentTime.toLocaleDateString('ar-SA')}</div>
                            <div style={{ color: '#2563eb', fontSize: '0.9rem', fontWeight: 'bold' }}>{currentTime.toLocaleTimeString('ar-SA')}</div>
                        </div>

                        {/* Notifications */}
                        <div style={{ position: 'relative' }}>
                            <div onClick={() => setShowNotifications(!showNotifications)} style={{ cursor: 'pointer', padding: '8px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                <Bell size={20} color={notifications.some(n => !n.isRead) ? '#2563eb' : '#64748b'} />
                                {notifications.some(n => !n.isRead) && (
                                    <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
                                )}
                            </div>

                            {showNotifications && (
                                <div style={{
                                    position: 'absolute', top: '50px', left: '0', width: '280px', background: 'white',
                                    borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9',
                                    zIndex: 100, padding: '12px', direction: 'rtl'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem' }}>التنبيهات</h4>
                                        <button
                                            onClick={async () => {
                                                await axios.put(`${API_URL}/notifications/read-all`);
                                                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                                            }}
                                            style={{ color: '#2563eb', border: 'none', background: 'none', fontSize: '0.75rem', cursor: 'pointer' }}
                                        >تحديد الكل</button>
                                    </div>
                                    <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '15px', color: '#94a3b8', fontSize: '0.8rem' }}>لا توجد تنبيهات</div>
                                        ) : notifications.map(n => (
                                            <div key={n.id} style={{
                                                padding: '10px', borderRadius: '8px', background: n.isRead ? 'transparent' : '#f0f7ff',
                                                border: `1px solid ${n.isRead ? '#f1f5f9' : '#dbeafe'}`, fontSize: '0.8rem'
                                            }}>
                                                <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '2px' }}>{n.title}</div>
                                                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{n.message}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main style={{ flex: 1, padding: '24px 40px', overflowY: 'auto', position: 'relative' }}>
                    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                        <Routes>
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
                            <Route path="/users" element={<SettingsPage />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
};

/* --- Main App --- */

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("System Initializing...");
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
                console.log("Logged in as:", parsed.name);
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData) => setUser(userData);
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Cairo', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
            <div className="pulse-glow" style={{ width: '80px', height: '80px', background: '#2563eb', borderRadius: '20px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Building2 size={40} />
            </div>
            <p style={{ fontWeight: 'bold', color: '#1e293b' }}>جاري تشغيل النظام...</p>
        </div>
    </div>;

    return (
        <BrowserRouter>
            {!user ? (
                <Login onSuccess={handleLogin} />
            ) : (
                <Routes>
                    <Route path="/invoices/:id/print" element={<InvoicePrint />} />
                    <Route path="/quotes/:id/print" element={<QuotePrint />} />
                    <Route path="/contracts/:id/print" element={<ContractPrint />} />
                    <Route path="/clients/:id/statement" element={<ClientStatement />} />
                    <Route path="/archive/summary/:type/:id" element={<DataRecordSummary />} />
                    <Route path="/*" element={<Layout user={user} onLogout={handleLogout} />} />
                </Routes>
            )}
        </BrowserRouter>
    );
}

export default App;
