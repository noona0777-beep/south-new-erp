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
import API_URL from './config';




import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Briefcase,
    Building2,
    FileBarChart2,
    Settings,
    Bell,
    Search,
    LogOut,
    Clock,
    ChevronLeft,
    DollarSign,
    TrendingUp,
    AlertOctagon,
    UserPlus,
    FileText
} from 'lucide-react';

/* --- UI Components --- */

const NavLink = ({ to, icon, label, active }) => {
    return (
        <Link to={to} className="card-hover" style={{
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
            <span style={{ fontSize: '0.85rem', color: subtext.includes('+') ? '#10b981' : '#ef4444', fontWeight: 'bold', background: subtext.includes('+') ? '#ecfdf5' : '#fef2f2', padding: '2px 8px', borderRadius: '12px' }}>
                {subtext}
            </span>
        </div>
        <div style={{ padding: '12px', background: `${color}20`, borderRadius: '12px', color: color }}>
            {React.cloneElement(icon, { size: 24 })}
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [reportFilter, setReportFilter] = React.useState('MONTHLY');
    const [user] = React.useState(JSON.parse(localStorage.getItem('user')) || { name: 'المستخدم' });

    React.useEffect(() => {
        axios.get(`${API_URL}/dashboard/stats`)
            .then(res => { setStats(res.data); setLoading(false); })
            .catch(() => setLoading(false));
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
            {/* Hero Banner */}
            <div className="aurora-bg pulse-glow" style={{ marginBottom: '35px', padding: '32px', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '2.5rem' }}>{greeting.icon}</span>
                        <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-0.5px' }}>{greeting.text}، {user.name}</h2>
                    </div>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem', fontWeight: '500', maxWidth: '600px', lineHeight: '1.5' }}>
                        أهلاً بك في نظام إدارة موارد مؤسسة الجنوب الجديد. إليك نظرة سريعة على أداء المؤسسة.
                    </p>
                </div>
                <div className="floating" style={{ position: 'absolute', top: '10%', left: '5%', opacity: 0.1 }}><DollarSign size={80} /></div>
                <div className="floating" style={{ position: 'absolute', bottom: '15%', left: '15%', opacity: 0.05, animationDelay: '2s' }}><Briefcase size={100} /></div>
                <div className="floating" style={{ position: 'absolute', top: '20%', right: '10%', opacity: 0.1, animationDelay: '1s' }}><TrendingUp size={60} /></div>
                <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
            </div>

            {/* Stats Cards */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '1.1rem' }}>⏳ جاري تحميل الإحصائيات...</div>
            ) : (
                <>
                    {/* Main KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <HeaderStat title="إجمالي الإيرادات" value={`${formatMoney(stats?.totals?.revenue)} ر.س`} subtext={`${stats?.totals?.invoices || 0} فاتورة`} icon={<DollarSign />} color="#2563eb" />
                        <HeaderStat title="العملاء المسجلون" value={stats?.totals?.clients || 0} subtext={`+${stats?.quickStats?.activeProjects || 0} مشروع نشط`} icon={<UserPlus />} color="#10b981" />
                        <HeaderStat title="عروض الأسعار" value={stats?.totals?.quotes || 0} subtext={`${stats?.quickStats?.pendingQuotes || 0} معلقة`} icon={<FileText />} color="#8b5cf6" />
                        <HeaderStat title="المنتجات في المخزن" value={stats?.totals?.products || 0} subtext={stats?.quickStats?.lowStockCount > 0 ? `⚠️ ${stats.quickStats.lowStockCount} نقص` : '✅ مخزون جيد'} icon={<Package />} color="#f59e0b" />
                    </div>

                    {/* Chart + Recent Activity */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        {/* Revenue Chart */}
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
                                        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '4px' }}>
                                            {d.value > 0 ? formatMoney(d.value) : ''}
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: `${maxVal > 0 ? Math.max((d.value / maxVal) * 100, d.value > 0 ? 8 : 3) : 3}%`,
                                            background: i === chartData.length - 1 ? 'linear-gradient(to top, #2563eb, #60a5fa)' : '#dbeafe',
                                            borderRadius: '6px 6px 3px 3px',
                                            transition: 'height 0.8s ease',
                                            boxShadow: i === chartData.length - 1 ? '0 4px 12px rgba(37,99,235,0.3)' : 'none'
                                        }} />
                                        <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '0.72rem', fontWeight: '600' }}>{d.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats Side Panel */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Low Stock Alert */}
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

                            {/* Quick Numbers */}
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

                    {/* Recent Invoices & Quotes */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Recent Invoices */}
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

                        {/* Recent Quotes */}
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


