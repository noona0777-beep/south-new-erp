import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import API_URL from '@/config';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, Send, TrendingUp, AlertTriangle, CheckCircle, Info,
    BarChart3, Target, Layers, Zap, RefreshCw, ChevronDown, ChevronUp,
    DollarSign, Briefcase, Users, Package, Brain, Sparkles, HardHat, ShieldCheck, Activity
} from 'lucide-react';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ========================
// Premium Alert Card
// ========================
const AlertCard = ({ alert }) => {
    const colors = {
        danger: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5', glow: 'rgba(239, 68, 68, 0.3)' },
        warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', text: '#fcd34d', glow: 'rgba(245, 158, 11, 0.3)' },
        success: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', text: '#6ee7b7', glow: 'rgba(16, 185, 129, 0.3)' },
        info: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: '#93c5fd', glow: 'rgba(59, 130, 246, 0.3)' },
    };
    const c = colors[alert.type] || colors.info;
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{ 
                background: c.bg, 
                border: `1px solid ${c.border}`, 
                borderRadius: '20px', 
                padding: '20px', 
                marginBottom: '15px',
                boxShadow: `0 10px 30px -10px ${c.glow}`
            }}
        >
            <div onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
                <div style={{ fontSize: '1.8rem', opacity: 0.9, filter: `drop-shadow(0 0 8px ${c.glow})` }}>{alert.icon}</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '800', color: '#fff', fontSize: '1rem' }}>{alert.title}</div>
                    <div style={{ color: c.text, fontSize: '0.9rem', opacity: 0.9, marginTop: '4px' }}>{alert.message}</div>
                </div>
                {alert.items?.length > 0 && (
                    <motion.div animate={{ rotate: open ? 180 : 0 }}>
                        <ChevronDown size={20} color={c.text} />
                    </motion.div>
                )}
            </div>
            <AnimatePresence>
                {open && alert.items?.length > 0 && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <ul style={{ margin: '15px 0 0 0', padding: '0 25px', color: '#fff', fontSize: '0.9rem', opacity: 0.8, borderTop: `1px solid ${c.border}`, paddingTop: '15px' }}>
                            {alert.items.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{item}</li>)}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ========================
// Premium Insight Card
// ========================
const InsightCard = ({ insight }) => {
    const colors = {
        success: '#10b981', warning: '#f59e0b', danger: '#ef4444', info: '#3b82f6'
    };
    const accent = colors[insight.type] || '#3b82f6';
    return (
        <motion.div 
            whileHover={{ x: 5 }}
            className="glass-card"
            style={{ 
                padding: '20px', 
                borderRadius: '18px', 
                marginBottom: '12px', 
                borderRight: `4px solid ${accent}`,
                background: 'rgba(255,255,255,0.02)'
            }}
        >
            <div style={{ fontWeight: '800', color: '#fff', marginBottom: '8px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color={accent} /> {insight.title}
            </div>
            <div style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.7' }}>{insight.message}</div>
        </motion.div>
    );
};

// ========================
// Premium KPI Card
// ========================
const KPICard = ({ kpi }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card card-hover"
        style={{
            padding: '24px', borderRadius: '24px', textAlign: 'center',
            position: 'relative', overflow: 'hidden'
        }}
    >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: kpi.color }} />
        <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff', fontFamily: 'Outfit, Cairo', letterSpacing: '-1px' }}>{kpi.value}</div>
        <div style={{ color: '#a1a1aa', fontSize: '0.95rem', marginTop: '4px', fontWeight: '600' }}>{kpi.title}</div>
        <div style={{
            display: 'inline-block', marginTop: '12px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '800',
            background: kpi.trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : kpi.trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
            color: kpi.trend === 'up' ? '#10b981' : kpi.trend === 'down' ? '#ef4444' : '#a1a1aa',
            border: `1px solid ${kpi.trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : kpi.trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)'}`
        }}>{kpi.change}</div>
    </motion.div>
);

