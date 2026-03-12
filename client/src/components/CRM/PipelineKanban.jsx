import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Target, Plus, DollarSign, Clock, Calendar, MoreHorizontal, User, Sparkles, Filter, ChevronRight, Briefcase } from 'lucide-react';
import API_URL from '@/config';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = {
    DISCOVERY: { id: 'DISCOVERY', title: 'اكتشاف (جديد)', color: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)' },
    PROPOSAL: { id: 'PROPOSAL', title: 'تقديم عرض', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
    NEGOTIATION: { id: 'NEGOTIATION', title: 'مفاوضات', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' },
    WON: { id: 'WON', title: 'مغلق (ربح)', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
    LOST: { id: 'LOST', title: 'مغلق (خسارة)', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' }
};

const PipelineKanban = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leads, setLeads] = useState([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', value: '', probability: 50, expectedClose: '', leadId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [oppsRes, leadsRes] = await Promise.all([
                axios.get(`${API_URL}/crm/opportunities`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/crm/leads`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setOpportunities(oppsRes.data);
            setLeads(leadsRes.data.filter(l => l.status !== 'LOST' && l.status !== 'CONVERTED'));
        } catch (error) {
            console.error('Error fetching CRM data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;

        if (source.droppableId !== destination.droppableId) {
            const newOpps = Array.from(opportunities);
            const movedOppIndex = newOpps.findIndex(o => o.id.toString() === draggableId);
            const movedOpp = { ...newOpps[movedOppIndex], stage: destination.droppableId };
            newOpps[movedOppIndex] = movedOpp;
            setOpportunities(newOpps);

            try {
                const token = localStorage.getItem('token');
                await axios.put(`${API_URL}/crm/opportunities/${draggableId}/stage`,
                    { stage: destination.droppableId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error("Failed to update status", error);
                fetchData();
            }
        }
    };

    const handleCreateOpp = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/crm/opportunities`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            setFormData({ title: '', description: '', value: '', probability: 50, expectedClose: '', leadId: '' });
            fetchData();
        } catch (error) {
            alert('حدث خطأ أثناء إضافة الفرصة البيعية.');
        }
    };

    const columns = Object.values(STAGES).map(stage => ({
        ...stage,
        items: opportunities.filter(opp => opp.stage === stage.id) || []
    }));

    const formatAmount = (num) => new Intl.NumberFormat('ar-SA').format(num);

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <RefreshCw className="animate-spin" size={30} color="#6366f1" style={{ marginBottom: '15px' }} />
                <div style={{ color: '#a1a1aa', fontWeight: '800' }}>جاري تحميل مسار المبيعات...</div>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '0px', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '35px' }}>
                <div>
                   <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', margin: 0 }} className="gradient-text">مسار المبيعات التفاعلي</h1>
                   <p style={{ margin: '6px 0 0 0', color: '#a1a1aa', fontSize: '1.1rem', fontWeight: '500' }}>تحكم كامل في مراحل الصفقات والفرص البيعية الذكية</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)} 
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '900', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)' }}
                    >
                        <Plus size={20} /> فرصة جديدة
                    </motion.button>
                </div>
            </div>

            <div style={{ flex: 1, overflowX: 'auto', paddingBottom: '30px', scrollbarWidth: 'thin' }} className="main-scroll">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div style={{ display: 'flex', gap: '25px', minWidth: 'min-content', height: '100%' }}>
                        {columns.map(col => (
                            <div key={col.id} className="glass-card" style={{ borderRadius: '24px', minWidth: '350px', maxWidth: '350px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15, 23, 42, 0.4)' }}>
                                <div style={{ padding: '20px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color, boxShadow: `0 0 10px ${col.glow}` }}></div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#fff' }}>{col.title}</h3>
                                    </div>
                                    <span style={{ background: 'rgba(255,255,255,0.05)', color: '#a1a1aa', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '800', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        {col.items.length}
                                    </span>
                                </div>

                                <Droppable droppableId={col.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            style={{
                                                flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px',
                                                background: snapshot.isDraggingOver ? `rgba(255,255,255,0.02)` : 'transparent',
                                                transition: 'all 0.3s ease',
                                                overflowY: 'auto'
                                            }}
                                            className="main-scroll"
                                        >
                                            {col.items.map((opp, index) => (
                                                <Draggable key={opp.id} draggableId={opp.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <motion.div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                                background: snapshot.isDragging ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.03)',
                                                                padding: '20px',
                                                                borderRadius: '20px',
                                                                boxShadow: snapshot.isDragging ? '0 20px 50px rgba(0,0,0,0.4)' : '0 4px 6px rgba(0,0,0,0.1)',
                                                                border: '1px solid rgba(255,255,255,0.05)',
                                                                borderRight: `5px solid ${col.color}`,
                                                                backdropFilter: snapshot.isDragging ? 'blur(10px)' : 'none',
                                                                ...provided.draggableProps.style
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                                <div style={{ fontWeight: '900', color: '#fff', fontSize: '1.1rem', lineHeight: '1.4' }}>{opp.title}</div>
                                                                <button style={{ color: '#52525b', background: 'none', border: 'none', cursor: 'pointer' }}><MoreHorizontal size={18} /></button>
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                                                                <User size={14} color={col.color} /> {opp.lead?.name}
                                                            </div>
                                                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                        <DollarSign size={16} color="#10b981" /> {formatAmount(opp.value)}
                                                                    </div>
                                                                    <div style={{ background: `${col.color}15`, border: `1px solid ${col.color}20`, padding: '4px 10px', borderRadius: '8px', color: col.color, fontSize: '0.8rem', fontWeight: '800' }}>
                                                                        {opp.probability}% <Sparkles size={10} style={{ display: 'inline' }} />
                                                                    </div>
                                                                </div>
                                                                {opp.expectedClose && (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#52525b', fontWeight: '800', marginTop: '5px' }}>
                                                                        <Calendar size={14} /> إغلاق: {new Date(opp.expectedClose).toLocaleDateString()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            </div>

            {/* Modal Redesign */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '40px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '14px', color: '#6366f1' }}><Plus size={24} /></div>
                                <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>فرصة بيعية جديدة</h3>
                            </div>
                            <form onSubmit={handleCreateOpp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '700' }}>عنوان الفرصة البيعية *</label>
                                    <input required type="text" className="premium-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%' }} placeholder="مثال: توريد مواد بناء لأمانة جدة" />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '700' }}>العميل المرتبط *</label>
                                    <select required className="premium-input-select" value={formData.leadId} onChange={e => setFormData({ ...formData, leadId: e.target.value })} style={{ width: '100%' }}>
                                        <option value="">اختر عميل محتمل لربط الصفقة...</option>
                                        {leads.map(l => (
                                            <option key={l.id} value={l.id}>{l.name} {l.company ? `(${l.company})` : ''}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '700' }}>القيمة المتوقعة (ر.س)</label>
                                        <input type="number" className="premium-input" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '700' }}>الاحتمالية (%)</label>
                                        <input type="number" className="premium-input" value={formData.probability} onChange={e => setFormData({ ...formData, probability: e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '700' }}>تاريخ الإغلاق المستهدف</label>
                                    <input type="date" className="premium-input" value={formData.expectedClose} onChange={e => setFormData({ ...formData, expectedClose: e.target.value })} style={{ width: '100%' }} />
                                </div>

                                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', cursor: 'pointer', fontWeight: '900' }}>إلغاء</button>
                                    <button type="submit" style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: '900', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)' }}>بدأ تتبع الصفقة</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PipelineKanban;
