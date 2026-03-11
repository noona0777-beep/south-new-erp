import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Briefcase, CreditCard, FileText, AlertCircle, ChevronLeft } from 'lucide-react';
import API_URL from '@/config';

// Reusable card template for client stats
const StatCard = ({ title, value, subtext, icon, color, visible = true }) => {
    if (!visible) return null;
    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            style={{
                background: 'white',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '4px', background: color }} />
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>{title}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>{value}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{subtext}</div>
            </div>
        </motion.div>
    );
};

const ClientDashboard = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/client-portal/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('تعذر جلب تفاصيل لوحة التحكم');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>جاري تحميل بياناتك...</div>;
    if (error) return <div style={{ padding: '40px', color: 'red' }}>{error}</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>ملخص الحساب</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <StatCard
                    title="المشاريع النشطة"
                    value={stats?.projectsCount || 0}
                    subtext="إجمالي المشاريع المرتبطة بحسابك"
                    icon={<Briefcase size={24} />}
                    color="#3b82f6"
                    visible={stats?.permissions?.trackProjects !== false}
                />
                <StatCard
                    title="الرصيد المتبقي (المطلوب سداده)"
                    value={`${(stats?.balance || 0).toLocaleString()} ر.س`}
                    subtext={`من إجمالي ${stats?.totalInvoiced?.toLocaleString()} ر.س`}
                    icon={<AlertCircle size={24} />}
                    color={stats?.balance > 0 ? '#ef4444' : '#10b981'}
                    visible={stats?.permissions?.viewFinancials === true}
                />
                <StatCard
                    title="المبالغ المدفوعة"
                    value={`${(stats?.totalPaid || 0).toLocaleString()} ر.س`}
                    subtext="إجمالي الدفعات المسجلة بالنظام"
                    icon={<CreditCard size={24} />}
                    color="#10b981"
                    visible={stats?.permissions?.viewFinancials === true}
                />
                <StatCard
                    title="تذاكر الدعم"
                    value={stats?.openTicketsCount || 0}
                    subtext="تذاكر مفتوحة أو قيد المراجعة"
                    icon={<FileText size={24} />}
                    color="#f59e0b"
                />
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>تحديثات حديثة</h3>
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
                    <p style={{ margin: 0, fontSize: '1.1rem' }}>التقارير الميدانية والمستجدات الخاصة بك ستظهر هنا قريباً.</p>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
