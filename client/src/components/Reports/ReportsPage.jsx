import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { 
    BarChart3, PieChart, TrendingUp, TrendingDown, 
    Download, Calendar, Filter, RefreshCw, 
    DollarSign, Users, Briefcase, FileText, 
    ChevronLeft, ArrowUpRight, ArrowDownLeft, Landmark, 
    Layers, Search, Globe, MoreVertical
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, AreaChart, Area, 
    PieChart as RePieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '@/config';
import { useToast } from '../../context/ToastContext';
import { exportToExcel } from '../../utils/excelExport';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];

const ReportsPage = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('financial');
    const [dateRange, setDateRange] = useState('YEAR');

    // Queries (Aggregated Data)
    const { data: reportData = {}, isLoading } = useQuery({
        queryKey: ['reports-dashboard', dateRange],
        queryFn: async () => (await axios.get(`${API_URL}/reports/dashboard?range=${dateRange}`, { headers: H() })).data
    });

    const categories = [
        { id: 'financial', label: 'التقارير المالية', icon: <Landmark size={20} /> },
        { id: 'projects', label: 'تقارير المشاريع', icon: <Briefcase size={20} /> },
        { id: 'sales', label: 'تقارير المبيعات', icon: <TrendingUp size={20} /> },
        { id: 'hr', label: 'تقارير الموارد', icon: <Users size={20} /> },
    ];

    const chartData = [
        { name: 'يناير', revenue: 450000, expenses: 320000, profit: 130000 },
        { name: 'فبراير', revenue: 520000, expenses: 340000, profit: 180000 },
        { name: 'مارس', revenue: 610000, expenses: 380000, profit: 230000 },
        { name: 'أبريل', revenue: 580000, expenses: 360000, profit: 220000 },
        { name: 'مايو', revenue: 720000, expenses: 400000, profit: 320000 },
        { name: 'يونيو', revenue: 680000, expenses: 390000, profit: 290000 },
    ];

    const pieData = [
        { name: 'سكني', value: 400 },
        { name: 'تجاري', value: 300 },
        { name: 'إداري', value: 200 },
        { name: 'أخرى', value: 100 },
    ];

    return (
        <div className="fade-in" style={{ direction: 'rtl' }}>
             {/* Header */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '45px' }}>
                <div>
                    <h2 style={{ margin: '0 0 12px 0', fontSize: '2.8rem', fontWeight: '900', color: '#fff' }} className="gradient-text">مركز التحليلات الاستراتيجية</h2>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '1.1rem', fontWeight: '600' }}>ذكاء مالي، تقارير أداء حية، وتوقعات نمو مدعومة بالبيانات الضخمة.</p>
                </div>
                <div style={{ display: 'flex', gap: '18px' }}>
                    <div className="glass-card" style={{ display: 'flex', padding: '10px', borderRadius: '18px', gap: '5px' }}>
                        {['MONTH', 'QUARTER', 'YEAR'].map(r => (
                            <button 
                                key={r} 
                                onClick={() => setDateRange(r)}
                                style={{ 
                                    padding: '8px 20px', borderRadius: '12px', border: 'none', 
                                    background: dateRange === r ? 'rgba(99,102,241,0.15)' : 'transparent',
                                    color: dateRange === r ? '#fff' : '#71717a', fontWeight: '900', cursor: 'pointer', transition: 'all 0.3s'
                                }}
                            >
                                {r === 'MONTH' ? 'شهري' : r === 'QUARTER' ? 'ربع سنوي' : 'سنوي'}
                            </button>
                        ))}
                    </div>
                    <motion.button {...buttonClick} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '14px 35px', borderRadius: '20px', cursor: 'pointer', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 15px 35px rgba(16, 185, 129, 0.3)' }}>
                        <Download size={22} /> تصدير التقرير الشامل
                    </motion.button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '45px', overflowX: 'auto', paddingBottom: '10px' }}>
                {categories.map(cat => (
                    <motion.button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        whileHover={{ y: -3 }}
                        style={{
                            padding: '18px 35px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)',
                            background: activeTab === cat.id ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                            color: activeTab === cat.id ? '#fff' : '#a1a1aa',
                            fontWeight: '900', cursor: 'pointer', transition: 'all 0.3s',
                            display: 'flex', alignItems: 'center', gap: '15px', backdropFilter: 'blur(10px)',
                            boxShadow: activeTab === cat.id ? '0 15px 25px rgba(99,102,241,0.15)' : 'none',
                            borderTop: activeTab === cat.id ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.06)'
                        }}
                    >
                        {cat.icon} {cat.label}
                    </motion.button>
                ))}
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '45px' }}>
                {[
                    { label: 'إجمالي العوائد', value: '4,520,000', change: '+12%', up: true, icon: <Landmark size={24} />, color: '#6366f1' },
                    { label: 'الأرباح التشغيلية', value: '1,840,000', change: '+8%', up: true, icon: <TrendingUp size={24} />, color: '#10b981' },
                    { label: 'نفقات المشاريع', value: '2,680,000', change: '-4%', up: false, icon: <Layers size={24} />, color: '#ef4444' },
                    { label: 'رضا العملاء', value: '98.5%', change: '+1.2%', up: true, icon: <Users size={24} />, color: '#f59e0b' },
                ].map((s, i) => (
                    <motion.div key={i} className="glass-card card-hover" style={{ padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ background: `${s.color}15`, padding: '12px', borderRadius: '15px', color: s.color }}>{s.icon}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: s.up ? '#10b981' : '#ef4444', fontSize: '0.9rem', fontWeight: '900', background: `${s.up ? '#10b981' : '#ef4444'}10`, padding: '4px 12px', borderRadius: '20px' }}>
                                {s.up ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />} {s.change}
                            </div>
                        </div>
                        <div style={{ fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '8px' }}>{s.label}</div>
                        <div style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.04em' }}>{s.value} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>ر.س</span></div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '45px' }}>
                <div className="glass-card" style={{ padding: '40px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                         <h3 style={{ margin: 0, color: '#fff', fontSize: '1.6rem', fontWeight: '900' }}>تحليل الأداء المالي الربعي</h3>
                         <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '700' }}><div style={{ width: '10px', height: '10px', background: '#6366f1', borderRadius: '50%' }} /> إيرادات</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '700' }}><div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }} /> مصروفات</div>
                         </div>
                    </div>
                    <div style={{ width: '100%', height: '400px' }}>
                        <ResponsiveContainer>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `\${v/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', color: '#fff', fontFamily: 'Cairo' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorExp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '40px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 style={{ margin: '0 0 40px 0', color: '#fff', fontSize: '1.6rem', fontWeight: '900' }}>توزيع المشاريع</h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer>
                            <RePieChart>
                                <Pie 
                                    data={pieData} 
                                    innerRadius={80} 
                                    outerRadius={120} 
                                    paddingAngle={8} 
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', color: '#fff', fontFamily: 'Cairo' }}
                                />
                                <Legend />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: '30px' }}>
                         {pieData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#a1a1aa' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', background: COLORS[i % COLORS.length], borderRadius: '50%' }} />
                                    <span style={{ fontWeight: '700' }}>{d.name}</span>
                                </div>
                                <span style={{ fontWeight: '900', color: '#fff' }}>{d.value} مشروع</span>
                            </div>
                         ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Records Table */}
            <div className="glass-card" style={{ borderRadius: '40px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ padding: '30px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <h3 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: '900' }}>آخر السجلات المستخرجة</h3>
                     <button className="glass-card" style={{ padding: '8px 20px', borderRadius: '12px', border: 'none', color: '#a1a1aa', fontWeight: '900', cursor: 'pointer', fontSize: '0.9rem' }}>مشاهدة الكل</button>
                </div>
                <div className="table-responsive">
                    <table className="table-glass" style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'right', padding: '25px 20px' }}>اسم التقرير</th>
                                <th style={{ textAlign: 'right' }}>النوع</th>
                                <th style={{ textAlign: 'center' }}>تاريخ الإصدار</th>
                                <th style={{ textAlign: 'center' }}>الحالة</th>
                                <th style={{ textAlign: 'center' }}>تحميل</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'الميزانية السنوية 2024', type: 'مالي', date: '2024-06-25', status: 'READY' },
                                { name: 'كشف حضور المهندسين - يونيو', type: 'HR', date: '2024-06-20', status: 'READY' },
                                { name: 'جرد المستودعات المركزية', type: 'مخزون', date: '2024-06-15', status: 'ARCHIVED' },
                            ].map((rep, idx) => (
                                <tr key={idx}>
                                    <td style={{ padding: '20px', fontWeight: '800', color: '#fff' }}>{rep.name}</td>
                                    <td><span style={{ color: '#a1a1aa', fontWeight: '700' }}>{rep.type}</span></td>
                                    <td style={{ textAlign: 'center', color: '#a1a1aa', fontWeight: '600' }}>{rep.date}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={`status-pill \${rep.status === 'READY' ? 'status-paid' : 'status-pending'}`}>
                                            {rep.status === 'READY' ? 'جاهز' : 'مؤرشف'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <motion.button whileHover={{ scale: 1.1 }} style={{ background: 'rgba(255,255,255,0.05)', color: '#6366f1', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
                                            <Download size={18} />
                                        </motion.button>
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

export default ReportsPage;
