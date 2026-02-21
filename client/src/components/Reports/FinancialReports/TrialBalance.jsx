import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../../config';
import { Printer, Download } from 'lucide-react';

const token = () => localStorage.getItem('token');

const TrialBalance = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API_URL}/reports/trial-balance`, {
                    headers: { Authorization: `Bearer ${token()}` }
                });
                setAccounts(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const totalDebit = accounts.reduce((s, a) => s + (a.balance > 0 ? a.balance : 0), 0);
    const totalCredit = accounts.reduce((s, a) => s + (a.balance < 0 ? Math.abs(a.balance) : 0), 0);

    const format = (v) => v === 0 ? '-' : v.toLocaleString(undefined, { minimumFractionDigits: 2 });

    if (loading) return <div>جاري التحميل...</div>;

    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold' }}>ميزان المراجعة</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
                        <Printer size={16} /> طباعة
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer' }}>
                        <Download size={16} /> تصدير Excel
                    </button>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', direction: 'rtl' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '12px', textAlign: 'right' }}>كود الحساب</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>اسم الحساب</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>مدين (Debit)</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>دائن (Credit)</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map(acc => (
                        <tr key={acc.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                            <td style={{ padding: '12px', color: '#64748b' }}>{acc.code}</td>
                            <td style={{ padding: '12px', fontWeight: '600' }}>{acc.name}</td>
                            <td style={{ padding: '12px', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>
                                {acc.balance > 0 ? format(acc.balance) : '-'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', color: '#ef4444', fontWeight: 'bold' }}>
                                {acc.balance < 0 ? format(Math.abs(acc.balance)) : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
                tfoot
                <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 'bold', fontSize: '1.1rem', borderTop: '2px solid #e2e8f0' }}>
                        <td colSpan="2" style={{ padding: '15px', textAlign: 'left' }}>المجموع الإجمالي:</td>
                        <td style={{ padding: '15px', textAlign: 'center', color: '#10b981' }}>{format(totalDebit)}</td>
                        <td style={{ padding: '15px', textAlign: 'center', color: '#ef4444' }}>{format(totalCredit)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default TrialBalance;
