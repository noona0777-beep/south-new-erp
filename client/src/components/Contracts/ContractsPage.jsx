import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Printer, Edit, Trash2, FileText, ChevronRight, Briefcase, Calendar, DollarSign, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import API_URL from '../../config';
import { SCA_CLAUSES } from '../../constants/contractTemplates';

const ContractsPage = () => {
    const [contracts, setContracts] = useState([]);
    const [partners, setPartners] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showArchived, setShowArchived] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        type: 'MAIN',
        partnerId: '',
        projectId: '',
        startDate: '',
        endDate: '',
        location: '', // Adding location
        advancePayment: 0,
        retentionPercent: 5,
        items: [{ description: '', unit: 'متر', quantity: 1, unitPrice: 0, total: 0 }],
        clauses: SCA_CLAUSES.MAIN,
        signatureName: '',
        status: 'DRAFT' // Default status
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [cRes, pRes, prRes] = await Promise.all([
                axios.get(`${API_URL}/construction-contracts`),
                axios.get(`${API_URL}/partners`),
                axios.get(`${API_URL}/projects`)
            ]);
            setContracts(cRes.data);
            setPartners(pRes.data);
            setProjects(prRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Data fetch error', err);
            setLoading(false);
        }
    };

    const handleFormReset = () => {
        setFormData({
            title: '',
            type: 'MAIN',
            partnerId: '',
            projectId: '',
            startDate: '',
            endDate: '',
            location: '',
            advancePayment: 0,
            retentionPercent: 5,
            items: [{ description: '', unit: 'متر', quantity: 1, unitPrice: 0, total: 0 }],
            clauses: SCA_CLAUSES.MAIN,
            signatureName: '',
            status: 'DRAFT'
        });
        setIsEditing(false);
        setEditingId(null);
        setShowForm(false);
    };

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', unit: 'متر', quantity: 1, unitPrice: 0, total: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
        setFormData({ ...formData, items: newItems });
    };

    const handleClauseChange = (index, value) => {
        const newClauses = [...formData.clauses];
        newClauses[index].content = value;
        setFormData({ ...formData, clauses: newClauses });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${API_URL}/construction-contracts/${editingId}`, formData);
                alert('✅ تم تحديث العقد بنجاح');
            } else {
                await axios.post(`${API_URL}/construction-contracts`, formData);
                alert('✅ تم إنشاء العقد بنجاح');
            }
            fetchData();
            handleFormReset();
        } catch (err) {
            alert('❌ فشل حفظ العقد');
        }
    };

    const handleEdit = (contract) => {
        setFormData({
            title: contract.title,
            type: contract.type,
            partnerId: contract.partnerId,
            projectId: contract.projectId || '',
            startDate: new Date(contract.startDate).toISOString().split('T')[0],
            endDate: new Date(contract.endDate).toISOString().split('T')[0],
            advancePayment: contract.advancePayment,
            retentionPercent: contract.retentionPercent,
            items: contract.items,
            clauses: contract.clauses || SCA_CLAUSES.MAIN,
            signatureName: contract.signatureName || '',
            location: contract.location || '',
            status: contract.status || 'DRAFT'
        });
        setEditingId(contract.id);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا العقد؟')) {
            try {
                await axios.delete(`${API_URL}/construction-contracts/${id}`);
                fetchData();
            } catch (err) {
                alert('❌ فشل الحذف');
            }
        }
    };

    const handleArchive = async (id) => {
        if (!window.confirm('هل أنت متأكد من نقل هذا العقد إلى الأرشيف الرسمي؟')) return;
        try {
            await axios.put(`${API_URL}/construction-contracts/${id}`, { status: 'ARCHIVED' });
            fetchData();
            alert('✅ تمت أرشفة المستند بنجاح');
        } catch (err) {
            alert('❌ فشل عملية الأرشفة');
        }
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        const tax = subtotal * 0.15;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    };

    const handleConvertToInvoice = (contract) => {
        if (!window.confirm('هل تريد تحويل هذا العقد إلى مسودة فاتورة مبيعات في النظام المحاسبي؟')) return;
        // Logic to redirect to Invoice creation with state
        // In a real app, you might call an API, but here we'll redirect
        alert('✅ تم تجهيز بيانات الفاتورة. سيتم تحويلك لصفحة الفواتير...');
        window.location.href = `/invoices?fromContract=${contract.id}&partnerId=${contract.partnerId}&total=${contract.totalValue}&title=${encodeURIComponent(contract.title)}`;
    };

    if (showForm) {
        const totals = calculateTotals();
        return (
            <div className="fade-in" style={{ paddingBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ShieldCheck size={32} color="#2563eb" />
                            {isEditing ? 'تعديل عقد المقاولات' : 'إنشاء عقد مقاولات جديد (معايير SCA)'}
                        </h2>
                        <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>صياغة قانونية متوافقة مع الهيئة السعودية للمقاولين</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={handleFormReset} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}>إلغاء</button>
                        <button onClick={handleSubmit} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}>حفظ واعتماد العقد</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Section 1: Basic Info */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Briefcase size={18} /> البيانات الأساسية للعقد
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>عنوان المشروع / العقد</label>
                                    <input
                                        type="text"
                                        placeholder="مثال: توريد وتركيب أعمال الكلادينج لمشروع..."
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>اسم الشخص المفوض بالتوقيع</label>
                                    <input
                                        type="text"
                                        placeholder="الاسم الذي سيظهر في خانة التوقيع"
                                        value={formData.signatureName}
                                        onChange={(e) => setFormData({ ...formData, signatureName: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>العميل (الطرف الأول)</label>
                                    <select
                                        value={formData.partnerId}
                                        onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="">اختر العميل...</option>
                                        {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>المشروع المرتبط</label>
                                    <select
                                        value={formData.projectId}
                                        onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="">اختر المشروع (اختياري)...</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>تاريخ البدء</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>موقع المشروع / العنوان</label>
                                    <input
                                        type="text"
                                        placeholder="مثال: الرياض - حي الملقا - شارع..."
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>حالة العقد الحالي</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="DRAFT">مسودة (قيد المراجعة)</option>
                                        <option value="ACTIVE">نشط (تم التعميد)</option>
                                        <option value="COMPLETED">مكتمل (تم التسليم)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Clauses Editor */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={18} /> بنود العقد (الصياغة القانونية)
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {formData.clauses.map((clause, idx) => (
                                    <div key={idx} style={{ padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#1e293b', fontSize: '0.95rem' }}>البند {clause.id}: {clause.title}</div>
                                        <textarea
                                            value={clause.content}
                                            onChange={(e) => handleClauseChange(idx, e.target.value)}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px', fontFamily: 'Cairo', fontSize: '0.9rem', lineHeight: '1.6' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Section 3: Financials */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', position: 'sticky', top: '24px' }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#334155' }}>التفاصيل المالية</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#64748b' }}>الدفعة المقدمة (ر.س)</label>
                                    <input
                                        type="number"
                                        value={formData.advancePayment}
                                        onChange={(e) => setFormData({ ...formData, advancePayment: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#64748b' }}>نسبة الاستقطاع الاحتياطي (%)</label>
                                    <input
                                        type="number"
                                        value={formData.retentionPercent}
                                        onChange={(e) => setFormData({ ...formData, retentionPercent: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', marginTop: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#64748b' }}>
                                        <span>إجمالي الأعمال</span>
                                        <span>{totals.subtotal.toFixed(2)} ر.س</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#64748b' }}>
                                        <span>الضريبة (15%)</span>
                                        <span>{totals.tax.toFixed(2)} ر.س</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', color: '#0f172a', marginTop: '5px' }}>
                                        <span>إجمالي العقد</span>
                                        <span>{totals.total.toFixed(2)} ر.س</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: BOQ / Items */}
                <div style={{ marginTop: '24px', background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#334155' }}>جدول الكميات (BOQ)</h3>
                        <button onClick={handleAddItem} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            <Plus size={18} /> إضافة بند عمل
                        </button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '12px', textAlign: 'right' }}>وصف العمل</th>
                                <th style={{ padding: '12px', textAlign: 'center', width: '100px' }}>الوحدة</th>
                                <th style={{ padding: '12px', textAlign: 'center', width: '100px' }}>الكمية</th>
                                <th style={{ padding: '12px', textAlign: 'center', width: '150px' }}>سعر الوحدة</th>
                                <th style={{ padding: '12px', textAlign: 'center', width: '150px' }}>الإجمالي</th>
                                <th style={{ padding: '12px', textAlign: 'center', width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.items.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px' }}>
                                        <input type="text" value={item.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <input type="text" value={item.unit} onChange={(e) => handleItemChange(idx, 'unit', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', textAlign: 'center' }} />
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <input type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', textAlign: 'center' }} />
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', textAlign: 'center' }} />
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{item.total.toFixed(2)}</td>
                                    <td style={{ padding: '10px' }}>
                                        <button onClick={() => handleRemoveItem(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.8rem', fontWeight: 'bold' }}>عقود المقاولات</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>إدارة وتوليد العقود الإنشائية حسب معايير الهيئة السعودية للمقاولين</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        style={{ background: showArchived ? '#1e3a8a' : 'white', color: showArchived ? 'white' : '#64748b', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <FileText size={20} /> {showArchived ? 'العودة للعقود النشطة' : 'عرض الأرشيف'}
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        style={{ background: '#2563eb', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(37,99,235,0.3)' }}
                    >
                        <Plus size={20} /> إنشاء عقد جديد
                    </button>
                </div>
            </div>

            {/* Statistics Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'إجمالي قيمة العقود', value: `${contracts.reduce((a, b) => a + (b.totalValue || 0), 0).toLocaleString()} ر.س`, icon: <DollarSign />, color: '#2563eb' },
                    { label: 'العقود النشطة', value: contracts.filter(c => c.status === 'ACTIVE').length, icon: <ShieldCheck />, color: '#10b981' },
                    { label: 'العقود المكتملة', value: contracts.filter(c => c.status === 'COMPLETED').length, icon: <CheckCircle2 />, color: '#6366f1' },
                    { label: 'بانتظار التعميد', value: contracts.filter(c => c.status === 'DRAFT').length, icon: <AlertCircle />, color: '#f59e0b' }
                ].map((stat, i) => (
                    <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: `${stat.color}10`, color: stat.color, padding: '12px', borderRadius: '15px' }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>جاري تحميل العقود...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                    {contracts.filter(c => showArchived ? c.status === 'ARCHIVED' : c.status !== 'ARCHIVED').length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                            <FileText size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                            <p style={{ color: '#94a3b8' }}>{showArchived ? 'لا توجد عقود مؤرشفة حالياً.' : 'لا توجد عقود نشطة حالياً. ابدأ بإنشاء أول عقد احترافي.'}</p>
                        </div>
                    ) : (
                        contracts
                            .filter(c => showArchived ? c.status === 'ARCHIVED' : c.status !== 'ARCHIVED')
                            .map(contract => (
                                <div key={contract.id} className="card-hover" style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                        <span style={{ padding: '6px 14px', borderRadius: '20px', background: contract.status === 'ARCHIVED' ? '#f1f5f9' : '#eff6ff', color: contract.status === 'ARCHIVED' ? '#64748b' : '#2563eb', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                            {contract.status === 'ARCHIVED' ? 'مؤرشف' : contract.status === 'ACTIVE' ? 'ساري المفعول' : 'مسودة'}
                                        </span>
                                        <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>#{contract.contractNumber}</div>
                                    </div>
                                    <h3 style={{ margin: '0 0 12px 0', fontSize: '1.15rem', color: '#1e293b', lineHeight: '1.4' }}>{contract.title}</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                                            <Briefcase size={16} /> {contract.partner?.name}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                                            <Calendar size={16} /> {new Date(contract.startDate).toLocaleDateString('ar-SA')} - {new Date(contract.endDate).toLocaleDateString('ar-SA')}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 'bold' }}>
                                            <DollarSign size={16} color="#10b981" /> {contract.totalValue.toLocaleString()} ر.س
                                        </div>
                                    </div>

                                    {/* Financial Progress Bar */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '5px' }}>
                                            <span>نسبة الإنجاز المالي</span>
                                            <span>{contract.status === 'COMPLETED' ? '100%' : 'جارِ التنفيذ'}</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: contract.status === 'COMPLETED' ? '100%' : '35%', background: 'linear-gradient(90deg, #2563eb, #3b82f6)', borderRadius: '10px' }}></div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                        <button
                                            onClick={() => window.open(`/contracts/${contract.id}/print`, '_blank')}
                                            title="عرض وطباعة"
                                            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}
                                        >
                                            <Printer size={16} /> عرض العقد
                                        </button>

                                        {contract.status !== 'ARCHIVED' && (
                                            <>
                                                <button
                                                    onClick={() => handleConvertToInvoice(contract)}
                                                    title="تحويل لفاتورة"
                                                    style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#f0f9ff', color: '#0369a1', cursor: 'pointer' }}
                                                >
                                                    <DollarSign size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(contract.id)}
                                                    title="نقل للأرشيف"
                                                    style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}
                                                >
                                                    <ShieldCheck size={18} />
                                                </button>
                                            </>
                                        )}

                                        <button onClick={() => handleEdit(contract)} title="تعديل العقد" style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}>
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(contract.id)} title="حذف العقد" style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ContractsPage;
