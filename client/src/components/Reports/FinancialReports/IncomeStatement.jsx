import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import API_URL from '@/config';
import { TrendingUp, TrendingDown, DollarSign, Clock, AlertOctagon, FileText } from 'lucide-react';
import { exportToExcel } from '../../../utils/excelExport';

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

    const handleExportExcel = () => {
        if (!report) return;
        const exportData = [];
        
        exportData.push({ 'نوع البند': 'الإيرادات', 'اسم الحساب': '', 'المبلغ (ر.س)': '' });
        report.revenues.forEach(r => exportData.push({ 'نوع البند': '', 'اسم الحساب': r.name, 'المبلغ (ر.س)': r.balance }));
        exportData.push({ 'نوع البند': 'إجمالي الإيرادات', 'اسم الحساب': '', 'المبلغ (ر.س)': report.totalRevenue });
        exportData.push({ 'نوع البند': '', 'اسم الحساب': '', 'المبلغ (ر.س)': '' }); // فارغ للترتيب
        
        exportData.push({ 'نوع البند': 'المصروفات', 'اسم الحساب': '', 'المبلغ (ر.س)': '' });
        report.expenses.forEach(e => exportData.push({ 'نوع البند': '', 'اسم الحساب': e.name, 'المبلغ (ر.س)': Math.abs(e.balance) }));
        exportData.push({ 'نوع البند': 'إجمالي المصروفات', 'اسم الحساب': '', 'المبلغ (ر.س)': Math.abs(report.totalExpenses) });
        exportData.push({ 'نوع البند': '', 'اسم الحساب': '', 'المبلغ (ر.س)': '' }); // فارغ للترتيب

        exportData.push({ 'نوع البند': report.netIncome >= 0 ? 'صافي الربح' : 'صافي الخسارة', 'اسم الحساب': '', 'المبلغ (ر.س)': Math.abs(report.netIncome) });
        
        exportToExcel(exportData, `قائمة_الدخل_${startDate}_إلى_${endDate}`, 'قائمة الدخل');
    };

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
                <button onClick={() => {
                    const fmt = (v) => Math.abs(v).toLocaleString('ar-SA', { minimumFractionDigits: 2 });
                    const revRows = report.revenues.map(a => `<tr><td>${a.name}</td><td style="text-align:left;color:#10b981;font-weight:600">${fmt(a.balance)} ر.س</td></tr>`).join('');
                    const expRows = report.expenses.map(a => `<tr><td>${a.name}</td><td style="text-align:left;color:#ef4444;font-weight:600">${fmt(a.balance)} ر.س</td></tr>`).join('');
                    const isProfit = report.netIncome >= 0;
                    const pw = window.open('', '_blank', 'width=800,height=700');
                    pw.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>قائمة الدخل</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Cairo,sans-serif;direction:rtl;padding:15mm;color:#0f172a;max-width:700px;margin:0 auto}
  h1{text-align:center;font-size:1.6rem;color:#1e3a5f;margin-bottom:4px}
  .sub{text-align:center;color:#64748b;font-size:0.9rem;margin-bottom:24px}
  .section{margin-bottom:28px}
  .section-title{font-size:1.1rem;font-weight:700;padding-bottom:8px;border-bottom:2px solid #e2e8f0;margin-bottom:12px;display:flex;gap:8px;align-items:center}
  .rev .section-title{color:#2563eb} .exp .section-title{color:#ef4444}
  table{width:100%;border-collapse:collapse}
  td{padding:9px 4px;border-bottom:1px dotted #e2e8f0;font-size:0.9rem}
  .total-row td{font-weight:800;border-top:2px solid #e2e8f0;border-bottom:none;font-size:1rem;padding-top:12px}
  .net{padding:18px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;margin-top:16px;border:2px solid ${isProfit?'#10b981':'#ef4444'};background:${isProfit?'#ecfdf5':'#fef2f2'}}
  .net h2{font-size:1.3rem;color:${isProfit?'#065f46':'#991b1b'}}
  .net .amount{font-size:1.8rem;font-weight:900;color:${isProfit?'#10b981':'#ef4444'}}
  .footer{margin-top:20px;text-align:center;font-size:0.75rem;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px}
  @page{margin:15mm;size:A4}
</style></head><body>
  <h1>قائمة الدخل</h1>
  <p class="sub">للفترة من ${startDate} إلى ${endDate}</p>
  <div class="section rev">
    <div class="section-title">📈 الإيرادات</div>
    <table>${revRows}<tr class="total-row"><td>إجمالي الإيرادات</td><td style="text-align:left;color:#10b981">${fmt(report.totalRevenue)} ر.س</td></tr></table>
  </div>
  <div class="section exp">
    <div class="section-title">📉 المصروفات</div>
    <table>${expRows}<tr class="total-row"><td>إجمالي المصروفات</td><td style="text-align:left;color:#ef4444">${fmt(report.totalExpenses)} ر.س</td></tr></table>
  </div>
  <div class="net">
    <div><h2>${isProfit?'صافي الربح':'صافي الخسارة'}</h2><p style="color:#64748b;font-size:0.85rem">بعد خصم كافة المصاريف</p></div>
    <div class="amount">${fmt(report.netIncome)} ر.س</div>
  </div>
  <div class="footer">تم إنشاء هذا التقرير بواسطة نظام الجنوب الجديد - ${new Date().toLocaleDateString('ar-SA')}</div>
                    <script>window.onload=function(){setTimeout(function(){window.print();},500);};</script>
                </body></html>`);
                    pw.document.close();
                }} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cairo', fontSize: '0.9rem', width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🖨️ طباعة
                </button>
                <button onClick={handleExportExcel} style={{ background: '#10b981', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cairo', fontSize: '0.9rem', width: 'fit-content', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} /> تصدير Excel
                </button>
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
