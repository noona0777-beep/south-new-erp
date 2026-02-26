import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { HardHat, ClipboardList, AlertTriangle, BrainCircuit, Users, MapPin, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../../config';

import TasksBoard from './TasksBoard';
import SiteVisits from './SiteVisits';
import TicketsRisks from './TicketsRisks';
import AIReports from './AIReports';
import EngineerEvaluation from './EngineerEvaluation';

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
        { id: 'tasks', label: 'المهام وكانبان', icon: <ClipboardList size={18} /> },
        { id: 'visits', label: 'الزيارات', icon: <MapPin size={18} /> },
        { id: 'tickets', label: 'الملاحظات والمخاطر', icon: <AlertTriangle size={18} /> },
        { id: 'ai', label: 'التحليل بالذكاء الاصطناعي', icon: <BrainCircuit size={18} /> },
        { id: 'eval', label: 'تقييم المهندسين', icon: <Users size={18} /> },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <HardHat size={28} color="#2563eb" /> إدارة العمليات الميدانية
                    </h1>
                    <p style={{ color: '#64748b', margin: 0 }}>متابعة المشاريع الميدانية والإشراف بالذكاء الاصطناعي</p>
                </div>

                {/* Project Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <Building2 size={20} color="#64748b" />
                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.95rem', fontWeight: '600', color: '#1e293b', fontFamily: 'Cairo', minWidth: '200px' }}
                    >
                        <option value="">-- اختر المشروع --</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Sub-navigation Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '10px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: activeTab === tab.id ? '#2563eb' : 'white',
                            color: activeTab === tab.id ? 'white' : '#64748b',
                            border: activeTab === tab.id ? 'none' : '1px solid #e2e8f0',
                            borderRadius: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === tab.id ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {!selectedProjectId && activeTab !== 'eval' ? (
                        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                            <Building2 size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>يرجى اختيار المشروع أولاً</h3>
                            <p>يجب تحديد المشروع من القائمة العلوية للبدء في إدارة العمليات الميدانية الخاصة به.</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'tasks' && <TasksBoard projectId={selectedProjectId} />}
                            {activeTab === 'visits' && <SiteVisits projectId={selectedProjectId} />}
                            {activeTab === 'tickets' && <TicketsRisks projectId={selectedProjectId} />}
                            {activeTab === 'ai' && <AIReports projectId={selectedProjectId} />}
                            {activeTab === 'eval' && <EngineerEvaluation projectId={selectedProjectId} />}
                        </>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default FieldOpsPage;
