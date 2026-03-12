import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Briefcase, CreditCard, FileText, AlertCircle, 
    ChevronLeft, Sparkles, TrendingUp, Wallet,
    ShieldCheck, Clock, CheckCircle2, LayoutGrid,
    ArrowUpRight, Activity
} from 'lucide-react';
import API_URL from '@/config';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

const StatCard = ({ title, value, subtext, icon: Icon, color, visible = true, delay = 0 }) => {
    if (!visible) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            className="glass-card"
            style={{
                padding: '30px',
                borderRadius: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.05)'
            }}
        >
            <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', background: color }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '55px', height: '55px', borderRadius: '18px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={26} />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#71717a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Activity size={12} /> مباشر
                </div>
            </div>
            <div>
                <div style={{ color: '#a1a1aa', fontSize: '1rem', fontWeight: '700', marginBottom: '8px' }}>{title}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff', marginBottom: '4px', letterSpacing: '-1px' }}>{value}</div>
                <div style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: '600' }}>{subtext}</div>
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

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#71717a' }}>
            <div style={{ textAlign: 'center' }}>
                <Sparkles className="animate-pulse" size={48} style={{ color: '#6366f1', marginBottom: '20px' }} />
                <h3 style={{ fontWeight: '800', color: '#fff' }}>جاري تحضير تقاريرك الخاصة...</h3>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Hero Welcome */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card" 
                style={{ 
                    padding: '40px', 
                    borderRadius: '40px', 
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'inline-flex', padding: '6px 15px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '900', marginBottom: '20px', gap: '8px', alignItems: 'center' }}>
                            <Sparkles size={14} /> الحالة الموثقة للعميل
                        </div>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', color: '#fff' }}>ملخص حسابك العقاري</h1>
                        <p style={{ margin: '10px 0 0 0', fontSize: '1.1rem', color: '#a1a1aa', fontWeight: '600' }}>أهلاً بك مجدداً {user?.name}. يمكنك هنا متابعة تقدم مشاريعك والتدفقات المالية الخاصة بك.</p>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: '800', marginBottom: '5px' }}>رصيدك الإجمالي المطلوب سداده</div>
                        <div style={{ fontSize: '2.8rem', fontWeight: '900', color: '#fff' }}>
                            {(stats?.balance || 0).toLocaleString()} <span style={{ fontSize: '1rem', opacity: 0.5 }}>ر.س</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Core Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                <StatCard
                    title="المشاريع الجارية"
                    value={stats?.projectsCount || 0}
                    subtext="مشاريع تحت التنفيذ قيد المتابعة"
                    icon={Briefcase}
                    color="#6366f1"
                    delay={0.1}
                    visible={stats?.permissions?.trackProjects !== false}
                />
                <StatCard
                    title="إجمالي المسدد"
                    value={`${(stats?.totalPaid || 0).toLocaleString()}`}
                    subtext="صافي الدفعات المؤكدة في النظام"
                    icon={CheckCircle2}
                    color="#10b981"
                    delay={0.2}
                    visible={stats?.permissions?.viewFinancials === true}
                />
                <StatCard
                    title="إجمالي الفواتير"
                    value={`${(stats?.totalInvoiced || 0).toLocaleString()}`}
                    subtext="قيمة الأعمال المنجزة والمفوترة"
                    icon={TrendingUp}
                    color="#0ea5e9"
                    delay={0.3}
                    visible={stats?.permissions?.viewFinancials === true}
                />
                <StatCard
                    title="تذاكر الدعم"
                    value={stats?.openTicketsCount || 0}
                    subtext="طلبات دعم فني قيد المراجعة"
                    icon={FileText}
                    color="#f59e0b"
                    delay={0.4}
                />
            </div>

            {/* Detailed Updates Section */}
            <div className="glass-card" style={{ padding: '40px', borderRadius: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ background: 'rgba(99,102,241,0.1)', padding: '10px', borderRadius: '15px', color: '#6366f1' }}><LayoutGrid size={24} /></span>
                        آخر مستجدات المشاريع الميدانية
                    </h3>
                    <motion.button {...buttonClick} style={{ background: 'rgba(255,255,255,0.03)', color: '#a1a1aa', border: 'none', padding: '10px 25px', borderRadius: '14px', fontWeight: '800', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        مشاهدة الجميع <ArrowUpRight size={18} />
                    </motion.button>
                </div>
                
                <div style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '2px dashed rgba(255,255,255,0.05)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', color: '#52525b' }}>
                         <Clock size={40} />
                    </div>
                    <h3 style={{ color: '#fff', fontWeight: '900', fontSize: '1.4rem' }}>لا توجد تحديثات جديدة اليوم</h3>
                    <p style={{ color: '#71717a', fontSize: '1rem', maxWidth: '500px', margin: '10px auto 30px', fontWeight: '600' }}>
                        سيتم إخطارك هنا فور صدور تقرير ميداني جديد أو مراجعة فنية لأحد مشاريعك القائمة.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
