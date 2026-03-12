import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertOctagon, CheckCircle2, ShieldAlert, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_URL from '@/config';

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

    if (isLoading) return <div style={{ color: '#71717a', padding: '100px', textAlign: 'center' }}><RefreshCw className="animate-spin" size={40} /></div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', direction: 'rtl' }}>
            {/* Tickets Section */}
            <div>
                <h2 style={{ margin: '0 0 25px 0', fontSize: '1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '900' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '12px' }}><AlertOctagon size={24} color="#f59e0b" /></div>
                    الملاحظات والتذاكر الميدانية
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {allTickets.map(ticket => (
                        <motion.div key={ticket.id} whileHover={{ x: -5 }} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)', borderRight: '5px solid #f59e0b' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: '900' }}>مهمة: {ticket.taskNumber}</span>
                                <span className={`status-pill ${ticket.status === 'OPEN' ? 'status-pending' : 'status-paid'}`}>
                                    {ticket.status === 'OPEN' ? 'مفتوحة' : 'مغلقة'}
                                </span>
                            </div>
                            <h4 style={{ margin: '0 0 8px 0', color: '#fff', fontWeight: '800' }}>{ticket.title}</h4>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#a1a1aa', lineHeight: '1.6' }}>{ticket.description}</p>
                        </motion.div>
                    ))}
                    {allTickets.length === 0 && <div style={{ color: '#52525b', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.01)', borderRadius: '20px' }}>لا توجد ملاحظات مسجلة.</div>}
                </div>
            </div>


            {/* Risks Section */}
            <div>
                <h2 style={{ margin: '0 0 25px 0', fontSize: '1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '900' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '12px' }}><ShieldAlert size={24} color="#ef4444" /></div>
                    سجل إدارة المخاطر
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {allRisks.map(risk => (
                        <motion.div key={risk.id} whileHover={{ x: -5 }} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)', borderRight: risk.severity === 'CRITICAL' ? '5px solid #ef4444' : '5px solid #3b82f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: '900' }}>مهمة: {risk.taskNumber}</span>
                                <span className={`status-pill ${risk.severity === 'CRITICAL' ? 'status-cancelled' : 'status-shipped'}`}>
                                    {risk.severity === 'CRITICAL' ? 'خطورة عالية' : 'خطورة متوسطة'}
                                </span>
                            </div>
                            <p style={{ margin: '0 0 15px 0', fontSize: '1.05rem', color: '#fff', fontWeight: '800' }}>{risk.description}</p>
                            <div style={{ background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                <span style={{ color: '#71717a', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85rem' }}><CheckCircle2 size={16} color="#10b981" /> خطة التخفيف والحل:</span>
                                <span style={{ color: '#a1a1aa' }}>{risk.mitigationPlan || 'لم يتم وضع خطة لتخفيف الخطر.'}</span>
                            </div>
                        </motion.div>
                    ))}
                    {allRisks.length === 0 && <div style={{ color: '#52525b', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.01)', borderRadius: '20px' }}>لا توجد مخاطر مسجلة.</div>}
                </div>
            </div>
        </div>

    );
};

export default TicketsRisks;
