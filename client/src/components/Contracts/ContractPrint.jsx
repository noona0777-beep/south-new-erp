import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';

/**
 * @component ContractPrint
 * @version 2.0 (Stable Rebuild)
 * @description حزمة الطباعة الرسمية لعقود المقاولات - نسخة مستقرة ومؤمنة ضد تداخل العناصر.
 */

const ContractPrint = () => {
    const { id } = useParams();
    const [contract, setContract] = useState(null);
    const [companyInfo, setCompanyInfo] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [cRes, sRes] = await Promise.all([
                    axios.get(`${API_URL}/construction-contracts/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/settings/companyInfo`)
                ]);
                setContract(cRes.data);
                setCompanyInfo(sRes.data);
                setLoading(false);
            } catch (err) {
                console.error('Fetch Error:', err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDownloadPDF = () => {
        const element = document.getElementById('printable-contract');
        const opt = {
            margin: 0,
            filename: `Contract_${contract?.contractNumber}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        if (window.html2pdf) {
            window.html2pdf().from(element).set(opt).save();
        } else {
            window.print();
        }
    };

    if (loading || !contract) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '20px', color: '#1e3a8a' }}>جاري تجهيز وثيقة التعاقد الرسمية...</div>;

    const formattedDate = new Date(contract.createdAt).toLocaleDateString('ar-SA');
    const dayName = new Date(contract.createdAt).toLocaleDateString('ar-SA', { weekday: 'long' });

    return (
        <div style={{ direction: 'rtl', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Cairo, sans-serif' }}>
            {/* Toolbar Buttons */}
            <div className="no-print" style={{ background: '#0f172a', padding: '15px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000 }}>
                <div style={{ color: 'white', fontWeight: 'bold' }}>معاينة وطباعة المستند الرسمي للتعاقد</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => window.close()} style={{ background: '#475569', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>إغلاق</button>
                    <button onClick={handleDownloadPDF} style={{ background: '#2563eb', color: 'white', padding: '10px 25px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>حفظ PDF</button>
                    <button onClick={() => window.print()} style={{ background: '#f59e0b', color: 'white', padding: '10px 25px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>طباعة فورية</button>
                </div>
            </div>

            <div id="printable-contract" style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* PAGE 1: Intro & Clauses */}
                <div className="a4-page-box" style={{ width: '210mm', minHeight: '297mm', background: 'white', padding: '20mm', position: 'relative', display: 'flex', flexDirection: 'column' }}>

                    {/* Official Corporate Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '4px double #1e3a8a', paddingBottom: '15px', marginBottom: '10mm' }}>
                        <div style={{ flex: 1.5 }}>
                            <h1 style={{ margin: '0 0 5px 0', color: '#1e3a8a', fontSize: '24px', fontWeight: '900' }}>{companyInfo.name}</h1>
                            <p style={{ margin: '2px 0', fontSize: '12px', color: '#475569' }}>سجل تجاري: {companyInfo.crNumber}</p>
                            <p style={{ margin: '2px 0', fontSize: '12px', color: '#475569' }}>الرقم الضريبي: {companyInfo.vatNumber}</p>
                            <p style={{ margin: '2px 0', fontSize: '12px', color: '#475569' }}>الهاتف: {companyInfo.phone}</p>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ border: '2px solid #1e3a8a', padding: '10px', background: '#f8fafc', marginBottom: '5px' }}>
                                <h2 style={{ margin: 0, fontSize: '20px', color: '#1e3a8a' }}>عقد مقاولات</h2>
                                <p style={{ margin: 0, fontSize: '9px', fontWeight: 'bold' }}>CONSTRUCTION AGREEMENT</p>
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', border: '1px solid #e2e8f0', display: 'inline-block', padding: '2px 10px' }}>عدد الصفحات: 2</div>
                        </div>
                        <div style={{ flex: 1.2, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <div style={{ width: '70px', height: '70px', border: '1px solid #e2e8f0', marginBottom: '5px', fontSize: '8px', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>QR CODE</div>
                            <div style={{ fontSize: '12px' }}>الرقم: <strong>{contract.contractNumber}</strong></div>
                            <div style={{ fontSize: '12px' }}>التاريخ: {formattedDate}</div>
                        </div>
                    </div>

                    {/* Parties Section */}
                    <div style={{ flex: 1 }}>
                        <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', marginBottom: '20px' }}>بعون الله وتوفيقه، تم إبرام هذا العقد بين كل من:</p>

                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
                            <span style={{ fontWeight: 'bold', color: '#1e3a8a', borderBottom: '2px solid #1e3a8a' }}>الطرف الأول (صاحب العمل):</span>
                            <div style={{ marginTop: '8px', fontSize: '14px' }}>
                                الاسم: <strong>{contract.partner?.name}</strong> | هاتف: {contract.partner?.phone} | الرقم الضريبي: {contract.partner?.vatNumber || 'غير متوفر'}
                                <br />العنوان: {contract.partner?.address || 'المملكة العربية السعودية'}
                            </div>
                        </div>

                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
                            <span style={{ fontWeight: 'bold', color: '#1e3a8a', borderBottom: '2px solid #1e3a8a' }}>الطرف الثاني (المقاول):</span>
                            <div style={{ marginTop: '8px', fontSize: '14px' }}>
                                المؤسسة: <strong>{companyInfo.name}</strong> | سجل تجاري: {companyInfo.crNumber} | الرقم الضريبي: {companyInfo.vatNumber}
                                <br />المقر: {companyInfo.address || 'المملكة العربية السعودية'}
                            </div>
                        </div>

                        {contract.location && (
                            <div style={{ border: '1px solid #fde68a', background: '#fffbeb', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '14px' }}>
                                📍 <strong>موقع تنفيذ المشروع:</strong> {contract.location}
                            </div>
                        )}

                        <p style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'justify' }}>
                            حيث رغب الطرف الأول في تنفيذ أعمال <strong>({contract.title})</strong>، واستناداً إلى خبرة الطرف الثاني، فقد اتفق الطرفان وهم بكامل الأهلية المعتبرة شرعاً ونظاماً على البنود التالية:
                        </p>

                        <div style={{ marginTop: '20px' }}>
                            {contract.clauses?.map((clause, idx) => (
                                <div key={idx} style={{ marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#1e3a8a' }}>المادة ({clause.id}): {clause.title}</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6', textAlign: 'justify' }}>{clause.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', textAlign: 'center', fontSize: '10px', color: '#94a3b8' }}>
                        مستند رسمي صادر الكترونياً - {companyInfo.name} - حقوق الطباعة محفوظة {new Date().getFullYear()}
                    </div>
                </div>

                {/* PAGE 2: BOQ & Signatures */}
                <div className="a4-page-box" style={{ width: '210mm', minHeight: '297mm', background: 'white', padding: '20mm', position: 'relative', marginTop: '10mm', display: 'flex', flexDirection: 'column' }}>

                    <div style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: '5px', marginBottom: '10mm', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold', color: '#1e3a8a' }}>ملحق جدول الكميات والمواصفات</span>
                        <span style={{ fontSize: '12px' }}>عقد رقم: {contract.contractNumber}</span>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                        <thead>
                            <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px', width: '40px' }}>م</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'right' }}>بيان الأعمال والمواصفات</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px', width: '60px' }}>الوحدة</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px', width: '60px' }}>الكمية</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px', width: '100px' }}>السعر</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px', width: '100px' }}>الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contract.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center' }}>{idx + 1}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '8px', fontWeight: '600' }}>{item.description}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center' }}>{item.unit}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center' }}>{item.unitPrice.toLocaleString()}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot style={{ fontWeight: 'bold' }}>
                            <tr>
                                <td colSpan="5" style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'left' }}>الإجمالي الصافي</td>
                                <td style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'center' }}>{contract.netValue.toLocaleString()} ر.س</td>
                            </tr>
                            <tr>
                                <td colSpan="5" style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'left' }}>ضريبة القيمة المضافة (15%)</td>
                                <td style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'center' }}>{contract.taxAmount.toLocaleString()} ر.س</td>
                            </tr>
                            <tr style={{ background: '#f8fafc', fontSize: '18px' }}>
                                <td colSpan="5" style={{ border: '2px solid #1e3a8a', padding: '12px', textAlign: 'left', color: '#1e3a8a' }}>إجمالي القيمة النهائية</td>
                                <td style={{ border: '2px solid #1e3a8a', padding: '12px', textAlign: 'center', color: '#1e3a8a' }}>{contract.totalValue.toLocaleString()} ر.س</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style={{ flex: 1, marginTop: '50px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: '5px', marginBottom: '50px', fontWeight: 'bold' }}>توقيع الطرف الأول</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>الاسم: .................................................</div>
                                <div style={{ width: '100px', height: '100px', border: '1px dotted #cbd5e1', borderRadius: '50%', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eff6ff', fontSize: '8px' }}>ختم الطرف الأول</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: '5px', marginBottom: '50px', fontWeight: 'bold' }}>توقيع الطرف الثاني (المقاول)</div>
                                <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{contract.signatureName || companyInfo.name}</div>

                                {/* SVG Stamp for quality */}
                                <div style={{ width: '140px', height: '140px', margin: '10px auto', position: 'relative' }}>
                                    <svg viewBox="0 0 100 100" style={{ opacity: 0.8, transform: 'rotate(-5deg)' }}>
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#1e3a8a" strokeWidth="2" strokeDasharray="3,3" />
                                        <circle cx="50" cy="50" r="38" fill="none" stroke="#1e3a8a" strokeWidth="1" />
                                        <text fontSize="7" fill="#1e3a8a" fontWeight="bold">
                                            <textPath href="#curvePath" startOffset="50%" textAnchor="middle">APPROVED DOCUMENT • {companyInfo.name} • SEAL</textPath>
                                        </text>
                                        <path id="curvePath" d="M 20,50 A 30,30 0 0 1 80,50" fill="none" />
                                        <g transform="translate(35,35) scale(0.3)">
                                            <path d="M50 5L10 25V50C10 75 50 95 50 95C50 95 90 75 90 50V25L50 5Z" fill="#1e3a8a" />
                                            <path d="M35 50L45 60L65 40" stroke="white" strokeWidth="8" fill="none" />
                                        </g>
                                    </svg>
                                    <div style={{ position: 'absolute', bottom: '15px', width: '100%', fontSize: '9px', color: '#1e3a8a', fontWeight: 'bold' }}>مصادق الكترونياً</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
                        يخضع هذا العقد لأنظمة المملكة العربية السعودية ويعد ملزماً لأطرافه من تاريخ التوقيع
                    </div>
                </div>
            </div>

            <style>
                {`
                    @media print {
                        body { background: white !important; margin: 0; padding: 0; }
                        .no-print { display: none !important; }
                        #printable-contract { padding: 0 !important; margin: 0 !important; width: 100% !important; }
                        .a4-page-box { 
                            box-shadow: none !important; 
                            margin: 0 !important; 
                            width: 210mm !important; 
                            height: 297mm !important; 
                            overflow: hidden; 
                            page-break-after: always;
                            border: none !important;
                        }
                        @page { size: A4 portrait; margin: 0; }
                    }
                `}
            </style>
        </div>
    );
};

export default ContractPrint;
