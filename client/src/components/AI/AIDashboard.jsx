import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import API_URL from '@/config';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, Send, TrendingUp, AlertTriangle, CheckCircle, Info,
    BarChart3, Target, Layers, Zap, RefreshCw, ChevronDown, ChevronUp,
    DollarSign, Briefcase, Users, Package, Brain, Sparkles
} from 'lucide-react';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ========================
// Alert Card Component
// ========================
const AlertCard = ({ alert }) => {
    const colors = {
        danger: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '🚨' },
        warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', icon: '⚠️' },
        success: { bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46', icon: '✅' },
        info: { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', icon: 'ℹ️' },
    };
    const c = colors[alert.type] || colors.info;
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}
        >
            <div onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <span style={{ fontSize: '1.4rem' }}>{alert.icon}</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: c.text, fontSize: '0.95rem' }}>{alert.title}</div>
                    <div style={{ color: c.text, fontSize: '0.85rem', opacity: 0.85, marginTop: '2px' }}>{alert.message}</div>
                </div>
                {alert.items?.length > 0 && (
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text }}>
                        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                )}
            </div>
            {open && alert.items?.length > 0 && (
                <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ margin: '12px 0 0 0', padding: '0 20px', listStyle: 'disc', color: c.text, fontSize: '0.85rem' }}>
                    {alert.items.map((item, i) => <li key={i} style={{ marginBottom: '4px' }}>{item}</li>)}
                </motion.ul>
            )}
        </motion.div>
    );
};

// ========================
// Insight Card Component
// ========================
const InsightCard = ({ insight }) => {
    const colors = {
        success: '#10b981', warning: '#f59e0b', danger: '#ef4444', info: '#3b82f6'
    };
    return (
        <div style={{ background: 'white', border: `1px solid #f1f5f9`, borderRadius: '12px', padding: '16px', marginBottom: '10px', borderRight: `4px solid ${colors[insight.type] || '#3b82f6'}` }}>
            <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '6px', fontSize: '0.95rem' }}>{insight.title}</div>
            <div style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.6' }}>{insight.message}</div>
        </div>
    );
};

// ========================
// KPI Card Component
// ========================
const KPICard = ({ kpi }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
            background: 'white', borderRadius: '16px', padding: '20px',
            border: '1px solid #f1f5f9', textAlign: 'center',
            borderTop: `4px solid ${kpi.color}`
        }}
    >
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', fontFamily: 'Cairo' }}>{kpi.value}</div>
        <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '6px', fontWeight: '500' }}>{kpi.title}</div>
        <div style={{
            display: 'inline-block', marginTop: '8px', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700',
            background: kpi.trend === 'up' ? '#ecfdf5' : kpi.trend === 'down' ? '#fef2f2' : '#f1f5f9',
            color: kpi.trend === 'up' ? '#10b981' : kpi.trend === 'down' ? '#ef4444' : '#64748b',
        }}>{kpi.change}</div>
    </motion.div>
);

