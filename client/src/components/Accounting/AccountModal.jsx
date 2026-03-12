import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus, FolderTree, Tag, Hash } from 'lucide-react';
import { buttonClick } from '../Common/MotionComponents';
import axios from 'axios';
import API_URL from '@/config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const AccountModal = ({ accounts, onClose, onSave }) => {
    const [form, setForm] = useState({
        name: '',
        code: '',
        parentId: '',
        type: 'ACCOUNT', // HEADING or ACCOUNT
        nature: 'DEBIT' // DEBIT or CREDIT
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (!form.name || !form.code) return;
        setIsSaving(true);
        try {
            await axios.post(`${API_URL}/accounts`, {
                ...form,
                parentId: form.parentId ? parseInt(form.parentId) : null
            }, { headers: H() });
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
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '40px', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', fontWeight: '900' }}>إضافة حساب جديد في الشجرة</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}><X size={28} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: '#a1a1aa', fontWeight: '800', fontSize: '0.9rem' }}>اسم الحساب (بالعربي)</label>
                        <div style={{ position: 'relative' }}>
                            <Tag size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="premium-input" style={{ paddingRight: '45px' }} placeholder="مثلاً: مخزون المواد الخام" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ color: '#a1a1aa', fontWeight: '800', fontSize: '0.9rem' }}>كود الحساب</label>
                            <div style={{ position: 'relative' }}>
                                <Hash size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                                <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="premium-input" style={{ paddingRight: '45px' }} placeholder="مثلاً: 1102" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ color: '#a1a1aa', fontWeight: '800', fontSize: '0.9rem' }}>الحساب الأب</label>
                            <select value={form.parentId} onChange={e => setForm({...form, parentId: e.target.value})} className="premium-input" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <option value="">-- حساب جذري (مستوى 1) --</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ color: '#a1a1aa', fontWeight: '800', fontSize: '0.9rem' }}>نوع الحساب</label>
                            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="premium-input" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <option value="ACCOUNT">حساب فرعي (قابل للحركة)</option>
                                <option value="HEADING">رأس مجموعة (رئيسي)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ color: '#a1a1aa', fontWeight: '800', fontSize: '0.9rem' }}>طبيعة الحساب</label>
                            <select value={form.nature} onChange={e => setForm({...form, nature: e.target.value})} className="premium-input" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <option value="DEBIT">مدين (Debit)</option>
                                <option value="CREDIT">دائن (Credit)</option>
                            </select>
                        </div>
                    </div>

                    <motion.button 
                        {...buttonClick} 
                        onClick={handleSubmit}
                        disabled={!form.name || !form.code || isSaving}
                        style={{ 
                            marginTop: '20px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                            color: '#fff', border: 'none', padding: '16px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' 
                        }}
                    >
                        {isSaving ? 'جاري الحفظ...' : <><Save size={20} /> اعتماد الحساب في الشجرة</>}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AccountModal;
