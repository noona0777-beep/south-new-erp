import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, Calendar, CheckCircle2, ChevronDown, ChevronUp, 
    MapPin, Activity, Building2, FileImage, FileText, Star, 
    ThumbsUp, Globe, Clock, ShieldCheck, Zap, Info,
    LayoutGrid, ArrowUpRight, LocateFixed, Sparkles, Search
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API_URL from '@/config';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ClientProjects = () => {
    const [projects, setProjects] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedProject, setExpandedProject] = useState(null);
    const [projectDetails, setProjectDetails] = useState({}); 
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

    if (loading) return (
        <div style={{ padding: '80px', textAlign: 'center', color: '#71717a' }}>
            <Activity className="animate-spin" size={48} style={{ margin: '0 auto 20px', color: '#6366f1' }} />
            <h3 style={{ color: '#fff', fontWeight: '800' }}>جاري استرداد سجلات مشاريعك...</h3>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '900', color: '#fff' }} className="gradient-text">مشاريعي والتقدم الإنشائي</h2>
                    <p style={{ margin: '5px 0 0 0', fontSize: '1rem', color: '#a1a1aa', fontWeight: '600' }}>تتبع مراحل التنفيذ، التقارير الميدانية، والجدول الزمني لأعمالك.</p>
                </div>
            </div>

            {projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '2px dashed rgba(255,255,255,0.05)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', color: '#52525b' }}>
                         <Briefcase size={40} />
                    </div>
                    <h3 style={{ color: '#fff', fontWeight: '900', fontSize: '1.4rem' }}>لا توجد مشاريع نشطة حالياً</h3>
                    <p style={{ color: '#71717a', fontSize: '1rem', maxWidth: '500px', margin: '10px auto', fontWeight: '600' }}>لم يتم ربط أي مشاريع إنشائية بحسابك الموثق حتى هذه اللحظة.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {projects.map((project, idx) => (
                        <motion.div 
                            key={project.id} 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card" 
                            style={{ borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                            <div 
                                onClick={() => handleExpandProject(project.id)}
                                style={{ padding: '35px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                                    <div style={{ width: '65px', height: '65px', borderRadius: '22px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Building2 size={30} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>{project.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.9rem', color: '#71717a', marginTop: '6px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}><Calendar size={14} /> بدء المشروع: {new Date(project.startDate).toLocaleDateString('ar-SA')}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: project.status === 'IN_PROGRESS' ? '#6366f1' : '#f59e0b' }}>
                                                <Activity size={14} /> منصة التنفيذ: {project.status === 'IN_PROGRESS' ? 'مستمر حالياً' : project.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                                    <div style={{ textAlign: 'left', minWidth: '180px' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: '900', marginBottom: '8px', letterSpacing: '1px' }}>الإنجاز المرحلي التراكمي</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '5px', overflow: 'hidden' }}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress || 0}%` }} transition={{ duration: 1, ease: 'easeOut' }} style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #06b6d4)', borderRadius: '5px' }} />
                                            </div>
                                            <span style={{ fontWeight: '900', fontSize: '1.1rem', color: '#fff' }}>{project.progress || 0}%</span>
                                        </div>
                                    </div>
                                    <motion.div animate={{ rotate: expandedProject === project.id ? 180 : 0 }} style={{ color: '#52525b' }}>
                                        <ChevronDown size={24} />
                                    </motion.div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedProject === project.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        <div style={{ padding: '40px', background: 'rgba(255,255,255,0.01)' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>
                                                
                                                {/* Left: General Updates */}
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <Zap size={20} color="#6366f1" /> التقارير الهندسية والميدانية المعتمدة
                                                        </h4>
                                                    </div>
                                                    
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                        {projectDetails[project.id]?.tasks?.length > 0 ? (
                                                            projectDetails[project.id].tasks.map((task, tidx) => (
                                                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: tidx * 0.1 }} key={task.id} className="glass-card" style={{ padding: '25px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                                        <div style={{ fontWeight: '900', color: '#fff', fontSize: '1.1rem' }}>{task.title}</div>
                                                                        <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: '700' }}>{new Date(task.createdAt).toLocaleDateString('ar-SA')}</div>
                                                                    </div>
                                                                    <div style={{ fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '600', marginBottom: '20px' }}>المرحلة المستهدفة: {task.phase || 'عام'}</div>
                                                                    
                                                                    {permissions.viewAI !== false && task.aiReports?.length > 0 && (
                                                                        <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '18px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontWeight: '900', fontSize: '0.9rem', marginBottom: '10px' }}>
                                                                                <Sparkles size={16} /> كاشف الذكاء الاصطناعي (AI Analysis)
                                                                            </div>
                                                                            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.6' }}>تم تحليل الصور المرفقة لهذا البند، ونسبة الإنجاز المستخلصة تقنياً هي <span style={{ color: '#fff', fontWeight: '900' }}>{task.aiReports[0].progressExtracted || 0}%</span>.</p>
                                                                            {task.aiReports[0].sbcViolations && (
                                                                                <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '10px', color: '#fca5a5', fontSize: '0.85rem', fontWeight: '700' }}>
                                                                                    ⚠️ ملاحظة فنية: {task.aiReports[0].sbcViolations}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            ))
                                                        ) : (
                                                            <div style={{ textAlign: 'center', padding: '50px', color: '#52525b', fontSize: '0.9rem' }}>لا توجد تقارير مهام ميدانية مفصلة لهذا المشروع.</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right: Visits & Timeline */}
                                                <div>
                                                    <h4 style={{ margin: '0 0 25px 0', color: '#fff', fontSize: '1.2rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <LocateFixed size={20} color="#f59e0b" /> جدول الزيارات الفنية والتقييم
                                                    </h4>
                                                    
                                                    <div style={{ position: 'relative', borderRight: '2px solid rgba(255,255,255,0.05)', paddingRight: '25px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                                        {projectDetails[project.id]?.visits?.length > 0 ? (
                                                            projectDetails[project.id].visits.map((visit, vidx) => (
                                                                <div key={visit.id} style={{ position: 'relative' }}>
                                                                    <div style={{ position: 'absolute', right: '-33px', top: '5px', width: '14px', height: '14px', borderRadius: '50%', background: '#09090b', border: '3px solid #f59e0b' }} />
                                                                    <div style={{ color: '#71717a', fontSize: '0.85rem', fontWeight: '800', marginBottom: '8px' }}>{new Date(visit.date).toLocaleDateString('ar-SA')} - م. {visit.engineer?.name}</div>
                                                                    <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                                                                        <div style={{ fontSize: '0.95rem', color: '#fff', lineHeight: '1.6', fontWeight: '600', marginBottom: '15px' }}>{visit.notes || 'زيارة إشرافية روتينية للتأكد من سير الأعمال.'}</div>
                                                                        
                                                                        <div style={{ borderTop: '1px dashed rgba(245, 158, 11, 0.2)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#f59e0b', letterSpacing: '1px' }}>تقييمك للزيارة</span>
                                                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                                                {[1, 2, 3, 4, 5].map(star => (
                                                                                    <Star key={star} size={16} fill={star <= (visit.rating || 0) ? "#f59e0b" : "none"} color={star <= (visit.rating || 0) ? "#f59e0b" : "#52525b"} />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div style={{ padding: '20px', color: '#52525b', fontSize: '0.9rem' }}>لم تسجل زيارات إشرافية حتى الآن.</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Map Branding */}
                                            {project.lat && project.lng && (
                                                <div style={{ marginTop: '50px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <Globe size={20} color="#06b6d4" /> التوثيق الجغرافي للمشروع (Satellite View)
                                                        </h4>
                                                        <div style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: '700' }}>إحداثيات دقيقة للموقع الميداني</div>
                                                    </div>
                                                    <div style={{ height: '400px', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                                        <MapContainer 
                                                            center={[project.lat, project.lng]} 
                                                            zoom={16} 
                                                            style={{ height: '100%', width: '100%' }}
                                                            zoomControl={false}
                                                        >
                                                            <ZoomControl position="topright" />
                                                            <TileLayer 
                                                                url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" 
                                                                attribution='&copy; Google Maps' 
                                                            />
                                                            <Marker position={[project.lat, project.lng]}>
                                                                <Popup>{project.name}</Popup>
                                                            </Marker>
                                                        </MapContainer>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientProjects;
