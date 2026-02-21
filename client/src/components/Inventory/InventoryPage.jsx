import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
    Plus, Search, Package, Edit3, Trash2, X,
    Settings2, Tag, Save, Minus, RefreshCw,
    ArrowUp, ArrowDown, BarChart3, CheckCircle2,
    DollarSign, AlertTriangle, TrendingDown, Layers,
    ChevronDown, Filter
} from 'lucide-react';
import API_URL from '../../config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const CAT_COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444',
    '#f59e0b', '#10b981', '#06b6d4', '#a855f7',
    '#f97316', '#14b8a6', '#6366f1', '#e11d48'
];
const catColor = (name = '') => CAT_COLORS[(name.charCodeAt(0) || 0) % CAT_COLORS.length];

/* ────────── Inline Qty Edit ────────── */
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

    const clr = qty === 0 ? '#ef4444' : qty < 10 ? '#f59e0b' : '#10b981';
    const bg = qty === 0 ? 'rgba(239,68,68,0.12)' : qty < 10 ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)';

    if (editing) return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input ref={ref} type="number" value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
                onBlur={save}
                style={{ width: 60, padding: '4px 8px', background: '#1e2d45', border: '2px solid #3b82f6', borderRadius: 8, color: 'white', fontFamily: 'Cairo', fontSize: '0.88rem', textAlign: 'center', outline: 'none' }} />
            <button onClick={save} style={{ background: 'rgba(16,185,129,0.15)', border: 'none', cursor: 'pointer', color: '#10b981', borderRadius: 6, padding: '3px 4px', display: 'flex' }}><CheckCircle2 size={13} /></button>
            <button onClick={cancel} style={{ background: 'rgba(100,116,139,0.15)', border: 'none', cursor: 'pointer', color: '#64748b', borderRadius: 6, padding: '3px 4px', display: 'flex' }}><X size={13} /></button>
        </div>
    );

    return (
        <span onClick={start} title="انقر لتعديل الكمية" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ padding: '4px 14px', borderRadius: 20, fontWeight: 700, fontSize: '0.88rem', background: bg, color: clr, border: `1px solid ${clr}30`, transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 0 8px ${clr}40`; }}
                onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                {qty}
            </span>
            <Edit3 size={10} color="#475569" />
        </span>
    );
}

/* ────────── Quick ± ────────── */
function QuickPM({ product, onAdjust }) {
    const qty = product.stocks?.[0]?.quantity ?? 0;
    const btn = (disabled, clr, onClick, ico) => (
        <button onClick={onClick} disabled={disabled}
            style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${disabled ? '#1e293b' : clr + '40'}`, background: disabled ? '#0f1a2e' : clr + '15', color: disabled ? '#334155' : clr, cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', padding: 0 }}
            onMouseOver={e => { if (!disabled) { e.currentTarget.style.background = clr + '30'; e.currentTarget.style.boxShadow = `0 0 6px ${clr}40`; } }}
            onMouseOut={e => { if (!disabled) { e.currentTarget.style.background = clr + '15'; e.currentTarget.style.boxShadow = ''; } }}>
            {ico}
        </button>
    );
    return (
        <div style={{ display: 'flex', gap: 3 }}>
            {btn(qty === 0, '#ef4444', () => onAdjust(product.id, 'SUBTRACT', 1), <Minus size={11} />)}
            {btn(false, '#10b981', () => onAdjust(product.id, 'ADD', 1), <Plus size={11} />)}
        </div>
    );
}

