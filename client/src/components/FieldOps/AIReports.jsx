import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrainCircuit, UploadCloud, AlertTriangle, Layers, Zap, Image as ImageIcon, Camera } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_URL from '../../config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const AIReports = ({ projectId }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);

    // Fetch Tasks for Project to select which task we are analyzing
    const { data: tasks = [] } = useQuery({
        queryKey: ['fieldOps', 'tasks', projectId],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/field-ops/tasks/project/${projectId}`, { headers: H() });
            return res.data;
        },
        enabled: !!projectId
    });

    const handleSimulateAnalysis = async () => {
        if (!selectedTaskId) {
            alert('يرجى اختيار المهمة أولاً');
            return;
        }
        setIsAnalyzing(true);
        setAnalysisData(null);

        try {
            // Mock Upload Delay
            await new Promise(r => setTimeout(r, 2000));
            // Actual API Call to trigger AI Analysis
            const res = await axios.post(`${API_URL}/field-ops/ai/analyze-image`, {
                taskId: selectedTaskId,
                imageUrl: 'https://images.unsplash.com/photo-1541888081-344c9b9cb7b0' // Mock Construction Site Image
            }, { headers: H() });

            setAnalysisData(res.data);
            queryClient.invalidateQueries(['fieldOps', 'tasks']);
            queryClient.invalidateQueries(['fieldOps', 'scores']);
        } catch (error) {
            console.error('Analysis Failed:', error);
            alert('فشل التحليل.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Control Panel */}
            <div style={{ flex: '1 1 300px', background: '#f8fafc', padding: '24px', borderRadius: '16px' }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BrainCircuit size={24} color="#8b5cf6" />
                    تحليل الصور الإنشائية
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#64748b', fontSize: '0.9rem' }}>ربط التحليل بمهمة معينة:</label>
                        <select
                            value={selectedTaskId}
                            onChange={(e) => setSelectedTaskId(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: 'white' }}
                        >
                            <option value="">-- اختر المهمة --</option>
                            {tasks.map(t => <option key={t.id} value={t.id}>{t.taskNumber} - {t.title}</option>)}
                        </select>
                    </div>

                    <div style={{ background: 'white', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '30px', textAlign: 'center', cursor: 'pointer', transition: 'border 0.2s', ...(!selectedTaskId ? { opacity: 0.5, pointerEvents: 'none' } : {}) }}>
                        <UploadCloud size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#1e293b' }}>رفع صورة الموقع (360 أو عادية)</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>JPEG, PNG (أقصى حجم 10MB)</p>
                    </div>

                    <button
                        onClick={handleSimulateAnalysis}
                        disabled={isAnalyzing || !selectedTaskId}
                        style={{ width: '100%', padding: '14px', background: isAnalyzing ? '#94a3b8' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: isAnalyzing ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                        {isAnalyzing ? (
                            <>جاري تحلیل الصورة ورفع التقارير...</>
                        ) : (
                            <><Zap size={18} /> تشغيل التحليل بالذكاء الاصطناعي</>
                        )}
                    </button>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>ملاحظة: التشغيل الحالي في الوضع التجريبي.</p>
                </div>
            </div>

            {/* Results Panel */}
            <div style={{ flex: '2 1 500px', background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: '400px' }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <Layers size={24} color="#3b82f6" />
                    نتائج التحليل
                </h2>

                {isAnalyzing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', color: '#8b5cf6' }}>
                        <BrainCircuit size={60} style={{ animation: 'pulse 1.5s infinite' }} />
                        <h3 style={{ marginTop: '16px' }}>جارٍ مطابقة كود البناء السعودي واستخراج المخالفات...</h3>
                        <style>{`@keyframes pulse { 0% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.5; transform: scale(0.9); } }`}</style>
                    </div>
                ) : analysisData ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        {/* Summary Widget */}
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid #10b981' }}>
                            <div style={{ width: 100, height: 100, borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0', flexShrink: 0 }}>
                                <img src={analysisData.imageUrl} alt="Analysis Source" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>اكتمل التحليل بنجاح</h3>
                                <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>تم تحليل الصورة وإرسال النتائج لنظام التقييم وتحديث نسبة الإنجاز تلقائياً.</p>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                                    <span style={{ padding: '4px 12px', background: '#ecfdf5', color: '#10b981', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                        تقدم المشروع المضاف: +{analysisData.progressExtracted}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Violations */}
                        <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={18} /> مخالفات كود البناء (SBC)</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#991b1b', fontWeight: 'bold' }}>{analysisData.sbcViolations}</p>
                            {analysisData.analysisResult?.anomalies?.length > 0 && (
                                <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px', direction: 'rtl', color: '#b91c1c', fontSize: '0.85rem' }}>
                                    {analysisData.analysisResult.anomalies.map((a, i) => <li key={i}>{a}</li>)}
                                </ul>
                            )}
                        </div>

                        {/* Structural Integrity */}
                        <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#d97706', display: 'flex', alignItems: 'center', gap: '8px' }}><Camera size={18} /> التحليل الإنشائي</h4>
                            <div style={{ fontSize: '0.9rem', color: '#92400e', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div><strong>التشققات (Cracks):</strong> {analysisData.analysisResult?.cracksDetected ? 'مرصودة (خطورة)' : 'لم ترصد'}</div>
                                <div><strong>الغطاء الخرساني:</strong> {analysisData.analysisResult?.coverDepthEstimated}</div>
                                <div><strong>العناصر المكتشفة:</strong> {analysisData.analysisResult?.detectedObjects?.join(', ')}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                        <ImageIcon size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <h3>لا يوجد تحليل نشط حالياً</h3>
                        <p style={{ maxWidth: '300px', textAlign: 'center', fontSize: '0.9rem' }}>يرجى اختيار المهمة وتحديد صورة من الموقع لتطبيق خوارزميات الذكاء الاصطناعي واكتشاف المخالفات البنائية.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIReports;
