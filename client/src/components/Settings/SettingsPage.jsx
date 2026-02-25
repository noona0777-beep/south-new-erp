import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_URL from '../../config';
import { Settings, User, Building2, Save, Plus, Trash2, Eye, EyeOff, Shield, Bell, Database, RefreshCw, Clock, AlertOctagon } from 'lucide-react';
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

    const { isLoading, error } = useQuery({
        queryKey: ['companyInfo'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/settings/companyInfo`, { headers: H() });
            setForm(res.data || {});
            return res.data;
        }
    });

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

// ======= TAB: Users Management =======
const UsersTab = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });
    const [msg, setMsg] = useState('');
    const me = currentUser();

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => (await axios.get(`${API_URL}/users`, { headers: H() })).data
    });

    const addMutation = useMutation({
        mutationFn: async (data) => await axios.post(`${API_URL}/users`, data, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setMsg('✅ تم إضافة المستخدم بنجاح');
            setForm({ name: '', email: '', password: '', role: 'USER' });
            setShowForm(false);
        },
        onError: (err) => setMsg('❌ ' + (err.response?.data?.error || 'فشل في الإضافة'))
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await axios.delete(`${API_URL}/users/${id}`, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setMsg('✅ تم حذف المستخدم');
        },
        onError: () => setMsg('❌ فشل في الحذف')
    });

    const handleAdd = () => {
        if (!form.name || !form.email || !form.password) {
            setMsg('يرجى تعبئة جميع الحقول');
            return;
        }
        addMutation.mutate(form);
        setTimeout(() => setMsg(''), 3000);
    };

    const handleDelete = (id) => {
        if (id === me.id) { setMsg('❌ لا يمكن حذف المستخدم الحالي'); setTimeout(() => setMsg(''), 2000); return; }
        if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
        deleteMutation.mutate(id);
        setTimeout(() => setMsg(''), 2000);
    };

    const roleColors = { ADMIN: { bg: '#fef3c7', color: '#d97706' }, USER: { bg: '#eff6ff', color: '#2563eb' } };

    return (
        <div>
            <div className="mobile-grid-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontWeight: '700' }}>إدارة المستخدمين</h3>
                <button onClick={() => setShowForm(!showForm)} style={{
                    padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none',
                    borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content'
                }}>
                    <Plus size={16} /> إضافة مستخدم
                </button>
            </div>

            {msg && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', background: msg.includes('✅') ? '#ecfdf5' : '#fef2f2', color: msg.includes('✅') ? '#065f46' : '#991b1b', fontWeight: '600' }}>
                    {msg}
                </div>
            )}

            {showForm && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>مستخدم جديد</h4>
                    <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <InputField label="الاسم الكامل" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="اسم المستخدم" />
                        <InputField label="البريد الإلكتروني" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="user@company.com" type="email" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>كلمة المرور</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    placeholder="كلمة المرور"
                                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' }}
                                />
                                <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>الصلاحية</label>
                            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{
                                padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', fontSize: '0.9rem', cursor: 'pointer'
                            }}>
                                <option value="USER">مستخدم عادي</option>
                                <option value="ADMIN">مدير النظام</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button onClick={handleAdd} disabled={addMutation.isPending} style={{ padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '700' }}>
                            {addMutation.isPending ? 'جاري الحفظ...' : 'حفظ المستخدم'}
                        </button>
                        <button onClick={() => setShowForm(false)} style={{ padding: '10px 24px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo' }}>
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <Clock size={32} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                    جاري التحميل...
                </div>
            ) : (
                <div className="table-responsive" style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Cairo', minWidth: '700px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                {['الاسم', 'البريد الإلكتروني', 'الصلاحية', 'تاريخ الإنشاء', 'إجراء'].map(h => (
                                    <th key={h} style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '700', fontSize: '0.85rem', color: '#64748b' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>لا يوجد مستخدمون</td></tr>
                            ) : users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#1e293b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {u.name?.charAt(0)}
                                            </div>
                                            {u.name}
                                            {u.id === me.id && <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '20px' }}>أنت</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.9rem' }}>{u.email}</td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: roleColors[u.role]?.bg || '#f1f5f9', color: roleColors[u.role]?.color || '#64748b' }}>
                                            {u.role === 'ADMIN' ? '🔑 مدير' : '👤 مستخدم'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        {new Date(u.createdAt).toLocaleDateString('ar-SA')}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <button onClick={() => handleDelete(u.id)} disabled={deleteMutation.isPending} style={{
                                            padding: '6px 12px', background: '#fef2f2', color: '#ef4444', border: 'none',
                                            borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Cairo', fontSize: '0.8rem'
                                        }}>
                                            <Trash2 size={14} /> {deleteMutation.isPending ? 'حذف...' : 'حذف'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ======= TAB: System Preferences =======
const SystemTab = () => {
    const queryClient = useQueryClient();
    const [prefs, setPrefs] = useState({});
    const [saved, setSaved] = useState(false);

    const { isLoading } = useQuery({
        queryKey: ['systemPrefs'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/settings/systemPrefs`, { headers: H() });
            setPrefs(res.data || {});
            return res.data;
        }
    });

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

// ======= Main Settings Page =======
export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('company');

    const tabs = [
        { key: 'company', label: 'معلومات المنشأة', icon: <Building2 /> },
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
                {activeTab === 'users' && <UsersTab />}
                {activeTab === 'logs' && <AuditLogs />}
                {activeTab === 'system' && <SystemTab />}
            </div>
        </div>
    );
}
