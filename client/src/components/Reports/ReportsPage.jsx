import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import API_URL from '@/config';
import { motion } from 'framer-motion';
import {
    FileBarChart2, TrendingUp, Users, Package, Briefcase, DollarSign,
    AlertTriangle, CheckCircle, ArrowUp, ArrowDown, Printer, Download,
    Calendar, Filter, BarChart3, PieChart, FileText, Building2, Star,
    ChevronRight, Layers
} from 'lucide-react';
import TrialBalance from './FinancialReports/TrialBalance';
import IncomeStatement from './FinancialReports/IncomeStatement';
import BalanceSheet from './FinancialReports/BalanceSheet';
import GeneralLedger from './FinancialReports/GeneralLedger';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const formatMoney = (n = 0) => Number(n).toLocaleString('ar-SA', { minimumFractionDigits: 0 }) + ' ر.س';

// ─────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────
const StatCard = ({ title, value, sub, icon, color, trend }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'white', borderRadius: '16px', padding: '22px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: `4px solid ${color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem', fontWeight: '600' }}>{title}</p>
                <h2 style={{ margin: '6px 0 0 0', fontSize: '1.7rem', fontWeight: '900', color: '#0f172a', fontFamily: 'Cairo' }}>{value}</h2>
            </div>
            <div style={{ padding: '10px', background: `${color}15`, borderRadius: '12px', color }}>{React.cloneElement(icon, { size: 20 })}</div>
        </div>
        {sub && (
            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {trend === 'up' ? <ArrowUp size={13} color="#10b981" /> : trend === 'down' ? <ArrowDown size={13} color="#ef4444" /> : null}
                <span style={{ color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#64748b' }}>{sub}</span>
            </div>
        )}
    </motion.div>
);

// ─────────────────────────────────────────
// Mini Bar Chart (CSS-based)
// ─────────────────────────────────────────
const MiniBarChart = ({ data, color = '#2563eb' }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '130px', padding: '0 0 20px 0' }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '20px', display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{
                            width: '100%', background: `linear-gradient(to top, ${color}, ${color}88)`,
                            borderRadius: '6px 6px 0 0', height: `${(d.value / max) * 100}%`,
                            minHeight: d.value > 0 ? '4px' : '2px', transition: 'height 0.8s ease'
                        }} title={`${d.label}: ${formatMoney(d.value)}`} />
                    </div>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', position: 'absolute', bottom: 0 }}>{d.label}</span>
                </div>
            ))}
        </div>
    );
};

// ─────────────────────────────────────────
// Print CSS
// ─────────────────────────────────────────
const printStyles = `
@media print {
    body * { visibility: hidden !important; }
    #print-area, #print-area * { visibility: visible !important; }
    #print-area { position: absolute; left: 0; top: 0; width: 100%; direction: rtl; font-family: Cairo, sans-serif; }
    .no-print { display: none !important; }
    @page { margin: 15mm; size: A4; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: right; font-size: 11px; }
    th { background: #f8fafc; font-weight: bold; }
    .print-header { text-align: center; padding: 20px 0; border-bottom: 2px solid #2563eb; margin-bottom: 20px; }
    .stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat-box { border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; text-align: center; }
}
`;

