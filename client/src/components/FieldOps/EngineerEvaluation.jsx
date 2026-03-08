import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Users, TrendingUp, Award, CheckCircle2, Zap, BrainCircuit, Clock, Shield } from 'lucide-react';
import API_URL from '@/config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const EngineerEvaluation = ({ projectId }) => {
    const queryClient = useQueryClient();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [calcLoading, setCalcLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const { data: scores = [], isLoading } = useQuery({
        queryKey: ['fieldOps', 'scores', month, year],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/field-ops/scores?month=${month}&year=${year}`, { headers: H() });
            return res.data;
        }
    });

    const calculateAll = async () => {
        setCalcLoading(true);
        setMsg('جاري تحليل البيانات واستخراج النتائج...');
        try {
            await axios.post(`${API_URL}/field-ops/scores/calculate-all`, { month, year }, { headers: H() });
            queryClient.invalidateQueries(['fieldOps', 'scores']);
            setTimeout(() => setMsg('✅ تم تحديث مصفوفة التقييم بنجاح'), 1000);
        } catch (err) {
            setMsg('❌ فشل تحديث التقييم');
        } finally {
            setCalcLoading(false);
            setTimeout(() => setMsg(''), 4000);
        }
    };

    if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: 'bold' }}>جاري تحميل مصفوفة التقييم...</div>;

    const topEngineer = scores[0];

    return (
        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '18px', fontFamily: 'Cairo, sans-serif' }}>

            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Award size={28} className="text-amber-500" />
                        نظام تقييم الأداء الميداني
                    </h2>
                    <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>تحليل ذكي لسرعة التنفيذ وجودة التقارير المدعومة بالذكاء الاصطناعي</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: 'white', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'white', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>شهر {m}</option>)}
                        </select>
                        <select value={year} onChange={(e) => setYear(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'white', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}>
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={calculateAll}
                        disabled={calcLoading}
                        style={{
                            padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none',
                            borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                    >
                        {calcLoading ? <Clock size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                        تحديث التقييم (8 معايير)
                    </button>
                </div>
            </div>

            {msg && (
                <div style={{ padding: '12px 20px', borderRadius: '12px', background: msg.includes('✅') ? '#ecfdf5' : '#eff6ff', color: msg.includes('✅') ? '#065f46' : '#2563eb', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', border: '1px solid currentColor' }}>
                    <CheckCircle2 size={18} /> {msg}
                </div>
            )}

            {/* Quick Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>إجمالي المهندسين</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b' }}>{scores.length}</div>
                    </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', padding: '20px', borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 10px 20px -5px rgba(16,185,129,0.3)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Award size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: '600' }}>أعلى كفاءة ميدانية</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{topEngineer?.engineer?.name || '—'}</div>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>التزام السلامة (HSE)</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b' }}>
                            {scores.length > 0 ? (scores.reduce((a, b) => a + (b.safetyComplianceScore || 0), 0) / scores.length).toFixed(0) : 0}%
                        </div>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                        <Zap size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>متوسط سرعة الإغلاق</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b' }}>
                            {scores.length > 0 ? (scores.reduce((a, b) => a + (b.closureSpeedScore || 0), 0) / scores.length).toFixed(0) : 0}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Matrix */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#334155' }}>مصفوفة نتائج الأداء (المعايير الثمانية المعتمدة)</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '1000px' }}>
                        <thead>
                            <tr style={{ background: 'white' }}>
                                <th style={{ padding: '16px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700' }}>المهندس</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>المنجز (15%)</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>السرعة (10%)</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>الجودة (15%)</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>AI (10%)</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>السلامة (15%)</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>GPS (15%)</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>الرضا (10%)</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>الحضور (10%)</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>النتيجة</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>التقييم</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.map((score, index) => {
                                const rankColor = index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#d97706' : '#cbd5e1';
                                const performanceLabel = score.finalScore >= 90 ? 'ممتاز' : score.finalScore >= 80 ? 'جيد جداً' : score.finalScore >= 70 ? 'جيد' : 'يحتاج تطوير';
                                const perfColor = score.finalScore >= 90 ? '#059669' : score.finalScore >= 80 ? '#2563eb' : score.finalScore >= 70 ? '#d97706' : '#dc2626';

                                return (
                                    <tr key={score.id} style={{ borderTop: '1px solid #f8fafc', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '28px', height: '28px', borderRadius: '50%', background: rankColor,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.7rem'
                                                }}>
                                                    {index + 1}
                                                </div>
                                                <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.85rem' }}>{score.engineer?.name}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#334155', fontSize: '0.85rem' }}>{Math.round(score.tasksCompletedScore)}%</td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#334155', fontSize: '0.85rem' }}>{Math.round(score.closureSpeedScore)}%</td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#334155', fontSize: '0.85rem' }}>{Math.round(score.technicalDepthScore)}%</td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#334155', fontSize: '0.85rem' }}>{Math.round(score.aiAccuracyScore)}%</td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#059669', fontSize: '0.85rem' }}>{Math.round(score.safetyComplianceScore)}%</td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#2563eb', fontSize: '0.85rem' }}>{Math.round(score.gpsAccuracyScore)}%</td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#d97706', fontSize: '0.85rem' }}>{Math.round(score.feedbackScore)}%</td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#334155', fontSize: '0.85rem' }}>{Math.round(score.attendanceScore)}%</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: perfColor }}>{Math.round(score.finalScore)}</div>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '800',
                                                background: `${perfColor}15`, color: perfColor, border: `1px solid ${perfColor}30`
                                            }}>
                                                {performanceLabel}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {scores.length === 0 && (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <BrainCircuit size={48} style={{ margin: '0 auto 15px', color: '#cbd5e1' }} />
                        <p style={{ color: '#94a3b8', fontWeight: 'bold' }}>اضغط على "تحديث التقييم" لتوزيع النقاط بناءً على المعايير الثمانية الجديدة</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EngineerEvaluation;