// ========================
// SBC Advisor (Dark Mode)
// ========================
const SBCAdvisor = () => {
    const [question, setQuestion] = useState('');
    const [phase, setPhase] = useState('CONSTRUCTION');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const askSBC = async () => {
        if (!question) return;
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/ai/sbc-advisor`, { question, phase }, { headers: H() });
            setResult(res.data);
        } catch (error) { 
            console.error('SBC Advisor Error:', error.response?.data || error.message);
        }
        setLoading(false);
    };

    return (
        <div className="glass-card" style={{ borderRadius: '28px', padding: '35px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(249, 115, 22, 0.05)', filter: 'blur(80px)', borderRadius: '50%' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', position: 'relative', zIndex: 1 }}>
                <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '14px', borderRadius: '18px', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.2)' }}><HardHat size={30} /></div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff', fontWeight: '900' }}>مستشار كود البناء السعودي (SBC)</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: '#a1a1aa' }}>تحقق من مطابقة مخططاتك وأعمالك الإنشائية للمعايير الوطنية السعودية</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '25px', position: 'relative', zIndex: 1 }}>
                <input 
                    className="premium-input"
                    value={question} onChange={e => setQuestion(e.target.value)}
                    placeholder="اسأل عن أي اشتراط هندسي (مثلاً: سمك الجدران، العزل، التسليح)..."
                    style={{ width: '100%', padding: '16px 20px', borderRadius: '18px', fontSize: '1rem' }}
                />
                <select 
                    className="premium-input-select"
                    value={phase} onChange={e => setPhase(e.target.value)}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: '18px' }}
                >
                    <option value="DESIGN">المخططات والتصميم</option>
                    <option value="CONSTRUCTION">مرحلة العظم</option>
                    <option value="FINISHING">التشطيبات النهائية</option>
                </select>
            </div>

            <motion.button 
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(249, 115, 22, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={askSBC} disabled={loading}
                style={{ width: '100%', padding: '18px', borderRadius: '18px', border: 'none', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', fontWeight: '900', cursor: 'pointer', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '1.1rem', position: 'relative', zIndex: 1 }}
            >
                {loading ? <RefreshCw className="animate-spin" size={22} /> : <><ShieldCheck size={22} /> تحليل الكود الهندسي</>}
            </motion.button>

            <AnimatePresence>
                {result && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        style={{ background: 'rgba(249, 115, 22, 0.03)', borderRadius: '24px', padding: '30px', border: '1px solid rgba(249, 115, 22, 0.1)', position: 'relative', zIndex: 1 }}
                    >
                        <div style={{ fontWeight: '900', color: '#fb923c', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                             <Sparkles size={20} /> النتائج والتحليل الفني:
                        </div>
                        <div style={{ color: '#fff', fontSize: '1rem', lineHeight: '1.8', marginBottom: '25px', opacity: 0.9 }}>{result.answer}</div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                            <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', background: 'rgba(0,0,0,0.2)' }}>
                                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fb923c', marginBottom: '12px' }}>أهم بنود الكود ذات الصلة:</div>
                                {result.relevantClauses.map((c, i) => (
                                    <div key={i} style={{ fontSize: '0.85rem', color: '#fff', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '10px', marginBottom: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>{c}</div>
                                ))}
                            </div>
                            <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', background: 'rgba(0,0,0,0.2)' }}>
                                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fb923c', marginBottom: '12px' }}>توصيات المهندس الذكي:</div>
                                {result.recommendations.map((r, i) => (
                                    <div key={i} style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '8px', opacity: 0.8, display: 'flex', gap: '8px' }}>
                                        <div style={{ color: '#fb923c' }}>✅</div> {r}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ========================
// AI Chat (Dark Mode)
// ========================
const AIChat = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'مرحباً بك في مركز التحليلات المتقدمة 🤖\n\nأنا مساعدك الذكي الخاص بـ مؤسسة الجنوب الجديد. يمكنني تحليل البيانات المالية، تقييم صحة المشاريع، ومساعدتك في اتخاذ قرارات استباقية بناءً على الأداء الفعلي.', suggestions: ['تحليل السيولة', 'تقييم مخاطر المشاريع', 'أداء المبيعات', 'استشارة هندسية'] }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = async (text) => {
        const msg = text || input.trim();
        if (!msg) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/ai/chat`, { message: msg }, { headers: H() });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, suggestions: res.data.suggestions }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'عذراً، حدث خطأ في معالجة طلبك.' }]);
        }
        setLoading(false);
    };

    return (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '600px', borderRadius: '28px', overflow: 'hidden' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '20px 30px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '10px', borderRadius: '14px', boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' }}>
                    <Bot size={24} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: '900', fontSize: '1.1rem' }}>محرك الرؤى الذكي</div>
                    <div style={{ color: '#818cf8', fontSize: '0.8rem', fontWeight: '700' }}>GPT-4o Advanced Engine • متصل بالبيانات</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '20px', color: '#10b981', fontSize: '0.75rem', fontWeight: '800' }}>
                    <div className="pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> نشط
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }} className="main-scroll">
                {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: '15px', alignItems: 'flex-start' }}>
                        {msg.role === 'assistant' && (
                            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Bot size={20} color="#818cf8" />
                            </div>
                        )}
                        <div style={{ maxWidth: '80%' }}>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    padding: '16px 20px', borderRadius: msg.role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                                    fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap',
                                    border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                    boxShadow: msg.role === 'user' ? '0 10px 20px -10px rgba(99, 102, 241, 0.5)' : 'none'
                                }}
                            >
                                {msg.content}
                            </motion.div>
                            {msg.suggestions && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                    {msg.suggestions.map((s, si) => (
                                        <motion.button 
                                            key={si} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => sendMessage(s)} 
                                            style={{
                                                background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '20px',
                                                padding: '6px 16px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '800'
                                            }}
                                        >
                                            <Sparkles size={14} style={{ display: 'inline', marginLeft: '6px' }} /> {s}
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={20} color="#818cf8" />
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px 25px', borderRadius: '24px' }}>
                           <div style={{ display: 'flex', gap: '6px' }}>
                                {[0, 1, 2].map(i => <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />)}
                           </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div style={{ padding: '25px 30px', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '15px' }}>
                <input
                    className="premium-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="اكتب استفسارك هنا، المحرك سيتولى البحث والتحليل..."
                    style={{ flex: 1, padding: '16px 25px', borderRadius: '18px', fontSize: '1rem', border: 'none' }}
                />
                <motion.button 
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => sendMessage()} 
                    style={{
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', border: 'none',
                        borderRadius: '18px', width: '56px', height: '56px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: '0 10px 20px -10px rgba(99, 102, 241, 0.5)'
                    }}
                >
                    <Send size={24} />
                </motion.button>
            </div>
        </div>
    );
};

