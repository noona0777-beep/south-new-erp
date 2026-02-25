import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, UserCircle, Briefcase, DollarSign, Phone, Mail, Calendar, TrendingUp, Edit, Trash2, Eye, X, Folder, Clock, AlertOctagon } from 'lucide-react';
import API_URL from '../../config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const HRPage = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    // Form State
    const [employeeData, setEmployeeData] = useState({
        name: '', jobTitle: '', department: '', phone: '',
        email: '', salary: 0, status: 'ACTIVE',
        joinDate: new Date().toISOString().split('T')[0]
    });

    // Queries
    const { data: employees = [], isLoading, error } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => (await axios.get(`${API_URL}/employees`)).data
    });

    // Mutations
    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (isEdit) {
                return await axios.put(`${API_URL}/employees/${selectedEmployee.id}`, data);
            } else {
                return await axios.post(`${API_URL}/employees`, data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            alert(isEdit ? 'تم تحديث بيانات الموظف بنجاح' : 'تم إضافة الموظف بنجاح');
            closeForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await axios.delete(`${API_URL}/employees/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });

    const archiveMutation = useMutation({
        mutationFn: async (employee) => {
            await axios.post(`${API_URL}/documents`, {
                title: `سجل بيانات الموظف: ${employee.name}`,
                category: 'OTHER',
                fileUrl: `INTERNAL:EMPLOYEE:${employee.id}`,
                employeeId: employee.id
            });
        },
        onSuccess: () => alert('✅ تم أرشفة بيانات الموظف في الوثائق')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation.mutate(employeeData);
    };

    const handleDelete = (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
            deleteMutation.mutate(id);
        }
    };

    const openForm = (emp = null) => {
        if (emp) {
            setSelectedEmployee(emp);
            setEmployeeData({
                name: emp.name, jobTitle: emp.jobTitle,
                department: emp.department || '', phone: emp.phone || '',
                email: emp.email || '', salary: emp.salary,
                status: emp.status,
                joinDate: emp.joinDate ? new Date(emp.joinDate).toISOString().split('T')[0] : ''
            });
            setIsEdit(true);
        } else {
            setEmployeeData({
                name: '', jobTitle: '', department: '', phone: '',
                email: '', salary: 0, status: 'ACTIVE',
                joinDate: new Date().toISOString().split('T')[0]
            });
            setIsEdit(false);
        }
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setIsEdit(false);
        setSelectedEmployee(null);
    };

    const openDetails = (emp) => {
        setSelectedEmployee(emp);
        setShowDetails(true);
    };

    return (
        <div className="fade-in" style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
            <div className="mobile-grid-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>الموارد البشرية</h2>
                    <p style={{ margin: 0, color: '#64748b' }}>إدارة الموظفين، الرواتب، والهيكل الإداري</p>
                </div>
                <button
                    onClick={() => openForm()}
                    style={{
                        background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px',
                        borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgb(37 99 235 / 0.3)',
                        fontFamily: 'Cairo', width: 'fit-content'
                    }}
                >
                    <Plus size={20} /> إضافة موظف جديد
                </button>
            </div>

            {/* Stats Overview */}
            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', color: '#3b82f6' }}><Users size={24} /></div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>إجمالي الموظفين</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{employees.length}</div>
                    </div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '12px', color: '#10b981' }}><DollarSign size={24} /></div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>إجمالي الرواتب</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{(employees || []).reduce((acc, emp) => acc + (emp.salary || 0), 0).toLocaleString()} ر.س</div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                    <Clock className="animate-spin" size={32} style={{ margin: '0 auto 16px', display: 'block' }} />
                    جاري تحميل بيانات الموظفين...
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444', background: 'white', borderRadius: '16px' }}>
                    <AlertOctagon size={32} style={{ margin: '0 auto 16px', display: 'block' }} />
                    خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.
                </div>
            ) : (
                <div className="table-responsive" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', border: '1px solid #f1f5f9' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b' }}>الموظف</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b' }}>المسمى الوظيفي</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b' }}>القسم</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b' }}>الراتب</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b' }}>الحالة</th>
                                <th style={{ padding: '16px 24px', textAlign: 'center', color: '#64748b' }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>لا يوجد موظفين مضافين حالياً</td>
                                </tr>
                            ) : (
                                employees.map(emp => (
                                    <tr key={emp.id} className="card-hover" style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}><UserCircle size={24} /></div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{emp.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{emp.employeeId || 'ID-000'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', color: '#334155' }}>{emp.jobTitle}</td>
                                        <td style={{ padding: '16px 24px', color: '#64748b' }}>{emp.department || '-'}</td>
                                        <td style={{ padding: '16px 24px', color: '#0f172a', fontWeight: 'bold' }}>{(emp.salary || 0).toLocaleString()} ر.س</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{
                                                background: emp.status === 'ACTIVE' ? '#ecfdf5' : '#fff7ed',
                                                color: emp.status === 'ACTIVE' ? '#10b981' : '#f97316',
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold'
                                            }}>
                                                {emp.status === 'ACTIVE' ? 'نشط' : 'إجازة'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                <button onClick={() => openDetails(emp)} style={{ color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="عرض التفاصيل"><Eye size={18} /></button>
                                                <button
                                                    onClick={() => archiveMutation.mutate(emp)}
                                                    disabled={archiveMutation.isPending}
                                                    style={{ color: '#f59e0b', background: '#fffbeb', border: '1px solid #fef3c7', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                                                    title="أرشفة البيانات"
                                                >
                                                    <Folder size={18} />
                                                </button>
                                                <button onClick={() => openForm(emp)} style={{ color: '#3b82f6', background: '#eff6ff', border: '1px solid #dbeafe', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="تعديل"><Edit size={18} /></button>
                                                <button
                                                    onClick={() => handleDelete(emp.id)}
                                                    disabled={deleteMutation.isPending}
                                                    style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                                                    title="حذف"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal: Employee Form (Add/Edit) */}
            {showForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '800px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', position: 'relative' }}>
                        <button onClick={closeForm} style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                        <h3 style={{ margin: '0 0 25px 0', fontSize: '1.5rem' }}>{isEdit ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}</h3>
                        <form onSubmit={handleSubmit} className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>اسم الموظف كاملاً</label>
                                <input type="text" required value={employeeData.name} onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>المسمى الوظيفي</label>
                                <input type="text" required value={employeeData.jobTitle} onChange={(e) => setEmployeeData({ ...employeeData, jobTitle: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>القسم</label>
                                <input type="text" value={employeeData.department} onChange={(e) => setEmployeeData({ ...employeeData, department: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>الراتب الأساسي</label>
                                <input type="number" required value={employeeData.salary} onChange={(e) => setEmployeeData({ ...employeeData, salary: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>تاريخ الانضمام</label>
                                <input type="date" value={employeeData.joinDate} onChange={(e) => setEmployeeData({ ...employeeData, joinDate: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>الهاتف</label>
                                <input type="text" value={employeeData.phone} onChange={(e) => setEmployeeData({ ...employeeData, phone: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>الحالة</label>
                                <select value={employeeData.status} onChange={(e) => setEmployeeData({ ...employeeData, status: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white' }}>
                                    <option value="ACTIVE">نشط</option>
                                    <option value="ON_LEAVE">إجازة</option>
                                    <option value="TERMINATED">مستقيل / منتهي</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>البريد الإلكتروني</label>
                                <input type="email" value={employeeData.email} onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button type="button" onClick={closeForm} style={{ padding: '12px 30px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>إلغاء</button>
                                <button type="submit" disabled={saveMutation.isPending} style={{ padding: '12px 40px', borderRadius: '10px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                    {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ البيانات'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Employee Details */}
            {showDetails && selectedEmployee && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', position: 'relative' }}>
                        <button onClick={() => setShowDetails(false)} style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>

                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{ width: '80px', height: '80px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', margin: '0 auto 15px auto' }}>
                                <UserCircle size={50} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedEmployee.name}</h3>
                            <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{selectedEmployee.jobTitle} - {selectedEmployee.department}</p>
                        </div>

                        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px', background: '#f8fafc', borderRadius: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Briefcase size={18} color="#64748b" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>الرقم الوظيفي</div>
                                    <div style={{ fontWeight: 'bold' }}>{selectedEmployee.employeeId}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <DollarSign size={18} color="#64748b" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>الراتب الأساسي</div>
                                    <div style={{ fontWeight: 'bold' }}>{selectedEmployee.salary.toLocaleString()} ر.س</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Phone size={18} color="#64748b" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>رقم الجوال</div>
                                    <div style={{ fontWeight: 'bold' }}>{selectedEmployee.phone || 'غير مسجل'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Calendar size={18} color="#64748b" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>تاريخ الانضمام</div>
                                    <div style={{ fontWeight: 'bold' }}>{selectedEmployee.joinDate ? new Date(selectedEmployee.joinDate).toLocaleDateString('ar-SA') : '-'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', gridColumn: 'span 2' }}>
                                <Mail size={18} color="#64748b" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>البريد الإلكتروني</div>
                                    <div style={{ fontWeight: 'bold' }}>{selectedEmployee.email || 'غير مسجل'}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
                            <button onClick={() => { setShowDetails(false); openForm(selectedEmployee); }} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe', cursor: 'pointer', fontWeight: 'bold' }}>تعديل البيانات</button>
                            <button onClick={() => setShowDetails(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer' }}>إغلاق</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRPage;
