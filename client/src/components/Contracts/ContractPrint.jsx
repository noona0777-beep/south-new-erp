import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';

// Architectural Background Pattern (SVG)
const BuildingPattern = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.05, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="gray" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <g transform="scale(1.5) translate(100, 100)">
                <path d="M0,400 L0,200 L50,150 L100,200 L100,400 M50,150 L50,400" stroke="gray" fill="none" strokeWidth="1" />
                <path d="M120,400 L120,100 L180,50 L240,100 L240,400 M180,50 L180,400" stroke="gray" fill="none" strokeWidth="1" />
                <path d="M260,400 L260,250 L310,200 L360,250 L360,400 M310,200 L310,400" stroke="gray" fill="none" strokeWidth="1" />
            </g>
        </svg>
    </div>
);

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
                setTimeout(() => window.print(), 1200);
            } catch (err) {
                console.error('Fetch error', err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading || !contract) return <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Cairo' }}>جاري تجهيز العقد الفاخر...</div>;

    return (
        <div style={{
            background: '#f1f5f9',
            minHeight: '100vh',
            padding: '40px 0',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <div className="print-container" style={{
                direction: 'rtl',
                fontFamily: "'Cairo', sans-serif",
                width: '210mm',
                minHeight: '297mm',
                background: 'white',
                padding: '15mm',
                position: 'relative',
                boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                border: '1px solid #d4a373', // Golden/Brown thin border as in image
                overflow: 'hidden',
                color: '#1a365d' // Navy text
            }}>
                <BuildingPattern />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Top Navy Block */}
                    <div style={{
                        width: '240px',
                        height: '60px',
                        background: '#1a365d',
                        margin: '0 auto',
                        borderRadius: '0 0 10px 10px',
                        position: 'absolute',
                        top: '-15mm',
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }}></div>

                    {/* QR Code Placeholder */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '70px', height: '70px', border: '2px solid #1a365d', padding: '5px' }}>
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #1a365d 25%, transparent 25%, transparent 50%, #1a365d 50%, #1a365d 75%, transparent 75%, transparent 100%)', backgroundSize: '10px 10px', opacity: 0.8 }}></div>
                    </div>

                    {/* Logo/Calligraphy Section */}
                    <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '30px' }}>
                        <h1 style={{
                            fontSize: '2.8rem',
                            color: '#c49b6d', // Golden color
                            margin: 0,
                            fontWeight: '900',
                            fontFamily: "'Amiri', serif",
                            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                        }}>
                            {companyInfo.name || 'مؤسسة الجنوب الجديد'}
                        </h1>
                        <div style={{ width: '150px', height: '2px', background: '#c49b6d', margin: '10px auto' }}></div>
                    </div>

                    {/* Main Title */}
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <h2 style={{ fontSize: '2rem', color: '#1a365d', fontWeight: 'bold', margin: 0 }}>عقد مقاولات</h2>
                    </div>

                    {/* Section: Party 1 */}
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ background: '#e5e7eb', padding: '8px 20px', marginBottom: '20px', borderRight: '8px solid #1a365d' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1a365d' }}>الطرف الأول :</h3>
                        </div>
                        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>اسم صاحب العمل:</span>
                                <div style={{ flex: 1, borderBottom: '1px dotted #94a3b8', paddingBottom: '2px', fontWeight: '600' }}>{contract.partner?.name}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>العنوان:</span>
                                <div style={{ flex: 1, borderBottom: '1px dotted #94a3b8', paddingBottom: '2px' }}>{contract.partner?.address || 'المملكة العربية السعودية'}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>التفاصيل:</span>
                                <div style={{ flex: 1, borderBottom: '1px dotted #94a3b8', paddingBottom: '2px' }}>عقد {contract.type} - {contract.title}</div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Party 2 */}
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ background: '#e5e7eb', padding: '8px 20px', marginBottom: '20px', borderRight: '8px solid #1a365d' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1a365d' }}>الطرف الثاني :</h3>
                        </div>
                        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>اسم المقاول:</span>
                                <div style={{ flex: 1, borderBottom: '1px dotted #94a3b8', paddingBottom: '2px', fontWeight: '600' }}>{companyInfo.name}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>السجل التجاري:</span>
                                <div style={{ flex: 1, borderBottom: '1px dotted #94a3b8', paddingBottom: '2px' }}>{companyInfo.crNumber || '3101234567'}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>التواصل:</span>
                                <div style={{ flex: 1, borderBottom: '1px dotted #94a3b8', paddingBottom: '2px' }}>{companyInfo.phone}</div>
                            </div>
                        </div>
                    </div>

                    {/* Clauses Summary or Intro */}
                    <div style={{ padding: '0 20px', color: '#475569', fontSize: '0.95rem', textAlign: 'justify' }}>
                        يلتزم الطرفان بكافة البنود والشروط النظامية الموضحة في ملحق بنود العقد المرفق، ويقر الطرفان بأهليتهما المعتبرة شرعاً ونظاماً للتعاقد.
                    </div>

                    {/* Signatures Section */}
                    <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0 }}>
                        <div style={{ background: '#e5e7eb', padding: '8px 20px', marginBottom: '30px', borderRight: '8px solid #1a365d', margin: '0 15mm' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1a365d', textAlign: 'center' }}>التوقيعات والأختام</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', padding: '0 40px', textAlign: 'center' }}>
                            <div>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    border: '2px dashed #1a365d',
                                    borderRadius: '50%',
                                    margin: '0 auto 15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#cbd5e1',
                                    fontSize: '0.8rem'
                                }}>ختم الطرف الأول</div>
                                <div style={{ borderBottom: '1px solid #1a365d', width: '80%', margin: '0 auto' }}></div>
                            </div>
                            <div>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    border: '2px dashed #1a365d',
                                    borderRadius: '50%',
                                    margin: '0 auto 15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#cbd5e1',
                                    fontSize: '0.8rem'
                                }}>ختم الطرف الثاني</div>
                                <div style={{ borderBottom: '1px solid #1a365d', width: '80%', margin: '0 auto' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Second Page for Clauses and BOQ */}
            <div className="print-container second-page" style={{
                direction: 'rtl',
                fontFamily: "'Cairo', sans-serif",
                width: '210mm',
                minHeight: '297mm',
                background: 'white',
                padding: '15mm',
                margin: '40px 0',
                position: 'relative',
                boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                border: '1px solid #d4a373',
                pageBreakBefore: 'always'
            }}>
                <BuildingPattern />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{ borderBottom: '2px solid #1a365d', paddingBottom: '10px', color: '#1a365d' }}>ملحق (1): بنود العقد والشروط العامة</h3>
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {contract.clauses?.map((c, idx) => (
                            <div key={idx} style={{ marginBottom: '15px' }}>
                                <strong>المادة ({c.id}): {c.title}</strong>
                                <p style={{ margin: '5px 0 0 0' }}>{c.content}</p>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ borderBottom: '2px solid #1a365d', paddingBottom: '10px', color: '#1a365d', marginTop: '30px' }}>ملحق (2): جدول الكميات والأعمال (BOQ)</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ border: '1px solid #e2e8f0', padding: '8px' }}>م</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '8px' }}>الوصف</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '8px' }}>الوحدة</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '8px' }}>الكمية</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '8px' }}>سعر الوحدة</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '8px' }}>الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contract.items?.map((item, i) => (
                                <tr key={i}>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center' }}>{i + 1}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '8px' }}>{item.description}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center' }}>{item.unit}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center' }}>{item.unitPrice.toLocaleString()}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center' }}>{item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot style={{ fontWeight: 'bold' }}>
                            <tr>
                                <td colSpan="5" style={{ padding: '10px' }}>الإجمالي النهائي شامل الضريبة (15%)</td>
                                <td style={{ textAlign: 'center' }}>{contract.totalValue.toLocaleString()} ر.س</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;900&display=swap');
                    
                    @media print {
                        body { background: transparent; padding: 0; margin: 0; }
                        .print-container { 
                            box-shadow: none !important; 
                            margin: 0 !important; 
                            border: 1px solid #d4a373 !important; 
                            page-break-after: always;
                            -webkit-print-color-adjust: exact;
                        }
                        .second-page {
                            margin-top: 0 !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default ContractPrint;
