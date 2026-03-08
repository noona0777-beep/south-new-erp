import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BrainCircuit, UploadCloud, AlertTriangle, Layers, Zap, Image as ImageIcon, Camera, CheckCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_URL from '@/config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const AIReports = ({ projectId }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    // Fetch Tasks
    const { data: tasks = [] } = useQuery({
        queryKey: ['fieldOps', 'tasks', projectId],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/field-ops/tasks/project/${projectId}`, { headers: H() });
            return res.data;
        },
        enabled: !!projectId
    });

    // Handle File Selection and Compression
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('حجم الصورة كبير جداً. أقصى حجم 10 ميجابايت.');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setAnalysisData(null); // reset old data
    };

    const convertToBase64AndCompress = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    // Extract base64 part
                    const base64 = dataUrl.split(',')[1];
                    resolve(base64);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleRealAnalysis = async () => {
        if (!selectedTaskId || !selectedFile) {
            alert('يرجى اختيار المهمة وتحديد الصورة أولاً.');
            return;
        }

        setIsAnalyzing(true);
        setAnalysisData(null);

        try {
            // Compress and convert to Base64
            const base64Image = await convertToBase64AndCompress(selectedFile);

            // Send to real API
            const res = await axios.post(`${API_URL}/field-ops/ai/analyze-image`, {
                taskId: selectedTaskId,
                imageBase64: base64Image
            }, { headers: H() });

            // Ensure preview URL is kept to show the user what they uploaded
            const dataToSet = res.data;
            dataToSet.imageUrl = previewUrl;

            setAnalysisData(dataToSet);
            queryClient.invalidateQueries(['fieldOps', 'tasks']);
            queryClient.invalidateQueries(['fieldOps', 'scores']);
        } catch (error) {
            console.error('Analysis Failed:', error);
            alert('فشل التحليل: ' + (error.response?.data?.error || error.message));
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
                    تحليل الصور الإنشائية (GPT Vision)
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

                    <div
                        onClick={() => selectedTaskId && fileInputRef.current?.click()}
                        style={{
                            background: previewUrl ? 'transparent' : 'white',
                            border: '2px dashed #cbd5e1',
                            borderRadius: '12px',
                            padding: previewUrl ? '0' : '30px',
                            textAlign: 'center',
                            cursor: selectedTaskId ? 'pointer' : 'not-allowed',
                            transition: 'border 0.2s',
                            overflow: 'hidden',
                            position: 'relative',
                            ...(!selectedTaskId ? { opacity: 0.5 } : {})
                        }}
                    >
                        {previewUrl ? (
                            <>
                                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                                    <span style={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><UploadCloud /> تغيير الصورة</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <UploadCloud size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#1e293b' }}>اختيار صورة أو التقاط بالكاميرا</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>JPEG, PNG (أقصى حجم 10MB)</p>
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment" // Good for phones
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                    </div>

                    <button
                        onClick={handleRealAnalysis}
                        disabled={isAnalyzing || !selectedTaskId || !selectedFile}
                        style={{ width: '100%', padding: '14px', background: isAnalyzing || !selectedFile ? '#94a3b8' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: isAnalyzing || !selectedFile ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}
                    >
                        {isAnalyzing ? (
                            <>جاري التحليل السحابي العميق...</>
                        ) : (
                            <><Zap size={18} /> بدء التحليل بالذكاء الاصطناعي</>
                        )}
                    </button>
                    {!selectedFile && <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>الرجاء التقاط صورة لبدء التحليل.</p>}
                </div>
            </div>

            {/* Results Panel */}
            <div style={{ flex: '2 1 500px', background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: '400px' }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <Layers size={24} color="#3b82f6" />
                    نتائج تحليل OpenAI Vision
                </h2>

                {isAnalyzing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', color: '#8b5cf6' }}>
                        <BrainCircuit size={60} style={{ animation: 'pulse 1.5s infinite' }} />
                        <h3 style={{ marginTop: '16px' }}>جارٍ مطابقة كود البناء السعودي واستخراج المخالفات...</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>يعتمد وقت التحليل على حجم الصورة، يرجى الانتظار ثوانٍ معدودة.</p>
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
                                <h3 style={{ margin: '0 0 8px 0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle size={20} />
                                    اكتمل التحليل الفعلي بنجاح
                                </h3>
                                <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>تم تخزين التقرير الآلي وربطه بالمهمة المحددة.</p>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                                    <span style={{ padding: '6px 14px', background: '#ecfdf5', color: '#10b981', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', border: '1px solid #a7f3d0' }}>
                                        الإنجاز التقريبي: {analysisData.progressExtracted}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Violations */}
                        <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={18} /> المخالفات ومطابقة الجودة</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#991b1b', fontWeight: 'bold' }}>{analysisData.sbcViolations}</p>
                            {analysisData.analysisResult?.anomalies?.length > 0 && (
                                <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px', direction: 'rtl', color: '#b91c1c', fontSize: '0.85rem' }}>
                                    {analysisData.analysisResult.anomalies.map((a, i) => <li key={i}>{a}</li>)}
                                </ul>
                            )}
                        </div>

                        {/* Structural Integrity */}
                        <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#d97706', display: 'flex', alignItems: 'center', gap: '8px' }}><Camera size={18} /> العناصر المكتشفة بالصورة</h4>
                            <div style={{ fontSize: '0.9rem', color: '#92400e', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div><strong>حالة التشققات:</strong> {analysisData.analysisResult?.cracksDetected ? '⚠️ مرصودة' : '✅ لم ترصد'}</div>
                                <div><strong>الغطاء الخرساني:</strong> {analysisData.analysisResult?.coverDepthEstimated}</div>
                                <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '8px', marginTop: '4px' }}>
                                    <strong>المرئيات:</strong>
                                    <ul style={{ margin: '4px 0 0 0', paddingRight: '20px' }}>
                                        {(analysisData.analysisResult?.detectedObjects || []).map((o, i) => (
                                            <li key={i}>{o}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                        <ImageIcon size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <h3>في انتظار رفع صورة المهمة</h3>
                        <p style={{ maxWidth: '300px', textAlign: 'center', fontSize: '0.9rem' }}>سيقوم محرك الذكاء الاصطناعي (OpenAI Vision) بالتعرف التلقائي على تفاصيل الموقع واستخراج التنبيهات.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIReports;
