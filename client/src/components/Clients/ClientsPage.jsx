import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Plus, Phone, MapPin, Receipt, FileText, User, Folder } from 'lucide-react';
import API_URL from '../../config';

const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null); // For Details Modal

    // New Client Form
    const [newClient, setNewClient] = useState({ name: '', phone: '', address: '', vatNumber: '' });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await axios.get(`${API_URL}/partners`);
            setClients(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch clients', err);
        }
    };

    const fetchClientDetails = async (id) => {
        try {
            const res = await axios.get(`${API_URL}/partners/${id}`);
            setSelectedClient(res.data);
        } catch (err) {
            console.error('Failed to fetch client details', err);
        }
    };

    const handleArchive = async (client) => {
        try {
            await axios.post(`${API_URL}/documents`, {
                title: `سجل بيانات العميل: ${client.name}`,
                category: 'OTHER',
                fileUrl: '',
                partnerId: client.id
            });
            alert('✅ تم أرشفة بيانات العميل في الوثائق');
        } catch (err) {
            alert('❌ فشل الأرشفة');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/partners`, newClient);
            fetchClients();
            setShowForm(false);
            setNewClient({ name: '', phone: '', address: '', vatNumber: '' });
        } catch (err) {
            alert('Failed to add client');
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
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
                        display: 'flex', alignItems: 'center', gap: '8px'
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {filteredClients.map(client => (
                    <div
                        key={client.id}
                        className="card-hover"
                        onClick={() => fetchClientDetails(client.id)}
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
                            <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', color: '#334155' }}>عرض السجل</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Client Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
                    <div className="fade-in" style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '450px' }}>
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
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 60 }} onClick={() => setSelectedClient(null)}>
                    <div className="fade-in" style={{ background: 'white', borderRadius: '16px', width: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '0' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{selectedClient.name}</h3>
                            <button onClick={() => setSelectedClient(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#64748b' }}>سجل الفواتير (آخر 10 عمليات)</h4>
                            {selectedClient.invoices && selectedClient.invoices.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                            <th style={{ textAlign: 'right', padding: '10px', fontSize: '0.9rem', color: '#64748b' }}>رقم الفاتورة</th>
                                            <th style={{ textAlign: 'right', padding: '10px', fontSize: '0.9rem', color: '#64748b' }}>التاريخ</th>
                                            <th style={{ textAlign: 'right', padding: '10px', fontSize: '0.9rem', color: '#64748b' }}>القيمة</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedClient.invoices.slice(0, 10).map(inv => (
                                            <tr key={inv.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{inv.invoiceNumber}</td>
                                                <td style={{ padding: '10px', fontSize: '0.9rem' }}>{new Date(inv.date).toLocaleDateString('ar-SA')}</td>
                                                <td style={{ padding: '10px', fontWeight: 'bold', color: '#10b981' }}>{inv.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>لا توجد فواتير مسجلة لهذا العميل</p>
                            )}
                        </div>
                        <div style={{ padding: '24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => handleArchive(selectedClient)}
                                style={{ background: 'white', color: '#64748b', border: '1px solid #e2e8f0', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Folder size={18} /> أرشفة البيانات
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
