import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Clock, CheckCircle2, AlertCircle, LayoutGrid, List, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import API_URL from '@/config';
import CreateTaskModal from './CreateTaskModal';
import MaterialRequestModal from './MaterialRequestModal';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const TasksBoard = ({ projectId }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

    // Fetch Tasks for Project
    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['fieldOps', 'tasks', projectId],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/field-ops/tasks/project/${projectId}`, { headers: H() });
            return res.data;
        },
        enabled: !!projectId
    });

    // Group tasks by status for Kanban
    const groupedTasks = {
        'NEW': tasks.filter(t => t.status === 'NEW'),
        'IN_PROGRESS': tasks.filter(t => t.status === 'IN_PROGRESS'),
        'PENDING_CLOSURE': tasks.filter(t => t.status === 'PENDING_CLOSURE'),
        'CLOSED': tasks.filter(t => t.status === 'CLOSED'),
    };

    const statusConfig = {
        'NEW': { label: 'جديدة', color: '#3b82f6', bg: '#eff6ff' },
        'IN_PROGRESS': { label: 'قيد التنفيذ', color: '#f59e0b', bg: '#fffbeb' },
        'PENDING_CLOSURE': { label: 'بانتظار الإغلاق', color: '#8b5cf6', bg: '#f5f3ff' },
        'CLOSED': { label: 'مغلقة', color: '#10b981', bg: '#ecfdf5' },
    };

    if (isLoading) return <div style={{ color: '#71717a', padding: '100px', textAlign: 'center' }}><RefreshCw className="animate-spin" size={40} /></div>;

    return (
        <div style={{ direction: 'rtl' }}>

            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#fff', fontWeight: '900' }}>مهام المشروع الميدانية</h2>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
                        <button onClick={() => setViewMode('kanban')} style={{ padding: '10px 15px', background: viewMode === 'kanban' ? 'rgba(99,102,241,0.2)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'kanban' ? '#fff' : '#71717a' }}><LayoutGrid size={20} /></button>
                        <button onClick={() => setViewMode('list')} style={{ padding: '10px 15px', background: viewMode === 'list' ? 'rgba(99,102,241,0.2)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'list' ? '#fff' : '#71717a' }}><List size={20} /></button>
                    </div>
                    <motion.button
                        {...buttonClick}
                        onClick={() => setIsMaterialModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 25px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' }}
                    >
                        <Package size={20} /> توريد مواد
                    </motion.button>
                    <motion.button
                        {...buttonClick}
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 25px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 20px rgba(99,102,241,0.2)' }}
                    >
                        <Plus size={20} /> مهمة جديدة
                    </motion.button>
                </div>
            </div>


            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', alignItems: 'start' }}>
                    {Object.entries(groupedTasks).map(([statusKey, statusTasks]) => (
                        <div key={statusKey} style={{ background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: statusConfig[statusKey].color, boxShadow: `0 0 10px ${statusConfig[statusKey].color}` }}></div>
                                    {statusConfig[statusKey].label}
                                </h3>
                                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '900', color: '#a1a1aa' }}>{statusTasks.length}</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {statusTasks.map(task => (
                                    <motion.div
                                        key={task.id}
                                        whileHover={{ y: -5, background: 'rgba(255,255,255,0.03)' }}
                                        style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.04)', borderRight: `4px solid ${statusConfig[statusKey].color}`, cursor: 'pointer' }}
                                    >
                                        <div style={{ fontSize: '0.8rem', color: '#71717a', marginBottom: '6px', fontWeight: '900' }}>{task.taskNumber}</div>
                                        <div style={{ fontWeight: '900', color: '#fff', marginBottom: '12px', fontSize: '1.1rem' }}>{task.title}</div>

                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
                                            <span style={{ fontSize: '0.75rem', padding: '3px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', color: '#a1a1aa', fontWeight: '800' }}>{task.phase?.replace('_', ' ') || 'عام'}</span>
                                            {task.riskLevel === 'CRITICAL' && <span style={{ fontSize: '0.75rem', padding: '3px 10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444', fontWeight: '900' }}>مخاطرة حرجة</span>}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '15px' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                                                <Clock size={16} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-SA') : 'بدون تاريخ'}
                                            </div>
                                            <div style={{ width: 32, height: 32, borderRadius: '12px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '900' }} title={task.engineer?.name}>
                                                {task.engineer?.name?.substring(0, 2) || '--'}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {statusTasks.length === 0 && <div style={{ textAlign: 'center', padding: '30px', color: '#52525b', fontSize: '0.9rem', border: '2px dashed rgba(255,255,255,0.03)', borderRadius: '18px', fontWeight: '800' }}>لا توجد مهام حالياً</div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* List View placeholder */}
            {viewMode === 'list' && (
                <div style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <tr>
                                <th style={{ padding: '20px', color: '#71717a', fontWeight: '900', fontSize: '0.9rem' }}>رقم المهمة</th>
                                <th style={{ padding: '20px', color: '#71717a', fontWeight: '900', fontSize: '0.9rem' }}>العنوان</th>
                                <th style={{ padding: '20px', color: '#71717a', fontWeight: '900', fontSize: '0.9rem' }}>المهندس الإستشاري</th>
                                <th style={{ padding: '20px', color: '#71717a', fontWeight: '900', fontSize: '0.9rem' }}>المرحلة</th>
                                <th style={{ padding: '20px', color: '#71717a', fontWeight: '900', fontSize: '0.9rem' }}>موعد الإنجاز</th>
                                <th style={{ padding: '20px', color: '#71717a', fontWeight: '900', fontSize: '0.9rem' }}>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '20px', fontSize: '0.9rem', color: '#52525b', fontWeight: '900' }}>{task.taskNumber}</td>
                                    <td style={{ padding: '20px', fontSize: '1rem', fontWeight: '900', color: '#fff' }}>{task.title}</td>
                                    <td style={{ padding: '20px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '700' }}>{task.engineer?.name || '-'}</td>
                                    <td style={{ padding: '20px', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '700' }}>{task.phase?.replace('_', ' ') || '-'}</td>
                                    <td style={{ padding: '20px', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '700' }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-SA') : '-'}</td>
                                    <td style={{ padding: '20px' }}>
                                        <span style={{ background: `${statusConfig[task.status].color}15`, color: statusConfig[task.status].color, padding: '6px 15px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '900' }}>
                                            {statusConfig[task.status].label}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}


            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                projectId={projectId}
            />
            <MaterialRequestModal
                isOpen={isMaterialModalOpen}
                onClose={() => setIsMaterialModalOpen(false)}
                projectId={projectId}
            />
        </div>
    );
};

export default TasksBoard;
