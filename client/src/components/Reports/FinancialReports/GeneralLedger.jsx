import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import API_URL from '../../../config';
import { Search, Printer, Download, ArrowRight, ArrowLeft, Clock, AlertOctagon } from 'lucide-react';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const GeneralLedger = () => {
    const [selectedAccount, setSelectedAccount] = useState('');
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Fetch account list for dropdown
    const { data: accounts = [] } = useQuery({
        queryKey: ['report', 'account-list'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/reports/trial-balance`, { headers: H() });
            return res.data;
        }
    });

    // Fetch ledger movements (only if account is selected)
    const { data: report, isLoading, error, refetch } = useQuery({
        queryKey: ['report', 'general-ledger', selectedAccount, startDate, endDate],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/reports/general-ledger?accountId=${selectedAccount}&startDate=${startDate}&endDate=${endDate}`, {
                headers: H()
            });
            return res.data;
        },
        enabled: !!selectedAccount
    });

    const format = (v) => v === 0 ? '-' : Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2 });

    return (
        <div style={{ background: 'white', padding: '20px 24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            {/* Filters Section */}
            <div className="no-print mobile-grid-1" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'flex-end', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>اختيار الحساب:</label>
                    <select
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', width: '100%' }}
                    >
                        <option value="">-- اختر حساباً --</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>[{acc.code}] {acc.name}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '150px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>من تاريخ:</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'Cairo' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '150px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>إلى تاريخ:</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'Cairo' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: 'fit-content' }}>
                    <button
                        onClick={() => refetch()}
                        style={{ padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}
                    >
                        <Search size={18} /> تحديث الكشف
                    </button>
                    <button onClick={() => window.print()} style={{ padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                        <Printer size={18} />
                    </button>
                </div>
            </div>

            {isLoading && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <Clock className="animate-spin" size={24} style={{ marginBottom: 10, display: 'block', margin: '0 auto' }} />
                    جاري التحميل...
                </div>
            )}

            {error && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444', background: '#fef2f2', borderRadius: 12 }}>
                    <AlertOctagon size={24} style={{ marginBottom: 10, display: 'block', margin: '0 auto' }} />
                    خطأ في تحميل كشف الحساب
                </div>
            )}

            {report && !isLoading && (
                <div className="fade-in">
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.4rem' }}>كشف حساب تفصيلي</h2>
                        <p style={{ margin: '8px 0', color: '#64748b', fontSize: '0.95rem' }}>الحساب: <strong>{report.account.name} ({report.account.code})</strong></p>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>للفترة من {startDate} إلى {endDate}</p>
                    </div>

                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', direction: 'rtl', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>التاريخ</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>البيان / الوصف</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>المرجع</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>مدين (+)</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>دائن (-)</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>الرصيد</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ background: '#fafafa', fontWeight: '600' }}>
                                    <td style={{ padding: '12px' }}>{startDate}</td>
                                    <td style={{ padding: '12px' }} colSpan="4">رصيد أول المدة (افتتاحي)</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>{format(report.openingBalance)}</td>
                                </tr>
                                {report.movements.map(m => (
                                    <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>{new Date(m.date).toLocaleDateString('ar-SA')}</td>
                                        <td style={{ padding: '12px' }}>{m.description}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>{m.reference}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', color: '#10b981' }}>{format(m.debit)}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', color: '#ef4444' }}>{format(m.credit)}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>{format(m.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: '#0f172a', color: 'white', fontWeight: 'bold' }}>
                                    <td style={{ padding: '15px' }}>{endDate}</td>
                                    <td style={{ padding: '15px' }} colSpan="4">الرصيد الختامي في نهاية الفترة</td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>{format(report.closingBalance)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {!report && !isLoading && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                    يرجى اختيار الحساب والفترة التاريخية لعرض كشف الحساب
                </div>
            )}
        </div>
    );
};

export default GeneralLedger;
