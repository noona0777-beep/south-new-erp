import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Search, FileCode, FileImage, ExternalLink, Calendar, Briefcase } from 'lucide-react';
import API_URL from '@/config';

const ClientDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/client-portal/documents`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocuments(res.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDocs = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.project?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getFileIcon = (category) => {
        switch (category) {
            case 'CONTRACT': return <FileText size={24} color="#3b82f6" />;
            case 'REPORT': return <FileCode size={24} color="#10b981" />;
            case 'DESIGN': return <FileImage size={24} color="#f59e0b" />;
            default: return <FileText size={24} color="#64748b" />;
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>جاري تحميل الأرشيف...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>مستنداتي وأرشيف العقد</h2>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder="ابحث عن مستند أو مشروع..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'Cairo' }}
                    />
                </div>
            </div>

            {filteredDocs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
                    <FileText size={56} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <h3 style={{ fontSize: '1.2rem', color: '#64748b' }}>لم يتم العثور على أي مستندات</h3>
                    <p style={{ color: '#94a3b8' }}>المستندات الرسمية، المخططات، والتقارير ستظهر هنا بمجرد رفعها.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {filteredDocs.map((doc) => (
                        <div key={doc.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#3b82f640' }} />
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {getFileIcon(doc.category)}
                                </div>
                                <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '20px', background: '#eff6ff', color: '#3b82f6', fontWeight: 600 }}>
                                    {doc.category}
                                </span>
                            </div>

                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {doc.title}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                                    <Briefcase size={14} /> {doc.project?.name || 'مستند عام'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                                    <Calendar size={14} /> {new Date(doc.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <a 
                                href={doc.fileUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '8px', 
                                    width: '100%', 
                                    padding: '12px', 
                                    background: '#1e293b', 
                                    color: '#fff', 
                                    borderRadius: '10px', 
                                    textDecoration: 'none', 
                                    fontSize: '0.9rem', 
                                    fontWeight: 600,
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#0f172a'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#1e293b'}
                            >
                                <ExternalLink size={16} /> فتح المستند
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientDocuments;
