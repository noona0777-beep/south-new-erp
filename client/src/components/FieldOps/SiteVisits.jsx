import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { MapPin, Plus, Clock, User } from 'lucide-react';
import API_URL from '../../config';
import CreateVisitModal from './CreateVisitModal';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const SiteVisits = ({ projectId }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: visits = [], isLoading } = useQuery({
        queryKey: ['fieldOps', 'visits', projectId],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/field-ops/visits/project/${projectId}`, { headers: H() });
            return res.data;
        },
        enabled: !!projectId
    });

    if (isLoading) return <div className="p-8 text-center text-slate-400 font-bold">جاري تحميل الزيارات...</div>;

    return (
        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>سجل الزيارات الميدانية</h2>
                <button
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    <Plus size={18} /> تسجيل رحلة جديدة
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {visits.map(visit => (
                    <div key={visit.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User size={18} color="#64748b" /> {visit.engineer?.name || 'مهندس غير محدد'}
                            </h3>
                            <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>{visit.notes || 'لا توجد ملاحظات مسجلة لهذه الزيارة.'}</p>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {new Date(visit.date).toLocaleString()}</span>
                                {visit.gpsLocation && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6' }}><MapPin size={14} /> إحداثيات GPS: {visit.gpsLocation}</span>}
                            </div>
                        </div>
                    </div>
                ))}

                {visits.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
                        <MapPin size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                        <p style={{ margin: 0, fontWeight: 'bold' }}>لم يتم تسجيل أي زيارات ميدانية لهذا المشروع بعد.</p>
                    </div>
                )}
            </div>

            <CreateVisitModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                projectId={projectId}
            />
        </div>
    );
};

export default SiteVisits;
