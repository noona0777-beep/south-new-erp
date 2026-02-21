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
                    {(account.balance || 0).toLocaleString()} ر.س
                </div>
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
    const [journal, setJournal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tree');
    const [stats, setStats] = useState({ totalAssets: 0, totalEquity: 0, totalRevenue: 0 });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [accRes, journalRes] = await Promise.all([
                axios.get(`${API_URL}/accounts`),
                axios.get(`${API_URL}/journal`)
            ]);

            setAccounts(accRes.data || []);
            setJournal(journalRes.data || []);

            // Calculate real balance stats
            const assets = accRes.data.filter(a => a.type === 'ASSET').reduce((sum, a) => sum + (a.balance || 0), 0);
            const revenue = accRes.data.filter(a => a.type === 'REVENUE').reduce((sum, a) => sum + (Math.abs(a.balance) || 0), 0);
            setStats({ totalAssets: assets, totalRevenue: revenue, totalEquity: 0 });

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch data', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
            <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 'bold', color: '#0f172a' }}>
                        <Landmark size={24} style={{ marginLeft: '10px', verticalAlign: 'middle', color: '#2563eb' }} />
                        المحاسبة والمالية
                    </h1>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>إدارة الحسابات والقيود أونلاين</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={fetchData} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}>
                        <RefreshCw size={18} />
                    </button>
                    <button style={{ background: '#2563eb', border: 'none', padding: '10px 24px', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                        + قيد يومية جديد
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>إجمالي الأصول</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#2563eb' }}>{stats.totalAssets.toLocaleString()} ر.س</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>صافي الإيرادات</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981' }}>{stats.totalRevenue.toLocaleString()} ر.س</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>المصروفات</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f43f5e' }}>0 ر.س</div>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <button onClick={() => setActiveTab('tree')} style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'tree' ? '3px solid #2563eb' : 'none', color: activeTab === 'tree' ? '#2563eb' : '#64748b', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>شجرة الحسابات</button>
                    <button onClick={() => setActiveTab('journal')} style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'journal' ? '3px solid #2563eb' : 'none', color: activeTab === 'journal' ? '#2563eb' : '#64748b', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>دفتر اليومية</button>
                </div>

                <div style={{ padding: '24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>جاري التحميل من السحابة...</div>
                    ) : (
                        <>
                            {activeTab === 'tree' && (
                                <div>
                                    {accounts.length > 0 ? (
                                        accounts.filter(a => !a.parentId).map(acc => (
                                            <AccountItem key={acc.id} account={acc} />
                                        ))
                                    ) : <div style={{ textAlign: 'center', color: '#94a3b8' }}>لا توجد حسابات</div>}
                                </div>
                            )}

                            {activeTab === 'journal' && (
                                <div>
                                    {journal.length > 0 ? (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#f8fafc' }}>
                                                <tr>
                                                    <th style={{ padding: '12px', textAlign: 'right' }}>المرجع</th>
                                                    <th style={{ padding: '12px', textAlign: 'right' }}>الوصف</th>
                                                    <th style={{ padding: '12px', textAlign: 'right' }}>التاريخ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {journal.map(j => (
                                                    <tr key={j.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{j.reference}</td>
                                                        <td style={{ padding: '12px' }}>{j.description}</td>
                                                        <td style={{ padding: '12px' }}>{new Date(j.date).toLocaleDateString('ar-SA')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <div style={{ textAlign: 'center', color: '#94a3b8' }}>لا توجد قيود</div>}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
