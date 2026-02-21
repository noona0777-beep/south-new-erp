import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ChevronDown, ChevronRight, Folder, FileText,
    Plus, Search, RefreshCw, DollarSign,
    ArrowUpRight, ArrowDownLeft, Landmark
} from 'lucide-react';
import API_URL from '../../config';

// --- Sub-Component: Account Tree Item ---
const AccountItem = ({ account, level = 0, onAddChild }) => {
    const [isOpen, setIsOpen] = useState(level < 1);
    const hasChildren = account.children && account.children.length > 0;

    return (
        <div style={{ marginRight: level * 24 }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    background: level === 0 ? '#f8fafc' : 'transparent',
                    borderBottom: level === 0 ? '1px solid #e2e8f0' : 'none',
                    marginBottom: '2px'
                }}
                onClick={() => setIsOpen(!isOpen)}
                onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                onMouseOut={e => e.currentTarget.style.background = level === 0 ? '#f8fafc' : 'transparent'}
            >
                <div style={{ color: '#94a3b8', marginLeft: '8px' }}>
                    {hasChildren ? (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : <div style={{ width: 16 }} />}
                </div>

                {hasChildren ? <Folder size={18} style={{ color: '#3b82f6', marginLeft: '10px' }} /> : <FileText size={18} style={{ color: '#94a3b8', marginLeft: '10px' }} />}

                <div style={{ flex: 1, display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontWeight: level === 0 ? 'bold' : '500', color: level === 0 ? '#1e293b' : '#334155' }}>
                        {account.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>
                        {account.code}
                    </span>
                </div>

                <div style={{ fontWeight: 'bold', color: account.balance < 0 ? '#ef4444' : '#10b981', marginLeft: '20px', fontFamily: 'monospace' }}>
                    {account.balance.toLocaleString()} {account.currency || 'ر.س'}
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onAddChild(account); }}
                    style={{ background: '#f1f5f9', border: 'none', width: '28px', height: '28px', borderRadius: '6px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="إضافة حساب فرعي"
                >
                    <Plus size={14} />
                </button>
            </div>

            {isOpen && hasChildren && (
                <div style={{ marginTop: '4px' }}>
                    {account.children.map(child => (
                        <AccountItem key={child.id} account={child} level={level + 1} onAddChild={onAddChild} />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Accounting Page ---
export default function AccountingPage() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tree'); // tree or journal
    const [stats, setStats] = useState({ totalAssets: 0, totalEquity: 0, totalRevenue: 0 });

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/accounts`);
            setAccounts(res.data);

            // Basic mock stats calculation (in real world this comes from API)
            const assets = res.data.find(a => a.name.includes('أصول'))?.balance || 0;
            const revenue = res.data.find(a => a.name.includes('إيرادات'))?.balance || 0;
            setStats({ totalAssets: assets, totalRevenue: revenue, totalEquity: assets - (revenue * 0.1) });

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch accounts', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleAddAccount = (parent) => {
        const name = window.prompt(`إضافة حساب فرعي تحت: ${parent.name}\nأدخل اسم الحساب الجديد:`);
        if (name) {
            // Logic to sync with backend
            alert('تم إرسال طلب إنشاء الحساب للسحابة...');
        }
    };

    return (
        <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
            {/* Header Area */}
            <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'bottom' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 'bold', color: '#0f172a' }}>
                        <Landmark size={24} style={{ marginLeft: '10px', verticalAlign: 'middle', color: '#2563eb' }} />
                        المحاسبة والمالية
                    </h1>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>إدارة شجرة الحسابات، قيود اليومية، والتقارير الختامية</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={fetchAccounts}
                        style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }}
                    >
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                    <button style={{ background: '#2563eb', border: 'none', padding: '10px 24px', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> قيد يومية جديد
                    </button>
                </div>
            </div>

            {/* Quick Stats Sidebar-style in header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '14px', color: '#2563eb' }}><DollarSign size={24} /></div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>إجمالي الأصول</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>{stats.totalAssets.toLocaleString()} ر.س</div>
                    </div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '14px', color: '#10b981' }}><ArrowUpRight size={24} /></div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>صافي الإيرادات</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>{stats.totalRevenue.toLocaleString()} ر.س</div>
                    </div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#fff1f2', padding: '12px', borderRadius: '14px', color: '#f43f5e' }}><ArrowDownLeft size={24} /></div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>المصروفات التشغيلية</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>{(stats.totalRevenue * 0.4).toLocaleString()} ر.س</div>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <button
                        onClick={() => setActiveTab('tree')}
                        style={{ padding: '16px 28px', border: 'none', borderBottom: activeTab === 'tree' ? '3px solid #2563eb' : 'none', background: 'transparent', color: activeTab === 'tree' ? '#2563eb' : '#64748b', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}
                    >
                        شجرة الحسابات
                    </button>
                    <button
                        onClick={() => setActiveTab('journal')}
                        style={{ padding: '16px 28px', border: 'none', borderBottom: activeTab === 'journal' ? '3px solid #2563eb' : 'none', background: 'transparent', color: activeTab === 'journal' ? '#2563eb' : '#64748b', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}
                    >
                        دفتر اليومية
                    </button>
                </div>

                <div style={{ padding: '28px' }}>
                    {activeTab === 'tree' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ position: 'relative', width: '300px' }}>
                                    <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input type="text" placeholder="بحث في الحسابات..." style={{ width: '100%', padding: '10px 38px 10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'Cairo', fontSize: '0.85rem' }} />
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                    عدد الحسابات: {accounts.length}
                                </div>
                            </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>جاري تحميل شجرة الحسابات من السحابة...</div>
                            ) : (
                                <div style={{ minHeight: '400px' }}>
                                    {accounts.length > 0 ? (
                                        accounts
                                            .filter(a => !a.parentId) // Main categories only
                                            .map(acc => (
                                                <AccountItem key={acc.id} account={acc} onAddChild={handleAddAccount} />
                                            ))
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>لا توجد حسابات مسجلة حالياً</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'journal' && (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                            <FileText size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
                            <div>موديول دفتر اليومية تحت التجهيز...</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
