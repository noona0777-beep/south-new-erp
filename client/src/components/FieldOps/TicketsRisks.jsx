import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertOctagon, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_URL from '../../../config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const TicketsRisks = ({ projectId }) => {
    // Fetch project tasks to extract tickets and risks
    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['fieldOps', 'tasks', projectId],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/field-ops/tasks/project/${projectId}`, { headers: H() });
            return res.data;
        },
        enabled: !!projectId
    });

    // Extract all tickets and risks from tasks
    const allTickets = tasks.flatMap(t => t.tickets || []).map(ticket => ({ ...ticket, taskNumber: tasks.find(t => t.id === ticket.taskId)?.taskNumber }));
    const allRisks = tasks.flatMap(t => t.risks || []).map(risk => ({ ...risk, taskNumber: tasks.find(t => t.id === risk.taskId)?.taskNumber }));

    if (isLoading) return <div className="p-8 text-center text-slate-400 font-bold">جاري تحميل الملاحظات والمخاطر...</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            {/* Tickets Section */}
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px' }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertOctagon size={24} color="#f59e0b" />
                    الملاحظات والتذاكر الميدانية
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {allTickets.map(ticket => (
                        <div key={ticket.id} style={{ background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', borderRight: '4px solid #f59e0b' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>مهمة: {ticket.taskNumber}</span>
                                <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: ticket.status === 'OPEN' ? '#fffbeb' : '#ecfdf5', color: ticket.status === 'OPEN' ? '#d97706' : '#10b981', borderRadius: '12px', fontWeight: 'bold' }}>
                                    {ticket.status === 'OPEN' ? 'مفتوحة' : 'مغلقة'}
                                </span>
                            </div>
                            <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>{ticket.title}</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>{ticket.description}</p>
                        </div>
                    ))}
                    {allTickets.length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>لا توجد ملاحظات مسجلة.</div>}
                </div>
            </div>

            {/* Risks Section */}
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px' }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={24} color="#ef4444" />
                    سجل إدارة المخاطر
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {allRisks.map(risk => (
                        <div key={risk.id} style={{ background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', borderRight: risk.severity === 'CRITICAL' ? '4px solid #ef4444' : '4px solid #3b82f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>مهمة: {risk.taskNumber}</span>
                                <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: risk.severity === 'CRITICAL' ? '#fef2f2' : '#eff6ff', color: risk.severity === 'CRITICAL' ? '#ef4444' : '#3b82f6', borderRadius: '12px', fontWeight: 'bold' }}>
                                    {risk.severity === 'CRITICAL' ? 'خطورة عالية' : 'خطورة متوسطة'}
                                </span>
                            </div>
                            <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#1e293b', fontWeight: 'bold' }}>{risk.description}</p>
                            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                                <span style={{ color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>خطة التخفيف والحل:</span>
                                <span style={{ color: '#0f172a' }}>{risk.mitigationPlan || 'لم يتم وضع خطة لتخفيف الخطر.'}</span>
                            </div>
                        </div>
                    ))}
                    {allRisks.length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>لا توجد مخاطر مسجلة.</div>}
                </div>
            </div>
        </div>
    );
};

export default TicketsRisks;
