import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';

/**
 * @component ContractPrint
 * @description Master Construction Contract Template - Optimized for PDF, Archiving, and Universal Printing.
 * Adheres to Saudi Legal and Engineering Standards (SCA based).
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
                setTimeout(() => window.print(), 1500);
            } catch (err) {
                console.error('Master Print Fetch Error:', err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading || !contract) return (
        <div style={{ padding: '100px', textAlign: 'center', fontFamily: 'Cairo', color: '#2563eb' }}>
            <div className="loader" style={{ marginBottom: '20px' }}>جاري تحضير المستند الرسمي...</div>
        </div>
    );

    return (
        <div className="master-container" style={{ direction: 'rtl', background: '#f8fafc', minHeight: '100vh', padding: '20px 0' }}>
            <div className="a4-sheet" style={{
                width: '210mm',
                margin: '0 auto',
                background: 'white',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                position: 'relative'
            }}>
                {/* --- HEADER --- */}
                <header style={{ padding: '15mm 15mm 5mm', display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid #1e3a8a' }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: '0 0 10px 0', color: '#c2410c', fontSize: '1.8rem', fontWeight: '900' }}>{companyInfo.name}</h1>
                        <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>سجل تجاري: {companyInfo.crNumber || '---'}</p>
                        <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>الرقم الضريبي: {companyInfo.vatNumber}</p>
                        <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>هاتف: {companyInfo.phone}</p>
                    </div>

                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ border: '3px solid #1e3a8a', padding: '10px 20px', borderRadius: '4px', display: 'inline-block' }}>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e3a8a' }}>عقد مقاولات إنشائية</h2>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Construction Subcontract</span>
                        </div>
                        <p style={{ marginTop: '10px', fontSize: '14px', fontWeight: 'bold' }}>رقم المرجع: {contract.contractNumber}</p>
                    </div>

                    <div style={{ flex: 1, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{ width: '80px', height: '80px', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#94a3b8' }}>
                            {/* Visual QR Indicator */}
                            {id ? `ID-${id}` : 'VERIFY'}
                        </div>
                        <p style={{ marginTop: '5px', fontSize: '13px' }}>التاريخ: {new Date(contract.createdAt).toLocaleDateString('ar-SA')}</p>
                        <p style={{ fontSize: '13px' }}>الصفحة: 1 من 2</p>
                    </div>
                </header>

                <main style={{ padding: '10mm 15mm' }}>
                    {/* Introduction Section */}
                    <section style={{ marginBottom: '30px', textAlign: 'justify', lineHeight: '1.6' }}>
                        <p style={{ textIndent: '30px', fontSize: '15px' }}>
                            الحمد لله وحده، والصلاة والسلام على من لا نبي بعده، وبعد، فقد تم في هذا اليوم {new Date(contract.createdAt).toLocaleDateString('ar-SA', { weekday: 'long' })} الموافق {new Date(contract.createdAt).toLocaleDateString('ar-SA')}م، الاتفاق بين كل من:
                        </p>

                        <div style={{ marginTop: '20px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                            <div style={{ padding: '12px', background: '#f8fafc', borderBottom: '1px solid #cbd5e1', fontWeight: 'bold', color: '#1e3a8a' }}>الطرف الأول (صاحب العمل):</div>
                            <div style={{ padding: '12px' }}>
                                <strong>{contract.partner?.name}</strong>، ويشار إليه في مواد هذا العقد بـ (صاحب العمل).
                                <br />
                                <span style={{ fontSize: '14px' }}>هاتف: {contract.partner?.phone} | عنوان: {contract.partner?.address || 'المملكة العربية السعودية'}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '15px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                            <div style={{ padding: '12px', background: '#f8fafc', borderBottom: '1px solid #cbd5e1', fontWeight: 'bold', color: '#1e3a8a' }}>الطرف الثاني (المقاول):</div>
                            <div style={{ padding: '12px' }}>
                                <strong>{companyInfo.name}</strong>، ممثلة بمديرها العام، ويشار إليه في مواد هذا العقد بـ (المقاول).
                                <br />
                                <span style={{ fontSize: '14px' }}>سجل تجاري: {companyInfo.crNumber} | هاتف: {companyInfo.phone}</span>
                            </div>
                        </div>

                        <p style={{ marginTop: '20px', fontSize: '15px' }}>
                            وحيث رغب الطرف الأول في تنفيذ أعمال: <strong>({contract.title})</strong>، وقد أبدى الطرف الثاني استعداده التام للتنفيذ طبقاً للشروط والمواصفات المتفق عليها...
                        </p>
                    </section>

                    {/* Clauses section with grid logic to prevent weird breaks */}
                    <section>
                        <h3 style={{ borderRight: '5px solid #1e3a8a', paddingRight: '10px', color: '#1e3a8a', fontSize: '1.2rem', marginBottom: '20px' }}>مواد العقد الأساسية:</h3>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {contract.clauses?.map((clause, idx) => (
                                <div key={idx} style={{ textAlign: 'justify', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                                    <span style={{ fontWeight: 'bold', color: '#c2410c' }}>مادة {clause.id}: </span>
                                    <span style={{ fontWeight: 'bold' }}>({clause.title})</span>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '14.5px', color: '#334155' }}>{clause.content}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                {/* Footer fixed on each page logic via CSS */}
                <footer style={{ padding: '5mm 15mm 15mm', borderTop: '1px solid #e2e8f0', marginTop: '20px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                    مستند صادر من نظام إلكتروني معتمد - مؤسسة الجنوب الجديد لتقنية المعلومات والمقاولات
                </footer>
            </div>

            {/* Second Page for BOQ & Signatures */}
            <div className="a4-sheet" style={{
                width: '210mm',
                margin: '20px auto',
                background: 'white',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                position: 'relative',
                pageBreakBefore: 'always'
            }}>
                <header style={{ padding: '15mm 15mm 5mm', borderBottom: '2px solid #1e3a8a', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '12px' }}>ملحق رقم (1): جدول الكميات والأعمال</div>
                    <div style={{ fontSize: '12px' }}>رقم العقد: {contract.contractNumber}</div>
                    <div style={{ fontSize: '12px' }}>صفحة 2 من 2</div>
                </header>

                <main style={{ padding: '10mm 15mm' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #1e3a8a' }}>
                        <thead>
                            <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px' }}>م</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'right' }}>بيان الأعمال والمواصفات</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px' }}>الوحدة</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px' }}>الكمية</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px' }}>سعر الوحدة</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px' }}>الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contract.items?.map((item, i) => (
                                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>{i + 1}</td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '8px', fontWeight: '600' }}>{item.description}</td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>{item.unit}</td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>{item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ fontWeight: 'bold' }}>
                                <td colSpan="5" style={{ border: '1.5px solid #1e3a8a', padding: '12px', textAlign: 'left' }}>المجموع الصافي (الخاضع للضريبة)</td>
                                <td style={{ border: '1.5px solid #1e3a8a', padding: '12px', textAlign: 'center' }}>{contract.netValue.toLocaleString()} ر.س</td>
                            </tr>
                            <tr style={{ fontWeight: 'bold', color: '#64748b' }}>
                                <td colSpan="5" style={{ border: '1.5px solid #1e3a8a', padding: '12px', textAlign: 'left' }}>ضريبة القيمة المضافة (15%)</td>
                                <td style={{ border: '1.5px solid #1e3a8a', padding: '12px', textAlign: 'center' }}>{contract.taxAmount.toLocaleString()} ر.س</td>
                            </tr>
                            <tr style={{ fontWeight: '900', fontSize: '1.2rem', background: '#dcfce7', color: '#166534' }}>
                                <td colSpan="5" style={{ border: '1.5px solid #1e3a8a', padding: '15px', textAlign: 'left' }}>القيمة الإجمالية النهائية</td>
                                <td style={{ border: '1.5px solid #1e3a8a', padding: '15px', textAlign: 'center' }}>{contract.totalValue.toLocaleString()} ر.س</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Master Signature Section - High Fidelity */}
                    <div style={{ marginTop: '50px', border: '2px solid #1e3a8a', borderRadius: '8px', padding: '30px' }}>
                        <h4 style={{ margin: '0 0 30px 0', textAlign: 'center', textDecoration: 'underline' }}>أقر أنا الطرفان المذكوران أعلاه بموافقتنا على كافة ما ورد في هذا العقد وملحقاته</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '40px' }}>الطرف الأول (صاحب العمل)</p>
                                <div style={{ borderBottom: '1px dashed #475569', width: '200px', margin: '15px auto' }}></div>
                                <span style={{ fontSize: '12px' }}>الاسم والتوقيع</span>
                                <div style={{ width: '120px', height: '120px', border: '2px dotted #e2e8f0', borderRadius: '50%', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0', fontSize: '10px' }}>محل الختم الرسمي للشركة</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '40px' }}>الطرف الثاني (المقاول)</p>
                                <div style={{ borderBottom: '1px dashed #475569', width: '200px', margin: '15px auto' }}></div>
                                <span style={{ fontSize: '12px' }}>الاسم والتوقيع</span>
                                <div style={{ width: '120px', height: '120px', background: '#f8fafc', border: '2px dashed #1e3a8a', borderRadius: '50%', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '10px' }}>محل الختم الرسمي للشركة</div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer style={{ position: 'absolute', bottom: '15mm', left: '15mm', right: '15mm', textAlign: 'center', fontSize: '10px', color: '#94a3b8' }}>
                    يعتبر هذا العقد ووثائقه وملحقاته وحدة واحدة لا تتجزأ | تم توليد المستند آلياً بتاريخ {new Date().toLocaleString('ar-SA')}
                </footer>
            </div>

            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
                    
                    @media print {
                        body { background: white !important; margin: 0; padding: 0; }
                        .master-container { background: white !important; padding: 0 !important; }
                        .a4-sheet { 
                            box-shadow: none !important; 
                            margin: 0 !important; 
                            width: 210mm !important; 
                            height: 297mm !important; 
                            page-break-after: always;
                            -webkit-print-color-adjust: exact;
                        }
                        .loader { display: none; }
                        /* Ensure table headers repeat if possible */
                        thead { display: table-header-group; }
                    }

                    /* General styling for archivable viewing */
                    body { -webkit-font-smoothing: antialiased; }
                    * { box-sizing: border-box; }
                `}
            </style>
        </div>
    );
};

export default ContractPrint;
