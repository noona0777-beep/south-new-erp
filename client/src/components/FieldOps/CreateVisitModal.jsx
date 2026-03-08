import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { X, Save, MapPin, FileText, Briefcase } from 'lucide-react';
import API_URL from '@/config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const CreateVisitModal = ({ isOpen, onClose, projectId }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        engineerId: '',
        notes: '',
        gpsLocation: ''
    });

    // Fetch Engineers to populate select
    const { data: engineers = [] } = useQuery({
        queryKey: ['engineersList'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/hr/employees`, { headers: H() });
            return res.data;
        },
        enabled: isOpen
    });

    const createVisitMutation = useMutation({
        mutationFn: async (data) => {
            const res = await axios.post(`${API_URL}/field-ops/visits`, data, { headers: H() });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['fieldOps', 'visits']);
            onClose();
            setFormData({ engineerId: '', notes: '', gpsLocation: '' });
            alert('تم تسجيل الزيارة بنجاح!');
        },
        onError: (err) => {
            alert('حدث خطأ أثناء تسجيل الزيارة');
            console.error(err);
        }
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.engineerId) return alert('يرجى اختيار المهندس الزائر');
        createVisitMutation.mutate({ ...formData, projectId });
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', color: '#10b981' }}>
                        <MapPin size={24} /> تسجيل زيارة ميدانية جديدة
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Engineer */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>المهندس الإستشاري *</label>
                            <div style={{ position: 'relative' }}>
                                <Briefcase size={18} color="#94a3b8" style={{ position: 'absolute', top: '12px', right: '14px' }} />
                                <select value={formData.engineerId} onChange={e => setFormData({ ...formData, engineerId: e.target.value })} style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} required>
                                    <option value="">-- اختر المهندس --</option>
                                    {engineers.map(e => <option key={e.id} value={e.id}>{e.name} - {e.jobTitle}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* GPS */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>موقع الزيارة (إحداثيات GPS)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input type="text" value={formData.gpsLocation} onChange={e => setFormData({ ...formData, gpsLocation: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="إحداثيات (مثال: 24.7136, 46.6753)" />
                                </div>
                                <button type="button" onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition((pos) => {
                                            setFormData({ ...formData, gpsLocation: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}` });
                                        }, () => alert('تعذر جلب الموقع'));
                                    }
                                }} style={{ padding: '0 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    التقاط تلقائي
                                </button>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>ملاحظات الزيارة والمشاهدات <FileText size={16} style={{ verticalAlign: 'middle', marginLeft: '6px', color: '#94a3b8' }} /></label>
                            <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box', minHeight: '120px', resize: 'vertical' }} placeholder="سجل الملاحظات العامة، عدد العمالة، التقدم..."></textarea>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', margin: '24px -24px -24px -24px', padding: '16px 24px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
                        <button type="submit" disabled={createVisitMutation.isLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: createVisitMutation.isLoading ? 0.7 : 1 }}>
                            <Save size={18} /> {createVisitMutation.isLoading ? 'جاري التسجيل...' : 'حفظ الزيارة'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateVisitModal;
