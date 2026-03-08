import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { X, Package, AlertTriangle, Send, Loader2 } from 'lucide-react';
import API_URL from '@/config';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const MaterialRequestModal = ({ isOpen, onClose, projectId, taskId, siteVisitId }) => {
    const queryClient = useQueryClient();
    const [selectedCat, setSelectedCat] = useState('');
    const [selectedProd, setSelectedProd] = useState('');
    const [qty, setQty] = useState(1);
    const [urgency, setUrgency] = useState('NORMAL');
    const [notes, setNotes] = useState('');
    const [success, setSuccess] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Fetch Categories
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => (await axios.get(`${API_URL}/categories`, { headers: H() })).data
    });

    // Fetch Products by Category
    const { data: products = [] } = useQuery({
        queryKey: ['products', selectedCat],
        queryFn: async () => (await axios.get(`${API_URL}/products?categoryId=${selectedCat}`, { headers: H() })).data,
        enabled: !!selectedCat
    });

    const mutation = useMutation({
        mutationFn: async (data) => await axios.post(`${API_URL}/material-requests`, data, { headers: H() }),
        onSuccess: () => {
            setSuccess(true);
            queryClient.invalidateQueries(['material-requests']);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setSelectedProd('');
                setQty(1);
                setNotes('');
            }, 2000);
        }
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedProd) return alert('الرجاء اختيار صنف');
        mutation.mutate({
            projectId,
            taskId,
            siteVisitId,
            engineerId: user.id || 1,
            productId: selectedProd,
            quantity: qty,
            urgency,
            notes
        });
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '18px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <h3 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
                        <Package size={20} color="#2563eb" /> طلب توريد مواد للموقع
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                </div>

                {success ? (
                    <div style={{ padding: '40px', textLength: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Send size={30} />
                        </div>
                        <h2 style={{ color: '#065f46', margin: 0 }}>تم إرسال الطلب بنجاح!</h2>
                        <p style={{ color: '#64748b', textAlign: 'center' }}>سيتم مراجعة طلبك من قبل إدارة المستودعات والرد عليك قريباً.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>القسم (التصنيف)</label>
                            <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', outline: 'none' }} required>
                                <option value="">اختر القسم...</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>الصنف المطلوب</label>
                            <select value={selectedProd} onChange={e => setSelectedProd(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', outline: 'none' }} disabled={!selectedCat} required>
                                <option value="">اختر الصنف...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>الكمية</label>
                                <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo' }} required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>الأهمية</label>
                                <select value={urgency} onChange={e => setUrgency(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo' }}>
                                    <option value="NORMAL">عادي</option>
                                    <option value="URGENT">مستعجل</option>
                                    <option value="EMERGENCY">طارئ جداً</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>ملاحظات إضافية</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="مثلاً: مكان التسليم الدقيق أو تفاصيل فنية..." style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', minHeight: '80px', resize: 'none' }} />
                        </div>

                        <button type="submit" disabled={mutation.isPending} style={{ marginTop: '10px', padding: '14px', borderRadius: '12px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            إرسال طلب التوريد
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default MaterialRequestModal;
