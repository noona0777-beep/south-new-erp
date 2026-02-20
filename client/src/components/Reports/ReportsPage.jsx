import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { FileBarChart2, TrendingUp, Users, Package, Briefcase, DollarSign, AlertTriangle, CheckCircle, Clock, ArrowUp, ArrowDown } from 'lucide-react';

const token = () => localStorage.getItem('token');

const StatCard = ({ title, value, sub, icon, color, trend }) => (
    <div style={{
        background: 'white', borderRadius: '16px', padding: '24px',
        border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', gap: '12px'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>{title}</p>
                <h2 style={{ margin: '8px 0 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', fontFamily: 'Cairo' }}>{value}</h2>
            </div>
            <div style={{ padding: '12px', background: `${color}18`, borderRadius: '12px', color }}>
                {React.cloneElement(icon, { size: 22 })}
            </div>
        </div>
        {sub && (
            <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {trend === 'up' ? <ArrowUp size={14} color="#10b981" /> : trend === 'down' ? <ArrowDown size={14} color="#ef4444" /> : null}
                <span style={{ color: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#64748b' }}>{sub}</span>
            </div>
        )}
    </div>
);

const BarChart = ({ data, label, color = '#2563eb' }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
                {data.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{
                            width: '100%', background: color, borderRadius: '6px 6px 0 0',
                            height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? '4px' : '2px',
                            opacity: i === data.length - 1 ? 1 : 0.5 + (i / data.length) * 0.5,
                            transition: 'height 0.5s ease'
                        }} title={`${d.label}: ${d.value}`} />
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SectionTitle = ({ title, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '10px', color: '#2563eb' }}>
            {React.cloneElement(icon, { size: 18 })}
        </div>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{title}</h3>
    </div>
);

export default function ReportsPage() {
    const [data, setData] = useState({
        invoices: [], partners: [], products: [], projects: [], employees: []
    });
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month'); // month | year | all

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const headers = { Authorization: `Bearer ${token()}` };
                const [inv, par, prod, proj, emp] = await Promise.all([
                    axios.get(`${API_URL}/invoices`, { headers }),
                    axios.get(`${API_URL}/partners`, { headers }),
                    axios.get(`${API_URL}/products`, { headers }),
                    axios.get(`${API_URL}/projects`, { headers }),
                    axios.get(`${API_URL}/employees`, { headers })
                ]);
                setData({
                    invoices: inv.data || [],
                    partners: par.data || [],
                    products: prod.data || [],
                    projects: proj.data || [],
                    employees: emp.data || []
                });
            } catch (e) {
                console.error('Error loading reports:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // ---- Computed Statistics ----
    const now = new Date();
    const filterByPeriod = (items, dateField = 'date') => {
        if (period === 'all') return items;
        return items.filter(item => {
            const d = new Date(item[dateField] || item.createdAt);
            if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            if (period === 'year') return d.getFullYear() === now.getFullYear();
            return true;
        });
    };

    const filteredInvoices = filterByPeriod(data.invoices);
    const totalRevenue = filteredInvoices.reduce((s, inv) => s + (inv.total || 0), 0);
    const totalTax = filteredInvoices.reduce((s, inv) => s + (inv.taxAmount || 0), 0);
    const paidInvoices = filteredInvoices.filter(i => i.status === 'POSTED' || i.status === 'PAID').length;
    const draftInvoices = filteredInvoices.filter(i => i.status === 'DRAFT').length;

    // Monthly revenue for bar chart (last 6 months)
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const label = d.toLocaleString('ar-SA', { month: 'short' });
        const value = data.invoices
            .filter(inv => {
                const invDate = new Date(inv.date || inv.createdAt);
                return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear();
            })
            .reduce((s, inv) => s + (inv.total || 0), 0);
        return { label, value: Math.round(value) };
    });

    // Top Clients
    const clientRevenue = {};
    data.invoices.forEach(inv => {
        if (inv.partner) {
            clientRevenue[inv.partner.name] = (clientRevenue[inv.partner.name] || 0) + (inv.total || 0);
        }
    });
    const topClients = Object.entries(clientRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Low stock products
    const lowStock = data.products.filter(p => {
        const qty = p.stocks?.reduce((s, st) => s + st.quantity, 0) || 0;
        return qty < 10;
    });

    // Project stats
    const activeProjects = data.projects.filter(p => p.status === 'IN_PROGRESS').length;
    const completedProjects = data.projects.filter(p => p.status === 'COMPLETED').length;
    const plannedProjects = data.projects.filter(p => p.status === 'PLANNED').length;

    const formatMoney = (n) => n.toLocaleString('ar-SA', { minimumFractionDigits: 0 }) + ' ر.س';

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#64748b', fontSize: '1.1rem' }}>
            ⏳ جاري تحميل التقارير...
        </div>
    );

    return (
        <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 'bold', color: '#0f172a' }}>
                        <FileBarChart2 size={24} style={{ marginLeft: '10px', verticalAlign: 'middle', color: '#2563eb' }} />
                        التقارير المالية والإدارية
                    </h1>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                        نظرة شاملة على أداء المؤسسة
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', borderRadius: '12px', padding: '4px' }}>
                    {[['month', 'هذا الشهر'], ['year', 'هذا العام'], ['all', 'الكل']].map(([k, l]) => (
                        <button key={k} onClick={() => setPeriod(k)} style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: period === k ? '#2563eb' : 'transparent',
                            color: period === k ? 'white' : '#64748b',
                            fontFamily: 'Cairo', fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s'
                        }}>{l}</button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <StatCard title="إجمالي الإيرادات" value={formatMoney(totalRevenue)} sub={`${filteredInvoices.length} فاتورة`} icon={<DollarSign />} color="#2563eb" trend="up" />
                <StatCard title="ضريبة القيمة المضافة" value={formatMoney(totalTax)} sub="15% من المبيعات" icon={<TrendingUp />} color="#8b5cf6" />
                <StatCard title="العملاء النشطون" value={data.partners.length} sub={`${topClients.length} عميل لديه فواتير`} icon={<Users />} color="#10b981" trend="up" />
                <StatCard title="الموظفون" value={data.employees.length} sub={`${data.employees.filter(e => e.status === 'ACTIVE').length} نشط`} icon={<Users />} color="#f59e0b" />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
                {/* Revenue Chart */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <SectionTitle title="الإيرادات الشهرية (آخر 6 أشهر)" icon={<TrendingUp />} />
                    <BarChart data={monthlyRevenue} color="#2563eb" />
                    <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                        اللون الأغمق = هذا الشهر
                    </div>
                </div>

                {/* Project Status */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <SectionTitle title="حالة المشاريع" icon={<Briefcase />} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                        {[
                            { label: 'قيد التنفيذ', count: activeProjects, color: '#2563eb', bg: '#eff6ff' },
                            { label: 'مكتملة', count: completedProjects, color: '#10b981', bg: '#ecfdf5' },
                            { label: 'مخططة', count: plannedProjects, color: '#f59e0b', bg: '#fffbeb' },
                            { label: 'إجمالي', count: data.projects.length, color: '#6366f1', bg: '#eef2ff' },
                        ].map(item => (
                            <div key={item.label} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px', background: item.bg, borderRadius: '10px'
                            }}>
                                <span style={{ fontWeight: '600', color: '#374151', fontSize: '0.9rem' }}>{item.label}</span>
                                <span style={{ fontWeight: 'bold', color: item.color, fontSize: '1.2rem', fontFamily: 'Cairo' }}>{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Rows */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                {/* Top Clients */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <SectionTitle title="أعلى العملاء مبيعاً" icon={<Users />} />
                    {topClients.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '0.9rem' }}>لا توجد بيانات بعد</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {topClients.map(([name, total], i) => (
                                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>{i + 1}</div>
                                        <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.85rem' }}>{name}</span>
                                    </div>
                                    <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '0.85rem' }}>{formatMoney(total)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Invoice Summary */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <SectionTitle title="ملخص الفواتير" icon={<CheckCircle />} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                        {[
                            { label: 'مُصدَرة', count: paidInvoices, color: '#10b981', bg: '#ecfdf5' },
                            { label: 'مسودة', count: draftInvoices, color: '#f59e0b', bg: '#fffbeb' },
                            { label: 'الإجمالي', count: filteredInvoices.length, color: '#2563eb', bg: '#eff6ff' },
                        ].map(item => (
                            <div key={item.label} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '14px 16px', background: item.bg, borderRadius: '10px'
                            }}>
                                <span style={{ fontWeight: '600', color: '#374151' }}>{item.label}</span>
                                <span style={{ fontWeight: 'bold', color: item.color, fontSize: '1.3rem', fontFamily: 'Cairo' }}>{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <SectionTitle title="تنبيهات المخزون" icon={<AlertTriangle />} />
                    {lowStock.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#10b981', padding: '20px', fontSize: '0.9rem' }}>
                            <CheckCircle size={32} style={{ marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                            المخزون في مستوى جيد!
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {lowStock.slice(0, 5).map(p => {
                                const qty = p.stocks?.reduce((s, st) => s + st.quantity, 0) || 0;
                                return (
                                    <div key={p.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '10px 14px', background: qty === 0 ? '#fef2f2' : '#fffbeb', borderRadius: '10px',
                                        border: `1px solid ${qty === 0 ? '#fecaca' : '#fde68a'}`
                                    }}>
                                        <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.85rem' }}>{p.name}</span>
                                        <span style={{ fontWeight: 'bold', color: qty === 0 ? '#ef4444' : '#f59e0b', fontSize: '0.9rem' }}>
                                            {qty === 0 ? 'نفد!' : `${qty} وحدة`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
