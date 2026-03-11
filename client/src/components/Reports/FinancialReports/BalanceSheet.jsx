import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import API_URL from '@/config';
import { Shield, CreditCard, PieChart, Clock, AlertOctagon, FileText } from 'lucide-react';
import { exportToExcel } from '../../../utils/excelExport';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const BalanceSheet = () => {
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

    const { data: report, isLoading, error } = useQuery({
        queryKey: ['report', 'balance-sheet', asOfDate],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/reports/balance-sheet?date=${asOfDate}`, {
                headers: H()
            });
            return res.data;
        }
    });

    const format = (v) => Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2 });

    const handleExportExcel = () => {
        if (!report) return;
        const exportData = [];
        
        // الأصول
        exportData.push({ 'القسم الرئيس': 'الأصول (Assets)', 'اسم الحساب': '', 'المبلغ (ر.س)': '' });
        report.assets.forEach(a => exportData.push({ 'القسم الرئيس': '', 'اسم الحساب': a.name, 'المبلغ (ر.س)': Math.abs(a.balance) }));
        exportData.push({ 'القسم الرئيس': 'إجمالي الأصول', 'اسم الحساب': '', 'المبلغ (ر.س)': Math.abs(report.totalAssets) });
        exportData.push({ 'القسم الرئيس': '', 'اسم الحساب': '', 'المبلغ (ر.س)': '' }); // فاصل
        
        // الالتزامات
        exportData.push({ 'القسم الرئيس': 'الالتزامات (Liabilities)', 'اسم الحساب': '', 'المبلغ (ر.س)': '' });
        report.liabilities.forEach(a => exportData.push({ 'القسم الرئيس': '', 'اسم الحساب': a.name, 'المبلغ (ر.س)': Math.abs(a.balance) }));
        exportData.push({ 'القسم الرئيس': 'إجمالي الالتزامات', 'اسم الحساب': '', 'المبلغ (ر.س)': Math.abs(report.totalLiabilities) });
        exportData.push({ 'القسم الرئيس': '', 'اسم الحساب': '', 'المبلغ (ر.س)': '' }); // فاصل

        // حقوق الملكية
        exportData.push({ 'القسم الرئيس': 'حقوق الملكية (Equity)', 'اسم الحساب': '', 'المبلغ (ر.س)': '' });
        report.equity.forEach(a => exportData.push({ 'القسم الرئيس': '', 'اسم الحساب': a.name, 'المبلغ (ر.س)': Math.abs(a.balance) }));
        exportData.push({ 'القسم الرئيس': 'إجمالي حقوق الملكية', 'اسم الحساب': '', 'المبلغ (ر.س)': Math.abs(report.totalEquity) });
        
        exportToExcel(exportData, `الميزانية_العمومية_${asOfDate}`, 'الميزانية العمومية');
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
            خطأ في تحميل الميزانية العمومية
        </div>
    );

    if (!report) return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            لا توجد بيانات للفترة المحددة
        </div>
    );

    const handlePrint = () => {
        if (!report) return;
        const fmt = (v) => Math.abs(v).toLocaleString('ar-SA', { minimumFractionDigits: 2 });
        const makeRows = (arr) => arr.map(a => `<tr><td>${a.name}</td><td style="text-align:left;font-weight:600">${fmt(a.balance)} ر.س</td></tr>`).join('');

        const pw = window.open('', '_blank', 'width=900,height=700');
        pw.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<title>الميزانية العمومية - حتى ${asOfDate}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Cairo,sans-serif; direction:rtl; padding:15mm; color:#0f172a; }
  h1 { text-align:center; font-size:1.5rem; color:#1e3a5f; margin-bottom:4px; }
  .sub { text-align:center; color:#64748b; font-size:0.9rem; margin-bottom:20px; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:16px; }
  .col { border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; }
  .col-title { padding:10px 14px; color:white; font-weight:700; font-size:1rem; }
  .assets .col-title { background:#2563eb; }
  .liabilities .col-title { background:#ef4444; }
  .equity .col-title { background:#f59e0b; }
  table { width:100%; border-collapse:collapse; }
  td { padding:8px 14px; border-bottom:1px solid #f1f5f9; font-size:0.85rem; }
  .total-row { background:#f8fafc; font-weight:700; border-top:2px solid #e2e8f0; }
  .balance-check { text-align:center; padding:12px; border:1px solid #e2e8f0; border-radius:8px; font-size:0.85rem; }
  @page { margin:15mm; size:A4; }
</style></head><body>
  <h1>الميزانية العمومية</h1>
  <p class="sub">حتى تاريخ: ${asOfDate}</p>
  <div class="grid">
    <div class="col assets">
      <div class="col-title">🛡️ الأصول (Assets)</div>
      <table>${makeRows(report.assets)}<tr class="total-row"><td>إجمالي الأصول</td><td style="text-align:left">${fmt(report.totalAssets)} ر.س</td></tr></table>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="col liabilities">
        <div class="col-title">💳 الالتزامات (Liabilities)</div>
        <table>${makeRows(report.liabilities)}<tr class="total-row"><td>إجمالي الالتزامات</td><td style="text-align:left">${fmt(report.totalLiabilities)} ر.س</td></tr></table>
      </div>
      <div class="col equity">
        <div class="col-title">📊 حقوق الملكية (Equity)</div>
        <table>${makeRows(report.equity)}<tr class="total-row"><td>إجمالي حقوق الملكية</td><td style="text-align:left">${fmt(report.totalEquity)} ر.س</td></tr></table>
      </div>
      <div class="balance-check">${Math.abs(report.totalAssets-(report.totalLiabilities+report.totalEquity))<1?'✅ الميزانية متزنة':'⚠️ الميزانية غير متزنة'}</div>
    </div>
  </div>
  <p style="text-align:center;font-size:0.75rem;color:#94a3b8;margin-top:16px;">تم إنشاء هذا التقرير بواسطة نظام الجنوب الجديد</p>
  <script>window.onload=function(){setTimeout(function(){window.print();},500);};</script>
</body></html>`);
        pw.document.close();
    };

    return (
        <div style={{ direction: 'rtl' }}>
            <div className="no-print mobile-grid-1" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>الميزانية العمومية</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748b' }}>حتى تاريخ:</label>
                    <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} style={{ border: 'none', background: 'transparent', fontFamily: 'Cairo', outline: 'none', width: '130px' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handlePrint} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cairo', width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🖨️ طباعة
                    </button>
                    <button onClick={handleExportExcel} style={{ background: '#10b981', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cairo', width: 'fit-content', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} /> تصدير Excel
                    </button>
                </div>
            </div>

            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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
