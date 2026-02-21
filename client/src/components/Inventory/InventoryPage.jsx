import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
    Plus, Search, AlertTriangle, TrendingUp, Package, Edit3, Trash2, X,
    ChevronRight, Settings2, Tag, Save, RotateCcw, Minus, RefreshCw,
    ArrowUp, ArrowDown, BarChart3, Eye, CheckCircle2
} from 'lucide-react';
import API_URL from '../../config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const CAT_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#dc2626', '#d97706', '#16a34a', '#0891b2', '#9333ea', '#c2410c', '#0f766e', '#1d4ed8', '#be185d', '#b45309', '#15803d'];
const catColor = (name = '') => CAT_COLORS[name.charCodeAt(0) % CAT_COLORS.length];

/* ── Inline number input that saves on Enter/blur ── */
function InlineQty({ product, onSave }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState('');
    const inputRef = useRef();
    const qty = product.stocks?.[0]?.quantity ?? 0;

    const start = () => { setVal(qty); setEditing(true); setTimeout(() => inputRef.current?.select(), 0); };
    const cancel = () => setEditing(false);
    const save = async () => {
        if (val === '' || isNaN(val)) { cancel(); return; }
        await onSave(product.id, parseInt(val));
        setEditing(false);
    };

    if (editing) return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
                ref={inputRef}
                type="number"
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
                onBlur={save}
                style={{ width: '70px', padding: '4px 8px', border: '2px solid #2563eb', borderRadius: '8px', fontFamily: 'Cairo', fontSize: '0.9rem', textAlign: 'center', outline: 'none' }}
            />
            <button onClick={save} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', padding: '2px' }}><CheckCircle2 size={16} /></button>
            <button onClick={cancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}><X size={16} /></button>
        </div>
    );

    const st = qty === 0 ? { bg: '#fef2f2', color: '#ef4444', border: '#fee2e2' }
        : qty < 10 ? { bg: '#fffbeb', color: '#d97706', border: '#fde68a' }
            : { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };

    return (
        <div onClick={start} title="انقر لتعديل الكمية" style={{ cursor: 'text', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ padding: '4px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '0.95rem', background: st.bg, color: st.color, border: `1.5px solid ${st.border}`, transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                {qty}
            </span>
            <Edit3 size={12} color="#94a3b8" />
        </div>
    );
}

/* ── Quick ±1 buttons ── */
function QuickAdjust({ product, onAdjust }) {
    const qty = product.stocks?.[0]?.quantity ?? 0;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button onClick={() => onAdjust(product.id, 'SUBTRACT', 1)} disabled={qty === 0}
                style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #fee2e2', background: qty === 0 ? '#f8fafc' : '#fef2f2', color: qty === 0 ? '#cbd5e1' : '#ef4444', cursor: qty === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}>
                <Minus size={13} />
            </button>
            <button onClick={() => onAdjust(product.id, 'ADD', 1)}
                style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                <Plus size={13} />
            </button>
        </div>
    );
}

/* ── Modal wrapper ── */
const Modal = ({ title, icon, onClose, children, width = 480 }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
        <div style={{ background: 'white', borderRadius: '20px', width: `${width}px`, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '22px 26px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #f8fafc, white)', borderRadius: '20px 20px 0 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', color: '#0f172a', fontSize: '1rem' }}>
                    {icon && <span style={{ color: '#2563eb' }}>{icon}</span>}
                    {title}
                </div>
                <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', borderRadius: '8px', padding: '6px', display: 'flex' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '22px 26px' }}>{children}</div>
        </div>
    </div>
);

