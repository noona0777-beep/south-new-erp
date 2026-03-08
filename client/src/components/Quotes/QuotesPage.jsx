import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Printer, Trash2, Edit, FileText, CheckCircle, XCircle, Clock, AlertOctagon } from 'lucide-react';
import API_URL from '@/config';

const QuotesPage = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [quoteData, setQuoteData] = useState({
        partnerId: '',
        date: new Date().toISOString().split('T')[0],
        validUntil: '',
        discount: 0,
        notes: '',
        items: [{ productId: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]
    });

    // Fetch Quotes
    const { data: quotes = [], isLoading: quotesLoading, error: quotesError } = useQuery({
        queryKey: ['quotes'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/quotes`);
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

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (isEditing) {
                return axios.put(`${API_URL}/quotes/${editingId}`, data);
            }
            return axios.post(`${API_URL}/quotes`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
            handleResetForm();
            alert('✅ تم حفظ عرض السعر بنجاح');
        },
        onError: (err) => {
            alert('❌ فشل الحفظ: ' + (err.response?.data?.error || err.message));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`${API_URL}/quotes/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
            alert('✅ تم حذف عرض السعر');
        },
        onError: (err) => {
            alert('❌ فشل الحذف: ' + (err.response?.data?.error || err.message));
        }
    });

    const handleResetForm = () => {
        setQuoteData({
            partnerId: '',
            date: new Date().toISOString().split('T')[0],
            validUntil: '',
            discount: 0,
            notes: '',
            items: [{ productId: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]
        });
        setIsEditing(false);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (quote) => {
        setQuoteData({
            partnerId: quote.partnerId || '',
            date: new Date(quote.date).toISOString().split('T')[0],
            validUntil: quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : '',
            discount: quote.discount || 0,
            notes: quote.notes || '',
            items: quote.items.map(item => ({
                productId: item.productId || '',
                description: item.description || '',
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total
            }))
        });
        setEditingId(quote.id);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleAddItem = () => {
        setQuoteData({
            ...quoteData,
            items: [...quoteData.items, { productId: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = quoteData.items.filter((_, i) => i !== index);
        setQuoteData({ ...quoteData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...quoteData.items];
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
        setQuoteData({ ...quoteData, items: newItems });
    };

    const calculateTotals = () => {
        const subtotal = quoteData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        const discount = parseFloat(quoteData.discount) || 0;
        const taxable = subtotal - discount;
        const tax = taxable * 0.15;
        const total = taxable + tax;
        return { subtotal, taxable, tax, total };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        saveMutation.mutate(quoteData);
    };

    const handleDelete = (id) => {
        if (window.confirm('هل أنت متأكد من حذف عرض السعر هذا؟')) {
            deleteMutation.mutate(id);
        }
    };

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => axios.patch(`${API_URL}/quotes/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
        },
        onError: (err) => {
            alert('❌ فشل تحديث الحالة');
        }
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'ACCEPTED': return { bg: '#ecfdf5', color: '#10b981', label: 'مقبول' };
            case 'REJECTED': return { bg: '#fef2f2', color: '#ef4444', label: 'مرفوض' };
            case 'DRAFT': return { bg: '#f1f5f9', color: '#64748b', label: 'مسودة' };
            case 'SENT': return { bg: '#eff6ff', color: '#3b82f6', label: 'تم الإرسال' };
            default: return { bg: '#f1f5f9', color: '#64748b', label: status };
        }
    };

    if (showForm) {
        const totals = calculateTotals();
        return (
            <div className="fade-in" style={{ paddingBottom: '50px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>{isEditing ? 'تعديل عرض سعر' : 'إنشاء عرض سعر جديد'}</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleResetForm} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>إلغاء</button>
                        <button onClick={handleSubmit} disabled={saveMutation.isPending} style={{ background: '#2563eb', border: 'none', padding: '10px 30px', borderRadius: '8px', cursor: 'pointer', color: 'white', fontWeight: 'bold', opacity: saveMutation.isPending ? 0.6 : 1 }}>
                            {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ العرض'}
                        </button>
                    </div>
                </div>

                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#334155' }}>بيانات العرض</h3>
                        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem' }}>العميل</label>
                                <select
                                    value={quoteData.partnerId}
                                    onChange={(e) => setQuoteData({ ...quoteData, partnerId: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                >
                                    <option value="">اختر العميل...</option>
                                    {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem' }}>التاريخ</label>
                                    <input
                                        type="date"
                                        value={quoteData.date}
                                        onChange={(e) => setQuoteData({ ...quoteData, date: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem' }}>صالح حتى</label>
                                    <input
                                        type="date"
                                        value={quoteData.validUntil}
                                        onChange={(e) => setQuoteData({ ...quoteData, validUntil: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem' }}>ملاحظات</label>
                            <textarea
                                value={quoteData.notes}
                                onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', height: '80px', resize: 'none' }}
                                placeholder="شروط العرض، ملاحظات إضافية..."
                            />
                        </div>
                    </div>

                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#334155' }}>ملخص التكلفة</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#64748b' }}>
                            <span>المجموع الفرعي</span>
                            <span>{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#64748b' }}>
                            <span>الخصم</span>
                            <input
                                type="number"
                                value={quoteData.discount}
                                onChange={(e) => setQuoteData({ ...quoteData, discount: e.target.value })}
                                style={{ width: '80px', padding: '2px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#64748b' }}>
                            <span>الضريبة (15%)</span>
                            <span>{totals.tax.toFixed(2)}</span>
                        </div>
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', color: '#0f172a' }}>
                            <span>الإجمالي الكلي</span>
                            <span>{totals.total.toFixed(2)} ر.س</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '20px', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#334155' }}>الأصناف والخدمات</h3>
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '12px', textAlign: 'right', width: '30%' }}>الصنف / الخدمة</th>
                                    <th style={{ padding: '12px', textAlign: 'center', width: '15%' }}>الكمية</th>
                                    <th style={{ padding: '12px', textAlign: 'center', width: '20%' }}>السعر</th>
                                    <th style={{ padding: '12px', textAlign: 'center', width: '20%' }}>الإجمالي</th>
                                    <th style={{ padding: '12px', textAlign: 'center', width: '10%' }}>حذف</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quoteData.items.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '10px' }}>
                                            <select
                                                value={item.productId}
                                                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                            >
                                                <option value="">اختر المنتج...</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                style={{ width: '100%', padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                style={{ width: '100%', padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                                            {(item.quantity * item.unitPrice).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <button onClick={() => handleRemoveItem(index)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={handleAddItem} style={{ marginTop: '15px', background: 'transparent', border: '1px dashed #94a3b8', color: '#64748b', width: '100%', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Plus size={18} /> إضافة صنف جديد
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>عروض الأسعار</h2>
                    <p style={{ margin: 0, color: '#64748b' }}>إدارة وتقديم عروض الأسعار للعملاء والمشاريع</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px',
                        borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgb(37 99 235 / 0.3)'
                    }}
                    className="card-hover"
                >
                    <Plus size={20} /> عرض سعر جديد
                </button>
            </div>

            {quotesLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <Clock className="animate-spin" size={24} style={{ marginBottom: 10, display: 'block', margin: '0 auto' }} />
                    جاري التحميل...
                </div>
            ) : quotesError ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444', background: '#fef2f2', borderRadius: 12 }}>
                    <AlertOctagon size={24} style={{ marginBottom: 10, display: 'block', margin: '0 auto' }} />
                    خطأ في تحميل البيانات
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                    <div className="table-responsive" style={{ width: '100%' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>رقم العرض</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>العميل</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>التاريخ</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>الحالة</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>الإجمالي</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: '600', minWidth: '150px' }}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotes.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                                <FileText size={40} strokeWidth={1.5} color="#cbd5e1" />
                                                <p>لا توجد عروض أسعار حتى الآن.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    quotes.map(qt => {
                                        const style = getStatusStyle(qt.status);
                                        const isActionPending = statusMutation.isPending && statusMutation.variables?.id === qt.id;
                                        return (
                                            <tr key={qt.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s', opacity: isActionPending ? 0.6 : 1 }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                                                <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#0f172a' }}>{qt.quoteNumber}</td>
                                                <td style={{ padding: '16px 24px', color: '#334155' }}>{qt.partner?.name || '-'}</td>
                                                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.9rem' }}>{new Date(qt.date).toLocaleDateString('ar-SA')}</td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span style={{ background: style.bg, color: style.color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                        {style.label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 24px', color: '#0f172a', fontWeight: 'bold' }}>{qt.total.toFixed(2)} ر.س</td>
                                                <td style={{ padding: '16px 24px', textAlign: 'center', minWidth: '150px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', paddingLeft: '5px' }}>
                                                        <button disabled={isActionPending} onClick={() => statusMutation.mutate({ id: qt.id, status: 'ACCEPTED' })} title="قبول" style={{ background: '#ecfdf5', border: 'none', width: '30px', height: '30px', borderRadius: '8px', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><CheckCircle size={16} /></button>
                                                        <button disabled={isActionPending} onClick={() => statusMutation.mutate({ id: qt.id, status: 'REJECTED' })} title="رفض" style={{ background: '#fef2f2', border: 'none', width: '30px', height: '30px', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><XCircle size={16} /></button>
                                                        <button
                                                            onClick={() => handleEdit(qt)}
                                                            title="تعديل"
                                                            style={{ background: '#eff6ff', border: 'none', width: '30px', height: '30px', borderRadius: '8px', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(qt.id)}
                                                            title="حذف"
                                                            style={{ background: '#fff1f2', border: 'none', width: '30px', height: '30px', borderRadius: '8px', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => window.open(`/quotes/${qt.id}/print`, '_blank')}
                                                            title="طباعة"
                                                            style={{ background: '#f8fafc', border: 'none', width: '30px', height: '30px', borderRadius: '8px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                        >
                                                            <Printer size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuotesPage;