// ─────────────────────────────────────────
// Printable Report Component
// ─────────────────────────────────────────
const PrintableReport = ({ data, summary, period, periodLabel }) => {
    const { invoices = [], projects = [], employees = [], partners = [] } = data;
    const now = new Date();
    return (
        <div id="print-area" style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif', padding: '0', background: 'white' }}>
            {/* Header */}
            <div className="print-header" style={{ textAlign: 'center', borderBottom: '3px solid #2563eb', paddingBottom: '20px', marginBottom: '24px' }}>
                <h1 style={{ margin: 0, fontSize: '22px', color: '#1e40af', fontWeight: '900' }}>مؤسسة الجنوب الجديد</h1>
                <h2 style={{ margin: '6px 0 0', fontSize: '16px', color: '#475569', fontWeight: '700' }}>التقرير المالي والإداري الشامل</h2>
                <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '12px' }}>
                    الفترة: {periodLabel} | تاريخ الإصدار: {now.toLocaleDateString('ar-SA', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* KPI Summary */}
            <div className="stat-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                    { title: 'إجمالي الإيرادات', value: formatMoney(summary.totalRevenue), color: '#2563eb' },
                    { title: 'إجمالي الفواتير', value: invoices.length, color: '#8b5cf6' },
                    { title: 'المشاريع النشطة', value: projects.filter(p => p.status === 'IN_PROGRESS').length, color: '#10b981' },
                    { title: 'إجمالي الموظفين', value: employees.length, color: '#f59e0b' },
                ].map((s, i) => (
                    <div key={i} className="stat-box" style={{ border: `1px solid ${s.color}44`, padding: '12px', borderRadius: '8px', textAlign: 'center', borderRight: `4px solid ${s.color}` }}>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{s.title}</div>
                    </div>
                ))}
            </div>

            {/* Invoices Table */}
            <h3 style={{ color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>الفواتير</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '11px' }}>
                <thead>
                    <tr style={{ background: '#f8fafc' }}>
                        {['رقم الفاتورة', 'العميل', 'التاريخ', 'المبلغ', 'الضريبة', 'الإجمالي', 'الحالة'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', textAlign: 'right', fontSize: '11px' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {invoices.slice(0, 25).map((inv, i) => (
                        <tr key={inv.id} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0' }}>{inv.invoiceNumber || inv.id}</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0' }}>{inv.partner?.name || inv.partnerName || '-'}</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0' }}>{inv.date ? new Date(inv.date).toLocaleDateString('ar-SA') : '-'}</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0' }}>{(inv.subtotal || 0).toLocaleString('ar')}</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0' }}>{(inv.taxAmount || 0).toLocaleString('ar')}</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0', fontWeight: '700' }}>{(inv.total || 0).toLocaleString('ar')}</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0' }}>
                                {{ DRAFT: 'مسودة', POSTED: 'مُرسَلة', PAID: 'مدفوعة', CANCELLED: 'ملغاة' }[inv.status] || inv.status}
                            </td>
                        </tr>
                    ))}
                    <tr style={{ background: '#eff6ff', fontWeight: '700' }}>
                        <td colSpan="5" style={{ padding: '8px 12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>الإجمالي</td>
                        <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', color: '#2563eb' }}>{invoices.reduce((s, i) => s + (i.total || 0), 0).toLocaleString('ar')} ر.س</td>
                        <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0' }}></td>
                    </tr>
                </tbody>
            </table>

            {/* Projects Table */}
            <h3 style={{ color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>المشاريع</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '11px' }}>
                <thead>
                    <tr style={{ background: '#f8fafc' }}>
                        {['اسم المشروع', 'العميل', 'الحالة', 'القيمة الإجمالية', 'تاريخ البداية', 'تاريخ الانتهاء'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', textAlign: 'right', fontSize: '11px' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {projects.map((proj, i) => (
                        <tr key={proj.id} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0', fontWeight: '600' }}>{proj.name}</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0' }}>{proj.partner?.name || proj.clientName || '-'}</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0' }}>{{ IN_PROGRESS: 'جاري', COMPLETED: 'مكتمل', PLANNED: 'مخطط', ON_HOLD: 'معلق' }[proj.status] || proj.status}</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0' }}>{(proj.totalValue || 0).toLocaleString('ar')} ر.س</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0' }}>{proj.startDate ? new Date(proj.startDate).toLocaleDateString('ar-SA') : '-'}</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0' }}>{proj.endDate ? new Date(proj.endDate).toLocaleDateString('ar-SA') : '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* HR Table */}
            <h3 style={{ color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>الموظفون</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                    <tr style={{ background: '#f8fafc' }}>
                        {['الرقم الوظيفي', 'الاسم', 'المسمى', 'القسم', 'الراتب', 'الحالة'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', textAlign: 'right', fontSize: '11px' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {employees.map((emp, i) => (
                        <tr key={emp.id} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0' }}>{emp.employeeId}</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0', fontWeight: '600' }}>{emp.name}</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0' }}>{emp.jobTitle}</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0' }}>{emp.department || '-'}</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0', fontWeight: '700' }}>{(emp.salary || 0).toLocaleString('ar')} ر.س</td>
                            <td style={{ padding: '7px 12px', border: '1px solid #e2e8f0' }}>{{ ACTIVE: 'نشط', ON_LEAVE: 'إجازة', TERMINATED: 'منتهي' }[emp.status] || emp.status}</td>
                        </tr>
                    ))}
                    <tr style={{ background: '#eff6ff', fontWeight: '700' }}>
                        <td colSpan="4" style={{ padding: '8px 12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>إجمالي الرواتب</td>
                        <td colSpan="2" style={{ padding: '8px 12px', border: '1px solid #e2e8f0', color: '#10b981' }}>{employees.reduce((s, e) => s + (e.salary || 0), 0).toLocaleString('ar')} ر.س</td>
                    </tr>
                </tbody>
            </table>

            <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '12px', color: '#94a3b8', fontSize: '10px' }}>
                تقرير صادر بتاريخ {now.toLocaleString('ar-SA')} | مؤسسة الجنوب الجديد - نظام إدارة الموارد
            </div>
        </div>
    );
};

