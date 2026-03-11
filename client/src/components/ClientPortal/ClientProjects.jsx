import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Calendar, CheckCircle2, ChevronDown, ChevronUp, MapPin, Activity, Building2, FileImage, FileText, Star, ThumbsUp } from 'lucide-react';
import API_URL from '@/config';

const ClientProjects = () => {
    const [projects, setProjects] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedProject, setExpandedProject] = useState(null);
    const [projectDetails, setProjectDetails] = useState({}); // Cache for details
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/client-portal/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(res.data);
            if (res.data.length > 0 && res.data[0].permissions) {
                setPermissions(res.data[0].permissions);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExpandProject = async (projectId) => {
        if (expandedProject === projectId) {
            setExpandedProject(null);
            return;
        }

        setExpandedProject(projectId);

        if (!projectDetails[projectId]) {
            try {
                setLoadingDetails(true);
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/client-portal/projects/${projectId}/field-updates`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProjectDetails(prev => ({ ...prev, [projectId]: res.data }));
                if (res.data.permissions) setPermissions(res.data.permissions);
            } catch (error) {
                console.error('Error fetching project details:', error);
            } finally {
                setLoadingDetails(false);
            }
        }
    };

    const submitRating = async (visitId, engineerId, rating) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/client-portal/rate`, {
                visitId,
                engineerId,
                rating
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ شكرًا لتقييمك! ' + res.data.message);

            // Update local project details to show the new rating
            setProjectDetails(prev => {
                const details = { ...prev };
                if (details[expandedProject]) {
                    details[expandedProject].visits = details[expandedProject].visits.map(v =>
                        v.id === visitId ? { ...v, rating } : v
                    );
                }
                return details;
            });
        } catch (error) {
            console.error('Rating error:', error);
            alert('❌ فشل إرسال التقييم');
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>جاري تحميل قائمة المشاريع...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>مشاريعي ومتابعة الإنجاز</h2>

            {projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                    <Briefcase size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>لا توجد مشاريع حالية</h3>
                    <p>لم يتم ربط أي مشاريع نشطة بحسابك حتى الآن.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {projects.map((project) => (
                        <div key={project.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: expandedProject === project.id ? '0 10px 25px -5px rgba(0,0,0,0.1)' : '0 1px 3px 0 rgba(0,0,0,0.1)', transition: 'all 0.3s ease' }}>
                            {/* Header / Summary */}
                            <div
                                onClick={() => handleExpandProject(project.id)}
                                style={{ padding: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: expandedProject === project.id ? '#f8fafc' : '#fff' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{project.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: '#64748b' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> تبدأ: {new Date(project.startDate).toLocaleDateString()}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Activity size={14} /> الحالة:
                                                <span style={{ color: project.status === 'IN_PROGRESS' ? '#2563eb' : '#f59e0b', fontWeight: 'bold' }}>{project.status === 'IN_PROGRESS' ? 'قيد التنفيذ' : project.status}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div style={{ textAlign: 'left', minWidth: '120px' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>نسبة الإنجاز (AI)</div>
                                        {permissions.trackProjects !== false && project.progress !== null ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${project.progress}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
                                                </div>
                                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#10b981' }}>{project.progress}%</span>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{permissions.trackProjects === false ? 'محجوبة' : 'غير متوفرة'}</span>
                                        )}
                                    </div>
                                    {expandedProject === project.id ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
                                </div>
                            </div>

                            {/* Details Expanded Section */}
                            <AnimatePresence>
                                {expandedProject === project.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden', borderTop: '1px solid #e2e8f0' }}
                                    >
                                        <div style={{ padding: '24px', background: '#fff' }}>
                                            {loadingDetails && !projectDetails[project.id] ? (
                                                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>يتم جلب سجل الميدان...</div>
                                            ) : (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>

                                                    {/* Reports/Tasks Column */}
                                                    <div>
                                                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <CheckCircle2 size={18} color="#2563eb" /> التقارير الميدانية المعتمدة
                                                        </h4>
                                                        {projectDetails[project.id]?.tasks?.length > 0 ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                {projectDetails[project.id].tasks.map(task => (
                                                                    <div key={task.id} style={{ padding: '16px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#f8fafc' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                                            <strong>{task.title}</strong>
                                                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(task.createdAt).toLocaleDateString()}</span>
                                                                        </div>
                                                                        <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '12px' }}>مرحلة: {task.phase || 'عام'}</div>

                                                                        {/* Embedded AI findings for the client */}
                                                                        {permissions.viewAI !== false && task.aiReports?.length > 0 && (
                                                                            <div style={{ marginTop: '12px', padding: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '0.85rem' }}>
                                                                                <strong style={{ color: '#065f46', display: 'block', marginBottom: '4px' }}>تحليل الذكاء الاصطناعي الأخير:</strong>
                                                                                <p style={{ margin: 0, color: '#047857' }}>نسبة إنجاز المرحلة: {task.aiReports[0].progressExtracted || 0}%</p>
                                                                                {task.aiReports[0].sbcViolations && <p style={{ margin: '4px 0 0 0', color: '#b91c1c' }}>ملاحظات: {task.aiReports[0].sbcViolations}</p>}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>لم يتم رفع تقارير مهام ميدانية بعد.</div>
                                                        )}
                                                    </div>

                                                    {/* Site Visits Column */}
                                                    <div>
                                                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <MapPin size={18} color="#f59e0b" /> زيارات الموقع وتقييم المهندسين
                                                        </h4>
                                                        {projectDetails[project.id]?.visits?.length > 0 ? (
                                                            <div style={{ position: 'relative', paddingRight: '12px', borderRight: '2px solid #e2e8f0' }}>
                                                                {projectDetails[project.id].visits.map((visit, idx) => (
                                                                    <div key={visit.id} style={{ position: 'relative', marginBottom: idx === projectDetails[project.id].visits.length - 1 ? 0 : '24px' }}>
                                                                        <div style={{ position: 'absolute', right: '-18px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#fff', border: '2px solid #f59e0b' }} />
                                                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                                                            <span>{new Date(visit.date).toLocaleDateString()} - م. {visit.engineer?.name}</span>
                                                                        </div>
                                                                        <div style={{ fontSize: '0.9rem', color: '#1e293b', background: '#fef3c7', padding: '12px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                                                                            {visit.notes || 'زيارة إشرافية عامة.'}

                                                                            {/* Rating UI */}
                                                                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #fcd34d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e' }}>
                                                                                    {permissions.canRate !== false ? 'قيم أداء المهندس في هذه الزيارة:' : 'التقييمات معطلة حالياً'}
                                                                                </span>
                                                                                {permissions.canRate !== false && (
                                                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                                                        {[1, 2, 3, 4, 5].map(star => (
                                                                                            <button
                                                                                                key={star}
                                                                                                onClick={() => submitRating(visit.id, visit.engineerId, star)}
                                                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                                                            >
                                                                                                <Star size={18} fill={star <= (visit.rating || 0) ? "#f59e0b" : "none"} color="#f59e0b" />
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>لم تسجل زيارات ميدانية للموقع بعد.</div>
                                                        )}
                                                    </div>

                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientProjects;
