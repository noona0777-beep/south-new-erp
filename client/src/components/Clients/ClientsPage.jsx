import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Plus, Phone, MapPin, Receipt, FileText, User, Folder, AlertOctagon, X, ChevronLeft, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';
import API_URL from '@/config';

const ClientsPage = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null); // For Details Modal

    // New Client Form
    const [newClient, setNewClient] = useState({ name: '', phone: '', address: '', vatNumber: '' });

    // Queries
    const { data: clients = [], isLoading, error } = useQuery({
        queryKey: ['partners'],
        queryFn: async () => (await axios.get(`${API_URL}/partners`)).data
    });

    const { data: clientDetails, isLoading: detailsLoading } = useQuery({
        queryKey: ['partner', selectedClient?.id],
        queryFn: async () => (await axios.get(`${API_URL}/partners/${selectedClient.id}`)).data,
        enabled: !!selectedClient?.id
    });

    // Mutations
    const saveMutation = useMutation({
        mutationFn: async (data) => await axios.post(`${API_URL}/partners`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partners'] });
            setShowForm(false);
            setNewClient({ name: '', phone: '', address: '', vatNumber: '' });
        }
    });

    const archiveMutation = useMutation({
        mutationFn: async (client) => {
            return axios.post(`${API_URL}/documents`, {
                title: `سجل بيانات العميل: ${client.name}`,
                category: 'OTHER',
                fileUrl: `INTERNAL:CLIENT:${client.id}`,
                partnerId: client.id
            });
        },
        onSuccess: () => alert('✅ تم أرشفة بيانات العميل في الوثائق'),
        onError: () => alert('❌ فشل الأرشفة')
    });

    const handleCreate = (e) => {
        e.preventDefault();
        saveMutation.mutate(newClient);
    };

    const handleArchive = (client) => {
        archiveMutation.mutate(client);
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                <div>
                    <h2 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.8rem', fontWeight: '800' }} className="gradient-text">العملاء والشركاء</h2>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.95rem' }}>إدارة بيانات العملاء • كشوفات الحسابات • السجل الضريبي</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(true)}
                    style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                        color: 'white', border: 'none', padding: '14px 28px',
                        borderRadius: '18px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '800',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        boxShadow: '0 10px 20px -10px rgba(99, 102, 241, 0.5)'
                    }}
                >
                    <Plus size={22} /> إضافة عميل جديد
                </motion.button>
            </div>

            {/* Search */}
            <div className="glass-card" style={{ marginBottom: '30px', padding: '12px 25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Search color="#6366f1" size={24} />
                <input
                    type="text"
                    placeholder="ابحث عن عميل بالاسم، رقم الجوال، أو الرقم الضريبي..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '1.1rem', fontFamily: 'Cairo', color: '#fff' }}
                />
            </div>

            {/* Clients Grid */}
            {isLoading ? (
                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '25px' }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass-card animate-pulse" style={{ height: '240px', borderRadius: '24px' }} />
                    ))}
                </div>
            ) : error ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: '#ef4444', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <AlertOctagon size={55} style={{ margin: '0 auto 20px', display: 'block' }} />
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>عذراً، فشل تحميل بيانات العملاء</h3>
                    <p style={{ color: '#71717a' }}>يرجى التحقق من اتصالك بالإنترنت والتحقق من حالة الخادم.</p>
                </div>
            ) : (
                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '25px' }}>
                    {filteredClients.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#71717a' }}>
                            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', width: 'fit-content', margin: '0 auto 20px' }}>
                                <Users size={60} strokeWidth={1} color="#52525b" />
                            </div>
                            <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>لا يوجد عملاء يطابقون بحثك حالياً.</p>
                        </div>
                    ) : (
                        filteredClients.map(client => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={client.id}
                                className="glass-card card-hover"
                                onClick={() => setSelectedClient(client)}
                                style={{ padding: '28px', borderRadius: '24px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                            >
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #6366f1, transparent)' }} />
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '20px' }}>
                                    <div style={{ width: '55px', height: '55px', borderRadius: '18px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                        <User size={28} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: '800' }}>{client.name}</h3>
                                        <div style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: '600' }}>الرقم المرجعي: #{client.id}</div>
                                    </div>
                                    <ChevronLeft size={20} color="#3f3f46" />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#a1a1aa', fontSize: '0.95rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '12px' }}>
                                        <Phone size={16} color="#4ade80" /> <span>{client.phone || 'غير مسجل'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <MapPin size={16} color="#6366f1" /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.address || 'العنوان غير محدد'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Receipt size={16} color="#f59e0b" /> <span>الرقم الضريبي: <span style={{ color: '#fff', fontWeight: '700' }}>{client.vatNumber || '-'}</span></span>
                                    </div>
                                </div>

                                <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#52525b', fontWeight: '700' }}>عرض الملف الكامل</span>
                                    <motion.button
                                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                        onClick={(e) => { e.stopPropagation(); handleArchive(client); }}
                                        style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '800', color: '#a1a1aa', cursor: 'pointer' }}
                                    >
                                        <Folder size={16} style={{ display: 'inline', marginLeft: '6px', verticalAlign: 'middle' }} />
                                        أرشفة
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Create Client Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass-card" 
                            style={{ padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: '800' }}>إضافة شريك جديد</h3>
                                <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: '#52525b', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleCreate}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '10px', color: '#a1a1aa', fontWeight: '600' }}>الاسم الكامل للمنشأة / الفرد</label>
                                    <input required type="text" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} style={{ width: '100%', padding: '14px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#fff', outline: 'none', fontFamily: 'Cairo' }} placeholder="أدخل الاسم هنا..." />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '10px', color: '#a1a1aa', fontWeight: '600' }}>رقم الجوال</label>
                                    <input type="text" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} style={{ width: '100%', padding: '14px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#fff', outline: 'none', fontFamily: 'Cairo' }} placeholder="05xxxxxxxx" />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '10px', color: '#a1a1aa', fontWeight: '600' }}>العنوان الوطني / الموقع</label>
                                    <input type="text" value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })} style={{ width: '100%', padding: '14px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#fff', outline: 'none', fontFamily: 'Cairo' }} placeholder="المدينة، الحي، الشارع" />
                                </div>
                                <div style={{ marginBottom: '30px' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '10px', color: '#a1a1aa', fontWeight: '600' }}>الرقم الضريبي (VAT)</label>
                                    <input type="text" value={newClient.vatNumber} onChange={e => setNewClient({ ...newClient, vatNumber: e.target.value })} style={{ width: '100%', padding: '14px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#fff', outline: 'none', fontFamily: 'Cairo' }} placeholder="أدخل 15 رقم ضريبي" />
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <motion.button type="button" whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }} onClick={() => setShowForm(false)} style={{ flex: 1, padding: '14px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#a1a1aa', fontWeight: '700', cursor: 'pointer', fontFamily: 'Cairo' }}>إلغاء</motion.button>
                                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ flex: 1, padding: '14px', borderRadius: '15px', border: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', fontWeight: '800', cursor: 'pointer', fontFamily: 'Cairo', boxShadow: '0 10px 20px -10px rgba(99, 102, 241, 0.4)' }}>إتمم الحفظ</motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Client Details Modal */}
            <AnimatePresence>
                {selectedClient && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 110, padding: '20px' }} 
                        onClick={() => setSelectedClient(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass-card" 
                            style={{ borderRadius: '30px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }} 
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ padding: '35px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Users size={32} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#fff', fontWeight: '800' }}>{selectedClient.name}</h3>
                                        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={14} /> {selectedClient.phone}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '5px' }}><Receipt size={14} /> {selectedClient.vatNumber || 'بدون رقم ضريبي'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedClient(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                            </div>
                            
                            <div style={{ padding: '35px', flex: 1, overflowY: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                    <h4 style={{ margin: 0, color: '#fff', fontWeight: '800', fontSize: '1.1rem' }}>سجل الفواتير والعمليات المالية</h4>
                                    <span style={{ fontSize: '0.85rem', color: '#52525b' }}>آخر 10 عمليات مسجلة</span>
                                </div>

                                {detailsLoading ? (
                                    <div style={{ textAlign: 'center', padding: '60px' }}>
                                        <div className="animate-pulse" style={{ height: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', marginBottom: '10px' }} />
                                        <div className="animate-pulse" style={{ height: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }} />
                                    </div>
                                ) : clientDetails?.invoices && clientDetails.invoices.length > 0 ? (
                                    <div className="table-responsive" style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <table className="table-glass" style={{ margin: 0 }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ textAlign: 'right' }}>الرقم</th>
                                                    <th style={{ textAlign: 'right' }}>التاريخ</th>
                                                    <th style={{ textAlign: 'right' }}>القيمة الإجمالية</th>
                                                    <th style={{ textAlign: 'center' }}>الإجراء</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {clientDetails.invoices.slice(0, 10).map(inv => (
                                                    <tr key={inv.id}>
                                                        <td style={{ fontWeight: '800', color: '#fff' }}>{inv.invoiceNumber}</td>
                                                        <td style={{ color: '#a1a1aa' }}>{new Date(inv.date).toLocaleDateString('ar-SA')}</td>
                                                        <td style={{ fontWeight: '900', color: '#10b981', fontSize: '1.1rem' }}>{inv.total.toLocaleString()} ر.س</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button onClick={() => window.open(`/invoices/${inv.id}/print`, '_blank')} style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: '700' }}>عرض</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.01)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                                        <FileText size={50} strokeWidth={1} color="#3f3f46" style={{ marginBottom: '15px' }} />
                                        <p style={{ color: '#52525b', fontSize: '1rem', fontWeight: '600' }}>لا توجد سجلات مالية مربوطة بهذا العميل حتى الآن</p>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '30px 40px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '20px', justifyContent: 'flex-end' }}>
                                <motion.button
                                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                    onClick={() => handleArchive(selectedClient)}
                                    disabled={archiveMutation.isPending}
                                    style={{ background: 'transparent', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 30px', borderRadius: '15px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', opacity: archiveMutation.isPending ? 0.6 : 1, fontFamily: 'Cairo' }}
                                >
                                    <Folder size={18} /> {archiveMutation.isPending ? 'جاري الأرشفة...' : 'أرشفة كافة البيانات'}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => window.open(`/clients/${selectedClient.id}/statement`, '_blank')}
                                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '12px 35px', borderRadius: '15px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Cairo' }}
                                >
                                    <CreditCard size={18} /> طباعة كشف حساب معتمد
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClientsPage;
