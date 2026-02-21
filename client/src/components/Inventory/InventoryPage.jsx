import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
    Plus, Search, Package, Edit3, Trash2, X,
    Settings2, Tag, Save, Minus, RefreshCw,
    ArrowUp, ArrowDown, BarChart3, CheckCircle2,
    DollarSign, AlertTriangle, TrendingDown, Layers
} from 'lucide-react';
import API_URL from '../../config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const CAT_COLORS = [
    '#2563eb', '#7c3aed', '#db2777', '#dc2626',
    '#d97706', '#16a34a', '#0891b2', '#9333ea',
    '#c2410c', '#0f766e', '#1d4ed8', '#be185d'
];
const catColor = (name = '') => CAT_COLORS[name.charCodeAt(0) % CAT_COLORS.length];

/* ══ Inline editable quantity cell ══ */
function InlineQty({ product, onSave }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState('');
    const ref = useRef();
    const qty = product.stocks?.[0]?.quantity ?? 0;

    const start = () => { setVal(qty); setEditing(true); setTimeout(() => ref.current?.select(), 0); };
    const cancel = () => setEditing(false);
    const save = async () => {
        if (val === '' || isNaN(val)) { cancel(); return; }
        await onSave(product.id, parseInt(val));
        setEditing(false);
    };

    const badge = qty === 0
        ? { bg: '#fef2f2', color: '#ef4444', border: '#fecaca' }
        : qty < 10
            ? { bg: '#fffbeb', color: '#d97706', border: '#fde68a' }
            : { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };

    if (editing) return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input ref={ref} type="number" value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
                onBlur={save}
                style={{ width: 64, padding: '4px 8px', border: '2px solid #2563eb', borderRadius: 8, fontFamily: 'Cairo', fontSize: '0.9rem', textAlign: 'center', outline: 'none' }} />
            <button onClick={save} style={iconBtn('#f0fdf4', '#16a34a')}><CheckCircle2 size={14} /></button>
            <button onClick={cancel} style={iconBtn('#f8fafc', '#94a3b8')}><X size={14} /></button>
        </div>
    );

    return (
        <span onClick={start} title="انقر لتعديل الكمية"
            style={{ cursor: 'text', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ padding: '3px 14px', borderRadius: 20, fontWeight: 700, fontSize: '0.9rem', background: badge.bg, color: badge.color, border: `1.5px solid ${badge.border}`, transition: 'transform 0.15s', display: 'inline-block' }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseOut={e => e.currentTarget.style.transform = ''}>
                {qty}
            </span>
            <Edit3 size={11} color="#94a3b8" />
        </span>
    );
}

/* ══ Quick ±1 ══ */
function QuickPM({ product, onAdjust }) {
    const qty = product.stocks?.[0]?.quantity ?? 0;
    return (
        <div style={{ display: 'flex', gap: 3 }}>
            <button onClick={() => onAdjust(product.id, 'SUBTRACT', 1)} disabled={qty === 0}
                style={{ ...qBtn, borderColor: qty === 0 ? '#e2e8f0' : '#fecaca', background: qty === 0 ? '#f8fafc' : '#fef2f2', color: qty === 0 ? '#cbd5e1' : '#ef4444', cursor: qty === 0 ? 'not-allowed' : 'pointer' }}>
                <Minus size={12} />
            </button>
            <button onClick={() => onAdjust(product.id, 'ADD', 1)}
                style={{ ...qBtn, borderColor: '#bbf7d0', background: '#f0fdf4', color: '#16a34a' }}>
                <Plus size={12} />
            </button>
        </div>
    );
}

/* ══ Modal ══ */
const Modal = ({ title, icon: Icon, onClose, children, w = 480 }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
        <div className="fade-in" style={{ background: 'white', borderRadius: 20, width: w, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '20px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg,#f8fafc,white)', borderRadius: '20px 20px 0 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, color: '#0f172a', fontFamily: 'Cairo' }}>
                    {Icon && <span style={{ color: '#2563eb' }}><Icon size={18} /></span>}
                    {title}
                </div>
                <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', borderRadius: 8, padding: 6, display: 'flex' }}><X size={15} /></button>
            </div>
            <div style={{ padding: '22px 24px' }}>{children}</div>
        </div>
    </div>
);

const Field = ({ label, ...p }) => (
    <div style={{ marginBottom: 14 }}>
        {label && <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: '0.82rem', color: '#374151', fontFamily: 'Cairo' }}>{label}</label>}
        <input {...p} style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', direction: 'rtl', ...p.style }}
            onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
    </div>
);

