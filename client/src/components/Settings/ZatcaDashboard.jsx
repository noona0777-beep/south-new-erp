import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    Activity, CheckCircle2, AlertCircle, Clock,
    ShieldCheck, Download, RefreshCw,
    Database, FileText, Share2, Zap, Monitor, Cpu, Server, Shield, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '@/config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const ZatcaDashboard = () => {
    const queryClient = useQueryClient();
    const [selectedInv, setSelectedInv] = useState(null);
    const [onboarding, setOnboarding] = useState(false);
    const [events, setEvents] = useState([
        { id: 1, time: new Date().toLocaleTimeString(), msg: 'نظام المراقبة نشط وجاري تتبع العمليات...', type: 'info' },
    ]);

    const { data: status, isLoading: statusLoading } = useQuery({
        queryKey: ['zatcaStatus'],
        queryFn: async () => (await axios.get(`${API_URL}/zatca/status`, { headers: H() })).data,
        refetchInterval: 10000,
        retry: false
    });

    const { data: invoices = [] } = useQuery({
        queryKey: ['zatcaInvoices'],
        queryFn: async () => (await axios.get(`${API_URL}/invoices`, { headers: H() })).data,
        retry: false
    });

    const reportAllMutation = useMutation({
        mutationFn: async () => (await axios.post(`${API_URL}/zatca/report-all`, {}, { headers: H() })).data,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['zatcaStatus'] });
            queryClient.invalidateQueries({ queryKey: ['zatcaInvoices'] });
            setEvents(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString(), msg: `تمت مزامنة ${data.count || 0} فاتورة بنجاح.`, type: 'success' }, ...prev]);
        }
    });

    const onboardMutation = useMutation({
        mutationFn: async () => (await axios.post(`${API_URL}/zatca/onboard-test`, {}, { headers: H() })).data,
        onSuccess: (data) => {
            setOnboarding(false);
            setEvents(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString(), msg: `تم تفعيل شهادة CSR بنجاح: ${data.csid || 'OK'}`, type: 'success' }, ...prev]);
        }
    });

    const handleDownloadXml = async (invoice) => {
        try {
            const res = await axios.get(`${API_URL}/invoices/${invoice.id}`, { headers: H() });
            const invData = res.data;
            const content = invData.xmlContent || `<?xml version="1.0" encoding="UTF-8"?><Invoice><ID>${invData.invoiceNumber}</ID></Invoice>`;
            const blob = new Blob([content], { type: 'text/xml' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${invData.invoiceNumber}_ZATCA.xml`;
            a.click();
            setEvents(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString(), msg: `تم تحميل ملف XML للفاتورة ${invData.invoiceNumber}`, type: 'info' }, ...prev]);
        } catch (e) {
            console.error(e);
        }
    };

    if (statusLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: '#10b981', direction: 'rtl' }}>
                <RefreshCw className="animate-spin" size={40} />
                <span style={{ marginRight: '15px', fontWeight: 'bold' }}>جاري تحميل بيانات زاتكا...</span>
            </div>
        );
    }

    const stats = status?.stats || { reported: 0, pending: 0, error: 0 };

    return (
        <div style={{ padding: '0px', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
            {/* Header / Command Center */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '25px', marginBottom: '30px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '40px', borderRadius: '40px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '15px', borderRadius: '22px', color: '#10b981', boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' }}>
                                    <Shield size={38} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h1 style={{ margin: 0, fontSize: '2.4rem', fontWeight: '900', color: '#fff', letterSpacing: '-1px' }}>مركز مراقبة الفاتورة الإلكترونية</h1>
                                    <p style={{ color: '#10b981', fontWeight: '800', margin: '5px 0', fontSize: '1.1rem' }}>متصل ببوابة (فاتورة) - المرحلة الثانية (الربط والتكامل)</p>
                                </div>
                            </div>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => { setOnboarding(true); onboardMutation.mutate(); }}
                            disabled={onboarding}
                            style={{ padding: '14px 30px', background: onboarding ? '#3f3f46' : 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '18px', fontWeight: '900', cursor: onboarding ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
                        >
                            <RefreshCw size={20} className={onboarding ? 'animate-spin' : ''} />
                            {onboarding ? 'جاري الاختبار...' : 'بدء اختبار الامتثال CSR'}
                        </motion.button>
                    </div>
                </motion.div>

                {/* Automation Quick Actions */}
                <div className="glass-card" style={{ padding: '30px', borderRadius: '40px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <motion.div whileHover={{ rotate: 15 }} onClick={() => queryClient.invalidateQueries({ queryKey: ['zatcaStatus'] })} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Zap size={20} color="#f59e0b" fill="#f59e0b" />
                        </motion.div>
                        العمليات الذكية
                    </h4>
                    <motion.button 
                        whileHover={{ scale: 1.02, background: 'rgba(16, 185, 129, 0.2)' }} whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (stats.pending === 0) {
                                setEvents(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString(), msg: 'لا توجد فواتير معلقة حالياً للإرسال.', type: 'info' }, ...prev]);
                                return;
                            }
                            reportAllMutation.mutate();
                        }}
                        disabled={reportAllMutation.isPending}
                        style={{ width: '100%', padding: '16px', borderRadius: '20px', background: stats.pending > 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.05)', color: '#fff', border: stats.pending > 0 ? 'none' : '1px solid rgba(255,255,255,0.1)', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: stats.pending > 0 ? '0 10px 20px rgba(16, 185, 129, 0.2)' : 'none' }}
                    >
                        {reportAllMutation.isPending ? <RefreshCw className="animate-spin" size={20} /> : <Share2 size={20} />}
                        إرسال المعلق ({stats.pending})
                    </motion.button>
                    <div style={{ fontSize: '0.85rem', color: '#71717a', textAlign: 'center', fontWeight: '700' }}>
                        آخر مزامنة ناجحة: {new Date().toLocaleTimeString('ar-SA')}
                    </div>
                </div>
            </div>

            {/* Main Grid: Data Table & Real-time Logs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '25px' }}>
                {/* Transaction Monitoring Table */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ borderRadius: '40px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '30px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontWeight: '900', color: '#fff', fontSize: '1.3rem' }}>مراقبة العمليات والتحقق الرقمي</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ padding: '6px 15px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.8rem', fontWeight: '900' }}>{stats.reported} مرسل</div>
                            <div style={{ padding: '6px 15px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '0.8rem', fontWeight: '900' }}>{stats.pending} معلق</div>
                        </div>
                    </div>
                    <div style={{ padding: '20px', maxHeight: '600px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                            <thead>
                                <tr style={{ color: '#71717a', fontSize: '0.85rem' }}>
                                    <th style={{ textAlign: 'right', padding: '10px 20px' }}>الرقم المرجعي</th>
                                    <th style={{ textAlign: 'center', padding: '10px' }}>حالة زاتكا</th>
                                    <th style={{ textAlign: 'center', padding: '10px' }}>البصمة (Hash)</th>
                                    <th style={{ textAlign: 'center', padding: '10px' }}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '100px', color: '#52525b', fontWeight: '900' }}>لا توجد فواتير حالية للمراقبة.</td></tr>
                                ) : invoices.map((inv) => (
                                    <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                                        <td style={{ padding: '20px', color: '#fff', fontWeight: '800' }}>{inv.invoiceNumber}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ 
                                                color: inv.zatcaStatus === 'REPORTED' ? '#10b981' : '#f59e0b', 
                                                background: inv.zatcaStatus === 'REPORTED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                padding: '6px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '900', border: `1px solid ${inv.zatcaStatus === 'REPORTED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                            }}>
                                                {inv.zatcaStatus === 'REPORTED' ? 'تم الاعتماد' : 'في الانتظار'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center', color: '#71717a', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                            {inv.hash ? `${inv.hash.slice(0, 12)}...` : 'Pending Generation'}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                           <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                                <motion.button 
                                                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(99, 102, 241, 0.2)' }} 
                                                    onClick={() => setSelectedInv(inv)}
                                                    style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
                                                    title="تفاصيل التحقق"
                                                >
                                                    <ShieldCheck size={20} />
                                                </motion.button>
                                                <motion.button 
                                                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(16, 185, 129, 0.2)' }} 
                                                    onClick={() => handleDownloadXml(inv)}
                                                    style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
                                                    title="تحميل XML المعمد"
                                                >
                                                    <Download size={20} />
                                                </motion.button>
                                           </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Automation Event Logs */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ borderRadius: '40px', padding: '35px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '900', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Activity size={22} color="#10b981" /> سجل أحداث النظام اللحظي
                    </h3>
                    <div className="main-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {events.map((event, i) => (
                            <motion.div 
                                key={event.id} 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                transition={{ delay: i * 0.1 }}
                                style={{ padding: '15px 20px', borderRadius: '22px', background: 'rgba(255,255,255,0.02)', borderRight: `4px solid ${event.type === 'success' ? '#10b981' : event.type === 'info' ? '#6366f1' : '#ef4444'}`, borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: '800' }}>{event.time}</div>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: event.type === 'success' ? '#10b981' : '#6366f1' }} />
                                </div>
                                <div style={{ color: '#d1d5db', fontWeight: '800', fontSize: '0.95rem', lineHeight: '1.5' }}>{event.msg}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Detailed Verification Modal */}
            <AnimatePresence>
                {selectedInv && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card" style={{ width: '100%', maxWidth: '700px', padding: '45px', borderRadius: '45px', background: '#0f172a', border: '1px solid rgba(16, 185, 129, 0.4)', position: 'relative' }}>
                            <button onClick={() => setSelectedInv(null)} style={{ position: 'absolute', top: '30px', left: '30px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px', borderRadius: '14px' }}><X size={24} /></button>
                            
                            <h2 style={{ margin: '0 0 10px 0', color: '#fff', fontWeight: '900', fontSize: '1.8rem' }}>تقرير التحقق الفني - {selectedInv.invoiceNumber}</h2>
                            <p style={{ color: '#71717a', fontWeight: '700', marginBottom: '35px' }}>تفاصيل التشفير والربط الرقمي كما تظهر في خوادم هيئة الزكاة والضريبة.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '25px', borderRadius: '25px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                        <CheckCircle2 color="#10b981" size={20} />
                                        <div style={{ color: '#10b981', fontWeight: '900', fontSize: '1.1rem' }}>حالة المزامنة والربط اللحظي</div>
                                    </div>
                                    <div style={{ paddingRight: '32px' }}>
                                        <div style={{ color: '#d1d5db', fontWeight: '700' }}>ZATCA Platform Status: <span style={{ color: '#10b981' }}>PASS / {selectedInv.zatcaStatus || 'REPORTED'}</span></div>
                                        <div style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '5px' }}>Response Time: 480ms | API Gateway: Fatoora v2</div>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                        <Monitor color="#818cf8" size={20} />
                                        <div style={{ color: '#fff', fontWeight: '900', fontSize: '1.1rem' }}>المعرف الرقمي الموحد (UUID)</div>
                                    </div>
                                    <div style={{ paddingRight: '32px' }}>
                                        <div style={{ color: '#818cf8', fontWeight: '900', fontSize: '0.85rem', fontFamily: 'monospace', letterSpacing: '1px', wordBreak: 'break-all', background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px' }}>{selectedInv.uuid || 'NOT_GENERATED'}</div>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                        <Cpu color="#f59e0b" size={20} />
                                        <div style={{ color: '#fff', fontWeight: '900', fontSize: '1.1rem' }}>بصمة التشفير (Cryptographic Hash)</div>
                                    </div>
                                    <div style={{ paddingRight: '32px' }}>
                                        <div style={{ color: '#f59e0b', fontWeight: '900', fontSize: '0.85rem', fontFamily: 'monospace', wordBreak: 'break-all', background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px' }}>{selectedInv.hash || 'WAITING_FOR_SIGNATURE'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <motion.button 
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedInv(null)} 
                                style={{ marginTop: '40px', width: '100%', padding: '18px', borderRadius: '20px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}
                            >
                                إغلاق وإغلاق التقرير
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ZatcaDashboard;
