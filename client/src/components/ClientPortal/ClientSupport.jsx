import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, Plus, Send, Clock, CheckCircle, 
    AlertCircle, ChevronLeft, Paperclip, MessageCircle,
    User, ShieldCheck, Search, Filter, HelpCircle,
    SendHorizontal, X, ArrowLeft, LayoutGrid, Info
} from 'lucide-react';
import API_URL from '@/config';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

const ClientSupport = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNewTicketModal, setShowNewTicketModal] = useState(false);
    const [projects, setProjects] = useState([]);

    // Form states
    const [newTicket, setNewTicket] = useState({ subject: '', description: '', category: 'GENERAL', projectId: '', priority: 'MEDIUM' });
    const [reply, setReply] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    useEffect(() => {
        fetchTickets();
        fetchProjects();
    }, []);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/client-portal/support-tickets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/client-portal/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(res.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchTicketDetails = async (ticketId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/client-portal/support-tickets/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedTicket(res.data);
        } catch (error) {
            console.error('Error fetching ticket details:', error);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/client-portal/support-tickets`, newTicket, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowNewTicketModal(false);
            setNewTicket({ subject: '', description: '', category: 'GENERAL', projectId: '', priority: 'MEDIUM' });
            fetchTickets();
        } catch (error) {
            alert('❌ فشل إنشاء التذكرة');
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;
        setSendingReply(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/client-portal/support-tickets/${selectedTicket.id}/messages`, { message: reply }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedTicket(prev => ({
                ...prev,
                messages: [...prev.messages, res.data]
            }));
            setReply('');
        } catch (error) {
            alert('❌ فشل إرسال الرد');
        } finally {
            setSendingReply(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'OPEN': return { bg: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', label: 'نشطة' };
            case 'IN_PROGRESS': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', label: 'قيد المعالجة' };
            case 'RESOLVED': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'تم الانتهاء' };
            case 'CLOSED': return { bg: 'rgba(255, 255, 255, 0.05)', color: '#71717a', label: 'مغلقة' };
            default: return { bg: 'rgba(255, 255, 255, 0.05)', color: '#71717a', label: status };
        }
    };

    if (loading) return (
        <div style={{ padding: '80px', textAlign: 'center', color: '#71717a' }}>
            <HelpCircle className="animate-spin" size={48} style={{ margin: '0 auto 20px', color: '#6366f1' }} />
            <h3 style={{ color: '#fff', fontWeight: '800' }}>جاري فتح قنوات التواصل...</h3>
        </div>
    );

    if (selectedTicket) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <motion.button 
                        whileHover={{ x: -5 }}
                        onClick={() => setSelectedTicket(null)} 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: '900', fontSize: '1rem', fontFamily: 'Cairo' }}
                    >
                        <ArrowLeft size={20} /> العودة لسجل الطلبات
                    </motion.button>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <span className="status-pill" style={{ background: getStatusStyle(selectedTicket.status).bg, color: getStatusStyle(selectedTicket.status).color, padding: '6px 15px', borderRadius: '30px', fontWeight: '900', fontSize: '0.75rem' }}>
                            {getStatusStyle(selectedTicket.status).label}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', height: '700px' }}>
                    {/* Chat Interface */}
                    <div className="glass-card" style={{ borderRadius: '32px', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ padding: '25px 35px', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: '800', marginBottom: '4px' }}>تذكرة رقم: {selectedTicket.ticketNo}</div>
                            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#fff' }}>{selectedTicket.subject}</h3>
                        </div>

                        <div style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(9, 9, 11, 0.4)' }}>
                            {selectedTicket.messages.map((msg, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ alignSelf: msg.senderType === 'CLIENT' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.senderType === 'CLIENT' ? 'flex-end' : 'flex-start' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#52525b', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {msg.senderType !== 'CLIENT' && <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', fontSize: '0.65rem' }}>فريق الدعم</span>}
                                            {msg.senderName} • {new Date(msg.createdAt).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                        </div>
                                        <div style={{ 
                                            padding: '16px 20px', 
                                            borderRadius: msg.senderType === 'CLIENT' ? '24px 4px 24px 24px' : '4px 24px 24px 24px', 
                                            background: msg.senderType === 'CLIENT' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255,255,255,0.03)', 
                                            color: '#fff', 
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
                                            whiteSpace: 'pre-wrap',
                                            fontSize: '0.95rem',
                                            fontWeight: '600',
                                            lineHeight: '1.6',
                                            border: msg.senderType === 'CLIENT' ? 'none' : '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            {msg.message}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {selectedTicket.status !== 'CLOSED' && (
                            <form onSubmit={handleSendReply} style={{ padding: '25px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <input 
                                        placeholder="اكتب رسالتك وتفاصيل استفسارك هنا..." 
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        className="premium-input"
                                        style={{ flex: 1, height: '60px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                                    />
                                    <motion.button 
                                        {...buttonClick}
                                        disabled={sendingReply} 
                                        type="submit" 
                                        style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <SendHorizontal size={24} />
                                    </motion.button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Metadata Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="glass-card" style={{ padding: '30px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ margin: '0 0 25px 0', color: '#fff', fontSize: '1.1rem', fontWeight: '900', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>معلومات الطلب</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: '800', marginBottom: '5px' }}>تصنيف المشكلة</div>
                                    <div style={{ color: '#fff', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />
                                        {selectedTicket.category === 'TECHNICAL' ? 'دعم تقني وميداني' : selectedTicket.category === 'FINANCIAL' ? 'استفسارات مالية' : 'عام / أخرى'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: '800', marginBottom: '5px' }}>المشروع المرتبط</div>
                                    <div style={{ color: '#fff', fontWeight: '900' }}>{selectedTicket.project?.name || 'استفسار عام'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: '800', marginBottom: '5px' }}>تاريخ البدء</div>
                                    <div style={{ color: '#fff', fontWeight: '900' }}>{new Date(selectedTicket.createdAt).toLocaleDateString('ar-SA')}</div>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '25px', borderRadius: '24px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                             <div style={{ color: '#818cf8', fontWeight: '900', fontSize: '0.9rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><Info size={16} /> ملاحظات الدعم</div>
                             <p style={{ margin: 0, fontSize: '0.85rem', color: '#a1a1aa', lineHeight: '1.6', fontWeight: '600' }}>
                                سيقوم فريق العمل بمراجعة طلبك والرد عليه خلال 24 ساعة عمل كحد أقصى. شكراً لثقتك بنا.
                             </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '900', color: '#fff' }} className="gradient-text">مركز الدعم والتراسل</h2>
                    <p style={{ margin: '5px 0 0 0', fontSize: '1rem', color: '#a1a1aa', fontWeight: '600' }}>نحن هنا للمساعدة. تواصل معنا بخصوص أي استفسارات أو ملاحظات ميدانية.</p>
                </div>
                <motion.button 
                    {...buttonClick}
                    onClick={() => setShowNewTicketModal(true)}
                    style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '900', fontFamily: 'Cairo' }}
                >
                    <Plus size={20} /> فتح تذكرة جديدة
                </motion.button>
            </div>

            {tickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '2px dashed rgba(255,255,255,0.05)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', color: '#52525b' }}>
                         <MessageCircle size={40} />
                    </div>
                    <h3 style={{ color: '#fff', fontWeight: '900', fontSize: '1.4rem' }}>لا توجد تذاكر دعم مفتوحة</h3>
                    <p style={{ color: '#71717a', fontSize: '1rem', maxWidth: '500px', margin: '10px auto', fontWeight: '600' }}>إذا واجهتك أي مشكلة أو كان لديك استفسار هندسي، قم بفتح تذكرة دعم وسنتواصل معك فوراً.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                    {tickets.map((ticket, idx) => (
                        <motion.div 
                            key={ticket.id} 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => fetchTicketDetails(ticket.id)}
                            className="glass-card"
                            style={{ padding: '30px', cursor: 'pointer', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: '800' }}>{ticket.ticketNo}</span>
                                <span className="status-pill" style={{ padding: '5px 12px', borderRadius: '30px', fontSize: '0.7rem', fontWeight: '900', background: getStatusStyle(ticket.status).bg, color: getStatusStyle(ticket.status).color }}>
                                    {getStatusStyle(ticket.status).label}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff', marginBottom: '10px' }}>{ticket.subject}</h3>
                            <div style={{ fontSize: '0.85rem', color: '#71717a', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                                <Clock size={14} /> التحديث الأخير: {new Date(ticket.updatedAt).toLocaleDateString('ar-SA')}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '20px' }}>
                                <div style={{ color: '#818cf8', fontWeight: '900', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    متابعة الطلب <ChevronLeft size={16} />
                                </div>
                                {ticket.project && <div style={{ fontSize: '0.75rem', color: '#52525b', fontWeight: '800' }}>{ticket.project.name}</div>}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* New Ticket Modal */}
            <AnimatePresence>
                {showNewTicketModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-card" style={{ width: '100%', maxWidth: '650px', borderRadius: '35px', padding: '45px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', color: '#fff' }}>بدء طلب دعم جديد</h3>
                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowNewTicketModal(false)} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', width: '45px', height: '45px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}><X size={24} /></motion.button>
                            </div>

                            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '800' }}>عنوان الطلب (مختصر)</label>
                                    <input required type="text" value={newTicket.subject} onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})} className="premium-input" placeholder="مثلاً: تأخر توريد المواد، استفسار عن دفعة..." style={{ width: '100%' }} />
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '800' }}>تصنيف الموضوع</label>
                                        <select value={newTicket.category} onChange={(e) => setNewTicket({...newTicket, category: e.target.value})} className="premium-input" style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff' }}>
                                            <option value="GENERAL">استفسار عام</option>
                                            <option value="TECHNICAL">دعم تقني / إنشائي</option>
                                            <option value="FINANCIAL">ماليات وحسابات</option>
                                            <option value="PROGRESS">متابعة إنجاز ميداني</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '800' }}>المشروع المرتبط</label>
                                        <select value={newTicket.projectId} onChange={(e) => setNewTicket({...newTicket, projectId: e.target.value})} className="premium-input" style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff' }}>
                                            <option value="">طلب عام للمنصة</option>
                                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '800' }}>تفاصيل الاستفسار (بالتفصيل)</label>
                                    <textarea required rows={5} value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} className="premium-input" style={{ width: '100%', resize: 'none', height: '150px' }} placeholder="اكتب كل ما نحتاجه لمساعدتك بشكل فعال..." />
                                </div>

                                <motion.button {...buttonClick} type="submit" style={{ padding: '18px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px', fontFamily: 'Cairo' }}>
                                    إرسال الطلب الآن للدعم الفني
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClientSupport;
