import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Home, User, Calendar, Plus, ChevronLeft, LayoutGrid, List } from 'lucide-react';
import API_URL from '../../config';

const RealEstatePage = () => {
    const [properties, setProperties] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [units, setUnits] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('PROPERTIES'); // PROPERTIES, UNITS, CONTRACT_FORM

    // Form States
    const [showPropForm, setShowPropForm] = useState(false);
    const [showUnitForm, setShowUnitForm] = useState(false);
    const [propData, setPropData] = useState({ name: '', type: 'RESIDENTIAL', address: '' });
    const [unitData, setUnitData] = useState({ unitNumber: '', floor: '', type: 'APARTMENT' });
    const [contractData, setContractData] = useState({
        unitId: '', tenantId: '', startDate: '', endDate: '', rentAmount: '', paymentFrequency: 'MONTHLY'
    });

    useEffect(() => {
        fetchProperties();
        fetchPartners();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await axios.get(`${API_URL}/properties`);
            setProperties(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching properties', err);
        }
    };

    const fetchPartners = async () => {
        try {
            const res = await axios.get(`${API_URL}/partners`);
            setPartners(res.data);
        } catch (err) {
            console.error('Error fetching partners', err);
        }
    };

    const fetchUnits = async (propId) => {
        try {
            const res = await axios.get(`${API_URL}/properties/${propId}/units`);
            setUnits(res.data);
            setView('UNITS');
        } catch (err) {
            console.error('Error fetching units', err);
        }
    };

    const handleCreateProperty = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/properties`, propData);
            setShowPropForm(false);
            setPropData({ name: '', type: 'RESIDENTIAL', address: '' });
            fetchProperties();
        } catch (err) { alert('فشل حفظ العقار'); }
    };

    const handleCreateUnit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/units`, { ...unitData, propertyId: selectedProperty.id });
            setShowUnitForm(false);
            setUnitData({ unitNumber: '', floor: '', type: 'APARTMENT' });
            fetchUnits(selectedProperty.id);
        } catch (err) { alert('فشل حفظ الوحدة'); }
    };

    const handleCreateContract = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/contracts`, contractData);
            setView('UNITS');
            fetchUnits(selectedProperty.id);
            alert('تم إنشاء العقد بنجاح');
        } catch (err) { alert('فشل إنشاء العقد'); }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>جاري التحميل...</div>;

    return (
        <div className="fade-in" style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>إدارة الأملاك والعقارات</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                        <span style={{ cursor: 'pointer' }} onClick={() => setView('PROPERTIES')}>العقارات</span>
                        {selectedProperty && (
                            <>
                                <ChevronLeft size={16} />
                                <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{selectedProperty.name}</span>
                            </>
                        )}
                    </div>
                </div>
                {view === 'PROPERTIES' && (
                    <button onClick={() => setShowPropForm(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Plus size={18} /> إضافة عقار جديد
                    </button>
                )}
                {view === 'UNITS' && (
                    <button onClick={() => setShowUnitForm(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Plus size={18} /> إضافة وحدة جديدة
                    </button>
                )}
            </div>

            {/* View: Properties List */}
            {view === 'PROPERTIES' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {properties.map(prop => (
                        <div key={prop.id} onClick={() => { setSelectedProperty(prop); fetchUnits(prop.id); }} style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', cursor: 'pointer', border: '1px solid #f1f5f9' }} className="card-hover">
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{ background: '#eff6ff', color: '#2563eb', padding: '12px', borderRadius: '12px' }}>
                                    <Building2 size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>{prop.name}</h3>
                                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>{prop.address || 'لا يوجد عنوان'}</p>
                                </div>
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>عدد الوحدات: <b style={{ color: '#1e293b' }}>{prop.units?.length || 0}</b></span>
                                <span style={{ background: '#f1f5f9', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', color: '#64748b' }}>
                                    {prop.type === 'RESIDENTIAL' ? 'سكني' : 'تجاري'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {properties.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '15px', color: '#94a3b8' }}>
                            <Building2 size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                            <p>لا توجد عقارات مسجلة حتى الآن.</p>
                        </div>
                    )}
                </div>
            )}

            {/* View: Units List */}
            {view === 'UNITS' && (
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>وحدات {selectedProperty?.name}</h3>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'right' }}>رقم الوحدة</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>الدور</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>النوع</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>الحالة</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {units.map(unit => (
                                <tr key={unit.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{unit.unitNumber}</td>
                                    <td style={{ padding: '12px' }}>{unit.floor || '-'}</td>
                                    <td style={{ padding: '12px' }}>{unit.type === 'APARTMENT' ? 'شقة' : 'محل/مكتب'}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            background: unit.status === 'VACANT' ? '#ecfdf5' : '#fef2f2',
                                            color: unit.status === 'VACANT' ? '#059669' : '#dc2626',
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold'
                                        }}>
                                            {unit.status === 'VACANT' ? 'شاغرة' : 'مؤجرة'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {unit.status === 'VACANT' ? (
                                            <button onClick={() => { setContractData({ ...contractData, unitId: unit.id }); setView('CONTRACT_FORM'); }} style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                تأجير الوحدة
                                            </button>
                                        ) : (
                                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>مؤجرة لـ {unit.contracts?.[0]?.tenant?.name}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* View: Contract Form */}
            {view === 'CONTRACT_FORM' && (
                <div style={{ background: 'white', padding: '30px', borderRadius: '16px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
                    <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar /> إنشاء عقد إيجار جديد
                    </h3>
                    <form onSubmit={handleCreateContract} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748b' }}>المستأجر</label>
                            <select value={contractData.tenantId} onChange={e => setContractData({ ...contractData, tenantId: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required>
                                <option value="">اختر المستأجر...</option>
                                {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748b' }}>مبلغ الإيجار</label>
                            <input type="number" value={contractData.rentAmount} onChange={e => setContractData({ ...contractData, rentAmount: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="0.00 ر.س" required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748b' }}>تاريخ البدء</label>
                            <input type="date" value={contractData.startDate} onChange={e => setContractData({ ...contractData, startDate: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748b' }}>تاريخ الانتهاء</label>
                            <input type="date" value={contractData.endDate} onChange={e => setContractData({ ...contractData, endDate: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                        </div>
                        <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button type="button" onClick={() => setView('UNITS')} style={{ padding: '12px 30px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>إلغاء</button>
                            <button type="submit" style={{ padding: '12px 40px', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>حفظ العقد وتفعيل العقد</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal: New Property */}
            {showPropForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '450px' }}>
                        <h3>إضافة عقار جديد</h3>
                        <form onSubmit={handleCreateProperty}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>اسم العقار</label>
                                <input type="text" value={propData.name} onChange={e => setPropData({ ...propData, name: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} required placeholder="مثال: برج الشمال" />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>النوع</label>
                                <select value={propData.type} onChange={e => setPropData({ ...propData, type: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
                                    <option value="RESIDENTIAL">سكني</option>
                                    <option value="COMMERCIAL">تجاري</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>العنوان</label>
                                <input type="text" value={propData.address} onChange={e => setPropData({ ...propData, address: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} placeholder="المدينة، الحي..." />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setShowPropForm(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>إلغاء</button>
                                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none' }}>حفظ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: New Unit */}
            {showUnitForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '450px' }}>
                        <h3>إضافة وحدة لـ {selectedProperty?.name}</h3>
                        <form onSubmit={handleCreateUnit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>رقم الوحدة</label>
                                <input type="text" value={unitData.unitNumber} onChange={e => setUnitData({ ...unitData, unitNumber: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} required />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>الدور</label>
                                <input type="text" value={unitData.floor} onChange={e => setUnitData({ ...unitData, floor: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>نوع الوحدة</label>
                                <select value={unitData.type} onChange={e => setUnitData({ ...unitData, type: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
                                    <option value="APARTMENT">شقة</option>
                                    <option value="OFFICE">مكتب</option>
                                    <option value="STORE">محل تجاري</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setShowUnitForm(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>إلغاء</button>
                                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none' }}>حفظ الوحدة</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealEstatePage;
