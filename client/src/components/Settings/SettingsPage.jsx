import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_URL from '@/config';
import { 
    Settings, User, Building2, Save, Plus, Trash2, Eye, EyeOff, Edit,
    Shield, Bell, Database, RefreshCw, Clock, AlertOctagon, 
    MessageSquare, DollarSign, Briefcase, Users, Activity, X, 
    Search, ShieldCheck, Mail, Phone, MapPin, Globe, CreditCard,
    Cpu, Key, BellRing, Smartphone, ClipboardList, CheckCircle2,
    Lock, LayoutGrid, ChevronRight, HardDrive, Zap, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuditLogs from '../Admin/AuditLogs';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const TabButton = ({ active, onClick, children, icon: Icon, color = '#6366f1' }) => (
    <motion.button 
        whileHover={{ x: 8, background: 'rgba(255,255,255,0.04)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick} 
        style={{
            width: '100%',
            padding: '18px 24px',
            border: 'none',
            cursor: 'pointer',
            background: active ? `linear-gradient(90deg, ${color}22 0%, transparent 100%)` : 'transparent',
            color: active ? '#fff' : '#71717a',
            fontFamily: 'Cairo',
            fontWeight: '900',
            fontSize: '1.05rem',
            borderRadius: '22px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            position: 'relative',
        }}
    >
        {active && <motion.div layoutId="tab-glow" style={{ position: 'absolute', right: '-3px', top: '25%', bottom: '25%', width: '3px', background: color, borderRadius: '4px', boxShadow: `0 0 20px ${color}` }} />}
        <div style={{ 
            width: '38px', height: '38px', borderRadius: '12px', background: active ? `${color}22` : 'rgba(255,255,255,0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
        }}>
            <Icon size={20} color={active ? color : '#52525b'} />
        </div>
        {children}
    </motion.button>
);

const PremiumInput = ({ label, value, onChange, type = 'text', placeholder, icon: Icon, readOnly }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ fontWeight: '900', fontSize: '0.9rem', color: '#a1a1aa', marginRight: '5px' }}>{label}</label>
        <div style={{ position: 'relative' }}>
            {Icon && <Icon size={20} style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />}
            <input
                type={type}
                value={value ?? ''}
                onChange={onChange}

                placeholder={placeholder}
                readOnly={readOnly}
                className="premium-input"
                style={{
                    width: '100%',
                    paddingRight: Icon ? '50px' : '20px',
                    borderColor: readOnly ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)',
                    background: readOnly ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)',
                    color: readOnly ? '#52525b' : '#fff',
                    fontSize: '1rem'
                }}
            />
        </div>
    </div>
);

