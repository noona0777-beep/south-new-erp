import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Folder, File, FileText, Plus, Trash2,
    Download, ExternalLink, Filter, Search,
    User, Briefcase, Users, Link as LinkIcon
} from 'lucide-react';
import API_URL from '../../config';

const DocumentsPage = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'CONTRACT',
        fileUrl: '',
        partnerId: '',
        employeeId: '',
        projectId: ''
    });

    const [partners, setPartners] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetchDocuments();
        fetchRelatedData();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/documents`);
            setDocuments(res.data);
        } catch (err) {
            console.error('Error fetching documents', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedData = async () => {
        try {
            const [p, e, pr] = await Promise.all([
                axios.get(`${API_URL}/partners`),
                axios.get(`${API_URL}/employees`),
                axios.get(`${API_URL}/projects`)
            ]);
            setPartners(p.data);
            setEmployees(e.data);
            setProjects(pr.data);
        } catch (err) {
            console.error('Error fetching related data', err);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/documents`, formData);
            setShowUpload(false);
            setFormData({ title: '', category: 'CONTRACT', fileUrl: '', partnerId: '', employeeId: '', projectId: '' });
            fetchDocuments();
        } catch (err) {
            alert('فشل حفظ المستند');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المستند؟')) return;
        try {
            await axios.delete(`${API_URL}/documents/${id}`);
            fetchDocuments();
        } catch (err) {
            alert('فشل حذف المستند');
        }
    };

    const categories = {
        'ALL': 'الكل',
        'CONTRACT': 'عقود',
        'ID': 'هويات',
        'LICENSE': 'تراخيص',
        'OTHER': 'أخرى'
    };

    const filteredDocs = documents.filter(doc => {
        const matchesFilter = filter === 'ALL' || doc.category === filter;
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading && documents.length === 0) return <div style={{ textAlign: 'center', padding: '50px' }}>جاري تحميل الأرشيف...</div>;

    return (
        <div className="fade-in" style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Folder size={28} style={{ color: '#2563eb' }} />
                        أرشيف المستندات والوثائق
                    </h2>
                    <p style={{ margin: 0, color: '#64748b' }}>إدارة وتنظيم الوثائق الرسمية والعقود</p>
                </div>
                <button
                    onClick={() => setShowUpload(true)}
                    style={{
                        background: '#2563eb', color: 'white', border: 'none',
                        padding: '12px 24px', borderRadius: '12px', cursor: 'pointer',
                        display: 'flex', gap: '10px', alignItems: 'center', fontWeight: 'bold',
                        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                    }}
                >
                    <Plus size={20} /> إضافة مستند جديد
                </button>
            </div>

            {/* Filters & Search */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'center', background: 'white', padding: '15px', borderRadius: '15px', border: '1px solid #f1f5f9' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="بحث في المستندات..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 40px 10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'Cairo' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {Object.entries(categories).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            style={{
                                padding: '8px 16px', borderRadius: '8px', border: 'none',
                                background: filter === key ? '#eff6ff' : 'transparent',
                                color: filter === key ? '#2563eb' : '#64748b',
                                fontWeight: filter === key ? 'bold' : 'normal',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Documents Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {filteredDocs.map(doc => (
                    <div key={doc.id} className="card-hover" style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', position: 'relative' }}>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                            <div style={{
                                width: '50px', height: '50px', borderRadius: '12px',
                                background: doc.category === 'CONTRACT' ? '#fdf2f2' : doc.category === 'ID' ? '#ecfdf5' : '#eff6ff',
                                color: doc.category === 'CONTRACT' ? '#ef4444' : doc.category === 'ID' ? '#10b981' : '#2563eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {doc.category === 'CONTRACT' ? <FileText size={24} /> : <File size={24} />}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{doc.title}</h4>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(doc.createdAt).toLocaleDateString('ar-SA')}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {doc.partner && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                                    <Users size={14} /> {doc.partner.name}
                                </div>
                            )}
                            {doc.employee && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                                    <User size={14} /> {doc.employee.name}
                                </div>
                            )}
                            {doc.project && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                                    <Briefcase size={14} /> {doc.project.name}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f8fafc', paddingTop: '15px' }}>
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none', background: '#f8fafc', color: '#334155', padding: '8px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid #e2e8f0' }}>
                                <ExternalLink size={14} /> فتح
                            </a>
                            <button onClick={() => handleDelete(doc.id)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', color: '#ef4444', background: '#fef2f2', cursor: 'pointer' }}>
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div style={{ position: 'absolute', top: '15px', left: '15px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>
                            {categories[doc.category]}
                        </div>
                    </div>
                ))}

                {filteredDocs.length === 0 && !loading && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', background: 'white', borderRadius: '20px', color: '#94a3b8' }}>
                        <Folder size={48} style={{ marginBottom: '15px', opacity: 0.2 }} />
                        <p>لا توجد مستندات تطابق البحث.</p>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUpload && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="fade-in" style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '500px', maxWidth: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Plus style={{ color: '#2563eb' }} /> إضافة مستند جديد للـأرشيف
                        </h3>
                        <form onSubmit={handleUpload}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>عنوان المستند*</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    placeholder="مثال: عقد إيجار شقة 5"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>التصنيف</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: 'white' }}
                                    >
                                        <option value="CONTRACT">عقد</option>
                                        <option value="ID">هوية / إقامة</option>
                                        <option value="LICENSE">ترخيص</option>
                                        <option value="OTHER">أخرى</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>رابط الملف / الرابط</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.fileUrl}
                                        onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                        placeholder="URL المستند"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>ربط مع (اختياري)</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <select
                                        value={formData.partnerId}
                                        onChange={e => setFormData({ ...formData, partnerId: e.target.value, employeeId: '', projectId: '' })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                    >
                                        <option value="">-- ربط بعميل --</option>
                                        {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <select
                                        value={formData.employeeId}
                                        onChange={e => setFormData({ ...formData, employeeId: e.target.value, partnerId: '', projectId: '' })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                    >
                                        <option value="">-- ربط بموظف --</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                    <select
                                        value={formData.projectId}
                                        onChange={e => setFormData({ ...formData, projectId: e.target.value, partnerId: '', employeeId: '' })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                    >
                                        <option value="">-- ربط بمشروع --</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setShowUpload(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>إلغاء</button>
                                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>حفظ المستند</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsPage;
