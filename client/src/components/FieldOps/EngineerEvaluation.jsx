import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users, TrendingUp, Award, CheckCircle2, Zap, BrainCircuit, Clock } from 'lucide-react';
import API_URL from '../../config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const EngineerEvaluation = ({ projectId }) => {
    // projectId is available but evaluation usually spans across all projects or you can filter by project context.
    // For now, evaluation is usually monthly per engineer.
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);

    const { data: scores = [], isLoading } = useQuery({
        queryKey: ['fieldOps', 'scores', month, year],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/field-ops/scores?month=${month}&year=${year}`, { headers: H() });
            return res.data;
        }
    });

    if (isLoading) return <div className="p-8 text-center text-slate-400 font-bold">جاري تحميل التقييمات...</div>;

    return (
        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={24} color="#8b5cf6" />
                    تقييم أداء المهندسين وإغلاق المهام
                </h2>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 'bold' }}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>شهر {m}</option>)}
                    </select>
                    <select value={year} onChange={(e) => setYear(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 'bold' }}>
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {/* Formula Explanation */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', fontSize: '0.9rem' }}>
                <div style={{ color: '#64748b', fontWeight: 'bold' }}>توزيع درجات التقييم (100 نقطة):</div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ padding: '4px 10px', background: '#eff6ff', color: '#3b82f6', borderRadius: '6px' }}>المهام المنجزة (25%)</span>
                    <span style={{ padding: '4px 10px', background: '#f5f3ff', color: '#8b5cf6', borderRadius: '6px' }}>سرعة الإغلاق (20%)</span>
                    <span style={{ padding: '4px 10px', background: '#ecfdf5', color: '#10b981', borderRadius: '6px' }}>جودة التقارير (20%)</span>
                    <span style={{ padding: '4px 10px', background: '#fffbeb', color: '#f59e0b', borderRadius: '6px' }}>دقة الذكاء الاصطناعي (20%)</span>
                    <span style={{ padding: '4px 10px', background: '#fef2f2', color: '#ef4444', borderRadius: '6px' }}>الحضور الميداني (15%)</span>
                </div>
            </div>

            {/* Scores Table */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '14px', color: '#475569', fontSize: '0.9rem' }}>المهندس</th>
                            <th style={{ padding: '14px', color: '#475569', fontSize: '0.9rem', textAlign: 'center' }}>المهام (25)</th>
                            <th style={{ padding: '14px', color: '#475569', fontSize: '0.9rem', textAlign: 'center' }}>السرعة (20)</th>
                            <th style={{ padding: '14px', color: '#475569', fontSize: '0.9rem', textAlign: 'center' }}>الجودة (20)</th>
                            <th style={{ padding: '14px', color: '#475569', fontSize: '0.9rem', textAlign: 'center' }}>الذكاء الاصطناعي (20)</th>
                            <th style={{ padding: '14px', color: '#475569', fontSize: '0.9rem', textAlign: 'center' }}>الحضور (15)</th>
                            <th style={{ padding: '14px', color: '#10b981', fontSize: '0.9rem', textAlign: 'center' }}>النتيجة النهائية</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scores.map((score, index) => (
                            <tr key={score.id} style={{ borderBottom: '1px solid #f1f5f9', background: index === 0 ? '#f0fdf4' : 'white' }}>
                                <td style={{ padding: '14px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {index === 0 && <Award size={18} color="#10b981" />}
                                    {score.engineer?.name || 'غير معروف'}
                                </td>
                                <td style={{ padding: '14px', textAlign: 'center', fontWeight: 'bold', color: '#3b82f6' }}>{Math.round(score.tasksCompletedScore * 0.25)}</td>
                                <td style={{ padding: '14px', textAlign: 'center', fontWeight: 'bold', color: '#8b5cf6' }}>{Math.round(score.closureSpeedScore * 0.20)}</td>
                                <td style={{ padding: '14px', textAlign: 'center', fontWeight: 'bold', color: '#10b981' }}>{Math.round(score.reportQualityScore * 0.20)}</td>
                                <td style={{ padding: '14px', textAlign: 'center', fontWeight: 'bold', color: '#f59e0b' }}>{Math.round(score.aiAccuracyScore * 0.20)}</td>
                                <td style={{ padding: '14px', textAlign: 'center', fontWeight: 'bold', color: '#ef4444' }}>{Math.round(score.attendanceScore * 0.15)}</td>
                                <td style={{ padding: '14px', textAlign: 'center', fontSize: '1.2rem', fontWeight: '900', color: index === 0 ? '#10b981' : '#1e293b' }}>
                                    {Math.round(score.finalScore)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {scores.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: 'bold' }}>لا توجد تقييمات محسوبة لهذا الشهر بعد. يرجى أتمتة حساب التقييم من لوحة الذكاء الاصطناعي.</div>
                )}
            </div>
        </div>
    );
};

export default EngineerEvaluation;