// ======= TAB: Company Info =======
const CompanyTab = () => {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({});
    const [saved, setSaved] = useState(false);

    const { data: qData, isLoading } = useQuery({
        queryKey: ['companyInfo'],
        queryFn: async () => (await axios.get(`${API_URL}/settings/companyInfo`, { headers: H() })).data
    });

    useEffect(() => { if (qData) setForm(qData); }, [qData]);

    const saveMutation = useMutation({
        mutationFn: async (data) => await axios.post(`${API_URL}/settings/companyInfo`, { value: data }, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companyInfo'] });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    });

    if (isLoading) return <div style={{ color: '#71717a', padding: '100px', textAlign: 'center' }}><RefreshCw className="animate-spin" size={40} /></div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: '45px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15, 23, 42, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '45px' }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '2rem', fontWeight: '900' }} className="gradient-text">هوية الكيان التجاري</h3>
                        <p style={{ margin: '10px 0 0 0', color: '#a1a1aa', fontSize: '1rem', fontWeight: '700' }}>المعلومات الرسمية تظهر تلقائياً في جميع العقود والفواتير الضريبية.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    <PremiumInput label="الاسم التجاري الكامل" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} icon={Building2} />
                    <PremiumInput label="الرقم الضريبي الموحد (VAT)" value={form.vatNumber || ''} onChange={e => setForm({...form, vatNumber: e.target.value})} icon={Shield} />
                    <PremiumInput label="الرقم الموحد للتواصل" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} icon={Phone} />
                    <PremiumInput label="البريد المعتمد للمراسلات" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} icon={Mail} />
                    <div style={{ gridColumn: 'span 2' }}>
                        <PremiumInput label="العنوان الرئيسي والمقر الإداري" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} icon={MapPin} />
                    </div>
                    <PremiumInput label="المدينة والمقر" value={form.city || ''} onChange={e => setForm({...form, city: e.target.value})} />
                    <PremiumInput label="رقم السجل التجاري (CR)" value={form.crNumber || ''} onChange={e => setForm({...form, crNumber: e.target.value})} icon={ClipboardList} />
                    <div style={{ gridColumn: 'span 2' }}>
                         <PremiumInput label="نطاق الويب الرسمي (Website)" value={form.website || ''} onChange={e => setForm({...form, website: e.target.value})} icon={Globe} />
                    </div>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.02, boxShadow: '0 15px 30px rgba(99, 102, 241, 0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => saveMutation.mutate(form)} 
                    style={{ 
                        marginTop: '45px', width: '100%',
                        background: saved ? '#10b981' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                        color: 'white', border: 'none', padding: '18px 35px', borderRadius: '22px', 
                        fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    {saved ? <CheckCircle2 size={24} /> : <Save size={24} />} 
                    {saveMutation.isPending ? 'جاري حفظ التغييرات...' : (saved ? 'تم اعتماد البيانات بنجاح' : 'تحديث هوية المنشأة')}
                </motion.button>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div className="glass-card" style={{ padding: '35px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15, 23, 42, 0.4)' }}>
                    <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '900', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Eye size={20} color="#6366f1" /> معاينة الهوية البرمجية
                    </h4>
                    <div style={{ 
                        background: '#fff', borderRadius: '20px', padding: '25px', color: '#000', 
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid #e2e8f0' 
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #6366f1', paddingBottom: '15px', marginBottom: '15px' }}>
                            <div style={{ fontWeight: '900', fontSize: '1.1rem' }}>{form.name || 'اسم المنشأة يظهر هنا'}</div>
                            <div style={{ textAlign: 'left', fontSize: '0.7rem', color: '#64748b' }}>
                                VAT: {form.vatNumber || '0000000000'} <br/>
                                CR: {form.crNumber || '0000000000'}
                            </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>📞 {form.phone || 'رقم التواصل'}</div>
                            <div>📍 {form.city || 'المدينة'}</div>
                            <div style={{ gridColumn: 'span 2' }}>✉️ {form.email || 'البريد الإلكتروني'}</div>
                        </div>
                    </div>
                    <p style={{ color: '#71717a', fontSize: '0.85rem', fontWeight: '700', marginTop: '20px', lineHeight: '1.5' }}>
                        * هكذا يظهر شعار وبيانات منشأتك في ترويسة التقارير الرسمية والفواتير الضريبية.
                    </p>
                </div>

                <div className="glass-card" style={{ padding: '30px', borderRadius: '35px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                    <div style={{ color: '#fff', fontWeight: '900', fontSize: '1rem', marginBottom: '10px' }}>تكامل الفاتورة الإلكترونية</div>
                    <p style={{ color: '#a1a1aa', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0' }}>
                        البيانات المدخلة هنا مرتبطة بمحرك الفوترة الذكي لضمان التوافق مع متطلبات (هيئة الزكاة والضريبة والجمارك).
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

// ======= TAB: Users Management =======
const UsersTab = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER', permissions: {} });

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => (await axios.get(`${API_URL}/users`, { headers: H() })).data
    });

    const mutation = useMutation({
        mutationFn: async (data) => {
            if (editingUser) return await axios.put(`${API_URL}/users/${editingUser.id}`, data, { headers: H() });
            return await axios.post(`${API_URL}/users`, data, { headers: H() });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setShowForm(false);
            setEditingUser(null);
            setForm({ name: '', email: '', password: '', role: 'USER', permissions: {} });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await axios.delete(`${API_URL}/users/${id}`, { headers: H() }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
    });

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const modules = [
        { id: 'all', label: 'كافة الصلاحيات (Full Admin Access)' },
        { id: 'dashboard', label: 'لوحة القيادة' },
        { id: 'accounting', label: 'المحاسبة والمالية' },
        { id: 'invoices', label: 'المبيعات والفواتير' },
        { id: 'quotes', label: 'عروض الأسعار' },
        { id: 'inventory', label: 'المخزون والمستودعات' },
        { id: 'hr', label: 'الموارد البشرية' },
        { id: 'projects', label: 'المشاريع والمقاولات' },
        { id: 'contracts', label: 'عقود المقاولات' },
        { id: 'clients', label: 'إدارة العملاء' },
        { id: 'reports', label: 'التقارير الإحصائية' },
        { id: 'archive', label: 'الأرشيف الإلكتروني' },
        { id: 'real_estate', label: 'إدارة العقارات' },
        { id: 'field_ops', label: 'الإشراف الميداني' },
        { id: 'crm', label: 'إدارة العملاء (CRM)' },
        { id: 'ai', label: 'مركز الذكاء الاصطناعي' },
        { id: 'zatca', label: 'الفاتورة الإلكترونية' },
        { id: 'support', label: 'الدعم الفني والشكاوي' },
        { id: 'settings', label: 'إعدادات النظام' }
    ];

    const togglePermission = (modId) => {
        setForm(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [modId]: !prev.permissions[modId]
            }
        }));
    };

    if (isLoading) return <div style={{ color: '#71717a', padding: '100px', textAlign: 'center' }}><RefreshCw className="animate-spin" size={40} /></div>;

    const getRoleStyle = (role) => {
        switch(role) {
            case 'ADMIN': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'مدير نظام' };
            case 'ACCOUNTANT': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'مالي ومحاسب' };
            case 'MANAGER': return { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', label: 'مدير قطاع' };
            default: return { bg: 'rgba(255, 255, 255, 0.05)', color: '#a1a1aa', label: 'موظف' };
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '45px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15, 23, 42, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h3 className="gradient-text" style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>إدارة الكوادر والمؤهلات</h3>
                    <p style={{ color: '#a1a1aa', fontWeight: '700', marginTop: '8px' }}>تخصيص مستويات الوصول الدقيقة لكل عضو في فريق العمل مع مراقبة النشاط.</p>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                        <input 
                            className="premium-input" 
                            placeholder="ابحث بالاسم، الحساب، أو المسمى..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', paddingRight: '45px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
                        />
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { setShowForm(true); setEditingUser(null); setForm({ name: '', email: '', password: '', role: 'USER', permissions: {} }); }}
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '14px 30px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(99,102,241,0.2)' }}
                    >
                        <Plus size={20} /> إضافة عضو جديد
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '35px', borderRadius: '30px', marginBottom: '45px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px', marginBottom: '35px' }}>
                                <PremiumInput label="اسم الموظف" value={form.name} onChange={e => setForm({...form, name: e.target.value})} icon={User} />
                                <PremiumInput label="البريد المهني" value={form.email} onChange={e => setForm({...form, email: e.target.value})} icon={Mail} />
                                <PremiumInput label="مفتاح الدخول" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editingUser ? 'اترك فارغاً لعدم التغيير' : 'حدد كلمة مرور قوية...'} icon={Lock} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontWeight: '900', fontSize: '0.9rem', color: '#a1a1aa' }}>المستوى الإداري (Role)</label>
                                    <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="premium-input-select">
                                        <option value="ADMIN">مدير نظام (أعلى صلاحية)</option>
                                        <option value="ACCOUNTANT">محاسب مالي (قيود وفواتير)</option>
                                        <option value="MANAGER">مدير قطاع / مهندس مسؤول</option>
                                        <option value="USER">موظف عام / إدخال بيانات</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '25px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                    <h4 style={{ color: '#fff', margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>مصفوفة الصلاحيات الدقيقة (Modular Permissions)</h4>
                                    <motion.button onClick={() => {
                                        const allPerms = {};
                                        modules.forEach(m => allPerms[m.id] = true);
                                        setForm({...form, permissions: allPerms});
                                    }} style={{ background: 'transparent', color: '#6366f1', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '0.85rem' }}>منح كافة الصلاحيات</motion.button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                                    {modules.map(mod => (
                                        <motion.div 
                                            key={mod.id}
                                            whileHover={{ background: 'rgba(255,255,255,0.04)', scale: 1.01 }}
                                            onClick={() => togglePermission(mod.id)}
                                            style={{
                                                padding: '14px 20px', borderRadius: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
                                                background: form.permissions?.[mod.id] ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.01)',
                                                border: `1px solid ${form.permissions?.[mod.id] ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div style={{ 
                                                width: '22px', height: '22px', borderRadius: '6px', 
                                                background: form.permissions?.[mod.id] ? '#6366f1' : 'transparent',
                                                border: `2px solid ${form.permissions?.[mod.id] ? '#6366f1' : '#3f3f46'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                                            }}>
                                                {form.permissions?.[mod.id] && <CheckCircle2 size={15} />}
                                            </div>
                                            <span style={{ color: form.permissions?.[mod.id] ? '#fff' : '#a1a1aa', fontWeight: '800', fontSize: '0.95rem' }}>{mod.label}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', justifyContent: 'flex-end', marginTop: '45px' }}>
                                <button onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#71717a', border: 'none', fontWeight: '900', cursor: 'pointer', padding: '0 20px' }}>إلغاء الإجراء</button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => mutation.mutate(form)} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', padding: '16px 50px', borderRadius: '20px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 30px rgba(99,102,241,0.2)' }}>
                                    {mutation.isPending ? 'جاري المزامنة...' : 'اعتماد بيانات الموظف'}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="table-responsive">
                <table className="table-glass" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'right', padding: '15px 25px', background: 'transparent', color: '#52525b', fontSize: '0.75rem', textTransform: 'uppercase' }}>المستخدم</th>
                            <th style={{ textAlign: 'center', background: 'transparent', color: '#52525b', fontSize: '0.75rem' }}>المسؤولية</th>
                            <th style={{ textAlign: 'center', background: 'transparent', color: '#52525b', fontSize: '0.75rem' }}>الحالة التشغيلية</th>
                            <th style={{ textAlign: 'center', background: 'transparent', color: '#52525b', fontSize: '0.75rem' }}>التحكم</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '80px', color: '#52525b', fontWeight: '800' }}>لا توجد سجلات مطابقة لمعايير البحث.</td></tr>
                        ) : filteredUsers.map((u, idx) => (
                            <motion.tr 
                                key={u.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '20px' }}
                            >
                                <td style={{ padding: '20px 25px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '1.2rem', boxShadow: '0 8px 15px rgba(99,102,241,0.2)' }}>{u.name.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontWeight: '900', color: '#fff', fontSize: '1.05rem' }}>{u.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: '700' }}>{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{ 
                                        fontSize: '0.8rem', fontWeight: '900', letterSpacing: '0.5px',
                                        color: getRoleStyle(u.role).color, background: getRoleStyle(u.role).bg, 
                                        padding: '6px 16px', borderRadius: '12px', border: `1px solid ${getRoleStyle(u.role).color}22` 
                                    }}>
                                        {getRoleStyle(u.role).label}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                                        <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '900' }}>نشط</span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                        <motion.button whileHover={{ scale: 1.1, background: 'rgba(99,102,241,0.2)' }} onClick={() => { setEditingUser(u); setForm({...u, password: ''}); setShowForm(true); }} style={{ background: 'rgba(255,255,255,0.03)', color: '#6366f1', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><Edit size={18} /></motion.button>
                                        {u.email !== 'admin@southnew.com' && <motion.button whileHover={{ scale: 1.1, background: 'rgba(239, 68, 68, 0.2)' }} onClick={() => { if(confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) deleteMutation.mutate(u.id); }} style={{ background: 'rgba(255,255,255,0.03)', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><Trash2 size={18} /></motion.button>}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

// ======= TAB: Client Portal Control =======
const ClientPortalTab = () => {
    const queryClient = useQueryClient();
    const [editingClient, setEditingClient] = useState(null);
    const [form, setForm] = useState({ email: '', password: '', portalPermissions: {} });
    const [msg, setMsg] = useState('');

    const portalModules = [
        { id: 'viewFinancials', label: 'عرض الفواتير والحسابات المالية' },
        { id: 'trackProjects', label: 'متابعة الجدول الزمني للمشاريع' },
        { id: 'viewVisits', label: 'الاطلاع على التقارير الميدانية' },
        { id: 'canRate', label: 'حق التقييم والتعليق على المهام' },
        { id: 'viewArchive', label: 'الوصول للأرشيف والمستندات' },
        { id: 'viewAI', label: 'الاطلاع على تحليلات الذكاء الاصطناعي' },
    ];

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ['portalClients'],
        queryFn: async () => (await axios.get(`${API_URL}/partners?type=CUSTOMER`, { headers: H() })).data
    });

    const updateMutation = useMutation({
        mutationFn: async (data) => await axios.put(`${API_URL}/partners/${data.id}`, data, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portalClients'] });
            setMsg('✅ تم تحديث بيانات بوابة العميل بنجاح');
            setEditingClient(null);
            setTimeout(() => setMsg(''), 3000);
        },
        onError: () => setMsg('❌ فشل في تحديث بيانات العميل')
    });

    const handleSave = () => {
        if (!form.email) return setMsg('❌ البريد الإلكتروني للبوابة مطلوب');
        updateMutation.mutate({ ...editingClient, ...form });
    };

    const togglePermission = (modId) => {
        setForm(prev => ({
            ...prev,
            portalPermissions: {
                ...prev.portalPermissions,
                [modId]: !prev.portalPermissions?.[modId]
            }
        }));
    };

    if (isLoading) return <div style={{ color: '#71717a', padding: '100px', textAlign: 'center' }}><RefreshCw className="animate-spin" size={40} /></div>;

    const portalClients = clients.filter(c => c.type === 'CUSTOMER');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '40px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ marginBottom: '35px' }}>
                <h3 className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0 }}>بوابة العملاء (Customer Portal)</h3>
                <p style={{ color: '#a1a1aa', fontWeight: '600', margin: '5px 0 0 0' }}>إدارة صلاحيات وصول العملاء الخارجيين لمتابعة استثماراتهم ومشاريعهم.</p>
            </div>

            {msg && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '15px 25px', borderRadius: '15px', background: msg.includes('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: msg.includes('✅') ? '#10b981' : '#ef4444', marginBottom: '25px', fontWeight: '800', border: '1px solid currentColor' }}>{msg}</motion.div>}

            <div className="table-responsive">
                <table className="table-glass">
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'right', padding: '15px' }}>اسم العميل</th>
                            <th style={{ textAlign: 'center' }}>الحساب المشترك</th>
                            <th style={{ textAlign: 'center' }}>حالة البوابة</th>
                            <th style={{ textAlign: 'center' }}>إجراءات التحصيل</th>
                        </tr>
                    </thead>
                    <tbody>
                        {portalClients.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '50px', color: '#52525b' }}>لا يوجد عملاء مضافين حالياً في النظام</td></tr>
                        ) : portalClients.map(c => (
                            <tr key={c.id}>
                                <td style={{ padding: '15px', fontWeight: '800', color: '#fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '35px', height: '35px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}><Building2 size={18} /></div>
                                        {c.name}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center', color: '#a1a1aa' }}>{c.email || '—'}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{ 
                                        color: c.email && c.password ? '#10b981' : '#71717a', 
                                        background: c.email && c.password ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)', 
                                        padding: '4px 15px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '900',
                                        border: `1px solid ${c.email && c.password ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)'}`
                                    }}>
                                        {c.email && c.password ? 'مفعلة' : 'معطلة'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => { setEditingClient(c); setForm({ email: c.email || '', password: '', portalPermissions: c.portalPermissions || {} }); }}
                                        style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: 'none', padding: '10px 25px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' }}
                                    >
                                        إدارة الصلاحيات
                                    </motion.button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {editingClient && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card" style={{ width: '100%', maxWidth: '700px', padding: '40px', borderRadius: '40px', position: 'relative' }}>
                            <button onClick={() => setEditingClient(null)} style={{ position: 'absolute', top: '25px', left: '25px', background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><X size={24} /></button>
                            
                            <h3 className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '10px' }}>إعدادات بوابة العميل: {editingClient.name}</h3>
                            <p style={{ color: '#a1a1aa', marginBottom: '30px', fontWeight: '600' }}>قم بتعيين مفاتيح الدخول وتحديد الأقسام التي يحق للعميل رؤيتها.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <PremiumInput label="بريد الدخول الإلكتروني" value={form.email} onChange={e => setForm({...form, email: e.target.value})} icon={Mail} />
                                <PremiumInput label="كلمة السر للمشترك" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="اترك فارغاً لعدم التغيير" icon={Lock} />
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                                <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.1rem', fontWeight: '900' }}>أذونات الوصول الممنوحة</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                                    {portalModules.map(mod => (
                                        <motion.div 
                                            key={mod.id}
                                            whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                                            onClick={() => togglePermission(mod.id)}
                                            style={{
                                                padding: '12px 20px', borderRadius: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                                                background: form.portalPermissions?.[mod.id] ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.01)',
                                                border: `1px solid ${form.portalPermissions?.[mod.id] ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div style={{ 
                                                width: '24px', height: '24px', borderRadius: '6px', 
                                                background: form.portalPermissions?.[mod.id] ? '#06b6d4' : 'transparent', border: '2px solid #06b6d4',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                                            }}>
                                                {form.portalPermissions?.[mod.id] && <CheckCircle2 size={16} />}
                                            </div>
                                            <span style={{ color: form.portalPermissions?.[mod.id] ? '#fff' : '#a1a1aa', fontWeight: '700', fontSize: '0.9rem' }}>{mod.label}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '40px' }}>
                                <button onClick={() => setEditingClient(null)} style={{ background: 'transparent', color: '#71717a', border: 'none', fontWeight: '800', cursor: 'pointer' }}>إلغاء</button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave} style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', color: '#fff', border: 'none', padding: '14px 40px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 20px rgba(6,182,212,0.2)' }}>
                                    {updateMutation.isPending ? 'جاري الحفظ...' : 'تحديث صلاحيات العميل'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ======= TAB: WhatsApp Integration =======

const WhatsAppTab = () => {
    const [qrUrl, setQrUrl] = useState(`${API_URL}/whatsapp/qr?t=${Date.now()}`);
    const [status, setStatus] = useState({ connected: false });

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await axios.get(`${API_URL}/whatsapp/status`);
                setStatus(res.data);
            } catch (e) {}
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '60px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: status.connected ? 'rgba(16, 185, 129, 0.05)' : 'rgba(99, 102, 241, 0.05)', borderRadius: '50%', filter: 'blur(80px)' }} />
            
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '2.2rem', fontWeight: '900' }} className="gradient-text">ربط الاتصالات الذكية (WhatsApp)</h3>
                <p style={{ margin: '0 0 35px 0', color: '#a1a1aa', fontSize: '1.2rem', fontWeight: '600', maxWidth: '700px', margin: '0 auto' }}>مسح كود الربط يمنح النظام القدرة على إرسال الإشعارات، كود التحقق، والتقارير الميدانية للعملاء والموظفين لحظياً.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div className="glass-card" style={{ padding: '30px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ marginBottom: '25px' }}>
                             <div style={{ fontSize: '0.9rem', color: '#71717a', fontWeight: '800', marginBottom: '10px' }}>حالة الارتباط الرقمي</div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ 
                                    width: '12px', height: '12px', borderRadius: '50%', 
                                    background: status.connected ? '#10b981' : '#ef4444',
                                    boxShadow: `0 0 15px ${status.connected ? '#10b981' : '#ef4444'}`
                                }} />
                                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: status.connected ? '#10b981' : '#ef4444' }}>
                                    {status.connected ? 'متصل وحصل على الموثوقية' : 'بانتظار مسح كود الربط...'}
                                </span>
                             </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {[
                                { text: 'إرسال العقود والفواتير الموثقة آلياً.', icon: <CheckCircle2 size={18} /> },
                                { text: 'تنبيهات المهندسين والفرق الميدانية بالمهام.', icon: <CheckCircle2 size={18} /> },
                                { text: 'تفعيل تسجيل الدخول الذكي بأكواد OTP.', icon: <CheckCircle2 size={18} /> }
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#a1a1aa', fontWeight: '700', fontSize: '1rem' }}>
                                    <div style={{ color: '#6366f1' }}>{item.icon}</div>
                                    {item.text}
                                </div>
                            ))}
                        </div>
                        <motion.button 
                            {...buttonClick} 
                            onClick={() => setQrUrl(`${API_URL}/whatsapp/qr?t=${Date.now()}`)} 
                            style={{ 
                                marginTop: '35px', width: '100%', padding: '15px', borderRadius: '18px', 
                                background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.06)', 
                                fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' 
                            }}
                        >
                            <RefreshCw size={20} /> عرض كود تحديث الربط
                        </motion.button>
                    </div>
                </div>

                <div style={{ padding: '20px', borderRadius: '35px', background: '#fff', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '10px solid #18181b', position: 'relative' }}>
                     {!status.connected ? (
                         <div style={{ borderRadius: '20px', overflow: 'hidden' }}>
                            <img src={qrUrl} alt="WhatsApp QR" style={{ width: '100%', display: 'block' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(255,255,255,0), rgba(255,255,255,0.1))', pointerEvents: 'none' }} />
                         </div>
                     ) : (
                         <div style={{ height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#09090b', gap: '20px' }}>
                             <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}>
                                <ShieldCheck size={100} color="#10b981" />
                             </motion.div>
                             <div style={{ fontSize: '1.8rem', fontWeight: '900', textAlign: 'center' }}>المنصة متصلة <br/><span style={{ fontSize: '1.2rem', opacity: 0.6 }}>جاهز لمعالجة الطلبات</span></div>
                         </div>
                     )}
                </div>
            </div>
        </motion.div>
    );
};

const SettingsPage = () => {
    const [tab, setTab] = useState('company');

    // System Health Status Indicators (Simulated or fetched)
    const systemStatus = [
        { label: 'اتصال السيرفر', value: 'مثالي', color: '#10b981', icon: <Cpu size={14} /> },
        { label: 'تشفير البيانات', value: 'AES-256', color: '#6366f1', icon: <ShieldCheck size={14} /> },
        { label: 'النسخ السحابي', value: 'مؤمن', color: '#06b6d4', icon: <Database size={14} /> },
    ];

    return (
        <div style={{ direction: 'rtl', padding: '10px' }} className="fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
                <div>
                    <h2 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '3.2rem', fontWeight: '900', letterSpacing: '-1.5px' }} className="gradient-text">مركز القيادة والإعدادات</h2>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Zap size={18} color="#f59e0b" fill="#f59e0b" /> تحكم كامل في هوية النظام، الأمان، وتكامل الذكاء الاصطناعي.
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                    {systemStatus.map((s, idx) => (
                        <div key={idx} className="glass-card" style={{ padding: '10px 20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(15, 23, 42, 0.3)' }}>
                            <div style={{ color: s.color }}>{s.icon}</div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#71717a', fontWeight: '800' }}>{s.label}</div>
                                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '900' }}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '40px', alignItems: 'start' }}>
                <div className="glass-card" style={{ padding: '25px', borderRadius: '40px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15, 23, 42, 0.4)' }}>
                    <div style={{ padding: '0 15px 15px 15px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#52525b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>القوائم الإدارية</div>
                    </div>
                    <TabButton active={tab === 'company'} onClick={() => setTab('company')} icon={Building2} color="#6366f1">هوية المنشأة والبراند</TabButton>
                    <TabButton active={tab === 'users'} onClick={() => setTab('users')} icon={Users} color="#8b5cf6">فريق العمل والصلاحيات</TabButton>
                    <TabButton active={tab === 'portal'} onClick={() => setTab('portal')} icon={LayoutGrid} color="#06b6d4">بوابة العملاء (Portal)</TabButton>
                    <TabButton active={tab === 'audit'} onClick={() => setTab('audit')} icon={Activity} color="#f43f5e">سجل العمليات (Audit)</TabButton>
                    <TabButton active={tab === 'whatsapp'} onClick={() => setTab('whatsapp')} icon={MessageSquare} color="#10b981">تكامل WhatsApp</TabButton>
                    <TabButton active={tab === 'security'} onClick={() => setTab('security')} icon={Shield} color="#f59e0b">الأمان والخصوصية</TabButton>
                </div>

                <div style={{ minHeight: '750px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, cubicBezier: [0.4, 0, 0.2, 1] }}
                        >
                            {tab === 'company' && <CompanyTab />}
                            {tab === 'users' && <UsersTab />}
                            {tab === 'portal' && <ClientPortalTab />}
                            {tab === 'whatsapp' && <WhatsAppTab />}
                            {tab === 'audit' && (
                                <div className="glass-card" style={{ padding: '45px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15, 23, 42, 0.4)' }}>
                                    <div style={{ marginBottom: '35px' }}>
                                        <h3 className="gradient-text" style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>الرقابة والعمليات</h3>
                                        <p style={{ color: '#a1a1aa', fontWeight: '700', marginTop: '8px' }}>تتبع جميع التغييرات والحركات المالية والتقنية في النظام لضمان الشفافية الكاملة.</p>
                                    </div>
                                    <AuditLogs />
                                </div>
                            )}
                            {tab === 'security' && (
                                <div className="glass-card" style={{ padding: '50px', borderRadius: '45px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15, 23, 42, 0.4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px' }}>
                                        <div>
                                            <h3 className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: '900', margin: 0 }}>بروتوكولات الأمان الرقمي</h3>
                                            <p style={{ color: '#a1a1aa', fontWeight: '700', marginTop: '10px' }}>إدارة معايير التشفير، النسخ الاحتياطي، وحماية البيانات السيادية للمنشأة.</p>
                                        </div>
                                        <div style={{ padding: '15px 25px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b98133', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <ShieldCheck color="#10b981" size={24} />
                                            <span style={{ color: '#10b981', fontWeight: '900' }}>مستوى الأمان: مرتفع جداً</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                                        {[
                                            { label: 'تشفير قاعدة البيانات (AES-256)', desc: 'يتم تشفير كافة البيانات الحساسة قبل تخزينها سحابياً.', status: 'نشط', icon: <Lock color="#10b981" />, color: '#10b981' },
                                            { label: 'حماية تسجيل الدخول المتعدد', desc: 'منع الدخول من أجهزة غير موثوقة دون تصريح إداري.', status: 'نشط', icon: <Smartphone color="#6366f1" />, color: '#6366f1' },
                                            { label: 'الأرشفة السحابية التلقائية', desc: 'يتم أخذ نسخة احتياطية من كافة المستندات والملفات يومياً.', status: 'مؤمن', icon: <HardDrive color="#06b6d4" />, color: '#06b6d4' },
                                            { label: 'مراقبة التهديدات اللحظية', desc: 'نظام حماية ذكي يكتشف محاولات الولوج غير المصرح بها.', status: 'يراقب', icon: <Activity color="#f43f5e" />, color: '#f43f5e' }
                                        ].map((item, i) => (
                                            <motion.div 
                                                key={i}
                                                whileHover={{ y: -5, background: 'rgba(255,255,255,0.03)' }}
                                                style={{ 
                                                    padding: '30px', borderRadius: '28px', background: 'rgba(255,255,255,0.01)', 
                                                    border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '15px' 
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {item.icon}
                                                    </div>
                                                    <span style={{ color: item.color, fontSize: '0.8rem', fontWeight: '900', background: `${item.color}10`, padding: '4px 15px', borderRadius: '10px', border: `1px solid ${item.color}22` }}>{item.status}</span>
                                                </div>
                                                <h4 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '900' }}>{item.label}</h4>
                                                <p style={{ margin: 0, color: '#71717a', fontSize: '0.9rem', lineHeight: '1.6', fontWeight: '600' }}>{item.desc}</p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '50px', padding: '30px', borderRadius: '30px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <AlertOctagon color="#f59e0b" size={35} />
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: '900', fontSize: '1.1rem' }}>تنبيه بخصوص صلاحيات الإدارة العليا</div>
                                            <div style={{ color: '#a1a1aa', fontWeight: '600', fontSize: '0.9rem', marginTop: '5px' }}>تغيير إعدادات الأمان أو الصلاحيات الجوهرية يتطلب توثيقاً ثنائياً ويتم تسجيله في سجل الرقابة بصفة "حساس جداً".</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .premium-input-select {
                    padding: 14px 20px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                    font-family: 'Cairo';
                    outline: none;
                    background: rgba(15, 23, 42, 0.4);
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .premium-input-select:hover {
                    border-color: #6366f1;
                }
                .premium-input-select option {
                    background: #0f172a;
                    color: white;
                }
            `}} />
        </div>
    );
};

export default SettingsPage;
