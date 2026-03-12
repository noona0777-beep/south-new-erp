import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, Search, FileText, Calendar, User, 
    Briefcase, MoreVertical, Edit, Trash2, Printer, 
    CheckCircle, XCircle, Clock, Archive, ShieldCheck,
    Download, LayoutGrid, ArrowRight, Eye, Send,
    FileMinus, AlertOctagon, ChevronLeft, ChevronRight,
    MapPin, Wallet, CreditCard, Building2, Layers, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '@/config';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

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
    const [showDocsModal, setShowDocsModal] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [contractDocuments, setContractDocuments] = useState([]);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Document Form State
    const [docFormData, setDocFormData] = useState({ title: '', category: 'CONTRACT', fileUrl: '', fileName: '' });

    // Form State
    const [formData, setFormData] = useState({
        partnerId: '', projectId: '', title: '', type: 'MAIN', startDate: '', endDate: '',
        advancePayment: 0, retentionPercent: 5, location: '', signatureName: '',
        items: [{ description: '', unit: 'متر', quantity: 0, unitPrice: 0 }],
        clauses: SCA_STANDARD_CLAUSES
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const [contractsRes, partnersRes, projectsRes] = await Promise.all([
                axios.get(`${API_URL}/construction-contracts`, { headers }),
                axios.get(`${API_URL}/partners`, { headers }),
                axios.get(`${API_URL}/projects`, { headers })
            ]);
            setContracts(contractsRes.data);
            setPartners(partnersRes.data);
            setProjects(projectsRes.data);
        } catch (error) {
            setError('فشل في استرداد بيانات العقود');
        } finally { setLoading(false); }
    };

    const handleAddItem = () => setFormData({ ...formData, items: [...formData.items, { description: '', unit: 'متر', quantity: 0, unitPrice: 0 }] });
    const handleRemoveItem = (index) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/construction-contracts`, formData, { headers: { Authorization: `Bearer ${token}` } });
            setShowModal(false);
            fetchData();
        } catch (error) { alert('خطأ في حفظ العقد'); }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'DRAFT': return { class: 'status-pending', label: 'مسودة قيد المراجعة', icon: <Clock size={14} /> };
            case 'ACTIVE': return { class: 'status-paid', label: 'عقد سارٍ ومفعل', icon: <CheckCircle size={14} /> };
            case 'COMPLETED': return { class: 'status-paid', label: 'عقد منتهي بالكامل', icon: <ShieldCheck size={14} /> };
            case 'CANCELLED': return { class: 'status-cancelled', label: 'عقد ملغى', icon: <XCircle size={14} /> };
            default: return { class: 'status-pending', label: status, icon: <Clock size={14} /> };
        }
    };

    const filteredContracts = contracts.filter(c =>
        (c.contractNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.partner?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ direction: 'rtl' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                <div>
                    <h2 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '2.2rem', fontWeight: '900' }} className="gradient-text">إدارة العقود الإنشائية</h2>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '1rem', fontWeight: '500' }}>توثيق العقود، بنود SCA الموحدة، ومتابعة التزامات التنفيذ.</p>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }} 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => setShowModal(true)}
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '18px', cursor: 'pointer', fontWeight: '800', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <Plus size={22} /> تحرير عقد جديد
                </motion.button>
            </div>

            {/* Filters */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '28px', marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={20} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                    <input placeholder="البحث برقم العقد، اسم العميل، أو موضوع العقد..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="premium-input" style={{ width: '100%', paddingRight: '45px', border: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="status-pill" style={{ background: 'rgba(255,255,255,0.03)', color: '#a1a1aa', border: 'none', cursor: 'pointer' }}>تصفية العقود الجارية</button>
                    <button className="status-pill" style={{ background: 'rgba(255,255,255,0.03)', color: '#a1a1aa', border: 'none', cursor: 'pointer' }}>الأرشيف التاريخي</button>
                </div>
            </div>

            {/* Contracts List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '30px' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#71717a' }}>
                        <RefreshCw className="animate-spin" size={48} style={{ margin: '0 auto 20px', display: 'block', color: '#6366f1' }} />
                        <h3 style={{ color: '#fff', fontWeight: '800' }}>جاري استرداد سجلات العقود...</h3>
                    </div>
                ) : filteredContracts.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#52525b' }}>لا توجد عقود مسجلة تطابق معايير البحث.</div>
                ) : filteredContracts.map((contract, idx) => {
                    const status = getStatusStyle(contract.status);
                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: idx * 0.05 }}
                            key={contract.id} 
                            className="glass-card" 
                            style={{ padding: '30px', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: '900', letterSpacing: '1px', marginBottom: '4px' }}>{contract.contractNumber}</div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: '900' }}>{contract.title}</h3>
                                </div>
                                <span className={`status-pill ${status.class}`} style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px' }}>
                                    {status.icon} {status.label}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#a1a1aa' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '10px' }}><User size={16} /></div>
                                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>الطرف الثاني: {contract.partner?.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#a1a1aa' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '10px' }}><Calendar size={16} /></div>
                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{new Date(contract.startDate).toLocaleDateString('ar-SA')} – {new Date(contract.endDate).toLocaleDateString('ar-SA')}</span>
                                </div>
                                {contract.project && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6366f1' }}>
                                        <div style={{ background: 'rgba(99,102,241,0.1)', padding: '8px', borderRadius: '10px' }}><Briefcase size={16} /></div>
                                        <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>مشروع: {contract.project.name}</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: '700', marginBottom: '4px' }}>إجمالي مبلغ التعاقد (صافي)</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>{contract.totalValue.toLocaleString()} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>ر.س</span></div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <motion.button {...buttonClick} onClick={() => window.open(`/contracts/${contract.id}/print`, '_blank')} style={{ background: 'rgba(255,255,255,0.03)', color: '#a1a1aa', border: 'none', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="طباعة العقد">
                                        <Printer size={18} />
                                    </motion.button>
                                    <motion.button {...buttonClick} onClick={() => { setSelectedContract(contract); setShowDocsModal(true); }} style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: 'none', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="المستندات والملاحق">
                                        <FileText size={18} />
                                    </motion.button>
                                    <motion.button 
                                        {...buttonClick} 
                                        onClick={async () => { 
                                            if (confirm('حذف العقد نهائياً؟')) {
                                                try {
                                                    const token = localStorage.getItem('token');
                                                    await axios.delete(`${API_URL}/construction-contracts/${contract.id}`, { headers: { Authorization: `Bearer ${token}` } });
                                                    fetchData();
                                                } catch (err) {
                                                    alert('فشل في حذف العقد');
                                                }
                                            } 
                                        }} 
                                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                                        title="حذف"
                                    >
                                        <Trash2 size={18} />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Creation Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card" style={{ width: '100%', maxWidth: '1000px', maxHeight: '95vh', overflowY: 'auto', padding: '40px', borderRadius: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', fontWeight: '900' }}>إصدار عقد مقاولات إنشائي</h3>
                                    <p style={{ margin: '5px 0 0 0', color: '#71717a', fontSize: '0.9rem' }}>تعبئة البيانات والبنود القانونية وجدول الكميات (BOQ)</p>
                                </div>
                                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '45px', height: '45px', borderRadius: '50%', color: '#a1a1aa', cursor: 'pointer' }}><XCircle size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '35px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontWeight: '700' }}>الطرف الثاني (المقاول/العميل)</label>
                                        <select required value={formData.partnerId} onChange={e => setFormData({ ...formData, partnerId: e.target.value })} className="premium-input" style={{ width: '100%' }}>
                                            <option value="">اختر من سجل الشركاء...</option>
                                            {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontWeight: '700' }}>الموقع والمشروع</label>
                                        <select value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })} className="premium-input" style={{ width: '100%' }}>
                                            <option value="">-- عقد مستقل (بدون مشروع) --</option>
                                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontWeight: '700' }}>تصنيف العقد</label>
                                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="premium-input" style={{ width: '100%' }}>
                                            <option value="MAIN">عقد توريد وتنفيذ وشامل</option>
                                            <option value="LABOR">عقد عمالة ومصنعيات فقط</option>
                                            <option value="DESIGN">عقد هندسي / تصميم</option>
                                            <option value="RENOVATION">عقد ترميم وبناء</option>
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: 'span 3' }}>
                                        <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontWeight: '700' }}>عنوان العقد الرسمي</label>
                                        <input required type="text" placeholder="مثال: تنفيذ أعمال الهيكل الإنشائي لمشروع فيلا الكوثر" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="premium-input" style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontWeight: '700' }}>تاريخ النفاذ (البدء)</label>
                                        <input required type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="premium-input" style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontWeight: '700' }}>تاريخ الاستحقاق (الانتهاء)</label>
                                        <input required type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="premium-input" style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontWeight: '700' }}>موقع العمل (تفصيلي)</label>
                                        <input type="text" placeholder="المنطقة، الحي، رقم القطعة" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="premium-input" style={{ width: '100%' }} />
                                    </div>
                                </div>

                                <div className="glass-card" style={{ padding: '30px', borderRadius: '28px', marginBottom: '35px', background: 'rgba(255,255,255,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                        <h4 style={{ margin: 0, color: '#fff', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}><Layers size={20} color="#6366f1" /> جدول تحليل الأعمال والكميات (BOQ)</h4>
                                        <motion.button {...buttonClick} type="button" onClick={handleAddItem} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'none', padding: '8px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontFamily: 'Cairo', fontSize: '0.85rem' }}>+ إضافة بند عمل</motion.button>
                                    </div>
                                    <table className="table-glass" style={{ margin: 0 }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'right' }}>بيان الأعمال والمواصفات</th>
                                                <th style={{ textAlign: 'center', width: '100px' }}>الوحدة</th>
                                                <th style={{ textAlign: 'center', width: '100px' }}>الكمية</th>
                                                <th style={{ textAlign: 'center', width: '140px' }}>سعر الوحدة</th>
                                                <th style={{ width: '50px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ padding: '10px' }}><input type="text" placeholder="شرح مبسط للبند..." value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} className="premium-input" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: 'none' }} /></td>
                                                    <td style={{ padding: '10px' }}><input type="text" value={item.unit} onChange={e => handleItemChange(idx, 'unit', e.target.value)} className="premium-input" style={{ width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: 'none' }} /></td>
                                                    <td style={{ padding: '10px' }}><input type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="premium-input" style={{ width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: 'none' }} /></td>
                                                    <td style={{ padding: '10px' }}><input type="number" value={item.unitPrice} onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)} className="premium-input" style={{ width: '100%', textAlign: 'center', background: 'rgba(74,222,128,0.03)', border: 'none', color: '#4ade80', fontWeight: '800' }} /></td>
                                                    <td style={{ textAlign: 'center' }}>{formData.items.length > 1 && <button type="button" onClick={() => handleRemoveItem(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="glass-card" style={{ padding: '30px', borderRadius: '28px', marginBottom: '35px', background: 'rgba(255,255,255,0.01)' }}>
                                    <h4 style={{ margin: '0 0 20px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '900' }}><ShieldCheck size={20} color="#10b981" /> بنود العقد الموحدة (SCA)</h4>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '15px' }}>
                                        {formData.clauses.map((clause, idx) => (
                                            <div key={idx} style={{ marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
                                                <div style={{ fontWeight: '900', color: '#6366f1', marginBottom: '10px', fontSize: '0.95rem' }}>المادة ({clause.id}): {clause.title}</div>
                                                <textarea 
                                                    value={clause.content} 
                                                    onChange={e => {
                                                        const newClauses = [...formData.clauses];
                                                        newClauses[idx].content = e.target.value;
                                                        setFormData({ ...formData, clauses: newClauses });
                                                    }} 
                                                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: 'none', padding: '15px', borderRadius: '15px', color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.6', fontFamily: 'Cairo', resize: 'vertical' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setShowModal(false)} style={{ padding: '14px 40px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#a1a1aa', fontWeight: '700', cursor: 'pointer', fontFamily: 'Cairo' }}>إلغاء الأمر</button>
                                    <motion.button {...buttonClick} type="submit" style={{ padding: '14px 60px', borderRadius: '15px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', fontWeight: '900', cursor: 'pointer', fontFamily: 'Cairo' }}>إصدار العقد واعتماده</motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Documents Modal */}
            <AnimatePresence>
                {showDocsModal && selectedContract && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card" style={{ width: '100%', maxWidth: '650px', padding: '40px', borderRadius: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: '900' }}>ملاحق ومستندات العقد</h3>
                                    <p style={{ margin: '4px 0 0 0', color: '#71717a' }}>أرشفة الصور، المخططات، والوثائق الملحقة بالعقد {selectedContract.contractNumber}</p>
                                </div>
                                <button onClick={() => setShowDocsModal(false)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><XCircle size={24} /></button>
                            </div>

                            <div className="glass-card" style={{ padding: '25px', borderRadius: '24px', background: 'rgba(99,102,241,0.05)', border: '1px dashed rgba(99,102,241,0.2)', marginBottom: '30px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <input placeholder="إسم المستحق أو المستند..." className="premium-input" style={{ width: '100%' }} />
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: '#71717a', fontSize: '0.9rem', textAlign: 'center', cursor: 'pointer' }}>اسحب الملف هنا أو اضغط للاختيار</div>
                                        <motion.button {...buttonClick} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '12px', fontWeight: '800' }}>رفع الآن</motion.button>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ textAlign: 'center', padding: '40px', color: '#52525b' }}>لا توجد ملفات مرفقة حالياً لهذا العقد.</div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContractsPage;
