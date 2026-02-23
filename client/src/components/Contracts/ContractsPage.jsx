import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../config';
import {
    Plus, Search, FileText, Calendar, User,
    Briefcase, MoreVertical, Edit, Trash2, Printer,
    CheckCircle, XCircle, Clock, Archive
} from 'lucide-react';

const SCA_STANDARD_CLAUSES = [
    { id: 1, title: 'الغرض من العقد', content: 'يلتزم الطرف الثاني بتنفيذ كافة أعمال المشروع الموضحة في الملحقات الفنية وجدول الكميات طبقاً للأصول الفنية.' },
    { id: 2, title: 'مستندات العقد', content: 'يتكون العقد من الوثيقة الأساسية، المخططات، المواصفات الفنية، وجدول الكميات، وتعتبر كلاً لا يتجزأ.' },
    { id: 3, title: 'مدة التنفيذ', content: 'يلتزم الطرف الثاني بإنهاء الأعمال في المدة المتفق عليها، ويبدأ الحساب من تاريخ استلام الموقع.' },
    { id: 4, title: 'القيمة وطريقة الدفع', content: 'يتم صرف المستخلصات بناءً على ما تم إنجازه فعلياً على الطبيعة وبعد اعتماد المهندس المشرف.' },
    { id: 5, title: 'استلام الموقع', content: 'يسلم الطرف الأول الموقع للطرف الثاني خالياً من العوائق التي تمنع البدء في التنفيذ.' },
    { id: 6, title: 'المواد والمعدات', content: 'كافة المواد الموردة يجب أن تكون مطابقة للمواصفات السعودية المعتمدة ونوعية الدرجة المتفق عليها.' },
    { id: 7, title: 'الإشراف الفني', content: 'للطرف الأول الحق في تعيين مهندس مشرف لمتابعة سير الأعمال والتأكد من مطابقتها للجودة.' },
    { id: 8, title: 'التعديلات', content: 'لا يحق للطرف الثاني إجراء أي تعديل جوهري دون أمر كتابي مسبق من الطرف الأول.' },
    { id: 9, title: 'السلامة والصحة المهنية', content: 'يلتزم الطرف الثاني بتوفير وسائل السلامة في الموقع وحماية العاملين والمارة حسب الأنظمة.' },
    { id: 10, title: 'العمالة والكوادر', content: 'يتحمل الطرف الثاني كافة مصاريف وتأمينات عمالته ومسؤوليتهم أمام الجهات المختصة.' },
    { id: 11, title: 'فترة الضمان', content: 'يضمن الطرف الثاني جودة الأعمال لمدة سنة ميلادية كاملة من تاريخ الاستلام الابتدائي.' },
    { id: 12, title: 'غرامات التأخير', content: 'في حال تأخر الطرف الثاني عن موعد التسليم، يطبق عليه غرامة بواقع 1% عن كل أسبوع تأخير.' },
    { id: 13, title: 'القوة القاهرة', content: 'يعفى أي من الطرفين من مسؤولياته في حال حدوث ظروف خارجة عن الإرادة تمنع تنفيذ العمال.' },
    { id: 14, title: 'إنهاء العقد', content: 'يحق للطرف الأول إنهاء العقد في حال أخل الطرف الثاني بالتزاماته الجوهرية بعد إخطاره.' },
    { id: 15, title: 'تسوية النزاعات', content: 'يتم حل أي خلاف ودياً، وفي حال تعذر ذلك يتم اللجوء للجهات القضائية المختصة بالمملكة.' },
    { id: 16, title: 'السرية والخصوصية', content: 'يلتزم الطرفان بعدم إفشاء أي معلومات تتعلق بالمشروع للغير دون موافقة خطية.' },
    { id: 17, title: 'الضرائب والرسوم', content: 'يتحمل كل طرف الرسوم والضرائب (بما فيها القيمة المضافة) حسب ما نص عليه النظام.' },
    { id: 18, title: 'المراسلات', content: 'تعتبر العناوين المذكورة في صدر هذا العقد والبريد الإلكتروني المعتمد هي الوسيلة الرسمية للتخاطب.' },
    { id: 19, title: 'التنازل عن العقد', content: 'لا يجوز للطرف الثاني التنازل عن العقد للغير أو التعاقد من الباطن دون موافقة الطرف الأول.' },
    { id: 20, title: 'تنظيف الموقع', content: 'يجب على الطرف الثاني إزالة كافة المخلفات والمواد الزائدة عند انتهاء العمل وبشكل دوري.' },
    { id: 21, title: 'أحكام عامة', content: 'يخضع هذا العقد لأنظمة المملكة العربية السعودية ويتم تفسيره بموجبها.' }
];

