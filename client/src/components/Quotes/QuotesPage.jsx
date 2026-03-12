import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Plus, Printer, Trash2, Edit, FileText, CheckCircle, XCircle, 
    Clock, AlertOctagon, ChevronLeft, Search, Calendar, Wallet, 
    CreditCard, ArrowLeft, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '@/config';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

const QuotesPage = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

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
            const res = await axios.get(`${API_URL}/quotes`, { headers: H() });
            return res.data;
        }
    });

    // Fetch Partners
    const { data: partners = [] } = useQuery({
        queryKey: ['partners'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/partners`, { headers: H() });
            return res.data;
        }
    });

    // Fetch Products
    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/products`, { headers: H() });
            return res.data;
        }
    });

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (isEditing) {
                return axios.put(`${API_URL}/quotes/${editingId}`, data, { headers: H() });
            }
            return axios.post(`${API_URL}/quotes`, data, { headers: H() });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
            handleResetForm();
        },
        onError: (err) => {
            alert('❌ فشل الحفظ: ' + (err.response?.data?.error || err.message));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`${API_URL}/quotes/${id}`, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
        },
        onError: (err) => {
            alert('❌ فشل الحذف: ' + (err.response?.data?.error || err.message));
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => axios.patch(`${API_URL}/quotes/${id}/status`, { status }, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
        },
        onError: (err) => {
            alert('❌ فشل تحديث الحالة');
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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'ACCEPTED': return { label: 'مقبول', class: 'status-paid' };
            case 'REJECTED': return { label: 'مرفوض', class: 'status-cancelled' };
            case 'DRAFT': return { label: 'مسودة', class: 'status-pending' };
            case 'SENT': return { label: 'تم الإرسال', class: 'status-shipped' };
            default: return { label: status, class: '' };
        }
    };

    const filteredQuotes = quotes.filter(q => 
        q.quoteNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.partner?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (showForm) {
        const totals = calculateTotals();
        return (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="fade-in" style={{ paddingBottom: '50px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <motion.button whileHover={{ x: -10 }} onClick={handleResetForm} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '10px', borderRadius: '50%', color: '#fff', cursor: 'pointer' }}><ChevronLeft size={24} /></motion.button>
                        <h2 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', fontWeight: '900' }} className="gradient-text">{isEditing ? 'تعديل عرض السعر' : 'إنشاء عرض سعر جديد'}</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={handleResetForm} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 25px', borderRadius: '15px', color: '#a1a1aa', fontWeight: '800', cursor: 'pointer', fontFamily: 'Cairo' }}>إلغاء</button>
                        <motion.button {...buttonClick} onClick={handleSubmit} disabled={saveMutation.isPending} 
                            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', border: 'none', padding: '12px 35px', borderRadius: '15px', color: 'white', fontWeight: '800', cursor: 'pointer', fontFamily: 'Cairo', boxShadow: '0 10px 20px -10px rgba(99, 102, 241, 0.4)' }}>
                            {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ عرض السعر'}
                        </motion.button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '25px' }}>
                    <div className="glass-card" style={{ padding: '30px', borderRadius: '28px' }}>
                        <h3 style={{ margin: '0 0 25px 0', fontSize: '1.2rem', color: '#fff', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={20} color="#6366f1" /> التفاصيل الأساسية</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontSize: '0.9rem', fontWeight: '600' }}>العميل المستهدف</label>
                                <select value={quoteData.partnerId} onChange={(e) => setQuoteData({ ...quoteData, partnerId: e.target.value })} className="premium-input" style={{ width: '100%' }}>
                                    <option value="">اختر العميل...</option>
                                    {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontSize: '0.9rem', fontWeight: '600' }}>التاريخ</label>
                                    <input type="date" value={quoteData.date} onChange={(e) => setQuoteData({ ...quoteData, date: e.target.value })} className="premium-input" style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontSize: '0.9rem', fontWeight: '600' }}>صالح حتى</label>
                                    <input type="date" value={quoteData.validUntil} onChange={(e) => setQuoteData({ ...quoteData, validUntil: e.target.value })} className="premium-input" style={{ width: '100%' }} />
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontSize: '0.9rem', fontWeight: '600' }}>ملاحظات العرض</label>
                            <textarea value={quoteData.notes} onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })} className="premium-input" style={{ width: '100%', height: '100px', resize: 'none' }} placeholder="أدخل أي شروط أو ملاحظات خاصة بهذا العرض..." />
                        </div>

                        <div style={{ marginTop: '35px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: '800' }}>الأصناف والخدمات</h3>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddItem} style={{ background: 'rgba(99,102,241,0.1)', border: '1px dashed #6366f1', color: '#818cf8', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Cairo' }}>
                                    <Plus size={18} /> إضافة صنف
                                </motion.button>
                            </div>
                            <div className="glass-card" style={{ padding: 0, borderRadius: '20px', overflow: 'hidden' }}>
                                <table className="table-glass" style={{ margin: 0 }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'right', width: '40%' }}>الصنف</th>
                                            <th style={{ textAlign: 'center' }}>الكمية</th>
                                            <th style={{ textAlign: 'center' }}>السعر</th>
                                            <th style={{ textAlign: 'center' }}>الإجمالي</th>
                                            <th style={{ textAlign: 'center', width: '60px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quoteData.items.map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ padding: '10px' }}>
                                                    <select value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} className="premium-input" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: 'none' }}>
                                                        <option value="">اختر المنتج...</option>
                                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="premium-input" style={{ width: '80px', textAlign: 'center', margin: '0 auto', display: 'block', background: 'rgba(255,255,255,0.03)', border: 'none' }} />
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    <input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className="premium-input" style={{ width: '100px', textAlign: 'center', margin: '0 auto', display: 'block', background: 'rgba(255,255,255,0.03)', border: 'none' }} />
                                                </td>
                                                <td style={{ padding: '10px', textAlign: 'center', color: '#fff', fontWeight: '800' }}>{(item.quantity * item.unitPrice).toLocaleString()} ر.س</td>
                                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                                    <button onClick={() => handleRemoveItem(index)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        <div className="glass-card" style={{ padding: '25px', borderRadius: '28px' }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#fff', fontWeight: '800' }}>ملخص العرض</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', fontWeight: '600' }}>
                                    <span>المجموع الفرعي</span>
                                    <span style={{ color: '#fff' }}>{totals.subtotal.toLocaleString()} ر.س</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a1a1aa', fontWeight: '600' }}>
                                    <span>الخصم</span>
                                    <input type="number" value={quoteData.discount} onChange={(e) => setQuoteData({ ...quoteData, discount: e.target.value })} className="premium-input" style={{ width: '90px', textAlign: 'center', padding: '5px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', fontWeight: '600' }}>
                                    <span>الضريبة (15%)</span>
                                    <span style={{ color: '#fff' }}>{totals.tax.toLocaleString()} ر.س</span>
                                </div>
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <span style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem' }}>الإجمالي الكلي</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ color: '#4ade80', fontSize: '1.8rem', fontWeight: '900' }}>{totals.total.toLocaleString()}</div>
                                        <div style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: '800', textAlign: 'left' }}>ريال سعودي</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="glass-card" style={{ padding: '25px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(99,102,241,0.02))' }}>
                            <h4 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '800' }}>معاينة سريعة</h4>
                            <p style={{ color: '#a1a1aa', fontSize: '0.85rem', lineHeight: '1.6' }}>سيتم إنشاء عرض السعر بصيغة احترافية جاهزة للطباعة والإرسال المباشر للعميل.</p>
                            <div style={{ marginTop: '15px', color: '#6366f1', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}><Send size={14} /> سيتم حفظ العرض كمسودة حتى تقوم بتعميده.</div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="fade-in">
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                <div>
                    <h2 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '2.2rem', fontWeight: '900' }} className="gradient-text">عروض الأسعار</h2>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '1rem', fontWeight: '500' }}>تتبع العروض المقدمة، قم بتحويلها إلى فواتير، ونمو مبيعاتك.</p>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }} 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => setShowForm(true)}
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '14px 30px', borderRadius: '18px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem' }}
                >
                    <Plus size={22} /> إنشاء عرض سعر
                </motion.button>
            </div>

            {/* Filters Area */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={20} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                    <input 
                        placeholder="ابحث برقم العرض أو اسم العميل..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="premium-input" 
                        style={{ width: '100%', paddingRight: '45px', border: 'none' }} 
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="premium-input" style={{ border: 'none', padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa' }}><Calendar size={18} /> تصفية بالتاريخ</button>
                    <button className="premium-input" style={{ border: 'none', padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa' }}><Clock size={18} /> الحالة</button>
                </div>
            </div>

            {quotesLoading ? (
                <div style={{ textAlign: 'center', padding: '80px', color: '#a1a1aa' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ marginBottom: 15 }}><Clock size={32} /></motion.div>
                    <div style={{ fontWeight: '800' }}>جاري استرجاع عروض الأسعار...</div>
                </div>
            ) : quotesError ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 28, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                    <AlertOctagon size={40} style={{ marginBottom: 15 }} />
                    <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>عذراً، حدث خطأ أثناء تحميل البيانات</div>
                    <p style={{ opacity: 0.7 }}>يرجى إعادة المحاولة لاحقاً</p>
                </div>
            ) : (
                <div className="glass-card" style={{ padding: 0, borderRadius: '28px', overflow: 'hidden' }}>
                    <div className="table-responsive">
                        <table className="table-glass" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'right', padding: '20px 25px' }}>رقم العرض</th>
                                    <th style={{ textAlign: 'right' }}>العميل</th>
                                    <th style={{ textAlign: 'center' }}>التاريخ</th>
                                    <th style={{ textAlign: 'center' }}>الحالة</th>
                                    <th style={{ textAlign: 'center' }}>الإجمالي</th>
                                    <th style={{ textAlign: 'center', minWidth: '180px' }}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody style={{ fontSize: '0.95rem' }}>
                                {filteredQuotes.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '80px', textAlign: 'center', color: '#52525b' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={40} color="#3f3f46" /></div>
                                                <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>لا توجد نتائج مطابقة</div>
                                                <p style={{ margin: 0, opacity: 0.6 }}>ابدأ بإنشاء أول عرض سعر اليوم</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredQuotes.map((qt, idx) => {
                                        const status = getStatusStyle(qt.status);
                                        const isActionPending = statusMutation.isPending && statusMutation.variables?.id === qt.id;
                                        return (
                                            <motion.tr key={qt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} style={{ opacity: isActionPending ? 0.6 : 1 }}>
                                                <td style={{ padding: '20px 25px', fontWeight: '900', color: '#fff' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />
                                                        {qt.quoteNumber}
                                                    </div>
                                                </td>
                                                <td style={{ color: '#fff', fontWeight: '700' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}><Plus size={14} /></div>
                                                        {qt.partner?.name || 'عميل نقدي'}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center', color: '#a1a1aa', fontWeight: '600' }}>{new Date(qt.date).toLocaleDateString('ar-SA')}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className={`status-pill ${status.class}`}>{status.label}</span>
                                                </td>
                                                <td style={{ textAlign: 'center', color: '#4ade80', fontWeight: '900', fontSize: '1.1rem' }}>{qt.total.toLocaleString()} ر.س</td>
                                                <td style={{ padding: '20px 25px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                        <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(16, 185, 129, 0.2)' }} onClick={() => statusMutation.mutate({ id: qt.id, status: 'ACCEPTED' })} title="قبول" style={{ background: 'rgba(16, 185, 129, 0.1)', border: 'none', width: '36px', height: '36px', borderRadius: '10px', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><CheckCircle size={18} /></motion.button>
                                                        <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => statusMutation.mutate({ id: qt.id, status: 'REJECTED' })} title="رفض" style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', width: '36px', height: '36px', borderRadius: '10px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><XCircle size={18} /></motion.button>
                                                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 5px' }} />
                                                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEdit(qt)} title="تعديل" style={{ background: 'rgba(99, 102, 241, 0.1)', border: 'none', width: '36px', height: '36px', borderRadius: '10px', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit size={18} /></motion.button>
                                                         <motion.button whileHover={{ scale: 1.1 }} onClick={() => { if(confirm('هل أنت متأكد من حذف عرض السعر؟')) deleteMutation.mutate(qt.id); }} title="حذف" style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', width: '36px', height: '36px', borderRadius: '10px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={18} /></motion.button>
                                                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => window.open(`${API_URL}/reports/quote/${qt.id}`, '_blank')} title="طباعة" style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', width: '36px', height: '36px', borderRadius: '10px', color: '#a1a1aa', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Printer size={18} /></motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
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
