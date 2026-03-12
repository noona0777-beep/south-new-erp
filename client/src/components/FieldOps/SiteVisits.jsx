import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { MapPin, Plus, Clock, User, Package } from 'lucide-react';
import API_URL from '@/config';
import CreateVisitModal from './CreateVisitModal';
import MaterialRequestModal from './MaterialRequestModal';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const SiteVisits = ({ projectId }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

    const { data: visits = [], isLoading } = useQuery({
        queryKey: ['fieldOps', 'visits', projectId],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/field-ops/visits/project/${projectId}`, { headers: H() });
            return res.data;
        },
        enabled: !!projectId
    });

    if (isLoading) return <div style={{ color: '#71717a', padding: '100px', textAlign: 'center' }}><RefreshCw className="animate-spin" size={40} /></div>;

    return (
        <div style={{ direction: 'rtl' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#fff', fontWeight: '900' }}>سجل الزيارات الميدانية والرقابة</h2>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <motion.button
                        {...buttonClick}
                        onClick={() => setIsMaterialModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 25px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' }}
                    >
                        <Package size={20} /> طلب توريد
                    </motion.button>
                    <motion.button
                        {...buttonClick}
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 25px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}
                    >
                        <Plus size={20} /> تسجيل زيارة
                    </motion.button>
                </div>
            </div>


            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {visits.map(visit => (
                    <motion.div key={visit.id} whileHover={{ y: -5 }} style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                                <div style={{ width: 45, height: 45, borderRadius: '15px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '900', color: '#fff', fontSize: '1.1rem' }}>{visit.engineer?.name || 'فريق الإشراف الميداني'}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: '700' }}>مهندس استشاري معتمد</div>
                                </div>
                            </div>
                            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '1.05rem', lineHeight: '1.8', background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '15px' }}>{visit.notes || 'لا توجد ملاحظات مسجلة لهذه الزيارة.'}</p>
                            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', fontSize: '0.85rem', color: '#52525b', fontWeight: '900' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {new Date(visit.date).toLocaleString('ar-SA')}</span>
                                {visit.gpsLocation && <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6366f1' }}><MapPin size={16} /> الموقع الجغرافي: {visit.gpsLocation}</span>}
                            </div>
                        </div>
                    </motion.div>
                ))}


                {visits.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.01)', borderRadius: '35px', border: '1px dashed rgba(255,255,255,0.05)', color: '#52525b' }}>
                        <MapPin size={60} style={{ margin: '0 auto 20px auto', opacity: 0.2 }} />
                        <p style={{ margin: 0, fontWeight: '900', fontSize: '1.2rem' }}>لا توجد زيارات ميدانية مسجلة حتى الآن.</p>
                    </div>
                )}
            </div>


            <CreateVisitModal
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

export default SiteVisits;
