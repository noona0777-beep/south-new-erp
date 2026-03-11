import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, LogOut, Menu, X, HardHat, Building2, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_URL from '@/config';
import ClientDashboard from './ClientDashboard';
import ClientProjects from './ClientProjects';
import ClientInvoices from './ClientInvoices';

const ClientLayout = ({ user, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [companyInfo, setCompanyInfo] = useState({ name: 'بوابة العملاء' });
    const location = useLocation();

    useEffect(() => {
        axios.get(`${API_URL}/settings/companyInfo`)
            .then(res => setCompanyInfo(res.data))
            .catch(() => {});
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const isActive = (path) => location.pathname === path;

    const NavLink = ({ to, icon, label }) => (
        <Link to={to} onClick={closeSidebar} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 18px',
            color: isActive(to) ? '#fff' : '#94a3b8',
            background: isActive(to) ? '#2563eb' : 'transparent',
            textDecoration: 'none',
            borderRadius: '10px',
            marginBottom: '6px',
            transition: 'all 0.3s ease',
            fontSize: '1rem',
            fontWeight: isActive(to) ? '600' : '400',
        }}>
            {React.cloneElement(icon, { size: 20 })}
            <span>{label}</span>
        </Link>
    );

    return (
        <div style={{ display: 'flex', height: '100vh', direction: 'rtl', fontFamily: 'Tajawal, Cairo, sans-serif', background: '#f8fafc' }}>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && <div onClick={closeSidebar} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />}

            {/* Client Sidebar */}
            <div style={{
                width: '280px', background: '#0A1A2F', color: 'white', padding: '24px',
                display: 'flex', flexDirection: 'column', overflowY: 'auto',
                boxShadow: '4px 0 20px rgba(0,0,0,0.05)',
                zIndex: 50,
                position: window.innerWidth > 768 ? 'sticky' : 'fixed',
                top: 0, bottom: 0, right: 0, height: '100vh',
                transform: window.innerWidth <= 768 && !isSidebarOpen ? 'translateX(100%)' : 'translateX(0)',
                transition: 'transform 0.3s ease'
            }}>
                <div style={{ marginBottom: '30px', textAlign: 'center', paddingBottom: '24px', borderBottom: '1px solid #1e293b' }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '120px', height: 'auto', margin: '0 auto 16px' }} onError={(e) => e.target.style.display = 'none'} />
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{companyInfo.name || 'بوابة العملاء'}</h2>
                    {companyInfo.phone && <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><Phone size={14}/> {companyInfo.phone}</p>}
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <NavLink to="/client-portal" icon={<LayoutDashboard />} label="ملخص معلوماتي" />
                    <NavLink to="/client-portal/projects" icon={<Briefcase />} label="مشاريعي" />
                    <NavLink to="/client-portal/invoices" icon={<FileText />} label="الفواتير والمالية" />
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #1e293b' }}>
                    <div style={{ background: '#1e293b', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {user?.name?.charAt(0) || 'ع'}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name || 'عميل'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>عميل</div>
                        </div>
                        <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{ background: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', zIndex: 30 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {window.innerWidth <= 768 && (
                            <button onClick={toggleSidebar} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                <Menu size={24} color="#1e293b" />
                            </button>
                        )}
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>أهلاً بك، {user?.name}</h1>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>تابع تحديثات مشاريعك لحظة بلحظة</p>
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                    <AnimatePresence mode="wait">
                        <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <Routes location={location}>
                                <Route path="/" element={<ClientDashboard user={user} />} />
                                <Route path="/projects" element={<ClientProjects />} />
                                <Route path="/invoices" element={<ClientInvoices />} />
                            </Routes>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default ClientLayout;