const Inp = ({ label, ...p }) => (
    <div style={{ marginBottom: '14px' }}>
        {label && <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.82rem', color: '#374151' }}>{label}</label>}
        <input {...p} style={{ width: '100%', padding: '10px 13px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', direction: 'rtl', transition: 'border 0.2s', ...p.style }}
            onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
    </div>
);

/* ══════════════════════════════════════════════ */
export default function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // productId being saved
    const [activeCategory, setActiveCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name'); // name | qty | price
    const [sortDir, setSortDir] = useState('asc');

    // Modals
    const [modal, setModal] = useState(null); // 'add-product' | 'add-cat' | 'manage-cats' | 'bulk-adjust' | 'product-detail'
    const [selected, setSelected] = useState(null);
    const [productForm, setProductForm] = useState({ name: '', cost: '', price: '', quantity: 0, categoryId: '' });
    const [catForm, setCatForm] = useState({ name: '', description: '' });
    const [adjustForm, setAdjustForm] = useState({ quantity: 1, type: 'ADD' });
    const [err, setErr] = useState('');

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        setLoading(true);
        try { const r = await axios.get(`${API_URL}/products`, { headers: H() }); setProducts(r.data || []); } catch { setProducts([]); }
        try { const r = await axios.get(`${API_URL}/categories`, { headers: H() }); setCategories(r.data || []); } catch { setCategories([]); }
        setLoading(false);
    };

    /* ── Actions ── */
    const setQty = useCallback(async (id, qty) => {
        setSaving(id);
        try { await axios.put(`${API_URL}/products/${id}/stock`, { quantity: qty }, { headers: H() }); await loadAll(); }
        catch { alert('فشل التحديث'); }
        finally { setSaving(null); }
    }, []);

    const quickAdjust = useCallback(async (id, type, qty) => {
        setSaving(id);
        try { await axios.post(`${API_URL}/products/${id}/adjust`, { quantity: qty, type }, { headers: H() }); await loadAll(); }
        catch { alert('فشل التحديث'); }
        finally { setSaving(null); }
    }, []);

    const saveProduct = async (e) => {
        e.preventDefault(); setErr('');
        try {
            if (modal === 'edit-product') {
                await axios.put(`${API_URL}/products/${selected.id}`, productForm, { headers: H() });
            } else {
                await axios.post(`${API_URL}/products`, productForm, { headers: H() });
            }
            loadAll(); setModal(null);
        } catch (ex) { setErr(ex.response?.data?.error || 'فشل الحفظ'); }
    };

    const deleteProduct = async (id) => {
        if (!confirm('حذف هذا المنتج؟')) return;
        try { await axios.delete(`${API_URL}/products/${id}`, { headers: H() }); loadAll(); }
        catch { alert('فشل الحذف'); }
    };

    const saveCat = async (e) => {
        e.preventDefault();
        try { await axios.post(`${API_URL}/categories`, catForm, { headers: H() }); loadAll(); setModal(null); setCatForm({ name: '', description: '' }); }
        catch (ex) { alert(ex.response?.data?.error || 'فشل إضافة القسم'); }
    };

    const deleteCat = async (id) => {
        if (!confirm('حذف هذا القسم؟ المنتجات ستبقى بدون قسم.')) return;
        try { await axios.delete(`${API_URL}/categories/${id}`, { headers: H() }); if (activeCategory === id) setActiveCategory('all'); loadAll(); }
        catch { alert('فشل الحذف'); }
    };

    const bulkAdjust = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/products/${selected.id}/adjust`, adjustForm, { headers: H() });
            loadAll(); setModal(null);
        } catch { alert('فشل التعديل'); }
    };

    /* ── Computed ── */
    const toggleSort = (field) => { if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(field); setSortDir('asc'); } };

    const filtered = products
        .filter(p => (activeCategory === 'all' || p.categoryId === activeCategory))
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            let va, vb;
            if (sortBy === 'name') { va = a.name; vb = b.name; }
            else if (sortBy === 'qty') { va = a.stocks?.[0]?.quantity ?? 0; vb = b.stocks?.[0]?.quantity ?? 0; }
            else { va = a.price; vb = b.price; }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

    const totalVal = products.reduce((s, p) => s + (p.cost * (p.stocks?.[0]?.quantity ?? 0)), 0);
    const catCount = id => products.filter(p => p.categoryId === id).length;
    const lowCount = products.filter(p => (p.stocks?.[0]?.quantity ?? 0) < 10 && (p.stocks?.[0]?.quantity ?? 0) > 0).length;
    const zeroCount = products.filter(p => (p.stocks?.[0]?.quantity ?? 0) === 0).length;

    const SortIcon = ({ field }) => sortBy === field
        ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)
        : null;

    /* ═══════════════ RENDER ═══════════════ */
    return (
        <div style={{ display: 'flex', gap: '20px', fontFamily: 'Cairo, sans-serif', direction: 'rtl', minHeight: 'calc(100vh - 80px)' }}>

            {/* ════ SIDEBAR ════ */}
            <aside style={{ width: '215px', flexShrink: 0 }}>
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>

                    {/* Header */}
                    <div style={{ padding: '16px 16px 12px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Tag size={14} /> الأقسام
                            </span>
                            <button onClick={() => setModal('manage-cats')} title="إدارة الأقسام" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                                <Settings2 size={13} />
                            </button>
                        </div>
                    </div>

                    {/* All */}
                    <div style={{ padding: '8px' }}>
                        <CatItem label="🏠 جميع المنتجات" count={products.length} active={activeCategory === 'all'} color="#2563eb" onClick={() => setActiveCategory('all')} />

                        {/* Per category */}
                        {categories.length > 0 && (
                            <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '6px', paddingTop: '6px' }}>
                                {categories.map(c => (
                                    <CatItem key={c.id} label={c.name} count={catCount(c.id)} active={activeCategory === c.id} color={catColor(c.name)} onClick={() => setActiveCategory(c.id)} />
                                ))}
                            </div>
                        )}

                        {/* Low stock section */}
                        {(lowCount > 0 || zeroCount > 0) && (
                            <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '6px', paddingTop: '6px' }}>
                                {zeroCount > 0 && <CatItem label="⛔ نفد المخزون" count={zeroCount} active={false} color="#ef4444"
                                    onClick={() => { setActiveCategory('all'); }} />}
                                {lowCount > 0 && <CatItem label="⚠️ منخفض الكمية" count={lowCount} active={false} color="#f59e0b"
                                    onClick={() => { setActiveCategory('all'); }} />}
                            </div>
                        )}

                        {/* Add category btn */}
                        <button onClick={() => setModal('add-cat')} style={{ width: '100%', marginTop: '10px', padding: '8px', background: 'transparent', border: '1.5px dashed #cbd5e1', borderRadius: '10px', cursor: 'pointer', color: '#64748b', fontFamily: 'Cairo', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'all 0.15s' }}
                            onMouseOver={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; }}>
                            <Plus size={12} /> إضافة قسم
                        </button>
                    </div>
                </div>

                {/* Mini stats */}
                <div style={{ marginTop: '14px', background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '10px', fontWeight: '600' }}>قيمة المخزون</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>{totalVal.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ريال سعودي</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <div style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '10px', background: '#fef2f2' }}>
                            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ef4444' }}>{zeroCount}</div>
                            <div style={{ fontSize: '0.68rem', color: '#ef4444' }}>نفد</div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '10px', background: '#fffbeb' }}>
                            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#d97706' }}>{lowCount}</div>
                            <div style={{ fontSize: '0.68rem', color: '#d97706' }}>منخفض</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ════ MAIN ════ */}
            <main style={{ flex: 1, minWidth: 0 }}>
                {/* Toolbar */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: 'white', borderRadius: '12px', padding: '10px 16px', border: '1px solid #f1f5f9', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                        <Search size={17} color="#94a3b8" />
                        <input type="text" placeholder={`بحث في ${activeCategory === 'all' ? 'جميع المنتجات' : (categories.find(c => c.id === activeCategory)?.name || '')} (${filtered.length} نتيجة)`}
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'Cairo', fontSize: '0.9rem', color: '#334155', background: 'transparent' }} />
                        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}><X size={15} /></button>}
                    </div>

                    <button onClick={loadAll} style={{ padding: '10px', borderRadius: '12px', border: '1px solid #f1f5f9', background: 'white', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontFamily: 'Cairo', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                        <RefreshCw size={15} /> تحديث
                    </button>

                    <button onClick={() => { setProductForm({ name: '', cost: '', price: '', quantity: 0, categoryId: activeCategory !== 'all' ? activeCategory : '' }); setErr(''); setModal('add-product'); }}
                        style={{ padding: '10px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 14px rgba(37,99,235,0.35)', fontSize: '0.9rem' }}>
                        <Plus size={17} /> إضافة منتج
                    </button>
                </div>

                {/* Table */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Cairo' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderBottom: '2px solid #e2e8f0' }}>
                                {[
                                    { label: 'المنتج', field: 'name', align: 'right' },
                                    { label: 'القسم', field: null, align: 'center' },
                                    { label: 'الكمية', field: 'qty', align: 'center' },
                                    { label: '±', field: null, align: 'center' },
                                    { label: 'التكلفة', field: null, align: 'center' },
                                    { label: 'سعر البيع', field: 'price', align: 'center' },
                                    { label: 'الحالة', field: null, align: 'center' },
                                    { label: 'إجراءات', field: null, align: 'center' },
                                ].map(({ label, field, align }) => (
                                    <th key={label} onClick={field ? () => toggleSort(field) : null}
                                        style={{ padding: '13px 14px', textAlign: align, color: '#475569', fontWeight: '700', fontSize: '0.8rem', cursor: field ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            {label} {field && <SortIcon field={field} />}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                    <RefreshCw size={30} style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 10px' }} />
                                    جاري التحميل...
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: '70px', textAlign: 'center', color: '#94a3b8' }}>
                                    <Package size={45} style={{ display: 'block', margin: '0 auto 14px', opacity: 0.25 }} />
                                    لا توجد منتجات
                                </td></tr>
                            ) : filtered.map(p => {
                                const qty = p.stocks?.[0]?.quantity ?? 0;
                                const isSaving = saving === p.id;
                                const catC = p.category ? catColor(p.category.name) : '#94a3b8';
                                const status = qty === 0 ? { label: 'نفد', bg: '#fef2f2', color: '#ef4444' }
                                    : qty < 10 ? { label: 'منخفض', bg: '#fffbeb', color: '#d97706' }
                                        : { label: 'متوفر', bg: '#f0fdf4', color: '#16a34a' };
                                return (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc', opacity: isSaving ? 0.6 : 1, transition: 'all 0.15s' }}
                                        onMouseOver={e => e.currentTarget.style.background = '#fafbff'}
                                        onMouseOut={e => e.currentTarget.style.background = ''}>
                                        {/* Name */}
                                        <td style={{ padding: '12px 14px' }}>
                                            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.88rem' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                                                قيمة: {(p.cost * qty).toLocaleString()} ر.س
                                            </div>
                                        </td>
                                        {/* Category */}
                                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                            {p.category ? (
                                                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700', background: `${catC}18`, color: catC, border: `1px solid ${catC}30` }}>
                                                    {p.category.name}
                                                </span>
                                            ) : <span style={{ color: '#e2e8f0', fontSize: '0.8rem' }}>—</span>}
                                        </td>
                                        {/* Qty inline */}
                                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                            <InlineQty product={p} onSave={setQty} />
                                        </td>
                                        {/* Quick ±1 */}
                                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                            <QuickAdjust product={p} onAdjust={quickAdjust} />
                                        </td>
                                        {/* Cost */}
                                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                                            {p.cost.toLocaleString()}
                                        </td>
                                        {/* Price */}
                                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#10b981', fontWeight: '700', fontSize: '0.92rem' }}>
                                            {p.price.toLocaleString()}
                                        </td>
                                        {/* Status */}
                                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: status.bg, color: status.color }}>
                                                {status.label}
                                            </span>
                                        </td>
                                        {/* Actions */}
                                        <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                <button title="تعديل الكمية بالجملة" onClick={() => { setSelected(p); setAdjustForm({ quantity: 1, type: 'ADD' }); setModal('bulk-adjust'); }}
                                                    style={actionBtn('#eff6ff', '#2563eb', '#dbeafe')}>
                                                    <BarChart3 size={13} />
                                                </button>
                                                <button title="تعديل بيانات المنتج" onClick={() => { setSelected(p); setProductForm({ name: p.name, cost: p.cost, price: p.price, quantity: qty, categoryId: p.categoryId || '' }); setErr(''); setModal('edit-product'); }}
                                                    style={actionBtn('#fefce8', '#ca8a04', '#fef08a')}>
                                                    <Edit3 size={13} />
                                                </button>
                                                <button title="حذف" onClick={() => deleteProduct(p.id)} style={actionBtn('#fef2f2', '#ef4444', '#fee2e2')}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Footer */}
                    {filtered.length > 0 && (
                        <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                            <span>يعرض <strong>{filtered.length}</strong> من <strong>{products.length}</strong> منتج</span>
                            <span>💡 انقر على الكمية لتعديلها مباشرة</span>
                        </div>
                    )}
                </div>
            </main>

            {/* ══ Modal: Add/Edit Product ══ */}
            {(modal === 'add-product' || modal === 'edit-product') && (
                <Modal title={modal === 'edit-product' ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'} icon={<Package size={18} />} onClose={() => setModal(null)}>
                    {err && <div style={{ padding: '10px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem', fontWeight: '600' }}>{err}</div>}
                    <form onSubmit={saveProduct}>
                        <Inp label="اسم المنتج" required value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: أسمنت بورتلاندي 50كجم" />
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.82rem', color: '#374151' }}>القسم</label>
                            <select value={productForm.categoryId} onChange={e => setProductForm(f => ({ ...f, categoryId: e.target.value }))}
                                style={{ width: '100%', padding: '10px 13px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', cursor: 'pointer', background: 'white' }}>
                                <option value="">— بدون قسم —</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <Inp label="التكلفة (ر.س)" type="number" step="0.01" required value={productForm.cost} onChange={e => setProductForm(f => ({ ...f, cost: e.target.value }))} placeholder="0.00" />
                            <Inp label="سعر البيع (ر.س)" type="number" step="0.01" required value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
                        </div>
                        {modal === 'add-product' && <Inp label="الكمية الأولية" type="number" value={productForm.quantity} onChange={e => setProductForm(f => ({ ...f, quantity: e.target.value }))} placeholder="0" />}
                        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                            <button type="button" onClick={() => setModal(null)} style={outlineBtn}>إلغاء</button>
                            <button type="submit" style={primaryBtn}>{modal === 'edit-product' ? <><Save size={15} /> حفظ التعديلات</> : <><Plus size={15} /> إضافة المنتج</>}</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ══ Modal: Bulk Adjust ══ */}
            {modal === 'bulk-adjust' && selected && (
                <Modal title="تعديل الكمية" icon={<BarChart3 size={18} />} onClose={() => setModal(null)} width={400}>
                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '18px' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>{selected.name}</div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#64748b' }}>
                            <span>الكمية الحالية: <strong style={{ color: '#2563eb', fontSize: '1rem' }}>{selected.stocks?.[0]?.quantity ?? 0}</strong></span>
                            <span>السعر: <strong>{selected.price.toLocaleString()} ر.س</strong></span>
                        </div>
                    </div>
                    <form onSubmit={bulkAdjust}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                            {[['ADD', 'إضافة للمخزون', '#16a34a'], ['SUBTRACT', 'سحب من المخزون', '#ef4444']].map(([type, label, color]) => (
                                <button key={type} type="button" onClick={() => setAdjustForm(f => ({ ...f, type }))} style={{
                                    padding: '14px 10px', borderRadius: '12px', border: `2px solid ${adjustForm.type === type ? color : '#e2e8f0'}`,
                                    background: adjustForm.type === type ? `${color}10` : 'white', cursor: 'pointer',
                                    color: adjustForm.type === type ? color : '#94a3b8', fontFamily: 'Cairo', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.15s'
                                }}>
                                    {type === 'ADD' ? <ArrowUp size={16} /> : <ArrowDown size={16} />} {label}
                                </button>
                            ))}
                        </div>
                        <Inp label="الكمية" type="number" min="1" required value={adjustForm.quantity} onChange={e => setAdjustForm(f => ({ ...f, quantity: e.target.value }))} style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 'bold' }} />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                            <button type="button" onClick={() => setModal(null)} style={outlineBtn}>إلغاء</button>
                            <button type="submit" style={{ ...primaryBtn, background: adjustForm.type === 'ADD' ? '#16a34a' : '#ef4444' }}>تحديث الكمية</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ══ Modal: Add Category ══ */}
            {modal === 'add-cat' && (
                <Modal title="إضافة قسم جديد" icon={<Tag size={18} />} onClose={() => setModal(null)} width={400}>
                    <form onSubmit={saveCat}>
                        <Inp label="اسم القسم" required value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: الديكور" />
                        <Inp label="الوصف (اختياري)" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف مختصر" />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" onClick={() => setModal(null)} style={outlineBtn}>إلغاء</button>
                            <button type="submit" style={primaryBtn}><Plus size={15} /> إضافة</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ══ Modal: Manage Categories ══ */}
            {modal === 'manage-cats' && (
                <Modal title="إدارة الأقسام" icon={<Settings2 size={18} />} onClose={() => setModal(null)} width={480}>
                    <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                        {categories.length === 0
                            ? <div style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>لا توجد أقسام بعد</div>
                            : categories.map(c => {
                                const color = catColor(c.name);
                                const cnt = catCount(c.id);
                                return (
                                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f8fafc', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Tag size={16} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>{c.name}</div>
                                            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{cnt} منتج{c.description ? ` • ${c.description}` : ''}</div>
                                        </div>
                                        <button onClick={() => deleteCat(c.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Trash2 size={12} /> حذف
                                        </button>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <button onClick={() => { setModal('add-cat'); }} style={{ ...primaryBtn, width: '100%', marginTop: '16px', justifyContent: 'center' }}>
                        <Plus size={15} /> إضافة قسم جديد
                    </button>
                </Modal>
            )}
        </div>
    );
}

/* ── tiny helpers ── */
const CatItem = ({ label, count, active, color, onClick }) => (
    <div onClick={onClick} style={{ padding: '8px 10px', borderRadius: '9px', cursor: 'pointer', marginBottom: '2px', background: active ? `${color}14` : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.12s' }}
        onMouseOver={e => { if (!active) e.currentTarget.style.background = '#f8fafc'; }}
        onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
        <span style={{ fontSize: '0.82rem', fontWeight: active ? '700' : '400', color: active ? color : '#374151', display: 'flex', alignItems: 'center', gap: '7px' }}>
            {!label.startsWith('🏠') && !label.startsWith('⛔') && !label.startsWith('⚠️') && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />}
            {label}
        </span>
        <span style={{ background: active ? `${color}25` : '#f1f5f9', color: active ? color : '#94a3b8', borderRadius: '10px', padding: '1px 8px', fontSize: '0.72rem', fontWeight: '700' }}>{count}</span>
    </div>
);

const actionBtn = (bg, color, border) => ({
    padding: '6px', borderRadius: '8px', border: `1px solid ${border}`, background: bg, color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
});

const primaryBtn = {
    flex: 1, padding: '11px 16px', borderRadius: '10px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center'
};
const outlineBtn = {
    flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '600', color: '#374151'
};
