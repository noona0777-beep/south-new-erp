import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';

const ContractPrint = () => {
    const { id } = useParams();
    const [contract, setContract] = useState(null);
    const [companyInfo, setCompanyInfo] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cRes, sRes] = await Promise.all([
                    axios.get(`${API_URL}/construction-contracts/${id}`),
                    axios.get(`${API_URL}/settings/companyInfo`)
                ]);
                setContract(cRes.data);
                setCompanyInfo(sRes.data);
                setLoading(false);
                // Trigger print after a short delay
                setTimeout(() => window.print(), 1000);
            } catch (err) {
                console.error('Fetch error', err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading || !contract) return <div style={{ padding: '50px', textAlign: 'center' }}>جاري التحضير للطباعة...</div>;

    return (
        <div style={{
            direction: 'rtl',
            fontFamily: "'Cairo', sans-serif",
            padding: '40px',
            maxWidth: '1000px',
            margin: '0 auto',
            background: 'white',
            lineHeight: '1.8',
            color: '#1e293b',
            position: 'relative',
            minHeight: '29.7cm' // A4 Height
        }}>
            {/* Background Watermark */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-45deg)',
                fontSize: '120px',
                color: 'rgba(241, 245, 249, 0.5)',
                fontWeight: '900',
                zIndex: 0,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase'
            }}>
                {companyInfo.name}
            </div>

            <div style={{ position: 'relative', zIndex: 1, border: '1px solid #e2e8f0', padding: '30px', borderRadius: '4px' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '4px solid #2563eb', paddingBottom: '25px' }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#2563eb', fontWeight: '900' }}>{companyInfo.name}</h1>
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', fontSize: '0.9rem', color: '#64748b' }}>
                            <span style={{ fontWeight: 'bold' }}>الرقم الضريبي:</span> <span>{companyInfo.vatNumber}</span>
                            <span style={{ fontWeight: 'bold' }}>السجل التجاري:</span> <span>{companyInfo.crNumber || '3101234567'}</span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', padding: '0 20px' }}>
                        <div style={{ background: '#0f172a', color: 'white', padding: '10px 30px', transform: 'skew(-15deg)', marginBottom: '10px' }}>
                            <h2 style={{ margin: 0, transform: 'skew(15deg)', fontSize: '1.4rem' }}>عقد مقاولات إنشائية</h2>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>رقم المرجعي: {contract.contractNumber}</p>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                            {/* Placeholder for QR Code */}
                            <div style={{ width: '60px', height: '60px', background: 'linear-gradient(45deg, #000, #333)', opacity: 0.1 }}></div>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>التاريخ: {new Date(contract.createdAt).toLocaleDateString('ar-SA')}</p>
                    </div>
                </div>

                {/* Parties Introduction */}
                <div style={{ marginBottom: '40px' }}>
                    <p style={{ textAlign: 'justify', fontSize: '1.1rem', marginBottom: '25px' }}>
                        إنه في يوم {new Date(contract.createdAt).toLocaleDateString('ar-SA', { weekday: 'long' })} الموافق {new Date(contract.createdAt).toLocaleDateString('ar-SA')} م، بمدينة {companyInfo.address?.includes('الرياض') ? 'الرياض' : 'نجران'}، تم إبرام هذا العقد بين كل من:
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div style={{ background: '#f8fafc', padding: '20px', borderRight: '5px solid #2563eb', borderRadius: '0 8px 8px 0' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#2563eb' }}>الطرف الأول (صاحب العمل)</h4>
                            <div style={{ fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ fontWeight: '900', fontSize: '1.2rem' }}>السيد/ {contract.partner?.name}</div>
                                <div><span style={{ color: '#94a3b8' }}>هاتف:</span> {contract.partner?.phone}</div>
                                <div><span style={{ color: '#94a3b8' }}>العنوان:</span> {contract.partner?.address || 'المملكة العربية السعودية'}</div>
                            </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '20px', borderRight: '5px solid #0f172a', borderRadius: '0 8px 8px 0' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>الطرف الثاني (المقاول)</h4>
                            <div style={{ fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ fontWeight: '900', fontSize: '1.2rem' }}>{companyInfo.name}</div>
                                <div><span style={{ color: '#94a3b8' }}>سجل تجاري:</span> {companyInfo.crNumber || '3101234567'}</div>
                                <div><span style={{ color: '#94a3b8' }}>هاتف:</span> {companyInfo.phone}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clauses Section */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ borderBottom: '2px solid #2563eb', color: '#2563eb', paddingBottom: '10px', marginBottom: '25px', display: 'inline-block' }}>البنود والشروط النظامية:</h3>
                    <div style={{ fontFamily: "'Amiri', serif", fontSize: '1.15rem' }}>
                        {contract.clauses?.map((clause, idx) => (
                            <div key={idx} style={{ marginBottom: '25px', textAlign: 'justify' }}>
                                <span style={{ fontWeight: 'bold', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', marginLeft: '10px' }}>المادة {clause.id}</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>({clause.title}):</span>
                                <p style={{ margin: '10px 0 0 0', color: '#334155', textIndent: '30px' }}>{clause.content}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BOQ Header */}
                <div style={{ pageBreakBefore: 'always', paddingTop: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #0f172a', paddingBottom: '10px' }}>
                        <h3 style={{ margin: 0 }}>ملحق رقم (1): جدول الكميات والأعمال (BOQ)</h3>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>المشروع: {contract.title}</div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #0f172a' }}>
                        <thead>
                            <tr style={{ background: '#0f172a', color: 'white' }}>
                                <th style={{ border: '1px solid #0f172a', padding: '12px' }}>م</th>
                                <th style={{ border: '1px solid #0f172a', padding: '12px', textAlign: 'right' }}>بيان العمل / المواصفة</th>
                                <th style={{ border: '1px solid #0f172a', padding: '12px' }}>الوحدة</th>
                                <th style={{ border: '1px solid #0f172a', padding: '12px' }}>الكمية</th>
                                <th style={{ border: '1px solid #0f172a', padding: '12px' }}>سعر الوحدة</th>
                                <th style={{ border: '1px solid #0f172a', padding: '12px' }}>الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contract.items?.map((item, i) => (
                                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center' }}>{i + 1}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '12px', fontWeight: 'bold' }}>{item.description}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center' }}>{item.unit}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center' }}>{item.unitPrice.toLocaleString()}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: '#fff', fontWeight: 'bold' }}>
                                <td colSpan="5" style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'left' }}>المجموع الصافي (قبل الضريبة)</td>
                                <td style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center' }}>{contract.netValue.toLocaleString()} ر.س</td>
                            </tr>
                            <tr style={{ background: '#fff', fontWeight: 'bold', color: '#64748b' }}>
                                <td colSpan="5" style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'left' }}>ضريبة القيمة المضافة (15%)</td>
                                <td style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center' }}>{contract.taxAmount.toLocaleString()} ر.س</td>
                            </tr>
                            <tr style={{ background: '#eff6ff', fontWeight: '900', fontSize: '1.3rem', color: '#2563eb' }}>
                                <td colSpan="5" style={{ border: '1px solid #2563eb', padding: '15px', textAlign: 'left' }}>القيمة الإجمالية للعقد (شامل الضريبة)</td>
                                <td style={{ border: '1px solid #2563eb', padding: '15px', textAlign: 'center' }}>{contract.totalValue.toLocaleString()} ر.س</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Signature Section */}
                <div style={{ marginTop: '60px', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '30px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', textAlign: 'center' }}>
                        <div>
                            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '40px' }}>مصادقة الطرف الأول (صاحب العمل)</p>
                            <div style={{ width: '150px', height: '150px', border: '1px dashed #cbd5e1', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '0.8rem' }}>محل الختم</div>
                            <div style={{ marginTop: '20px' }}>التوقيع: .......................................</div>
                        </div>
                        <div>
                            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '40px' }}>مصادقة الطرف الثاني (المقاول)</p>
                            <div style={{ width: '150px', height: '150px', background: '#f8fafc', border: '1px dashed #2563eb', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontSize: '0.8rem' }}>محل الختم الرسمي</div>
                            <div style={{ marginTop: '20px' }}>التوقيع: .......................................</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                <p>مؤسسة الجنوب الجديد - إدارة المشاريع والمقاولات | تم توليد هذا المستند إلكترونياً من نظام Enterprise Resource Planning</p>
            </div>

            <style>
                {`
                    @media print {
                        body { background: white !important; margin: 0; }
                        .no-print { display: none; }
                        @page { margin: 1cm; size: A4; }
                        div { break-inside: avoid; }
                    }
                    @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;700;900&display=swap');
                `}
            </style>
        </div>
    );
};

export default ContractPrint;
