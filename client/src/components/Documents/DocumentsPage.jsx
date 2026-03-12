import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Folder, File, FileText, Plus, Trash2,
    Download, ExternalLink, Filter, Search,
    User, Briefcase, Users, Upload, X, Check, Eye, Printer, Clock, AlertOctagon,
    RefreshCw, HardHat, FileBadge, Archive, CheckCircle2, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '@/config';
import { useToast } from '../../context/ToastContext';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const DocumentsPage = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [showUpload, setShowUpload] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [uploading, setUploading] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [resolvedUrl, setResolvedUrl] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '', category: 'CONTRACT', fileUrl: '', fileName: '',
        partnerId: '', employeeId: '', projectId: '', constructionContractId: ''
    });

    // Queries
    const { data: documents = [], isLoading: docsLoading, error: docsError } = useQuery({
        queryKey: ['documents'],
        queryFn: async () => (await axios.get(`${API_URL}/documents`, { headers: H() })).data
    });

    const { data: partners = [] } = useQuery({ queryKey: ['partners'], queryFn: async () => (await axios.get(`${API_URL}/partners`, { headers: H() })).data });
    const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: async () => (await axios.get(`${API_URL}/employees`, { headers: H() })).data });
    const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: async () => (await axios.get(`${API_URL}/projects`, { headers: H() })).data });
    const { data: contracts = [] } = useQuery({ queryKey: ['construction-contracts'], queryFn: async () => (await axios.get(`${API_URL}/construction-contracts`, { headers: H() })).data });

    // Document Resolver Logic
    useEffect(() => {
        if (previewDoc && !previewDoc.fileUrl) {
            setResolvedUrl(null);
            if (previewDoc.partnerId && previewDoc.title.includes('العميل')) {
                setResolvedUrl(`INTERNAL:CLIENT:${previewDoc.partnerId}`);
            } else if (previewDoc.projectId && previewDoc.title.includes('المشروع')) {
                setResolvedUrl(`INTERNAL:PROJECT:${previewDoc.projectId}`);
            } else if (previewDoc.employeeId && previewDoc.title.includes('الموظف')) {
                setResolvedUrl(`INTERNAL:EMPLOYEE:${previewDoc.employeeId}`);
            } else {
                axios.get(`${API_URL}/resolve-document?title=${encodeURIComponent(previewDoc.title)}`, { headers: H() })
                    .then(res => setResolvedUrl(res.data.url))
                    .catch(() => setResolvedUrl(false));
            }
        } else {
            setResolvedUrl(null);
        }
    }, [previewDoc]);

    // Mutations
    const createDocMutation = useMutation({
        mutationFn: async (data) => await axios.post(`${API_URL}/documents`, data, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            showToast('تمت أرشفة المستند بنجاح', 'success');
            setShowUpload(false);
            setUploading(false);
            setFormData({
                title: '', category: 'CONTRACT', fileUrl: '', fileName: '',
                partnerId: '', employeeId: '', projectId: '', constructionContractId: ''
            });
        },
        onError: () => {
            setUploading(false);
            showToast('خطأ أثناء الأرشفة', 'error');
        }
    });

    const deleteDocMutation = useMutation({
        mutationFn: async (id) => await axios.delete(`${API_URL}/documents/${id}`, { headers: H() }),
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['documents'] });
             showToast('تم حذف المستند بنجاح', 'success');
        }
    });

    const categories = {
        'ALL': 'خزنة الأرشيف',
        'CONTRACT': 'العقود الرسمية',
        'ID': 'الثبوتيات والوثائق',
        'LICENSE': 'التراخيص الهندسية',
        'OTHER': 'أخرى'
    };

    const filteredDocs = documents.filter(doc => {
        const matchesFilter = filter === 'ALL' || doc.category === filter;
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="fade-in" style={{ direction: 'rtl' }}>
             {/* Header */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '45px' }}>
                <div>
                    <h2 style={{ margin: '0 0 12px 0', fontSize: '2.8rem', fontWeight: '900', color: '#fff' }} className="gradient-text">الأرشيف السحابي الذكي</h2>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '1.1rem', fontWeight: '600' }}>أرشفة وتصنيف الوثائق، العقود، والتراخيص بنظام تشفـير متكامل.</p>
                </div>
                <div style={{ display: 'flex', gap: '18px' }}>
                    <motion.button {...buttonClick} onClick={() => setShowUpload(true)} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '14px 35px', borderRadius: '20px', cursor: 'pointer', fontWeight: '900', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 15px 35px rgba(99,102,241,0.3)' }}>
                        <Upload size={22} /> أرشفة مستند جديـد
                    </motion.button>
                </div>
            </div>

            {/* Filters & Navigation */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="glass-card" style={{ display: 'inline-flex', padding: '6px', borderRadius: '20px', gap: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {Object.entries(categories).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            style={{
                                padding: '12px 25px', borderRadius: '14px', border: 'none',
                                background: filter === key ? 'rgba(99,102,241,0.15)' : 'transparent',
                                color: filter === key ? '#fff' : '#71717a',
                                fontWeight: '900', cursor: 'pointer', transition: 'all 0.3s'
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div style={{ position: 'relative', flex: 1, minWidth: '350px' }}>
                        <Search size={22} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                        <input 
                            type="text" 
                            placeholder="بحث في الأرشيف (باسم المستند، الوصف، أو الطرف المربوط)..." 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            className="premium-input" 
                            style={{ width: '100%', paddingRight: '50px', border: 'none' }} 
                        />
                </div>
            </div>

            {/* Stats Dashboard (Mini) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '45px' }}>
                {[
                    { label: 'إجمالي الوثائق', value: documents.length, icon: <FileBadge size={28} />, color: '#6366f1' },
                    { label: 'عقود نشطة', value: documents.filter(d => d.category === 'CONTRACT').length, icon: <CheckCircle2 size={28} />, color: '#10b981' },
                    { label: 'المساحة المستخدمة', value: '4.2 GB', icon: <Archive size={28} />, color: '#f59e0b' },
                ].map((s, i) => (
                    <motion.div key={i} className="glass-card" style={{ padding: '25px 30px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                         <div style={{ background: `${s.color}15`, padding: '15px', borderRadius: '18px', color: s.color }}>{s.icon}</div>
                         <div>
                            <div style={{ fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '800' }}>{s.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>{s.value}</div>
                         </div>
                    </motion.div>
                ))}
            </div>

            {/* Document Collection (Grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                {docsLoading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '150px' }}><RefreshCw className="animate-spin" size={60} style={{ color: '#6366f1' }} /></div>
                ) : filteredDocs.map((doc, idx) => (
                    <motion.div 
                        key={doc.id} 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: idx * 0.05 }}
                        className="glass-card card-hover" 
                        style={{ padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}
                    >
                         <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
                            <div style={{ 
                                width: '60px', height: '60px', borderRadius: '20px', 
                                background: doc.category === 'CONTRACT' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                color: doc.category === 'CONTRACT' ? '#ef4444' : '#6366f1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 10px 20px \${doc.category === 'CONTRACT' ? '#ef4444' : '#6366f1'}15`
                            }}>
                                {doc.category === 'CONTRACT' ? <FileText size={30} /> : <File size={30} />}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#fff', fontWeight: '900', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{doc.title}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: '700' }}>{new Date(doc.createdAt).toLocaleDateString('ar-SA')}</span>
                                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#52525b' }} />
                                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: '800' }}>{categories[doc.category]}</span>
                                </div>
                            </div>
                         </div>

                         <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {doc.partner && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '700', padding: '10px 15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                    <Users size={16} color="#10b981" /> {doc.partner.name}
                                </div>
                            )}
                            {doc.project && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '700', padding: '10px 15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                    <HardHat size={16} color="#f59e0b" /> {doc.project.name}
                                </div>
                            )}
                            {doc.constructionContract && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#6366f1', fontWeight: '900', padding: '10px 15px', background: 'rgba(99,102,241,0.05)', borderRadius: '12px' }}>
                                    <FileBadge size={16} /> كود العقد: {doc.constructionContract.contractNumber}
                                </div>
                            )}
                         </div>

                         <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setPreviewDoc(doc)} style={{ flex: 2, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(99,102,241,0.15)' }}>
                                <Eye size={18} /> استعراض
                            </button>
                            <button onClick={() => deleteDocMutation.mutate(doc.id)} style={{ padding: '12px', borderRadius: '15px', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', cursor: 'pointer' }}>
                                <Trash2 size={20} />
                            </button>
                            <button style={{ padding: '12px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', color: '#a1a1aa', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                                <MoreVertical size={20} />
                            </button>
                         </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default DocumentsPage;
