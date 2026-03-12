import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Users, UserPlus, FileText, DollarSign, 
    Briefcase, Calendar, Clock, Search, Filter, 
    MoreVertical, Edit, Trash2, CheckCircle2, 
    XCircle, AlertTriangle, Download, RefreshCw,
    UserCheck, UserX, Wallet, TrendingUp, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '@/config';
import { useToast } from '../../context/ToastContext';
import { exportToExcel } from '../../utils/excelExport';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const HRPage = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('employees');
    const [searchTerm, setSearchTerm] = useState('');
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [showPayrollModal, setShowPayrollModal] = useState(false);

    // Queries
    const { data: employees = [], isLoading: employeesLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => (await axios.get(`${API_URL}/employees`, { headers: H() })).data
    });

    const { data: attendance = [] } = useQuery({
        queryKey: ['attendance'],
        queryFn: async () => (await axios.get(`${API_URL}/attendance`, { headers: H() })).data
    });

    const { data: payroll = [] } = useQuery({
        queryKey: ['payroll'],
        queryFn: async () => (await axios.get(`${API_URL}/payroll`, { headers: H() })).data
    });

    // Stats
    const stats = useMemo(() => {
        const active = employees.filter(e => e.status === 'ACTIVE').length;
        const totalSalary = employees.reduce((acc, curr) => acc + (curr.salary || 0), 0);
        const presentToday = attendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length;
        return { total: employees.length, active, totalSalary, presentToday };
    }, [employees, attendance]);

    const filteredEmployees = employees.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fade-in" style={{ direction: 'rtl' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '45px' }}>
                <div>
                    <h2 style={{ margin: '0 0 12px 0', fontSize: '2.8rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.04em' }} className="gradient-text">إدارة الموارد البشرية</h2>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '1.1rem', fontWeight: '600' }}>إدارة الكفاءات، متابعة الحضور، ومعالجة الرواتب الذكية.</p>
                </div>
                <div style={{ display: 'flex', gap: '18px' }}>
                    <motion.button {...buttonClick} onClick={() => setShowEmployeeModal(true)} className="glass-card" style={{ color: '#fff', padding: '14px 30px', borderRadius: '20px', cursor: 'pointer', fontWeight: '900', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <UserPlus size={22} color="#6366f1" /> إضافة موظف جـديد
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)' }} 
                        whileTap={{ scale: 0.95 }} 
                        onClick={() => setShowPayrollModal(true)}
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '14px 35px', borderRadius: '20px', cursor: 'pointer', fontWeight: '900', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 15px 35px rgba(16, 185, 129, 0.3)' }}
                    >
                        <Wallet size={22} /> مسيرات الرواتب
                    </motion.button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px', marginBottom: '45px' }}>
                {[
                    { label: 'إجمالي الموظفين', value: stats.total, icon: <Users size={28} />, color: '#6366f1' },
                    { label: 'الموظفين النشطين', value: stats.active, icon: <UserCheck size={28} />, color: '#10b981' },
                    { label: 'الحضور اليومي', value: stats.presentToday, icon: <Clock size={28} />, color: '#f59e0b' },
                    { label: 'إجمالي الرواتب الشهري', value: stats.totalSalary, icon: <DollarSign size={28} />, color: '#ef4444', suffix: 'ر.س' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="glass-card card-hover" style={{ padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ background: `${s.color}15`, padding: '15px', borderRadius: '18px', color: s.color }}>{s.icon}</div>
                            <div>
                                <div style={{ fontSize: '1rem', color: '#a1a1aa', fontWeight: '700' }}>{s.label}</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>{s.value.toLocaleString()} <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>{s.suffix}</span></div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Tabs & Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', gap: '20px', flexWrap: 'wrap' }}>
                <div className="glass-card" style={{ display: 'inline-flex', padding: '6px', borderRadius: '18px', gap: '5px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {[
                        { key: 'employees', label: 'قائمة الموظفين', icon: <Users size={18} /> },
                        { key: 'attendance', label: 'سجل الحضور', icon: <Clock size={18} /> },
                        { key: 'payroll', label: 'الأرشيف المالي', icon: <FileText size={18} /> }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '12px 25px', border: 'none', background: activeTab === tab.key ? 'rgba(99,102,241,0.15)' : 'transparent',
                                color: activeTab === tab.key ? '#fff' : '#71717a', cursor: 'pointer', borderRadius: '14px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
                <div style={{ position: 'relative', minWidth: '350px' }}>
                    <Search size={20} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                    <input 
                        type="text" 
                        placeholder="بحث عن موظف بالاسم، الرقم الوظيفي، أو المسمى..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="premium-input" 
                        style={{ width: '100%', paddingRight: '45px' }} 
                    />
                </div>
            </div>

            {/* Content Table */}
            <div className="glass-card" style={{ borderRadius: '35px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="table-responsive">
                    <table className="table-glass" style={{ margin: 0 }}>
                        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <tr>
                                <th style={{ textAlign: 'right', padding: '25px' }}>الموظف</th>
                                <th style={{ textAlign: 'right' }}>القسم والمسمى</th>
                                <th style={{ textAlign: 'center' }}>الراتب الأساسي</th>
                                <th style={{ textAlign: 'center' }}>الحالة الوظيفية</th>
                                <th style={{ textAlign: 'center' }}>تاريخ الانضمام</th>
                                <th style={{ textAlign: 'center' }}>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeesLoading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px' }}><RefreshCw className="animate-spin" size={40} style={{ color: '#6366f1' }} /></td></tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: '#52525b' }}>لا يوجد موظفين حالياً</td></tr>
                            ) : (
                                filteredEmployees.map((emp, idx) => (
                                    <motion.tr key={emp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                                        <td style={{ padding: '20px 25px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a1a1aa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '900', color: '#fff', border: '2px solid rgba(255,255,255,0.1)' }}>
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '900', color: '#fff', fontSize: '1.05rem' }}>{emp.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#71717a' }}>ID: {emp.employeeId || emp.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '700', color: '#a1a1aa' }}>{emp.position || '—'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#52525b' }}>{emp.department || 'عام'}</div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ fontWeight: '900', color: '#10b981', fontSize: '1.1rem' }}>{(emp.salary || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>ر.س</span></div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`status-pill ${emp.status === 'ACTIVE' ? 'status-paid' : 'status-cancelled'}`}>
                                                {emp.status === 'ACTIVE' ? 'على رأس العمل' : 'متوقف'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center', color: '#71717a', fontWeight: '600' }}>
                                            {emp.joinDate ? new Date(emp.joinDate).toLocaleDateString('ar-SA') : '—'}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                <motion.button whileHover={{ scale: 1.1 }} style={{ background: 'rgba(255,255,255,0.05)', color: '#a1a1aa', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><Edit size={18} /></motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><Trash2 size={18} /></motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HRPage;
