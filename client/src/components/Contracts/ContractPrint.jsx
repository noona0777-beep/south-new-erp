import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';

/**
 * @component ContractPrint
 * @description Master Edition: High-Fidelity Official Contract.
 * Features: Native html2pdf Integration, Robust CSS, and Professional Branding.
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
        const element = document.getElementById('printable-contract');
        const opt = {
            margin: 0,
            filename: `Contract_${contract.contractNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        if (window.html2pdf) {
            window.html2pdf().from(element).set(opt).save();
        } else {
            // Fallback to browser print if library fails
            window.print();
        }
    };

    if (loading || !contract) return (
        <div style={{ padding: '100px', textAlign: 'center', fontFamily: 'Cairo', color: '#1e3a8a' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>جاري تحضير المستند الرسمي...</div>
        </div>
    );

    return (
        <div style={{ direction: 'rtl', minHeight: '100vh', background: '#f1f5f9' }}>
            {/* TOOLBAR */}
            <div className="no-print" style={{
                background: '#0a1a3a',
                padding: '12px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 999,
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <button
                        onClick={() => window.close()}
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        إغلاق
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>معاينة العقد: {contract.contractNumber}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleDownloadPDF}
                        style={{ background: '#2563eb', border: 'none', color: 'white', padding: '10px 25px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    >
                        حفظ كملف PDF
                    </button>
                    <button
                        onClick={() => window.print()}
                        style={{ background: '#f59e0b', border: 'none', color: '#0a1a3a', padding: '10px 25px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        طباعة المستند
                    </button>
                </div>
            </div>

            {/* PRINT AREA */}
            <div id="printable-contract" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>

                {/* PAGE 1 */}
                <div className="a4-page" style={{
                    width: '210mm',
                    minHeight: '296.5mm',
                    background: 'white',
                    padding: '20mm',
                    boxShadow: '0 0 20px rgba(0,0,0,0.05)',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '10mm'
                }}>
                    {/* Watermark */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '120px', color: '#f8fafc', fontWeight: '900', zIndex: 0, pointerEvents: 'none', userSelect: 'none', opacity: 0.5 }}>
                        SNS OFFICIAL
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {/* Header */}
                        <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '5px solid #0a1a3a', paddingBottom: '15px', marginBottom: '10mm' }}>
                            <div style={{ flex: 1 }}>
                                <h1 style={{ margin: '0 0 5px 0', color: '#1e3a8a', fontSize: '26px', fontWeight: '900' }}>{companyInfo.name}</h1>
                                <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>سجل تجاري: {companyInfo.crNumber}</p>
                                <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>الرقم الضريبي: {companyInfo.vatNumber}</p>
                                <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>هاتف: {companyInfo.phone}</p>
                            </div>

                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ border: '3px solid #1e3a8a', padding: '10px 25px', borderRadius: '8px', display: 'inline-block' }}>
                                    <h2 style={{ margin: 0, fontSize: '22px', color: '#1e3a8a' }}>عقد مقاولات إنشائية</h2>
                                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>CONSTRUCTION SUBCONTRACT AGREEMENT</span>
                                </div>
                                <p style={{ marginTop: '12px', fontSize: '15px', fontWeight: 'bold', color: '#1e3a8a' }}>رقم المرجع: {contract.contractNumber}</p>
                            </div>

                            <div style={{ flex: 1, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <div style={{ width: '80px', height: '80px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#94a3b8' }}>
                                    QR AUTHENTICATION
                                </div>
                                <p style={{ marginTop: '8px', fontSize: '13px' }}>التاريخ: {new Date(contract.createdAt).toLocaleDateString('ar-SA')}</p>
                                <p style={{ fontSize: '13px', color: '#94a3b8' }}>الصفحة: 1 من 2</p>
                            </div>
                        </header>

                        {/* Introduction */}
                        <section style={{ marginBottom: '35px', textAlign: 'justify', lineHeight: '1.8', fontSize: '16px' }}>
                            <p style={{ textIndent: '40px', margin: 0 }}>
                                الحمد لله وحده، والصلاة والسلام على من لا نبي بعده، وبعد، فقد تم في هذا اليوم {new Date(contract.createdAt).toLocaleDateString('ar-SA', { weekday: 'long' })} الموافق {new Date(contract.createdAt).toLocaleDateString('ar-SA')} م، الاتفاق والتعاقد بين كل من:
                            </p>

                            <div style={{ marginTop: '25px', border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', fontWeight: 'bold', color: '#1e3a8a', fontSize: '15px' }}>الطرف الأول (صاحب العمل):</div>
                                <div style={{ padding: '20px' }}>
                                    <strong>{contract.partner?.name}</strong> | هاتف: {contract.partner?.phone} | الرقم الضريبي: {contract.partner?.vatNumber || '---'}
                                    <br />
                                    <span style={{ fontSize: '14px', color: '#64748b' }}>العنوان: {contract.partner?.address || 'المملكة العربية السعودية'}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '15px', border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', fontWeight: 'bold', color: '#1e3a8a', fontSize: '15px' }}>الطرف الثاني (المقاول):</div>
                                <div style={{ padding: '20px' }}>
                                    <strong>{companyInfo.name}</strong> | سجل تجاري: {companyInfo.crNumber} | الرقم الضريبي: {companyInfo.vatNumber}
                                    <br />
                                    <span style={{ fontSize: '14px', color: '#64748b' }}>هاتف: {companyInfo.phone} | العنوان: {companyInfo.address || 'المملكة العربية السعودية'}</span>
                                </div>
                            </div>

                            <p style={{ marginTop: '25px' }}>
                                وحيث رغب الطرف الأول في إسناد أعمال: <strong style={{ color: '#0a1a3a' }}>({contract.title})</strong> للطرف الثاني، فتم الاتفاق على البنود والقواعد التالية:
                            </p>
                        </section>

                        {/* Clauses */}
                        <section>
                            <h3 style={{ borderRight: '6px solid #f59e0b', paddingRight: '15px', color: '#1e3a8a', marginBottom: '20px', fontSize: '1.2rem' }}>مواد التعاقد التنظيمية:</h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {contract.clauses?.map((clause, idx) => (
                                    <div key={idx} style={{ textAlign: 'justify', borderBottom: '1px solid #f8fafc', paddingBottom: '12px', breakInside: 'avoid' }}>
                                        <span style={{ fontWeight: 'bold', color: '#c2410c' }}>المادة ({clause.id}): </span>
                                        <span style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{clause.title}</span>
                                        <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>{clause.content}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <footer style={{ position: 'absolute', bottom: '15mm', left: '20mm', right: '20mm', borderTop: '1px solid #e2e8f0', paddingTop: '10px', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
                        مستند رسمي صادر من نظام {companyInfo.name} لإدارة المقاولات | جميع الحقوق محفوظة {new Date().getFullYear()}
                    </footer>
                </div>

                {/* PAGE 2 */}
                <div className="a4-page" style={{
                    width: '210mm',
                    minHeight: '296.5mm',
                    background: 'white',
                    padding: '20mm',
                    boxShadow: '0 0 20px rgba(0,0,0,0.05)',
                    position: 'relative',
                    pageBreakBefore: 'always',
                    overflow: 'hidden'
                }}>
                    <div style={{ borderBottom: '2px solid #1e3a8a', display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', marginBottom: '10mm' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a' }}>ملحق (1): جدول الأعمال والكميات والأسعار التقديري</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>المرجع: {contract.contractNumber}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>الصحفة: 2 من 2</div>
                    </div>

                    <main>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #1e3a8a' }}>
                            <thead>
                                <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '12px', width: '40px' }}>م</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '12px', textAlign: 'right' }}>بيان الأعمال والمواصفات المتفق عليها</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '12px', width: '80px' }}>الوحدة</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '12px', width: '80px' }}>الكمية</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '12px', width: '120px' }}>السعر</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '12px', width: '120px' }}>الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contract.items?.map((item, i) => (
                                    <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center' }}>{i + 1}</td>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '10px', fontWeight: 'bold', color: '#1e293b' }}>{item.description}</td>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center' }}>{item.unit}</td>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center' }}>{item.unitPrice.toLocaleString()}</td>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot style={{ fontWeight: 'bold' }}>
                                <tr style={{ background: '#fff' }}>
                                    <td colSpan="5" style={{ border: '1.5px solid #1e3a8a', padding: '15px', textAlign: 'left' }}>إجمالي صافي قيمة الأعمال (قبل الضريبة)</td>
                                    <td style={{ border: '1.5px solid #1e3a8a', padding: '15px', textAlign: 'center' }}>{contract.netValue.toLocaleString()} ر.س</td>
                                </tr>
                                <tr style={{ background: '#fff', color: '#64748b' }}>
                                    <td colSpan="5" style={{ border: '1.5px solid #1e3a8a', padding: '15px', textAlign: 'left' }}>ضريبة القيمة المضافة (15%)</td>
                                    <td style={{ border: '1.5px solid #1e3a8a', padding: '15px', textAlign: 'center' }}>{contract.taxAmount.toLocaleString()} ر.س</td>
                                </tr>
                                <tr style={{ background: '#f0fdf4', color: '#166534', fontSize: '20px', fontWeight: '900' }}>
                                    <td colSpan="5" style={{ border: '2px solid #1e3a8a', padding: '20px', textAlign: 'left' }}>إجمالي قيمة العقد النهائية (شاملة الضريبة)</td>
                                    <td style={{ border: '2px solid #1e3a8a', padding: '20px', textAlign: 'center' }}>{contract.totalValue.toLocaleString()} ر.س</td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* Financial Note */}
                        <div style={{ marginTop: '20px', padding: '15px', border: '1px dashed #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                            <strong>ملحوظة مالية:</strong> الدفعة المقدمة المستحقة عند التوقيع هي ({contract.advancePayment?.toLocaleString()} ر.س)، وسوف يتم استقطاع نسبة ({contract.retentionPercent}%) كاحتياطي ضمان للأعمال النهائية.
                        </div>

                        {/* Authorization & Stamps */}
                        <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '17px', marginBottom: '60px', color: '#1e3a8a' }}>الطرف الأول (المصادقة والتوقيع)</div>
                                <div style={{ borderBottom: '1.5px dashed #94a3b8', width: '80%', margin: '0 auto' }}></div>
                                <div style={{ marginTop: '10px', fontSize: '12px', color: '#94a3b8' }}>الاسم: .................................................</div>
                                <div style={{ width: '130px', height: '130px', border: '2px dotted #e2e8f0', borderRadius: '50%', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '10px' }}>محل الختم</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '17px', marginBottom: '60px', color: '#1e3a8a' }}>الطرف الثاني (المصادقة والتوقيع)</div>
                                <div style={{ borderBottom: '1.5px dashed #94a3b8', width: '80%', margin: '0 auto' }}></div>
                                <div style={{ marginTop: '10px', fontSize: '12px', color: '#94a3b8' }}>عن المؤسسة: {contract.signatureName || companyInfo.name}</div>
                                <div style={{ width: '130px', height: '130px', border: '2.5px dashed #0a1a3a', borderRadius: '50%', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '10px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', transform: 'rotate(-15deg)', border: '2px solid rgba(10, 26, 58, 0.1)', padding: '5px', borderRadius: '5px', fontSize: '8px', color: 'rgba(10, 26, 58, 0.2)' }}>SNS ERP SEAL</div>
                                    محل الختم الرسمي
                                </div>
                            </div>
                        </div>
                    </main>

                    <footer style={{ position: 'absolute', bottom: '15mm', left: '20mm', right: '20mm', textAlign: 'center', fontSize: '10px', color: '#94a3b8' }}>
                        يعتبر هذا العقد وثيقة قانونية ملزمة للطرفين وتخضع للأنظمة المعمول بها في المملكة العربية السعودية
                    </footer>
                </div>
            </div>

            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
                    
                    @media print {
                        body { background: white !important; margin: 0; padding: 0 !important; }
                        .no-print { display: none !important; }
                        #printable-contract { padding: 0 !important; }
                        .a4-page { 
                            margin: 0 !important; 
                            box-shadow: none !important; 
                            width: 210mm !important; 
                            height: 296.5mm !important; 
                            page-break-after: always !important;
                            border: none !important;
                        }
                        @page { 
                            margin: 0; 
                            size: A4 portrait; 
                        }
                        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    }

                    /* Interactive Scrollbar */
                    ::-webkit-scrollbar { width: 10px; }
                    ::-webkit-scrollbar-track { background: #f1f1f1; }
                    ::-webkit-scrollbar-thumb { background: #0a1a3a; border-radius: 5px; }
                `}
            </style>
        </div>
    );
};

export default ContractPrint;
