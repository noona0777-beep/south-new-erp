import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_URL from '@/config';
import { 
    MessageSquare, CheckCircle, Clock, Send, User, 
    Shield, AlertCircle, Search, Filter, MoreVertical, 
    RefreshCw, XCircle, ChevronLeft, Phone, UserCheck,
    MessageCircle, Calendar, Hash, Zap, Inbox,
    CheckCircle2, AlertTriangle, FileText, SendHorizontal
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const AdminSupportPage = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL');

    // Fetch all tickets
    const { data: tickets = [], isLoading, refetch } = useQuery({
        queryKey: ['admin-tickets'],
        queryFn: async () => (await axios.get(`${API_URL}/support`, { headers: H() })).data
    });

    const selectedTicket = useMemo(() => tickets.find(t => t.id === selectedTicketId), [tickets, selectedTicketId]);

    // Statistics
    const stats = useMemo(() => ({
        total: tickets.length,
        open: tickets.filter(t => t.status === 'OPEN').length,
        pending: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    }), [tickets]);

    // Mutation to reply to ticket
    const replyMutation = useMutation({
        mutationFn: async ({ ticketId, text }) => {
            const res = await axios.post(`${API_URL}/support/${ticketId}/reply`, { message: text }, { headers: H() });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
            showToast('✅ تم إرسال الرد وإشعار العميل عبر الواتساب', 'success');
            setReplyText('');
        },
        onError: () => showToast('❌ فشل في إرسال الرد', 'error')
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            await axios.put(`${API_URL}/support/${id}/status`, { status }, { headers: H() });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
            showToast('✅ تم تحديث حالة التذكرة', 'success');
        }
    });

    const handleReply = () => {
        if (!replyText.trim()) return;
        replyMutation.mutate({ ticketId: selectedTicketId, text: replyText });
    };

    const quickReplies = [
        "مرحباً بك، تم استلام طلبك وجاري المراجعة من قبل القسم المختص. سأفيدك بالتحديث قريباً.",
        "تمت معالجة طلبك بنجاح. يرجى المراجعة والإفادة في حال وجود أي استفسار آخر.",
        "نعتذر عن التأخير، واجهنا ضغاً في العمليات الميدانية وجاري تنفيذ طلبك الآن.",
        "يرجى تزويدنا بمزيد من التفاصيل أو الصور ليتسنى لنا خدمتك بشكل أفضل."
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'OPEN': return { color: '#ef4444', label: 'تذكرة جديدة', bg: 'rgba(239, 68, 68, 0.1)' };
            case 'IN_PROGRESS': return { color: '#f59e0b', label: 'قيد المتابعة', bg: 'rgba(245, 158, 11, 0.1)' };
            case 'RESOLVED': return { color: '#10b981', label: 'تم الحل', bg: 'rgba(16, 185, 129, 0.1)' };
            default: return { color: '#71717a', label: status, bg: 'rgba(113, 113, 122, 0.1)' };
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || t.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'ALL' || t.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div style={{ direction: 'rtl', height: '100%', display: 'flex', flexDirection: 'column', gap: '30px', padding: '10px' }}>
            {/* Header & Stats Display */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="gradient-text" style={{ fontSize: '2.8rem', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>الإدارة الذكية للدعم</h2>
                    <p style={{ color: '#a1a1aa', fontWeight: '700', marginTop: '8px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Shield size={18} color="#6366f1" /> ضمان استمرارية الخدمة وموثوقية الردود للعملاء.
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    {[
                        { label: 'الكل', val: 'ALL', count: stats.total, color: 'rgba(99,102,241,0.5)', icon: <Inbox size={18} /> },
                        { label: 'مفتوحة', val: 'OPEN', count: stats.open, color: '#ef4444', icon: <AlertCircle size={18} /> },
                        { label: 'قيد المراجعة', val: 'IN_PROGRESS', count: stats.pending, color: '#f59e0b', icon: <Clock size={18} /> },
                        { label: 'مكتملة', val: 'RESOLVED', count: stats.resolved, color: '#10b981', icon: <CheckCircle2 size={18} /> }
                    ].map(f => (
                        <motion.button 
                            key={f.val}
                            whileHover={{ scale: 1.05, y: -2 }}
                            onClick={() => setActiveFilter(f.val)}
                            className="glass-card"
                            style={{ 
                                background: activeFilter === f.val ? (f.val === 'ALL' ? '#6366f1' : f.color) : 'rgba(15, 23, 42, 0.4)',
                                color: activeFilter === f.val ? '#fff' : '#71717a',
                                border: `1px solid ${activeFilter === f.val ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                                padding: '15px 25px', borderRadius: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '900',
                                boxShadow: activeFilter === f.val ? `0 10px 30px ${f.color}20` : 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {f.icon} {f.label} <span style={{ opacity: 0.6, fontSize: '0.85rem', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '8px' }}>{f.count}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '35px', flex: 1, overflow: 'hidden' }}>
                {/* Left: Enhanced Ticket List */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', borderRadius: '40px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.4)' }}>
                    <div style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={22} style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1', opacity: 0.5 }} />
                            <input 
                                className="premium-input" 
                                placeholder="ابحث برقم التذكرة، العميل، أو العنوان..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', paddingRight: '55px', height: '60px', borderRadius: '18px', fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="main-scroll">
                        <AnimatePresence>
                            {isLoading ? (
                                <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                                    <RefreshCw className="animate-spin" size={45} color="#6366f1" style={{ marginBottom: '20px' }} />
                                    <p style={{ color: '#71717a', fontWeight: '800' }}>جاري استعادة المحادثات النشطة...</p>
                                </div>
                            ) : filteredTickets.length === 0 ? (
                                <div style={{ padding: '80px 20px', textAlign: 'center', color: '#52525b', fontWeight: '800' }}>
                                    <FileText size={48} style={{ margin: '0 auto 15px', opacity: 0.2 }} />
                                    <p>لم يتم العثور على تذاكر تطابق معايير البحث.</p>
                                </div>
                            ) : filteredTickets.map((t, idx) => {
                                const isUrgent = t.status === 'OPEN' && (new Date() - new Date(t.createdAt) > 86400000); // More than 24h
                                return (
                                    <motion.div
                                        key={t.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => setSelectedTicketId(t.id)}
                                        whileHover={{ scale: 1.02, x: -8 }}
                                        style={{ 
                                            padding: '25px', borderRadius: '28px', marginBottom: '20px', cursor: 'pointer',
                                            background: selectedTicketId === t.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${selectedTicketId === t.id ? '#6366f188' : 'rgba(255,255,255,0.06)'}`,
                                            boxShadow: selectedTicketId === t.id ? '0 15px 40px rgba(0,0,0,0.3)' : 'none',
                                            position: 'relative', overflow: 'hidden'
                                        }}
                                    >
                                        {isUrgent && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#ef4444' }} />}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: '900', background: 'rgba(99,102,241,0.1)', padding: '4px 12px', borderRadius: '10px' }}>{t.ticketNo || `#${t.id}`}</span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {isUrgent && <span style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem' }}><AlertTriangle size={12} style={{ display: 'inline', marginLeft: '4px' }} /> هام جداً</span>}
                                                <span style={{ fontSize: '0.75rem', color: getStatusStyle(t.status).color, background: getStatusStyle(t.status).bg, padding: '4px 12px', borderRadius: '10px', fontWeight: '900' }}>{getStatusStyle(t.status).label}</span>
                                            </div>
                                        </div>
                                        <h4 style={{ margin: '0 0 15px 0', color: '#fff', fontSize: '1.2rem', fontWeight: '800', lineHeight: '1.5' }}>{t.subject}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '700' }}>
                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><User size={16} /></div>
                                                {t.client?.name}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: '#52525b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Calendar size={12} /> {new Date(t.createdAt).toLocaleDateString('ar-SA')}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Conversation View (Enhanced Window) */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', borderRadius: '40px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.4)' }}>
                    {selectedTicket ? (
                        <>
                            {/* Window Header */}
                            <div style={{ padding: '35px 50px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>{selectedTicket.subject}</h3>
                                        <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: '#71717a', fontSize: '0.85rem', fontWeight: '900' }}>{selectedTicket.ticketNo}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '25px', marginTop: '15px', color: '#a1a1aa', fontSize: '1rem', fontWeight: '700' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UserCheck size={20} color="#10b981" /> {selectedTicket.client?.name}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={20} color="#6366f1" /> <span dir="ltr">{selectedTicket.client?.phone}</span></span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Inbox size={20} color="#f59e0b" /> {selectedTicket.category === 'TECHNICAL' ? 'دعم ميداني' : 'عام'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    {selectedTicket.status !== 'RESOLVED' && (
                                        <motion.button 
                                            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(16,185,129,0.2)' }} 
                                            onClick={() => statusMutation.mutate({ id: selectedTicket.id, status: 'RESOLVED' })}
                                            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '12px 35px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                        >
                                            <CheckCircle2 size={22} /> إغلاق وحل الطلب
                                        </motion.button>
                                    )}
                                    <button className="glass-card" style={{ border: 'none', width: '55px', height: '55px', borderRadius: '18px', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MoreVertical size={24} /></button>
                                </div>
                            </div>

                            {/* Chat History */}
                            <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '25px', background: 'rgba(0,0,0,0.2)' }} className="main-scroll">
                                {/* Original Request */}
                                <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '30px', borderTopRightRadius: 0, border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <div style={{ fontWeight: '900', color: '#6366f1', marginBottom: '10px', fontSize: '0.85rem' }}>الطلب الأساسي من العميل:</div>
                                        <p style={{ margin: 0, color: '#e4e4e7', fontSize: '1.05rem', lineHeight: '1.7', fontWeight: '600' }}>{selectedTicket.description}</p>
                                    </div>
                                    <div style={{ marginTop: '5px', fontSize: '0.75rem', color: '#52525b', fontWeight: '800' }}>{new Date(selectedTicket.createdAt).toLocaleString('ar-SA')}</div>
                                </div>

                                {selectedTicket.messages?.map((msg, i) => {
                                    const isAdmin = msg.senderType === 'ADMIN';
                                    return (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} style={{ alignSelf: isAdmin ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                            <div style={{ 
                                                padding: '20px 25px', borderRadius: '30px', 
                                                borderTopLeftRadius: isAdmin ? 0 : '30px', borderTopRightRadius: isAdmin ? '30px' : 0,
                                                background: isAdmin ? 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)' : 'rgba(255,255,255,0.02)',
                                                border: isAdmin ? 'none' : '1px solid rgba(255,255,255,0.04)',
                                                color: '#fff', fontSize: '1.05rem', lineHeight: '1.7', fontWeight: '600',
                                                boxShadow: isAdmin ? '0 10px 25px rgba(67, 56, 202, 0.2)' : 'none'
                                            }}>
                                                {msg.message}
                                            </div>
                                            <div style={{ marginTop: '5px', fontSize: '0.75rem', color: '#52525b', textAlign: isAdmin ? 'left' : 'right', fontWeight: '800' }}>{new Date(msg.createdAt).toLocaleTimeString('ar-SA')}</div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Automation & Input Area */}
                            <div style={{ padding: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                                {/* Quick Replies Automation */}
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                                    {quickReplies.map((qr, i) => (
                                        <motion.button 
                                            key={i} whileHover={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}
                                            onClick={() => setReplyText(qr)}
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 18px', borderRadius: '12px', color: '#a1a1aa', fontSize: '0.8rem', whiteSpace: 'nowrap', cursor: 'pointer', fontWeight: '700' }}
                                        >
                                            <Zap size={14} style={{ marginLeft: '5px', display: 'inline' }} /> {qr.substring(0, 20)}...
                                        </motion.button>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <textarea 
                                        className="premium-input" 
                                        placeholder="اكتب ردك هنا.. سيتم إشعار العميل فوراً عبر واتساب 🚀" 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        style={{ flex: 1, minHeight: '80px', maxHeight: '150px', padding: '20px', fontSize: '1.1rem', background: 'rgba(0,0,0,0.2)' }}
                                    />
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }} 
                                        onClick={handleReply}
                                        disabled={!replyText.trim() || replyMutation.isPending}
                                        style={{ 
                                            background: '#6366f1', color: '#fff', border: 'none', width: '100px', borderRadius: '25px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: !replyText.trim() ? 0.3 : 1
                                        }}
                                    >
                                        {replyMutation.isPending ? <RefreshCw className="animate-spin" /> : <SendHorizontal size={30} />}
                                    </motion.button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                            <div style={{ padding: '40px', borderRadius: '50%', background: 'rgba(99,102,241,0.05)', marginBottom: '30px' }}><MessageSquare size={120} color="#6366f1" /></div>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>بانتظار اختيار المحادثة</h3>
                            <p style={{ fontWeight: '700', color: '#a1a1aa' }}>قم باختيار تذكرة من القائمة الجانبية لبدء الدعم والرد الذكي.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSupportPage;
