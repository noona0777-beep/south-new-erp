import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '@/config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Users, UserCircle, Briefcase, DollarSign, Phone, Mail,
    Calendar, Edit, Trash2, Eye, X, Folder, Clock, AlertOctagon,
    TrendingUp, Award, ChevronDown, ChevronUp, Building2, Search,
    FileText, Play, CheckCircle, BarChart3, Download
} from 'lucide-react';
import GeoAttendanceTab from './GeoAttendanceTab';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const statusBadge = (s) => ({
    ACTIVE: { label: '🟢 نشط', bg: '#ecfdf5', color: '#065f46' },
    ON_LEAVE: { label: '🟡 إجازة', bg: '#fffbeb', color: '#92400e' },
    TERMINATED: { label: '🔴 منتهي', bg: '#fef2f2', color: '#991b1b' },
})[s] || { label: s, bg: '#f1f5f9', color: '#475569' };

// ────────────────────────────────────
// KPI Card
// ────────────────────────────────────
const KPICard = ({ icon, title, value, sub, color }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px', borderRight: `4px solid ${color}` }}>
        <div style={{ background: `${color}18`, padding: '12px', borderRadius: '12px', color }}>{icon}</div>
        <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>{title}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>{value}</div>
            {sub && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{sub}</div>}
        </div>
    </motion.div>
);

