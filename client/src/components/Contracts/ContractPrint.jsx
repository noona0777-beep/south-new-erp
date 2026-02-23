import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';

/**
 * @component ContractPrint
 * @description Master Edition: High-Fidelity Official Contract.
 * Features: Absolute Positioning, PDF Export Optimization, and No-Drift Layout.
 */

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
            } catch (err) {
                console.error('Master Print Fetch Error:', err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDownloadPDF = () => {
        // We use window.print() but with strict CSS it works as a perfect PDF save
        window.print();
    };

    if (loading || !contract) return (
        <div style={{ padding: '100px', textAlign: 'center', fontFamily: 'Cairo', color: '#1e3a8a' }}>
            <h2>جاري تحضير المستند الرسمي بأعلى جودة...</h2>
        </div>
    );

    return (
        <div className="master-print-envelope" style={{ direction: 'rtl', background: '#e2e8f0', minHeight: '100vh', padding: '0 0 50px 0' }}>
            {/* INTERACTIVE CONTROLS */}
            <div className="no-print" style={{
                background: '#0f172a',
                padding: '15px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 9999,
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                fontFamily: 'Cairo'
            }}>
                <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                    <button
                        onClick={() => window.close()}
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                    >
                        ← إغلاق المعاينة
                    </button>
                    <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>مستند رسمي رقم:</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{contract.contractNumber}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={handleDownloadPDF}
                        style={{ background: '#2563eb', border: 'none', color: 'white', padding: '12px 30px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}
                    >
                        تحميل المستند (PDF)
                    </button>
                    <button
                        onClick={() => window.print()}
                        style={{ background: '#f59e0b', border: 'none', color: '#1e3a8a', padding: '12px 30px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        طباعة فورية
                    </button>
                </div>
            </div>

            {/* RIGID A4 CONSTRUCTION */}
            <div className="a4-pages-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* PAGE ONE */}
                <div className="a4-page" id="page-1" style={{
                    width: '210mm',
                    height: '296mm',
                    margin: '30px 0',
                    background: 'white',
                    position: 'relative',
                    boxShadow: '0 0 30px rgba(0,0,0,0.1)',
                    padding: '20mm',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header: Strict Layout */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '5px solid #1e3a8a', paddingBottom: '15px', marginBottom: '10mm' }}>
                        <div style={{ width: '33%' }}>
                            <h1 style={{ margin: '0 0 5px 0', color: '#0a1a3a', fontSize: '24px', fontWeight: '900' }}>{companyInfo.name}</h1>
                            <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                                <div>سجل تجاري: {companyInfo.crNumber}</div>
                                <div>الرقم الضريبي: {companyInfo.vatNumber}</div>
                                <div>تلفون: {companyInfo.phone}</div>
                                <div>العنوان: {companyInfo.address || 'المملكة العربية السعودية'}</div>
                            </div>
                        </div>

                        <div style={{ width: '33%', textAlign: 'center', paddingTop: '10px' }}>
                            <div style={{ border: '3px solid #1e3a8a', padding: '15px', borderRadius: '6px', fontWeight: 'bold' }}>
                                <div style={{ fontSize: '20px', color: '#1e3a8a' }}>عقد مقاولات</div>
                                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '5px' }}>CONSTRUCTION AGREEMENT</div>
                            </div>
                            <div style={{ marginTop: '15px', fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a' }}>رقم: {contract.contractNumber}</div>
                        </div>

                        <div style={{ width: '33%', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <div style={{ width: '80px', height: '80px', background: '#f8fafc', border: '1px solid #cbd5e1', marginBottom: '10px' }}>
                                {/* Fake QR for Visual Consistency */}
                                <div style={{ width: '100%', height: '100%', border: '4px double #1e3a8a', opacity: 0.3 }}></div>
                            </div>
                            <div style={{ fontSize: '13px' }}>التاريخ: {new Date(contract.createdAt).toLocaleDateString('ar-SA')}</div>
                            <div style={{ fontSize: '13px', color: '#94a3b8' }}>المرفقات: ملحق (1)</div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <div style={{ marginBottom: '25px', textAlign: 'justify', lineHeight: '1.8', fontSize: '16px' }}>
                            <p style={{ textIndent: '40px' }}>
                                الحمد لله والصلاة والسلام على رسول الله، وبعد: فقد تم الاتفاق والتعاقد في هذا اليوم وبمحض الإرادة بين كل من:
                            </p>
                        </div>

                        {/* PARTY CARDS - FIXED WIDTH */}
                        <div style={{ border: '2px solid #e2e8f0', borderRadius: '10px', marginBottom: '15px', overflow: 'hidden' }}>
                            <div style={{ background: '#1e3a8a', color: 'white', padding: '12px 20px', fontWeight: 'bold', fontSize: '15px' }}>الطرف الأول (صاحب العمل):</div>
                            <div style={{ padding: '20px', fontSize: '15px' }}>
                                <div style={{ marginBottom: '10px' }}><strong>الاسم/المنشأة:</strong> <span style={{ color: '#1e3a8a', fontWeight: 'bold' }}>{contract.partner?.name}</span></div>
                                <div><strong>هاتف التواصل:</strong> {contract.partner?.phone} | <strong>العنوان:</strong> {contract.partner?.address || 'المملكة العربية السعودية'}</div>
                            </div>
                        </div>

                        <div style={{ border: '2px solid #e2e8f0', borderRadius: '10px', marginBottom: '25px', overflow: 'hidden' }}>
                            <div style={{ background: '#1e3a8a', color: 'white', padding: '12px 20px', fontWeight: 'bold', fontSize: '15px' }}>الطرف الثاني (المقاول):</div>
                            <div style={{ padding: '20px', fontSize: '15px' }}>
                                <div style={{ marginBottom: '10px' }}><strong>المؤسسة:</strong> <span style={{ color: '#1e3a8a', fontWeight: 'bold' }}>{companyInfo.name}</span></div>
                                <div><strong>سجل تجاري:</strong> {companyInfo.crNumber} | <strong>الرقم الضريبي:</strong> {companyInfo.vatNumber}</div>
                            </div>
                        </div>

                        {/* CLAUSES GRID - NO FLOW ERRORS */}
                        <div style={{ marginTop: '30px' }}>
                            <h3 style={{ borderRight: '6px solid #c2410c', paddingRight: '15px', marginBottom: '20px', color: '#1e3a8a' }}>مواد التعاقد المتفق عليها:</h3>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {contract.clauses?.slice(0, 8).map((clause, idx) => (
                                    <div key={idx} style={{ textAlign: 'justify', breakInside: 'avoid' }}>
                                        <span style={{ fontWeight: 'bold', color: '#c2410c', fontSize: '15px' }}>المادة ({clause.id}): </span>
                                        <span style={{ fontWeight: 'bold', borderBottom: '1px solid #1e3a8a' }}>{clause.title}</span>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '14.5px', color: '#1e293b', lineHeight: '1.6' }}>{clause.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <footer style={{ borderTop: '2px solid #e2e8f0', paddingTop: '15px', marginTop: '10mm', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
                        هذا المستند صادر إلكترونياً ولا يحتاج لختم مالم يتم إقراره يدوياً | نظام إدارة الجنوب الجديد v4.0
                    </footer>
                </div>

                {/* PAGE TWO - BOQ & SIGNATURES */}
                <div className="a4-page" id="page-2" style={{
                    width: '210mm',
                    height: '296mm',
                    margin: '30px 0',
                    background: 'white',
                    position: 'relative',
                    boxShadow: '0 0 30px rgba(0,0,0,0.1)',
                    padding: '20mm',
                    overflow: 'hidden',
                    pageBreakBefore: 'always'
                }}>
                    <div style={{ borderBottom: '2px solid #1e3a8a', display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', marginBottom: '10mm' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>ملحق جدول الكميات والأعمال والأسعار</div>
                        <div style={{ fontSize: '12px' }}>تابع للعقد رقم: {contract.contractNumber}</div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1e3a8a', marginBottom: '40px' }}>
                        <thead>
                            <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                <th style={{ border: '1px solid #1e3a8a', padding: '12px', width: '40px' }}>م</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '12px', textAlign: 'right' }}>بيان الأعمال والمواصفات</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '12px', width: '80px' }}>الوحدة</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '12px', width: '80px' }}>الكمية</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '12px', width: '120px' }}>السعر</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '12px', width: '120px' }}>الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contract.items?.map((item, i) => (
                                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'center' }}>{i + 1}</td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', fontWeight: 'bold' }}>{item.description}</td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'center' }}>{item.unit}</td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'center' }}>{item.unitPrice.toLocaleString()}</td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                                <td colSpan="5" style={{ border: '2px solid #1e3a8a', padding: '15px' }}>إجمالي صافي القيمة</td>
                                <td style={{ border: '2px solid #1e3a8a', padding: '15px', textAlign: 'center' }}>{contract.netValue.toLocaleString()} ر.س</td>
                            </tr>
                            <tr style={{ background: '#fff', fontWeight: 'bold' }}>
                                <td colSpan="5" style={{ border: '2px solid #1e3a8a', padding: '15px' }}>ضريبة القيمة المضافة (15%)</td>
                                <td style={{ border: '2px solid #1e3a8a', padding: '15px', textAlign: 'center' }}>{contract.taxAmount.toLocaleString()} ر.س</td>
                            </tr>
                            <tr style={{ background: '#dcfce7', fontWeight: '900', color: '#166534', fontSize: '18px' }}>
                                <td colSpan="5" style={{ border: '2px solid #1e3a8a', padding: '20px' }}>إجمالي قيمة العقد النهائية</td>
                                <td style={{ border: '2px solid #1e3a8a', padding: '20px', textAlign: 'center' }}>{contract.totalValue.toLocaleString()} ر.س</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* FINAL SIGNATURE BLOCKS */}
                    <div style={{ marginTop: '60px', border: '2.5px double #1e3a8a', borderRadius: '15px', padding: '40px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 20px', fontWeight: 'bold', color: '#1e3a8a' }}>إقرار وتصديق الطرفين</div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '50px' }}>الطرف الأول (صاحب العمل)</p>
                                <div style={{ borderBottom: '2px dashed #94a3b8', width: '100%', marginBottom: '10px' }}></div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>التوقيع والتاريخ</div>
                                <div style={{ width: '130px', height: '130px', border: '3px dotted #cbd5e1', borderRadius: '50%', margin: '25px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '10px' }}>محل الختم الرسمي</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '50px' }}>الطرف الثاني (المقاول)</p>
                                <div style={{ borderBottom: '2px dashed #94a3b8', width: '100%', marginBottom: '10px' }}></div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>التوقيع والتاريخ</div>
                                <div style={{ width: '130px', height: '130px', border: '3px dashed #1e3a8a', borderRadius: '50%', margin: '25px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '10px' }}>محل الختم الرسمي</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
                    
                    @media print {
                        @page { 
                            margin: 0; 
                            size: A4 portrait; 
                        }
                        body { 
                            background: white !important; 
                            margin: 0 !important; 
                            padding: 0 !important; 
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .no-print { display: none !important; }
                        .master-print-envelope { background: white !important; padding: 0 !important; }
                        .a4-pages-wrapper { display: block !important; margin: 0 !important; padding: 0 !important; }
                        .a4-page { 
                            margin: 0 !important; 
                            box-shadow: none !important; 
                            border: none !important;
                            width: 210mm !important;
                            height: 296mm !important;
                            page-break-after: always !important;
                            overflow: hidden !important;
                        }
                        /* FORCE HIDE GOOGLE TRANSLATE SHIFTS */
                        .skiptranslate, .goog-te-banner-frame { display: none !important; }
                        body { top: 0 !important; }
                    }

                    /* PREVIEW SCROLLBAR */
                    ::-webkit-scrollbar { width: 10px; }
                    ::-webkit-scrollbar-track { background: #f1f1f1; }
                    ::-webkit-scrollbar-thumb { background: #1e3a8a; border-radius: 5px; }
                `}
            </style>
        </div>
    );
};

export default ContractPrint;