/* ────────── Modal ────────── */
const Modal = ({ title, icon: Icon, onClose, children, w = 480 }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
        <div className="fade-in" style={{ background: '#0f1a2e', borderRadius: 20, width: w, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ padding: '18px 22px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(59,130,246,0.05)', borderRadius: '20px 20px 0 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 700, color: 'white', fontFamily: 'Cairo', fontSize: '0.95rem' }}>
                    {Icon && <span style={{ color: '#60a5fa' }}><Icon size={17} /></span>}
                    {title}
                </div>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#94a3b8', borderRadius: 8, padding: 6, display: 'flex' }}><X size={14} /></button>
            </div>
            <div style={{ padding: '20px 22px' }}>{children}</div>
        </div>
    </div>
);

const DField = ({ label, ...p }) => (
    <div style={{ marginBottom: 14 }}>
        {label && <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'Cairo', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>}
        <input {...p} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(59,130,246,0.2)', background: '#0b1221', fontFamily: 'Cairo', fontSize: '0.9rem', color: 'white', outline: 'none', boxSizing: 'border-box', direction: 'rtl', ...p.style }}
            onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(59,130,246,0.2)'; e.target.style.boxShadow = 'none'; }} />
    </div>
);

/* ════════════════════ MAIN ════════════════════ */
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
        catch { alert('فشل التحديث'); } finally { setSaving(null); }
    }, []);

    const quickAdj = useCallback(async (id, type, qty) => {
        setSaving(id);
        try { await axios.post(`${API_URL}/products/${id}/adjust`, { quantity: qty, type }, { headers: H() }); await load(); }
        catch { alert('فشل الضبط'); } finally { setSaving(null); }
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
            // When viewing all: primary sort by category name, secondary by chosen column
            if (activeCat === 'all') {
                const catA = a.category?.name || 'ي';
                const catB = b.category?.name || 'ي';
                if (catA !== catB) return catA.localeCompare(catB, 'ar');
            }
            const va = sortBy === 'name' ? a.name : sortBy === 'qty' ? (a.stocks?.[0]?.quantity ?? 0) : a.price;
            const vb = sortBy === 'name' ? b.name : sortBy === 'qty' ? (b.stocks?.[0]?.quantity ?? 0) : b.price;
            return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
        });

    // Group rows by category for 'all' view
    const groupedRows = [];
    if (activeCat === 'all') {
        let lastCatId = '__none__';
        filtered.forEach(p => {
            const cid = p.categoryId || '__none__';
            if (cid !== lastCatId) {
                groupedRows.push({ type: 'header', catId: cid, catName: p.category?.name || 'بدون قسم', color: p.category ? catColor(p.category.name) : '#475569' });
                lastCatId = cid;
            }
            groupedRows.push({ type: 'row', product: p });
        });
    } else {
        filtered.forEach(p => groupedRows.push({ type: 'row', product: p }));
    }

    const totalVal = products.reduce((s, p) => s + p.cost * (p.stocks?.[0]?.quantity ?? 0), 0);
    const lowCount = products.filter(p => { const q = p.stocks?.[0]?.quantity ?? 0; return q > 0 && q < 10; }).length;
    const zeroCount = products.filter(p => (p.stocks?.[0]?.quantity ?? 0) === 0).length;
    const catCnt = id => products.filter(p => p.categoryId === id).length;

    const SortIco = ({ f }) => sortBy === f
        ? (sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />)
        : <ArrowUp size={10} style={{ opacity: 0.2 }} />;

    /* KPI cards data */
    const kpis = [
        { title: 'إجمالي الأصناف', val: products.length, sub: `${categories.length} قسم`, icon: Layers, g: 'linear-gradient(135deg,#1d4ed8,#2563eb)', glo: '#2563eb' },
        { title: 'قيمة المخزون', val: `${(totalVal / 1000).toFixed(1)}K`, sub: 'ألف ريال سعودي', icon: DollarSign, g: 'linear-gradient(135deg,#065f46,#059669)', glo: '#10b981' },
        { title: 'منخفض المخزون', val: lowCount, sub: 'تحت 10 وحدات', icon: AlertTriangle, g: 'linear-gradient(135deg,#92400e,#d97706)', glo: '#f59e0b' },
        { title: 'نفد من المخزون', val: zeroCount, sub: 'يحتاج تعبئة فورية', icon: TrendingDown, g: 'linear-gradient(135deg,#7f1d1d,#dc2626)', glo: '#ef4444' },
        { title: 'الأقسام', val: categories.length, sub: 'قسم مخزوني', icon: Tag, g: 'linear-gradient(135deg,#4c1d95,#7c3aed)', glo: '#8b5cf6' },
    ];

    /* ══ RENDER ══ */
    return (
        <div id="inv-root" style={{ margin: '-20px', padding: '20px', background: '#060e1a', minHeight: 'calc(100vh - 60px)', fontFamily: 'Cairo, sans-serif', direction: 'rtl', color: 'white' }}>
            {/* ── Force Cairo font on all children ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
                #inv-root, #inv-root * {
                    font-family: 'Cairo', sans-serif !important;
                }
                #inv-root input::placeholder {
                    font-family: 'Cairo', sans-serif !important;
                }
                #inv-root select option {
                    font-family: 'Cairo', sans-serif !important;
                }
            `}</style>

            {/* Page Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
                        <Package size={20} style={{ display: 'inline', marginLeft: 8, color: '#3b82f6', verticalAlign: 'middle' }} />
                        إدارة المخزون
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '0.82rem' }}>
                        {filtered.length} صنف من {products.length} — آخر تحديث: الآن
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={load}
                        style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.07)', cursor: 'pointer', color: '#60a5fa', fontFamily: 'Cairo', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <RefreshCw size={13} /> تحديث
                    </button>
                    <button onClick={() => { setPForm({ name: '', cost: '', price: '', quantity: 0, categoryId: activeCat !== 'all' ? activeCat : '' }); setErr(''); setModal('add-p'); }}
                        style={{ padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 4px 16px rgba(37,99,235,0.4)', fontSize: '0.9rem' }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.5)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.4)'; }}>
                        <Plus size={15} /> إضافة منتج
                    </button>
                </div>
            </div>

            {/* KPI Cards - horizontal scroll */}
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 6, marginBottom: 22, scrollbarWidth: 'none' }}>
                {kpis.map(({ title, val, sub, icon: Icon, g, glo }) => (
                    <div key={title} style={{ flexShrink: 0, width: 180, borderRadius: 16, background: g, padding: '20px 18px', position: 'relative', overflow: 'hidden', boxShadow: `0 8px 32px ${glo}25`, border: `1px solid ${glo}30` }}>
                        <div style={{ position: 'absolute', top: -10, left: -10, opacity: 0.12 }}><Icon size={80} /></div>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <Icon size={20} color="rgba(255,255,255,0.9)" style={{ marginBottom: 10 }} />
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white', lineHeight: 1, marginBottom: 4 }}>{val}</div>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{title}</div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Layout */}
            <div style={{ display: 'flex', gap: 18 }}>

                {/* ── Sidebar ── */}
                <aside style={{ width: 210, flexShrink: 0 }}>
                    <div style={{ background: '#0b1424', borderRadius: 16, border: '1px solid rgba(59,130,246,0.12)', overflow: 'hidden', position: 'sticky', top: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                        {/* Header */}
                        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>
                                <Layers size={14} color="#3b82f6" /> الأقسام
                            </span>
                            <button onClick={() => setModal('mgr-cats')} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 7, padding: '4px 5px', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                                <Settings2 size={12} />
                            </button>
                        </div>

                        {/* Category list */}
                        <div style={{ padding: '10px 8px 6px' }}>
                            <SideCatBtn label="🏠 جميع المنتجات" count={products.length} active={activeCat === 'all'} color="#3b82f6" onClick={() => setActiveCat('all')} />

                            {categories.length > 0
                                ? <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 6, paddingTop: 6 }}>
                                    {categories.map(c => (
                                        <SideCatBtn key={c.id} label={c.name} count={catCnt(c.id)}
                                            active={activeCat === c.id} color={catColor(c.name)}
                                            onClick={() => setActiveCat(c.id)} />
                                    ))}
                                </div>
                                : <div style={{ padding: '8px 6px', fontSize: '0.75rem', color: '#334155', textAlign: 'center' }}>لا توجد أقسام</div>
                            }

                            <button onClick={() => setModal('add-cat')}
                                style={{ width: '100%', marginTop: 8, padding: '7px 0', background: 'rgba(59,130,246,0.06)', border: '1.5px dashed rgba(59,130,246,0.25)', borderRadius: 10, cursor: 'pointer', color: '#60a5fa', fontFamily: 'Cairo', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all 0.2s' }}
                                onMouseOver={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.14)'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.06)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; }}>
                                <Plus size={11} /> إضافة قسم
                            </button>
                        </div>

                        {/* Stock alerts */}
                        {(zeroCount > 0 || lowCount > 0) && (
                            <div style={{ margin: '6px 8px 10px', padding: '10px 12px', background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>⚠️ تنبيهات المخزون</div>
                                {zeroCount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#f87171', marginBottom: 4 }}><span>نفد المخزون</span><span style={{ fontWeight: 700 }}>{zeroCount}</span></div>}
                                {lowCount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#fbbf24' }}><span>كمية منخفضة</span><span style={{ fontWeight: 700 }}>{lowCount}</span></div>}
                            </div>
                        )}
                    </div>
                </aside>

                {/* ── Main Content ── */}
                <div style={{ flex: 1, minWidth: 0 }}>

                    {/* Search + Category Dropdown filter bar */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>

                        {/* Category Dropdown */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <select
                                value={activeCat}
                                onChange={e => setActiveCat(e.target.value)}
                                style={{ appearance: 'none', WebkitAppearance: 'none', padding: '10px 36px 10px 16px', background: '#0b1424', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 12, color: activeCat === 'all' ? '#94a3b8' : catColor(categories.find(c => c.id === activeCat)?.name || ''), fontFamily: 'Cairo', fontSize: '0.85rem', cursor: 'pointer', outline: 'none', minWidth: 170, direction: 'rtl', boxShadow: activeCat !== 'all' ? `0 0 0 2px ${catColor(categories.find(c => c.id === activeCat)?.name || '')}30` : 'none', transition: 'all 0.2s' }}
                            >
                                <option value="all">🏠 جميع الأقسام ({products.length})</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({catCnt(c.id)})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={13} color="#475569" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>

                        {/* Search Box */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: '#0b1424', borderRadius: 12, padding: '10px 16px', border: '1px solid rgba(59,130,246,0.15)' }}>
                            <Search size={15} color="#475569" />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder={`بحث في ${activeCat === 'all' ? 'جميع المنتجات' : (categories.find(c => c.id === activeCat)?.name || '')}... (${filtered.length})`}
                                style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'Cairo', fontSize: '0.88rem', color: 'white', background: 'transparent', direction: 'rtl' }} />
                            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, display: 'flex' }}><X size={12} /></button>}
                        </div>

                        {/* Active filter badge */}
                        {activeCat !== 'all' && (
                            <button onClick={() => setActiveCat('all')}
                                style={{ padding: '10px 14px', borderRadius: 12, border: `1px solid ${catColor(categories.find(c => c.id === activeCat)?.name || '')}40`, background: `${catColor(categories.find(c => c.id === activeCat)?.name || '')}15`, color: catColor(categories.find(c => c.id === activeCat)?.name || ''), fontFamily: 'Cairo', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                                <X size={11} /> مسح الفلتر
                            </button>
                        )}
                    </div>

                    {/* Table */}
                    <div style={{ background: '#0b1424', borderRadius: 16, border: '1px solid rgba(59,130,246,0.12)', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.35)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Cairo', tableLayout: 'fixed' }}>
                            <colgroup>
                                <col style={{ width: '28%' }} />{/* المنتج */}
                                <col style={{ width: '13%' }} />{/* القسم */}
                                <col style={{ width: '14%' }} />{/* الكمية + ± */}
                                <col style={{ width: '10%' }} />{/* التكلفة */}
                                <col style={{ width: '11%' }} />{/* سعر البيع */}
                                <col style={{ width: '10%' }} />{/* الحالة */}
                                <col style={{ width: '14%' }} />{/* إجراءات */}
                            </colgroup>
                            <thead>
                                <tr style={{ background: 'rgba(59,130,246,0.06)', borderBottom: '1px solid rgba(59,130,246,0.12)' }}>
                                    {[
                                        { l: 'المنتج', f: 'name' },
                                        { l: 'القسم', f: null },
                                        { l: 'الكمية / ±', f: 'qty' },
                                        { l: 'التكلفة', f: null },
                                        { l: 'سعر البيع', f: 'price' },
                                        { l: 'الحالة', f: null },
                                        { l: 'إجراءات', f: null },
                                    ].map(({ l, f }) => (
                                        <th key={l} onClick={f ? () => toggleSort(f) : null}
                                            style={{ padding: '11px 10px', textAlign: 'center', color: '#475569', fontWeight: 600, fontSize: '0.7rem', cursor: f ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                                {l} {f && <SortIco f={f} />}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7}>
                                        <div style={{ padding: 60, textAlign: 'center', color: '#334155', fontFamily: 'Cairo' }}>
                                            <RefreshCw size={26} style={{ display: 'block', margin: '0 auto 12px', animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
                                            جاري تحميل البيانات...
                                        </div>
                                    </td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={7}>
                                        <div style={{ padding: 70, textAlign: 'center', color: '#334155', fontFamily: 'Cairo' }}>
                                            <Package size={40} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.15 }} />
                                            لا توجد منتجات مطابقة
                                        </div>
                                    </td></tr>
                                ) : groupedRows.length === 0 ? (
                                    <tr><td colSpan={7}>
                                        <div style={{ padding: 70, textAlign: 'center', color: '#334155', fontFamily: 'Cairo' }}>
                                            <Package size={40} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.15 }} />
                                            لا توجد منتجات مطابقة
                                        </div>
                                    </td></tr>
                                ) : groupedRows.map((item, idx) => {
                                    if (item.type === 'header') {
                                        return (
                                            <tr key={`cat-${item.catId}`}>
                                                <td colSpan={7} style={{ padding: '8px 16px', background: `${item.color}10`, borderTop: idx > 0 ? `2px solid ${item.color}30` : 'none', borderBottom: `1px solid ${item.color}20` }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block', boxShadow: `0 0 6px ${item.color}` }} />
                                                        <span style={{ fontWeight: 700, fontSize: '0.78rem', color: item.color, letterSpacing: '0.05em' }}>
                                                            {item.catName}
                                                        </span>
                                                        <span style={{ fontSize: '0.68rem', color: '#334155', marginRight: 4 }}>
                                                            ({filtered.filter(p => (p.categoryId || '__none__') === item.catId).length} صنف)
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                    const p = item.product;
                                    const dummy_idx = idx;
                                    {/* same row render below */ }
                                    const qty = p.stocks?.[0]?.quantity ?? 0;
                                    const cc = p.category ? catColor(p.category.name) : '#3b82f6';
                                    const st = qty === 0
                                        ? { l: 'نفد', bg: 'rgba(239,68,68,0.12)', cr: '#f87171', dot: '#ef4444' }
                                        : qty < 10
                                            ? { l: 'منخفض', bg: 'rgba(245,158,11,0.12)', cr: '#fbbf24', dot: '#f59e0b' }
                                            : { l: 'متوفر', bg: 'rgba(16,185,129,0.12)', cr: '#34d399', dot: '#10b981' };

                                    return (
                                        <tr key={`row-${p.id}`}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', height: 48, opacity: saving === p.id ? 0.5 : 1, transition: 'background 0.12s', borderRight: `3px solid ${cc}` }}
                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(59,130,246,0.05)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>

                                            {/* Product — single line, truncated */}
                                            <td style={{ padding: '0 14px', textAlign: 'right', maxWidth: 0 }}>
                                                <div title={p.name} style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {p.name}
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td style={{ padding: '0 8px', textAlign: 'center' }}>
                                                {p.category
                                                    ? <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: '0.66rem', fontWeight: 700, background: `${cc}15`, color: cc, border: `1px solid ${cc}25`, whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.category.name}</span>
                                                    : <span style={{ color: '#1e2d3d' }}>—</span>}
                                            </td>

                                            {/* Qty + ± merged */}
                                            <td style={{ padding: '0 6px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                                    <InlineQty product={p} onSave={setQty} />
                                                    <QuickPM product={p} onAdjust={quickAdj} />
                                                </div>
                                            </td>

                                            {/* Cost */}
                                            <td style={{ padding: '0 8px', textAlign: 'center', color: '#475569', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                                {p.cost.toLocaleString()}
                                            </td>

                                            {/* Price */}
                                            <td style={{ padding: '0 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                <span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.88rem' }}>{p.price.toLocaleString()}</span>
                                                <span style={{ fontSize: '0.62rem', color: '#334155', marginRight: 2 }}>ر.س</span>
                                            </td>

                                            {/* Status */}
                                            <td style={{ padding: '0 8px', textAlign: 'center' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, background: st.bg, color: st.cr, whiteSpace: 'nowrap' }}>
                                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, flexShrink: 0, boxShadow: `0 0 4px ${st.dot}` }} />
                                                    {st.l}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: '0 8px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                                    <ActionBtn title="تعديل الكمية" clr="#3b82f6" onClick={() => { setSel(p); setAdjForm({ quantity: 1, type: 'ADD' }); setModal('adj'); }}><BarChart3 size={12} /></ActionBtn>
                                                    <ActionBtn title="تعديل البيانات" clr="#a855f7" onClick={() => { setSel(p); setPForm({ name: p.name, cost: p.cost, price: p.price, quantity: p.stocks?.[0]?.quantity ?? 0, categoryId: p.categoryId || '' }); setErr(''); setModal('edit-p'); }}><Edit3 size={12} /></ActionBtn>
                                                    <ActionBtn title="حذف" clr="#ef4444" onClick={() => delProduct(p.id)}><Trash2 size={12} /></ActionBtn>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {filtered.length > 0 && (
                            <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', color: '#334155', fontSize: '0.74rem', fontFamily: 'Cairo' }}>
                                <span>يعرض <strong style={{ color: '#60a5fa' }}>{filtered.length}</strong> من <strong style={{ color: '#60a5fa' }}>{products.length}</strong> منتج</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569' }}>
                                    <Edit3 size={10} /> انقر على الكمية لتعديلها · hover للاسم الكامل
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══ MODALS ══ */}

            {/* Add / Edit Product */}
            {(modal === 'add-p' || modal === 'edit-p') && (
                <Modal title={modal === 'edit-p' ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'} icon={Package} onClose={() => setModal(null)}>
                    {err && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.12)', color: '#f87171', borderRadius: 10, marginBottom: 14, fontSize: '0.83rem', fontFamily: 'Cairo', border: '1px solid rgba(239,68,68,0.2)' }}>{err}</div>}
                    <form onSubmit={saveProduct}>
                        <DField label="اسم المنتج" required value={pForm.name} onChange={e => setPForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: أسمنت بورتلاندي 50 كجم" />
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'Cairo', letterSpacing: '0.05em' }}>القسم</label>
                            <select value={pForm.categoryId} onChange={e => setPForm(f => ({ ...f, categoryId: e.target.value }))}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(59,130,246,0.2)', background: '#0b1221', fontFamily: 'Cairo', fontSize: '0.9rem', color: '#94a3b8', cursor: 'pointer', outline: 'none' }}>
                                <option value="">— بدون قسم —</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <DField label="التكلفة (ر.س)" type="number" step="0.01" required value={pForm.cost} onChange={e => setPForm(f => ({ ...f, cost: e.target.value }))} />
                            <DField label="سعر البيع (ر.س)" type="number" step="0.01" required value={pForm.price} onChange={e => setPForm(f => ({ ...f, price: e.target.value }))} />
                        </div>
                        {modal === 'add-p' && <DField label="الكمية الأولية" type="number" value={pForm.quantity} onChange={e => setPForm(f => ({ ...f, quantity: e.target.value }))} />}
                        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                            <button type="button" onClick={() => setModal(null)} style={dOutBtn}>إلغاء</button>
                            <button type="submit" style={dPriBtn}>{modal === 'edit-p' ? <><Save size={13} /> حفظ</> : <><Plus size={13} /> إضافة</>}</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Bulk Adjust */}
            {modal === 'adj' && sel && (
                <Modal title="تعديل كمية المنتج" icon={BarChart3} onClose={() => setModal(null)} w={400}>
                    <div style={{ background: 'rgba(59,130,246,0.06)', borderRadius: 12, padding: '14px 16px', marginBottom: 18, border: '1px solid rgba(59,130,246,0.12)' }}>
                        <div style={{ fontWeight: 700, color: '#e2e8f0', fontFamily: 'Cairo', marginBottom: 4 }}>{sel.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', fontFamily: 'Cairo' }}>
                            الكمية الحالية: <strong style={{ color: '#60a5fa', fontSize: '1.1rem' }}>{sel.stocks?.[0]?.quantity ?? 0}</strong>
                        </div>
                    </div>
                    <form onSubmit={adjSave}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                            {[['ADD', 'إضافة', '#10b981'], ['SUBTRACT', 'سحب', '#ef4444']].map(([t, lbl, clr]) => (
                                <button key={t} type="button" onClick={() => setAdjForm(f => ({ ...f, type: t }))}
                                    style={{ padding: '12px 8px', borderRadius: 10, border: `2px solid ${adjForm.type === t ? clr : 'rgba(255,255,255,0.1)'}`, background: adjForm.type === t ? `${clr}15` : 'transparent', cursor: 'pointer', color: adjForm.type === t ? clr : '#475569', fontFamily: 'Cairo', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s' }}>
                                    {t === 'ADD' ? <ArrowUp size={14} /> : <ArrowDown size={14} />} {lbl}
                                </button>
                            ))}
                        </div>
                        <DField label="الكمية" type="number" min="1" required value={adjForm.quantity} onChange={e => setAdjForm(f => ({ ...f, quantity: e.target.value }))} style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800 }} />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" onClick={() => setModal(null)} style={dOutBtn}>إلغاء</button>
                            <button type="submit" style={{ ...dPriBtn, background: adjForm.type === 'ADD' ? '#059669' : '#dc2626' }}>تحديث الكمية</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Add Category */}
            {modal === 'add-cat' && (
                <Modal title="إضافة قسم جديد" icon={Tag} onClose={() => setModal(null)} w={380}>
                    <form onSubmit={saveCat}>
                        <DField label="اسم القسم" required value={cForm.name} onChange={e => setCForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: الكهرباء" />
                        <DField label="الوصف" value={cForm.description} onChange={e => setCForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف مختصر (اختياري)" />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" onClick={() => setModal(null)} style={dOutBtn}>إلغاء</button>
                            <button type="submit" style={dPriBtn}><Plus size={13} /> إضافة</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Manage Categories */}
            {modal === 'mgr-cats' && (
                <Modal title="إدارة الأقسام" icon={Settings2} onClose={() => setModal(null)} w={460}>
                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                        {categories.length === 0
                            ? <div style={{ textAlign: 'center', color: '#475569', padding: 30, fontFamily: 'Cairo' }}>لا توجد أقسام</div>
                            : categories.map(c => {
                                const clr = catColor(c.name);
                                return (
                                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: 12 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${clr}15`, color: clr, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${clr}25` }}>
                                            <Tag size={13} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem', fontFamily: 'Cairo' }}>{c.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'Cairo' }}>{catCnt(c.id)} منتج{c.description ? ` — ${c.description}` : ''}</div>
                                        </div>
                                        <button onClick={() => delCat(c.id)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer', fontSize: '0.74rem', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Trash2 size={11} /> حذف
                                        </button>
                                    </div>
                                );
                            })}
                    </div>
                    <button onClick={() => setModal('add-cat')} style={{ ...dPriBtn, width: '100%', marginTop: 14, justifyContent: 'center' }}>
                        <Plus size={13} /> إضافة قسم جديد
                    </button>
                </Modal>
            )}
        </div>
    );
}

/* ── Sub-components ── */
const SideCatBtn = ({ label, count, active, color, onClick }) => (
    <div onClick={onClick}
        style={{ padding: '7px 9px', borderRadius: 9, cursor: 'pointer', marginBottom: 2, background: active ? `${color}18` : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s', borderRight: active ? `2px solid ${color}` : '2px solid transparent' }}
        onMouseOver={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
        <span style={{ fontSize: '0.8rem', fontWeight: active ? 700 : 400, color: active ? color : '#475569', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: 6 }}>
            {!label.match(/^[🏠⛔⚠️]/) && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: active ? `0 0 6px ${color}` : 'none', display: 'inline-block' }} />
            )}
            {label}
        </span>
        <span style={{ background: active ? `${color}25` : 'rgba(255,255,255,0.06)', color: active ? color : '#334155', borderRadius: 9, padding: '1px 7px', fontSize: '0.66rem', fontWeight: 700 }}>{count}</span>
    </div>
);

const ActionBtn = ({ clr, onClick, title, children }) => (
    <button title={title} onClick={onClick}
        style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${clr}25`, background: `${clr}12`, color: clr, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
        onMouseOver={e => { e.currentTarget.style.background = `${clr}25`; e.currentTarget.style.boxShadow = `0 0 8px ${clr}40`; }}
        onMouseOut={e => { e.currentTarget.style.background = `${clr}12`; e.currentTarget.style.boxShadow = ''; }}>
        {children}
    </button>
);

const dPriBtn = { flex: 1, padding: '10px 16px', borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' };
const dOutBtn = { flex: 1, padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 600, color: '#94a3b8' };
