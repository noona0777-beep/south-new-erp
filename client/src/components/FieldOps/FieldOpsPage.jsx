import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
    HardHat, ClipboardList, AlertTriangle, BrainCircuit, Users, 
    MapPin, Building2, Search, Filter, RefreshCw, 
    CheckCircle2, XCircle, Clock, ShieldAlert, Zap,
    ChevronDown, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '@/config';

import TasksBoard from './TasksBoard';
import SiteVisits from './SiteVisits';
import TicketsRisks from './TicketsRisks';
import AIReports from './AIReports';
import EngineerEvaluation from './EngineerEvaluation';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const FieldOpsPage = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('tasks');
    const [selectedProjectId, setSelectedProjectId] = useState('');

    const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/projects`, { headers: H() });
            return res.data;
        }
    });

    const tabs = [
        { id: 'tasks', label: 'المهام وكانبان', icon: <ClipboardList size={22} /> },
        { id: 'visits', label: 'الزيارات الميدانية', icon: <MapPin size={22} /> },
        { id: 'tickets', label: 'الملاحظات والمخاطر', icon: <AlertTriangle size={22} /> },
        { id: 'ai', label: 'تحليل الذكاء الاصطناعي', icon: <BrainCircuit size={22} /> },
        { id: 'eval', label: 'تقييم المهندسين', icon: <Users size={22} /> },
    ];

    const stats = [
        { label: 'مهام قيد التنفيذ', value: 12, icon: <Clock size={24} />, color: '#6366f1' },
        { label: 'زيارات مكتملة', value: 45, icon: <CheckCircle2 size={24} />, color: '#10b981' },
        { label: 'مخاطر حرجة', value: 3, icon: <ShieldAlert size={24} />, color: '#ef4444' },
        { label: 'توصيات AI', value: 8, icon: <Zap size={24} />, color: '#f59e0b' },
    ];

    return (
        <div className="fade-in" style={{ direction: 'rtl' }}>
             {/* Header */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '45px', flexWrap: 'wrap', gap: '30px' }}>
                <div>
                    <h2 style={{ margin: '0 0 12px 0', fontSize: '2.8rem', fontWeight: '900', color: '#fff' }} className="gradient-text">إدارة العمليات الميدانية</h2>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '1.1rem', fontWeight: '600' }}>متابعة المشاريع الميدانية، الرقابة الذكية، وتقييم أداء الفرق الهندسية.</p>
                </div>
                
                {/* Project Selector (Enhanced) */}
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
                    <div style={{ background: 'rgba(99,102,241,0.1)', padding: '10px', borderRadius: '15px', color: '#6366f1' }}>
                        <Building2 size={24} />
                    </div>
                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="premium-input"
                        style={{ border: 'none', background: 'transparent', fontSize: '1.1rem', fontWeight: '900', color: '#fff', minWidth: '250px', cursor: 'pointer' }}
                    >
                        <option value="" style={{ background: '#09090b', color: '#52525b' }}>-- اختر المشروع العقاري --</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id} style={{ background: '#09090b', color: '#fff' }}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Field Stats Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '45px' }}>
                {stats.map((s, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className="glass-card card-hover" style={{ padding: '25px 30px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                         <div style={{ background: `${s.color}15`, padding: '12px', borderRadius: '15px', color: s.color }}>{s.icon}</div>
                         <div>
                            <div style={{ fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '800' }}>{s.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>{s.value}</div>
                         </div>
                    </motion.div>
                ))}
            </div>

            {/* Sub-navigation Tabs (Vertical or Horizontal) */}
            <div className="glass-card" style={{ display: 'flex', gap: '12px', marginBottom: '45px', padding: '8px', borderRadius: '24px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.06)' }}>
                {tabs.map(tab => (
                    <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: 1.02 }}
                        style={{
                            padding: '16px 30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: activeTab === tab.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                            color: activeTab === tab.id ? '#fff' : '#71717a',
                            border: 'none',
                            borderRadius: '18px',
                            fontWeight: '900',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s',
                            fontFamily: 'Cairo'
                        }}
                    >
                        {tab.icon} {tab.label}
                        {activeTab === tab.id && <motion.div layoutId="activeTabField" style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%', marginLeft: '5px', boxShadow: '0 0 10px #fff' }} />}
                    </motion.button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab + selectedProjectId}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                >
                    {!selectedProjectId && activeTab !== 'eval' ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '120px 40px', borderRadius: '40px', border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.01)' }}>
                            <Building2 size={80} style={{ margin: '0 auto 30px auto', opacity: 0.1, color: '#6366f1' }} />
                            <h3 style={{ fontSize: '2rem', marginBottom: '15px', color: '#fff', fontWeight: '900' }}>نحن بانتظار اختيار المشروع</h3>
                            <p style={{ color: '#a1a1aa', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.8' }}>يرجى تحديد المشروع من القائمة العلوية للبدء في تتبع العمليات الميدانية والمهام وكانبان لهذا المشروع تحديداً.</p>
                            <motion.button {...buttonClick} style={{ marginTop: '40px', padding: '14px 40px', borderRadius: '18px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid #6366f133', fontWeight: '900', cursor: 'pointer' }}>تصفح قائمة المشاريع النشطة</motion.button>
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: '40px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.06)', minHeight: '600px' }}>
                            {activeTab === 'tasks' && <TasksBoard projectId={selectedProjectId} />}
                            {activeTab === 'visits' && <SiteVisits projectId={selectedProjectId} />}
                            {activeTab === 'tickets' && <TicketsRisks projectId={selectedProjectId} />}
                            {activeTab === 'ai' && <AIReports projectId={selectedProjectId} />}
                            {activeTab === 'eval' && <EngineerEvaluation projectId={selectedProjectId} />}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default FieldOpsPage;
