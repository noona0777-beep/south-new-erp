import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';

/**
 * @component ContractPrint
 * @description Master Construction Contract Template - Optimized for PDF, Archiving, and Universal Printing.
 * Final Professional Version with Navigation Toolbar and Zero-Margin Print Fixes.
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
                // Trigger print dialog after assets load
                setTimeout(() => window.print(), 2000);
            } catch (err) {
                console.error('Master Print Fetch Error:', err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading || !contract) return (
        <div style={{ padding: '100px', textAlign: 'center', fontFamily: 'Cairo', color: '#1e3a8a' }}>
            <h2 style={{ marginBottom: '20px' }}>جاري تحضير المستند الرسمي...</h2>
            <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #1e3a8a', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="master-container" style={{ direction: 'rtl', background: '#f1f5f9', minHeight: '100vh', padding: '0 0 50px 0' }}>
            {/* NO-PRINT TOOLBAR */}
            <div className="no-print" style={{
                background: '#1e3a8a',
                padding: '12px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <button
                        onClick={() => window.close()}
                        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        إغلاق المعاينة
                    </button>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>معاينة المستند الرسمي | عقد رقم: {contract.contractNumber}</span>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={() => window.print()}
                        style={{ background: '#f59e0b', border: 'none', color: '#1e3a8a', padding: '10px 25px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    >
                        طباعة / حفظ كملف PDF
                    </button>
                </div>
            </div>

            {/* A4 PAGES CONTAINER */}
            <div className="print-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* --- PAGE 1 --- */}
                <div className="a4-sheet" style={{
                    width: '210mm',
                    minHeight: '297mm',
                    margin: '30px 0',
                    background: 'white',
                    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                    position: 'relative',
                    padding: '15mm'
                }}>
                    {/* Header */}
                    <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid #1e3a8a', paddingBottom: '10px', marginBottom: '10mm' }}>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ margin: '0 0 8px 0', color: '#c2410c', fontSize: '1.8rem', fontWeight: '900' }}>{companyInfo.name}</h1>
                            <p style={{ margin: '2px 0', fontSize: '12px', color: '#475569' }}>سجل تجاري: {companyInfo.crNumber || '---'}</p>
                            <p style={{ margin: '2px 0', fontSize: '12px', color: '#475569' }}>الرقم الضريبي: {companyInfo.vatNumber}</p>
                            <p style={{ margin: '2px 0', fontSize: '12px', color: '#475569' }}>هاتف: {companyInfo.phone}</p>
                        </div>

                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ border: '2.5px solid #1e3a8a', padding: '12px 20px', borderRadius: '4px', display: 'inline-block' }}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e3a8a' }}>عقد مقاولات إنشائية</h2>
                                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '4px' }}>CONSTRUCTION SUBCONTRACT AGREEMENT</span>
                            </div>
                            <p style={{ marginTop: '12px', fontSize: '14px', fontWeight: 'bold' }}>رقم العقد: {contract.contractNumber}</p>
                        </div>

                        <div style={{ flex: 1, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <div style={{ width: '70px', height: '70px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#94a3b8' }}>
                                QR CODE
                            </div>
                            <p style={{ marginTop: '8px', fontSize: '12px' }}>التاريخ: {new Date(contract.createdAt).toLocaleDateString('ar-SA')}</p>
                            <p style={{ fontSize: '12px' }}>الصفحة: 1 من 2</p>
                        </div>
                    </header>

                    <main>
                        {/* Introduction */}
                        <section style={{ marginBottom: '30px', textAlign: 'justify', lineHeight: '1.7', fontSize: '15px' }}>
                            <p style={{ textIndent: '30px', margin: 0 }}>
                                الحمد لله وحده، وبعد، فقد تم في هذا اليوم {new Date(contract.createdAt).toLocaleDateString('ar-SA', { weekday: 'long' })} الموافق {new Date(contract.createdAt).toLocaleDateString('ar-SA')} م، الاتفاق والتعاقد بين كل من:
                            </p>

                            <div style={{ marginTop: '20px', border: '1.5px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={{ padding: '10px 15px', background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1', fontWeight: 'bold', color: '#1e3a8a', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>الطرف الأول (صاحب العمل)</span>
                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>First Party / Client</span>
                                </div>
                                <div style={{ padding: '15px' }}>
                                    <strong style={{ fontSize: '16px' }}>السيد/ {contract.partner?.name}</strong>
                                    <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', color: '#475569' }}>
                                        <span>الهاتف: {contract.partner?.phone}</span>
                                        <span>العنوان: {contract.partner?.address || 'المملكة العربية السعودية'}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '15px', border: '1.5px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={{ padding: '10px 15px', background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1', fontWeight: 'bold', color: '#1e3a8a', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>الطرف الثاني (المقاول)</span>
                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>Second Party / Contractor</span>
                                </div>
                                <div style={{ padding: '15px' }}>
                                    <strong style={{ fontSize: '16px' }}>{companyInfo.name}</strong>
                                    <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', color: '#475569' }}>
                                        <span>سجل تجاري: {companyInfo.crNumber}</span>
                                        <span>الرقم الموحد: {companyInfo.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <p style={{ marginTop: '20px' }}>
                                وحيث رغب الطرف الأول في تنفيذ أعمال: <strong style={{ color: '#1e3a8a' }}>({contract.title})</strong>، فقد التزم الطرف الثاني بتنفيذها وفقاً للشروط والمواصفات ومواد هذا العقد المذكورة أدناه:
                            </p>
                        </section>

                        {/* Clauses */}
                        <section style={{ height: 'auto' }}>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {contract.clauses?.slice(0, 10).map((clause, idx) => (
                                    <div key={idx} style={{ textAlign: 'justify', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', breakInside: 'avoid' }}>
                                        <span style={{ fontWeight: 'bold', color: '#c2410c' }}>مادة {clause.id}: </span>
                                        <span style={{ fontWeight: 'bold', color: '#1e3a8a' }}>({clause.title})</span>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '13.5px', color: '#334155', lineHeight: '1.5' }}>{clause.content}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </main>

                    <footer style={{ position: 'absolute', bottom: '15mm', left: '15mm', right: '15mm', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '10px', color: '#94a3b8', textAlign: 'center' }}>
                        مستند رسمي صادر من نظام {companyInfo.name} | يعتبر هذا المستند مرجعاً قانونياً للطرفين
                    </footer>
                </div>

                {/* --- PAGE 2 --- */}
                <div className="a4-sheet" style={{
                    width: '210mm',
                    minHeight: '297mm',
                    margin: '20px 0',
                    background: 'white',
                    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                    position: 'relative',
                    padding: '15mm',
                    pageBreakBefore: 'always'
                }}>
                    <header style={{ borderBottom: '2px solid #1e3a8a', display: 'flex', justifyContent: 'space-between', paddingBottom: '5px', marginBottom: '10mm' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>ملحق رقم (1): جدول الكميات والأعمال والأسعار</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>رقم المرجع: {contract.contractNumber}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>الصفحة 2 من 2</div>
                    </header>

                    <main>
                        {/* Remaining Clauses if any */}
                        {contract.clauses?.length > 10 && (
                            <section style={{ marginBottom: '30px' }}>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {contract.clauses.slice(10).map((clause, idx) => (
                                        <div key={idx} style={{ textAlign: 'justify', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', breakInside: 'avoid' }}>
                                            <span style={{ fontWeight: 'bold', color: '#c2410c' }}>مادة {clause.id}: </span>
                                            <span style={{ fontWeight: 'bold', color: '#1e3a8a' }}>({clause.title})</span>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '13.5px', color: '#334155' }}>{clause.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #1e3a8a', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '10px' }}>م</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'right' }}>بيان الأعمال والمواصفات الفنية</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '10px' }}>الوحدة</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '10px' }}>الكمية</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '10px' }}>السعر</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '10px' }}>الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contract.items?.map((item, i) => (
                                    <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>{i + 1}</td>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', fontWeight: 'bold' }}>{item.description}</td>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>{item.unit}</td>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>{item.unitPrice.toLocaleString()}</td>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot style={{ fontWeight: 'bold' }}>
                                <tr style={{ background: '#fff' }}>
                                    <td colSpan="5" style={{ border: '1.5px solid #1e3a8a', padding: '12px', textAlign: 'left' }}>إجمالي صافي القيمة (قبل الضريبة)</td>
                                    <td style={{ border: '1.5px solid #1e3a8a', padding: '12px', textAlign: 'center' }}>{contract.netValue.toLocaleString()} ر.س</td>
                                </tr>
                                <tr style={{ background: '#fff', color: '#64748b' }}>
                                    <td colSpan="5" style={{ border: '1.5px solid #1e3a8a', padding: '12px', textAlign: 'left' }}>ضريبة القيمة المضافة (15%)</td>
                                    <td style={{ border: '1.5px solid #1e3a8a', padding: '12px', textAlign: 'center' }}>{contract.taxAmount.toLocaleString()} ر.س</td>
                                </tr>
                                <tr style={{ background: '#f0fdf4', fontWeight: '900', fontSize: '1.2rem', color: '#166534' }}>
                                    <td colSpan="5" style={{ border: '1.5px solid #1e3a8a', padding: '15px', textAlign: 'left' }}>إجمالي قيمة العقد النهائية (شامل الضريبة)</td>
                                    <td style={{ border: '1.5px solid #1e3a8a', padding: '15px', textAlign: 'center' }}>{contract.totalValue.toLocaleString()} ر.س</td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* Signatures Group */}
                        <div style={{ marginTop: '50px', border: '2px solid #1e3a8a', borderRadius: '12px', padding: '30px', breakInside: 'avoid' }}>
                            <h4 style={{ margin: '0 0 35px 0', textAlign: 'center', textDecoration: 'underline' }}>مصادقة الأطراف على صحة البيانات والمواصفات المذكورة</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '40px', color: '#1e3a8a' }}>الطرف الأول (صاحب العمل)</p>
                                    <div style={{ borderBottom: '1px dashed #475569', width: '80%', margin: '0 auto' }}></div>
                                    <div style={{ marginTop: '5px', fontSize: '11px', color: '#94a3b8' }}>الاسم والتوقيع الرسمي</div>
                                    <div style={{ width: '120px', height: '120px', border: '2px dotted #e2e8f0', borderRadius: '50%', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '9px' }}>ختم الطرف الأول</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '40px', color: '#1e3a8a' }}>الطرف الثاني (المقاول)</p>
                                    <div style={{ borderBottom: '1px dashed #475569', width: '80%', margin: '0 auto' }}></div>
                                    <div style={{ marginTop: '5px', fontSize: '11px', color: '#94a3b8' }}>الاسم والتوقيع الرسمي</div>
                                    <div style={{ width: '120px', height: '120px', border: '2.5px dashed #1e3a8a', borderRadius: '50%', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '9px' }}>الختم الرسمي للمؤسسة</div>
                                </div>
                            </div>
                        </div>
                    </main>

                    <footer style={{ position: 'absolute', bottom: '15mm', left: '15mm', right: '15mm', textAlign: 'center', fontSize: '10px', color: '#94a3b8' }}>
                        هذا العقد ووثائقه وملحقاته وحدة واحدة لا تتجزأ وتخضع لأنظمة المملكة العربية السعودية
                    </footer>
                </div>
            </div>

            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
                    
                    @media print {
                        body { background: white !important; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
                        .no-print { display: none !important; }
                        .master-container { background: white !important; padding: 0 !important; }
                        .print-area { display: block !important; }
                        .a4-sheet { 
                            box-shadow: none !important; 
                            margin: 0 !important; 
                            width: 210mm !important; 
                            height: 296mm !important; /* Slightly reduced to avoid overlap */
                            page-break-after: always;
                            border: none !important;
                        }
                        @page { 
                            margin: 0; 
                            size: A4 portrait; 
                        }
                    }

                    /* Scrollbar Styling for preview */
                    ::-webkit-scrollbar { width: 8px; }
                    ::-webkit-scrollbar-track { background: #f1f1f1; }
                    ::-webkit-scrollbar-thumb { background: #1e3a8a; border-radius: 10px; }
                `}
            </style>
        </div>
    );
};

export default ContractPrint;
