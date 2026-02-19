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
    const [reportFilter, setReportFilter] = React.useState('YEARLY'); // MONTHLY, YEARLY

    // Fake data for 5 years
    const yearlyData = [
        { label: '2022', value: 65, amount: '450K' },
        { label: '2023', value: 75, amount: '580K' },
        { label: '2024', value: 90, amount: '720K' },
        { label: '2025', value: 85, amount: '690K' },
        { label: '2026', value: 95, amount: '810K' }
    ];

    const monthlyData = [
        { label: 'يناير', value: 40 }, { label: 'فبراير', value: 55 }, { label: 'مارس', value: 45 },
        { label: 'إبريل', value: 60 }, { label: 'مايو', value: 75 }, { label: 'يونيو', value: 85 },
        { label: 'يوليو', value: 70 }, { label: 'أغسطس', value: 65 }, { label: 'سبتمبر', value: 80 },
        { label: 'أكتوبر', value: 90 }, { label: 'نوفمبر', value: 95 }, { label: 'ديسمبر', value: 100 }
    ];

    const currentData = reportFilter === 'YEARLY' ? yearlyData : monthlyData;

    const [user] = React.useState(JSON.parse(localStorage.getItem('user')) || { name: 'المستخدم' });

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: 'صباح الخير', icon: '☀️' };
        if (hour < 18) return { text: 'طاب يومك', icon: '🌤️' };
        return { text: 'مساء الخير', icon: '🌙' };
    };

    const greeting = getGreeting();

    return (
        <div style={{ marginTop: '10px' }}>
            <div className="aurora-bg pulse-glow" style={{ marginBottom: '35px', padding: '32px', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2)' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '2.5rem' }}>{greeting.icon}</span>
                        <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-0.5px' }}>{greeting.text}، {user.name}</h2>
                    </div>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '1.2rem', fontWeight: '500', maxWidth: '600px', lineHeight: '1.5' }}>
                        أهلاً بك مجدداً في نظام إدارة موارد مؤسسة الجنوب الجديد. إليك نظرة سريعة على أداء اليوم.
                    </p>
                </div>

                {/* Animated Decorative Elements */}
                <div className="floating" style={{ position: 'absolute', top: '10%', left: '5%', opacity: 0.1, color: 'white' }}><DollarSign size={80} /></div>
                <div className="floating" style={{ position: 'absolute', bottom: '15%', left: '15%', opacity: 0.05, color: 'white', animationDelay: '2s' }}><Briefcase size={100} /></div>
                <div className="floating" style={{ position: 'absolute', top: '20%', right: '10%', opacity: 0.1, color: 'white', animationDelay: '1s' }}><TrendingUp size={60} /></div>

                {/* Aurora Glare */}
                <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.8rem', fontWeight: '700' }}>لوحة القيادة</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>نظرة عامة على أداء المؤسسة الاستراتيجي</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <HeaderStat title="إجمالي الإيرادات" value="3.25M ر.س" subtext="+25% (5 سنوات)" icon={<DollarSign />} color="#2563eb" />
                <HeaderStat title="متوسط النمو" value="15%" subtext="سنوي مستدام" icon={<TrendingUp />} color="#10b981" />
                <HeaderStat title="المشاريع الكبرى" value="24" subtext="خلال 5 سنوات" icon={<Briefcase />} color="#8b5cf6" />
                <HeaderStat title="الأرباح الصافية" value="1.1M ر.س" subtext="بعد الاستقطاعات" icon={<TrendingUp />} color="#0ea5e9" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Revenue Report Card */}
                <div className="card-hover fade-in" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>تقرير النمو التاريخي</h3>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>تحليل الإيرادات لفترة 5 سنوات</span>
                        </div>
                        <div style={{ display: 'flex', background: '#f8fafc', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <button
                                onClick={() => setReportFilter('YEARLY')}
                                style={{
                                    padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontSize: '0.85rem',
                                    background: reportFilter === 'YEARLY' ? 'white' : 'transparent',
                                    color: reportFilter === 'YEARLY' ? '#2563eb' : '#64748b',
                                    boxShadow: reportFilter === 'YEARLY' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    fontWeight: reportFilter === 'YEARLY' ? 'bold' : 'normal'
                                }}
                            >سنوي</button>
                            <button
                                onClick={() => setReportFilter('MONTHLY')}
                                style={{
                                    padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontSize: '0.85rem',
                                    background: reportFilter === 'MONTHLY' ? 'white' : 'transparent',
                                    color: reportFilter === 'MONTHLY' ? '#2563eb' : '#64748b',
                                    boxShadow: reportFilter === 'MONTHLY' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    fontWeight: reportFilter === 'MONTHLY' ? 'bold' : 'normal'
                                }}
                            >شهري</button>
                        </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: reportFilter === 'YEARLY' ? '40px' : '10px', paddingBottom: '20px', minHeight: '220px' }}>
                        {currentData.map((data, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                                {reportFilter === 'YEARLY' && (
                                    <div style={{ position: 'absolute', top: `${100 - data.value - 15}%`, fontSize: '0.75rem', fontWeight: 'bold', color: '#2563eb' }}>{data.amount}</div>
                                )}
                                <div style={{
                                    width: '100%',
                                    height: `${data.value}%`,
                                    background: i === currentData.length - 1 ? 'linear-gradient(to top, #2563eb, #60a5fa)' : '#eff6ff',
                                    borderRadius: '8px 8px 4px 4px',
                                    transition: 'height 1s ease',
                                    position: 'relative',
                                    boxShadow: i === currentData.length - 1 ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'
                                }}>
                                    {i === currentData.length - 1 && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px', background: '#2563eb', borderRadius: '50%', border: '2px solid white' }}></div>}
                                </div>
                                <div style={{ marginTop: '12px', color: '#64748b', fontSize: '0.75rem', fontWeight: '600', textAlign: 'center' }}>{data.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / Notifications */}
                <div className="card-hover fade-in" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 20px 0' }}>آخر العمليات</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '15px', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                                <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '50%', color: '#16a34a' }}><TrendingUp size={18} /></div>
                                <div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>تم تحصيل دفعة #INV-00{i + 1}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>منذ {i * 15 + 5} دقائق</div>
                                </div>
                                <div style={{ marginRight: 'auto', fontWeight: 'bold' }}>+1,500</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
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
                        <Route path="/reports" element={<Placeholder title="التقارير المالية" icon={<FileBarChart2 />} />} />
                        <Route path="/users" element={<Placeholder title="المستخدمين والإعدادات" icon={<Settings />} />} />
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
