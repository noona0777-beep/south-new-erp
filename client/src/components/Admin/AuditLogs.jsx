import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Shield, Clock, User, Activity, ArrowLeftRight, HardDrive, UserCheck } from 'lucide-react';
import API_URL from '@/config';
import { fadeInUp } from '../Common/MotionComponents';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const AuditLogs = () => {
    const { data: logs = [], isLoading } = useQuery({
        queryKey: ['auditLogs'],
        queryFn: async () => (await axios.get(`${API_URL}/logs`, { headers: H() })).data
    });

    const actionLabel = (action) => {
        const map = {
            'CREATE': { text: 'إضافة جديد', color: '#10b981', icon: Activity },
            'UPDATE': { text: 'تعديل بيانات', color: '#6366f1', icon: ArrowLeftRight },
            'DELETE': { text: 'حذف نهائي', color: '#ef4444', icon: HardDrive },
            'LOGIN': { text: 'دخول النظام', color: '#f59e0b', icon: UserCheck }
        };
        return map[action] || { text: action, color: '#71717a', icon: Activity };
    };

    if (isLoading) return (
        <div style={{ textAlign: 'center', padding: '100px 40px', color: '#71717a', fontFamily: 'Cairo' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: '20px' }}>
                <Clock size={48} color="#6366f1" />
            </motion.div>
            <h3 style={{ color: '#fff', fontWeight: '800' }}>جاري استرجاع سجل العمليات...</h3>
        </div>
    );

    return (
        <div style={{ direction: 'rtl', fontFamily: 'Cairo' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '35px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={28} />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', color: '#fff' }}>سجل العمليات الموثق</h2>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#71717a', fontWeight: '600' }}>تتبع كامل لكافة الحركات والتغييرات التي طرأت على بيانات النظام.</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {logs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#52525b', background: 'rgba(255,255,255,0.01)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                        لا توجد سجلات نشاط مسجلة في النظام حالياً.
                    </div>
                ) : logs.map((log, idx) => {
                    const action = actionLabel(log.action);
                    const TagIcon = action.icon;
                    return (
                        <motion.div 
                            key={log.id} 
                            variants={fadeInUp}
                            initial="initial"
                            animate="animate"
                            transition={{ delay: idx * 0.03 }}
                            className="list-item-hover"
                            style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '18px 25px', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.03)',
                                background: 'rgba(255, 255, 255, 0.01)', gap: '20px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ 
                                    width: '45px', height: '45px', borderRadius: '14px', 
                                    background: 'rgba(255,255,255,0.02)', color: '#a1a1aa', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    border: '1px solid rgba(255,255,255,0.03)'
                                }}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '900', color: '#fff', fontSize: '1rem' }}>{log.user?.name || 'مستخدم غير معروف'}</span>
                                        <div style={{ 
                                            fontSize: '0.7rem', padding: '4px 12px', borderRadius: '30px', 
                                            background: `${action.color}15`, color: action.color, fontWeight: '900',
                                            display: 'flex', alignItems: 'center', gap: '5px', border: `1px solid ${action.color}25`
                                        }}>
                                            <TagIcon size={12} /> {action.text}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: '600' }}>
                                        <span style={{ color: '#6366f1', opacity: 0.8 }}>{log.entity}</span> • {log.details}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'left', color: '#52525b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', fontWeight: '800' }}>
                                <Clock size={14} />
                                {new Date(log.createdAt).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default AuditLogs;