// ────────────────────────────────────
// Employee Form Modal
// ────────────────────────────────────
const EmployeeModal = ({ employee, onClose, onSave }) => {
    const [form, setForm] = useState(employee || {
        name: '', jobTitle: '', department: '', phone: '',
        email: '', salary: 0, status: 'ACTIVE',
        joinDate: new Date().toISOString().split('T')[0]
    });
    const departments = ['الهندسة', 'العمليات', 'المالية', 'الموارد البشرية', 'المبيعات', 'الإشراف الميداني', 'إدارة المشاريع', 'التقنية'];

    const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
    const isEdit = !!employee?.id;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', left: '20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                <h3 style={{ margin: '0 0 24px', fontSize: '1.4rem', color: '#0f172a', fontWeight: '800' }}>
                    {isEdit ? `✏️ تعديل: ${employee.name}` : '➕ إضافة موظف جديد'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                    {[
                        { label: 'اسم الموظف كاملاً', key: 'name', type: 'text', required: true },
                        { label: 'المسمى الوظيفي', key: 'jobTitle', type: 'text', required: true },
                        { label: 'الهاتف', key: 'phone', type: 'text' },
                        { label: 'البريد الإلكتروني', key: 'email', type: 'email' },
                        { label: 'الراتب الأساسي (ر.س)', key: 'salary', type: 'number', required: true },
                        { label: 'تاريخ الانضمام', key: 'joinDate', type: 'date' },
                    ].map(({ label, key, type, required }) => (
                        <div key={key}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>{label}</label>
                            <input type={type} required={required} value={form[key] || ''} onChange={f(key)}
                                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }} />
                        </div>
                    ))}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>القسم</label>
                        <select value={form.department || ''} onChange={f('department')}
                            style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', background: 'white' }}>
                            <option value="">-- اختر القسم --</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>الحالة الوظيفية</label>
                        <select value={form.status || 'ACTIVE'} onChange={f('status')}
                            style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', background: 'white' }}>
                            <option value="ACTIVE">🟢 نشط</option>
                            <option value="ON_LEAVE">🟡 إجازة</option>
                            <option value="TERMINATED">🔴 منتهي الخدمة</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button onClick={onClose} style={{ padding: '12px 28px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontFamily: 'Cairo' }}>إلغاء</button>
                    <button onClick={() => onSave(form)} style={{ padding: '12px 36px', borderRadius: '10px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontFamily: 'Cairo' }}>
                        {isEdit ? 'تحديث البيانات' : 'حفظ الموظف'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ────────────────────────────────────
// Salary Modal
// ────────────────────────────────────
const SalaryModal = ({ employee, onClose, onSave }) => {
    const now = new Date();
    const [form, setForm] = useState({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        allowances: 0,
        deductions: 0,
    });
    const net = (employee?.salary || 0) + Number(form.allowances) - Number(form.deductions);
    const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '500px', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', left: '20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                <h3 style={{ margin: '0 0 6px', fontWeight: '800', color: '#0f172a' }}>💰 صرف الراتب</h3>
                <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.9rem' }}>{employee?.name} - الراتب الأساسي: {(employee?.salary || 0).toLocaleString('ar')} ر.س</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>الشهر</label>
                        <select value={form.month} onChange={f('month')} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', background: 'white' }}>
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>السنة</label>
                        <input type="number" value={form.year} onChange={f('year')} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>البدلات والإضافات (ر.س)</label>
                        <input type="number" value={form.allowances} onChange={f('allowances')} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>الخصومات (ر.س)</label>
                        <input type="number" value={form.deductions} onChange={f('deductions')} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                    </div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px', color: 'white' }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>صافي الراتب المستحق</div>
                    <div style={{ fontSize: '2rem', fontWeight: '900' }}>{net.toLocaleString('ar')} ر.س</div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontFamily: 'Cairo' }}>إلغاء</button>
                    <button onClick={() => onSave({ ...form, amount: net })} style={{ flex: 2, padding: '12px', borderRadius: '10px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontFamily: 'Cairo' }}>
                        ✅ تأكيد الصرف
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ────────────────────────────────────
// Bulk Payroll Modal  
// ────────────────────────────────────
const BulkPayrollModal = ({ onClose, onRun }) => {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const run = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/payroll/run`, { month, year }, { headers: H() });
            setResult(res.data);
            onRun();
        } catch (e) { alert('❌ ' + (e.response?.data?.error || e.message)); }
        setLoading(false);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '520px', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', left: '20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                <h3 style={{ margin: '0 0 8px', fontWeight: '800', color: '#0f172a' }}>🚀 تشغيل كشف الرواتب الشهري</h3>
                <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.9rem' }}>سيتم صرف رواتب جميع الموظفين النشطين تلقائياً للشهر المحدد.</p>

                {!result ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>الشهر</label>
                                <select value={month} onChange={e => setMonth(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', background: 'white' }}>
                                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>السنة</label>
                                <input type="number" value={year} onChange={e => setYear(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                            </div>
                        </div>
                        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '14px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.85rem', color: '#92400e' }}>
                            ⚠️ تنبيه: الموظفون الذين تم صرف رواتبهم مسبقاً لهذا الشهر سيتم تخطيهم تلقائياً.
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontFamily: 'Cairo' }}>إلغاء</button>
                            <button onClick={run} disabled={loading} style={{ flex: 2, padding: '12px', borderRadius: '10px', background: '#7c3aed', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {loading ? '⏳ جاري التشغيل...' : <><Play size={16} /> تشغيل الكشف</>}
                            </button>
                        </div>
                    </>
                ) : (
                    <div>
                        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', padding: '16px', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
                            <CheckCircle size={32} color="#10b981" style={{ marginBottom: '8px' }} />
                            <div style={{ fontWeight: '700', color: '#065f46' }}>تم تشغيل كشف الرواتب بنجاح!</div>
                            <div style={{ fontSize: '0.85rem', color: '#047857', marginTop: '4px' }}>إجمالي المصروف: {(result.total || 0).toLocaleString('ar')} ر.س</div>
                        </div>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '0.85rem' }}>
                            {result.results?.map((r, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#1e293b' }}>{r.name}</span>
                                    <span style={{ color: r.status === 'processed' ? '#10b981' : '#94a3b8', fontWeight: '600' }}>
                                        {r.status === 'processed' ? `✅ ${r.salary.toLocaleString('ar')} ر.س` : '⏭️ تم مسبقاً'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button onClick={onClose} style={{ width: '100%', marginTop: '16px', padding: '12px', borderRadius: '10px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontFamily: 'Cairo' }}>إغلاق</button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// ────────────────────────────────────
// Main HRPage
// ────────────────────────────────────
export default function HRPage() {
    const queryClient = useQueryClient();
    const [modal, setModal] = useState(null); // 'add' | 'edit' | 'salary' | 'bulk' | 'details'
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [activeTab, setActiveTab] = useState('employees'); // 'employees' | 'payroll'
    const [payrollFilter, setPayrollFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

    const { data: employees = [], isLoading } = useQuery({ queryKey: ['employees'], queryFn: async () => (await axios.get(`${API_URL}/employees`, { headers: H() })).data });
    const { data: summary } = useQuery({ queryKey: ['hrSummary'], queryFn: async () => (await axios.get(`${API_URL}/hr-summary`, { headers: H() })).data });
    const { data: salaryRecords = [] } = useQuery({
        queryKey: ['salaryRecords', payrollFilter],
        queryFn: async () => (await axios.get(`${API_URL}/salary-records?month=${payrollFilter.month}&year=${payrollFilter.year}`, { headers: H() })).data,
        enabled: activeTab === 'payroll'
    });

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (selected?.id) return axios.put(`${API_URL}/employees/${selected.id}`, data, { headers: H() });
            return axios.post(`${API_URL}/employees`, data, { headers: H() });
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); queryClient.invalidateQueries({ queryKey: ['hrSummary'] }); setModal(null); setSelected(null); }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`${API_URL}/employees/${id}`, { headers: H() }),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); queryClient.invalidateQueries({ queryKey: ['hrSummary'] }); }
    });

    const salaryMutation = useMutation({
        mutationFn: (data) => axios.post(`${API_URL}/employees/${selected.id}/pay-salary`, data, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['salaryRecords'] });
            setModal(null); setSelected(null);
            alert('✅ تم صرف الراتب وتسجيل القيد المحاسبي بنجاح');
        },
        onError: (e) => alert('❌ ' + (e.response?.data?.error || e.message))
    });

    const filteredEmployees = employees.filter(emp => {
        const matchSearch = !search || emp.name.includes(search) || emp.jobTitle?.includes(search) || emp.employeeId?.includes(search);
        const matchDept = !filterDept || emp.department === filterDept;
        const matchStatus = !filterStatus || emp.status === filterStatus;
        return matchSearch && matchDept && matchStatus;
    });

    const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

    return (
        <div style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'linear-gradient(135deg, #1e293b 0%, #1e40af 100%)', borderRadius: '20px', padding: '28px', marginBottom: '24px', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.7rem', fontWeight: '900' }}>👥 إدارة الموارد البشرية</h2>
                        <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: '0.95rem' }}>إدارة الموظفين، الرواتب، الأقسام والأداء</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={() => { setModal('bulk'); }} style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '11px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.88rem' }}>
                            <Play size={16} /> كشف رواتب شهري
                        </button>
                        <button onClick={() => { setSelected(null); setModal('add'); }} style={{ background: 'white', color: '#1e40af', border: 'none', padding: '11px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.88rem' }}>
                            <Plus size={16} /> موظف جديد
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <KPICard icon={<Users size={22} />} title="إجمالي الموظفين" value={summary?.totalEmployees || 0} sub={`${summary?.activeEmployees || 0} نشط`} color="#3b82f6" />
                <KPICard icon={<DollarSign size={22} />} title="فاتورة الرواتب الشهرية" value={`${(summary?.totalSalaryCost || 0).toLocaleString('ar')} ر.س`} sub="للموظفين النشطين" color="#10b981" />
                <KPICard icon={<CheckCircle size={22} />} title="مدفوع هذا الشهر" value={`${(summary?.paidThisMonth || 0).toLocaleString('ar')} ر.س`} sub="من كشف الرواتب" color="#8b5cf6" />
                <KPICard icon={<Building2 size={22} />} title="الأقسام" value={summary?.departments?.length || 0} sub="قسم إداري" color="#f59e0b" />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#f1f5f9', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
                {[{ key: 'employees', label: '👤 الموظفون' }, { key: 'payroll', label: '💰 سجل الرواتب' }, { key: 'geoAttendance', label: '📍 الحضور الجغرافي' }].map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: '10px 22px', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '600', fontSize: '0.9rem', borderRadius: '8px', transition: 'all 0.2s', background: activeTab === t.key ? 'white' : 'transparent', color: activeTab === t.key ? '#2563eb' : '#64748b', boxShadow: activeTab === t.key ? '0 2px 6px rgba(0,0,0,0.07)' : 'none' }}>{t.label}</button>
                ))}
            </div>

            {/* Employees Tab */}
            {activeTab === 'employees' && (
                <>
                    {/* Filters */}
                    <div style={{ background: 'white', padding: '16px 20px', borderRadius: '14px', marginBottom: '16px', border: '1px solid #f1f5f9', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input placeholder="بحث بالاسم أو المسمى..." value={search} onChange={e => setSearch(e.target.value)}
                                style={{ width: '100%', padding: '10px 38px 10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', background: 'white', color: '#475569' }}>
                            <option value="">كل الأقسام</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', background: 'white', color: '#475569' }}>
                            <option value="">كل الحالات</option>
                            <option value="ACTIVE">🟢 نشط</option>
                            <option value="ON_LEAVE">🟡 إجازة</option>
                            <option value="TERMINATED">🔴 منتهي</option>
                        </select>
                        <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>{filteredEmployees.length} نتيجة</span>
                    </div>

                    {/* Employee Cards Grid */}
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>⏳ جاري تحميل البيانات...</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {filteredEmployees.map(emp => {
                                const badge = statusBadge(emp.status);
                                const lastSalary = emp.salaries?.[0];
                                return (
                                    <motion.div key={emp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}
                                        whileHover={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', y: -2 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #dbeafe, #eff6ff)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: '800', fontSize: '1.2rem' }}>
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{emp.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{emp.employeeId}</div>
                                                </div>
                                            </div>
                                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: badge.bg, color: badge.color }}>{badge.label}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px', fontSize: '0.85rem', color: '#475569' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={14} color="#94a3b8" /> {emp.jobTitle}</div>
                                            {emp.department && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Building2 size={14} color="#94a3b8" /> {emp.department}</div>}
                                            {emp.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} color="#94a3b8" /> {emp.phone}</div>}
                                        </div>
                                        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                                            <div><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>الراتب الأساسي</div><div style={{ fontWeight: '800', color: '#10b981', fontSize: '1rem' }}>{emp.salary.toLocaleString('ar')} ر.س</div></div>
                                            <div style={{ textAlign: 'left' }}><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>آخر صرف</div><div style={{ fontWeight: '600', color: '#64748b', fontSize: '0.82rem' }}>{lastSalary ? `${months[lastSalary.month - 1]} ${lastSalary.year}` : 'لم يتم'}</div></div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => { setSelected(emp); setModal('salary'); }} style={{ flex: 1, padding: '8px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                                <DollarSign size={14} /> صرف الراتب
                                            </button>
                                            <button onClick={() => { setSelected(emp); setModal('edit'); }} style={{ padding: '8px 12px', background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe', borderRadius: '8px', cursor: 'pointer' }}><Edit size={14} /></button>
                                            <button onClick={() => { if (window.confirm(`حذف ${emp.name}?`)) deleteMutation.mutate(emp.id); }}
                                                style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {filteredEmployees.length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>لا يوجد موظفون مطابقون للبحث</div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Payroll Tab */}
            {activeTab === 'payroll' && (
                <div>
                    <div style={{ background: 'white', padding: '16px 20px', borderRadius: '14px', marginBottom: '16px', border: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select value={payrollFilter.month} onChange={e => setPayrollFilter(p => ({ ...p, month: e.target.value }))} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', background: 'white' }}>
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                        <input type="number" value={payrollFilter.year} onChange={e => setPayrollFilter(p => ({ ...p, year: e.target.value }))}
                            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', width: '100px' }} />
                        <span style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>
                            إجمالي: {salaryRecords.reduce((s, r) => s + r.netSalary, 0).toLocaleString('ar')} ر.س ({salaryRecords.length} موظف)
                        </span>
                    </div>
                    <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <tr>
                                    {['الموظف', 'الراتب الأساسي', 'البدلات', 'الخصومات', 'الصافي', 'الشهر', 'الحالة'].map(h => (
                                        <th key={h} style={{ padding: '14px 18px', textAlign: 'right', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {salaryRecords.length === 0 ? (
                                    <tr><td colSpan="7" style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>لا توجد سجلات رواتب لهذا الشهر</td></tr>
                                ) : salaryRecords.map(record => (
                                    <tr key={record.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '14px 18px', fontWeight: '600', color: '#1e293b' }}>{record.employee?.name}</td>
                                        <td style={{ padding: '14px 18px', color: '#475569' }}>{(record.baseSalary || 0).toLocaleString('ar')} ر.س</td>
                                        <td style={{ padding: '14px 18px', color: '#10b981' }}>+{(record.allowances || 0).toLocaleString('ar')} ر.س</td>
                                        <td style={{ padding: '14px 18px', color: '#ef4444' }}>-{(record.deductions || 0).toLocaleString('ar')} ر.س</td>
                                        <td style={{ padding: '14px 18px', fontWeight: '800', color: '#0f172a', fontSize: '1rem' }}>{record.netSalary.toLocaleString('ar')} ر.س</td>
                                        <td style={{ padding: '14px 18px', color: '#64748b' }}>{months[record.month - 1]} {record.year}</td>
                                        <td style={{ padding: '14px 18px' }}><span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>✅ مصروف</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Geo Attendance Tab */}
            {activeTab === 'geoAttendance' && <GeoAttendanceTab employees={employees} />}

            {/* Modals */}
            {(modal === 'add' || modal === 'edit') && <EmployeeModal employee={modal === 'edit' ? selected : null} onClose={() => { setModal(null); setSelected(null); }} onSave={(data) => saveMutation.mutate(data)} />}
            {modal === 'salary' && selected && <SalaryModal employee={selected} onClose={() => { setModal(null); setSelected(null); }} onSave={(data) => salaryMutation.mutate(data)} />}
            {modal === 'bulk' && <BulkPayrollModal onClose={() => setModal(null)} onRun={() => { queryClient.invalidateQueries({ queryKey: ['salaryRecords'] }); queryClient.invalidateQueries({ queryKey: ['hrSummary'] }); }} />}
        </div>
    );
}
