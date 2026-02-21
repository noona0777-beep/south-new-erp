import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../../config';
import { Shield, CreditCard, PieChart } from 'lucide-react';

const token = () => localStorage.getItem('token');

const BalanceSheet = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/reports/balance-sheet?date=${asOfDate}`, {
                headers: { Authorization: `Bearer ${token()}` }
            });
            setReport(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [asOfDate]);

    const format = (v) => Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2 });

    if (loading) return <div>جاري التحميل...</div>;
    if (!report) return <div>لا توجد بيانات</div>;

    return (
        <div style={{ direction: 'rtl' }}>
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>الميزانية العمومية</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748b' }}>حتى تاريخ:</label>
                    <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} style={{ border: 'none', background: 'transparent', fontFamily: 'Cairo', outline: 'none' }} />
                </div>
                <button onClick={() => window.print()} style={{ marginRight: 'auto', background: 'white', border: '1px solid #e2e8f0', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cairo' }}>🖨️ طباعة</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Assets */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ borderBottom: '2px solid #2563eb', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={20} color="#2563eb" /> الأصول (Assets)
                    </h3>
                    {report.assets.map(acc => (
                        <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                            <span>{acc.name}</span>
                            <span style={{ fontWeight: '600' }}>{format(acc.balance)} ر.س</span>
                        </div>
                    ))}
                    <div style={{ marginTop: '20px', padding: '15px', background: '#eff6ff', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>إجمالي الأصول</span>
                        <span>{format(report.totalAssets)} ر.س</span>
                    </div>
                </div>

                {/* Liabilities & Equity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Liabilities */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ borderBottom: '2px solid #ef4444', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CreditCard size={20} color="#ef4444" /> الالتزامات (Liabilities)
                        </h3>
                        {report.liabilities.map(acc => (
                            <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                                <span>{acc.name}</span>
                                <span style={{ fontWeight: '600' }}>{format(acc.balance)} ر.س</span>
                            </div>
                        ))}
                        <div style={{ marginTop: '10px', padding: '12px', background: '#fef2f2', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>إجمالي الالتزامات</span>
                            <span>{format(report.totalLiabilities)} ر.س</span>
                        </div>
                    </div>

                    {/* Equity */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ borderBottom: '2px solid #f59e0b', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <PieChart size={20} color="#f59e0b" /> حقوق الملكية (Equity)
                        </h3>
                        {report.equity.map(acc => (
                            <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                                <span>{acc.name}</span>
                                <span style={{ fontWeight: '600' }}>{format(acc.balance)} ر.س</span>
                            </div>
                        ))}
                        <div style={{ marginTop: '10px', padding: '12px', background: '#fffbeb', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>إجمالي حقوق الملكية</span>
                            <span>{format(report.totalEquity)} ر.س</span>
                        </div>
                    </div>

                    {/* Balance Check */}
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>مجموع (الالتزامات + حقوق الملكية)</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a' }}>
                            {format(report.totalLiabilities + report.totalEquity)} ر.س
                        </div>
                        {Math.abs(report.totalAssets - (report.totalLiabilities + report.totalEquity)) < 1 ? (
                            <div style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '5px' }}>✅ الميزانية متزنة</div>
                        ) : (
                            <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }}>⚠️ الميزانية غير متزنة</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BalanceSheet;