// ========================
// Main AI Dashboard Page
// ========================
export default function AIDashboard() {
    const [activeTab, setActiveTab] = useState('alerts');

    const { data: alertsData, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
        queryKey: ['smartAlerts'],
        queryFn: async () => (await axios.get(`${API_URL}/ai/smart-alerts`, { headers: H() })).data,
    });

    const { data: kpisData, isLoading: kpisLoading } = useQuery({
        queryKey: ['executiveKPIs'],
        queryFn: async () => (await axios.get(`${API_URL}/ai/executive-kpis`, { headers: H() })).data,
    });

    const { data: financialData, isLoading: financialLoading } = useQuery({
        queryKey: ['financialInsights'],
        queryFn: async () => (await axios.get(`${API_URL}/ai/financial-insights`, { headers: H() })).data,
        enabled: activeTab === 'financial'
    });

    const { data: projectData, isLoading: projectLoading } = useQuery({
        queryKey: ['projectHealth'],
        queryFn: async () => (await axios.get(`${API_URL}/ai/project-health`, { headers: H() })).data,
        enabled: activeTab === 'projects'
    });

    const { data: crmData, isLoading: crmLoading } = useQuery({
        queryKey: ['crmInsights'],
        queryFn: async () => (await axios.get(`${API_URL}/ai/crm-insights`, { headers: H() })).data,
        enabled: activeTab === 'crm'
    });

    const tabs = [
        { key: 'alerts', label: 'تنبيهات المرحلة', icon: <Zap size={18} /> },
        { key: 'financial', label: 'تحليل الميزانية', icon: <DollarSign size={18} /> },
        { key: 'projects', label: 'مراقب المشاريع', icon: <Activity size={18} /> },
        { key: 'sbc', label: 'مستشار SBC', icon: <HardHat size={18} /> },
        { key: 'crm', label: 'أداء المبيعات', icon: <Target size={18} /> },
        { key: 'chat', label: 'المساعد الذكي', icon: <Bot size={18} /> },
    ];

    return (
        <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl', paddingBottom: '50px' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
                    borderRadius: '30px', padding: '35px', marginBottom: '35px', color: 'white', position: 'relative', overflow: 'hidden',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                }}
            >
                <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(80px)' }} />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '16px', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.3)', boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)' }}>
                            <Brain size={35} color="#818cf8" />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }} className="gradient-text">مركز الرؤى والذكاء الاصطناعي</h1>
                            <p style={{ margin: '6px 0 0 0', opacity: 0.8, fontSize: '1.1rem', fontWeight: '500', color: '#a1a1aa' }}>
                                تحليل لحظي للموارد والعمليات مدعوم بمحرك GPT-4o ✨
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* KPIs Strip */}
            {!kpisLoading && kpisData?.kpis && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '35px' }}>
                    {kpisData.kpis.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}
                </div>
            )}

            {/* Tabs */}
            <div className="glass-card" style={{ display: 'flex', gap: '8px', padding: '8px', borderRadius: '20px', marginBottom: '30px', overflowX: 'auto' }} className="main-scroll">
                {tabs.map(tab => (
                    <motion.button 
                        key={tab.key} 
                        onClick={() => setActiveTab(tab.key)}
                        whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                        style={{
                            flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            padding: '14px 20px', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '800', fontSize: '0.95rem',
                            borderRadius: '16px', transition: 'all 0.3s',
                            background: activeTab === tab.key ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1))' : 'transparent',
                            color: activeTab === tab.key ? '#fff' : '#71717a',
                            border: activeTab === tab.key ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent'
                        }}
                    >
                        {React.cloneElement(tab.icon, { size: 20, color: activeTab === tab.key ? '#818cf8' : 'inherit' })} 
                        {tab.label}
                    </motion.button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>

                    {activeTab === 'alerts' && (
                        <div className="glass-card" style={{ padding: '35px', borderRadius: '28px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: '900' }}>التنبيهات الإدارية الذكية</h3>
                                <motion.button whileHover={{ rotate: 180 }} onClick={() => refetchAlerts()} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <RefreshCw size={20} />
                                </motion.button>
                            </div>
                            {alertsLoading ? (
                                <div style={{ textAlign: 'center', padding: '100px', color: '#a1a1aa' }}><RefreshCw className="animate-spin" style={{ margin: '0 auto 15px' }} /> جاري فحص بيانات النظام...</div>
                            ) : (
                                alertsData?.alerts?.map((alert, i) => <AlertCard key={i} alert={alert} />)
                            )}
                        </div>
                    )}

                    {activeTab === 'financial' && (
                        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                <div className="glass-card" style={{ padding: '30px', borderRadius: '28px' }}>
                                    <h3 style={{ margin: '0 0 25px', color: '#fff', fontSize: '1.3rem', fontWeight: '900' }}>التحليل المالي المتقدم</h3>
                                    {financialLoading ? <div style={{ textAlign: 'center', padding: '50px', color: '#a1a1aa' }}>⏳ جاري معالجة البيانات المالية...</div> :
                                        financialData?.insights?.map((ins, i) => <InsightCard key={i} insight={ins} />)
                                    }
                                </div>
                                <div className="glass-card" style={{ padding: '30px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(0,0,0,0))' }}>
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                                        <TrendingUp size={24} color="#6366f1" />
                                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: '800' }}>توقعات التدفق النقدي</h3>
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '18px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '5px' }}>توقع شهر {i}</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>+{(Math.random() * 50000 + 20000).toLocaleString('ar')}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', color: '#10b981', padding: '15px 20px', borderRadius: '15px', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.1)', fontWeight: '700' }}>
                                        💡 يُتوقع فائض سيولة الشهر القادم، يُنصح بإعادة استثماره في المواد الخام.
                                    </div>
                                </div>
                            </div>
                            <div className="glass-card" style={{ padding: '30px', borderRadius: '28px' }}>
                                <h3 style={{ margin: '0 0 25px', color: '#fff', fontSize: '1.3rem', fontWeight: '900' }}>حالة التحصيل</h3>
                                {financialData?.data?.invoiceStats?.map((stat, i) => (
                                    <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '18px', padding: '20px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ color: '#a1a1aa', fontWeight: '600', fontSize: '0.9rem' }}>{({ DRAFT: 'مسودة', POSTED: 'مُرسَلة', PAID: 'مدفوعة', CANCELLED: 'ملغاة' })[stat.status] || stat.status}</div>
                                            <div style={{ fontWeight: '900', color: '#fff', fontSize: '1.2rem', marginTop: '4px' }}>{stat._count?.id} فاتورة</div>
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: '1.1rem', color: '#10b981', fontWeight: '900' }}>{(stat._sum?.total || 0).toLocaleString('ar')}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#52525b' }}>ريال سعودي</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'sbc' && <SBCAdvisor />}

                    {activeTab === 'projects' && (
                        <div className="glass-card" style={{ padding: '35px', borderRadius: '28px' }}>
                            <h3 style={{ margin: '0 0 30px', color: '#fff', fontSize: '1.5rem', fontWeight: '900' }}>مراقب صحة المشاريع</h3>
                            {projectLoading ? <div style={{ textAlign: 'center', padding: '100px', color: '#a1a1aa' }}>⏳ جاري تحليل بيانات المشاريع والمهام...</div> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                                        {projectData?.projects?.map((p, i) => (
                                            <motion.div whileHover={{ y: -5 }} key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '25px', border: `1px solid ${p.health === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : p.health === 'AT_RISK' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '900', color: '#fff', fontSize: '1.2rem' }}>{p.name}</div>
                                                        <div style={{ fontSize: '0.9rem', color: '#a1a1aa', marginTop: '4px' }}>العميل: {p.client} • {p.daysLeft != null ? `${p.daysLeft} يوم متبقٍ` : 'لا تاريخ نهاية'}</div>
                                                    </div>
                                                    <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '900', background: p.health === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : p.health === 'AT_RISK' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: p.health === 'CRITICAL' ? '#ef4444' : p.health === 'AT_RISK' ? '#f59e0b' : '#10b981', border: `1px solid ${p.health === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : p.health === 'AT_RISK' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}` }}>
                                                        {({ CRITICAL: '🔴 وضع حرج', AT_RISK: '🟡 تحت المراقبة', HEALTHY: '🟢 أداء سليم' })[p.health]}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                            <span style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: '700' }}>الإنجاز الميداني</span>
                                                            <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '900' }}>{p.taskProgress.toFixed(0)}%</span>
                                                        </div>
                                                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${p.taskProgress}%` }} style={{ height: '100%', background: '#6366f1', borderRadius: '10px' }} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                            <span style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: '700' }}>نسبة التحصيل</span>
                                                            <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '900' }}>{p.financialProgress.toFixed(0)}%</span>
                                                        </div>
                                                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                                           <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(p.financialProgress, 100)}%` }} style={{ height: '100%', background: '#10b981', borderRadius: '10px' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '20px' }}>
                                        <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>رؤى صحة المشاريع</h4>
                                        {projectData?.insights?.map((ins, i) => <InsightCard key={i} insight={ins} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'crm' && (
                        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            <div className="glass-card" style={{ padding: '30px', borderRadius: '28px' }}>
                                <h3 style={{ margin: '0 0 25px', color: '#fff', fontSize: '1.3rem', fontWeight: '900' }}>تحليل مسار المبيعات</h3>
                                {crmLoading ? <div style={{ textAlign: 'center', padding: '50px', color: '#a1a1aa' }}>⏳ جاري تحليل ليدز وعروض الأسعار...</div> :
                                    crmData?.insights?.map((ins, i) => <InsightCard key={i} insight={ins} />)
                                }
                            </div>
                            <div className="glass-card" style={{ padding: '30px', borderRadius: '28px' }}>
                                <h3 style={{ margin: '0 0 25px', color: '#fff', fontSize: '1.3rem', fontWeight: '900' }}>القيمة السوقية للفرص</h3>
                                {crmData && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {[
                                            { label: 'إجمالي قيمة الفرص النشطة', value: `${(crmData.totalPipelineValue || 0).toLocaleString('ar')} ر.س`, color: '#6366f1', icon: <Target size={24} /> },
                                            { label: 'القيمة المرجّحة للمبيعات', value: `${Math.round(crmData.weightedValue || 0).toLocaleString('ar')} ر.س`, color: '#8b5cf6', icon: <DollarSign size={24} /> },
                                            { label: 'معدل النجاح الإجمالي', value: `${(crmData.winRate || 0).toFixed(1)}%`, color: '#10b981', icon: <Activity size={24} /> },
                                        ].map((item, i) => (
                                            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '20px', padding: '25px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div style={{ background: `${item.color}15`, padding: '15px', borderRadius: '15px', color: item.color }}>{item.icon}</div>
                                                <div>
                                                    <div style={{ color: '#a1a1aa', fontSize: '0.9rem', fontWeight: '700' }}>{item.label}</div>
                                                    <div style={{ fontWeight: '900', fontSize: '1.6rem', color: '#fff', marginTop: '5px' }}>{item.value}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'chat' && <AIChat />}

                </motion.div>
            </AnimatePresence>

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                .pulse {
                    animation: pulse-anim 2s infinite;
                }
                @keyframes pulse-anim {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
            `}</style>
        </div>
    );
}
