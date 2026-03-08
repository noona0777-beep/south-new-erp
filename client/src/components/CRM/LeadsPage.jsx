import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, Phone, Mail, User, Building2, MoreVertical, Edit2, Trash2, Repeat } from 'lucide-react';
import API_URL from '@/config';
import { motion } from 'framer-motion';

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
            alert('حدث خطأ أثناء إضافة العميل.');
        }
    };

    const convertLead = async (id) => {
        if (!window.confirm('هل أنت متأكد من تحويل هذا العميل المحتمل إلى شريك/عميل رسمي؟')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/crm/leads/${id}/convert`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('تم التحويل بنجاح!');
            fetchLeads();
        } catch (error) {
            if (error.response?.data?.error) {
                alert(error.response.data.error);
            } else {
                alert('فشل التحويل. تأكد من صحة البيانات.');
            }
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            NEW: { bg: '#e0f2fe', text: '#0284c7', label: 'جديد' },
            CONTACTED: { bg: '#fef3c7', text: '#d97706', label: 'تم التواصل' },
            QUALIFIED: { bg: '#dcfce7', text: '#15803d', label: 'مؤهل' },
            LOST: { bg: '#fee2e2', text: '#b91c1c', label: 'مفقود' },
            CONVERTED: { bg: '#f3e8ff', text: '#7e22ce', label: 'تم التحويل' }
        };
        const s = styles[status] || styles.NEW;
        return <span style={{ background: s.bg, color: s.text, padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>{s.label}</span>;
    };

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.company && l.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.phone && l.phone.includes(searchTerm))
    );

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>العملاء المحتملين (Leads)</h2>
                <button onClick={() => setIsModalOpen(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <Plus size={18} /> إضافة عميل جديد
                </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', right: '12px', top: '12px', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم، اسم الشركة، أو رقم الجوال..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '10px 36px 10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>العميل / الشركة</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>معلومات التواصل</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>المصدر</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>الحالة</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>تاريخ الإضافة</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>جاري التحميل...</td></tr>
                        ) : filteredLeads.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>لا يوجد عملاء مطابقين للبحث.</td></tr>
                        ) : (
                            filteredLeads.map(lead => (
                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={lead.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                {lead.company ? <Building2 size={20} /> : <User size={20} />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{lead.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{lead.company || 'فرد'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569' }}><Phone size={14} /> <span dir="ltr">{lead.phone || 'غير محدد'}</span></div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569' }}><Mail size={14} /> <span>{lead.email || 'غير محدد'}</span></div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.9rem', color: '#475569' }}>
                                        {lead.source}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <StatusBadge status={lead.status} />
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.9rem', color: '#475569' }}>
                                        {new Date(lead.createdAt).toLocaleDateString('ar-SA')}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => convertLead(lead.id)}
                                                disabled={lead.status === 'CONVERTED'}
                                                style={{ padding: '6px 12px', background: lead.status === 'CONVERTED' ? '#e2e8f0' : '#dcfce7', color: lead.status === 'CONVERTED' ? '#94a3b8' : '#15803d', border: 'none', borderRadius: '6px', cursor: lead.status === 'CONVERTED' ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Repeat size={14} /> تحويل لعميل
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for adding a lead */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', color: '#0f172a' }}>إضافة عميل محتمل جديد</h3>
                        <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>الاسم الكامل *</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>اسم الشركة (اختياري)</label>
                                <input type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>الجوال</label>
                                    <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>البريد الإلكتروني</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>المصدر</label>
                                <select value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                    <option value="WEBSITE">الموقع الإلكتروني</option>
                                    <option value="REFERRAL">توصية / إحالة</option>
                                    <option value="SOCIAL_MEDIA">وسائل التواصل</option>
                                    <option value="OTHER">أخرى</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>إلغاء</button>
                                <button type="submit" style={{ flex: 1, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>حفظ وإضافة</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadsPage;
