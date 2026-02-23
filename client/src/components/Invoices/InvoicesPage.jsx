import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Printer, Trash2, Edit, FileText } from 'lucide-react';
import API_URL from '../../config';

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [partners, setPartners] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [invoiceData, setInvoiceData] = useState({
        partnerId: '',
        date: new Date().toISOString().split('T')[0],
        type: 'SALES_TAX',
        discount: 0,
        items: [{ productId: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]
    });

    useEffect(() => {
        fetchInvoices();
        fetchMasterData();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await axios.get(`${API_URL}/invoices`);
            setInvoices(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching invoices', err);
        }
    };

    const fetchMasterData = async () => {
        try {
            const [pRes, prodRes] = await Promise.all([
                axios.get(`${API_URL}/partners`),
                axios.get(`${API_URL}/products`)
            ]);
            setPartners(pRes.data);
            setProducts(prodRes.data);
        } catch (err) {
            console.error('Error fetching master data', err);
        }
    };

    // --- Form Handlers ---
    const handleResetForm = () => {
        setInvoiceData({
            partnerId: '',
            date: new Date().toISOString().split('T')[0],
            type: 'SALES_TAX',
            discount: 0,
            items: [{ productId: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]
        });
        setShowForm(false);
    };

    const handleAddItem = () => {
        setInvoiceData({
            ...invoiceData,
            items: [...invoiceData.items, { productId: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = invoiceData.items.filter((_, i) => i !== index);
        setInvoiceData({ ...invoiceData, items: newItems });
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

        // Recalculate Line Total
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Sending Invoice Data:', invoiceData);
            const response = await axios.post(`${API_URL}/invoices`, invoiceData);
            console.log('Response:', response.data);
            fetchInvoices();
            handleResetForm();
            alert('✅ تم حفظ الفاتورة بنجاح');
        } catch (err) {
            console.error('Submit Error:', err.response?.data || err.message);
            const errorMsg = err.response?.data?.error || err.response?.data?.details || err.message;
            alert(`❌ فشل حفظ الفاتورة: ${errorMsg}`);
        }
    };

    const openPrint = (id) => {
        window.open(`/invoices/${id}/print`, '_blank');
    };

    // --- Render ---

    if (showForm) {
        const totals = calculateTotals();
        return (
            <div className="fade-in" style={{ paddingBottom: '50px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>إنشاء فاتورة جديدة</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleResetForm} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>إلغاء</button>
                        <button onClick={handleSubmit} style={{ background: '#2563eb', border: 'none', padding: '10px 30px', borderRadius: '8px', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}>حفظ الفاتورة</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                    {/* Main Info */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#334155' }}>بيانات الفاتورة</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem' }}>العميل</label>
                                <select
                                    value={invoiceData.partnerId}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, partnerId: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                >
                                    <option value="">اختر العميل...</option>
                                    {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem' }}>التاريخ</label>
                                <input
                                    type="date"
                                    value={invoiceData.date}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#334155' }}>ملخص الفاتورة</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#64748b' }}>
                            <span>المجموع الفرعي</span>
                            <span>{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#64748b' }}>
                            <span>الخصم</span>
                            <input
                                type="number"
                                value={invoiceData.discount}
                                onChange={(e) => setInvoiceData({ ...invoiceData, discount: e.target.value })}
                                style={{ width: '80px', padding: '2px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#64748b' }}>
                            <span>الضريبة (15%)</span>
                            <span>{totals.tax.toFixed(2)}</span>
                        </div>
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', color: '#0f172a' }}>
                            <span>الإجمالي</span>
                            <span>{totals.total.toFixed(2)} ر.س</span>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div style={{ marginTop: '20px', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#334155' }}>الأصناف</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'right', width: '30%' }}>المنتج</th>
                                <th style={{ padding: '12px', textAlign: 'center', width: '15%' }}>الكمية</th>
                                <th style={{ padding: '12px', textAlign: 'center', width: '20%' }}>السعر</th>
                                <th style={{ padding: '12px', textAlign: 'center', width: '20%' }}>الإجمالي</th>
                                <th style={{ padding: '12px', textAlign: 'center', width: '10%' }}>حذف</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px' }}>
                                        <select
                                            value={item.productId}
                                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                            style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                        >
                                            <option value="">اختر...</option>
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
                    <button onClick={handleAddItem} style={{ marginTop: '15px', background: 'transparent', border: '1px dashed #94a3b8', color: '#64748b', width: '100%', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Plus size={18} /> إضافة صنف جديد
                    </button>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>المبيعات والفواتير</h2>
                    <p style={{ margin: 0, color: '#64748b' }}>إدارة فواتير المبيعات الضريبية والعملاء</p>
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
                    <Plus size={20} /> إضافة فاتورة
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>جاري تحميل الفواتير...</div>
            ) : (
                <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', border: '1px solid #f1f5f9' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>رقم الفاتورة</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>العميل</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>التاريخ</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>الحالة</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>الإجمالي</th>
                                <th style={{ padding: '16px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                            <FileText size={40} strokeWidth={1.5} color="#cbd5e1" />
                                            <p>لا توجد فواتير حتى الآن. ابدأ بإنشاء فاتورة جديدة.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                invoices.map(inv => (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                                        <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#0f172a' }}>{inv.invoiceNumber}</td>
                                        <td style={{ padding: '16px 24px', color: '#334155' }}>{inv.partner?.name || '-'}</td>
                                        <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.9rem' }}>{new Date(inv.date).toLocaleDateString('ar-SA')}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ background: '#ecfdf5', color: '#10b981', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>مدفوعة</span>
                                        </td>
                                        <td style={{ padding: '16px 24px', color: '#0f172a', fontWeight: 'bold' }}>{inv.total.toFixed(2)} ر.س</td>
                                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                <button onClick={() => openPrint(inv.id)} title="طباعة" style={{ background: '#eff6ff', border: 'none', width: '32px', height: '32px', borderRadius: '8px', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Printer size={16} /></button>
                                                <button title="تعديل" style={{ background: '#f8fafc', border: 'none', width: '32px', height: '32px', borderRadius: '8px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InvoicesPage;
