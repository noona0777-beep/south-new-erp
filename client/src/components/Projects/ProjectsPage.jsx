import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '@/config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Plus, Briefcase, Calendar, MapPin, User, CheckSquare, Clock, 
    AlertCircle, Folder, AlertOctagon, Map as MapIcon, Globe, 
    ChevronLeft, LayoutGrid, Search, Download, Trash2, Edit3, 
    CheckCircle2, TrendingUp, BarChart3, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const ProjectsPage = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

    // Form State for Project
    const [projectData, setProjectData] = useState({
        name: '', description: '', partnerId: '', location: '',
        lat: '', lng: '',
        startDate: new Date().toISOString().split('T')[0], endDate: '',
        budget: 0, status: 'PLANNED'
    });

    // Form State for Task
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [taskData, setTaskData] = useState({
        title: '', description: '', status: 'TODO', priority: 'MEDIUM', assignedTo: '', dueDate: ''
    });

    // Queries
    const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => (await axios.get(`${API_URL}/projects`)).data
    });

    const { data: partners = [] } = useQuery({
        queryKey: ['partners'],
        queryFn: async () => (await axios.get(`${API_URL}/partners`)).data
    });

    const { data: tasks = [], isLoading: tasksLoading } = useQuery({
        queryKey: ['tasks', selectedProject?.id],
        queryFn: async () => (await axios.get(`${API_URL}/projects/${selectedProject.id}/tasks`)).data,
        enabled: !!selectedProject
    });

    // Mutations
    const createProjectMutation = useMutation({
        mutationFn: async (data) => await axios.post(`${API_URL}/projects`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setShowForm(false);
            setProjectData({
                name: '', description: '', partnerId: '', location: '',
                lat: '', lng: '',
                startDate: new Date().toISOString().split('T')[0], endDate: '',
                budget: 0, status: 'PLANNED'
            });
        }
    });

    const createTaskMutation = useMutation({
        mutationFn: async (data) => await axios.post(`${API_URL}/tasks`, { ...data, projectId: selectedProject.id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject?.id] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setShowTaskForm(false);
            setTaskData({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', assignedTo: '', dueDate: '' });
        }
    });

    const updateTaskStatusMutation = useMutation({
        mutationFn: async ({ taskId, status }) => await axios.patch(`${API_URL}/tasks/${taskId}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject?.id] });
        }
    });

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PLANNED': return { label: 'مخطط له', class: 'status-pending' };
            case 'ACTIVE': return { label: 'نشط حالياً', class: 'status-paid' };
            case 'COMPLETED': return { label: 'منتهي', class: 'status-paid' };
            case 'ON_HOLD': return { label: 'متوقف', class: 'status-cancelled' };
            default: return { label: status, class: 'status-pending' };
        }
    };

    if (selectedProject) {
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <motion.button 
                    {...buttonClick}
                    onClick={() => setSelectedProject(null)} 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', marginBottom: '30px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Cairo' }}
                >
                    <ArrowRight size={18} /> العودة للوحة المشاريع والبحث
                </motion.button>

                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
                    {/* Project Details Sidebar */}
                    <div className="glass-card" style={{ padding: '35px', borderRadius: '32px' }}>
                        <div style={{ background: 'rgba(99,102,241,0.1)', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', marginBottom: '25px' }}>
                            <Briefcase size={32} />
                        </div>
                        <h2 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.8rem', fontWeight: '900' }}>{selectedProject.name}</h2>
                        <span className={`status-pill ${getStatusLabel(selectedProject.status).class}`} style={{ fontSize: '0.85rem', padding: '6px 16px', borderRadius: '12px' }}>
                            {getStatusLabel(selectedProject.status).label}
                        </span>

                        <div style={{ marginTop: '35px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#a1a1aa' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px' }}><User size={18} /></div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#71717a' }}>العميل المتعاقد</div>
                                    <div style={{ color: '#fff', fontWeight: '700' }}>{selectedProject.partner?.name || 'غير محدد'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#a1a1aa' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px' }}><MapPin size={18} /></div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#71717a' }}>موقع التنفيذ</div>
                                    <div style={{ color: '#fff', fontWeight: '700' }}>{selectedProject.location || 'غير محدد'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#a1a1aa' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px' }}><Calendar size={18} /></div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#71717a' }}>تاريخ البدء المعتمد</div>
                                    <div style={{ color: '#fff', fontWeight: '700' }}>{new Date(selectedProject.startDate).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '35px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#fff', fontWeight: '900' }}>نظرة عامة على المشروع</h4>
                            <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: '1.8', fontWeight: '500' }}>{selectedProject.description || 'لا يوجد وصف تفصيلي مسجل لهذا المشروع حالياً.'}</p>
                        </div>

                        {selectedProject.lat && selectedProject.lng && (
                            <div style={{ marginTop: '35px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ margin: '0 0 20px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '900' }}>
                                    <MapIcon size={20} color="#6366f1" /> الموقع الجغرافي (Satellite)
                                </h4>
                                <div style={{ height: '300px', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', zIndex: 0 }}>
                                    <MapContainer 
                                        center={[selectedProject.lat, selectedProject.lng]} 
                                        zoom={16} 
                                        style={{ height: '100%', width: '100%' }}
                                        zoomControl={false}
                                    >
                                        <ZoomControl position="topright" />
                                        <TileLayer 
                                            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" 
                                            attribution='&copy; Google Maps Satellite' 
                                        />
                                        <Marker position={[selectedProject.lat, selectedProject.lng]}>
                                            <Popup><b>{selectedProject.name}</b></Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tasks & Management */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div className="glass-card" style={{ padding: '30px', borderRadius: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: '900' }}>جدول المهام والمتابعة</h3>
                                    <p style={{ margin: '5px 0 0 0', color: '#71717a', fontSize: '0.9rem' }}>إدارة العمليات اليومية والمهام التنفيذية للمشروع</p>
                                </div>
                                <motion.button 
                                    {...buttonClick} 
                                    onClick={() => setShowTaskForm(true)} 
                                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontFamily: 'Cairo' }}
                                >
                                    <Plus size={20} /> إضافة مهمة
                                </motion.button>
                            </div>

                            <AnimatePresence>
                                {showTaskForm && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '30px' }}>
                                        <h4 style={{ margin: '0 0 20px 0', color: '#fff', fontWeight: '900' }}>تفاصيل المهمة الجديدة</h4>
                                        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#a1a1aa', fontWeight: '700' }}>عنوان المهمة</label>
                                                <input type="text" placeholder="مثال: توريد حديد التسليح" value={taskData.title} onChange={(e) => setTaskData({ ...taskData, title: e.target.value })} className="premium-input" style={{ width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#a1a1aa', fontWeight: '700' }}>المسؤول التنفيذي</label>
                                                <input type="text" placeholder="اسم المهندس أو الفني" value={taskData.assignedTo} onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })} className="premium-input" style={{ width: '100%' }} />
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#a1a1aa', fontWeight: '700' }}>وصف تفصيلي</label>
                                            <textarea placeholder="شرح ما يجب القيام به بدقة..." value={taskData.description} onChange={(e) => setTaskData({ ...taskData, description: e.target.value })} className="premium-input" style={{ width: '100%', height: '80px', resize: 'none' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '25px' }}>
                                            <button onClick={() => setShowTaskForm(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 25px', borderRadius: '12px', cursor: 'pointer', color: '#a1a1aa', fontWeight: '700' }}>إلغاء</button>
                                            <motion.button {...buttonClick} onClick={(e) => { e.preventDefault(); createTaskMutation.mutate(taskData); }} style={{ background: '#4ade80', color: '#09090b', border: 'none', padding: '10px 35px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900' }}>تأكيد وإضافة</motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {tasksLoading ? (
                                    <div style={{ textAlign: 'center', padding: '50px', color: '#71717a' }}>
                                        <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 15px', display: 'block', color: '#6366f1' }} />
                                        جاري جرد المهام المسجلة...
                                    </div>
                                ) : tasks.length === 0 ? (
                                    <div style={{ background: 'rgba(255,255,255,0.01)', padding: '60px', textAlign: 'center', borderRadius: '24px', color: '#52525b', border: '1px dashed rgba(255,255,255,0.05)' }}>لا توجد مهام نشطة حالياً لهذا المشروع.</div>
                                ) : (
                                    tasks.map((task, idx) => (
                                        <motion.div 
                                            key={task.id} 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            style={{ 
                                                background: task.status === 'DONE' ? 'rgba(74,222,128,0.03)' : 'rgba(255,255,255,0.02)', 
                                                padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', 
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' 
                                            }}
                                        >
                                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                <motion.button 
                                                    whileHover={{ scale: 1.1 }}
                                                    onClick={() => updateTaskStatusMutation.mutate({ taskId: task.id, status: task.status === 'DONE' ? 'TODO' : 'DONE' })} 
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.status === 'DONE' ? '#4ade80' : '#52525b', display: 'flex' }}
                                                >
                                                    {updateTaskStatusMutation.isPending && updateTaskStatusMutation.variables?.taskId === task.id ? <RefreshCw className="animate-spin" size={24} /> : <CheckCircle2 size={26} fill={task.status === 'DONE' ? 'rgba(74,222,128,0.1)' : 'none'} />}
                                                </motion.button>
                                                <div>
                                                    <div style={{ fontWeight: '800', fontSize: '1.05rem', color: task.status === 'DONE' ? '#71717a' : '#fff', textDecoration: task.status === 'DONE' ? 'line-through' : 'none' }}>{task.title}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#52525b', marginTop: '4px', fontWeight: '600' }}>المكلف: {task.assignedTo || 'غير محدد'}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                {task.priority === 'HIGH' && <span style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '5px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '900' }}>أولوية قصوى</span>}
                                                <span className={`status-pill ${task.status === 'DONE' ? 'status-paid' : 'status-pending'}`} style={{ fontSize: '0.75rem' }}>{task.status === 'DONE' ? 'مكتمل' : 'قيد العمل'}</span>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div style={{ direction: 'rtl' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                <div>
                    <h2 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '2.2rem', fontWeight: '900' }} className="gradient-text">المشاريع والمقاولات</h2>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '1rem', fontWeight: '500' }}>إدارة المشاريع الإنشائية، مراقبة المواقع، ومتابعة المهام التنفيذية.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="glass-card" style={{ padding: '6px', borderRadius: '16px', display: 'flex', gap: '4px' }}>
                        <button onClick={() => setViewMode('grid')} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: viewMode === 'grid' ? 'rgba(99,102,241,0.2)' : 'transparent', color: viewMode === 'grid' ? '#fff' : '#71717a', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Cairo' }}>
                            <LayoutGrid size={18} /> العرض الشبكي
                        </button>
                        <button onClick={() => setViewMode('map')} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: viewMode === 'map' ? 'rgba(99,102,241,0.2)' : 'transparent', color: viewMode === 'map' ? '#fff' : '#71717a', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Cairo' }}>
                            <Globe size={18} /> خريطة المواقع
                        </button>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }} 
                        whileTap={{ scale: 0.95 }} 
                        onClick={() => setShowForm(true)}
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '18px', cursor: 'pointer', fontWeight: '800', fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <Plus size={22} /> إنشاء مشروع
                    </motion.button>
                </div>
            </div>

            {/* Creation Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card" style={{ width: '100%', maxWidth: '800px', padding: '40px', borderRadius: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', fontWeight: '900' }}>إطلاق مشروع جديد</h3>
                                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); createProjectMutation.mutate({ ...projectData, lat: projectData.lat ? parseFloat(projectData.lat) : null, lng: projectData.lng ? parseFloat(projectData.lng) : null }); }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontWeight: '700' }}>إسم المشروع</label>
                                    <input type="text" required placeholder="مثال: تطوير مجمع الأعمال بتبوك" value={projectData.name} onChange={(e) => setProjectData({ ...projectData, name: e.target.value })} className="premium-input" style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontWeight: '700' }}>العميل المرتبط</label>
                                    <select value={projectData.partnerId} onChange={(e) => setProjectData({ ...projectData, partnerId: e.target.value })} className="premium-input" style={{ width: '100%', background: 'rgba(255,255,255,0.03)' }}>
                                        <option value="">اختر العميل من السجل الحالي...</option>
                                        {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontWeight: '700' }}>الموقع (النصي)</label>
                                    <input type="text" placeholder="مثال: الرياض، حي المورد" value={projectData.location} onChange={(e) => setProjectData({ ...projectData, location: e.target.value })} className="premium-input" style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontWeight: '700' }}>خط العرض (Latitude)</label>
                                    <input type="number" step="any" placeholder="GPS Lat" value={projectData.lat} onChange={(e) => setProjectData({ ...projectData, lat: e.target.value })} className="premium-input" style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontWeight: '700' }}>خط الطول (Longitude)</label>
                                    <input type="number" step="any" placeholder="GPS Long" value={projectData.lng} onChange={(e) => setProjectData({ ...projectData, lng: e.target.value })} className="premium-input" style={{ width: '100%' }} />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', color: '#a1a1aa', fontWeight: '700' }}>وصف ورؤية المشروع</label>
                                    <textarea placeholder="شرح موجز لأهداف المشروع ونطاق العمل..." value={projectData.description} onChange={(e) => setProjectData({ ...projectData, description: e.target.value })} className="premium-input" style={{ width: '100%', height: '100px', resize: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '15px', gridColumn: 'span 2', justifyContent: 'flex-end', marginTop: '20px' }}>
                                    <button type="button" onClick={() => setShowForm(false)} style={{ padding: '14px 30px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#a1a1aa', fontWeight: '700', cursor: 'pointer' }}>إلغاء</button>
                                    <motion.button {...buttonClick} type="submit" disabled={createProjectMutation.isPending} style={{ padding: '14px 50px', borderRadius: '15px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                                        {createProjectMutation.isPending ? 'جاري الحفظ...' : 'تأكيد إطلاق المشروع'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {projectsLoading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: '#71717a' }}>
                    <RefreshCw className="animate-spin" size={48} style={{ margin: '0 auto 20px', display: 'block', color: '#6366f1' }} />
                    <h3 style={{ color: '#fff' }}>جاري استرجاع سجلات المشاريع...</h3>
                </div>
            ) : viewMode === 'map' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ height: '700px', borderRadius: '40px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', zIndex: 0 }}>
                    <MapContainer center={[24.7136, 46.6753]} zoom={6} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <ZoomControl position="topright" />
                        <TileLayer 
                            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" 
                            attribution='&copy; Google Maps Satellite' 
                        />
                        {projects.filter(p => p.lat && p.lng).map(project => (
                            <Marker key={project.id} position={[project.lat, project.lng]}>
                                <Popup>
                                    <div style={{ textAlign: 'right', fontFamily: 'Cairo', padding: '5px' }}>
                                        <div style={{ fontWeight: '900', color: '#1e3a8a', fontSize: '1.1rem', marginBottom: '5px' }}>{project.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>الحالة: {getStatusLabel(project.status).label}</div>
                                        <button onClick={() => setSelectedProject(project)} style={{ width: '100%', padding: '8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800' }}>فتح التفاصيل</button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </motion.div>
            ) : (
                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' }}>
                    {projects.length === 0 ? (
                        <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '100px', color: '#52525b' }}>لا يوجد أي مشروع مسجل في النظام حالياً.</div>
                    ) : (
                        projects.map((project, idx) => (
                            <motion.div 
                                key={project.id} 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => setSelectedProject(project)} 
                                className="glass-card" 
                                style={{ padding: '30px', borderRadius: '32px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                            >
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #6366f1, #4ade80)' }} />
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                                    <div style={{ background: 'rgba(99,102,241,0.1)', padding: '15px', borderRadius: '20px', color: '#6366f1' }}><Briefcase size={28} /></div>
                                    <span className={`status-pill ${getStatusLabel(project.status).class}`} style={{ fontSize: '0.75rem' }}>{getStatusLabel(project.status).label}</span>
                                </div>
                                
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', color: '#fff', fontWeight: '900' }}>{project.name}</h3>
                                <p style={{ margin: '0 0 25px 0', color: '#71717a', fontSize: '0.95rem', height: '48px', overflow: 'hidden', fontWeight: '500', lineHeight: '1.6' }}>{project.description || 'لا يوجد وصف للعرض.'}</p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#4ade80', fontSize: '0.85rem', fontWeight: '800' }}>
                                        <CheckSquare size={18} />
                                        <span>{project._count?.tasks || 0} مهام فنية</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontWeight: '900', fontSize: '0.95rem' }}>
                                        عرض التفاصيل <ChevronLeft size={18} />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