/* ══════════════════════ MAIN ══════════════════════ */
export default function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [activeCat, setActiveCat] = useState('all');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [modal, setModal] = useState(null);
    const [sel, setSel] = useState(null);
    const [pForm, setPForm] = useState({ name: '', cost: '', price: '', quantity: 0, categoryId: '' });
    const [cForm, setCForm] = useState({ name: '', description: '' });
    const [adjForm, setAdjForm] = useState({ quantity: 1, type: 'ADD' });
    const [err, setErr] = useState('');

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try { const r = await axios.get(`${API_URL}/products`, { headers: H() }); setProducts(r.data || []); } catch { setProducts([]); }
        try { const r = await axios.get(`${API_URL}/categories`, { headers: H() }); setCategories(r.data || []); } catch { setCategories([]); }
        setLoading(false);
    };

    const setQty = useCallback(async (id, qty) => {
        setSaving(id);
        try { await axios.put(`${API_URL}/products/${id}/stock`, { quantity: qty }, { headers: H() }); await load(); }
        catch { alert('فشل التحديث'); }
        finally { setSaving(null); }
    }, []);

    const quickAdj = useCallback(async (id, type, qty) => {
        setSaving(id);
        try { await axios.post(`${API_URL}/products/${id}/adjust`, { quantity: qty, type }, { headers: H() }); await load(); }
        catch { alert('فشل التحديث'); }
        finally { setSaving(null); }
    }, []);

    const saveProduct = async (e) => {
        e.preventDefault(); setErr('');
        try {
            if (modal === 'edit-p') await axios.put(`${API_URL}/products/${sel.id}`, pForm, { headers: H() });
            else await axios.post(`${API_URL}/products`, pForm, { headers: H() });
            load(); setModal(null);
        } catch (ex) { setErr(ex.response?.data?.error || 'فشل الحفظ'); }
    };

    const delProduct = async (id) => {
        if (!confirm('حذف هذا المنتج؟')) return;
        try { await axios.delete(`${API_URL}/products/${id}`, { headers: H() }); load(); } catch { alert('فشل الحذف'); }
    };

    const saveCat = async (e) => {
        e.preventDefault();
        try { await axios.post(`${API_URL}/categories`, cForm, { headers: H() }); load(); setModal(null); setCForm({ name: '', description: '' }); }
        catch (ex) { alert(ex.response?.data?.error || 'فشل الإضافة'); }
    };

    const delCat = async (id) => {
        if (!confirm('حذف هذا القسم؟')) return;
        try { await axios.delete(`${API_URL}/categories/${id}`, { headers: H() }); if (activeCat === id) setActiveCat('all'); load(); }
        catch { alert('فشل الحذف'); }
    };

    const adjSave = async (e) => {
        e.preventDefault();
        try { await axios.post(`${API_URL}/products/${sel.id}/adjust`, adjForm, { headers: H() }); load(); setModal(null); }
        catch { alert('فشل التعديل'); }
    };

    const toggleSort = f => { if (sortBy === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(f); setSortDir('asc'); } };

    const filtered = products
        .filter(p => activeCat === 'all' || p.categoryId === activeCat)
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            const va = sortBy === 'name' ? a.name : sortBy === 'qty' ? (a.stocks?.[0]?.quantity ?? 0) : a.price;
            const vb = sortBy === 'name' ? b.name : sortBy === 'qty' ? (b.stocks?.[0]?.quantity ?? 0) : b.price;
            return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
        });

    const totalVal = products.reduce((s, p) => s + p.cost * (p.stocks?.[0]?.quantity ?? 0), 0);
    const lowCount = products.filter(p => { const q = p.stocks?.[0]?.quantity ?? 0; return q > 0 && q < 10; }).length;
    const zeroCount = products.filter(p => (p.stocks?.[0]?.quantity ?? 0) === 0).length;
    const catCnt = id => products.filter(p => p.categoryId === id).length;

    const SortIco = ({ f }) => sortBy === f ? (sortDir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />) : null;

    /* ════ RENDER ════ */
    return (
        <div style={{ display: 'flex', gap: 20, fontFamily: 'Cairo, sans-serif', direction: 'rtl', minHeight: 'calc(100vh - 100px)' }}>

            {/* ══ SIDEBAR ══ */}
            <aside style={{ width: 220, flexShrink: 0 }}>
                <div style={{ background: '#0f172a', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', position: 'sticky', top: 20 }}>

                    {/* Header */}
                    <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Layers size={15} color="#2563eb" /> الأقسام
                            </span>
                            <button onClick={() => setModal('mgr-cats')} title="إدارة الأقسام"
                                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 7, padding: '5px 6px', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                                <Settings2 size={13} />
                            </button>
                        </div>
                    </div>

                    {/* Items */}
                    <div style={{ padding: '10px 10px 6px' }}>
                        <SideItem label="🏠 جميع المنتجات" count={products.length} active={activeCat === 'all'} color="#2563eb" onClick={() => setActiveCat('all')} />
                        {categories.length > 0 && (
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 6, paddingTop: 6 }}>
                                {categories.map(c => (
                                    <SideItem key={c.id} label={c.name} count={catCnt(c.id)} active={activeCat === c.id}
                                        color={catColor(c.name)} onClick={() => setActiveCat(c.id)} />
                                ))}
                            </div>
                        )}
                        {(zeroCount > 0 || lowCount > 0) && (
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 6, paddingTop: 6 }}>
                                {zeroCount > 0 && <SideItem label="⛔ نفد المخزون" count={zeroCount} active={false} color="#ef4444" onClick={() => { }} />}
                                {lowCount > 0 && <SideItem label="⚠️ كمية منخفضة" count={lowCount} active={false} color="#f59e0b" onClick={() => { }} />}
                            </div>
                        )}
                        <button onClick={() => setModal('add-cat')}
                            style={{ width: '100%', marginTop: 10, padding: '8px 0', background: 'rgba(37,99,235,0.08)', border: '1.5px dashed rgba(37,99,235,0.35)', borderRadius: 10, cursor: 'pointer', color: '#60a5fa', fontFamily: 'Cairo', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.18)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.08)'; }}>
                            <Plus size={12} /> إضافة قسم
                        </button>
                    </div>

                    {/* Mini stats */}
                    <div style={{ margin: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 6, fontWeight: 600 }}>قيمة المخزون</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>{totalVal.toLocaleString()}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ريال سعودي</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <div style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f87171' }}>{zeroCount}</div>
                                <div style={{ fontSize: '0.65rem', color: '#f87171' }}>نفد</div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 10, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24' }}>{lowCount}</div>
                                <div style={{ fontSize: '0.65rem', color: '#fbbf24' }}>منخفض</div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ══ MAIN ══ */}
            <main style={{ flex: 1, minWidth: 0 }}>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
                    {[
                        { title: 'إجمالي الأصناف', val: products.length, sub: `${categories.length} قسم`, icon: Package, color: '#2563eb' },
                        { title: 'قيمة المخزون', val: `${(totalVal / 1000).toFixed(0)}K`, sub: 'ريال سعودي', icon: DollarSign, color: '#10b981' },
                        { title: 'منخفض الكمية', val: lowCount, sub: 'تحت 10 وحدات', icon: AlertTriangle, color: '#f59e0b' },
                        { title: 'نفد المخزون', val: zeroCount, sub: 'يحتاج تعبئة', icon: TrendingDown, color: '#ef4444' },
                    ].map(({ title, val, sub, icon: Icon, color }) => (
                        <div key={title} className="card-hover fade-in" style={{ background: 'white', padding: '18px 20px', borderRadius: 14, border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginBottom: 4 }}>{title}</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{val}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 3 }}>{sub}</div>
                            </div>
                            <div style={{ padding: 10, background: `${color}18`, borderRadius: 10, color }}>
                                <Icon size={20} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'white', borderRadius: 12, padding: '10px 16px', border: '1px solid #f1f5f9', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                        <Search size={16} color="#94a3b8" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder={`بحث${activeCat !== 'all' ? ` في ${categories.find(c => c.id === activeCat)?.name || ''}` : ''} (${filtered.length} نتيجة)`}
                            style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'Cairo', fontSize: '0.9rem', color: '#334155', background: 'transparent' }} />
                        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}><X size={13} /></button>}
                    </div>
                    <button onClick={load} style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #f1f5f9', background: 'white', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Cairo', fontSize: '0.82rem', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                        <RefreshCw size={14} /> تحديث
                    </button>
                    <button onClick={() => { setPForm({ name: '', cost: '', price: '', quantity: 0, categoryId: activeCat !== 'all' ? activeCat : '' }); setErr(''); setModal('add-p'); }}
                        style={{ padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 4px 14px rgba(37,99,235,0.35)', fontSize: '0.9rem' }}>
                        <Plus size={16} /> إضافة منتج
                    </button>
                </div>

                {/* Table */}
                <div className="fade-in" style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Cairo' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)' }}>
                                {[
                                    { l: 'المنتج', f: 'name' },
                                    { l: 'القسم', f: null },
                                    { l: 'الكمية', f: 'qty' },
                                    { l: '± سريع', f: null },
                                    { l: 'التكلفة', f: null },
                                    { l: 'سعر البيع', f: 'price' },
                                    { l: 'الحالة', f: null },
                                    { l: 'إجراءات', f: null },
                                ].map(({ l, f }) => (
                                    <th key={l} onClick={f ? () => toggleSort(f) : null}
                                        style={{ padding: '13px 14px', textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: '0.78rem', cursor: f ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            {l} {f && <SortIco f={f} />}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8}>
                                    <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8', fontFamily: 'Cairo' }}>
                                        <RefreshCw size={28} style={{ display: 'block', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                                        جاري تحميل البيانات...
                                    </div>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8}>
                                    <div style={{ padding: 70, textAlign: 'center', color: '#94a3b8', fontFamily: 'Cairo' }}>
                                        <Package size={42} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.2 }} />
                                        لا توجد منتجات
                                    </div>
                                </td></tr>
                            ) : filtered.map((p, idx) => {
                                const qty = p.stocks?.[0]?.quantity ?? 0;
                                const cc = p.category ? catColor(p.category.name) : '#94a3b8';
                                const st = qty === 0 ? { l: 'نفد', bg: '#fef2f2', cr: '#ef4444' }
                                    : qty < 10 ? { l: 'منخفض', bg: '#fffbeb', cr: '#d97706' }
                                        : { l: 'متوفر', bg: '#f0fdf4', cr: '#16a34a' };
                                return (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc', opacity: saving === p.id ? 0.55 : 1, transition: 'background 0.15s', background: idx % 2 === 0 ? 'white' : '#fafbff' }}
                                        onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                                        onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafbff'}>

                                        {/* Product */}
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.88rem' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.71rem', color: '#94a3b8', marginTop: 2 }}>
                                                قيمة المخزون: {(p.cost * qty).toLocaleString()} ر.س
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                            {p.category
                                                ? <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, background: `${cc}15`, color: cc, border: `1px solid ${cc}30` }}>{p.category.name}</span>
                                                : <span style={{ color: '#e2e8f0' }}>—</span>}
                                        </td>

                                        {/* Qty inline */}
                                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                            <InlineQty product={p} onSave={setQty} />
                                        </td>

                                        {/* ±1 */}
                                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                            <QuickPM product={p} onAdjust={quickAdj} />
                                        </td>

                                        {/* Cost */}
                                        <td style={{ padding: '12px 10px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                                            {p.cost.toLocaleString()}
                                        </td>

                                        {/* Price */}
                                        <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>
                                            {p.price.toLocaleString()} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#94a3b8' }}>ر.س</span>
                                        </td>

                                        {/* Status */}
                                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.74rem', fontWeight: 700, background: st.bg, color: st.cr }}>
                                                {st.l}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                                                <button title="تعديل الكمية" onClick={() => { setSel(p); setAdjForm({ quantity: 1, type: 'ADD' }); setModal('adj'); }}
                                                    style={aBtn('#eff6ff', '#2563eb', '#dbeafe')}><BarChart3 size={13} /></button>
                                                <button title="تعديل البيانات" onClick={() => { setSel(p); setPForm({ name: p.name, cost: p.cost, price: p.price, quantity: p.stocks?.[0]?.quantity ?? 0, categoryId: p.categoryId || '' }); setErr(''); setModal('edit-p'); }}
                                                    style={aBtn('#fefce8', '#ca8a04', '#fef08a')}><Edit3 size={13} /></button>
                                                <button title="حذف" onClick={() => delProduct(p.id)} style={aBtn('#fef2f2', '#ef4444', '#fee2e2')}><Trash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filtered.length > 0 && (
                        <div style={{ padding: '11px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.78rem', fontFamily: 'Cairo' }}>
                            <span>يعرض <strong style={{ color: '#0f172a' }}>{filtered.length}</strong> من <strong style={{ color: '#0f172a' }}>{products.length}</strong> منتج</span>
                            <span style={{ color: '#94a3b8' }}>💡 انقر على الكمية لتعديلها مباشرة <Edit3 size={11} style={{ display: 'inline', marginRight: 3 }} /></span>
                        </div>
                    )}
                </div>
            </main>

            {/* ══ MODAL: Add/Edit Product ══ */}
            {(modal === 'add-p' || modal === 'edit-p') && (
                <Modal title={modal === 'edit-p' ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'} icon={Package} onClose={() => setModal(null)}>
                    {err && <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#ef4444', borderRadius: 10, marginBottom: 14, fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Cairo' }}>{err}</div>}
                    <form onSubmit={saveProduct}>
                        <Field label="اسم المنتج *" required value={pForm.name} onChange={e => setPForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: أسمنت بورتلاندي" />
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: '0.82rem', color: '#374151', fontFamily: 'Cairo' }}>القسم</label>
                            <select value={pForm.categoryId} onChange={e => setPForm(f => ({ ...f, categoryId: e.target.value }))}
                                style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', cursor: 'pointer', background: 'white', outline: 'none' }}>
                                <option value="">— بدون قسم —</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <Field label="التكلفة (ر.س) *" type="number" step="0.01" required value={pForm.cost} onChange={e => setPForm(f => ({ ...f, cost: e.target.value }))} />
                            <Field label="سعر البيع (ر.س) *" type="number" step="0.01" required value={pForm.price} onChange={e => setPForm(f => ({ ...f, price: e.target.value }))} />
                        </div>
                        {modal === 'add-p' && <Field label="الكمية الأولية" type="number" value={pForm.quantity} onChange={e => setPForm(f => ({ ...f, quantity: e.target.value }))} />}
                        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                            <button type="button" onClick={() => setModal(null)} style={outBtn}>إلغاء</button>
                            <button type="submit" style={priBtn}>{modal === 'edit-p' ? <><Save size={14} /> حفظ التعديلات</> : <><Plus size={14} /> إضافة المنتج</>}</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ══ MODAL: Bulk Adjust ══ */}
            {modal === 'adj' && sel && (
                <Modal title="تعديل الكمية" icon={BarChart3} onClose={() => setModal(null)} w={400}>
                    <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', marginBottom: 18, border: '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4, fontFamily: 'Cairo' }}>{sel.name}</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', fontFamily: 'Cairo' }}>
                            الكمية الحالية: <strong style={{ color: '#2563eb', fontSize: '1.1rem' }}>{sel.stocks?.[0]?.quantity ?? 0}</strong>
                            <span style={{ marginRight: 14 }}>السعر: <strong>{sel.price.toLocaleString()} ر.س</strong></span>
                        </div>
                    </div>
                    <form onSubmit={adjSave}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                            {[['ADD', 'إضافة للمخزون', '#16a34a'], ['SUBTRACT', 'سحب من المخزون', '#ef4444']].map(([t, lbl, clr]) => (
                                <button key={t} type="button" onClick={() => setAdjForm(f => ({ ...f, type: t }))}
                                    style={{ padding: '13px 8px', borderRadius: 12, border: `2px solid ${adjForm.type === t ? clr : '#e2e8f0'}`, background: adjForm.type === t ? `${clr}10` : 'white', cursor: 'pointer', color: adjForm.type === t ? clr : '#94a3b8', fontFamily: 'Cairo', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s' }}>
                                    {t === 'ADD' ? <ArrowUp size={15} /> : <ArrowDown size={15} />} {lbl}
                                </button>
                            ))}
                        </div>
                        <Field label="الكمية" type="number" min="1" required value={adjForm.quantity} onChange={e => setAdjForm(f => ({ ...f, quantity: e.target.value }))} style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800 }} />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" onClick={() => setModal(null)} style={outBtn}>إلغاء</button>
                            <button type="submit" style={{ ...priBtn, background: adjForm.type === 'ADD' ? '#16a34a' : '#ef4444' }}>تحديث الكمية</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ══ MODAL: Add Category ══ */}
            {modal === 'add-cat' && (
                <Modal title="إضافة قسم جديد" icon={Tag} onClose={() => setModal(null)} w={400}>
                    <form onSubmit={saveCat}>
                        <Field label="اسم القسم *" required value={cForm.name} onChange={e => setCForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: الديكور" />
                        <Field label="الوصف (اختياري)" value={cForm.description} onChange={e => setCForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف مختصر" />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" onClick={() => setModal(null)} style={outBtn}>إلغاء</button>
                            <button type="submit" style={priBtn}><Plus size={14} /> إضافة القسم</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ══ MODAL: Manage Categories ══ */}
            {modal === 'mgr-cats' && (
                <Modal title="إدارة الأقسام" icon={Settings2} onClose={() => setModal(null)} w={480}>
                    <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                        {categories.length === 0
                            ? <div style={{ textAlign: 'center', color: '#94a3b8', padding: 30, fontFamily: 'Cairo' }}>لا توجد أقسام بعد</div>
                            : categories.map(c => {
                                const clr = catColor(c.name);
                                return (
                                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f8fafc', gap: 12 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${clr}15`, color: clr, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${clr}25` }}>
                                            <Tag size={15} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', fontFamily: 'Cairo' }}>{c.name}</div>
                                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'Cairo' }}>{catCnt(c.id)} منتج{c.description ? ` • ${c.description}` : ''}</div>
                                        </div>
                                        <button onClick={() => delCat(c.id)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Trash2 size={12} /> حذف
                                        </button>
                                    </div>
                                );
                            })}
                    </div>
                    <button onClick={() => setModal('add-cat')} style={{ ...priBtn, width: '100%', marginTop: 16, justifyContent: 'center' }}>
                        <Plus size={14} /> إضافة قسم جديد
                    </button>
                </Modal>
            )}
        </div>
    );
}

/* ══ Sidebar item ══ */
const SideItem = ({ label, count, active, color, onClick }) => (
    <div onClick={onClick} style={{ padding: '8px 10px', borderRadius: 9, cursor: 'pointer', marginBottom: 2, background: active ? `${color}22` : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }}
        onMouseOver={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
        <span style={{ fontSize: '0.82rem', fontWeight: active ? 700 : 400, color: active ? color : '#94a3b8', display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Cairo' }}>
            {!['🏠', '⛔', '⚠️'].some(e => label.startsWith(e)) && (
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block', boxShadow: active ? `0 0 6px ${color}` : 'none' }} />
            )}
            {label}
        </span>
        <span style={{ background: active ? `${color}30` : 'rgba(255,255,255,0.07)', color: active ? color : '#475569', borderRadius: 10, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>{count}</span>
    </div>
);

/* ══ Tiny style helpers ══ */
const iconBtn = (bg, clr) => ({ background: bg, border: 'none', cursor: 'pointer', color: clr, borderRadius: 7, padding: '3px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
const qBtn = { width: 26, height: 26, borderRadius: 7, border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', transition: 'transform 0.12s' };
const aBtn = (bg, clr, bd) => ({ padding: 6, borderRadius: 8, border: `1px solid ${bd}`, background: bg, color: clr, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' });
const priBtn = { flex: 1, padding: '11px 16px', borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' };
const outBtn = { flex: 1, padding: 11, borderRadius: 10, border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 600, color: '#374151' };
