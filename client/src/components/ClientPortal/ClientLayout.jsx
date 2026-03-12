import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Briefcase, FileText, LogOut, Menu, X, 
    HardHat, Building2, Phone, Mail, MessageCircle, 
    Bell, Search, User, ChevronLeft, ShieldCheck, 
    Settings, Globe, Zap, ArrowLeft, Inbox, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_URL from '@/config';
import ClientDashboard from './ClientDashboard';
import ClientProjects from './ClientProjects';
import ClientInvoices from './ClientInvoices';
import ClientDocuments from './ClientDocuments';
import ClientSupport from './ClientSupport';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

const ClientLayout = ({ user, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [companyInfo, setCompanyInfo] = useState({ name: 'بوابة جنوب العقارية والإنشائية' });
    const [permissions, setPermissions] = useState({});
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/settings/companyInfo`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setCompanyInfo(res.data))
            .catch(() => {});

        axios.get(`${API_URL}/client-portal/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            if (res.data.permissions) setPermissions(res.data.permissions);
        }).catch(() => {});
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);
    const isActive = (path) => location.pathname === path;

    const NavLink = ({ to, icon: Icon, label, disabled }) => {
        if (disabled) return null;
        const active = isActive(to);
        return (
            <Link to={to} onClick={closeSidebar} style={{ textDecoration: 'none' }}>
                <motion.div 
                    whileHover={{ x: 5, background: 'rgba(255,255,255,0.03)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '15px',
                        padding: '14px 20px',
                        color: active ? '#818cf8' : '#71717a',
                        background: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        borderRadius: '16px',
                        marginBottom: '8px',
                        transition: 'all 0.3s ease',
                        fontSize: '1rem',
                        fontWeight: active ? '800' : '600',
                        position: 'relative',
                        fontFamily: 'Cairo'
                    }}
                >
                    {active && <motion.div layoutId="client-nav-active" style={{ position: 'absolute', left: 0, top: '25%', bottom: '25%', width: '3px', background: '#6366f1', borderRadius: '0 4px 4px 0' }} />}
                    <Icon size={20} />
                    <span>{label}</span>
                </motion.div>
            </Link>
        );
    };

    return (
        <div style={{ display: 'flex', height: '100vh', direction: 'rtl', fontFamily: 'Cairo, sans-serif', background: '#09090b', color: '#fff', overflow: 'hidden' }}>
            {/* Mesh Background for Portal */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', opacity: 0.4 }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)' }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)' }}></div>
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        onClick={closeSidebar} 
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 1000 }} 
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: isSidebarOpen ? 0 : (window.innerWidth <= 768 ? '100%' : 0) }}
                style={{
                    width: '300px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1001,
                    position: window.innerWidth <= 768 ? 'fixed' : 'relative',
                    top: 0, bottom: 0, right: 0, height: '100vh',
                }}
            >
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                        <img 
                            src="/logo.png" 
                            alt="Logo" 
                            style={{ width: '130px', height: 'auto' }} 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150x50/312e81/ffffff?text=South+New'; }} 
                        />
                    </div>
                    <div className="status-pill" style={{ display: 'inline-flex', padding: '6px 16px', borderRadius: '30px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem', fontWeight: '900', gap: '6px', alignItems: 'center' }}>
                        <ShieldCheck size={14} /> بـوابـة العـملاء الـذكـية
                    </div>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <NavLink to="/client-portal" icon={LayoutDashboard} label="لوحة التحكم" />
                    <NavLink disabled={permissions.trackProjects === false} to="/client-portal/projects" icon={Briefcase} label="مشاريعي الجارية" />
                    <NavLink disabled={permissions.viewFinancials !== true} to="/client-portal/invoices" icon={FileText} label="سجل الفواتير والمالية" />
                    <NavLink to="/client-portal/documents" icon={Inbox} label="خزانة المستندات" />
                    <NavLink to="/client-portal/support" icon={HelpCircle} label="مركز الدعم الفني" />
                </nav>

                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                        <div style={{ 
                            width: '45px', height: '45px', borderRadius: '15px', 
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontWeight: '900', color: 'white', fontSize: '1.1rem',
                            boxShadow: '0 8px 16px rgba(99,102,241,0.2)'
                        }}>
                            {user?.name?.charAt(0) || 'ع'}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '1rem', fontWeight: '900', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name || 'عميل'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: '800' }}>عميل موثق</div>
                        </div>
                    </div>
                    <motion.button 
                        whileHover={{ background: 'rgba(239, 68, 68, 0.2)' }}
                        onClick={onLogout} 
                        style={{ width: '100%', padding: '10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <LogOut size={16} /> تسجيل الخروج
                    </motion.button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
                <header style={{ 
                    padding: '20px 40px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'rgba(9, 9, 11, 0.6)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {window.innerWidth <= 768 && (
                            <motion.button whileTap={{ scale: 0.95 }} onClick={toggleSidebar} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', width: '45px', height: '45px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>
                                <Menu size={24} />
                            </motion.button>
                        )}
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>أهلاً بك، {user?.name}</h2>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.9rem', color: '#71717a', fontWeight: '600' }}>نحن نهتم بأدق تفاصيل مشاريعك.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                         <div style={{ position: 'relative', width: '250px', display: window.innerWidth > 1024 ? 'block' : 'none' }}>
                            <Search size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                            <input 
                                placeholder="ابحث في سجلاتك..." 
                                className="premium-input" 
                                onChange={(e) => {
                                    /* تنفيذ منطق البحث السريع هنا إذا لزم الأمر */
                                    console.log('Searching for:', e.target.value);
                                }}
                                style={{ width: '100%', paddingRight: '45px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }} 
                            />
                        </div>
                        <motion.button {...buttonClick} style={{ background: 'rgba(255,255,255,0.02)', color: '#71717a', border: '1px solid rgba(255,255,255,0.05)', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bell size={20} />
                        </motion.button>
                        <motion.button 
                            {...buttonClick} 
                            onClick={() => navigate('/client-portal/support')}
                            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '0 25px', borderRadius: '14px', fontWeight: '800', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: '10px' }}
                        >
                            تواصل معنا
                        </motion.button>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                    <AnimatePresence mode="wait">
                        <motion.div key={location.pathname} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
                            <Routes>
                                <Route path="/client-portal" element={<ClientDashboard user={user} />} />
                                <Route path="/client-portal/projects" element={<ClientProjects />} />
                                <Route path="/client-portal/invoices" element={<ClientInvoices />} />
                                <Route path="/client-portal/documents" element={<ClientDocuments />} />
                                <Route path="/client-portal/support" element={<ClientSupport />} />
                            </Routes>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default ClientLayout;