const Placeholder = ({ title, icon }) => (
    <div className="fade-in" style={{
        textAlign: 'center', marginTop: '80px', color: '#94a3b8',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px'
    }}>
        <div style={{
            width: '120px', height: '120px', background: '#f8fafc', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)'
        }}>
            {React.cloneElement(icon, { size: 60, strokeWidth: 1.5, color: '#cbd5e1' })}
        </div>
        <div>
            <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{title}</h2>
            <p style={{ margin: 0, maxWidth: '400px', lineHeight: '1.6' }}>جاري العمل على تطوير هذه الوحدة. ستكون متاحة في التحديث القادم مع كافة الميزات المطلوبة.</p>
        </div>
        <button style={{ marginTop: '20px', background: 'transparent', border: '1px solid #cbd5e1', color: '#64748b', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer' }}>
            العودة للرئيسية
        </button>
    </div>
);

/* --- Layout --- */

const Layout = ({ user, onLogout }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const [currentTime, setCurrentTime] = useState(new Date());

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

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

    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = () => {
            axios.get(`${API_URL}/notifications`)
                .then(res => setNotifications(res.data))
                .catch(err => console.error('Notifications fetch failed', err));
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh', direction: 'rtl', fontFamily: 'Cairo, sans-serif', background: '#f8fafc' }}>

            {/* Sidebar */}
            <div className="sidebar-scroll" style={{
                width: '280px', background: '#0f172a', color: 'white', padding: '24px',
                display: 'flex', flexDirection: 'column', overflowY: 'auto',
                boxShadow: '4px 0 20px rgb(0 0 0 / 0.05)', zIndex: 10
            }}>
                <div style={{ marginBottom: '40px', textAlign: 'center', paddingBottom: '24px', borderBottom: '1px solid #1e293b' }}>
                    <div className="logo-emblem shine-effect" style={{ marginBottom: '20px' }}>
                        <img
                            src="/logo.png"
                            alt="Logo"
                            style={{
                                width: '150px',
                                height: 'auto',
                                display: 'block',
                                margin: '0 auto',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onError={(e) => {
                                e.target.parentElement.style.display = 'none';
                                e.target.parentElement.nextSibling.style.display = 'flex';
                            }}
                        />
                    </div>
                    <div style={{
                        width: '48px', height: '48px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '12px', margin: '0 auto 15px auto',
                        display: 'none', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 'bold', fontSize: '1.5rem',
                        boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
                    }}>
                        S
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>مؤسسة الجنوب الجديد</h2>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#64748b', letterSpacing: '1px' }}>ENTERPRISE ERP</p>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ margin: '10px 0 8px 0', fontSize: '0.75rem', color: '#475569', fontWeight: '700', paddingRight: '12px', letterSpacing: '0.5px' }}>القائمة الرئيسية</div>
                    <NavLink to="/" icon={<LayoutDashboard />} label="لوحة القيادة" active={isActive('/')} />
                    <NavLink to="/invoices" icon={<ShoppingCart />} label="المبيعات والفواتير" active={isActive('/invoices')} />
                    <NavLink to="/quotes" icon={<FileText />} label="عروض الأسعار" active={isActive('/quotes')} />
                    <NavLink to="/inventory" icon={<Package />} label="المخزون" active={isActive('/inventory')} />
                    <NavLink to="/clients" icon={<Users />} label="العملاء" active={isActive('/clients')} />

                    <div style={{ margin: '24px 0 8px 0', fontSize: '0.75rem', color: '#475569', fontWeight: '700', paddingRight: '12px', letterSpacing: '0.5px' }}>الإدارة والنشاط</div>
                    <NavLink to="/projects" icon={<Briefcase />} label="المشاريع والمقاولات" active={isActive('/projects')} />
                    <NavLink to="/hr" icon={<Users />} label="الموارد البشرية" active={isActive('/hr')} />
                    <NavLink to="/real-estate" icon={<Building2 />} label="إدارة الأملاك" active={isActive('/real-estate')} />

                    <div style={{ margin: '24px 0 8px 0', fontSize: '0.75rem', color: '#475569', fontWeight: '700', paddingRight: '12px', letterSpacing: '0.5px' }}>النظام</div>
                    <NavLink to="/reports" icon={<FileBarChart2 />} label="التقارير" active={isActive('/reports')} />
                    <NavLink to="/users" icon={<Settings />} label="الإعدادات" active={isActive('/users')} />
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #1e293b' }}>
                    <div className="card-hover" style={{ background: '#1e293b', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {user.name.charAt(0)}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user.role}</div>
                        </div>
                    </div>
                    <button onClick={onLogout} style={{
                        width: '100%', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444',
                        padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600'
                    }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
                    >
                        <LogOut size={16} /> تسجيل خروج
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
                <header style={{
                    background: 'white', padding: '16px 40px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    boxShadow: '0 4px 20px -10px rgb(0 0 0 / 0.05)', zIndex: 5
                }}>
                    {/* Search Bar */}
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={20} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="بحث في الفواتير، العملاء، العقود..."
                            value={searchQuery}
                            onChange={handleSearch}
                            onFocus={() => searchQuery.length > 1 && setShowSearchResults(true)}
                            style={{
                                width: '100%', padding: '12px 45px 12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                background: '#f8fafc', outline: 'none', fontFamily: 'Cairo', fontSize: '0.95rem'
                            }}
                        />

                        {/* Search Results Dropdown */}
                        {showSearchResults && searchResults.length > 0 && (
                            <div className="fade-in" style={{
                                position: 'absolute', top: '55px', right: '0', width: '100%', background: 'white',
                                borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                border: '1px solid #e2e8f0', zIndex: 100, overflow: 'hidden'
                            }}>
                                {searchResults.map(result => (
                                    <div
                                        key={`${result.type}-${result.id}`}
                                        className="hover-row"
                                        onClick={() => {
                                            window.location.href = result.link;
                                            setShowSearchResults(false);
                                            setSearchQuery('');
                                        }}
                                        style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', cursor: 'pointer' }}
                                    >
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1e293b' }}>{result.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{result.subtitle}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {showSearchResults && searchQuery.length > 1 && searchResults.length === 0 && (
                            <div style={{
                                position: 'absolute', top: '55px', right: '0', width: '100%', background: 'white',
                                borderRadius: '12px', padding: '15px', textAlign: 'center', color: '#94a3b8',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 100
                            }}>
                                لا توجد نتائج مطابقة
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{ cursor: 'pointer', padding: '8px', borderRadius: '10px', background: showNotifications ? '#f1f5f9' : 'transparent', transition: 'all 0.2s' }}
                            >
                                <Bell size={24} color={showNotifications ? '#2563eb' : '#64748b'} />
                                {notifications.length > 0 && (
                                    <span style={{ position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>
                                )}
                            </div>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="fade-in" style={{
                                    position: 'absolute', top: '50px', left: '0', width: '320px', background: 'white',
                                    borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                                    border: '1px solid #f1f5f9', zIndex: 100, overflow: 'hidden'
                                }}>
                                    <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>التنبيهات</span>
                                        <span style={{ fontSize: '0.75rem', color: '#2563eb', cursor: 'pointer' }}>تحديد الكل كمقروء</span>
                                    </div>
                                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                        {notifications.length > 0 ? (
                                            notifications.map(note => (
                                                <div
                                                    key={note.id}
                                                    className="hover-row"
                                                    style={{ padding: '16px', borderBottom: '1px solid #f8fafc', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        setShowNotifications(false);
                                                        if (note.type === 'stock') window.location.href = '/inventory';
                                                        if (note.type === 'quote') window.location.href = '/quotes';
                                                        if (note.type === 'invoice') window.location.href = '/invoices';
                                                    }}
                                                >
                                                    <div style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '4px', fontWeight: '500' }}>{note.text}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{note.time}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                لا توجد تنبيهات حالياً
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '12px', textAlign: 'center', background: '#f8fafc', fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9' }}>
                                        عرض كافة التنبيهات
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ height: '30px', width: '1px', background: '#e2e8f0' }}></div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '2px' }}>
                                {currentTime.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div style={{ color: '#2563eb', fontSize: '1rem', fontWeight: 'bold', display: 'flex', gap: '5px', justifyContent: 'flex-start' }}>
                                <Clock size={16} />
                                {currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/invoices" element={<InvoicesPage />} />
                        <Route path="/quotes" element={<QuotesPage />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route path="/clients" element={<ClientsPage />} />
                        <Route path="/projects" element={<ProjectsPage />} />
                        <Route path="/hr" element={<HRPage />} />
                        <Route path="/real-estate" element={<RealEstatePage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/users" element={<SettingsPage />} />
                    </Routes>
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
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Cairo' }}>جاري التحميل...</div>;

    if (!user) return <Login onSuccess={handleLogin} />;

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/invoices/:id/print" element={<InvoicePrint />} />
                <Route path="/quotes/:id/print" element={<QuotePrint />} />
                <Route path="/clients/:id/statement" element={<ClientStatement />} />
                <Route path="/*" element={<Layout user={user} onLogout={handleLogout} />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