// ========================
// AI Chat Component
// ========================
const AIChat = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'مرحباً! أنا مساعدك الذكي لـ مؤسسة الجنوب الجديد 🤖\n\nيمكنني مساعدتك في:\n• تحليل الأداء المالي\n• متابعة المشاريع والعملاء\n• اقتراح قرارات استراتيجية\n• تحليل مسار المبيعات\n\nبماذا يمكنني مساعدتك اليوم؟', suggestions: ['التحليل المالي', 'صحة المشاريع', 'تحليل CRM', 'تنبيهات ذكية'] }
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
            setMessages(prev => [...prev, { role: 'assistant', content: 'عذراً، حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة مجدداً.' }]);
        }
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '500px', background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '10px' }}>
                    <Bot size={22} color="white" />
                </div>
                <div>
                    <div style={{ color: 'white', fontWeight: '700', fontSize: '1rem' }}>المساعد الذكي</div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem' }}>مدعوم بـ GPT-4o ✨</div>
                </div>
                <div style={{ marginRight: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: '10px', alignItems: 'flex-start' }}>
                        {msg.role === 'assistant' && (
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Bot size={16} color="white" />
                            </div>
                        )}
                        <div style={{ maxWidth: '75%' }}>
                            <div style={{
                                background: msg.role === 'user' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'white',
                                color: msg.role === 'user' ? 'white' : '#1e293b',
                                padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-wrap',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}>
                                {msg.content}
                            </div>
                            {msg.suggestions && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                    {msg.suggestions.map((s, si) => (
                                        <button key={si} onClick={() => sendMessage(s)} style={{
                                            background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '20px',
                                            padding: '4px 12px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '600'
                                        }}>{s}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={16} color="white" />
                        </div>
                        <div style={{ background: 'white', padding: '12px 16px', borderRadius: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[0, 1, 2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', animation: `bounce 1s ${i * 0.2}s infinite` }} />)}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div style={{ padding: '12px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="اسألني عن أداء النظام، المشاريع، الإيرادات..."
                    style={{
                        flex: 1, padding: '10px 16px', borderRadius: '25px', border: '1px solid #e2e8f0',
                        fontFamily: 'Cairo', fontSize: '0.9rem', outline: 'none', direction: 'rtl', background: '#f8fafc'
                    }}
                />
                <button onClick={() => sendMessage()} style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', border: 'none',
                    borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    <Send size={18} />
                </button>
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
        { key: 'alerts', label: 'التنبيهات الذكية', icon: <Zap size={16} /> },
        { key: 'financial', label: 'التحليل المالي', icon: <DollarSign size={16} /> },
        { key: 'projects', label: 'صحة المشاريع', icon: <Briefcase size={16} /> },
        { key: 'crm', label: 'تحليل المبيعات', icon: <Target size={16} /> },
        { key: 'chat', label: 'المساعد الذكي', icon: <Bot size={16} /> },
    ];

    return (
        <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
                    borderRadius: '20px', padding: '28px', marginBottom: '24px', color: 'white', position: 'relative', overflow: 'hidden'
                }}
            >
                <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(59,130,246,0.15)' }} />
                <div style={{ position: 'absolute', bottom: '-30px', right: '20%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(139,92,246,0.1)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '14px', backdropFilter: 'blur(10px)' }}>
                            <Brain size={28} color="white" />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900' }}>مركز الذكاء الاصطناعي</h1>
                            <p style={{ margin: '4px 0 0 0', opacity: 0.8, fontSize: '0.95rem' }}>
                                تحليلات متقدمة ورؤى استراتيجية مدعومة بـ GPT-4o ✨
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* KPIs Strip */}
            {!kpisLoading && kpisData?.kpis && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    {kpisData.kpis.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', background: '#f1f5f9', padding: '6px', borderRadius: '14px' }}>
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                        flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '10px 16px', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '600', fontSize: '0.88rem',
                        borderRadius: '10px', transition: 'all 0.2s',
                        background: activeTab === tab.key ? 'white' : 'transparent',
                        color: activeTab === tab.key ? '#2563eb' : '#64748b',
                        boxShadow: activeTab === tab.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                    }}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

                    {/* Alerts Tab */}
                    {activeTab === 'alerts' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, color: '#1e293b' }}>التنبيهات الذكية الآنية</h3>
                                <button onClick={() => refetchAlerts()} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                    <RefreshCw size={14} /> تحديث
                                </button>
                            </div>
                            {alertsLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>⏳ جاري تحليل البيانات...</div>
                            ) : (
                                alertsData?.alerts?.map((alert, i) => <AlertCard key={i} alert={alert} />)
                            )}
                        </div>
                    )}

                    {/* Financial Tab */}
                    {activeTab === 'financial' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>رؤى مالية ذكية</h3>
                                {financialLoading ? <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>⏳ جاري التحليل...</div> :
                                    financialData?.insights?.map((ins, i) => <InsightCard key={i} insight={ins} />)
                                }
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>إحصاءات الفواتير</h3>
                                {financialData?.data?.invoiceStats?.map((stat, i) => (
                                    <div key={i} style={{ background: 'white', borderRadius: '10px', padding: '14px', marginBottom: '10px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#64748b', fontWeight: '600' }}>{({ DRAFT: 'مسودة', POSTED: 'مُرسَلة', PAID: 'مدفوعة', CANCELLED: 'ملغاة' })[stat.status] || stat.status}</span>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: '700', color: '#0f172a' }}>{stat._count?.id} فاتورة</div>
                                            <div style={{ fontSize: '0.8rem', color: '#10b981' }}>{(stat._sum?.total || 0).toLocaleString('ar')} ر.س</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects Tab */}
                    {activeTab === 'projects' && (
                        <div>
                            <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>صحة المشاريع النشطة</h3>
                            {projectLoading ? <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>⏳ جاري التحليل...</div> : (
                                <>
                                    {projectData?.insights?.map((ins, i) => <InsightCard key={i} insight={ins} />)}
                                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {projectData?.projects?.map((p, i) => (
                                            <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', border: `1px solid ${p.health === 'CRITICAL' ? '#fca5a5' : p.health === 'AT_RISK' ? '#fcd34d' : '#d1fae5'}` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{p.name}</div>
                                                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>العميل: {p.client} • {p.daysLeft != null ? `${p.daysLeft} يوم متبقٍ` : 'لا تاريخ'}</div>
                                                    </div>
                                                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: p.health === 'CRITICAL' ? '#fef2f2' : p.health === 'AT_RISK' ? '#fffbeb' : '#ecfdf5', color: p.health === 'CRITICAL' ? '#dc2626' : p.health === 'AT_RISK' ? '#d97706' : '#059669' }}>
                                                        {({ CRITICAL: '🔴 حرج', AT_RISK: '🟡 تحت المراقبة', HEALTHY: '🟢 سليم' })[p.health]}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>إنجاز المهام</div>
                                                        <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '6px' }}>
                                                            <div style={{ background: '#3b82f6', borderRadius: '4px', height: '6px', width: `${p.taskProgress}%`, transition: 'width 1s' }} />
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>{p.taskProgress.toFixed(0)}%</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>التحصيل المالي</div>
                                                        <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '6px' }}>
                                                            <div style={{ background: '#10b981', borderRadius: '4px', height: '6px', width: `${Math.min(p.financialProgress, 100)}%`, transition: 'width 1s' }} />
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>{p.financialProgress.toFixed(0)}%</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {projectData?.projects?.length === 0 && <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>لا توجد مشاريع نشطة حالياً</div>}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* CRM Tab */}
                    {activeTab === 'crm' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>رؤى مسار المبيعات</h3>
                                {crmLoading ? <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>⏳ جاري التحليل...</div> :
                                    crmData?.insights?.map((ins, i) => <InsightCard key={i} insight={ins} />)
                                }
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>مؤشرات CRM</h3>
                                {crmData && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {[
                                            { label: 'إجمالي خط الفرص', value: `${(crmData.totalPipelineValue || 0).toLocaleString('ar')} ر.س`, color: '#3b82f6' },
                                            { label: 'القيمة المرجّحة (بالاحتمالية)', value: `${Math.round(crmData.weightedValue || 0).toLocaleString('ar')} ر.س`, color: '#8b5cf6' },
                                            { label: 'معدل الفوز', value: `${(crmData.winRate || 0).toFixed(1)}%`, color: '#10b981' },
                                        ].map((item, i) => (
                                            <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #f1f5f9', borderRight: `4px solid ${item.color}` }}>
                                                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{item.label}</div>
                                                <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#0f172a', marginTop: '4px' }}>{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Chat Tab */}
                    {activeTab === 'chat' && <AIChat />}

                </motion.div>
            </AnimatePresence>

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
            `}</style>
        </div>
    );
}
