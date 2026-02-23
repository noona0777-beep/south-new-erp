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
            fontFamily: "'Cairo', 'Times New Roman', serif",
            padding: '40px',
            maxWidth: '900px',
            margin: '0 auto',
            background: 'white',
            lineHeight: '1.8',
            color: '#000'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
                <div style={{ textAlign: 'right' }}>
                    <h1 style={{ margin: '0 0 5px 0', fontSize: '1.8rem' }}>{companyInfo.name}</h1>
                    <p style={{ margin: 0 }}>سجل تجاري: {companyInfo.crNumber || '3101234567'}</p>
                    <p style={{ margin: 0 }}>الرقم الضريبي: {companyInfo.vatNumber}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ margin: 0, border: '2px solid #000', padding: '10px 20px' }}>عقد مقاولات</h2>
                    <p style={{ marginTop: '10px' }}>رقم العقد: {contract.contractNumber}</p>
                </div>
                <div style={{ textAlign: 'left' }}>
                    <p>التاريخ: {new Date(contract.createdAt).toLocaleDateString('ar-SA')}</p>
                    <p>المشروع: {contract.project?.name || 'عام'}</p>
                </div>
            </div>

            {/* Intro */}
            <div style={{ marginBottom: '30px' }}>
                <p style={{ textAlign: 'justify' }}>
                    إنه في يوم {new Date(contract.createdAt).toLocaleDateString('ar-SA', { weekday: 'long' })} الموافق {new Date(contract.createdAt).toLocaleDateString('ar-SA')}، تم الاتفاق بين كل من:
                </p>
                <div style={{ margin: '20px 0', border: '1px solid #eee', padding: '15px' }}>
                    <strong>1- {contract.partner?.name}</strong>، ويُشار إليه في هذا العقد بـ (الطرف الأول - صاحب العمل).
                    <br />
                    عنوانه: {contract.partner?.address || 'المملكة العربية السعودية'} | هاتف: {contract.partner?.phone}
                </div>
                <div style={{ margin: '20px 0', border: '1px solid #eee', padding: '15px' }}>
                    <strong>2- {companyInfo.name}</strong>، مُمثلة بمديرها العام، ويُشار إليها في هذا العقد بـ (الطرف الثاني - المقاول).
                    <br />
                    سجل تجاري: {companyInfo.crNumber || '3101234567'} | هاتف: {companyInfo.phone}
                </div>
                <p>
                    وذلك على تنفيذ مشروع: <strong>{contract.title}</strong>
                </p>
            </div>

            {/* Clauses */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ borderBottom: '1px solid #000', paddingBottom: '5px' }}>البنود والمتفق عليها:</h3>
                {contract.clauses?.map((clause, idx) => (
                    <div key={idx} style={{ marginBottom: '20px', textAlign: 'justify' }}>
                        <span style={{ fontWeight: 'bold' }}>البند {clause.id}: {clause.title}</span>
                        <p style={{ margin: '5px 0 0 0', textIndent: '20px' }}>{clause.content}</p>
                    </div>
                ))}
            </div>

            {/* BOQ Table */}
            <div style={{ marginBottom: '40px', pageBreakBefore: 'always' }}>
                <h3 style={{ borderBottom: '1px solid #000', paddingBottom: '5px' }}>ملحق رقم (1): جدول الكميات والأعمال (BOQ)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5' }}>
                            <th style={{ border: '1px solid #000', padding: '10px' }}>م</th>
                            <th style={{ border: '1px solid #000', padding: '10px' }}>وصف العمل</th>
                            <th style={{ border: '1px solid #000', padding: '10px' }}>الوحدة</th>
                            <th style={{ border: '1px solid #000', padding: '10px' }}>الكمية</th>
                            <th style={{ border: '1px solid #000', padding: '10px' }}>سعر الوحدة</th>
                            <th style={{ border: '1px solid #000', padding: '10px' }}>الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contract.items?.map((item, i) => (
                            <tr key={i}>
                                <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>{i + 1}</td>
                                <td style={{ border: '1px solid #000', padding: '10px' }}>{item.description}</td>
                                <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>{item.unit}</td>
                                <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>{item.unitPrice.toFixed(2)}</td>
                                <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>{item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ fontWeight: 'bold' }}>
                            <td colSpan="5" style={{ border: '1px solid #000', padding: '10px', textAlign: 'left' }}>الإجمالي الصافي</td>
                            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>{contract.netValue.toFixed(2)} ر.س</td>
                        </tr>
                        <tr style={{ fontWeight: 'bold' }}>
                            <td colSpan="5" style={{ border: '1px solid #000', padding: '10px', textAlign: 'left' }}>ضريبة القيمة المضافة (15%)</td>
                            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>{contract.taxAmount.toFixed(2)} ر.س</td>
                        </tr>
                        <tr style={{ fontWeight: 'bold', fontSize: '1.2rem', background: '#eee' }}>
                            <td colSpan="5" style={{ border: '1px solid #000', padding: '10px', textAlign: 'left' }}>الإجمالي النهائي</td>
                            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>{contract.totalValue.toFixed(2)} ر.س</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginTop: '60px', textAlign: 'center' }}>
                <div>
                    <p style={{ fontWeight: 'bold' }}>الطرف الأول (صاحب العمل)</p>
                    <div style={{ height: '80px' }}></div>
                    <p>التوقيع: .......................................</p>
                    <p>الختم:</p>
                </div>
                <div>
                    <p style={{ fontWeight: 'bold' }}>الطرف الثاني (المقاول)</p>
                    <div style={{ height: '80px' }}></div>
                    <p>التوقيع: .......................................</p>
                    <p>الختم:</p>
                </div>
            </div>

            {/* Footer Text */}
            <div style={{ position: 'fixed', bottom: '20px', left: '40px', right: '40px', fontSize: '0.8rem', borderTop: '1px solid #ccc', paddingTop: '10px', color: '#666', textAlign: 'center' }}>
                هذا العقد صادر إلكترونياً من نظام {companyInfo.name} لإدارة الموارد.
            </div>

            <style>
                {`
                    @media print {
                        body { background: white; }
                        .no-print { display: none; }
                        @page { margin: 20px; }
                    }
                `}
            </style>
        </div>
    );
};

export default ContractPrint;
