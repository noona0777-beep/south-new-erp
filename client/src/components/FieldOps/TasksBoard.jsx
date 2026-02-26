import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Clock, CheckCircle2, AlertCircle, LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import API_URL from '../../config';
import CreateTaskModal from './CreateTaskModal';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const TasksBoard = ({ projectId }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

    if (isLoading) return <div className="p-8 text-center text-slate-400 font-bold">جاري تحميل المهام...</div>;

    return (
        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px' }}>
            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>مهام المشروع الميدانية</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                        <button onClick={() => setViewMode('kanban')} style={{ padding: '8px 12px', background: viewMode === 'kanban' ? '#e2e8f0' : 'white', border: 'none', cursor: 'pointer' }}><LayoutGrid size={18} color="#64748b" /></button>
                        <button onClick={() => setViewMode('list')} style={{ padding: '8px 12px', background: viewMode === 'list' ? '#e2e8f0' : 'white', border: 'none', borderRight: '1px solid #e2e8f0', cursor: 'pointer' }}><List size={18} color="#64748b" /></button>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        <Plus size={18} /> مهمة جديدة
                    </button>
                </div>
            </div>

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' }}>
                    {Object.entries(groupedTasks).map(([statusKey, statusTasks]) => (
                        <div key={statusKey} style={{ background: '#f1f5f9', padding: '16px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', color: statusConfig[statusKey].color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusConfig[statusKey].color }}></div>
                                    {statusConfig[statusKey].label}
                                </h3>
                                <span style={{ background: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>{statusTasks.length}</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {statusTasks.map(task => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{ background: 'white', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', borderLeft: `4px solid ${statusConfig[statusKey].color}`, cursor: 'pointer' }}
                                    >
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 'bold' }}>{task.taskNumber}</div>
                                        <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>{task.title}</div>

                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px', color: '#475569' }}>{task.phase?.replace('_', ' ') || 'عام'}</span>
                                            {task.riskLevel === 'CRITICAL' && <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#fef2f2', borderRadius: '4px', color: '#ef4444' }}>مخاطرة حرجة</span>}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: 'auto' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={14} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'بدون تاريخ'}
                                            </div>
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: '#475569' }} title={task.engineer?.name}>
                                                {task.engineer?.name?.substring(0, 2) || '--'}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {statusTasks.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.9rem', border: '2px dashed #cbd5e1', borderRadius: '10px' }}>لا توجد مهام</div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List View placeholder */}
            {viewMode === 'list' && (
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>رقم المهمة</th>
                                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>العنوان</th>
                                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>المهندس الإستشاري</th>
                                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>المرحلة</th>
                                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>تاريخ التسليم</th>
                                <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '14px 16px', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 'bold' }}>{task.taskNumber}</td>
                                    <td style={{ padding: '14px 16px', fontSize: '0.95rem', fontWeight: 'bold', color: '#1e293b' }}>{task.title}</td>
                                    <td style={{ padding: '14px 16px', fontSize: '0.9rem', color: '#475569' }}>{task.engineer?.name || '-'}</td>
                                    <td style={{ padding: '14px 16px', fontSize: '0.9rem', color: '#475569' }}>{task.phase?.replace('_', ' ') || '-'}</td>
                                    <td style={{ padding: '14px 16px', fontSize: '0.9rem', color: '#475569' }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{ background: statusConfig[task.status].bg, color: statusConfig[task.status].color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
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
        </div>
    );
};

export default TasksBoard;