// ─────────────────────────────────────────
// Overview Tab (Enhanced)
// ─────────────────────────────────────────
const OverviewTab = ({ data, period }) => {
    const { invoices = [], projects = [], employees = [], partners = [] } = data;

    const filterByPeriod = (items, dateField = 'date') => {
        const now = new Date();
        if (period === 'all') return items;
        return items.filter(item => {
            const d = new Date(item[dateField] || item.createdAt);
            if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            if (period === 'year') return d.getFullYear() === now.getFullYear();
            return true;
        });
    };

    const filtered = filterByPeriod(invoices);
    const totalRevenue = filtered.reduce((s, inv) => s + (inv.total || 0), 0);
    const totalTax = filtered.reduce((s, inv) => s + (inv.taxAmount || 0), 0);
    const paidCount = filtered.filter(i => i.status === 'PAID' || i.status === 'POSTED').length;
    const draftCount = filtered.filter(i => i.status === 'DRAFT').length;
    const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
    const activeEmployees = employees.filter(e => e.status === 'ACTIVE').length;
    const totalSalaries = employees.filter(e => e.status === 'ACTIVE').reduce((s, e) => s + (e.salary || 0), 0);

    // Monthly revenue last 6 months
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const label = months[d.getMonth()].slice(0, 3);
        const value = invoices.filter(inv => {
            const invDate = new Date(inv.date || inv.createdAt);
            return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear();
        }).reduce((s, inv) => s + (inv.total || 0), 0);
        return { label, value: Math.round(value) };
    });

    // Top clients
    const clientMap = {};
    invoices.forEach(inv => {
        const name = inv.partner?.name || inv.partnerName || 'غير محدد';
        clientMap[name] = (clientMap[name] || 0) + (inv.total || 0);
    });
    const topClients = Object.entries(clientMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const maxClient = Math.max(...topClients.map(([, v]) => v), 1);

    // Invoice status breakdown
    const statusMap = {};
    invoices.forEach(inv => { statusMap[inv.status] = (statusMap[inv.status] || 0) + 1; });

    return (
        <>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                <StatCard title="إجمالي الإيرادات" value={formatMoney(totalRevenue)} sub={`${filtered.length} فاتورة في الفترة`} icon={<DollarSign />} color="#2563eb" trend="up" />
                <StatCard title="ضريبة القيمة المضافة" value={formatMoney(totalTax)} sub="15% VAT مُحصَّلة" icon={<TrendingUp />} color="#8b5cf6" />
                <StatCard title="المشاريع النشطة" value={activeProjects} sub={`${completedProjects} مشروع مكتمل`} icon={<Briefcase />} color="#10b981" trend="up" />
                <StatCard title="الموظفون النشطون" value={activeEmployees} sub={`فاتورة رواتب: ${formatMoney(totalSalaries)}`} icon={<Users />} color="#f59e0b" />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Revenue Chart */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: '700' }}>📊 الإيرادات الشهرية</h3>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>آخر 6 أشهر</span>
                        </div>
                        <div style={{ background: '#eff6ff', padding: '4px 12px', borderRadius: '20px', color: '#2563eb', fontSize: '0.82rem', fontWeight: '700' }}>إجمالي: {formatMoney(invoices.reduce((s, i) => s + (i.total || 0), 0))}</div>
                    </div>
                    <MiniBarChart data={monthlyRevenue} color="#2563eb" />
                </div>

                {/* Project Status */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#1e293b', fontWeight: '700' }}>🏗️ حالة المشاريع</h3>
                    {[
                        { label: 'قيد التنفيذ', count: activeProjects, color: '#2563eb', bg: '#eff6ff' },
                        { label: 'مكتملة', count: completedProjects, color: '#10b981', bg: '#ecfdf5' },
                        { label: 'مخططة', count: projects.filter(p => p.status === 'PLANNED').length, color: '#f59e0b', bg: '#fffbeb' },
                        { label: 'معلقة', count: projects.filter(p => p.status === 'ON_HOLD').length, color: '#ef4444', bg: '#fef2f2' },
                    ].map(item => (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: item.bg, borderRadius: '10px', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem' }}>{item.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ background: '#f1f5f9', borderRadius: '4px', width: '60px', height: '6px', overflow: 'hidden' }}>
                                    <div style={{ background: item.color, height: '6px', width: `${projects.length > 0 ? (item.count / projects.length) * 100 : 0}%`, borderRadius: '4px' }} />
                                </div>
                                <span style={{ fontWeight: '800', color: item.color, minWidth: '20px', textAlign: 'center' }}>{item.count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Top Clients */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#1e293b', fontWeight: '700' }}>🏆 أعلى العملاء مبيعاً</h3>
                    {topClients.length === 0 ? <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>لا توجد بيانات</div> :
                        topClients.map(([name, total], i) => (
                            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < topClients.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '28px', height: '28px', background: i === 0 ? '#fef3c7' : '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', color: i === 0 ? '#d97706' : '#64748b' }}>{i + 1}</div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.88rem' }}>{name}</div>
                                        <div style={{ background: '#f1f5f9', borderRadius: '3px', height: '4px', width: '80px', marginTop: '4px', overflow: 'hidden' }}>
                                            <div style={{ background: '#2563eb', height: '4px', width: `${(total / maxClient) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <span style={{ color: '#2563eb', fontWeight: '800', fontSize: '0.88rem' }}>{formatMoney(total)}</span>
                            </div>
                        ))}
                </div>

                {/* Invoice Breakdown */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#1e293b', fontWeight: '700' }}>📋 توزيع الفواتير</h3>
                    {[
                        { key: 'PAID', label: '✅ مدفوعة', color: '#10b981', bg: '#ecfdf5' },
                        { key: 'POSTED', label: '📤 مُصدَرة', color: '#3b82f6', bg: '#eff6ff' },
                        { key: 'DRAFT', label: '📝 مسودة', color: '#f59e0b', bg: '#fffbeb' },
                        { key: 'CANCELLED', label: '❌ ملغاة', color: '#ef4444', bg: '#fef2f2' },
                    ].map(s => {
                        const count = invoices.filter(i => i.status === s.key).length;
                        const total = invoices.filter(i => i.status === s.key).reduce((sum, i) => sum + (i.total || 0), 0);
                        return (
                            <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: s.bg, borderRadius: '10px', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem' }}>{s.label}</span>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: '800', color: s.color, fontSize: '0.88rem' }}>{count} فاتورة</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{formatMoney(total)}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

// ─────────────────────────────────────────
// Projects Report Tab
// ─────────────────────────────────────────
const ProjectsReport = ({ projects = [] }) => {
    const totalValue = projects.reduce((s, p) => s + (p.totalValue || 0), 0);
    const statusColors = { IN_PROGRESS: '#2563eb', COMPLETED: '#10b981', PLANNED: '#f59e0b', ON_HOLD: '#ef4444' };
    const statusLabels = { IN_PROGRESS: 'جاري', COMPLETED: 'مكتمل', PLANNED: 'مخطط', ON_HOLD: 'معلق' };

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {[
                    { label: 'إجمالي المشاريع', value: projects.length, color: '#3b82f6' },
                    { label: 'قيد التنفيذ', value: projects.filter(p => p.status === 'IN_PROGRESS').length, color: '#2563eb' },
                    { label: 'مكتملة', value: projects.filter(p => p.status === 'COMPLETED').length, color: '#10b981' },
                    { label: 'إجمالي القيمة', value: formatMoney(totalValue), color: '#8b5cf6' },
                ].map((s, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', border: `1px solid ${s.color}30`, borderRight: `4px solid ${s.color}`, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
                    </div>
                ))}
            </div>
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>{['المشروع', 'العميل', 'القيمة', 'نسبة الإنجاز', 'الحالة', 'تاريخ الانتهاء'].map(h => (
                            <th key={h} style={{ padding: '13px 16px', textAlign: 'right', color: '#64748b', fontWeight: '600', fontSize: '0.83rem' }}>{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody>
                        {projects.map((p, i) => {
                            const tasks = p.tasks || [];
                            const done = tasks.filter(t => t.status === 'DONE').length;
                            const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
                            const color = statusColors[p.status] || '#94a3b8';
                            return (
                                <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                    <td style={{ padding: '13px 16px', fontWeight: '700', color: '#1e293b' }}>{p.name}</td>
                                    <td style={{ padding: '13px 16px', color: '#475569' }}>{p.partner?.name || p.clientName || '-'}</td>
                                    <td style={{ padding: '13px 16px', fontWeight: '700', color: '#10b981' }}>{(p.totalValue || 0).toLocaleString('ar')} ر.س</td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '4px', height: '6px' }}>
                                                <div style={{ background: pct >= 80 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444', height: '6px', borderRadius: '4px', width: `${pct}%` }} />
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', minWidth: '32px' }}>{pct}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <span style={{ background: `${color}15`, color, padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>
                                            {statusLabels[p.status] || p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '13px 16px', color: '#64748b', fontSize: '0.85rem' }}>{p.endDate ? new Date(p.endDate).toLocaleDateString('ar-SA') : '-'}</td>
                                </tr>
                            );
                        })}
                        {projects.length === 0 && <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>لا توجد مشاريع</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────
// HR Report Tab
// ─────────────────────────────────────────
const HRReport = ({ employees = [] }) => {
    const totalSalary = employees.filter(e => e.status === 'ACTIVE').reduce((s, e) => s + (e.salary || 0), 0);
    const deptMap = {};
    employees.forEach(e => { if (e.department) deptMap[e.department] = (deptMap[e.department] || 0) + 1; });

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {[
                    { label: 'إجمالي الموظفين', value: employees.length, color: '#3b82f6' },
                    { label: 'نشطون', value: employees.filter(e => e.status === 'ACTIVE').length, color: '#10b981' },
                    { label: 'في إجازة', value: employees.filter(e => e.status === 'ON_LEAVE').length, color: '#f59e0b' },
                    { label: 'فاتورة الرواتب', value: formatMoney(totalSalary), color: '#8b5cf6' },
                ].map((s, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', border: `1px solid ${s.color}30`, borderRight: `4px solid ${s.color}`, textAlign: 'center' }}>
                        <div style={{ fontSize: s.label === 'فاتورة الرواتب' ? '1rem' : '1.6rem', fontWeight: '900', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>{['الموظف', 'المسمى', 'القسم', 'الراتب', 'الحالة'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b', fontWeight: '600', fontSize: '0.83rem' }}>{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, i) => (
                                <tr key={emp.id} style={{ borderBottom: '1px solid #f8fafc', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1e293b' }}>{emp.name}</td>
                                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '0.85rem' }}>{emp.jobTitle}</td>
                                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.85rem' }}>{emp.department || '-'}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#10b981', fontSize: '0.9rem' }}>{(emp.salary || 0).toLocaleString('ar')} ر.س</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ background: emp.status === 'ACTIVE' ? '#ecfdf5' : emp.status === 'ON_LEAVE' ? '#fffbeb' : '#fef2f2', color: emp.status === 'ACTIVE' ? '#059669' : emp.status === 'ON_LEAVE' ? '#d97706' : '#dc2626', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>
                                            {{ ACTIVE: '🟢 نشط', ON_LEAVE: '🟡 إجازة', TERMINATED: '🔴 منتهي' }[emp.status]}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            <tr style={{ background: '#ecfdf5' }}>
                                <td colSpan="3" style={{ padding: '12px 16px', fontWeight: '700', color: '#065f46' }}>إجمالي الرواتب</td>
                                <td style={{ padding: '12px 16px', fontWeight: '900', color: '#059669', fontSize: '1rem' }}>{totalSalary.toLocaleString('ar')} ر.س</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9' }}>
                    <h4 style={{ margin: '0 0 16px', color: '#1e293b', fontWeight: '700' }}>🏢 توزيع الأقسام</h4>
                    {Object.entries(deptMap).map(([dept, count]) => (
                        <div key={dept} style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                                <span style={{ color: '#475569', fontWeight: '600' }}>{dept}</span>
                                <span style={{ color: '#2563eb', fontWeight: '700' }}>{count}</span>
                            </div>
                            <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '6px' }}>
                                <div style={{ background: '#2563eb', height: '6px', borderRadius: '4px', width: `${(count / employees.length) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                    {Object.keys(deptMap).length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>لا توجد بيانات</div>}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────
// Main ReportsPage
// ─────────────────────────────────────────
export default function ReportsPage() {
    const [period, setPeriod] = useState('month');
    const [activeTab, setActiveTab] = useState('overview');
    const printRef = useRef(null);

    const invoicesQ = useQuery({ queryKey: ['invoices'], queryFn: async () => (await axios.get(`${API_URL}/invoices`, { headers: H() })).data });
    const partnersQ = useQuery({ queryKey: ['partners'], queryFn: async () => (await axios.get(`${API_URL}/partners`, { headers: H() })).data });
    const productsQ = useQuery({ queryKey: ['products'], queryFn: async () => (await axios.get(`${API_URL}/products`, { headers: H() })).data });
    const projectsQ = useQuery({ queryKey: ['projects'], queryFn: async () => (await axios.get(`${API_URL}/projects`, { headers: H() })).data });
    const employeesQ = useQuery({ queryKey: ['employees'], queryFn: async () => (await axios.get(`${API_URL}/employees`, { headers: H() })).data });

    const data = {
        invoices: invoicesQ.data || [],
        partners: partnersQ.data || [],
        products: productsQ.data || [],
        projects: projectsQ.data || [],
        employees: employeesQ.data || []
    };

    const loading = invoicesQ.isLoading || projectsQ.isLoading || employeesQ.isLoading;
    const totalRevenue = data.invoices.reduce((s, i) => s + (i.total || 0), 0);

    const periodLabel = period === 'month' ? `${months[new Date().getMonth()]} ${new Date().getFullYear()}` : period === 'year' ? `سنة ${new Date().getFullYear()}` : 'كل الفترات';

    const handlePrint = () => {
        window.print();
    };

    const tabs = [
        { key: 'overview', label: '📊 نظرة عامة', },
        { key: 'projects', label: '🏗️ تقرير المشاريع' },
        { key: 'hr', label: '👥 تقرير الموارد البشرية' },
        { key: 'trial', label: '⚖️ ميزان المراجعة' },
        { key: 'income', label: '💹 قائمة الدخل' },
        { key: 'balance', label: '📑 الميزانية العمومية' },
        { key: 'ledger', label: '📒 كشف الحساب' },
    ];

    return (
        <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
            <style>{printStyles}</style>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)', borderRadius: '20px', padding: '26px', marginBottom: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-30px', left: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', position: 'relative' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.7rem', fontWeight: '900' }}>📈 التقارير المالية والإدارية</h1>
                        <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: '0.92rem' }}>تحليلات شاملة لأداء المؤسسة مع إمكانية الطباعة والتصدير</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }} className="no-print">
                        <select value={period} onChange={e => setPeriod(e.target.value)} style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontFamily: 'Cairo', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                            <option value="month" style={{ color: '#1e293b' }}>هذا الشهر</option>
                            <option value="year" style={{ color: '#1e293b' }}>هذه السنة</option>
                            <option value="all" style={{ color: '#1e293b' }}>كل الفترات</option>
                        </select>
                        <button onClick={handlePrint} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '7px', backdropFilter: 'blur(4px)', fontSize: '0.88rem' }}>
                            <Printer size={16} /> طباعة / PDF
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Printable area (hidden visually, shown during print) */}
            <div style={{ display: 'none' }}>
                <PrintableReport data={data} summary={{ totalRevenue }} period={period} periodLabel={periodLabel} />
            </div>

            {/* Tab Navigation */}
            <div className="no-print" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px', background: '#f1f5f9', padding: '6px', borderRadius: '14px' }}>
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                        flex: 1, minWidth: '100px', padding: '10px 14px', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '600', fontSize: '0.82rem',
                        borderRadius: '10px', transition: 'all 0.2s', whiteSpace: 'nowrap',
                        background: activeTab === tab.key ? 'white' : 'transparent',
                        color: activeTab === tab.key ? '#2563eb' : '#64748b',
                        boxShadow: activeTab === tab.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                    }}>{tab.label}</button>
                ))}
            </div>

            {/* Loading */}
            {loading && activeTab !== 'trial' && activeTab !== 'income' && activeTab !== 'balance' && activeTab !== 'ledger' && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>⏳ جاري تحميل البيانات...</div>
            )}

            {/* Tab Content */}
            {!loading && (
                <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    {activeTab === 'overview' && <OverviewTab data={data} period={period} />}
                    {activeTab === 'projects' && <ProjectsReport projects={data.projects} />}
                    {activeTab === 'hr' && <HRReport employees={data.employees} />}
                    {activeTab === 'trial' && <TrialBalance />}
                    {activeTab === 'income' && <IncomeStatement />}
                    {activeTab === 'balance' && <BalanceSheet />}
                    {activeTab === 'ledger' && <GeneralLedger />}
                </motion.div>
            )}
        </div>
    );
}
