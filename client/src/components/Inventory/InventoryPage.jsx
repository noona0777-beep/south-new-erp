import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Search, Package, Edit3, Trash2, X,
    Settings2, Tag, Save, Minus, RefreshCw,
    ArrowUp, ArrowDown, BarChart3, CheckCircle2,
    DollarSign, AlertTriangle, TrendingDown, Layers,
    ChevronDown, Filter, AlertOctagon
} from 'lucide-react';
import API_URL from '@/config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const CAT_COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444',
    '#f59e0b', '#10b981', '#06b6d4', '#a855f7',
    '#f97316', '#14b8a6', '#6366f1', '#e11d48'
];
const catColor = (name = '') => CAT_COLORS[(name.charCodeAt(0) || 0) % CAT_COLORS.length];

/* ────────── Inline Qty Edit ────────── */
function InlineQty({ product, onSave, isSaving }) {
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
        <span onClick={start} title="انقر لتعديل الكمية" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, opacity: isSaving ? 0.5 : 1 }}>
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
function QuickPM({ product, onAdjust, isSaving }) {
    const qty = product.stocks?.[0]?.quantity ?? 0;
    const btn = (disabled, clr, onClick, ico) => (
        <button onClick={onClick} disabled={disabled || isSaving}
            style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${disabled ? '#1e293b' : clr + '40'}`, background: disabled ? '#0f1a2e' : clr + '15', color: disabled ? '#334155' : clr, cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', padding: 0 }}
            onMouseOver={e => { if (!disabled && !isSaving) { e.currentTarget.style.background = clr + '30'; e.currentTarget.style.boxShadow = `0 0 6px ${clr}40`; } }}
            onMouseOut={e => { if (!disabled && !isSaving) { e.currentTarget.style.background = clr + '15'; e.currentTarget.style.boxShadow = ''; } }}>
            {ico}
        </button>
    );
    return (
        <div style={{ display: 'flex', gap: 3, opacity: isSaving ? 0.5 : 1 }}>
            {btn(qty === 0, '#ef4444', () => onAdjust(product.id, 'SUBTRACT', 1), <Minus size={11} />)}
            {btn(false, '#10b981', () => onAdjust(product.id, 'ADD', 1), <Plus size={11} />)}
        </div>
    );
}

/* ────────── Modal ────────── */
const Modal = ({ title, icon: Icon, onClose, children, w = 480 }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '20px' }}>
        <div className="fade-in" style={{ background: '#0f1a2e', borderRadius: 20, width: '100%', maxWidth: w, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.15)' }}>
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
    const queryClient = useQueryClient();
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

    // Fetch Products
    const { data: products = [], isLoading: productsLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/products`, { headers: H() });
            return res.data || [];
        }
    });

    // Fetch Categories
    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/categories`, { headers: H() });
            return res.data || [];
        }
    });

    const load = () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
    };

    // Generic Mutation handlers
    const productMutation = useMutation({
        mutationFn: async ({ action, id, data }) => {
            if (action === 'save') {
                return modal === 'edit-p'
                    ? axios.put(`${API_URL}/products/${id}`, data, { headers: H() })
                    : axios.post(`${API_URL}/products`, data, { headers: H() });
            }
            if (action === 'delete') return axios.delete(`${API_URL}/products/${id}`, { headers: H() });
            if (action === 'stock') return axios.put(`${API_URL}/products/${id}/stock`, data, { headers: H() });
            if (action === 'adjust') return axios.post(`${API_URL}/products/${id}/adjust`, data, { headers: H() });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setModal(null);
            setErr('');
        },
        onError: (ex) => { setErr(ex.response?.data?.error || 'فشل العملية'); }
    });

    const categoryMutation = useMutation({
        mutationFn: async ({ action, id, data }) => {
            if (action === 'save') return axios.post(`${API_URL}/categories`, data, { headers: H() });
            if (action === 'delete') return axios.delete(`${API_URL}/categories/${id}`, { headers: H() });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setModal(null);
        },
        onError: (ex) => { alert(ex.response?.data?.error || 'فشل العملية'); }
    });

    const setQty = useCallback((id, qty) => {
        productMutation.mutate({ action: 'stock', id, data: { quantity: qty } });
    }, [productMutation]);

    const quickAdj = useCallback((id, type, qty) => {
        productMutation.mutate({ action: 'adjust', id, data: { quantity: qty, type } });
    }, [productMutation]);

    const saveProduct = (e) => {
        e.preventDefault();
        productMutation.mutate({ action: 'save', id: sel?.id, data: pForm });
    };

    const delProduct = (id) => {
        if (!confirm('حذف هذا المنتج؟')) return;
        productMutation.mutate({ action: 'delete', id });
    };

    const saveCat = (e) => {
        e.preventDefault();
        categoryMutation.mutate({ action: 'save', data: cForm });
    };

    const delCat = (id) => {
        if (!confirm('حذف هذا القسم؟')) return;
        categoryMutation.mutate({ action: 'delete', id });
    };

    const adjSave = (e) => {
        e.preventDefault();
        productMutation.mutate({ action: 'adjust', id: sel.id, data: adjForm });
    };

    const toggleSort = f => { if (sortBy === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(f); setSortDir('asc'); } };

    const filtered = products
        .filter(p => activeCat === 'all' || p.categoryId === activeCat)
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (activeCat === 'all') {
                const catA = a.category?.name || 'ي';
                const catB = b.category?.name || 'ي';
                if (catA !== catB) return catA.localeCompare(catB, 'ar');
            }
            const va = sortBy === 'name' ? a.name : sortBy === 'qty' ? (a.stocks?.[0]?.quantity ?? 0) : a.price;
            const vb = sortBy === 'name' ? b.name : sortBy === 'qty' ? (b.stocks?.[0]?.quantity ?? 0) : b.price;
            return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
        });

    const groupedRows = [];
    if (activeCat === 'all') {
        let lastCatId = null;
        filtered.forEach(p => {
            const cid = p.category ? (p.categoryId || '__none__') : '__none__';
            if (cid !== lastCatId) {
                groupedRows.push({
                    type: 'header',
                    catId: cid,
                    catName: p.category?.name || 'بدون قسم',
                    color: p.category ? catColor(p.category.name) : '#475569'
                });
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

    const kpis = [
        { title: 'إجمالي الأصناف', val: products.length, sub: `${categories.length} قسم`, icon: Layers, g: 'linear-gradient(135deg,#1d4ed8,#2563eb)', glo: '#2563eb' },
        { title: 'قيمة المخزون', val: `${(totalVal / 1000).toFixed(1)}K`, sub: 'ألف ريال سعودي', icon: DollarSign, g: 'linear-gradient(135deg,#065f46,#059669)', glo: '#10b981' },
        { title: 'منخفض المخزون', val: lowCount, sub: 'تحت 10 وحدات', icon: AlertTriangle, g: 'linear-gradient(135deg,#92400e,#d97706)', glo: '#f59e0b' },
        { title: 'نفد من المخزون', val: zeroCount, sub: 'يحتاج تعبئة فورية', icon: TrendingDown, g: 'linear-gradient(135deg,#7f1d1d,#dc2626)', glo: '#ef4444' },
        { title: 'الأقسام', val: categories.length, sub: 'قسم مخزوني', icon: Tag, g: 'linear-gradient(135deg,#4c1d95,#7c3aed)', glo: '#8b5cf6' },
    ];

    return (
        <div id="inv-root" className="mobile-padding-10" style={{ margin: '-20px', padding: '20px', background: '#060e1a', minHeight: 'calc(100vh - 60px)', fontFamily: 'Cairo, sans-serif', direction: 'rtl', color: 'white' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
                #inv-root, #inv-root * { font-family: 'Cairo', sans-serif !important; }
                #inv-root input::placeholder { font-family: 'Cairo', sans-serif !important; }
                #inv-root select option { font-family: 'Cairo', sans-serif !important; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            <div className="mobile-grid-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: '15px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
                        <Package size={20} style={{ display: 'inline', marginLeft: 8, color: '#3b82f6', verticalAlign: 'middle' }} />
                        إدارة المخزون
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '0.82rem' }}>
                        {filtered.length} صنف من {products.length} — آخر تحديث: الآن
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                    <button onClick={load}
                        style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.07)', cursor: 'pointer', color: '#60a5fa', fontFamily: 'Cairo', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <RefreshCw size={13} className={productsLoading ? 'animate-spin' : ''} /> تحديث
                    </button>
                    <button onClick={() => { setSel(null); setPForm({ name: '', cost: '', price: '', quantity: 0, categoryId: activeCat !== 'all' ? activeCat : '' }); setErr(''); setModal('add-p'); }}
                        style={{ padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 4px 16px rgba(37,99,235,0.4)', fontSize: '0.9rem' }}>
                        <Plus size={15} /> إضافة منتج
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, marginBottom: 22, scrollbarWidth: 'none' }}>
                {kpis.map(({ title, val, sub, icon: Icon, g, glo }) => (
                    <div key={title} style={{ flexShrink: 0, width: 210, borderRadius: 16, background: g, padding: '18px 16px', position: 'relative', overflow: 'hidden', boxShadow: `0 8px 32px ${glo}25`, border: `1px solid ${glo}30` }}>
                        <div style={{ position: 'absolute', top: -8, right: -8, opacity: 0.10, pointerEvents: 'none' }}>
                            <Icon size={75} />
                        </div>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <Icon size={18} color="rgba(255,255,255,0.9)" style={{ marginBottom: 8, display: 'block' }} />
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 5 }}>{val}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{title}</div>
                            <div style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>{sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginBottom: 14 }}>
                <style>{`
                    .tabs-container::-webkit-scrollbar {
                        height: 5px;
                    }
                    .tabs-container::-webkit-scrollbar-track {
                        background: rgba(255,255,255,0.02);
                        border-radius: 10px;
                    }
                    .tabs-container::-webkit-scrollbar-thumb {
                        background: rgba(59,130,246,0.3);
                        border-radius: 10px;
                    }
                    .tabs-container::-webkit-scrollbar-thumb:hover {
                        background: rgba(59,130,246,0.5);
                    }
                `}</style>
                <div className="tabs-container" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, alignItems: 'center', WebkitOverflowScrolling: 'touch' }}>
                    <button onClick={() => setActiveCat('all')}
                        style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 50, border: activeCat === 'all' ? '1.5px solid #3b82f6' : '1.5px solid rgba(255,255,255,0.07)', background: activeCat === 'all' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', color: activeCat === 'all' ? '#60a5fa' : '#64748b', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.82rem' }}>
                        🏠 جميع المنتجات <span style={{ background: activeCat === 'all' ? '#3b82f6' : 'rgba(255,255,255,0.08)', color: 'white', borderRadius: 50, padding: '1px 8px', fontSize: '0.72rem' }}>{products.length}</span>
                    </button>
                    {categories.map(c => {
                        const color = catColor(c.name);
                        const isActive = activeCat === c.id;
                        return (
                            <button key={c.id} onClick={() => setActiveCat(c.id)}
                                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 50, border: isActive ? `1.5px solid ${color}` : '1.5px solid rgba(255,255,255,0.07)', background: isActive ? `${color}18` : 'rgba(255,255,255,0.04)', color: isActive ? color : '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                                {c.name}
                                <span style={{ background: isActive ? `${color}30` : 'rgba(255,255,255,0.07)', color: isActive ? color : '#475569', borderRadius: 50, padding: '1px 7px', fontSize: '0.7rem' }}>{catCnt(c.id)}</span>
                            </button>
                        );
                    })}
                    <div style={{ marginRight: 'auto', flexShrink: 0, width: 20 }} />
                    <button onClick={() => setModal('add-cat')} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 50, border: '1.5px dashed rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.05)', color: '#3b82f6', fontSize: '0.78rem', cursor: 'pointer' }}>
                        <Plus size={12} /> إضافة قسم
                    </button>
                    <button onClick={() => setModal('mgr-cats')} style={{ flexShrink: 0, borderRadius: 50, border: '1.5px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.04)', color: '#475569', padding: '7px 10px', cursor: 'pointer' }}>
                        <Settings2 size={13} />
                    </button>
                </div>
            </div>

            <div className="mobile-grid-1" style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: '#0b1424', borderRadius: 12, padding: '10px 16px', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <Search size={15} color="#475569" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." style={{ flex: 1, border: 'none', background: 'transparent', color: 'white', outline: 'none' }} />
                </div>
            </div>

            <div style={{ background: '#0b1424', borderRadius: 16, border: '1px solid rgba(59,130,246,0.12)', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.35)' }}>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(59,130,246,0.06)', borderBottom: '1px solid rgba(59,130,246,0.12)' }}>
                                {['المنتج', 'القسم', 'الكمية / ±', 'التكلفة', 'سعر البيع', 'الحالة', 'إجراءات'].map(l => (
                                    <th key={l} style={{ padding: '11px 10px', textAlign: 'center', color: '#475569', fontSize: '0.7rem' }}>{l}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {productsLoading ? (
                                <tr><td colSpan={7} style={{ padding: 60, textAlign: 'center' }}>
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="animate-pulse" style={{ height: 40, background: 'rgba(255,255,255,0.03)', marginBottom: 10, borderRadius: 8 }} />)}
                                </td></tr>
                            ) : groupedRows.map((item, idx) => {
                                if (item.type === 'header') {
                                    return <tr key={item.catId}><td colSpan={7} style={{ padding: '8px 16px', background: `${item.color}10`, color: item.color, fontWeight: 700, fontSize: '0.78rem' }}>{item.catName} ({catCnt(item.catId)})</td></tr>;
                                }
                                const p = item.product;
                                const qty = p.stocks?.[0]?.quantity ?? 0;
                                const cc = p.category ? catColor(p.category.name) : '#3b82f6';
                                const isMutationPending = productMutation.isPending && productMutation.variables?.id === p.id;

                                return (
                                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: isMutationPending ? 0.5 : 1 }}>
                                        <td style={{ padding: '0 14px', textAlign: 'right' }}>{p.name}</td>
                                        <td style={{ textAlign: 'center' }}>{p.category?.name || '—'}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                                <InlineQty product={p} onSave={setQty} isSaving={isMutationPending} />
                                                <QuickPM product={p} onAdjust={quickAdj} isSaving={isMutationPending} />
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{p.cost}</td>
                                        <td style={{ textAlign: 'center', color: '#10b981' }}>{p.price}</td>
                                        <td style={{ textAlign: 'center' }}>{qty > 0 ? 'متوفر' : 'نفد'}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                                <ActionBtn clr="#3b82f6" onClick={() => { setSel(p); setAdjForm({ quantity: 1, type: 'ADD' }); setModal('adj'); }}><BarChart3 size={12} /></ActionBtn>
                                                <ActionBtn clr="#a855f7" onClick={() => { setSel(p); setPForm({ name: p.name, cost: p.cost, price: p.price, quantity: p.stocks?.[0]?.quantity ?? 0, categoryId: p.categoryId || '' }); setModal('edit-p'); }}><Edit3 size={12} /></ActionBtn>
                                                <ActionBtn clr="#ef4444" onClick={() => delProduct(p.id)}><Trash2 size={12} /></ActionBtn>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal === 'add-p' && <Modal title="إضافة منتج" onClose={() => setModal(null)}><form onSubmit={saveProduct}><DField label="الاسم" value={pForm.name} onChange={e => setPForm({ ...pForm, name: e.target.value })} /><DField label="التكلفة" type="number" value={pForm.cost} onChange={e => setPForm({ ...pForm, cost: e.target.value })} /><DField label="السعر" type="number" value={pForm.price} onChange={e => setPForm({ ...pForm, price: e.target.value })} /><DField label="الكمية الأولية" type="number" value={pForm.quantity} onChange={e => setPForm({ ...pForm, quantity: e.target.value })} /><div style={{ display: 'flex', gap: 10 }}><button type="submit" style={dPriBtn}>{productMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}</button></div></form></Modal>}
            {modal === 'edit-p' && <Modal title="تعديل منتج" onClose={() => setModal(null)}><form onSubmit={saveProduct}><DField label="الاسم" value={pForm.name} onChange={e => setPForm({ ...pForm, name: e.target.value })} /><DField label="التكلفة" type="number" value={pForm.cost} onChange={e => setPForm({ ...pForm, cost: e.target.value })} /><DField label="السعر" type="number" value={pForm.price} onChange={e => setPForm({ ...pForm, price: e.target.value })} /><div style={{ display: 'flex', gap: 10 }}><button type="submit" style={dPriBtn}>{productMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}</button></div></form></Modal>}
            {modal === 'add-cat' && <Modal title="إضافة قسم" onClose={() => setModal(null)}><form onSubmit={saveCat}><DField label="القسم" value={cForm.name} onChange={e => setCForm({ ...cForm, name: e.target.value })} /><DField label="الوصف" value={cForm.description} onChange={e => setCForm({ ...cForm, description: e.target.value })} /><div style={{ display: 'flex', gap: 10 }}><button type="submit" style={dPriBtn}>حفظ</button></div></form></Modal>}
            {modal === 'mgr-cats' && (
                <Modal title="إدارة الأقسام" onClose={() => setModal(null)}>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {categories.map(c => (
                            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span>{c.name}</span>
                                <button onClick={() => delCat(c.id)} style={{ padding: '5px 10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer' }}><Trash2 size={12} /></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setModal('add-cat')} style={{ ...dPriBtn, width: '100%', marginTop: 15 }}>إضافة قسم جديد</button>
                </Modal>
            )}
            {modal === 'adj' && sel && (
                <Modal title="تعديل الكمية" onClose={() => setModal(null)}>
                    <form onSubmit={adjSave}>
                        <div style={{ padding: '15px', background: 'rgba(59,130,246,0.1)', borderRadius: 12, marginBottom: 15 }}>
                            <div style={{ fontWeight: 700 }}>{sel.name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#475569' }}>الكمية الحالية: {sel.stocks?.[0]?.quantity ?? 0}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                            <button type="button" onClick={() => setAdjForm({ ...adjForm, type: 'ADD' })} style={{ flex: 1, padding: 10, borderRadius: 10, border: adjForm.type === 'ADD' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)', color: adjForm.type === 'ADD' ? '#10b981' : '#475569' }}>إضافة</button>
                            <button type="button" onClick={() => setAdjForm({ ...adjForm, type: 'SUBTRACT' })} style={{ flex: 1, padding: 10, borderRadius: 10, border: adjForm.type === 'SUBTRACT' ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', color: adjForm.type === 'SUBTRACT' ? '#ef4444' : '#475569' }}>سحب</button>
                        </div>
                        <DField label="الكمية" type="number" value={adjForm.quantity} onChange={e => setAdjForm({ ...adjForm, quantity: e.target.value })} />
                        <button type="submit" style={dPriBtn}>{productMutation.isPending ? 'جاري التعديل...' : 'تحديث الكمية'}</button>
                    </form>
                </Modal>
            )}
        </div>
    );
}

const ActionBtn = ({ clr, onClick, children }) => (
    <button onClick={onClick} style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${clr}25`, background: `${clr}12`, color: clr, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</button>
);
const dPriBtn = { flex: 1, padding: '10px 16px', borderRadius: 10, background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' };
const dOutBtn = { flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontFamily: 'Cairo' };
