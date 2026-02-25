import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import API_URL from '../../../config';
import { TrendingUp, TrendingDown, DollarSign, Clock, AlertOctagon } from 'lucide-react';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const IncomeStatement = () => {
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const { data: report, isLoading, error } = useQuery({
        queryKey: ['report', 'income-statement', startDate, endDate],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/reports/income-statement?startDate=${startDate}&endDate=${endDate}`, {
                headers: H()
            });
            return res.data;
        }
    });

    const format = (v) => Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2 });

    if (isLoading) return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <Clock className="animate-spin" size={24} style={{ marginBottom: 10, display: 'block', margin: '0 auto' }} />
            جاري التحميل...
        </div>
    );

    if (error) return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444', background: '#fef2f2', borderRadius: 12 }}>
            <AlertOctagon size={24} style={{ marginBottom: 10, display: 'block', margin: '0 auto' }} />
            خطأ في تحميل قائمة الدخل
        </div>
    );

    if (!report) return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            لا توجد بيانات للفترة المحددة
        </div>
    );

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '20px 24px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
            <div className="no-print mobile-grid-1" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px', background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '150px' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>من:</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', fontFamily: 'Cairo' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '150px' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>إلى:</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', fontFamily: 'Cairo' }} />
                </div>
                <button onClick={() => window.print()} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cairo', fontSize: '0.9rem', width: 'fit-content' }}>🖨️ طباعة</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#0f172a' }}>قائمة الدخل</h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>للفترة من {startDate} إلى {endDate}</p>
            </div>

            {/* Revenues */}
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                    <TrendingUp size={20} /> الإيرادات
                </h3>
                {report.revenues.map(acc => (
                    <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dotted #e2e8f0', gap: '10px' }}>
                        <span style={{ fontSize: '0.95rem' }}>{acc.name}</span>
                        <span style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>{format(acc.balance)} ر.س</span>
                    </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontWeight: 'bold', fontSize: '1rem', color: '#0f172a' }}>
                    <span>إجمالي الإيرادات</span>
                    <span>{format(report.totalRevenue)} ر.س</span>
                </div>
            </div>

            {/* Expenses */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                    <TrendingDown size={20} /> المصروفات
                </h3>
                {report.expenses.map(acc => (
                    <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dotted #e2e8f0', gap: '10px' }}>
                        <span style={{ fontSize: '0.95rem' }}>{acc.name}</span>
                        <span style={{ fontWeight: '600', color: '#64748b', whiteSpace: 'nowrap' }}>{format(acc.balance)} ر.س</span>
                    </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontWeight: 'bold', fontSize: '1rem', color: '#0f172a' }}>
                    <span>إجمالي المصروفات</span>
                    <span>{format(report.totalExpenses)} ر.س</span>
                </div>
            </div>

            {/* Net Income */}
            <div style={{
                background: report.netIncome >= 0 ? '#ecfdf5' : '#fef2f2',
                padding: '20px', borderRadius: '16px',
                display: 'flex', flexDirection: window.innerWidth < 600 ? 'column' : 'row',
                justifyContent: 'space-between', alignItems: window.innerWidth < 600 ? 'flex-start' : 'center',
                border: `1px solid ${report.netIncome >= 0 ? '#10b981' : '#ef4444'}`,
                gap: '12px'
            }}>
                <div>
                    <h2 style={{ margin: 0, color: report.netIncome >= 0 ? '#065f46' : '#991b1b', fontSize: '1.4rem' }}>
                        {report.netIncome >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>بعد خصم كافة المصاريف</p>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: report.netIncome >= 0 ? '#10b981' : '#ef4444' }}>
                    {format(report.netIncome)} ر.س
                </div>
            </div>
        </div>
    );
};

export default IncomeStatement;
