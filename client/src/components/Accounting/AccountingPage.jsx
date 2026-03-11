import { useState, useMemo } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ChevronDown, ChevronRight, Folder, FileText,
    Plus, RefreshCw, DollarSign, X, Check,
    ArrowUpRight, ArrowDownLeft, Landmark, Trash2, BookOpen, Clock, AlertOctagon
} from 'lucide-react';
import API_URL from '@/config';
import { useToast } from '../../context/ToastContext';
import { exportToExcel } from '../../utils/excelExport';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// =============================================
// Sub-Component: Account Tree Item
// =============================================
const AccountItem = ({ account, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(level < 1);
    const hasChildren = account.children && account.children.length > 0;

    const typeColor = {
        ASSET: '#3b82f6',
        LIABILITY: '#ef4444',
        EQUITY: '#8b5cf6',
        REVENUE: '#10b981',
        EXPENSE: '#f59e0b',
    }[account.type] || '#64748b';

    const typeLabel = {
        ASSET: 'أصول',
        LIABILITY: 'خصوم',
        EQUITY: 'ملكية',
        REVENUE: 'إيرادات',
        EXPENSE: 'مصروفات',
    }[account.type] || '';

    return (
        <div style={{ marginRight: level * 20 }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: hasChildren ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                    background: level === 0 ? '#f8fafc' : 'transparent',
                    borderBottom: level === 0 ? '1px solid #e2e8f0' : 'none',
                    marginBottom: '2px',
                    gap: '8px',
                    flexWrap: 'wrap'
                }}
                onClick={() => hasChildren && setIsOpen(!isOpen)}
                onMouseEnter={e => { if (level > 0) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (level > 0) e.currentTarget.style.background = 'transparent'; }}
            >
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '200px' }}>
                    <div style={{ color: '#94a3b8', marginLeft: '6px', minWidth: '16px' }}>
                        {hasChildren ? (isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />) : null}
                    </div>
                    {hasChildren
                        ? <Folder size={17} style={{ color: typeColor, marginLeft: '8px', flexShrink: 0 }} />
                        : <FileText size={17} style={{ color: '#cbd5e1', marginLeft: '8px', flexShrink: 0 }} />
                    }
                    <div style={{ flex: 1, display: 'flex', gap: '10px', alignItems: 'center', overflow: 'hidden' }}>
                        <span style={{ fontWeight: level === 0 ? 'bold' : '500', color: level === 0 ? '#1e293b' : '#334155', whiteSpace: 'nowrap' }}>
                            {account.name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: '#f1f5f9', padding: '1px 8px', borderRadius: '10px', flexShrink: 0 }}>
                            {account.code}
                        </span>
                    </div>
                    {level === 0 && (
                        <span style={{ fontSize: '0.72rem', color: typeColor, background: `${typeColor}15`, padding: '2px 8px', borderRadius: '10px', marginLeft: '8px', flexShrink: 0 }}>
                            {typeLabel}
                        </span>
                    )}
                </div>
                <div style={{ fontWeight: 'bold', color: (account.balance || 0) < 0 ? '#ef4444' : '#10b981', marginLeft: 'auto', fontFamily: 'monospace', fontSize: '0.9rem', flexShrink: 0 }}>
                    {(account.balance || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                </div>
            </div>
            {isOpen && hasChildren && (
                <div style={{ marginTop: '2px' }}>
                    {account.children.map(child => (
                        <AccountItem key={child.id} account={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

// =============================================
// Sub-Component: Journal Entry Row
// =============================================
const JournalRow = ({ entry }) => {
    const [open, setOpen] = useState(false);
    const totalDebit = entry.entries?.reduce((s, e) => s + (e.debit || 0), 0) || 0;
    const totalCredit = entry.entries?.reduce((s, e) => s + (e.credit || 0), 0) || 0;

    return (
        <>
            <tr
                onClick={() => setOpen(!open)}
                style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
                <td style={{ padding: '12px 14px', color: '#64748b' }}>
                    {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </td>
                <td style={{ padding: '12px 8px', fontWeight: '600', color: '#2563eb', fontFamily: 'monospace' }}>{entry.reference || '—'}</td>
                <td style={{ padding: '12px 8px', color: '#334155' }}>{entry.description}</td>
                <td style={{ padding: '12px 8px', color: '#64748b', fontSize: '0.85rem' }}>{new Date(entry.date).toLocaleDateString('ar-SA')}</td>
                <td style={{ padding: '12px 8px', color: '#10b981', fontWeight: 'bold', fontFamily: 'monospace' }}>{totalDebit.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: '12px 8px', color: '#3b82f6', fontWeight: 'bold', fontFamily: 'monospace' }}>{totalCredit.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}</td>
            </tr>
            {open && entry.entries?.map((line, i) => (
                <tr key={i} style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <td colSpan={2} />
                    <td style={{ padding: '8px 8px', fontSize: '0.83rem', color: '#64748b' }}>
                        ↳ {line.account?.name || 'حساب غير معروف'} <span style={{ color: '#94a3b8' }}>({line.account?.code})</span>
                    </td>
                    <td style={{ padding: '8px 8px', fontSize: '0.83rem', color: '#64748b' }}>{line.description || ''}</td>
                    <td style={{ padding: '8px 8px', fontSize: '0.85rem', color: '#10b981', fontFamily: 'monospace' }}>{line.debit > 0 ? line.debit.toLocaleString('ar-SA', { minimumFractionDigits: 2 }) : ''}</td>
                    <td style={{ padding: '8px 8px', fontSize: '0.85rem', color: '#3b82f6', fontFamily: 'monospace' }}>{line.credit > 0 ? line.credit.toLocaleString('ar-SA', { minimumFractionDigits: 2 }) : ''}</td>
                </tr>
            ))}
        </>
    );
};

// =============================================
// Modal: Create Journal Entry
// =============================================
const JournalModal = ({ accounts, onClose, onSave }) => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        reference: '',
    });
    const [lines, setLines] = useState([
        { accountId: '', debit: '', credit: '', description: '' },
        { accountId: '', debit: '', credit: '', description: '' },
    ]);
    const [error, setError] = useState('');

    const flatAccounts = [];
    const flatten = (list) => list.forEach(a => { flatAccounts.push(a); if (a.children) flatten(a.children); });
    flatten(accounts);
    const leafAccounts = flatAccounts.filter(a => !a.children || a.children.length === 0);

    const addLine = () => setLines(l => [...l, { accountId: '', debit: '', credit: '', description: '' }]);
    const removeLine = (i) => setLines(l => l.filter((_, idx) => idx !== i));
    const updateLine = (i, field, val) => setLines(l => l.map((line, idx) => idx === i ? { ...line, [field]: val } : line));

    const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

    const journalMutation = useMutation({
        mutationFn: async (data) => await axios.post(`${API_URL}/journal`, data, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journal'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            showToast('تم تسجيل قيد اليومية بنجاح', 'success');
            onSave();
            onClose();
        },
        onError: (err) => {
            const msg = err.response?.data?.error || 'فشل في الحفظ';
            setError(msg);
            showToast(msg, 'error');
        }
    });

    const handleSave = () => {
        if (!form.description) return setError('أدخل وصف القيد');
        if (!isBalanced) return setError('المدين والدائن يجب أن يكونا متساويين');
        const validLines = lines.filter(l => l.accountId && (parseFloat(l.debit) || parseFloat(l.credit)));
        if (validLines.length < 2) return setError('القيد يحتاج على الأقل سطرين');

        journalMutation.mutate({
            date: form.date,
            description: form.description,
            reference: form.reference,
            entries: validLines.map(l => ({
                accountId: parseInt(l.accountId),
                debit: parseFloat(l.debit) || 0,
                credit: parseFloat(l.credit) || 0,
                description: l.description,
            }))
        });
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '20px', width: '900px', maxWidth: '95vw', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
                {/* Header */}
                <div style={{ padding: '20px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <BookOpen size={20} color="#60a5fa" />
                        <h2 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 'bold' }}>قيد يومية جديد</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
                    {/* Meta Fields */}
                    <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        {[
                            { label: 'التاريخ', key: 'date', type: 'date' },
                            { label: 'الوصف*', key: 'description', type: 'text', placeholder: 'مثال: تسجيل فاتورة مبيعات' },
                            { label: 'المرجع', key: 'reference', type: 'text', placeholder: 'مثال: INV-001' },
                        ].map(f => (
                            <div key={f.key}>
                                <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                                <input
                                    type={f.type}
                                    value={form[f.key]}
                                    placeholder={f.placeholder}
                                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Lines Table */}
                    <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    {['الحساب', 'وصف السطر', 'مدين (ر.س)', 'دائن (ر.س)', ''].map((h, i) => (
                                        <th key={i} style={{ padding: '10px 12px', textAlign: 'right', fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {lines.map((line, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '8px 12px', width: '35%' }}>
                                            <select
                                                value={line.accountId}
                                                onChange={e => updateLine(i, 'accountId', e.target.value)}
                                                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.85rem', background: 'white', outline: 'none' }}
                                            >
                                                <option value="">-- اختر حساباً --</option>
                                                {leafAccounts.map(a => (
                                                    <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{ padding: '8px 8px', width: '25%' }}>
                                            <input
                                                type="text"
                                                value={line.description}
                                                placeholder="اختياري"
                                                onChange={e => updateLine(i, 'description', e.target.value)}
                                                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }}
                                            />
                                        </td>
                                        <td style={{ padding: '8px 8px', width: '15%' }}>
                                            <input
                                                type="number"
                                                value={line.debit}
                                                placeholder="0.00"
                                                min="0"
                                                onChange={e => { updateLine(i, 'debit', e.target.value); if (e.target.value) updateLine(i, 'credit', ''); }}
                                                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', textAlign: 'left' }}
                                            />
                                        </td>
                                        <td style={{ padding: '8px 8px', width: '15%' }}>
                                            <input
                                                type="number"
                                                value={line.credit}
                                                placeholder="0.00"
                                                min="0"
                                                onChange={e => { updateLine(i, 'credit', e.target.value); if (e.target.value) updateLine(i, 'debit', ''); }}
                                                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', textAlign: 'left' }}
                                            />
                                        </td>
                                        <td style={{ padding: '8px 8px', width: '10%', textAlign: 'center' }}>
                                            {lines.length > 2 && (
                                                <button onClick={() => removeLine(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                                <tr>
                                    <td colSpan={2} style={{ padding: '10px 12px', fontWeight: 'bold', color: '#64748b', fontSize: '0.85rem' }}>الإجمالي</td>
                                    <td style={{ padding: '10px 8px', fontWeight: 'bold', color: '#10b981', fontFamily: 'monospace' }}>{totalDebit.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}</td>
                                    <td style={{ padding: '10px 8px', fontWeight: 'bold', color: '#3b82f6', fontFamily: 'monospace' }}>{totalCredit.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}</td>
                                    <td />
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <button onClick={addLine} style={{ background: 'none', border: '1px dashed #cbd5e1', color: '#64748b', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Cairo' }}>
                        + إضافة سطر
                    </button>

                    {error && <div style={{ marginTop: '12px', color: '#ef4444', background: '#fef2f2', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>⚠️ {error}</div>}
                </div>

                {/* Footer */}
                <div className="mobile-grid-1" style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isBalanced
                            ? <span style={{ color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={16} /> القيد متوازن</span>
                            : <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>⚖️ الفرق: {Math.abs(totalDebit - totalCredit).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س</span>
                        }
                    </div>
                    <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'flex-end' }}>
                        <button onClick={onClose} style={{ flex: 1, maxWidth: '120px', padding: '10px 24px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontFamily: 'Cairo' }}>إلغاء</button>
                        <button onClick={handleSave} disabled={journalMutation.isPending || !isBalanced} style={{ flex: 1, maxWidth: '160px', padding: '10px 28px', borderRadius: '10px', border: 'none', background: isBalanced ? '#2563eb' : '#94a3b8', color: 'white', cursor: isBalanced ? 'pointer' : 'not-allowed', fontFamily: 'Cairo', fontWeight: 'bold' }}>
                            {journalMutation.isPending ? '...جاري الحفظ' : '💾 حفظ القيد'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// =============================================
// Modal: Add New Account
// =============================================
const AccountModal = ({ accounts, onClose, onSave }) => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [form, setForm] = useState({ name: '', code: '', type: 'ASSET', parentId: '' });
    const [error, setError] = useState('');

    const flatAccounts = [];
    const flatten = (list) => list.forEach(a => { flatAccounts.push(a); if (a.children) flatten(a.children); });
    flatten(accounts);

    const accountMutation = useMutation({
        mutationFn: async (data) => await axios.post(`${API_URL}/accounts`, data, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            showToast('تم إنشاء الحساب المالي بنجاح', 'success');
            onSave();
            onClose();
        },
        onError: (err) => {
            const msg = err.response?.data?.error || 'فشل في إنشاء الحساب';
            setError(msg);
            showToast(msg, 'error');
        }
    });

    const handleSave = () => {
        if (!form.name || !form.code) return setError('الاسم والرمز مطلوبان');
        accountMutation.mutate({
            name: form.name,
            code: form.code,
            type: form.type,
            parentId: form.parentId ? parseInt(form.parentId) : null,
        });
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '20px', width: '480px', maxWidth: '95vw', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Folder size={20} color="#60a5fa" />
                        <h2 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 'bold' }}>حساب جديد</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                        { label: 'اسم الحساب*', key: 'name', type: 'text', placeholder: 'مثال: بنك الإنماء' },
                        { label: 'رمز الحساب*', key: 'code', type: 'text', placeholder: 'مثال: 1103' },
                    ].map(f => (
                        <div key={f.key}>
                            <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                            <input
                                type={f.type}
                                value={form[f.key]}
                                placeholder={f.placeholder}
                                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }}
                            />
                        </div>
                    ))}

                    <div>
                        <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '6px' }}>نوع الحساب*</label>
                        <select
                            value={form.type}
                            onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', background: 'white', outline: 'none' }}
                        >
                            <option value="ASSET">أصول</option>
                            <option value="LIABILITY">خصوم</option>
                            <option value="EQUITY">حقوق الملكية</option>
                            <option value="REVENUE">إيرادات</option>
                            <option value="EXPENSE">مصروفات</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '6px' }}>الحساب الأب (اختياري)</label>
                        <select
                            value={form.parentId}
                            onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', background: 'white', outline: 'none' }}
                        >
                            <option value="">-- لا يوجد (حساب رئيسي) --</option>
                            {flatAccounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                            ))}
                        </select>
                    </div>

                    {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>⚠️ {error}</div>}
                </div>

                <div style={{ padding: '16px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontFamily: 'Cairo' }}>إلغاء</button>
                    <button onClick={handleSave} disabled={accountMutation.isPending} style={{ padding: '10px 28px', borderRadius: '10px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        {accountMutation.isPending ? '...جاري الحفظ' : '✅ إنشاء الحساب'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// =============================================
// Main: AccountingPage
// =============================================
export default function AccountingPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('tree');
    const [showJournalModal, setShowJournalModal] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);

    const handleExportJournal = () => {
        const exportData = [];
        journal.forEach(entry => {
            entry.entries?.forEach(line => {
                exportData.push({
                    'تاريخ القيد': new Date(entry.date).toLocaleDateString('ar-SA'),
                    'رقم المرجع': entry.reference || '—',
                    'البيان الأساسي': entry.description,
                    'اسم الحساب': line.account?.name || 'غير معروف',
                    'رمز الحساب': line.account?.code || '—',
                    'وصف السطر': line.description || '',
                    'مدين (ر.س)': line.debit || 0,
                    'دائن (ر.س)': line.credit || 0
                });
            });
        });
        exportToExcel(exportData, `دفتر_اليومية_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}`, 'قيود اليومية');
    };

    // Queries
    const { data: accounts = [], isLoading: accountsLoading, error: accountsError } = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => (await axios.get(`${API_URL}/accounts`, { headers: H() })).data
    });

    const { data: journal = [], isLoading: journalLoading, error: journalError } = useQuery({
        queryKey: ['journal'],
        queryFn: async () => (await axios.get(`${API_URL}/journal`, { headers: H() })).data
    });

    const isLoading = accountsLoading || journalLoading;

    // Memoized Calculations
    const accountTree = useMemo(() => {
        const map = {};
        accounts.forEach(a => { map[a.id] = { ...a, children: [] }; });
        const roots = [];
        accounts.forEach(a => {
            if (a.parentId && map[a.parentId]) {
                map[a.parentId].children.push(map[a.id]);
            } else {
                roots.push(map[a.id]);
            }
        });
        return roots;
    }, [accounts]);

    const stats = useMemo(() => {
        const totalAssets = accounts
            .filter(a => a.type === 'ASSET')
            .reduce((sum, a) => sum + (a.balance || 0), 0);
        const totalRevenue = accounts
            .filter(a => a.type === 'REVENUE')
            .reduce((sum, a) => sum + Math.abs(a.balance || 0), 0);
        const totalExpenses = accounts
            .filter(a => a.type === 'EXPENSE')
            .reduce((sum, a) => sum + Math.abs(a.balance || 0), 0);
        const netProfit = totalRevenue - totalExpenses;
        return { totalAssets, totalRevenue, totalExpenses, netProfit };
    }, [accounts]);

    const statCards = [
        { label: 'إجمالي الأصول', value: stats.totalAssets, color: '#2563eb', bg: '#eff6ff', icon: <Landmark size={22} /> },
        { label: 'الإيرادات', value: stats.totalRevenue, color: '#10b981', bg: '#ecfdf5', icon: <ArrowUpRight size={22} /> },
        { label: 'المصروفات', value: stats.totalExpenses, color: '#ef4444', bg: '#fef2f2', icon: <ArrowDownLeft size={22} /> },
        { label: 'صافي الربح', value: stats.netProfit, color: stats.netProfit >= 0 ? '#10b981' : '#ef4444', bg: stats.netProfit >= 0 ? '#ecfdf5' : '#fef2f2', icon: <DollarSign size={22} /> },
    ];

    if (accountsError || journalError) {
        return (
            <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444', background: 'white', borderRadius: '16px' }}>
                <AlertOctagon size={32} style={{ margin: '0 auto 16px', display: 'block' }} />
                خطأ في تحميل البيانات المالية. يرجى المحاولة مرة أخرى.
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
            {/* Header */}
            <div className="mobile-grid-1" style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Landmark size={26} style={{ color: '#2563eb' }} />
                        المحاسبة والمالية
                    </h1>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>إدارة الحسابات والقيود • متصل بالسحابة</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => { queryClient.invalidateQueries(['accounts']); queryClient.invalidateQueries(['journal']); }} title="تحديث" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <RefreshCw size={18} color="#64748b" className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setShowAccountModal(true)} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo', color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={17} /> حساب جديد
                    </button>
                    <button onClick={() => setShowJournalModal(true)} style={{ background: '#2563eb', border: 'none', padding: '10px 22px', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={17} /> قيد يومية جديد
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '28px' }}>
                {statCards.map((s, i) => (
                    <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>{s.label}</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: s.color, fontFamily: 'monospace' }}>
                                    {s.value.toLocaleString('ar-SA', { minimumFractionDigits: 0 })} ر.س
                                </div>
                            </div>
                            <div style={{ padding: '10px', background: s.bg, borderRadius: '12px', color: s.color, flexShrink: 0 }}>
                                {s.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
                    {[
                        { key: 'tree', label: '🌳 شجرة الحسابات' },
                        { key: 'journal', label: '📖 دفتر اليومية' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '16px 28px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.key ? '3px solid #2563eb' : '3px solid transparent',
                                color: activeTab === tab.key ? '#2563eb' : '#64748b',
                                fontWeight: activeTab === tab.key ? '700' : '500',
                                cursor: 'pointer',
                                fontFamily: 'Cairo',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ padding: '24px' }}>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '1rem' }}>
                            <Clock size={32} className="animate-spin" style={{ marginBottom: '12px', color: '#2563eb', display: 'inline-block' }} />
                            <div>جاري التحميل من السحابة...</div>
                        </div>
                    ) : (
                        <>
                            {/* Account Tree Tab */}
                            {activeTab === 'tree' && (
                                <div>
                                    {accountTree.length > 0 ? (
                                        accountTree.map(acc => <AccountItem key={acc.id} account={acc} />)
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                                            <Folder size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                            <div>لا توجد حسابات. اضغط "حساب جديد" للبدء.</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Journal Tab */}
                            {activeTab === 'journal' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                                        <button onClick={handleExportJournal} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981', border: 'none', padding: '10px 18px', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
                                            <FileText size={18} />
                                            تصدير Excel
                                        </button>
                                    </div>
                                    {journal.length > 0 ? (
                                        <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                                                <thead style={{ background: '#f8fafc' }}>
                                                    <tr>
                                                        <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: '0.8rem', color: '#64748b', width: '40px' }}></th>
                                                        <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>المرجع</th>
                                                        <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>الوصف</th>
                                                        <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>التاريخ</th>
                                                        <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.8rem', color: '#10b981' }}>مدين</th>
                                                        <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.8rem', color: '#3b82f6' }}>دائن</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {journal.map(entry => <JournalRow key={entry.id} entry={entry} />)}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                                            <BookOpen size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                            <div>لا توجد قيود. اضغط "قيد يومية جديد" لإنشاء أول قيد.</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showJournalModal && (
                <JournalModal
                    accounts={accountTree}
                    onClose={() => setShowJournalModal(false)}
                    onSave={() => { }}
                />
            )}
            {showAccountModal && (
                <AccountModal
                    accounts={accountTree}
                    onClose={() => setShowAccountModal(false)}
                    onSave={() => { }}
                />
            )}
        </div>
    );
}
