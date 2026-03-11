import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_URL from '@/config';
import { MessageSquare, CheckCircle, Clock, Send, User, Shield, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminSupportPage = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [replyText, setReplyText] = useState('');

    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    // Fetch all tickets
    const { data: tickets = [], isLoading } = useQuery({
        queryKey: ['admin-tickets'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/support`);
            return res.data;
        }
    });

    const selectedTicket = tickets.find(t => t.id === selectedTicketId);

    // Mutation to reply to ticket
    const replyMutation = useMutation({
        mutationFn: async ({ ticketId, text }) => {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API_URL}/support/${ticketId}/reply`,
                { message: text, status: 'IN_PROGRESS' }, // Mark in progress when replying
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
            showToast('تم إرسال الرد بنجاح وإشعار العميل عبر الواتساب', 'success');
            setReplyText('');
        },
        onError: (error) => {
            showToast('خطأ في إرسال الرد', 'error');
            console.error(error);
        }
    });

    const handleReply = () => {
        if (!replyText.trim()) return;
        replyMutation.mutate({ ticketId: selectedTicketId, text: replyText });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return '#ef4444'; // Red
            case 'IN_PROGRESS': return '#f59e0b'; // Orange
            case 'RESOLVED': return '#10b981'; // Green
            case 'CLOSED': return '#64748b'; // Gray
            default: return '#64748b';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'OPEN': return 'مفتوحة';
            case 'IN_PROGRESS': return 'قيد المعالجة';
            case 'RESOLVED': return 'تم الحل';
            case 'CLOSED': return 'مغلقة';
            default: return status;
        }
    };

    return (
        <div className="fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 5px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MessageSquare size={28} color="#2563eb" />
                    إدارة الدعم الفني وتذاكر العملاء
                </h2>
                <p style={{ margin: 0, color: '#64748b' }}>عرض والرد على طلبات واستفسارات العملاء</p>
            </div>

            <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
                {/* Tickets List (Sidebar) */}
                <div style={{ width: '350px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 'bold', color: '#334155' }}>
                        التذاكر النشطة ({tickets.length})
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                        {isLoading ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>جاري التحميل...</div>
                        ) : tickets.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>لا توجد تذاكر حالياً</div>
                        ) : (
                            tickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    onClick={() => setSelectedTicketId(ticket.id)}
                                    style={{
                                        padding: '15px',
                                        marginBottom: '10px',
                                        borderRadius: '12px',
                                        background: selectedTicketId === ticket.id ? '#eff6ff' : 'white',
                                        border: `1px solid ${selectedTicketId === ticket.id ? '#bfdbfe' : '#e2e8f0'}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: selectedTicketId === ticket.id ? '0 2px 4px rgba(37,99,235,0.1)' : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '0.95rem' }}>#{ticket.id} {ticket.subject}</span>
                                        <span style={{ 
                                            background: `${getStatusColor(ticket.status)}20`, 
                                            color: getStatusColor(ticket.status), 
                                            padding: '2px 8px', 
                                            borderRadius: '12px', 
                                            fontSize: '0.75rem', 
                                            fontWeight: 'bold' 
                                        }}>
                                            {getStatusText(ticket.status)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <User size={14} /> {ticket.client?.name || 'عميل غير معروف'}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Clock size={14} /> {new Date(ticket.createdAt).toLocaleDateString('ar-SA')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Ticket Details & Chat Area */}
                <div style={{ flex: 1, background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    {selectedTicket ? (
                        <>
                            {/* Header */}
                            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{selectedTicket.subject}</h3>
                                    <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '0.9rem' }}>
                                        <span>العميل: {selectedTicket.client?.name}</span>
                                        <span>•</span>
                                        <span>تاريخ الإنشاء: {new Date(selectedTicket.createdAt).toLocaleString('ar-SA')}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                                        <CheckCircle size={16} /> إغلاق التذكرة
                                    </button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#fcfcfc', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {/* Original Ticket Message */}
                                <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                        <div style={{ background: '#e2e8f0', padding: '5px', borderRadius: '50%' }}><User size={16} color="#64748b" /></div>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>{selectedTicket.client?.name}</span>
                                    </div>
                                    <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '12px', borderTopRightRadius: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#334155', lineHeight: '1.6' }}>
                                        {selectedTicket.description}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '5px', textAlign: 'right' }}>
                                        {new Date(selectedTicket.createdAt).toLocaleTimeString('ar-SA')}
                                    </div>
                                </div>

                                {/* Replies */}
                                {selectedTicket.messages && selectedTicket.messages.map(msg => {
                                    const isAdmin = msg.senderType === 'ADMIN' || msg.senderType === 'EMPLOYEE';
                                    return (
                                        <div key={msg.id} style={{ alignSelf: isAdmin ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexDirection: isAdmin ? 'row-reverse' : 'row' }}>
                                                <div style={{ background: isAdmin ? '#dbeafe' : '#e2e8f0', padding: '5px', borderRadius: '50%' }}>
                                                    {isAdmin ? <Shield size={16} color="#2563eb" /> : <User size={16} color="#64748b" />}
                                                </div>
                                                <span style={{ fontSize: '0.85rem', color: isAdmin ? '#2563eb' : '#64748b', fontWeight: 'bold' }}>
                                                    {isAdmin ? 'الدعم الفني (الإدارة)' : selectedTicket.client?.name}
                                                </span>
                                            </div>
                                            <div style={{ 
                                                background: isAdmin ? '#2563eb' : 'white', 
                                                color: isAdmin ? 'white' : '#334155',
                                                border: isAdmin ? 'none' : '1px solid #e2e8f0', 
                                                padding: '15px', 
                                                borderRadius: '12px', 
                                                borderTopLeftRadius: isAdmin ? 0 : '12px',
                                                borderTopRightRadius: isAdmin ? '12px' : 0,
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', 
                                                lineHeight: '1.6' 
                                            }}>
                                                {msg.message}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '5px', textAlign: isAdmin ? 'left' : 'right' }}>
                                                {new Date(msg.createdAt).toLocaleTimeString('ar-SA')}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Reply Input */}
                            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', background: 'white', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="اكتب ردك للعميل هنا... (سيتم إرسال إشعار واتساب للعميل تلقائياً)"
                                        style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', resize: 'none', minHeight: '80px', fontFamily: 'Cairo' }}
                                    />
                                    <button 
                                        onClick={handleReply}
                                        disabled={!replyText.trim() || replyMutation.isPending}
                                        style={{ 
                                            background: !replyText.trim() ? '#94a3b8' : '#2563eb', 
                                            color: 'white', 
                                            border: 'none', 
                                            padding: '0 25px', 
                                            borderRadius: '12px', 
                                            cursor: !replyText.trim() ? 'not-allowed' : 'pointer', 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            gap: '8px',
                                            fontWeight: 'bold',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <Send size={24} />
                                        {replyMutation.isPending ? 'جاري...' : 'إرسال'}
                                    </button>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <AlertCircle size={14} /> بمجرد الإرسال، سيتلقى العميل إشعاراً على الواتساب بوجود تحديث على تذكرته.
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <MessageSquare size={64} style={{ opacity: 0.2, marginBottom: '20px' }} />
                            <h3>الرجاء اختيار تذكرة من القائمة לעرض التفاصيل</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSupportPage;
