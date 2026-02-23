import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Folder, File, FileText, Plus, Trash2,
    Download, ExternalLink, Filter, Search,
    User, Briefcase, Users, Upload, X, Check, Eye, Printer
} from 'lucide-react';
import API_URL from '../../config';

const DocumentsPage = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [uploading, setUploading] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [resolvedUrl, setResolvedUrl] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'CONTRACT',
        fileUrl: '', // This will hold the Base64 string
        fileName: '',
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

    useEffect(() => {
        if (previewDoc && !previewDoc.fileUrl) {
            setResolvedUrl(null); // Reset

            // Prioritize resolution by IDs (Fastest)
            if (previewDoc.partnerId && previewDoc.title.includes('العميل')) {
                setResolvedUrl(`INTERNAL:CLIENT:${previewDoc.partnerId}`);
            } else if (previewDoc.projectId && previewDoc.title.includes('المشروع')) {
                setResolvedUrl(`INTERNAL:PROJECT:${previewDoc.projectId}`);
            } else if (previewDoc.employeeId && previewDoc.title.includes('الموظف')) {
                setResolvedUrl(`INTERNAL:EMPLOYEE:${previewDoc.employeeId}`);
            } else {
                // Fallback to API resolver by title (for Invoices/Quotes)
                axios.get(`${API_URL}/resolve-document?title=${encodeURIComponent(previewDoc.title)}`)
                    .then(res => setResolvedUrl(res.data.url))
                    .catch(() => setResolvedUrl(false));
            }
        } else {
            setResolvedUrl(null);
        }
    }, [previewDoc]);

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (limit to 5MB for base64 storage)
        if (file.size > 5 * 1024 * 1024) {
            alert('حجم الملف كبير جداً. يرجى اختيار ملف أقل من 5 ميجابايت.');
            e.target.value = null;
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({
                ...formData,
                fileUrl: reader.result,
                fileName: file.name,
                title: formData.title || file.name.split('.')[0] // Auto-fill title if empty
            });
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.fileUrl) {
            alert('يرجى اختيار ملف أولاً');
            return;
        }

        setUploading(true);
        try {
            await axios.post(`${API_URL}/documents`, formData);
            setShowUpload(false);
            setFormData({ title: '', category: 'CONTRACT', fileUrl: '', fileName: '', partnerId: '', employeeId: '', projectId: '' });
            fetchDocuments();
            alert('✅ تم رفع المستند بنجاح');
        } catch (err) {
            alert('❌ فشل حفظ المستند');
        } finally {
            setUploading(false);
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

    const handleDownload = (doc) => {
        const urlToUse = doc.fileUrl || resolvedUrl;
        if (!urlToUse) return;

        if (urlToUse.startsWith('INTERNAL:')) {
            const [, type, id] = urlToUse.split(':');
            let path = '';
            if (type === 'INVOICE') path = `/invoices/${id}/print`;
            else if (type === 'QUOTE') path = `/quotes/${id}/print`;
            else path = `/archive/summary/${type}/${id}`;

            window.open(path, '_blank');
            return;
        }

        try {
            const splitUrl = urlToUse.split(',');
            if (splitUrl.length < 2) throw new Error('Invalid format');

            const byteString = atob(splitUrl[1]);
            const mimeString = splitUrl[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = doc.title + (mimeString === 'application/pdf' ? '.pdf' : '.png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            // Fallback for simple URLs
            const link = document.createElement('a');
            link.href = doc.fileUrl;
            link.download = doc.title;
            link.click();
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
            <div className="mobile-grid-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
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
                        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)', width: 'fit-content'
                    }}
                >
                    <Plus size={20} /> إضافة مستند جديد
                </button>
            </div>

            {/* Filters & Search */}
            <div className="mobile-grid-1" style={{ display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'center', background: 'white', padding: '15px', borderRadius: '15px', border: '1px solid #f1f5f9' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="بحث في المستندات..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 40px 10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'Cairo' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0', maxWidth: '100%' }}>
                    {Object.entries(categories).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            style={{
                                padding: '8px 16px', borderRadius: '8px', border: 'none',
                                background: filter === key ? '#eff6ff' : 'transparent',
                                color: filter === key ? '#2563eb' : '#64748b',
                                fontWeight: filter === key ? 'bold' : 'normal',
                                cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Documents Grid */}
            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
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

                        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f8fafc', paddingTop: '15px' }}>
                            <button onClick={() => setPreviewDoc(doc)} style={{ flex: 1.5, background: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 'bold' }}>
                                <Eye size={16} /> استعراض
                            </button>
                            <button onClick={() => handleDownload(doc)} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '10px', cursor: 'pointer' }} title="تحميل">
                                <Download size={16} />
                            </button>
                            <button onClick={() => handleDelete(doc.id)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #fee2e2', color: '#ef4444', background: '#fef2f2', cursor: 'pointer' }} title="حذف">
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
                    <div className="fade-in" style={{ background: 'white', padding: '30px', borderRadius: '24px', width: '500px', maxWidth: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h3 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Upload style={{ color: '#2563eb' }} size={24} /> رفع مستند جديد
                            </h3>
                            <button onClick={() => setShowUpload(false)} style={{ background: '#f1f5f9', border: 'none', padding: '5px', borderRadius: '50%', cursor: 'pointer' }}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', fontWeight: '500', color: '#475569' }}>الملف</label>
                                <div style={{
                                    border: '2px dashed #e2e8f0',
                                    padding: '25px',
                                    borderRadius: '16px',
                                    textAlign: 'center',
                                    position: 'relative',
                                    background: formData.fileUrl ? '#f0fdf4' : '#f8fafc',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {!formData.fileUrl ? (
                                        <>
                                            <Upload size={32} color="#94a3b8" style={{ marginBottom: '10px' }} />
                                            <p style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '0.9rem' }}>اسحب ملف هنا أو اضغط للاختيار</p>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                accept="image/*,.pdf"
                                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>الحد الأقصى: 5 ميجابايت (PDF, JPG, PNG)</span>
                                        </>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#16a34a' }}>
                                            <Check size={20} />
                                            <span style={{ fontWeight: '500' }}>{formData.fileName}</span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, fileUrl: '', fileName: '' })}
                                                style={{ background: '#fee2e2', border: 'none', padding: '4px', borderRadius: '50%', cursor: 'pointer', color: '#ef4444' }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

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

                            <div style={{ marginBottom: '15px' }}>
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

                            <div className="mobile-grid-1" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowUpload(false)}
                                    disabled={uploading}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#64748b' }}
                                >إلغاء</button>
                                <button
                                    type="submit"
                                    disabled={uploading || !formData.fileUrl}
                                    style={{
                                        flex: 2, padding: '12px', borderRadius: '12px', border: 'none',
                                        background: uploading ? '#94a3b8' : '#2563eb',
                                        color: 'white', fontWeight: 'bold', cursor: uploading ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                    }}
                                >
                                    {uploading ? 'جاري الرفع...' : 'حفظ المستند'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Preview Modal */}
            {previewDoc && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
                    <div className="fade-in" style={{ background: 'white', borderRadius: '24px', width: '90%', maxWidth: '1000px', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div className="mobile-grid-1" style={{ padding: '20px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', gap: '15px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>{previewDoc.title}</h3>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{categories[previewDoc.category]} - {new Date(previewDoc.createdAt).toLocaleDateString('ar-SA')}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                <button onClick={() => handleDownload(previewDoc)} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                    <Download size={18} /> تحميل
                                </button>
                                <button
                                    onClick={() => {
                                        const currentUrl = previewDoc.fileUrl || resolvedUrl;
                                        if (currentUrl && currentUrl.startsWith('INTERNAL:')) {
                                            const iframe = document.getElementById('preview-iframe');
                                            if (iframe) {
                                                iframe.contentWindow.focus();
                                                iframe.contentWindow.print();
                                            }
                                        } else {
                                            window.print();
                                        }
                                    }}
                                    style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: 'bold', fontSize: '0.85rem' }}
                                >
                                    <Printer size={18} /> طباعة
                                </button>
                                <button onClick={() => setPreviewDoc(null)} style={{ background: '#ef4444', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', color: 'white' }}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div style={{ flex: 1, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '20px' }}>
                            {(() => {
                                const currentUrl = previewDoc.fileUrl || resolvedUrl;

                                if (currentUrl && currentUrl.startsWith('INTERNAL:')) {
                                    const [, type, id] = currentUrl.split(':');
                                    let path = '';
                                    if (type === 'INVOICE') path = `/invoices/${id}/print?hideToolbar=true`;
                                    else if (type === 'QUOTE') path = `/quotes/${id}/print?hideToolbar=true`;
                                    else path = `/archive/summary/${type}/${id}?hideToolbar=true`;

                                    return (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ background: '#fffbeb', padding: '10px', borderRadius: '8px', border: '1px solid #fef3c7', color: '#b45309', fontSize: '0.85rem', marginBottom: '10px', textAlign: 'center' }}>
                                                📄 هذا سجل بيانات مستخرج من النظام. يمكنك عرضه وطباعته مباشرة.
                                            </div>
                                            <iframe
                                                id="preview-iframe"
                                                src={path}
                                                style={{ width: '100%', flex: 1, border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', background: 'white' }}
                                                title="System Preview"
                                            />
                                        </div>
                                    );
                                }

                                if (!previewDoc.fileUrl && resolvedUrl === null) {
                                    return <div style={{ color: '#64748b' }}>⏳ جاري جلب تفاصيل المستند...</div>;
                                }

                                if (previewDoc.fileUrl) {
                                    return previewDoc.fileUrl.includes('application/pdf') ? (
                                        <iframe
                                            src={previewDoc.fileUrl}
                                            style={{ width: '100%', height: '100%', borderRadius: '12px', shadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            title="File Preview"
                                        />
                                    ) : (
                                        <img
                                            src={previewDoc.fileUrl}
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            alt="File Preview"
                                        />
                                    );
                                }

                                return (
                                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                        <FileText size={64} style={{ opacity: 0.2, marginBottom: '20px' }} />
                                        <p>عذراً، هذا المستند لا يحتوي على ملف للعرض.</p>
                                        <p style={{ fontSize: '0.8rem' }}>قد يكون هذا السجل مرجعياً فقط أو قديماً.</p>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsPage;
