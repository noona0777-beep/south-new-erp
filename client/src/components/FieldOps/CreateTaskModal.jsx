import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { X, Save, MapPin, FileText, Pickaxe, Ruler, Briefcase, Plus } from 'lucide-react';
import API_URL from '../../config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const PHASES = [
    { value: 'FOUNDATION', label: 'الأساسات' },
    { value: 'STRUCTURE', label: 'العظم والهيكل' },
    { value: 'ISOLATION', label: 'العزل المائي والحراري' },
    { value: 'FINISHING', label: 'التشطيبات المعمارية' },
    { value: 'ELECTRICAL', label: 'الأعمال الكهربائية' },
    { value: 'MECHANICAL', label: 'الأعمال الميكانيكية والسباكة' },
    { value: 'ARCHITECTURAL', label: 'مراجعة المخططات' },
];

const CreateTaskModal = ({ isOpen, onClose, projectId }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'FIELD',
        phase: 'FOUNDATION',
        sbcClause: '',
        riskLevel: 'LOW',
        dueDate: '',
        engineerId: '',
        gpsLocation: '',
        status: 'NEW'
    });

    const [measurements, setMeasurements] = useState([{ key: '', value: '' }]);

    // Fetch Engineers to populate select
    const { data: engineers = [] } = useQuery({
        queryKey: ['engineersList'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/hr/employees`, { headers: H() });
            return res.data;
        },
        enabled: isOpen
    });

    const createTaskMutation = useMutation({
        mutationFn: async (data) => {
            const res = await axios.post(`${API_URL}/field-ops/tasks`, data, { headers: H() });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['fieldOps', 'tasks']);
            onClose();
            // reset form
            setFormData({
                title: '', description: '', type: 'FIELD', phase: 'FOUNDATION', sbcClause: '', riskLevel: 'LOW', dueDate: '', engineerId: '', gpsLocation: '', status: 'NEW'
            });
            setMeasurements([{ key: '', value: '' }]);
            alert('تم إنشاء المهمة بنجاح!');
        },
        onError: (err) => {
            alert('حدث خطأ أثناء إنشاء المهمة');
            console.error(err);
        }
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title) return alert('يرجى إدخال عنوان المهمة');

        // Clean measurements
        const cleanMeasurements = measurements.filter(m => m.key && m.value).reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        const payload = {
            ...formData,
            projectId,
            measurements: Object.keys(cleanMeasurements).length > 0 ? cleanMeasurements : undefined
        };

        createTaskMutation.mutate(payload);
    };

    const handleMeasurementChange = (index, field, value) => {
        const newM = [...measurements];
        newM[index][field] = value;
        setMeasurements(newM);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', color: '#1e293b' }}>
                        <Pickaxe size={24} color="#3b82f6" /> إضافة مهمة إشراف جديدة
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                        {/* Title & Type */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>عنوان المهمة *</label>
                            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="مثال: فحص تسليح القواعد..." required />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>نوع المهمة</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}>
                                <option value="FIELD">ميدانية (موقع العمل)</option>
                                <option value="OFFICE">مكتبية (مراجعة واعتماد)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>مرحلة التنفيذ</label>
                            <select value={formData.phase} onChange={e => setFormData({ ...formData, phase: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}>
                                {PHASES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                        </div>

                        {/* SBC & Risk */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>بند كود البناء السعودي (SBC)</label>
                            <input type="text" value={formData.sbcClause} onChange={e => setFormData({ ...formData, sbcClause: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="مثال: SBC-304" />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>مستوى الخطورة</label>
                            <select value={formData.riskLevel} onChange={e => setFormData({ ...formData, riskLevel: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box', background: formData.riskLevel === 'CRITICAL' ? '#fef2f2' : formData.riskLevel === 'MEDIUM' ? '#eff6ff' : '#f8fafc', color: formData.riskLevel === 'CRITICAL' ? '#ef4444' : '#1e293b' }}>
                                <option value="LOW">إجراء روتيني (منخفض)</option>
                                <option value="MEDIUM">هام (متوسط)</option>
                                <option value="CRITICAL">حرج (قد يسبب إيقاف العمل)</option>
                            </select>
                        </div>

                        {/* Engineer & Date */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>المهندس المسؤول</label>
                            <div style={{ position: 'relative' }}>
                                <Briefcase size={18} color="#94a3b8" style={{ position: 'absolute', top: '12px', right: '14px' }} />
                                <select value={formData.engineerId} onChange={e => setFormData({ ...formData, engineerId: e.target.value })} style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}>
                                    <option value="">-- غير محدد --</option>
                                    {engineers.map(e => <option key={e.id} value={e.id}>{e.name} - {e.jobTitle}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>تاريخ التسليم المستهدف</label>
                            <input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} />
                        </div>

                        {/* GPS */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>الموقع الجغرافي (GPS)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <MapPin size={18} color="#94a3b8" style={{ position: 'absolute', top: '12px', right: '14px' }} />
                                    <input type="text" value={formData.gpsLocation} onChange={e => setFormData({ ...formData, gpsLocation: e.target.value })} style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="إحداثيات (مثال: 24.7136, 46.6753)" />
                                </div>
                                <button type="button" onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition((pos) => {
                                            setFormData({ ...formData, gpsLocation: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}` });
                                        }, () => alert('تعذر جلب الموقع'));
                                    }
                                }} style={{ padding: '0 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    التقاط الموقع
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>الوصف والتعليمات <FileText size={16} style={{ verticalAlign: 'middle', marginLeft: '6px', color: '#94a3b8' }} /></label>
                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box', minHeight: '100px', resize: 'vertical' }} placeholder="تفاصيل المهمة والمطلوب استلامه..."></textarea>
                        </div>

                        {/* Initial Measurements */}
                        <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontWeight: 'bold', color: '#475569' }}>
                                <span><Ruler size={18} style={{ verticalAlign: 'middle', marginLeft: '6px' }} /> القياسات المرغوب رصدها</span>
                                <button type="button" onClick={() => setMeasurements([...measurements, { key: '', value: '' }])} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}><Plus size={16} /> قياس جديد</button>
                            </label>
                            {measurements.map((m, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                    <input type="text" value={m.key} onChange={e => handleMeasurementChange(idx, 'key', e.target.value)} placeholder="الخاصية (مثلاً: Cover)" style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                    <input type="text" value={m.value} onChange={e => handleMeasurementChange(idx, 'value', e.target.value)} placeholder="القيمة أو الوحدة المرغوبة" style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                    {measurements.length > 1 && (
                                        <button type="button" onClick={() => setMeasurements(measurements.filter((_, i) => i !== idx))} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', width: '36px', cursor: 'pointer' }}><X size={16} style={{ verticalAlign: 'middle' }} /></button>
                                    )}
                                </div>
                            ))}
                        </div>

                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', margin: '24px -24px -24px -24px', padding: '16px 24px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
                        <button type="submit" disabled={createTaskMutation.isLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: createTaskMutation.isLoading ? 0.7 : 1 }}>
                            <Save size={18} /> {createTaskMutation.isLoading ? 'جاري الحفظ...' : 'إنشاء المهمة وفتح مساحة العمل'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
