import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Briefcase, Calendar, MapPin, User, CheckSquare, Clock, AlertCircle, Folder } from 'lucide-react';
import API_URL from '../../config';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tasks, setTasks] = useState([]);

    // Form State for Project
    const [projectData, setProjectData] = useState({
        name: '',
        description: '',
        partnerId: '',
        location: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        budget: 0,
        status: 'PLANNED'
    });

    // Form State for Task
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        assignedTo: '',
        dueDate: ''
    });

    useEffect(() => {
        fetchProjects();
        fetchPartners();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await axios.get(`${API_URL}/projects`);
            setProjects(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching projects', err);
        }
    };

    const fetchPartners = async () => {
        try {
            const res = await axios.get(`${API_URL}/partners`);
            setPartners(res.data);
        } catch (err) {
            console.error('Error fetching partners', err);
        }
    };

    const fetchTasks = async (projectId) => {
        try {
            const res = await axios.get(`${API_URL}/projects/${projectId}/tasks`);
            setTasks(res.data);
        } catch (err) {
            console.error('Error fetching tasks', err);
        }
    };

    const handleArchiveProject = async (project) => {
        try {
            await axios.post(`${API_URL}/documents`, {
                title: `سجل بيانات المشروع: ${project.name}`,
                category: 'OTHER',
                fileUrl: `INTERNAL:PROJECT:${project.id}`,
                partnerId: project.partnerId,
                projectId: project.id
            });
            alert('✅ تم أرشفة بيانات المشروع في الوثائق');
        } catch (err) {
            alert('❌ فشل الأرشفة');
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/projects`, projectData);
            fetchProjects();
            setShowForm(false);
            setProjectData({
                name: '', description: '', partnerId: '', location: '',
                startDate: new Date().toISOString().split('T')[0], endDate: '',
                budget: 0, status: 'PLANNED'
            });
        } catch (err) {
            alert('فشل في إنشاء المشروع');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/tasks`, {
                ...taskData,
                projectId: selectedProject.id
            });
            fetchTasks(selectedProject.id);
            setShowTaskForm(false);
            setTaskData({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', assignedTo: '', dueDate: '' });
        } catch (err) {
            alert('فشل في إنشاء المهمة');
        }
    };

    const updateTaskStatus = async (taskId, status) => {
        try {
            await axios.patch(`${API_URL}/tasks/${taskId}/status`, { status });
            fetchTasks(selectedProject.id);
        } catch (err) {
            console.error('Error updating task', err);
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PLANNED': return { label: 'مخطط له', color: '#64748b' };
            case 'ACTIVE': return { label: 'نشط', color: '#3b82f6' };
            case 'COMPLETED': return { label: 'مكتمل', color: '#10b981' };
            case 'ON_HOLD': return { label: 'متوقف', color: '#f59e0b' };
            default: return { label: status, color: '#64748b' };
        }
    };

    if (selectedProject) {
        return (
            <div className="fade-in">
                <button onClick={() => setSelectedProject(null)} style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>← العودة للمشاريع</button>

                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                    {/* Project Details Sidebar */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', height: 'fit-content' }}>
                        <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{selectedProject.name}</h2>
                        <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            {getStatusLabel(selectedProject.status).label}
                        </span>

                        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                                <User size={18} />
                                <span>العميل: {selectedProject.partner?.name || 'غير محدد'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                                <MapPin size={18} />
                                <span>الموقع: {selectedProject.location || 'غير محدد'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                                <Calendar size={18} />
                                <span>البداية: {new Date(selectedProject.startDate).toLocaleDateString('ar-SA')}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>الوصف</h4>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>{selectedProject.description || 'لا يوجد وصف للعرض'}</p>
                        </div>
                    </div>

                    {/* Tasks List */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>المهام والمتابعة</h3>
                            <button onClick={() => setShowTaskForm(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Plus size={18} /> إضافة مهمة
                            </button>
                        </div>

                        {showTaskForm && (
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>إضافة مهمة جديدة</h4>
                                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <input type="text" placeholder="عنوان المهمة" value={taskData.title} onChange={(e) => setTaskData({ ...taskData, title: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    <input type="text" placeholder="المسؤول" value={taskData.assignedTo} onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <textarea placeholder="وصف المهمة" value={taskData.description} onChange={(e) => setTaskData({ ...taskData, description: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '10px', height: '60px', resize: 'none' }} />
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
                                    <button onClick={() => setShowTaskForm(false)} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}>إلغاء</button>
                                    <button onClick={handleCreateTask} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>حفظ المهمة</button>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {tasks.length === 0 ? (
                                <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '16px', color: '#94a3b8' }}>لا توجد مهام حالياً</div>
                            ) : (
                                tasks.map(task => (
                                    <div key={task.id} className="mobile-grid-1" style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 4px rgb(0 0 0 / 0.02)', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <div onClick={() => updateTaskStatus(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')} style={{ cursor: 'pointer', color: task.status === 'DONE' ? '#10b981' : '#cbd5e1' }}>
                                                <CheckSquare size={24} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', textDecoration: task.status === 'DONE' ? 'line-through' : 'none', color: task.status === 'DONE' ? '#94a3b8' : '#1e293b' }}>{task.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>أسندت إلى: {task.assignedTo || 'غير محدد'}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {task.priority === 'HIGH' && <span style={{ color: '#ef4444', background: '#fef2f2', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>مهم جداً</span>}
                                            <span style={{ color: task.status === 'DONE' ? '#10b981' : '#3b82f6', fontSize: '0.8rem' }}>{task.status}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="mobile-grid-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>المشاريع والمقاولات</h2>
                    <p style={{ margin: 0, color: '#64748b' }}>إدارة المشاريع الإنشائية ومهام العمل</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px',
                        borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgb(37 99 235 / 0.3)', width: 'fit-content'
                    }}
                >
                    <Plus size={20} /> مشروع جديد
                </button>
            </div>

            {showForm && (
                <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', marginBottom: '30px' }}>
                    <h3 style={{ margin: '0 0 20px 0' }}>إضافة مشروع جديد</h3>
                    <form onSubmit={handleCreateProject} className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>اسم المشروع</label>
                            <input type="text" required value={projectData.name} onChange={(e) => setProjectData({ ...projectData, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>العميل</label>
                            <select value={projectData.partnerId} onChange={(e) => setProjectData({ ...projectData, partnerId: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                <option value="">اختر العميل...</option>
                                {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>الوصف</label>
                            <textarea value={projectData.description} onChange={(e) => setProjectData({ ...projectData, description: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '80px', resize: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', gridColumn: 'span 2', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px' }}>إلغاء</button>
                            <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '8px', fontWeight: 'bold' }}>حفظ المشروع</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>جاري التحميل...</div>
            ) : (
                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {projects.length === 0 ? (
                        <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', color: '#94a3b8' }}>لا توجد مشاريع مضافة حالياً</div>
                    ) : (
                        projects.map(project => (
                            <div key={project.id} onClick={() => { setSelectedProject(project); fetchTasks(project.id); }} className="card-hover" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', position: 'relative' }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleArchiveProject(project); }}
                                    style={{ position: 'absolute', left: '15px', top: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '5px', borderRadius: '8px', color: '#64748b', cursor: 'pointer' }}
                                    title="أرشفة المشروع"
                                >
                                    <Folder size={18} />
                                </button>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', color: '#3b82f6' }}><Briefcase size={24} /></div>
                                    <span style={{ fontSize: '0.8rem', background: '#f8fafc', padding: '4px 10px', borderRadius: '20px', color: '#64748b' }}>{getStatusLabel(project.status).label}</span>
                                </div>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#1e293b' }}>{project.name}</h3>
                                <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.9rem', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.description}</p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #f8fafc' }}>
                                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', color: '#10b981', fontSize: '0.85rem' }}>
                                        <CheckSquare size={16} />
                                        <span>{project._count?.tasks || 0} مهام</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#2563eb', fontWeight: 'bold' }}>عرض التفاصيل ←</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
