import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FileText, Download, Search, FileCode, FileImage, 
    ExternalLink, Calendar, Briefcase, FolderOpen, 
    ShieldCheck, Filter, LayoutGrid, List, File
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '@/config';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

const ClientDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // grid or list

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

    const getFileDetails = (category) => {
        switch (category) {
            case 'CONTRACT': return { icon: FileText, color: '#6366f1', label: 'عقد رسمي' };
            case 'REPORT': return { icon: FileCode, color: '#10b981', label: 'تقرير ميداني' };
            case 'DESIGN': return { icon: FileImage, color: '#f59e0b', label: 'مخطط هندسي' };
            default: return { icon: File, color: '#71717a', label: 'مستند عام' };
        }
    };

    if (loading) return (
        <div style={{ padding: '80px', textAlign: 'center', color: '#71717a' }}>
            <FolderOpen className="animate-pulse" size={48} style={{ margin: '0 auto 20px', color: '#6366f1' }} />
            <h3 style={{ color: '#fff', fontWeight: '800' }}>جاري استرجاع مستندات الأرشيف...</h3>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '900', color: '#fff' }} className="gradient-text">خزانة الوثائق السحابية</h2>
                    <p style={{ margin: '5px 0 0 0', fontSize: '1rem', color: '#a1a1aa', fontWeight: '600' }}>الوصول الآمن لعقودك، المخططات الهندسية، والتقارير الفنية الموثقة.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '5px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewMode('grid')}
                            style={{ padding: '8px 15px', borderRadius: '10px', background: viewMode === 'grid' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: viewMode === 'grid' ? '#818cf8' : '#52525b', border: 'none', cursor: 'pointer' }}
                        >
                            <LayoutGrid size={18} />
                        </motion.button>
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewMode('list')}
                            style={{ padding: '8px 15px', borderRadius: '10px', background: viewMode === 'list' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: viewMode === 'list' ? '#818cf8' : '#52525b', border: 'none', cursor: 'pointer' }}
                        >
                            <List size={18} />
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                    <input 
                        placeholder="البحث في عناوين المستندات أو أسماء المشاريع..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="premium-input"
                        style={{ width: '100%', paddingRight: '45px', background: 'transparent', border: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px', color: '#71717a', fontSize: '0.85rem', fontWeight: '800' }}>
                    <Filter size={16} /> تصفية النتائج
                </div>
            </div>

            {filteredDocs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '2px dashed rgba(255,255,255,0.05)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', color: '#52525b' }}>
                         <FolderOpen size={40} />
                    </div>
                    <h3 style={{ color: '#fff', fontWeight: '900', fontSize: '1.4rem' }}>لا توجد وثائق مؤرشفة حالياً</h3>
                    <p style={{ color: '#71717a', fontSize: '1rem', maxWidth: '500px', margin: '10px auto', fontWeight: '600' }}>بمجرد اعتماد العقود أو المخططات الخاصة بك، ستظهر بشكل تلقائي في هذه المساحة.</p>
                </div>
            ) : (
                <div style={{ display: viewMode === 'grid' ? 'grid' : 'flex', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', flexDirection: 'column', gap: '25px' }}>
                    {filteredDocs.map((doc, idx) => {
                        const file = getFileDetails(doc.category);
                        const Icon = file.icon;
                        
                        return (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                                className="glass-card"
                                style={{ 
                                    padding: '25px', 
                                    borderRadius: '28px', 
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    flexDirection: viewMode === 'grid' ? 'column' : 'row',
                                    alignItems: viewMode === 'grid' ? 'stretch' : 'center',
                                    gap: '20px',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ 
                                    width: '60px', height: '60px', borderRadius: '20px', 
                                    background: `${file.color}15`, color: file.color, 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Icon size={28} />
                                </div>
                                
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div className="status-pill" style={{ background: 'rgba(255,255,255,0.03)', color: '#71717a', fontSize: '0.7rem', padding: '4px 12px' }}>
                                            {file.label}
                                        </div>
                                        {viewMode === 'grid' && <span style={{ fontSize: '0.8rem', color: '#52525b', fontWeight: '800' }}>{new Date(doc.createdAt).toLocaleDateString('ar-SA')}</span>}
                                    </div>
                                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: '900', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{doc.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#71717a', fontSize: '0.85rem', marginTop: '8px', fontWeight: '700' }}>
                                        <Briefcase size={14} /> {doc.project?.name || 'مستند عام موثق'}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: viewMode === 'grid' ? '20px' : 0 }}>
                                    <motion.a 
                                        {...buttonClick}
                                        href={doc.fileUrl} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        style={{ 
                                            flex: 1, 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                            padding: '12px', background: 'rgba(255,255,255,0.03)', color: '#fff',
                                            borderRadius: '14px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '800',
                                            border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'Cairo'
                                        }}
                                    >
                                        <ExternalLink size={16} /> فتح
                                    </motion.a>
                                    <motion.a 
                                        {...buttonClick}
                                        href={doc.fileUrl} 
                                        download
                                        style={{ 
                                            padding: '12px 20px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                                            color: '#fff', borderRadius: '14px', textDecoration: 'none', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        <Download size={18} />
                                    </motion.a>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ClientDocuments;
