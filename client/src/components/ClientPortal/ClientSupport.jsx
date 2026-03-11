import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Send, Clock, CheckCircle, AlertCircle, ChevronLeft, Paperclip, MessageCircle } from 'lucide-react';
import API_URL from '@/config';

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
            alert('✅ تم فتح التذكرة بنجاح. سنقوم بالرد عليك قريباً.');
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
            case 'OPEN': return { bg: '#eff6ff', color: '#2563eb', label: 'مفتوحة' };
            case 'IN_PROGRESS': return { bg: '#fff7ed', color: '#f59e0b', label: 'قيد المراجعة' };
            case 'RESOLVED': return { bg: '#ecfdf5', color: '#10b981', label: 'تم الحل' };
            case 'CLOSED': return { bg: '#f8fafc', color: '#64748b', label: 'مغلقة' };
            default: return { bg: '#f1f5f9', color: '#475569', label: status };
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>جاري تحميل التذاكر...</div>;

    if (selectedTicket) {
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <button onClick={() => setSelectedTicket(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>
                    <ChevronLeft size={20} /> العودة لجميع التذاكر
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px' }}>
                    {/* Message Thread */}
                    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '600px' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{selectedTicket.subject}</h3>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>تذكرة رقم: {selectedTicket.ticketNo}</div>
                        </div>

                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
                            {selectedTicket.messages.map((msg) => (
                                <div key={msg.id} style={{ alignSelf: msg.senderType === 'CLIENT' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', textAlign: msg.senderType === 'CLIENT' ? 'left' : 'right' }}>
                                        {msg.senderName} • {new Date(msg.createdAt).toLocaleString('ar-SA')}
                                    </div>
                                    <div style={{ padding: '12px 16px', borderRadius: '14px', background: msg.senderType === 'CLIENT' ? '#2563eb' : '#fff', color: msg.senderType === 'CLIENT' ? '#fff' : '#1e293b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', whiteSpace: 'pre-wrap' }}>
                                        {msg.message}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedTicket.status !== 'CLOSED' && (
                            <form onSubmit={handleSendReply} style={{ padding: '20px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <textarea 
                                        placeholder="اكتب ردك هنا..." 
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'Cairo', resize: 'none', height: '50px' }}
                                    />
                                    <button disabled={sendingReply} type="submit" style={{ width: '50px', height: '50px', borderRadius: '10px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Send size={24} />
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Ticket Info Sidebar */}
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
                        <h4 style={{ margin: '0 0 20px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>تفاصيل التذكرة</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>الحالة</label>
                                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, background: getStatusStyle(selectedTicket.status).bg, color: getStatusStyle(selectedTicket.status).color }}>
                                    {getStatusStyle(selectedTicket.status).label}
                                </span>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>التصنيف</label>
                                <strong>{selectedTicket.category === 'TECHNICAL' ? 'تقني/ميداني' : selectedTicket.category === 'FINANCIAL' ? 'مالي' : 'عام'}</strong>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>المشروع</label>
                                <strong>{selectedTicket.project?.name || 'مستند عام'}</strong>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>تاريخ الفتح</label>
                                <strong>{new Date(selectedTicket.createdAt).toLocaleDateString('ar-SA')}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>الدعم الفني والرسائل</h2>
                <button 
                    onClick={() => setShowNewTicketModal(true)}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    <Plus size={20} /> فتح تذكرة جديدة
                </button>
            </div>

            {tickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
                    <MessageCircle size={56} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <h3 style={{ fontSize: '1.2rem', color: '#64748b' }}>لا توجد تذاكر دعم حالية</h3>
                    <p style={{ color: '#94a3b8' }}>إذا كان لديك أي استفسار أو مشكلة، يمكنك فتح تذكرة دعم وسنقوم بالرد عليك.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {tickets.map((ticket) => (
                        <div 
                            key={ticket.id} 
                            onClick={() => fetchTicketDetails(ticket.id)}
                            style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{ticket.ticketNo}</span>
                                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: getStatusStyle(ticket.status).bg, color: getStatusStyle(ticket.status).color }}>
                                    {getStatusStyle(ticket.status).label}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>{ticket.subject}</h3>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={14} /> آخر تحديث: {new Date(ticket.updatedAt).toLocaleDateString('ar-SA')}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#2563eb' }}>
                                    <MessageSquare size={16} /> متابعة المحادثة ←
                                </span>
                                {ticket.project && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{ticket.project.name}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New Ticket Modal */}
            <AnimatePresence>
                {showNewTicketModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: '#fff', width: '100%', maxWidth: '600px', borderRadius: '20px', padding: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>فتح تذكرة دعم جديدة</h3>
                                <button onClick={() => setShowNewTicketModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Plus style={{ transform: 'rotate(45deg)' }} size={24} color="#64748b" /></button>
                            </div>

                            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>الموضوع</label>
                                    <input required type="text" value={newTicket.subject} onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>التصنيف</label>
                                        <select value={newTicket.category} onChange={(e) => setNewTicket({...newTicket, category: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}>
                                            <option value="GENERAL">استفسار عام</option>
                                            <option value="TECHNICAL">تقني / ميداني</option>
                                            <option value="FINANCIAL">مالي / فواتير</option>
                                            <option value="PROGRESS">متابعة إنجاز</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>الارتباط بمشروع</label>
                                        <select value={newTicket.projectId} onChange={(e) => setNewTicket({...newTicket, projectId: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}>
                                            <option value="">عام (بدون مشروع)</option>
                                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>الوصف التفصيلي للمشكلة أو الطلب</label>
                                    <textarea required rows={4} value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }} />
                                </div>

                                <button type="submit" style={{ padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }}>
                                    إرسال الطلب الآن
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClientSupport;
