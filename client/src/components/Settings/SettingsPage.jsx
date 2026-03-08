import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_URL from '@/config';
import { Settings, User, Building2, Save, Plus, Trash2, Eye, EyeOff, Shield, Bell, Database, RefreshCw, Clock, AlertOctagon, MessageSquare, DollarSign, Briefcase, Users, Activity, X, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import AuditLogs from '../Admin/AuditLogs';
import { useMemo, useState } from 'react';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const currentUser = () => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
};

const TabBtn = ({ active, onClick, children, icon }) => (
    <button onClick={onClick} style={{
        padding: '12px 20px', border: 'none', cursor: 'pointer', background: active ? '#2563eb' : 'transparent',
        color: active ? 'white' : '#64748b', fontFamily: 'Cairo', fontWeight: '600', fontSize: '0.9rem',
        borderRadius: '10px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
    }}>
        {icon}
        {children}
    </button>
);

const InputField = ({ label, value, onChange, type = 'text', placeholder, readOnly }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            style={{
                padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0',
                fontFamily: 'Cairo', fontSize: '0.9rem', outline: 'none', direction: 'rtl',
                background: readOnly ? '#f8fafc' : 'white', color: readOnly ? '#94a3b8' : '#1e293b',
                transition: 'border-color 0.2s'
            }}
            onFocus={e => !readOnly && (e.target.style.borderColor = '#2563eb')}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
    </div>
);

