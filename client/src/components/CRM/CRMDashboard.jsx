import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, DollarSign, Target, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';
import API_URL from '@/config';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const CRMDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/crm/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error('Error fetching CRM stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon, subtitle, color, isCurrency }) => (
        <motion.div
            whileHover={{ y: -5 }}
            style={{
                background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>{title}</div>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                {isCurrency ? `${value?.toLocaleString()} ` : value}
                {isCurrency && <span style={{ fontSize: '1rem', color: '#64748b' }}>ر.س</span>}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{subtitle}</div>
        </motion.div>
    );

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><RefreshCcw className="spin" /> جاري تحميل الإحصائيات...</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>لوحة المبيعات (CRM Dashboard)</h2>
                <button onClick={fetchStats} style={{ background: '#f1f5f9', border: 'none', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <RefreshCcw size={16} /> تحديث
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <StatCard
                    title="إجمالي العملاء المحتملين"
                    value={stats?.totalLeads || 0}
                    subtitle="جميع المسجلين في النظام"
                    icon={<Users size={20} />}
                    color="#3b82f6"
                />
                <StatCard
                    title="الفرص المفتوحة"
                    value={stats?.totalOpps || 0}
                    subtitle="جميع الفرص الحالية قيد التفاوض"
                    icon={<Target size={20} />}
                    color="#f59e0b"
                />
                <StatCard
                    title="قيمة المبيعات المتوقعة"
                    value={stats?.pipelineValue || 0}
                    subtitle="إجمالي قيمة الفرص النشطة"
                    icon={<DollarSign size={20} />}
                    color="#10b981"
                    isCurrency={true}
                />
                <StatCard
                    title="معدل التحويل (العملاء)"
                    value={`${stats?.conversionRate || 0}%`}
                    subtitle="نسبة إغلاق وتحويل Leads إلى Partner"
                    icon={<TrendingUp size={20} />}
                    color="#8b5cf6"
                />
            </div>

            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                {/* Temporary placeholder for charts */}
                <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: 'bold' }}>فرص المبيعات قريباً ستظهر كرسوم بيانية مفصلة هنا.</h3>
                <p style={{ color: '#64748b' }}>تم ربط الإحصائيات مع قاعدة البيانات وجاري تجهيز التصميم الشامل لها.</p>
            </div>
        </div>
    );
};

export default CRMDashboard;
