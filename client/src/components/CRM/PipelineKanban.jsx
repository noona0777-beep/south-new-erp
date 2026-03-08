import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Target, Plus, DollarSign, Clock, Calendar } from 'lucide-react';
import API_URL from '@/config';
import { motion } from 'framer-motion';

const STAGES = {
    DISCOVERY: { id: 'DISCOVERY', title: 'اكتشاف (جديد)', color: '#3b82f6' },
    PROPOSAL: { id: 'PROPOSAL', title: 'تقديم عرض', color: '#f59e0b' },
    NEGOTIATION: { id: 'NEGOTIATION', title: 'مفاوضات', color: '#8b5cf6' },
    WON: { id: 'WON', title: 'مغلق (ربح)', color: '#10b981' },
    LOST: { id: 'LOST', title: 'مغلق (خسارة)', color: '#ef4444' }
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

            // Only active leads for new opportunities
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
            // Update UI optimistically
            const newOpps = Array.from(opportunities);
            const movedOppIndex = newOpps.findIndex(o => o.id.toString() === draggableId);
            const movedOpp = { ...newOpps[movedOppIndex], stage: destination.droppableId };
            newOpps[movedOppIndex] = movedOpp;
            setOpportunities(newOpps);

            // Send API update
            try {
                const token = localStorage.getItem('token');
                await axios.put(`${API_URL}/crm/opportunities/${draggableId}/stage`,
                    { stage: destination.droppableId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error("Failed to update status", error);
                // Revert on fail
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

    // Grouping by stage
    const columns = Object.values(STAGES).map(stage => {
        return {
            ...stage,
            items: opportunities.filter(opp => opp.stage === stage.id) || []
        }
    });

    const formatAmount = (num) => new Intl.NumberFormat('ar-SA').format(num);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>جاري التحميل...</div>;

    return (
        <div style={{ padding: '24px', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>مسار المبيعات (Pipeline)</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>اسحب وأفلت الفرص لتحديث حالتها ومتابعة مسار الصبقات.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <Plus size={18} /> فرصة جديدة
                </button>
            </div>

            <div style={{ flex: 1, overflowX: 'auto', paddingBottom: '20px' }}>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div style={{ display: 'flex', gap: '20px', minWidth: 'min-content', height: '100%' }}>
                        {columns.map(col => (
                            <div key={col.id} style={{ background: '#f8fafc', borderRadius: '12px', minWidth: '320px', display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <div style={{ padding: '16px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: col.color }}></div>
                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#1e293b' }}>{col.title}</h3>
                                    </div>
                                    <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        {col.items.length}
                                    </span>
                                </div>

                                <Droppable droppableId={col.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            style={{
                                                flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
                                                background: snapshot.isDraggingOver ? `${col.color}10` : 'transparent',
                                                transition: 'background 0.2s ease',
                                                overflowY: 'auto'
                                            }}
                                        >
                                            {col.items.map((opp, index) => (
                                                <Draggable key={opp.id} draggableId={opp.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                                background: '#fff',
                                                                padding: '16px',
                                                                borderRadius: '10px',
                                                                boxShadow: snapshot.isDragging ? '0 10px 20px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                                                                border: '1px solid #e2e8f0',
                                                                borderRight: `4px solid ${col.color}`,
                                                                ...provided.draggableProps.style
                                                            }}
                                                        >
                                                            <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', fontSize: '1rem' }}>{opp.title}</div>
                                                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <Target size={14} /> للعميل: {opp.lead?.name}
                                                            </div>
                                                            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} /> {formatAmount(opp.value)} ر.س</div>
                                                                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#3b82f6' }}>{opp.probability}% نسبة</div>
                                                                </div>
                                                                {opp.expectedClose && (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>
                                                                        <Calendar size={12} /> متوقع في {new Date(opp.expectedClose).toLocaleDateString()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
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

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', color: '#0f172a' }}>إضافة فرصة بيعية جديدة</h3>
                        <form onSubmit={handleCreateOpp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>عنوان الصفقة *</label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="مثال: تصميم وتنفيذ فيلا سكنية" />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>ربط مع عميل محتمل *</label>
                                <select required value={formData.leadId} onChange={e => setFormData({ ...formData, leadId: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                    <option value="">اختر العميل...</option>
                                    {leads.map(l => (
                                        <option key={l.id} value={l.id}>{l.name} {l.company ? `(${l.company})` : ''}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>القيمة المتوقعة (ر.س)</label>
                                    <input type="number" min="0" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>نسبة الاحتمالية (%)</label>
                                    <input type="number" min="0" max="100" value={formData.probability} onChange={e => setFormData({ ...formData, probability: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>تاريخ الإغلاق المتوقع</label>
                                <input type="date" value={formData.expectedClose} onChange={e => setFormData({ ...formData, expectedClose: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>إلغاء</button>
                                <button type="submit" style={{ flex: 1, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>حفظ وإضافة</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PipelineKanban;
