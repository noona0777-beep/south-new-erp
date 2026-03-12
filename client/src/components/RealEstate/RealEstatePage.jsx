import React, { useState, useMemo } from 'react';
import axios from 'axios';
import API_URL from '@/config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Building2, Home, User, Calendar, Plus, 
    ChevronLeft, LayoutGrid, List, Clock, AlertOctagon,
    MapPin, Wallet, FileText, CheckCircle2, XCircle,
    TrendingUp, ArrowUpRight, ArrowDownLeft, Trash2, Edit,
    Search, Filter, RefreshCw, Key, Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const RealEstatePage = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [view, setView] = useState('PROPERTIES'); // PROPERTIES, UNITS, CONTRACT_FORM
    const [searchTerm, setSearchTerm] = useState('');

    // Form States
    const [showPropForm, setShowPropForm] = useState(false);
    const [showUnitForm, setShowUnitForm] = useState(false);
    const [propData, setPropData] = useState({ name: '', type: 'RESIDENTIAL', address: '' });
    const [unitData, setUnitData] = useState({ unitNumber: '', floor: '', type: 'APARTMENT' });
    const [contractData, setContractData] = useState({
        unitId: '', tenantId: '', startDate: '', endDate: '', rentAmount: '', paymentFrequency: 'MONTHLY'
    });

    // Queries
    const { data: properties = [], isLoading: propsLoading, error: propsError } = useQuery({
        queryKey: ['properties'],
        queryFn: async () => (await axios.get(`${API_URL}/properties`, { headers: H() })).data
    });

    const { data: partners = [] } = useQuery({
        queryKey: ['partners'],
        queryFn: async () => (await axios.get(`${API_URL}/partners`, { headers: H() })).data
    });

    const { data: units = [], isLoading: unitsLoading } = useQuery({
        queryKey: ['units', selectedProperty?.id],
        queryFn: async () => (await axios.get(`${API_URL}/properties/${selectedProperty.id}/units`, { headers: H() })).data,
        enabled: !!selectedProperty && view === 'UNITS'
    });

    // Mutations
    const createPropertyMutation = useMutation({
        mutationFn: async (data) => await axios.post(`${API_URL}/properties`, data, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            showToast('تم إضافة العقار بنجاح', 'success');
            setShowPropForm(false);
            setPropData({ name: '', type: 'RESIDENTIAL', address: '' });
        }
    });

    const createUnitMutation = useMutation({
        mutationFn: async (data) => await axios.post(`${API_URL}/units`, { ...data, propertyId: selectedProperty.id }, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units', selectedProperty.id] });
            showToast('تم إضافة الوحدة العقارية بنجاح', 'success');
            setShowUnitForm(false);
            setUnitData({ unitNumber: '', floor: '', type: 'APARTMENT' });
        }
    });

    const createContractMutation = useMutation({
        mutationFn: async (data) => await axios.post(`${API_URL}/contracts`, data, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['units', selectedProperty.id] });
            showToast('تم إنشاء عقد الإيجار بنجاح', 'success');
            setView('UNITS');
        }
    });

    const handleCreateProperty = (e) => {
        e.preventDefault();
        createPropertyMutation.mutate(propData);
    };

    const handleCreateUnit = (e) => {
        e.preventDefault();
        createUnitMutation.mutate(unitData);
    };

    const handleCreateContract = (e) => {
        e.preventDefault();
        createContractMutation.mutate(contractData);
    };

    // Stats
    const stats = useMemo(() => {
        const totalUnits = properties.reduce((acc, curr) => acc + (curr.units?.length || 0), 0);
        const occupied = properties.reduce((acc, curr) => 
            acc + (curr.units?.filter(u => u.status === 'OCCUPIED').length || 0), 0);
        const vacant = totalUnits - occupied;
        const totalRevenue = properties.length * 1250000; // Placeholder calculation
        return { total: properties.length, totalUnits, occupied, vacant, totalRevenue };
    }, [properties]);

    if (propsLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '150px', color: '#a1a1aa' }}>
                <RefreshCw className="animate-spin" size={60} style={{ color: '#6366f1', marginBottom: '25px' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>جاري جرد المحفظة العقارية...</h3>
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ direction: 'rtl' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '45px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ margin: '0 0 12px 0', fontSize: '2.8rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.04em' }} className="gradient-text">إدارة الأملاك والعقارات</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#a1a1aa', fontSize: '1.1rem', fontWeight: '600' }}>
                        <span style={{ cursor: 'pointer', color: view === 'PROPERTIES' ? '#6366f1' : 'inherit' }} onClick={() => { setView('PROPERTIES'); setSelectedProperty(null); }}>المشاريع العقارية</span>
                        {selectedProperty && (
                            <>
                                <ChevronLeft size={20} style={{ opacity: 0.5 }} />
                                <span style={{ color: '#fff', fontWeight: '900' }}>{selectedProperty.name}</span>
                            </>
                        )}
                        {view === 'CONTRACT_FORM' && (
                            <>
                                <ChevronLeft size={20} style={{ opacity: 0.5 }} />
                                <span style={{ color: '#10b981', fontWeight: '900' }}>عقد إيجار جديد</span>
                            </>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '18px' }}>
                    {view === 'PROPERTIES' && (
                        <motion.button {...buttonClick} onClick={() => setShowPropForm(true)} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', padding: '14px 35px', borderRadius: '20px', cursor: 'pointer', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 15px 35px rgba(99,102,241,0.3)' }}>
                            <Plus size={22} /> إضافة عقار جديـد
                        </motion.button>
                    )}
                    {view === 'UNITS' && (
                        <motion.button {...buttonClick} onClick={() => setShowUnitForm(true)} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '14px 35px', borderRadius: '20px', cursor: 'pointer', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 15px 35px rgba(16, 185, 129, 0.3)' }}>
                            <Plus size={22} /> إضافة وحدة عقارية
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Stats Dashboard */}
            {view === 'PROPERTIES' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px', marginBottom: '45px' }}>
                    {[
                        { label: 'إجمالي العقارات', value: stats.total, icon: <Building size={28} />, color: '#6366f1' },
                        { label: 'إجمالي الوحدات', value: stats.totalUnits, icon: <Home size={28} />, color: '#8b5cf6' },
                        { label: 'وحدات شاغرة', value: stats.vacant, icon: <Key size={28} />, color: '#10b981' },
                        { label: 'القيمة التقديرية (بالملايين)', value: (stats.totalRevenue / 1000000).toFixed(1), icon: <TrendingUp size={28} />, color: '#ef4444', suffix: 'ر.س' },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="glass-card card-hover" style={{ padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ background: `${s.color}15`, padding: '15px', borderRadius: '18px', color: s.color }}>{s.icon}</div>
                                <div>
                                    <div style={{ fontSize: '1rem', color: '#a1a1aa', fontWeight: '700' }}>{s.label}</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>{s.value} <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>{s.suffix}</span></div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Search & Filters (Global) */}
            {view !== 'CONTRACT_FORM' && (
                <div className="glass-card" style={{ padding: '20px 30px', borderRadius: '24px', marginBottom: '40px', display: 'flex', gap: '20px', alignItems: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={22} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                        <input 
                            type="text" 
                            placeholder="بحث عن عقار، وحدة، مستأجر، أو رقم عقد..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="premium-input" 
                            style={{ width: '100%', paddingRight: '50px', border: 'none', background: 'transparent' }} 
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button className="premium-input" style={{ border: 'none', padding: '12px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#a1a1aa', fontWeight: '800' }}><Filter size={20} /> تصفية</button>
                    </div>
                </div>
            )}

            {/* Main Views */}
            <AnimatePresence mode="wait">
                {view === 'PROPERTIES' && (
                    <motion.div key="props" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '30px' }}>
                        {properties.map((prop, idx) => (
                            <motion.div 
                                key={prop.id} 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => { setSelectedProperty(prop); setView('UNITS'); }} 
                                className="glass-card card-hover" 
                                style={{ padding: '30px', borderRadius: '35px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}
                            >
                                <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, transparent 100%)', borderRadius: '0 0 0 100%' }} />
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '25px' }}>
                                    <div style={{ background: '#6366f115', color: '#6366f1', padding: '18px', borderRadius: '20px', boxShadow: '0 10px 20px rgba(99,102,241,0.1)' }}>
                                        <Building2 size={32} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#fff', fontWeight: '900' }}>{prop.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa', marginTop: '6px', fontSize: '0.95rem' }}>
                                            <MapPin size={16} /> {prop.address || 'حي الصحافة، الرياض'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '25px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: '700' }}>الوحدات</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>{prop.units?.length || 0}</div>
                                        </div>
                                        <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '20px' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: '700' }}>النوع</div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '900', color: prop.type === 'RESIDENTIAL' ? '#8b5cf6' : '#f59e0b' }}>
                                                {prop.type === 'RESIDENTIAL' ? 'سكني' : 'تجاري'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '14px', color: '#6366f1' }}>
                                        <ArrowUpRight size={22} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {view === 'UNITS' && (
                    <motion.div key="units" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="glass-card" style={{ padding: 0, borderRadius: '35px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="table-responsive">
                                <table className="table-glass" style={{ margin: 0 }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <tr>
                                            <th style={{ textAlign: 'right', padding: '25px' }}>رقم الوحدة</th>
                                            <th style={{ textAlign: 'center' }}>الدور</th>
                                            <th style={{ textAlign: 'center' }}>التصنيف</th>
                                            <th style={{ textAlign: 'center' }}>الحالة</th>
                                            <th style={{ textAlign: 'center' }}>المؤجر / العقد</th>
                                            <th style={{ textAlign: 'center' }}>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {unitsLoading ? (
                                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px' }}><RefreshCw className="animate-spin" size={40} style={{ color: '#6366f1' }} /></td></tr>
                                        ) : units.map((unit, idx) => (
                                            <motion.tr key={unit.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                                                <td style={{ padding: '20px 25px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                                            <Home size={22} />
                                                        </div>
                                                        <div style={{ fontWeight: '900', color: '#fff', fontSize: '1.2rem' }}>{unit.unitNumber}</div>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center', color: '#a1a1aa', fontWeight: '800' }}>{unit.floor || 'G'}</td>
                                                <td style={{ textAlign: 'center', color: '#a1a1aa', fontWeight: '800' }}>{unit.type === 'APARTMENT' ? 'شقة' : 'مكتب'}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className={`status-pill ${unit.status === 'VACANT' ? 'status-paid' : 'status-pending'}`}>
                                                        {unit.status === 'VACANT' ? 'شاغرة' : 'مؤجرة'}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {unit.status === 'VACANT' ? (
                                                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setContractData({ ...contractData, unitId: unit.id }); setView('CONTRACT_FORM'); }} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', padding: '8px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '0.85rem' }}>
                                                            تأجير الوحدة الآن
                                                        </motion.button>
                                                    ) : (
                                                        <div style={{ color: '#fff', fontWeight: '700' }}>{unit.contracts?.[0]?.tenant?.name || 'مستأجر حالي'}</div>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                        <motion.button whileHover={{ scale: 1.1 }} style={{ background: 'rgba(255,255,255,0.05)', color: '#a1a1aa', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><Edit size={18} /></motion.button>
                                                        <motion.button whileHover={{ scale: 1.1 }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><Trash2 size={18} /></motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'CONTRACT_FORM' && (
                    <motion.div key="contract" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card" style={{ padding: '60px', borderRadius: '40px', maxWidth: '1000px', margin: '0 auto', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '45px' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.1)' }}>
                                <FileText size={32} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', color: '#fff' }}>تحرير عقد إيجار قانوني</h3>
                                <p style={{ margin: '5px 0 0 0', color: '#a1a1aa', fontWeight: '600' }}>أدخل بيانات المستأجر والشروط المالية لتوليد العقد آلياً.</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateContract}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '35px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '1rem', color: '#a1a1aa', fontWeight: '800' }}>المستأجر (العميل)</label>
                                    <select value={contractData.tenantId} onChange={e => setContractData({ ...contractData, tenantId: e.target.value })} className="premium-input" style={{ width: '100%' }} required>
                                        <option value="">اختر من قائمة الشركاء والعملاء...</option>
                                        {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '1rem', color: '#a1a1aa', fontWeight: '800' }}>القيمة الإيجارية (السنوية)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type="number" value={contractData.rentAmount} onChange={e => setContractData({ ...contractData, rentAmount: e.target.value })} className="premium-input" style={{ width: '100%', paddingLeft: '60px' }} placeholder="0.00" required />
                                        <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontWeight: '900' }}>ر.س</div>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '1rem', color: '#a1a1aa', fontWeight: '800' }}>تاريخ بداية التعاقد</label>
                                    <input type="date" value={contractData.startDate} onChange={e => setContractData({ ...contractData, startDate: e.target.value })} className="premium-input" style={{ width: '100%' }} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '1rem', color: '#a1a1aa', fontWeight: '800' }}>تاريخ انتهاء التعاقد</label>
                                    <input type="date" value={contractData.endDate} onChange={e => setContractData({ ...contractData, endDate: e.target.value })} className="premium-input" style={{ width: '100%' }} required />
                                </div>
                            </div>
                            
                            <div className="glass-card" style={{ padding: '30px', borderRadius: '25px', marginBottom: '45px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#f59e0b', marginBottom: '15px' }}>
                                    <AlertOctagon size={24} />
                                    <span style={{ fontWeight: '900' }}>شروط عامة:</span>
                                </div>
                                <p style={{ margin: 0, color: '#71717a', fontSize: '0.95rem', lineHeight: '1.8' }}>سيتم احتساب الدفعات آلياً بناءً على دورة السداد (شهرياً). يتوجب على المستأجر سداد قيمة التأمين قبل استلام المفاتيح. هذا العقد ملزم للطرفين بعد الاعتماد الإلكتروني.</p>
                            </div>

                            <div style={{ display: 'flex', gap: '20px' }}>
                                <button type="button" onClick={() => setView('UNITS')} style={{ flex: 1, padding: '18px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#a1a1aa', fontWeight: '800', cursor: 'pointer' }}>تراجع</button>
                                <motion.button {...buttonClick} type="submit" style={{ flex: 2, padding: '18px', borderRadius: '18px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', fontWeight: '900', cursor: 'pointer', boxShadow: '0 15px 35px rgba(16, 185, 129, 0.2)', fontSize: '1.1rem' }}>اعتماد العقد وإرساله للتوقيع</motion.button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals (Standard Glass Modals) */}
            <AnimatePresence>
                {showPropForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(15px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass-card" style={{ width: '100%', maxWidth: '550px', padding: '45px', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', fontWeight: '900' }} className="gradient-text">إضافة مجمع عقاري</h3>
                                <button onClick={() => setShowPropForm(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', color: '#a1a1aa', cursor: 'pointer' }}><XCircle size={24} /></button>
                            </div>
                            <form onSubmit={handleCreateProperty}>
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '800' }}>إسم العقار / البرج</label>
                                    <input type="text" value={propData.name} onChange={e => setPropData({ ...propData, name: e.target.value })} className="premium-input" style={{ width: '100%' }} placeholder="مثال: واحة الياسمين" required />
                                </div>
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '800' }}>التنصيف التشغيلي</label>
                                    <select value={propData.type} onChange={e => setPropData({ ...propData, type: e.target.value })} className="premium-input" style={{ width: '100%', background: 'rgba(255,255,255,0.03)' }}>
                                        <option value="RESIDENTIAL">سكني (Residential)</option>
                                        <option value="COMMERCIAL">تجاري (Commercial)</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '40px' }}>
                                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '800' }}>الموقع الجغرافي</label>
                                    <input type="text" value={propData.address} onChange={e => setPropData({ ...propData, address: e.target.value })} className="premium-input" style={{ width: '100%' }} placeholder="الرياض، حي الصحافة" />
                                </div>
                                <motion.button {...buttonClick} type="submit" style={{ width: '100%', padding: '16px', borderRadius: '18px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 15px 30px rgba(99,102,241,0.3)' }}>
                                    تأكيد الإضافة والربط بكارطة المنشآت
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RealEstatePage;
