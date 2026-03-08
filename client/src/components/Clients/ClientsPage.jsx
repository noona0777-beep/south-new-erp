import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Plus, Phone, MapPin, Receipt, FileText, User, Folder, AlertOctagon } from 'lucide-react';
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
            alert('✅ تم إضافة العميل بنجاح');
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
            <div className="mobile-grid-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>العملاء</h2>
                    <p style={{ margin: 0, color: '#64748b' }}>إدارة بيانات العملاء وكشوفات الحسابات</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="card-hover"
                    style={{
                        background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px',
                        borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content'
                    }}
                >
                    <Plus size={20} /> إضافة عميل جديد
                </button>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '30px', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Search color="#94a3b8" />
                <input
                    type="text"
                    placeholder="بحث باسم العميل أو رقم الجوال..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '1rem', fontFamily: 'Cairo' }}
                />
            </div>

            {/* Clients Grid */}
            {isLoading ? (
                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass-card premium-shadow animate-pulse" style={{ height: '220px', borderRadius: '16px', background: '#f8fafc' }} />
                    ))}
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444', background: '#fef2f2', borderRadius: '16px', border: '1px solid #fee2e2' }}>
                    <AlertOctagon size={48} style={{ margin: '0 auto 15px', display: 'block' }} />
                    <h3 style={{ margin: 0 }}>عذراً، فشل تحميل بيانات العملاء</h3>
                    <p style={{ opacity: 0.8 }}>يرجى التحقق من اتصالك بالإنترنت والتحقق من حالة الخادم.</p>
                </div>
            ) : (
                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {filteredClients.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                            <Users size={48} style={{ margin: '0 auto 15px', opacity: 0.3 }} />
                            <p>لا يوجد عملاء يطابقون بحثك حالياً.</p>
                        </div>
                    ) : (
                        filteredClients.map(client => (
                            <div
                                key={client.id}
                                className="card-hover"
                                onClick={() => setSelectedClient(client)}
                                style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{client.name}</h3>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>ID: #{client.id}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#64748b', fontSize: '0.9rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Phone size={16} /> <span>{client.phone || 'غير مسجل'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <MapPin size={16} /> <span>{client.address || 'العنوان غير محدد'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FileText size={16} /> <span>الرقم الضريبي: {client.vatNumber || '-'}</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>انقر لعرض التفاصيل</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleArchive(client); }}
                                        style={{ background: '#f8fafc', padding: '6px 12px', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                                    >
                                        أرشفة العميل
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create Client Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, padding: '20px' }}>
                    <div className="fade-in" style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '450px' }}>
                        <h3 style={{ margin: '0 0 20px 0' }}>إضافة عميل جديد</h3>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>الاسم</label><input required type="text" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
                            <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>رقم الجوال</label><input type="text" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
                            <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>العنوان</label><input type="text" value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
                            <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>الرقم الضريبي</label><input type="text" value={newClient.vatNumber} onChange={e => setNewClient({ ...newClient, vatNumber: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}>إلغاء</button>
                                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold' }}>حفظ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Client Details Modal */}
            {selectedClient && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 60, padding: '20px' }} onClick={() => setSelectedClient(null)}>
                    <div className="fade-in" style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '0' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{selectedClient.name}</h3>
                            <button onClick={() => setSelectedClient(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#64748b' }}>سجل الفواتير (آخر 10 عمليات)</h4>
                            {detailsLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>جاري تحميل السجل...</div>
                            ) : clientDetails?.invoices && clientDetails.invoices.length > 0 ? (
                                <div className="table-responsive">
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                                <th style={{ textAlign: 'right', padding: '10px', fontSize: '0.9rem', color: '#64748b' }}>رقم الفاتورة</th>
                                                <th style={{ textAlign: 'right', padding: '10px', fontSize: '0.9rem', color: '#64748b' }}>التاريخ</th>
                                                <th style={{ textAlign: 'right', padding: '10px', fontSize: '0.9rem', color: '#64748b' }}>القيمة</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clientDetails.invoices.slice(0, 10).map(inv => (
                                                <tr key={inv.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{inv.invoiceNumber}</td>
                                                    <td style={{ padding: '10px', fontSize: '0.9rem' }}>{new Date(inv.date).toLocaleDateString('ar-SA')}</td>
                                                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#10b981' }}>{inv.total.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>لا توجد فواتير مسجلة لهذا العميل</p>
                            )}
                        </div>
                        <div className="mobile-grid-1" style={{ padding: '24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => handleArchive(selectedClient)}
                                disabled={archiveMutation.isPending}
                                style={{ background: 'white', color: '#64748b', border: '1px solid #e2e8f0', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', opacity: archiveMutation.isPending ? 0.6 : 1 }}
                            >
                                <Folder size={18} /> {archiveMutation.isPending ? 'جاري الأرشفة...' : 'أرشفة البيانات'}
                            </button>
                            <button
                                onClick={() => window.open(`/clients/${selectedClient.id}/statement`, '_blank')}
                                style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                طباعة كشف حساب
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientsPage;
