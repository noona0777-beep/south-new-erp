import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Users, TrendingUp, Award, CheckCircle2, Zap, BrainCircuit, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { buttonClick } from '../Common/MotionComponents';
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

    if (isLoading) return <div style={{ color: '#71717a', padding: '100px', textAlign: 'center' }}><Clock className="animate-spin" size={40} /></div>;

    const topEngineer = scores[0];

    return (
        <div style={{ direction: 'rtl' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#fff', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '10px', borderRadius: '12px' }}><Award size={28} color="#fbbf24" /></div>
                        منظومة تقييم الأداء والمكافآت
                    </h2>
                    <p style={{ margin: '10px 0 0 0', color: '#a1a1aa', fontSize: '1rem', fontWeight: '600' }}>تحليل ذكي لسرعة التنفيذ وجودة التقارير الميدانية.</p>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: '8px 15px', borderRadius: '10px', border: 'none', background: 'transparent', color: '#fff', fontWeight: '900', cursor: 'pointer', outline: 'none' }}>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m} style={{ background: '#09090b' }}>شهر {m}</option>)}
                        </select>
                        <select value={year} onChange={(e) => setYear(e.target.value)} style={{ padding: '8px 15px', borderRadius: '10px', border: 'none', background: 'transparent', color: '#fff', fontWeight: '900', cursor: 'pointer', outline: 'none' }}>
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y} style={{ background: '#09090b' }}>{y}</option>)}
                        </select>
                    </div>
                    <motion.button
                        {...buttonClick}
                        onClick={calculateAll}
                        disabled={calcLoading}
                        style={{
                            padding: '12px 25px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none',
                            borderRadius: '14px', cursor: 'pointer', fontWeight: '900', fontSize: '0.95rem',
                            display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)'
                        }}
                    >
                        {calcLoading ? <Clock size={18} className="animate-spin" /> : <TrendingUp size={18} />}
                        تحديث التقييم الشامل
                    </motion.button>
                </div>
            </div>


            {msg && (
                <div style={{ padding: '12px 20px', borderRadius: '12px', background: msg.includes('✅') ? '#ecfdf5' : '#eff6ff', color: msg.includes('✅') ? '#065f46' : '#2563eb', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', border: '1px solid currentColor' }}>
                    <CheckCircle2 size={18} /> {msg}
                </div>
            )}

            {/* Quick Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px', marginBottom: '35px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '25px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: '900' }}>المهندسين</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff' }}>{scores.length}</div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '25px', borderRadius: '25px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 15px 30px -10px rgba(16,185,129,0.3)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Award size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: '900' }}>الأعلى كفاءة</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '900' }}>{topEngineer?.engineer?.name || '—'}</div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '25px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: '900' }}>التزام السلامة</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff' }}>
                            {scores.length > 0 ? (scores.reduce((a, b) => a + (b.safetyComplianceScore || 0), 0) / scores.length).toFixed(0) : 0}%
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '25px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                        <Zap size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: '900' }}>سرعة الإغلاق</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff' }}>
                            {scores.length > 0 ? (scores.reduce((a, b) => a + (b.closureSpeedScore || 0), 0) / scores.length).toFixed(0) : 0}%
                        </div>
                    </div>
                </motion.div>
            </div>


            {/* Performance Matrix */}
            <div className="glass-card" style={{ borderRadius: '30px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ padding: '20px 25px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#fff' }}>مصفوفة نتائج الأداء (المعايير الثمانية)</h3>
                </div>
                <div className="table-responsive">
                    <table className="table-glass" style={{ margin: 0, minWidth: '1200px' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'right', padding: '15px 25px' }}>المهندس</th>
                                <th style={{ textAlign: 'center' }}>المنجز (15%)</th>
                                <th style={{ textAlign: 'center' }}>السرعة (10%)</th>
                                <th style={{ textAlign: 'center' }}>الجودة (15%)</th>
                                <th style={{ textAlign: 'center' }}>الذكاء (10%)</th>
                                <th style={{ textAlign: 'center' }}>الميدان (15%)</th>
                                <th style={{ textAlign: 'center' }}>GPS (15%)</th>
                                <th style={{ textAlign: 'center' }}>الرضا (10%)</th>
                                <th style={{ textAlign: 'center' }}>الالتزام (10%)</th>
                                <th style={{ textAlign: 'center' }}>المجموع</th>
                                <th style={{ textAlign: 'center' }}>المستوى</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.map((score, index) => {
                                const performanceLabel = score.finalScore >= 90 ? 'استثنائي' : score.finalScore >= 80 ? 'متميز' : score.finalScore >= 70 ? 'جيد جداً' : 'تطوير';
                                const perfColor = score.finalScore >= 90 ? '#10b981' : score.finalScore >= 80 ? '#6366f1' : score.finalScore >= 70 ? '#f59e0b' : '#ef4444';


                                return (
                                    <motion.tr key={score.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
                                        <td style={{ padding: '15px 25px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '0.8rem' }}>{index + 1}</div>
                                                <div style={{ fontWeight: '900', color: '#fff', fontSize: '1rem' }}>{score.engineer?.name}</div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: '700', color: '#a1a1aa' }}>{Math.round(score.tasksCompletedScore)}%</td>
                                        <td style={{ textAlign: 'center', fontWeight: '700', color: '#a1a1aa' }}>{Math.round(score.closureSpeedScore)}%</td>
                                        <td style={{ textAlign: 'center', fontWeight: '700', color: '#a1a1aa' }}>{Math.round(score.technicalDepthScore)}%</td>
                                        <td style={{ textAlign: 'center', fontWeight: '700', color: '#a1a1aa' }}>{Math.round(score.aiAccuracyScore)}%</td>
                                        <td style={{ textAlign: 'center', fontWeight: '700', color: '#10b981' }}>{Math.round(score.safetyComplianceScore)}%</td>
                                        <td style={{ textAlign: 'center', fontWeight: '700', color: '#6366f1' }}>{Math.round(score.gpsAccuracyScore)}%</td>
                                        <td style={{ textAlign: 'center', fontWeight: '700', color: '#f59e0b' }}>{Math.round(score.feedbackScore)}%</td>
                                        <td style={{ textAlign: 'center', fontWeight: '700', color: '#a1a1aa' }}>{Math.round(score.attendanceScore)}%</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: perfColor }}>{Math.round(score.finalScore)}</div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '900', background: `${perfColor}15`, color: perfColor, border: `1px solid ${perfColor}30` }}>
                                                {performanceLabel}
                                            </span>
                                        </td>
                                    </motion.tr>
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
