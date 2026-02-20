import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus, Search, AlertTriangle, TrendingUp, Package, Edit, Trash2, X,
    ArrowUpCircle, ArrowDownCircle, Layers, Tag, ChevronDown, Settings2
} from 'lucide-react';
import API_URL from '../../config';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const CATEGORY_COLORS = [
    '#2563eb', '#7c3aed', '#db2777', '#dc2626', '#d97706',
    '#16a34a', '#0891b2', '#9333ea', '#c2410c', '#0f766e',
    '#1d4ed8', '#be185d', '#b45309', '#15803d', '#0e7490'
];

const categoryColor = (name = '') => CATEGORY_COLORS[name.charCodeAt(0) % CATEGORY_COLORS.length];

// ===== Modal Wrapper =====
const Modal = ({ title, onClose, children }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
        <div style={{ background: 'white', borderRadius: '20px', width: '500px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '24px 28px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontWeight: '700', color: '#0f172a', fontSize: '1.1rem' }}>{title}</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px 28px' }}>{children}</div>
        </div>
    </div>
);

const Field = ({ label, children }) => (
    <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '7px', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>{label}</label>
        {children}
    </div>
);

const Input = (props) => (
    <input {...props} style={{
        width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
        fontFamily: 'Cairo', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
        transition: 'border 0.2s', direction: 'rtl', ...props.style
    }}
        onFocus={e => e.target.style.borderColor = '#2563eb'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
    />
);

export default function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [showProductForm, setShowProductForm] = useState(false);
    const [showAdjust, setShowAdjust] = useState(false);
    const [showCatForm, setShowCatForm] = useState(false);
    const [showCatManager, setShowCatManager] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [adjustData, setAdjustData] = useState({ quantity: 1, type: 'ADD' });
    const [errorMsg, setErrorMsg] = useState('');

    const [productForm, setProductForm] = useState({ name: '', price: '', cost: '', quantity: 0, categoryId: '' });
    const [catForm, setCatForm] = useState({ name: '', description: '' });

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [prod, cats] = await Promise.all([
                axios.get(`${API_URL}/products`, { headers: authHeaders() }),
                axios.get(`${API_URL}/categories`, { headers: authHeaders() })
            ]);
            setProducts(prod.data || []);
            setCategories(cats.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // ===== Products CRUD =====
    const openProductForm = (product = null) => {
        if (product) {
            setProductForm({ name: product.name, price: product.price, cost: product.cost, quantity: product.stocks?.[0]?.quantity || 0, categoryId: product.categoryId || '' });
            setSelectedProduct(product);
            setIsEdit(true);
        } else {
            setProductForm({ name: '', price: '', cost: '', quantity: 0, categoryId: '' });
            setIsEdit(false);
            setSelectedProduct(null);
        }
        setErrorMsg('');
        setShowProductForm(true);
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await axios.put(`${API_URL}/products/${selectedProduct.id}`, productForm, { headers: authHeaders() });
            } else {
                await axios.post(`${API_URL}/products`, productForm, { headers: authHeaders() });
            }
            fetchAll();
            setShowProductForm(false);
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'فشل في حفظ المنتج');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
        try {
            await axios.delete(`${API_URL}/products/${id}`, { headers: authHeaders() });
            fetchAll();
        } catch { alert('فشل الحذف'); }
    };

    const handleAdjust = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/products/${selectedProduct.id}/adjust`, adjustData, { headers: authHeaders() });
            fetchAll();
            setShowAdjust(false);
        } catch { alert('فشل تعديل المخزون'); }
    };

    // ===== Categories CRUD =====
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!catForm.name.trim()) return;
        try {
            await axios.post(`${API_URL}/categories`, catForm, { headers: authHeaders() });
            fetchAll();
            setCatForm({ name: '', description: '' });
            setShowCatForm(false);
        } catch (err) {
            alert(err.response?.data?.error || 'فشل في إضافة القسم');
        }
    };

    const handleDeleteCat = async (id) => {
        if (!window.confirm('حذف هذا القسم؟ المنتجات المرتبطة ستبقى بدون قسم.')) return;
        try {
            await axios.delete(`${API_URL}/categories/${id}`, { headers: authHeaders() });
            if (activeCategory === id) setActiveCategory('all');
            fetchAll();
        } catch { alert('فشل الحذف'); }
    };

    // ===== Filtering =====
    const filtered = products.filter(p => {
        const matchCat = activeCategory === 'all' || p.categoryId === activeCategory;
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCat && matchSearch;
    });

    const totalValue = products.reduce((s, p) => s + (p.cost * (p.stocks?.[0]?.quantity || 0)), 0);
    const lowStock = products.filter(p => (p.stocks?.[0]?.quantity || 0) < 10).length;
    const noStock = products.filter(p => (p.stocks?.[0]?.quantity || 0) === 0).length;

    const getQty = (p) => p.stocks?.[0]?.quantity || 0;
    const stockStatus = (qty) => {
        if (qty === 0) return { label: 'نفد', color: '#ef4444', bg: '#fef2f2' };
        if (qty < 10) return { label: 'منخفض', color: '#f59e0b', bg: '#fffbeb' };
        return { label: 'متوفر', color: '#10b981', bg: '#ecfdf5' };
    };

    return (
        <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl', display: 'flex', gap: '24px' }}>

            {/* ===== Sidebar: Categories ===== */}
            <div style={{ width: '220px', flexShrink: 0 }}>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>الأقسام</span>
                        <button onClick={() => setShowCatManager(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }} title="إدارة الأقسام">
                            <Settings2 size={15} />
                        </button>
                    </div>

                    {/* All */}
                    <div onClick={() => setActiveCategory('all')} style={{
                        padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', marginBottom: '4px',
                        background: activeCategory === 'all' ? '#eff6ff' : 'transparent',
                        color: activeCategory === 'all' ? '#2563eb' : '#374151',
                        fontWeight: activeCategory === 'all' ? '700' : '500',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontSize: '0.85rem', transition: 'all 0.15s'
                    }}>
                        <span>🏠 الكل</span>
                        <span style={{ background: '#e2e8f0', borderRadius: '10px', padding: '1px 8px', fontSize: '0.75rem', color: '#64748b' }}>{products.length}</span>
                    </div>

                    {/* Categories */}
                    {categories.map(cat => {
                        const color = categoryColor(cat.name);
                        const count = products.filter(p => p.categoryId === cat.id).length;
                        const isActive = activeCategory === cat.id;
                        return (
                            <div key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                                padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', marginBottom: '4px',
                                background: isActive ? `${color}15` : 'transparent',
                                color: isActive ? color : '#374151',
                                fontWeight: isActive ? '700' : '400',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                fontSize: '0.85rem', transition: 'all 0.15s'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                                    {cat.name}
                                </span>
                                <span style={{ background: isActive ? `${color}25` : '#f1f5f9', borderRadius: '10px', padding: '1px 8px', fontSize: '0.72rem', color: isActive ? color : '#94a3b8' }}>{count}</span>
                            </div>
                        );
                    })}

                    <button onClick={() => setShowCatForm(true)} style={{
                        width: '100%', marginTop: '12px', padding: '9px', background: '#f8fafc', border: '1.5px dashed #cbd5e1',
                        borderRadius: '10px', cursor: 'pointer', color: '#64748b', fontFamily: 'Cairo', fontSize: '0.82rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.15s'
                    }}
                        onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                        onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
                    >
                        <Plus size={13} /> إضافة قسم
                    </button>
                </div>
            </div>

            {/* ===== Main Content ===== */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: '700' }}>
                            <Package size={20} style={{ marginLeft: '8px', verticalAlign: 'middle', color: '#2563eb' }} />
                            المخزون
                            {activeCategory !== 'all' && (
                                <span style={{ marginRight: '10px', fontSize: '0.85rem', color: '#64748b', fontWeight: '400' }}>
                                    ← {categories.find(c => c.id === activeCategory)?.name}
                                </span>
                            )}
                        </h2>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{filtered.length} منتج</p>
                    </div>
                    <button onClick={() => openProductForm()} style={{
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', border: 'none',
                        padding: '12px 22px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700',
                        display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Cairo',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.35)', fontSize: '0.9rem'
                    }}>
                        <Plus size={18} /> إضافة منتج
                    </button>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
                    {[
                        { label: 'إجمالي الأصناف', value: products.length, icon: <Package size={18} />, color: '#2563eb', bg: '#eff6ff' },
                        { label: 'قيمة المخزون', value: totalValue.toLocaleString() + ' ر.س', icon: <TrendingUp size={18} />, color: '#10b981', bg: '#ecfdf5' },
                        { label: 'مخزون منخفض', value: lowStock, icon: <AlertTriangle size={18} />, color: '#f59e0b', bg: '#fffbeb' },
                        { label: 'نفد المخزون', value: noStock, icon: <AlertTriangle size={18} />, color: '#ef4444', bg: '#fef2f2' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'white', padding: '16px 18px', borderRadius: '14px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '10px', background: s.bg, borderRadius: '10px', color: s.color }}>{s.icon}</div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>{s.label}</div>
                                <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#0f172a' }}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <Search size={18} color="#94a3b8" />
                    <input
                        type="text"
                        placeholder={`بحث في ${activeCategory === 'all' ? 'جميع المنتجات' : categories.find(c => c.id === activeCategory)?.name || 'المنتجات'}...`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', fontFamily: 'Cairo', color: '#334155', background: 'transparent' }}
                    />
                    {searchTerm && <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16} /></button>}
                </div>

                {/* Table */}
                <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Cairo' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                {['المنتج', 'القسم', 'الكمية', 'التكلفة', 'سعر البيع', 'الحالة', 'إجراء'].map(h => (
                                    <th key={h} style={{ padding: '13px 16px', textAlign: 'right', color: '#64748b', fontWeight: '700', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>⏳ جاري التحميل...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem' }}>
                                    <Package size={40} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                                    لا توجد منتجات
                                </td></tr>
                            ) : filtered.map(p => {
                                const qty = getQty(p);
                                const status = stockStatus(qty);
                                const catColor = p.category ? categoryColor(p.category.name) : '#94a3b8';
                                return (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}
                                        onMouseOver={e => e.currentTarget.style.background = '#fafbff'}
                                        onMouseOut={e => e.currentTarget.style.background = 'white'}
                                    >
                                        <td style={{ padding: '13px 16px', fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{p.name}</td>
                                        <td style={{ padding: '13px 16px' }}>
                                            {p.category ? (
                                                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', background: `${catColor}15`, color: catColor }}>
                                                    {p.category.name}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                                            <span style={{ padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', background: status.bg, color: status.color, fontSize: '0.9rem' }}>{qty}</span>
                                        </td>
                                        <td style={{ padding: '13px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>{p.cost.toLocaleString()} ر.س</td>
                                        <td style={{ padding: '13px 16px', textAlign: 'center', color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem' }}>{p.price.toLocaleString()} ر.س</td>
                                        <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                                            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', background: status.bg, color: status.color }}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '13px 16px' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                <button onClick={() => { setSelectedProduct(p); setAdjustData({ quantity: 1, type: 'ADD' }); setShowAdjust(true); }}
                                                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <ArrowUpCircle size={13} /> تعديل
                                                </button>
                                                <button onClick={() => openProductForm(p)}
                                                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #dbeafe', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <Edit size={13} /> تعديل البيانات
                                                </button>
                                                <button onClick={() => handleDelete(p.id)}
                                                    style={{ padding: '6px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===== Modal: Add/Edit Product ===== */}
            {showProductForm && (
                <Modal title={isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'} onClose={() => setShowProductForm(false)}>
                    {errorMsg && <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '600' }}>{errorMsg}</div>}
                    <form onSubmit={handleProductSubmit}>
                        <Field label="اسم المنتج">
                            <Input required value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} placeholder="مثال: أسمنت بورتلاندي - كيس 50 كجم" />
                        </Field>
                        <Field label="القسم">
                            <select value={productForm.categoryId} onChange={e => setProductForm(p => ({ ...p, categoryId: e.target.value }))}
                                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <option value="">— بدون قسم —</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </Field>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <Field label="التكلفة (ر.س)">
                                <Input required type="number" step="0.01" value={productForm.cost} onChange={e => setProductForm(p => ({ ...p, cost: e.target.value }))} placeholder="0.00" />
                            </Field>
                            <Field label="سعر البيع (ر.س)">
                                <Input required type="number" step="0.01" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} placeholder="0.00" />
                            </Field>
                        </div>
                        {!isEdit && (
                            <Field label="الكمية الأولية">
                                <Input type="number" value={productForm.quantity} onChange={e => setProductForm(p => ({ ...p, quantity: e.target.value }))} placeholder="0" />
                            </Field>
                        )}
                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                            <button type="button" onClick={() => setShowProductForm(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '600' }}>إلغاء</button>
                            <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '700' }}>
                                {isEdit ? 'حفظ التعديلات' : 'إضافة المنتج'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ===== Modal: Stock Adjustment ===== */}
            {showAdjust && selectedProduct && (
                <Modal title="تعديل الكمية" onClose={() => setShowAdjust(false)}>
                    <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.9rem' }}>
                        المنتج: <strong style={{ color: '#1e293b' }}>{selectedProduct.name}</strong><br />
                        الكمية الحالية: <strong style={{ color: '#2563eb' }}>{getQty(selectedProduct)}</strong>
                    </p>
                    <form onSubmit={handleAdjust}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                            {[['ADD', 'إضافة للمخزون', '#10b981', <ArrowUpCircle size={22} />], ['SUBTRACT', 'سحب من المخزون', '#ef4444', <ArrowDownCircle size={22} />]].map(([type, label, color, icon]) => (
                                <button key={type} type="button" onClick={() => setAdjustData(p => ({ ...p, type }))} style={{
                                    padding: '16px', borderRadius: '12px', border: `2px solid ${adjustData.type === type ? color : '#e2e8f0'}`,
                                    background: adjustData.type === type ? `${color}10` : 'white', cursor: 'pointer',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: adjustData.type === type ? color : '#94a3b8', transition: 'all 0.15s'
                                }}>
                                    {icon}
                                    <span style={{ fontWeight: '700', fontFamily: 'Cairo', fontSize: '0.85rem' }}>{label}</span>
                                </button>
                            ))}
                        </div>
                        <Field label="الكمية">
                            <Input required type="number" min="1" value={adjustData.quantity} onChange={e => setAdjustData(p => ({ ...p, quantity: e.target.value }))} style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold' }} />
                        </Field>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                            <button type="button" onClick={() => setShowAdjust(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '600' }}>إلغاء</button>
                            <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '700' }}>تحديث المخزون</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ===== Modal: Add Category ===== */}
            {showCatForm && (
                <Modal title="إضافة قسم جديد" onClose={() => setShowCatForm(false)}>
                    <form onSubmit={handleAddCategory}>
                        <Field label="اسم القسم">
                            <Input required value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} placeholder="مثال: الديكور" />
                        </Field>
                        <Field label="الوصف (اختياري)">
                            <Input value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} placeholder="وصف مختصر للقسم" />
                        </Field>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" onClick={() => setShowCatForm(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontFamily: 'Cairo' }}>إلغاء</button>
                            <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '700' }}>إضافة القسم</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ===== Modal: Manage Categories ===== */}
            {showCatManager && (
                <Modal title="إدارة الأقسام" onClose={() => setShowCatManager(false)}>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {categories.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>لا توجد أقسام</div>
                        ) : categories.map(cat => {
                            const color = categoryColor(cat.name);
                            const count = products.filter(p => p.categoryId === cat.id).length;
                            return (
                                <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Tag size={15} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{cat.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{count} منتج • {cat.description || '—'}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteCat(cat.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Cairo' }}>
                                        <Trash2 size={13} /> حذف
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <button onClick={() => { setShowCatManager(false); setShowCatForm(true); }} style={{ width: '100%', marginTop: '16px', padding: '11px', background: '#eff6ff', color: '#2563eb', border: '1.5px dashed #2563eb', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Plus size={15} /> إضافة قسم جديد
                    </button>
                </Modal>
            )}
        </div>
    );
}
