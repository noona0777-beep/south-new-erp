import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, DollarSign, Target, TrendingUp, RefreshCcw, Activity, MousePointer2 } from 'lucide-react';
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

    const StatCard = ({ title, value, icon, subtitle, color, isCurrency, idx }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card card-hover"
            style={{
                padding: '28px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative', overflow: 'hidden'
            }}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: color }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ color: '#a1a1aa', fontSize: '0.95rem', fontWeight: '700' }}>{title}</div>
                <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: `${color}10`, color: color, border: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff', marginBottom: '8px', fontFamily: 'Outfit, Cairo', letterSpacing: '-1px' }}>
                {isCurrency ? `${value?.toLocaleString('ar-SA')} ` : value.toLocaleString('ar-SA')}
                {isCurrency && <span style={{ fontSize: '1.2rem', color: '#a1a1aa', fontWeight: '500', marginRight: '5px' }}>ر.س</span>}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: '600' }}>{subtitle}</div>
        </motion.div>
    );

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>
            <RefreshCcw className="animate-spin" size={40} style={{ marginBottom: '20px', color: '#6366f1' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>جاري استرجاع بيانات المبيعات والعملاء...</div>
        </div>
    );

    return (
        <div style={{ padding: '0px', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}
            >
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', margin: 0 }} className="gradient-text">تحليلات المبيعات والعملاء</h1>
                    <p style={{ margin: '6px 0 0 0', color: '#a1a1aa', fontSize: '1.1rem', fontWeight: '500' }}>مراقبة حية لمسار الصفقات ومعدلات تحويل العملاء المحتملين</p>
                </div>
                <motion.button 
                    whileHover={{ rotate: 180, background: 'rgba(255,255,255,0.1)' }}
                    onClick={fetchStats} 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '50%', color: '#fff', cursor: 'pointer' }}
                >
                    <RefreshCcw size={22} />
                </motion.button>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                <StatCard
                    idx={0}
                    title="إجمالي العملاء المحتملين"
                    value={stats?.totalLeads || 0}
                    subtitle="نمو إجمالي قاعدة العملاء بنسبة 12% هذا الشهر"
                    icon={<Users size={24} />}
                    color="#6366f1"
                />
                <StatCard
                    idx={1}
                    title="الفرص المفتوحة حالياً"
                    value={stats?.totalOpps || 0}
                    subtitle="صفقات نشطة قيد التفاوض والمتابعة"
                    icon={<Target size={24} />}
                    color="#f59e0b"
                />
                <StatCard
                    idx={2}
                    title="إجمالي قيمة مسار البيع"
                    value={stats?.pipelineValue || 0}
                    subtitle="قيمة الصفقات المتوقعة في جميع المراحل"
                    icon={<DollarSign size={24} />}
                    color="#10b981"
                    isCurrency={true}
                />
                <StatCard
                    idx={3}
                    title="معدل تحويل العملاء"
                    value={`${stats?.conversionRate || 0}%`}
                    subtitle="فعالية تحويل Leads إلى عملاء دائمين"
                    icon={<TrendingUp size={24} />}
                    color="#8b5cf6"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px' }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card" 
                    style={{ padding: '30px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px' }}>
                            <Activity size={20} color="#6366f1" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#fff' }}>توزيع مراحل المبيعات (Stage Breakdown)</h3>
                    </div>
                    <div style={{ width: '100%', height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.stageStats || []} layout="vertical" margin={{ left: 20, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="stage" type="category" tick={{ fontSize: 13, fontWeight: '700', fill: '#a1a1aa' }} width={120} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                                    contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', color: '#fff' }} 
                                />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={35}>
                                    {(stats?.stageStats || []).map((entry, index) => (
                                        <Cell key={index} fill={['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card" 
                    style={{ padding: '30px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '10px', borderRadius: '12px' }}>
                            <MousePointer2 size={20} color="#8b5cf6" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#fff' }}>مصادر العملاء الفعالة (Lead Sources)</h3>
                    </div>
                    <div style={{ width: '100%', height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.sourceStats || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="source" tick={{ fontSize: 13, fontWeight: '700', fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 13, fontWeight: '700', fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} />
                                <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CRMDashboard;