const ContractsPage = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [partners, setPartners] = useState([]);
    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        partnerId: '',
        projectId: '',
        title: '',
        type: 'MAIN', // MAIN, RENOVATION, DESIGN, LABOR, SUPPLY
        startDate: '',
        endDate: '',
        advancePayment: 0,
        retentionPercent: 5,
        location: '',
        signatureName: '',
        items: [{ description: '', unit: 'متر', quantity: 0, unitPrice: 0 }],
        clauses: SCA_STANDARD_CLAUSES
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [cRes, pRes, prRes] = await Promise.all([
                axios.get(`${API_URL}/construction-contracts`, { headers }),
                axios.get(`${API_URL}/partners`),
                axios.get(`${API_URL}/projects`)
            ]);
            setContracts(cRes.data);
            setPartners(pRes.data);
            setProjects(prRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Fetch error:', error);
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', unit: 'متر', quantity: 0, unitPrice: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/construction-contracts`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            fetchData();
            setFormData({
                partnerId: '', projectId: '', title: '', type: 'MAIN',
                startDate: '', endDate: '', advancePayment: 0, retentionPercent: 5,
                location: '', signatureName: '',
                items: [{ description: '', unit: 'متر', quantity: 0, unitPrice: 0 }],
                clauses: SCA_STANDARD_CLAUSES
            });
        } catch (error) {
            alert('خطأ في حفظ العقد: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا العقد؟')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/construction-contracts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            alert('خطأ في الحذف');
        }
    };

    const filteredContracts = contracts.filter(c =>
        c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.partner?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'DRAFT': return { bg: '#f1f5f9', color: '#64748b', icon: <Clock size={14} /> };
            case 'ACTIVE': return { bg: '#ecfdf5', color: '#10b981', icon: <CheckCircle size={14} /> };
            case 'COMPLETED': return { bg: '#eff6ff', color: '#2563eb', icon: <CheckCircle size={14} /> };
            case 'CANCELLED': return { bg: '#fef2f2', color: '#ef4444', icon: <XCircle size={14} /> };
            case 'ARCHIVED': return { bg: '#f8fafc', color: '#94a3b8', icon: <Archive size={14} /> };
            default: return { bg: '#f1f5f9', color: '#64748b', icon: <Clock size={14} /> };
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Cairo' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem', fontWeight: '800' }}>إدارة عقود المقاولات</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>إصدار ومتابعة عقود الإنشاءات والصيانة حسب معايير SCA</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px',
                        borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        fontWeight: 'bold', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                    }}
                >
                    <Plus size={20} /> إنشاء عقد جديد
                </button>
            </div>

            {/* Filters */}
            <div style={{ background: 'white', padding: '15px', borderRadius: '16px', marginBottom: '20px', display: 'flex', gap: '15px', border: '1px solid #f1f5f9' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="بحث برقم العقد، اسم العميل، أو العنوان..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '10px 40px 10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                    />
                </div>
            </div>

            {/* Contracts List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>جاري التحميل...</div>
                ) : filteredContracts.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', background: 'white', borderRadius: '16px' }}>لا توجد عقود حالياً</div>
                ) : filteredContracts.map(contract => {
                    const status = getStatusStyle(contract.status);
                    return (
                        <div key={contract.id} className="card-hover" style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', overflow: 'hidden', transition: 'all 0.3s' }}>
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>{contract.contractNumber}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: status.bg, color: status.color, fontSize: '0.75rem', fontWeight: 'bold' }}>
                                        {status.icon} {contract.status}
                                    </div>
                                </div>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#1e293b' }}>{contract.title}</h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                                        <User size={14} /> {contract.partner?.name}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                                        <Calendar size={14} /> {new Date(contract.startDate).toLocaleDateString('ar-SA')} - {new Date(contract.endDate).toLocaleDateString('ar-SA')}
                                    </div>
                                    {contract.project && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#2563eb', fontWeight: 'bold' }}>
                                            <Briefcase size={14} /> {contract.project.name}
                                        </div>
                                    )}
                                </div>

                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>قيمة العقد</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>{contract.totalValue.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>ر.س</span></div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => navigate(`/contracts/${contract.id}/print`)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer' }} title="طباعة">
                                            <Printer size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(contract.id)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', background: 'white', color: '#ef4444', cursor: 'pointer' }} title="حذف">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal for Creating Contract */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                    <div style={{ background: 'white', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '24px', padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>إنشاء عقد مقاولات جديد</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>إغلاق</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>العميل (الطرف الأول)</label>
                                    <select
                                        required
                                        value={formData.partnerId}
                                        onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="">اختر العميل...</option>
                                        {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>المشروع المرتبط</label>
                                    <select
                                        value={formData.projectId}
                                        onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="">بدون مشروع حالياً...</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ gridColumn: '1/-1' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>عنوان العقد / اسم العمل</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="مثال: تنفيذ أعمال لياسة ومباني لفيلا سكنية"
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>نوع العقد</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="MAIN">عقد توريد وتنفيذ (رئيسي)</option>
                                        <option value="LABOR">عقد مصنعيات (عمالة)</option>
                                        <option value="DESIGN">عقد تصميم وإشراف</option>
                                        <option value="RENOVATION">عقد ترميم وصيانة</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>موقع التنفيذ</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="الحي، المدينة، الموقع..."
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>تاريخ البداية</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>تاريخ التسليم المتوقع</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                            </div>

                            {/* BOQ Editor */}
                            <div style={{ marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h4 style={{ margin: 0 }}>جدول الكميات والمواصفات (BOQ)</h4>
                                    <button type="button" onClick={handleAddItem} style={{ color: '#2563eb', background: '#eff6ff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        + إضافة بند أعمال
                                    </button>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'right', borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                                            <th style={{ padding: '10px' }}>الوصف والبيان</th>
                                            <th style={{ padding: '10px', width: '100px' }}>الوحدة</th>
                                            <th style={{ padding: '10px', width: '100px' }}>الكمية</th>
                                            <th style={{ padding: '10px', width: '120px' }}>سعر الوحدة</th>
                                            <th style={{ padding: '10px', width: '50px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.items.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '10px' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="وصف العمل..."
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                                        style={{ width: '100%', border: 'none', outline: 'none', padding: '5px' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    <input
                                                        type="text"
                                                        value={item.unit}
                                                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                                        style={{ width: '100%', border: 'none', outline: 'none', padding: '5px' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                        style={{ width: '100%', border: 'none', outline: 'none', padding: '5px' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    <input
                                                        type="number"
                                                        value={item.unitPrice}
                                                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                                                        style={{ width: '100%', border: 'none', outline: 'none', padding: '5px' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                    <button type="button" onClick={() => handleRemoveItem(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 25px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white' }}>إلغاء</button>
                                <button type="submit" style={{ padding: '10px 40px', borderRadius: '10px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold' }}>حفظ العقد وإصدار رقم</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContractsPage;
