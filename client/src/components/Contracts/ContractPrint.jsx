import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';

/**
 * @component ContractPrint
 * @version 2.5 (Final Professional Edition)
 * @description نظام طباعة العقود الإنشائية المطور - يدعم تعدد الصفحات وتدفق البيانات الذكي.
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
        const element = document.getElementById('printable-document');
        const opt = {
            margin: [10, 0],
            filename: `Contract_${contract?.contractNumber}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                width: 794 // A4 width in pixels at 96 DPI
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        if (window.html2pdf) {
            window.html2pdf().from(element).set(opt).save();
        } else {
            window.print();
        }
    };

    if (loading || !contract) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '20px', color: '#1e3a8a', fontFamily: 'Cairo' }}>جاري تجهيز وثيقة التعاقد...</div>;

    const formattedDate = new Date(contract.createdAt).toLocaleDateString('ar-SA');

    return (
        <div style={{ direction: 'rtl', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Cairo, sans-serif' }}>
            {/* Toolbar Area */}
            <div className="no-print" style={{ background: '#0f172a', padding: '12px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                <div style={{ fontWeight: 'bold' }}>طباعة عقد مقاولات: {contract.contractNumber}</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => window.close()} style={{ background: '#475569', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>إغلاق</button>
                    <button onClick={handleDownloadPDF} style={{ background: '#2563eb', color: 'white', padding: '8px 25px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>تنزيل PDF</button>
                    <button onClick={() => window.print()} style={{ background: '#f59e0b', color: 'white', padding: '8px 25px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>طباعة</button>
                </div>
            </div>

            {/* Document Container */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0' }}>

                {/* Main A4 Style Wrapper */}
                <div id="printable-document" style={{ width: '210mm', minHeight: '297mm', background: 'white', padding: '20mm 40mm', boxShadow: '0 0 15px rgba(0,0,0,0.1)', color: '#1e293b' }}>

                    {/* Header Section */}
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px double #1e3a8a', paddingBottom: '15px', marginBottom: '10mm' }}>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#1e3a8a', fontWeight: '900' }}>{companyInfo.name}</h1>
                            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>سجل تجاري: {companyInfo.crNumber} | الرقم الضريبي: {companyInfo.vatNumber}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>الهاتف: {companyInfo.phone} | العنوان: {companyInfo.address}</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '10px 20px', border: '2px solid #1e3a8a', background: '#f8fafc' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#1e3a8a' }}>عقد مقاولات</h2>
                            <p style={{ margin: 0, fontSize: '9px', fontWeight: 'bold', color: '#1e3a8a', opacity: 0.8 }}>CONSTRUCTION AGREEMENT</p>
                        </div>
                        <div style={{ flex: 1, textAlign: 'left', fontSize: '12px' }}>
                            <p style={{ margin: 0 }}>الرقم: <strong>{contract.contractNumber}</strong></p>
                            <p style={{ margin: 0 }}>التاريخ: <strong>{formattedDate}</strong></p>
                        </div>
                    </header>

                    {/* Intro Section */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ textAlign: 'center', fontSize: '17px', marginBottom: '20px', textDecoration: 'underline' }}>اتفاقية تعاقد تنفيذ أعمال إنشائية</h3>
                        <p style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'justify' }}>
                            أنه في يوم ({new Date(contract.createdAt).toLocaleDateString('ar-SA', { weekday: 'long' })}) الموافق ({formattedDate} م)، تم الاتفاق والتعاقد بين كل من:
                            <br /><br />
                            <strong>الطرف الأول (صاحب العمل):</strong> {contract.partner?.name} | رقم الهوية/الضريبي: {contract.partner?.vatNumber || '---'} | هاتف: {contract.partner?.phone}
                            <br />
                            <strong>الطرف الثاني (المقاول):</strong> {companyInfo.name} | سجل تجاري رقم: {companyInfo.crNumber} | الرقم الضريبي: {companyInfo.vatNumber}
                        </p>

                        {contract.location && (
                            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px', marginTop: '15px', borderRadius: '6px', fontSize: '14px' }}>
                                📍 <strong>موقع تنفيذ المشروع:</strong> {contract.location}
                            </div>
                        )}
                    </div>

                    {/* Clauses Section (ALL CLAUSES) */}
                    <div style={{ marginBottom: '40px' }}>
                        <h4 style={{ borderRight: '5px solid #1e3a8a', paddingRight: '12px', color: '#1e3a8a', marginBottom: '15px' }}>أولاً: المواد التنظيمية والالتزامات</h4>
                        {contract.clauses?.map((clause, idx) => (
                            <div key={idx} style={{ marginBottom: '15px', pageBreakInside: 'avoid', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                                <div style={{ fontWeight: 'bold', color: '#1e3a8a', fontSize: '15px', marginBottom: '5px' }}>المادة ({clause.id}): {clause.title}</div>
                                <p style={{ margin: 0, fontSize: '13px', color: '#44546a', textAlign: 'justify', lineHeight: '1.6' }}>{clause.content}</p>
                            </div>
                        ))}
                    </div>

                    {/* BOQ Section */}
                    <div style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
                        <h4 style={{ borderRight: '5px solid #1e3a8a', paddingRight: '12px', color: '#1e3a8a', marginBottom: '15px' }}>ثانياً: جدول الكميات والمواصفات (BOQ)</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1.5px solid #1e3a8a' }}>
                            <thead>
                                <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '10px' }}>م</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'right' }}>بيان الأعمال والمواصفات</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '10px' }}>الوحدة</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '10px' }}>الكمية</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '10px' }}>السعر</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '10px' }}>الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contract.items?.map((item, i) => (
                                    <tr key={i}>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center' }}>{i + 1}</td>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '8px', fontWeight: 'bold' }}>{item.description}</td>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center' }}>{item.unit}</td>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center' }}>{item.unitPrice.toLocaleString()}</td>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                                    <td colSpan="5" style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'left' }}>المجموع الصافي (قبل الضريبة)</td>
                                    <td style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'center' }}>{contract.netValue.toLocaleString()} ر.س</td>
                                </tr>
                                <tr style={{ background: '#f8fafc', fontWeight: 'bold', color: '#64748b' }}>
                                    <td colSpan="5" style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'left' }}>ضريبة القيمة المضافة (15%)</td>
                                    <td style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'center' }}>{contract.taxAmount.toLocaleString()} ر.س</td>
                                </tr>
                                <tr style={{ background: '#1e3a8a', fontWeight: 'bold', color: 'white', fontSize: '16px' }}>
                                    <td colSpan="5" style={{ border: '1px solid #1e3a8a', padding: '12px', textAlign: 'left' }}>إجمالي قيمة العقد النهائية</td>
                                    <td style={{ border: '1px solid #1e3a8a', padding: '12px', textAlign: 'center' }}>{contract.totalValue.toLocaleString()} ر.س</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Signatures Section */}
                    <div style={{ marginTop: '60px', pageBreakInside: 'avoid' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', textAlign: 'center' }}>
                            <div>
                                <div style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: '8px', marginBottom: '60px', fontWeight: 'bold', color: '#1e3a8a' }}>توقيع الطرف الأول (صاحب العمل)</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>الاسم: ...........................................</div>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <div style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: '8px', marginBottom: '60px', fontWeight: 'bold', color: '#1e3a8a' }}>توقيع الطرف الثاني (المقاول)</div>
                                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{contract.signatureName || companyInfo.name}</div>

                                <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', opacity: 0.8 }}>
                                    <svg width="130" height="130" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#1e3a8a" strokeWidth="1.5" strokeDasharray="4,2" />
                                        <circle cx="50" cy="50" r="38" fill="none" stroke="#1e3a8a" strokeWidth="0.5" />
                                        <text x="50" y="52" fontSize="7" textAnchor="middle" fill="#1e3a8a" fontWeight="bold">رسمي مصادق إلكترونياً</text>
                                        <path d="M35 50L45 60L65 40" stroke="#10b981" strokeWidth="3" fill="none" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '80px', paddingTop: '10px', textAlign: 'center', fontSize: '10px', color: '#94a3b8' }}>
                        هذا المستند تم إنشاؤه عبر "نظام ساوث نييو" لإدارة المقاولات - حقوق الطبع محفوظة {new Date().getFullYear()}
                    </div>
                </div>
            </div>

            <style>
                {`
                    @media print {
                        body { background: white !important; margin: 0; padding: 0; }
                        .no-print { display: none !important; }
                        #printable-document { padding: 0 !important; margin: 0 !important; }
                        @page { size: A4 portrait; margin: 0; }
                    }
                `}
            </style>
        </div>
    );
};

export default ContractPrint;
