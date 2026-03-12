import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, Phone, Mail, User, Building2, MoreVertical, Edit2, Trash2, Repeat, Target, Sparkles, Activity } from 'lucide-react';
import API_URL from '@/config';
import { motion, AnimatePresence } from 'framer-motion';

const LeadsPage = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state for creating a lead
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', company: '', email: '', phone: '', source: 'WEBSITE', status: 'NEW'
    });

    const fetchLeads = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/crm/leads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeads(res.data);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleCreateLead = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/crm/leads`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            setFormData({ name: '', company: '', email: '', phone: '', source: 'WEBSITE', status: 'NEW' });
            fetchLeads();
        } catch (error) {
            console.error('Error creating lead:', error);
        }
    };

    const convertLead = async (id) => {
        if (!window.confirm('هل أنت متأكد من تحويل هذا العميل المحتمل إلى شريك/عميل رسمي؟')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/crm/leads/${id}/convert`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLeads();
        } catch (error) {
            alert('فشل التحويل. تأكد من صحة البيانات.');
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            NEW: { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.2)', label: 'جديد' },
            CONTACTED: { bg: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.2)', label: 'تم التواصل' },
            QUALIFIED: { bg: 'rgba(16, 185, 129, 0.1)', text: '#34d399', border: 'rgba(16, 185, 129, 0.2)', label: 'مؤهل' },
            LOST: { bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171', border: 'rgba(239, 68, 68, 0.2)', label: 'مفقود' },
            CONVERTED: { bg: 'rgba(139, 92, 246, 0.1)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.2)', label: 'تم التحويل' }
        };
        const s = styles[status] || styles.NEW;
        return <span style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}`, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800' }}>{s.label}</span>;
    };

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.company && l.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.phone && l.phone.includes(searchTerm))
    );

    return (
        <div style={{ padding: '0px', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}
            >
                <div>
                   <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', margin: 0 }} className="gradient-text">العملاء المحتملين</h1>
                   <p style={{ margin: '6px 0 0 0', color: '#a1a1aa', fontSize: '1.1rem', fontWeight: '500' }}>إدارة ومتابعة وتحويل العملاء المحتملين والفرص الناشئة</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)} 
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '900', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)' }}
                    >
                        <Plus size={20} /> إضافة عميل جديد
                    </motion.button>
                </div>
            </motion.div>

            <div className="glass-card" style={{ padding: '25px', borderRadius: '24px', marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={22} style={{ position: 'absolute', right: '18px', top: '14px', color: '#52525b' }} />
                    <input
                        type="text"
                        className="premium-input"
                        placeholder="ابحث بالاسم، اسم الشركة، أو رقم الجوال..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '14px 55px 14px 20px', borderRadius: '18px', fontSize: '1rem', border: 'none' }}
                    />
                </div>
                <motion.button whileHover={{ scale: 1.05 }} style={{ padding: '14px 20px', borderRadius: '18px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                    <Filter size={20} /> تصفية النتائج
                </motion.button>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card" 
                style={{ borderRadius: '28px', overflow: 'hidden' }}
            >
                <div style={{ padding: '20px' }} className="main-scroll">
                    <table className="table-glass">
                        <thead>
                            <tr style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>
                                <th style={{ padding: '15px', textAlign: 'right', fontWeight: '800' }}>العميل / المؤسسة</th>
                                <th style={{ padding: '15px', textAlign: 'right', fontWeight: '800' }}>معلومات التواصل</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '800' }}>المصدر</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '800' }}>حالة التواصل</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '800' }}>تاريخ الإدراج</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '800' }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#a1a1aa' }}><RefreshCw className="animate-spin" style={{ margin: '0 auto 10px' }} /> جاري فحص قاعدة البيانات...</td></tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#52525b' }}>لا يوجد نتائج مطابقة حالياً</td></tr>
                            ) : (
                                filteredLeads.map((lead, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, x: -10 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        transition={{ delay: idx * 0.05 }}
                                        key={lead.id}
                                    >
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '45px', height: '45px', borderRadius: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                                    {lead.company ? <Building2 size={24} /> : <User size={24} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '900', color: '#fff', fontSize: '1rem' }}>{lead.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#52525b', fontWeight: '700' }}>{lead.company || 'فرد / عميل مباشر'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#a1a1aa', fontWeight: '700' }}><Phone size={14} color="#6366f1" /> <span dir="ltr">{lead.phone || 'N/A'}</span></div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#a1a1aa', fontWeight: '700' }}><Mail size={14} color="#6366f1" /> <span>{lead.email || 'N/A'}</span></div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '12px', color: '#fff', fontSize: '0.8rem', fontWeight: '700', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <Sparkles size={14} color="#f59e0b" /> {lead.source}
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <StatusBadge status={lead.status} />
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center', fontSize: '0.9rem', color: '#52525b', fontWeight: '900' }}>
                                            {new Date(lead.createdAt).toLocaleDateString('ar-SA')}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => convertLead(lead.id)}
                                                    disabled={lead.status === 'CONVERTED'}
                                                    style={{ 
                                                        padding: '8px 16px', 
                                                        background: lead.status === 'CONVERTED' ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.1)', 
                                                        color: lead.status === 'CONVERTED' ? '#52525b' : '#10b981', 
                                                        border: `1px solid ${lead.status === 'CONVERTED' ? 'transparent' : 'rgba(16, 185, 129, 0.2)'}`, 
                                                        borderRadius: '12px', 
                                                        cursor: lead.status === 'CONVERTED' ? 'not-allowed' : 'pointer', 
                                                        fontSize: '0.85rem', 
                                                        fontWeight: '900', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '8px' 
                                                    }}
                                                >
                                                    <Repeat size={16} /> {lead.status === 'CONVERTED' ? 'تم التحويل' : 'تحويل لعميل'}
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                                                    style={{ padding: '10px', color: '#52525b', border: 'none', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', cursor: 'pointer' }}
                                                >
                                                    <MoreVertical size={18} />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Creation Modal Redesign */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '16px', color: '#6366f1' }}><User size={28} /></div>
                                <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>إضافة عميل محتمل جديد</h3>
                            </div>
                            <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '800' }}>الاسم الكامل للمسؤول *</label>
                                    <input required type="text" className="premium-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '800' }}>براند الشركة أو المؤسسة</label>
                                    <input type="text" className="premium-input" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} style={{ width: '100%' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '800' }}>رقم الجوال</label>
                                        <input type="text" className="premium-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%' }} dir="ltr" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '800' }}>البريد الإلكتروني</label>
                                        <input type="email" className="premium-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '800' }}>مصدر العميل</label>
                                    <select className="premium-input-select" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} style={{ width: '100%' }}>
                                        <option value="WEBSITE">الموقع الإلكتروني</option>
                                        <option value="REFERRAL">توصية / إحالة شخصية</option>
                                        <option value="SOCIAL_MEDIA">حملات السوشيال ميديا</option>
                                        <option value="OTHER">أخرى</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', cursor: 'pointer', fontWeight: '900' }}>إلغاء</button>
                                    <button type="submit" style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '18px', cursor: 'pointer', fontWeight: '900', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)' }}>حفظ وإضافة للقائمة</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LeadsPage;
