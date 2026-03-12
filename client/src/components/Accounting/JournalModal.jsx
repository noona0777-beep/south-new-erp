import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2, Calculator, AlertCircle, CheckCircle2 } from 'lucide-react';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';
import axios from 'axios';
import API_URL from '@/config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const JournalModal = ({ accounts, onClose, onSave }) => {
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [lines, setLines] = useState([
        { accountId: '', debit: 0, credit: 0 },
        { accountId: '', debit: 0, credit: 0 }
    ]);
    const [isSaving, setIsSaving] = useState(false);

    const totalDebit = lines.reduce((sum, ln) => sum + Number(ln.debit || 0), 0);
    const totalCredit = lines.reduce((sum, ln) => sum + Number(ln.credit || 0), 0);
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;

    const handleAddLine = () => setLines([...lines, { accountId: '', debit: 0, credit: 0 }]);
    const handleRemoveLine = (idx) => setLines(lines.filter((_, i) => i !== idx));

    const handleSubmit = async () => {
        if (!isBalanced) return;
        setIsSaving(true);
        try {
            await axios.post(`${API_URL}/journal`, {
                description,
                date,
                lines: lines.map(ln => ({
                    accountId: parseInt(ln.accountId),
                    debit: parseFloat(ln.debit) || 0,
                    credit: parseFloat(ln.credit) || 0
                }))
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
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card" style={{ width: '100%', maxWidth: '900px', padding: '40px', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', fontWeight: '900' }}>تسجيل قيد محاسبي جديد</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}><X size={28} /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '35px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: '#a1a1aa', fontWeight: '800', fontSize: '0.9rem' }}>وصف القيد / البيان</label>
                        <input value={description} onChange={e => setDescription(e.target.value)} className="premium-input" placeholder="مثلاً: سداد إيجار المكتب الشهري..." />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: '#a1a1aa', fontWeight: '800', fontSize: '0.9rem' }}>تاريخ العملية</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="premium-input" />
                    </div>
                </div>

                <div style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: '25px', paddingRight: '5px' }} className="main-scroll">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ color: '#71717a', fontSize: '0.85rem' }}>
                            <tr>
                                <th style={{ textAlign: 'right', padding: '10px' }}>الحساب</th>
                                <th style={{ textAlign: 'right', padding: '10px' }}>مدين (Dr)</th>
                                <th style={{ textAlign: 'right', padding: '10px' }}>دائن (Cr)</th>
                                <th style={{ width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((ln, idx) => (
                                <tr key={idx}>
                                    <td style={{ padding: '8px' }}>
                                        <select 
                                            value={ln.accountId} 
                                            onChange={e => {
                                                const newLines = [...lines];
                                                newLines[idx].accountId = e.target.value;
                                                setLines(newLines);
                                            }} 
                                            className="premium-input"
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.02)' }}
                                        >
                                            <option value="">-- اختر الحساب --</option>
                                            {accounts.map(acc => (
                                                <optgroup key={acc.id} label={acc.name}>
                                                    {acc.children?.map(child => (
                                                        <option key={child.id} value={child.id}>{child.code} - {child.name}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input type="number" value={ln.debit} onChange={e => {
                                            const newLines = [...lines];
                                            newLines[idx].debit = e.target.value;
                                            if (e.target.value > 0) newLines[idx].credit = 0;
                                            setLines(newLines);
                                        }} className="premium-input" />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <input type="number" value={ln.credit} onChange={e => {
                                            const newLines = [...lines];
                                            newLines[idx].credit = e.target.value;
                                            if (e.target.value > 0) newLines[idx].debit = 0;
                                            setLines(newLines);
                                        }} className="premium-input" />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <button onClick={() => handleRemoveLine(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: lines.length > 2 ? 1 : 0.3 }} disabled={lines.length <= 2}><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <motion.button {...buttonClick} onClick={handleAddLine} style={{ marginTop: '15px', background: 'rgba(255,255,255,0.03)', color: '#6366f1', border: '1px dashed #6366f155', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
                        <Plus size={16} /> إضافة سطر جديد
                    </motion.button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px', background: 'rgba(0,0,0,0.1)', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', gap: '40px' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: '800' }}>إجمالي المدين</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>{totalDebit.toLocaleString()} ر.س</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: '800' }}>إجمالي الدائن</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>{totalCredit.toLocaleString()} ر.س</div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
                             {isBalanced ? (
                                 <><CheckCircle2 size={20} color="#10b981" /> <span style={{ color: '#10b981', fontWeight: '800' }}>القيد متوازن</span></>
                             ) : (
                                 <><AlertCircle size={20} color="#ef4444" /> <span style={{ color: '#ef4444', fontWeight: '800' }}>القيد غير متوازن</span></>
                             )}
                        </div>
                        <motion.button 
                            {...buttonClick} 
                            onClick={handleSubmit}
                            disabled={!isBalanced || isSaving}
                            style={{ 
                                background: !isBalanced ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                                color: '#fff', border: 'none', padding: '14px 40px', borderRadius: '18px', fontWeight: '900', cursor: isBalanced ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '12px' 
                            }}
                        >
                            {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <><Save size={20} /> ترحيل القيد للمحاسبة</>}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default JournalModal;
