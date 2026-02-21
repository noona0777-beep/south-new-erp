import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../../config';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const token = () => localStorage.getItem('token');

const IncomeStatement = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/reports/income-statement?startDate=${startDate}&endDate=${endDate}`, {
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
    }, [startDate, endDate]);

    const format = (v) => Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2 });

    if (loading) return <div>جاري التحميل...</div>;
    if (!report) return <div>لا توجد بيانات</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px', background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748b' }}>من:</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', fontFamily: 'Cairo' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748b' }}>إلى:</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', fontFamily: 'Cairo' }} />
                </div>
                <button onClick={() => window.print()} style={{ marginRight: 'auto', background: 'white', border: '1px solid #e2e8f0', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cairo', fontSize: '0.9rem' }}>🖨️ طباعة</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>قائمة الدخل</h1>
                <p style={{ color: '#64748b' }}>للفترة من {startDate} إلى {endDate}</p>
            </div>

            {/* Revenues */}
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={20} /> الإيرادات
                </h3>
                {report.revenues.map(acc => (
                    <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dotted #e2e8f0' }}>
                        <span>{acc.name}</span>
                        <span style={{ fontWeight: '600' }}>{format(acc.balance)} ر.س</span>
                    </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a' }}>
                    <span>إجمالي الإيرادات</span>
                    <span>{format(report.totalRevenue)} ر.س</span>
                </div>
            </div>

            {/* Expenses */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingDown size={20} /> المصروفات
                </h3>
                {report.expenses.map(acc => (
                    <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dotted #e2e8f0' }}>
                        <span>{acc.name}</span>
                        <span style={{ fontWeight: '600', color: '#64748b' }}>{format(acc.balance)} ر.س</span>
                    </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a' }}>
                    <span>إجمالي المصروفات</span>
                    <span>{format(report.totalExpenses)} ر.س</span>
                </div>
            </div>

            {/* Net Income */}
            <div style={{
                background: report.netIncome >= 0 ? '#ecfdf5' : '#fef2f2',
                padding: '24px', borderRadius: '16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                border: `1px solid ${report.netIncome >= 0 ? '#10b981' : '#ef4444'}`
            }}>
                <div>
                    <h2 style={{ margin: 0, color: report.netIncome >= 0 ? '#065f46' : '#991b1b', fontSize: '1.5rem' }}>
                        {report.netIncome >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>بعد خصم كافة المصاريف</p>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: report.netIncome >= 0 ? '#10b981' : '#ef4444' }}>
                    {format(report.netIncome)} ر.س
                </div>
            </div>
        </div>
    );
};

export default IncomeStatement;
