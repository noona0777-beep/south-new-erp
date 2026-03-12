import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Tag, Hash, Package, DollarSign, List, Warehouse } from 'lucide-react';
import { buttonClick } from '../Common/MotionComponents';
import axios from 'axios';
import API_URL from '@/config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const ProductModal = ({ categories, product = null, onClose, onSave }) => {
    const [form, setForm] = useState({
        name: '',
        sku: '',
        categoryId: '',
        price: '',
        cost: '',
        description: '',
        unit: 'PCS'
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (product) {
            setForm({
                ...product,
                categoryId: product.categoryId || '',
                price: product.price || '',
                cost: product.cost || ''
            });
        }
    }, [product]);

    const handleSubmit = async () => {
        if (!form.name) return;
        setIsSaving(true);
        try {
            const data = {
                ...form,
                categoryId: form.categoryId ? parseInt(form.categoryId) : null,
                price: parseFloat(form.price) || 0,
                cost: parseFloat(form.cost) || 0
            };
            if (product) {
                await axios.put(`${API_URL}/products/${product.id}`, data, { headers: H() });
            } else {
                await axios.post(`${API_URL}/products`, data, { headers: H() });
            }
            onSave();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card" style={{ width: '100%', maxWidth: '700px', padding: '40px', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', fontWeight: '900' }}>{product ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}><X size={28} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: '#a1a1aa', fontWeight: '800', fontSize: '0.9rem' }}>اسم المنتج المختصر</label>
                        <div style={{ position: 'relative' }}>
                            <Package size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="premium-input" style={{ paddingRight: '45px' }} placeholder="مثلاً: خرسانة جاهزة C35" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ color: '#a1a1aa', fontWeight: '800', fontSize: '0.9rem' }}>كود المنتج (SKU)</label>
                            <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="premium-input" placeholder="INV-001" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ color: '#a1a1aa', fontWeight: '800', fontSize: '0.9rem' }}>القسم / التصنيف</label>
                            <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="premium-input" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <option value="">-- اختر التصنيف --</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ color: '#a1a1aa', fontWeight: '800', fontSize: '0.9rem' }}>سعر البيع</label>
                            <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="premium-input" placeholder="0.00" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ color: '#a1a1aa', fontWeight: '800', fontSize: '0.9rem' }}>سعر التكلفة</label>
                            <input type="number" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} className="premium-input" placeholder="0.00" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ color: '#a1a1aa', fontWeight: '800', fontSize: '0.9rem' }}>الوحدة</label>
                            <input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="premium-input" placeholder="طن / متر / قطعة" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: '#a1a1aa', fontWeight: '800', fontSize: '0.9rem' }}>الوصف التفصيلي</label>
                        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="premium-input" style={{ minHeight: '100px', resize: 'vertical' }} placeholder="أدخل تفاصيل ومواصفات المنتج..." />
                    </div>

                    <motion.button 
                        {...buttonClick} 
                        onClick={handleSubmit}
                        disabled={!form.name || isSaving}
                        style={{ 
                            marginTop: '20px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                            color: '#fff', border: 'none', padding: '16px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' 
                        }}
                    >
                        {isSaving ? 'جاري الحفظ...' : <><Save size={20} /> اعتماد وحفظ المنتج</>}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProductModal;
