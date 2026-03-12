import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Printer, Trash2, Edit, FileText, AlertOctagon, CheckCircle, ChevronLeft, Search, Filter, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';
import API_URL from '@/config';
import { useToast } from '../../context/ToastContext';

const InvoicesPage = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Invoices
    const { data: invoices = [], isLoading: invoicesLoading, error: invoicesError } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/invoices`);
            return res.data;
        }
    });

    // Fetch Partners
    const { data: partners = [] } = useQuery({
        queryKey: ['partners'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/partners`);
            return res.data;
        }
    });

    // Fetch Products
    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/products`);
            return res.data;
        }
    });

    const { showToast } = useToast();

    // Mutations
    const saveMutation = useMutation({
        mutationFn: async (data) => {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            if (isEditing) {
                return axios.put(`${API_URL}/invoices/${editingId}`, data, config);
            } else {
                return axios.post(`${API_URL}/invoices`, data, config);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            showToast('تم حفظ الفاتورة بنجاح', 'success');
            handleResetForm();
        },
        onError: (err) => {
            const errorMsg = err.response?.data?.error || err.response?.data?.details || err.message;
            showToast(`فشل العملية: ${errorMsg}`, 'error');
        }
    });

    const payMutation = useMutation({
        mutationFn: async (id) => {
            const token = localStorage.getItem('token');
            return axios.put(`${API_URL}/invoices/${id}/pay`, {}, { headers: { 'Authorization': `Bearer ${token}` } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            showToast('تم سداد الفاتورة بنجاح', 'success');
        },
        onError: (err) => {
            showToast(`فشل السداد: ${err.message}`, 'error');
        }
    });

    // Form State
    const [invoiceData, setInvoiceData] = useState({
        partnerId: '',
        date: new Date().toISOString().split('T')[0],
        type: 'SALES_TAX',
        discount: 0,
        items: [{ productId: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]
    });

    const handleResetForm = () => {
        setInvoiceData({
            partnerId: '',
            date: new Date().toISOString().split('T')[0],
            type: 'SALES_TAX',
            discount: 0,
            items: [{ productId: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]
        });
        setIsEditing(false);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (inv) => {
        setInvoiceData({
            partnerId: inv.partnerId || '',
            date: new Date(inv.date).toISOString().split('T')[0],
            type: inv.type || 'SALES_TAX',
            discount: inv.discount || 0,
            items: inv.items.map(item => ({
                productId: item.productId || '',
                description: item.description || '',
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total
            }))
        });
        setEditingId(inv.id);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...invoiceData.items];
        let item = { ...newItems[index], [field]: value };
        if (field === 'productId') {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                item.description = product.name;
                item.unitPrice = product.price;
            }
        }
        item.total = item.quantity * item.unitPrice;
        newItems[index] = item;
        setInvoiceData({ ...invoiceData, items: newItems });
    };

    const calculateTotals = () => {
        const subtotal = invoiceData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        const discount = parseFloat(invoiceData.discount) || 0;
        const taxable = subtotal - discount;
        const tax = taxable * 0.15;
        const total = taxable + tax;
        return { subtotal, taxable, tax, total };
    };

    const filteredInvoices = invoices.filter(inv => 
        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.partner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showForm) {
        const totals = calculateTotals();
        return (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="fade-in" style={{ paddingBottom: '100px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={handleResetForm} className="glass-card" style={{ padding: '12px', borderRadius: '14px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <ChevronLeft size={24} />
                        </motion.button>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>{isEditing ? 'تعديل الفاتورة' : 'فاتورة مبيعات جديدة'}</h2>
                            <p style={{ margin: '4px 0 0 0', color: '#a1a1aa' }}>أدخل تفاصيل البنود والعميل لإصدار الفاتورة</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={handleResetForm} style={{ padding: '12px 30px', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '700' }}>إلغاء</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => saveMutation.mutate(invoiceData)} style={{ padding: '12px 40px', borderRadius: '15px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', fontWeight: '900', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)' }}>حفظ وإصدار</motion.button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '30px' }}>
                    <div className="glass-card" style={{ padding: '35px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '40px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '12px', color: '#a1a1aa', fontWeight: '700' }}>العميل</label>
                                <select value={invoiceData.partnerId} onChange={(e) => setInvoiceData({...invoiceData, partnerId: e.target.value})} className="premium-input" style={{ width: '100%', background: 'rgba(255,255,255,0.03)' }}>
                                    <option value="">اختر عميلاً من القائمة...</option>
                                    {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '12px', color: '#a1a1aa', fontWeight: '700' }}>تاريخ الفاتورة</label>
                                <input type="date" value={invoiceData.date} onChange={(e) => setInvoiceData({...invoiceData, date: e.target.value})} className="premium-input" style={{ width: '100%', background: 'rgba(255,255,255,0.03)' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '800' }}>بنود الفاتورة</h3>
                            <motion.button whileHover={{ scale: 1.05 }} onClick={() => setInvoiceData({...invoiceData, items: [...invoiceData.items, { productId: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]})} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px dashed #6366f1', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}><Plus size={18} /> إضافة بند</motion.button>
                        </div>

                        <div className="table-responsive">
                            <table className="table-glass">
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'right' }}>المنتج</th>
                                        <th style={{ textAlign: 'center' }}>الكمية</th>
                                        <th style={{ textAlign: 'center' }}>السعر</th>
                                        <th style={{ textAlign: 'center' }}>الإجمالي</th>
                                        <th style={{ textAlign: 'center' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceData.items.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ width: '40%' }}>
                                                <select value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} className="premium-input" style={{ width: '100%', background: 'transparent', border: 'none' }}>
                                                    <option value="">اختر منتجاً...</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </td>
                                            <td style={{ width: '15%' }}>
                                                <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="premium-input" style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none' }} />
                                            </td>
                                            <td style={{ width: '20%' }}>
                                                <input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className="premium-input" style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none' }} />
                                            </td>
                                            <td style={{ width: '20%', textAlign: 'center', fontWeight: '900', color: '#fff' }}>{item.total.toLocaleString()}</td>
                                            <td style={{ width: '5%' }}>
                                                <button onClick={() => setInvoiceData({...invoiceData, items: invoiceData.items.filter((_, i) => i !== index)})} style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div className="glass-card" style={{ padding: '30px', borderRadius: '28px', border: '1px solid rgba(99,102,241,0.1)' }}>
                            <h3 style={{ margin: '0 0 25px 0', fontSize: '1.2rem', color: '#fff', fontWeight: '800' }}>ملخص الفاتورة</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', fontWeight: '600' }}>
                                    <span>المجموع قبل الضريبة</span>
                                    <span style={{ color: '#fff' }}>{totals.subtotal.toLocaleString()} ر.س</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#a1a1aa', fontWeight: '600' }}>الخصم</span>
                                    <input type="number" value={invoiceData.discount} onChange={(e) => setInvoiceData({...invoiceData, discount: e.target.value})} className="premium-input" style={{ width: '100px', textAlign: 'center', padding: '8px' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', fontWeight: '600' }}>
                                    <span>الضريبة (15%)</span>
                                    <span style={{ color: '#fff' }}>{totals.tax.toLocaleString()} ر.س</span>
                                </div>
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', marginTop: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>الإجمالي النهائي</span>
                                        <span style={{ fontSize: '2rem', fontWeight: '900', color: '#4ade80' }}>{totals.total.toLocaleString()} <span style={{ fontSize: '1rem' }}>ر.س</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', color: '#fff' }} className="gradient-text">المبيعات والفواتير</h2>
                    <p style={{ margin: '6px 0 0 0', color: '#a1a1aa', fontSize: '1.1rem', fontWeight: '500' }}>إدارة الفواتير الضريبية، المتابعة المالية، والتحصيل</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <motion.button whileHover={{ scale: 1.05 }} className="glass-card" style={{ padding: '12px 25px', borderRadius: '16px', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                        <Download size={20} /> تصدير التقرير
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowForm(true)} style={{ padding: '12px 30px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)' }}>
                        <Plus size={22} /> فاتورة جديدة
                    </motion.button>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '20px 30px', borderRadius: '24px', marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={20} style={{ position: 'absolute', right: '15px', top: '12px', color: '#52525b' }} />
                    <input type="text" placeholder="بحث برقم الفاتورة أو اسم العميل..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="premium-input" style={{ width: '100%', paddingRight: '45px', border: 'none', background: 'transparent' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '12px', color: '#a1a1aa', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Filter size={18} /> تصفية</button>
                    <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', color: '#a1a1aa', cursor: 'pointer' }}><Printer size={20} /></button>
                </div>
            </div>

            <div className="glass-card" style={{ borderRadius: '28px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                {invoicesLoading ? (
                    <div style={{ padding: '100px', textAlign: 'center' }}><AlertOctagon className="animate-spin" size={40} style={{ color: '#6366f1', marginBottom: '15px' }} /><div style={{ color: '#fff', fontWeight: '700' }}>جاري تحميل البيانات...</div></div>
                ) : (
                    <div className="table-responsive">
                        <table className="table-glass" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'right', padding: '25px' }}>رقم الفاتورة</th>
                                    <th style={{ textAlign: 'right' }}>العميل</th>
                                    <th style={{ textAlign: 'center' }}>التاريخ</th>
                                    <th style={{ textAlign: 'center' }}>الحالة</th>
                                    <th style={{ textAlign: 'center' }}>الإجمالي</th>
                                    <th style={{ textAlign: 'center' }}>خيارات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((inv, idx) => (
                                    <motion.tr key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                                        <td style={{ padding: '20px 25px' }}><span style={{ fontWeight: '900', color: '#fff', fontSize: '1.1rem' }}>{inv.invoiceNumber}</span></td>
                                        <td>
                                            <div style={{ fontWeight: '800', color: '#fff' }}>{inv.partner?.name || '—'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{inv.partner?.phone}</div>
                                        </td>
                                        <td style={{ textAlign: 'center', color: '#a1a1aa', fontWeight: '600' }}>{new Date(inv.date).toLocaleDateString('ar-SA')}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`status-pill ${inv.status === 'PAID' ? 'status-paid' : 'status-pending'}`}>
                                                {inv.status === 'PAID' ? 'مـدفوعة' : 'مستحقة'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}><div style={{ fontWeight: '900', color: '#fff', fontSize: '1.2rem' }}>{inv.total.toLocaleString()} <span style={{ fontSize: '0.7rem' }}>ر.س</span></div></td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                {inv.status !== 'PAID' && (
                                                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => payMutation.mutate(inv.id)} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><CheckCircle size={18} /></motion.button>
                                                )}
                                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEdit(inv)} style={{ background: 'rgba(255,255,255,0.05)', color: '#a1a1aa', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><Edit size={18} /></motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => window.open(`/invoices/${inv.id}/print`, '_blank')} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><Printer size={18} /></motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoicesPage;