// ======= TAB: Company Info =======
const CompanyTab = () => {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({});
    const [saved, setSaved] = useState(false);

    const { data: qData, isLoading, error } = useQuery({
        queryKey: ['companyInfo'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/settings/companyInfo`, { headers: H() });
            return res.data;
        }
    });

    useMemo(() => {
        if (qData) setForm(qData);
    }, [qData]);

    const saveMutation = useMutation({
        mutationFn: async (data) => await axios.post(`${API_URL}/settings/companyInfo`, { value: data }, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companyInfo'] });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        },
        onError: () => alert('فشل في حفظ البيانات')
    });

    const update = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

    if (isLoading) return <div style={{ color: '#64748b', fontFamily: 'Cairo' }}>جاري تحميل البيانات...</div>;
    if (error) return <div style={{ color: '#ef4444', fontFamily: 'Cairo' }}>خطأ في تحميل البيانات</div>;

    return (
        <div>
            <h3 style={{ margin: '0 0 24px 0', color: '#1e293b', fontWeight: '700' }}>معلومات المنشأة</h3>
            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '700px' }}>
                <InputField label="اسم المنشأة" value={form.name || ''} onChange={update('name')} placeholder="مؤسسة الجنوب الجديد" />
                <InputField label="الرقم الضريبي (VAT)" value={form.vatNumber || ''} onChange={update('vatNumber')} placeholder="3XXXXXXXXXXX" />
                <InputField label="رقم الجوال" value={form.phone || ''} onChange={update('phone')} placeholder="+966 5X XXX XXXX" />
                <InputField label="البريد الإلكتروني" value={form.email || ''} onChange={update('email')} placeholder="info@company.com" type="email" />
                <div style={{ gridColumn: '1 / -1' }}>
                    <InputField label="العنوان" value={form.address || ''} onChange={update('address')} placeholder="أحد المسارحة، جازان" />
                </div>
                <InputField label="المدينة" value={form.city || ''} onChange={update('city')} placeholder="جازان" />
                <InputField label="المنطقة" value={form.region || ''} onChange={update('region')} placeholder="المنطقة الجنوبية" />
                <InputField label="الموقع الإلكتروني" value={form.website || ''} onChange={update('website')} placeholder="www.company.com" />
                <InputField label="رقم السجل التجاري" value={form.crNumber || ''} onChange={update('crNumber')} placeholder="4XXXXXXXXX" />
            </div>
            <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} style={{
                marginTop: '24px', padding: '12px 32px', background: saved ? '#10b981' : '#2563eb',
                color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
                fontFamily: 'Cairo', fontWeight: '700', fontSize: '0.95rem',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.3s',
                opacity: saveMutation.isPending ? 0.7 : 1
            }}>
                <Save size={16} />
                {saveMutation.isPending ? '...جاري الحفظ' : (saved ? '✅ تم الحفظ في قاعدة البيانات!' : 'حفظ البيانات')}
            </button>
        </div>
    );
};

const PermissionItem = ({ label, active, onChange }) => (
    <div
        onClick={() => onChange(!active)}
        style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
            background: active ? '#eff6ff' : '#f8fafc', borderRadius: '10px',
            border: `1px solid ${active ? '#3b82f6' : '#e2e8f0'}`, cursor: 'pointer',
            transition: 'all 0.2s', flex: '1 1 200px'
        }}
    >
        <div style={{
            width: '18px', height: '18px', borderRadius: '4px',
            border: `2px solid ${active ? '#3b82f6' : '#cbd5e1'}`,
            background: active ? '#3b82f6' : 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
        }}>
            {active && <Save size={12} />}
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: active ? '600' : '400', color: active ? '#1e40af' : '#64748b' }}>{label}</span>
    </div>
);

// ======= TAB: Users Management (Advanced) =======
const UsersTab = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showPass, setShowPass] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'USER',
        phone: '', status: 'ACTIVE', jobTitle: '', department: '',
        permissions: {}
    });
    const [msg, setMsg] = useState('');
    const me = currentUser();

    const modules = [
        { id: 'dashboard', label: 'لوحة القيادة' },
        { id: 'invoices', label: 'المبيعات والفواتير' },
        { id: 'quotes', label: 'عروض الأسعار' },
        { id: 'inventory', label: 'المخزون' },
        { id: 'clients', label: 'العملاء' },
        { id: 'projects', label: 'المشاريع والمقاولات' },
        { id: 'contracts', label: 'عقود المقاولات' },
        { id: 'accounting', label: 'المحاسبة والمالية' },
        { id: 'hr', label: 'الموارد البشرية' },
        { id: 'real_estate', label: 'العقارات' },
        { id: 'archive', label: 'الأرشيف' },
        { id: 'reports', label: 'التقارير' },
        { id: 'field_ops', label: 'الإشراف الميداني' },
        { id: 'crm', label: 'المبيعات والعملاء (CRM)' },
        { id: 'zatca', label: 'مراقبة زاتكا' },
        { id: 'settings', label: 'إعدادات النظام' },
    ];

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => (await axios.get(`${API_URL}/users`, { headers: H() })).data
    });

    const addMutation = useMutation({
        mutationFn: async (data) => await axios.post(`${API_URL}/users`, data, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setMsg('✅ تم إضافة المستخدم بنجاح');
            resetForm();
            setShowForm(false);
        },
        onError: (err) => setMsg('❌ ' + (err.response?.data?.error || 'فشل في الإضافة'))
    });

    const updateMutation = useMutation({
        mutationFn: async (data) => await axios.put(`${API_URL}/users/${data.id}`, data, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setMsg('✅ تم تحديث بيانات المستخدم');
            setEditingUser(null);
        },
        onError: (err) => setMsg('❌ ' + (err.response?.data?.error || 'فشل في التحديث'))
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await axios.delete(`${API_URL}/users/${id}`, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setMsg('✅ تم حذف المستخدم');
        },
        onError: () => setMsg('❌ فشل في الحذف')
    });

    const resetForm = () => setForm({
        name: '', email: '', password: '', role: 'USER',
        phone: '', status: 'ACTIVE', jobTitle: '', department: '',
        permissions: {}
    });

    const handleSave = () => {
        if (!form.name || !form.email || (!editingUser && !form.password)) {
            setMsg('يرجى تعبئة الحقول الأساسية');
            return;
        }
        if (editingUser) {
            updateMutation.mutate({ ...form, id: editingUser.id });
        } else {
            addMutation.mutate(form);
        }
        setTimeout(() => setMsg(''), 3000);
    };

    const startEdit = (user) => {
        setEditingUser(user);
        setForm({
            name: user.name || '',
            email: user.email || '',
            password: '', // Hidden for security, only if changed
            role: user.role || 'USER',
            phone: user.phone || '',
            status: user.status || 'ACTIVE',
            jobTitle: user.jobTitle || '',
            department: user.department || '',
            permissions: user.permissions || {}
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (id === me.id) { setMsg('❌ لا يمكن حذف حسابك الخاص'); setTimeout(() => setMsg(''), 2000); return; }
        if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟ سيتم فقدان صلاحياته نهائياً.')) return;
        deleteMutation.mutate(id);
        setTimeout(() => setMsg(''), 2000);
    };

    const togglePermission = (modId, val) => {
        setForm(prev => ({
            ...prev,
            permissions: { ...prev.permissions, [modId]: val }
        }));
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const roleMap = {
        ADMIN: { label: 'مدير النظام', color: '#d97706', bg: '#fef3c7', icon: <Shield size={14} /> },
        ACCOUNTANT: { label: 'محاسب', color: '#059669', bg: '#ecfdf5', icon: <DollarSign size={14} /> },
        MANAGER: { label: 'مدير مشاريع', color: '#2563eb', bg: '#eff6ff', icon: <Briefcase size={14} /> },
        USER: { label: 'مستخدم', color: '#64748b', bg: '#f1f5f9', icon: <User size={14} /> }
    };

    return (
        <div>
            <div className="mobile-grid-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '15px' }}>
                <div>
                    <h3 style={{ margin: 0, color: '#1e293b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={22} className="text-blue-600" /> إدارة المستخدمين والصلاحيات
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>التحكم الكامل في حسابات الموظفين ومستويات الوصول</p>
                </div>
                {!showForm && !editingUser && (
                    <button onClick={() => setShowForm(true)} style={{
                        padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none',
                        borderRadius: '12px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '700',
                        display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                    }}>
                        <Plus size={18} /> إضافة عضو جديد
                    </button>
                )}
            </div>

            {msg && (
                <div style={{ padding: '14px 20px', borderRadius: '12px', marginBottom: '20px', background: msg.includes('✅') ? '#ecfdf5' : '#fef2f2', color: msg.includes('✅') ? '#065f46' : '#991b1b', fontWeight: '600', border: '1px solid currentColor', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={18} /> {msg}
                </div>
            )}

            {(showForm || editingUser) && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '28px', marginBottom: '30px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem', fontWeight: '700' }}>{editingUser ? 'تعديل بيانات العضو' : 'إضافة عضو جديد للنظام'}</h4>
                        <button onClick={() => { setShowForm(false); setEditingUser(null); resetForm(); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                    </div>

                    <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <InputField label="الاسم الكامل" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="مثال: محمد علي" />
                        <InputField label="البريد الإلكتروني (اسم المستخدم)" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="user@company.com" type="email" />
                        <InputField label="رقم الجوال" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="9665XXXXXXXX" />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>المسمى الوظيفي</label>
                            <input value={form.jobTitle} onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo' }} placeholder="محاسب أول، مهندس موقع..." />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>الصلاحية الرئيسية</label>
                            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', cursor: 'pointer' }}>
                                <option value="USER">مستخدم (صلاحيات محدودة)</option>
                                <option value="ACCOUNTANT">محاسب (مالية وتقارير)</option>
                                <option value="MANAGER">مدير تشغيل (مشاريع وعقود)</option>
                                <option value="ADMIN">مدير نظام (تحكم كامل)</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>حالة الحساب</label>
                            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', cursor: 'pointer', background: form.status === 'BLOCKED' ? '#fff1f2' : 'white' }}>
                                <option value="ACTIVE">نشط (يسمح بالدخول)</option>
                                <option value="BLOCKED">معطل (يمنع من الدخول)</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>{editingUser ? 'تغيير كلمة المرور (اختياري)' : 'كلمة المرور'}</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    placeholder={editingUser ? "اتركه فارغاً لعدم التغيير" : "كلمة مرور قوية"}
                                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' }}
                                />
                                <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                        <h5 style={{ margin: '0 0 16px 0', color: '#1e293b', fontWeight: '700', fontSize: '0.95rem' }}>صلاحيات الوصول المخصصة (Modules Permissions)</h5>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>يمكنك تفعيل أو تعطيل الوصول لأقسام معينة بغض النظر عن الصلاحية الرئيسية.</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {modules.map(mod => (
                                <PermissionItem
                                    key={mod.id}
                                    label={mod.label}
                                    active={form.permissions[mod.id] === true}
                                    onChange={(v) => togglePermission(mod.id, v)}
                                />
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                        <button onClick={handleSave} disabled={addMutation.isPending || updateMutation.isPending} style={{ padding: '12px 32px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '700', fontSize: '1rem' }}>
                            {(addMutation.isPending || updateMutation.isPending) ? 'جاري الحفظ...' : (editingUser ? 'تحديث البيانات' : 'إنشاء الحساب الآن')}
                        </button>
                        <button onClick={() => { setShowForm(false); setEditingUser(null); resetForm(); }} style={{ padding: '10px 24px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Cairo' }}>
                            إلغاء
                        </button>
                    </div>
                </motion.div>
            )}

            {!showForm && !editingUser && (
                <>
                    <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '400px' }}>
                        <Search size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="ابحث عن اسم، بريد، أو رقم هاتف..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '12px', border: '1px solid #f1f5f9', background: 'white', outline: 'none', fontFamily: 'Cairo', fontSize: '0.9rem' }}
                        />
                    </div>

                    <div className="table-responsive" style={{ background: 'white', borderRadius: '18px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Cairo' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                    {['المستخدم', 'بيانات الاتصال', 'المسمى الوظيفي', 'الصلاحية', 'الحالة', 'آخر دخول', 'إجراء'].map(h => (
                                        <th key={h} style={{ padding: '16px', textAlign: 'right', fontWeight: '700', fontSize: '0.85rem', color: '#64748b' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '50px' }}><Clock className="animate-spin" style={{ margin: 'auto' }} /></td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>لا توجد نتائج مطابقة لبحثك</td></tr>
                                ) : filteredUsers.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{
                                                    width: '56px', height: '56px', borderRadius: '14px',
                                                    background: u.role === 'ADMIN' ? '#eff6ff' : '#f1f5f9',
                                                    overflow: 'hidden', border: '1px solid #e2e8f0',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {u.email === 'admin@south.com' || u.name === 'Naif' ? (
                                                        <img src="/naif.png" alt="Naif" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <span style={{ fontWeight: 'bold', fontSize: '1.4rem', color: u.role === 'ADMIN' ? '#2563eb' : '#64748b' }}>
                                                            {u.name?.charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {u.name}
                                                        {u.id === me.id && <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: '20px', fontWeight: '900' }}>أنت</span>}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '600' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', color: '#64748b', fontSize: '0.85rem' }}>{u.phone || '—'}</td>
                                        <td style={{ padding: '16px', color: '#1e293b', fontSize: '0.85rem', fontWeight: '500' }}>{u.jobTitle || 'عضو نظام'}</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px',
                                                fontSize: '0.8rem', fontWeight: '700', width: 'fit-content',
                                                background: roleMap[u.role]?.bg || '#f1f5f9', color: roleMap[u.role]?.color || '#64748b'
                                            }}>
                                                {roleMap[u.role]?.icon}
                                                {roleMap[u.role]?.label || u.role}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold',
                                                background: u.status === 'BLOCKED' ? '#fef2f2' : '#f0fdf4',
                                                color: u.status === 'BLOCKED' ? '#ef4444' : '#22c55e',
                                                border: `1px solid ${u.status === 'BLOCKED' ? '#fee2e2' : '#dcfce7'}`
                                            }}>
                                                {u.status === 'BLOCKED' ? '🚫 معطل' : '✅ نشط'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' }) : 'لم يدخل بعد'}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => startEdit(u)}
                                                    style={{ padding: '8px', background: '#f8fafc', color: '#2563eb', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}
                                                    title="تعديل الصلاحيات"
                                                >
                                                    <Shield size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    disabled={deleteMutation.isPending}
                                                    style={{ padding: '8px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '8px', cursor: 'pointer' }}
                                                    title="حذف الحساب"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

// ======= TAB: System Preferences =======
const SystemTab = () => {
    const queryClient = useQueryClient();
    const [prefs, setPrefs] = useState({});
    const [saved, setSaved] = useState(false);

    const { data: qData, isLoading } = useQuery({
        queryKey: ['systemPrefs'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/settings/systemPrefs`, { headers: H() });
            return res.data;
        }
    });

    useMemo(() => {
        if (qData) setPrefs(qData);
    }, [qData]);

    const saveMutation = useMutation({
        mutationFn: async (data) => await axios.post(`${API_URL}/settings/systemPrefs`, { value: data }, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['systemPrefs'] });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        },
        onError: () => alert('فشل في حفظ التفضيلات')
    });

    const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));
    const update = (key) => (e) => setPrefs(p => ({ ...p, [key]: e.target.value }));

    if (isLoading) return <div style={{ color: '#64748b', fontFamily: 'Cairo' }}>جاري التحميل...</div>;

    return (
        <div>
            <h3 style={{ margin: '0 0 24px 0', color: '#1e293b', fontWeight: '700' }}>تفضيلات النظام</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>

                {/* Currency */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '0.95rem' }}>💰 العملة والضريبة</h4>
                    <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>العملة</label>
                            <select value={prefs.currency || 'SAR'} onChange={update('currency')} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo' }}>
                                <option value="SAR">ريال سعودي (ر.س)</option>
                                <option value="USD">دولار أمريكي ($)</option>
                                <option value="AED">درهم إماراتي (د.إ)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>نسبة ضريبة القيمة المضافة</label>
                            <select value={prefs.vatRate || '15'} onChange={update('vatRate')} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo' }}>
                                <option value="15">15%</option>
                                <option value="5">5%</option>
                                <option value="0">معفى</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '0.95rem' }}>🔔 التنبيهات</h4>
                    {[
                        ['lowStock', 'تنبيه عند نقص المخزون'],
                        ['expiredQuotes', 'تنبيه انتهاء صلاحية عروض الأسعار'],
                        ['draftInvoices', 'تنبيه الفواتير المعلقة'],
                    ].map(([key, label]) => (
                        <div key={key} onClick={() => toggle(key)} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 0', borderBottom: '1px solid #f8fafc', cursor: 'pointer'
                        }}>
                            <span style={{ fontWeight: '500', color: '#374151', fontSize: '0.9rem' }}>{label}</span>
                            <div style={{
                                width: '44px', height: '24px', borderRadius: '12px', position: 'relative',
                                background: prefs[key] ? '#2563eb' : '#e2e8f0', transition: 'background 0.2s'
                            }}>
                                <div style={{
                                    width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                                    position: 'absolute', top: '3px', left: prefs[key] ? '23px' : '3px', transition: 'left 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* System Info */}
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '0.95rem' }}>ℹ️ معلومات النظام</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                        {[
                            ['اسم النظام', 'مؤسسة الجنوب الجديد - ERP'],
                            ['الإصدار', 'v2.0.0'],
                            ['قاعدة البيانات', 'PostgreSQL (Cloud)'],
                            ['بيئة التشغيل', 'Production'],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <span style={{ color: '#94a3b8' }}>{label}: </span>
                                <span style={{ fontWeight: '600', color: '#374151' }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={() => saveMutation.mutate(prefs)} disabled={saveMutation.isPending} style={{
                    padding: '12px 32px', background: saved ? '#10b981' : '#2563eb',
                    color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
                    fontFamily: 'Cairo', fontWeight: '700', fontSize: '0.95rem',
                    display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content', transition: 'background 0.3s'
                }}>
                    <Save size={16} />
                    {saveMutation.isPending ? '...جاري الحفظ' : (saved ? '✅ تم الحفظ في السحابة!' : 'حفظ الإعدادات')}
                </button>
            </div>
        </div>
    );
};

// ======= TAB: WhatsApp Integration =======
const WhatsAppTab = () => {
    const { data } = useQuery({
        queryKey: ['whatsappStatus'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/whatsapp/status`, { headers: H() });
            return res.data;
        },
        refetchInterval: 5000
    });

    return (
        <div style={{ maxWidth: '600px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontWeight: '700' }}>ارتباط واتساب (مجاني)</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
                اربط جوالك الخاص بالنظام لإرسال رسائل استعادة كلمة المرور والتنبيهات مجاناً دون الحاجة لمزود خدمة خارجي.
            </p>

            <div style={{
                background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center'
            }}>
                <div style={{
                    padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '700',
                    background: (data?.status === 'READY' || data?.status === 'AUTHENTICATED') ? '#ecfdf5' : '#fef2f2',
                    color: (data?.status === 'READY' || data?.status === 'AUTHENTICATED') ? '#10b981' : '#ef4444',
                    border: '1px solid currentColor'
                }}>
                    حالة الاتصال: {data?.status === 'READY' ? 'متصل وجاهز ✅' : (data?.status || 'جاري تهيئة العميل...')}
                </div>

                {data?.status === 'DISCONNECTED' && data?.qrAvailable && (
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                        <p style={{ fontWeight: '700', marginBottom: '15px', fontSize: '0.95rem', color: '#1e293b' }}>امسح الكود التالي عبر واتساب جوالك:</p>
                        <img
                            src={`${API_URL}/whatsapp/qr?t=${data?.qrLastUpdate || Date.now()}`}
                            alt="WhatsApp QR"
                            style={{ width: '220px', height: '220px', border: '4px solid #f8fafc', borderRadius: '8px' }}
                        />
                        <div style={{ marginTop: '15px', fontSize: '0.85rem', color: '#64748b', textAlign: 'right' }}>
                            1. افتح تطبيق واتساب على جوالك.<br />
                            2. اضغط على القائمة (أو الإعدادات) &gt; الأجهزة المرتبطة.<br />
                            3. اضغط على "ربط جهاز" ووجه الكاميرا لهذا الكود.
                        </div>
                    </div>
                )}

                {data?.status === 'READY' && (
                    <div style={{ color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px' }}>
                        <MessageSquare size={60} />
                        <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>النظام مربوط حالياً برقمك بنجاح!</p>
                        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>يمكنك الآن اختبار استعادة كلمة المرور عبر الجوال.</p>
                    </div>
                )}

                {data?.status === 'CLOUD_MODE' && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '20px', borderRadius: '12px', textAlign: 'right', direction: 'rtl' }}>
                        <p style={{ fontWeight: '700', color: '#92400e', marginBottom: '10px', fontSize: '1rem' }}>☁️ وضع السحابة - الواتساب غير متاح</p>
                        <p style={{ color: '#78350f', fontSize: '0.9rem', lineHeight: '1.8' }}>
                            ميزة ربط الواتساب تعمل فقط عند تشغيل النظام <strong>محلياً على جهازك</strong>.<br />
                            السبب: متصفح Chrome الذي يحتاجه الواتساب غير متاح على خوادم الاستضافة المجانية.<br /><br />
                            <strong>للاستخدام:</strong> شغّل السيرفر على جهازك (npm run server) وسيظهر باركود الربط تلقائياً.
                        </p>
                    </div>
                )}

                {!data?.qrAvailable && data?.status === 'DISCONNECTED' && (
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>جاري توليد كود الـ QR... يرجى الانتظار ثوانٍ.</p>
                )}
            </div>
        </div>
    );
};

// ======= Main Settings Page =======
export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('company');

    const tabs = [
        { key: 'company', label: 'معلومات المنشأة', icon: <Building2 /> },
        { key: 'whatsapp', label: 'التواصل الذكي', icon: <MessageSquare /> },
        { key: 'users', label: 'المستخدمون', icon: <User /> },
        { key: 'logs', label: 'سجل العمليات', icon: <Shield /> },
        { key: 'system', label: 'إعدادات النظام', icon: <Settings /> },
    ];

    return (
        <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 'bold', color: '#0f172a' }}>
                    <Settings size={24} style={{ marginLeft: '10px', verticalAlign: 'middle', color: '#2563eb' }} />
                    الإعدادات
                </h1>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>إدارة إعدادات النظام والمنشأة</p>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', background: '#f8fafc', padding: '6px', borderRadius: '14px', width: 'fit-content', flexWrap: 'wrap' }}>
                {tabs.map(t => (
                    <TabBtn key={t.key} active={activeTab === t.key} onClick={() => setActiveTab(t.key)} icon={t.icon}>
                        {t.label}
                    </TabBtn>
                ))}
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: window.innerWidth < 600 ? '20px' : '28px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minHeight: '400px' }}>
                {activeTab === 'company' && <CompanyTab />}
                {activeTab === 'whatsapp' && <WhatsAppTab />}
                {activeTab === 'users' && <UsersTab />}
                {activeTab === 'logs' && <AuditLogs />}
                {activeTab === 'system' && <SystemTab />}
            </div>
        </div>
    );
}
