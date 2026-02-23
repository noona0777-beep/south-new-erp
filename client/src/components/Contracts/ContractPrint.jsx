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
        const element = document.getElementById('printable-area');
        const opt = {
            margin: 0,
            filename: `Contract_${contract?.contractNumber}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 1200 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        if (window.html2pdf) {
            window.html2pdf().from(element).set(opt).save();
        } else {
            window.print();
        }
    };

    if (loading || !contract) return <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Cairo' }}>جاري التحميل...</div>;

    const dateStr = new Date(contract.createdAt).toLocaleDateString('ar-SA');

    return (
        <div style={{ background: '#f1f5f9', minHeight: '100vh', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
            {/* Toolbar */}
            <div className="no-print" style={{ background: '#1e293b', padding: '10px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', position: 'sticky', top: 0, zIndex: 1000 }}>
                <span style={{ fontWeight: 'bold' }}>معاينة المستند الرسمي</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => window.close()} style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #64748b', background: 'none', color: 'white', cursor: 'pointer' }}>إلغاء</button>
                    <button onClick={handleDownloadPDF} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>تنزيل PDF</button>
                    <button onClick={() => window.print()} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#f59e0b', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>طباعة</button>
                </div>
            </div>

            <div id="printable-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>

                {/* PAGE 1 */}
                <div className="a4-page" style={{ width: '210mm', height: '297mm', background: 'white', padding: '15mm 20mm', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 0 10px rgba(0,0,0,0.1)', marginBottom: '10mm' }}>

                    {/* Header Group */}
                    <div style={{ borderBottom: '3px double #1e3a8a', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '10mm' }}>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#1e3a8a' }}>{companyInfo.name}</h1>
                            <p style={{ margin: 0, fontSize: '11px', color: '#475569' }}>سجل: {companyInfo.crNumber} | ضريبي: {companyInfo.vatNumber}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#475569' }}>هاتف: {companyInfo.phone}</p>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ border: '1px solid #1e3a8a', padding: '5px 15px', display: 'inline-block', background: '#f8fafc' }}>
                                <h2 style={{ margin: 0, fontSize: '18px', color: '#1e3a8a' }}>عقد مقاولات</h2>
                                <p style={{ margin: 0, fontSize: '8px', fontWeight: 'bold' }}>CONSTRUCTION AGREEMENT</p>
                            </div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'left', fontSize: '11px' }}>
                            <p style={{ margin: 0 }}>الرقم: <strong>{contract.contractNumber}</strong></p>
                            <p style={{ margin: 0 }}>التاريخ: <strong>{dateStr}</strong></p>
                            <p style={{ margin: 0 }}>النسخة: 1.0 (رسمي)</p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div style={{ flex: 1 }}>
                        <h3 style={{ textAlign: 'center', fontSize: '16px', marginBottom: '25px' }}>اتفاقية عقد أعمال مقاولات إنشائية</h3>

                        <div style={{ marginBottom: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                            أنه في يوم ({new Date(contract.createdAt).toLocaleDateString('ar-SA', { weekday: 'long' })}) الموافق ({dateStr} م)، تم الاتفاق بين:
                            <br /><br />
                            <strong>1. الطرف الأول:</strong> {contract.partner?.name} (صاحب العمل)
                            <br />
                            <strong>2. الطرف الثاني:</strong> {companyInfo.name} (المقاول)
                        </div>

                        {contract.location && (
                            <div style={{ background: '#fff9eb', padding: '10px', border: '1px solid #fde68a', borderRadius: '4px', fontSize: '13px', marginBottom: '20px' }}>
                                📍 <strong>موقع العمل:</strong> {contract.location}
                            </div>
                        )}

                        <div style={{ marginTop: '20px' }}>
                            {contract.clauses?.slice(0, 6).map((c, i) => (
                                <div key={i} style={{ marginBottom: '12px' }}>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#1e3a8a' }}>المادة ({c.id}): {c.title}</h4>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#334155', textAlign: 'justify' }}>{c.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '5px', textAlign: 'center', fontSize: '9px', color: '#94a3b8' }}>
                        الصفحة 1 من 2
                    </div>
                </div>

                {/* PAGE 2 */}
                <div className="a4-page" style={{ width: '210mm', height: '297mm', background: 'white', padding: '15mm 20mm', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>

                    <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', marginBottom: '10mm', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        ملحق الاعمال والمواصفات (BOQ) - تابع للعقد رقم {contract.contractNumber}
                    </div>

                    <div style={{ flex: 1 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                                <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '8px' }}>م</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '8px', textAlign: 'right' }}>الوصف والبيان</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '8px' }}>الوحدة</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '8px' }}>الكمية</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '8px' }}>السعر</th>
                                    <th style={{ border: '1px solid #1e3a8a', padding: '8px' }}>الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contract.items?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '6px', textAlign: 'center' }}>{idx + 1}</td>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '6px', fontWeight: 'bold' }}>{item.description}</td>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '6px', textAlign: 'center' }}>{item.unit}</td>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '6px', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '6px', textAlign: 'center' }}>{item.unitPrice.toLocaleString()}</td>
                                        <td style={{ border: '1px solid #e2e8f0', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ width: '250px', background: '#f8fafc', padding: '10px', border: '1px solid #1e3a8a' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span>الإجمالي الصافي:</span>
                                    <span>{contract.netValue.toLocaleString()} ر.س</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span>الضريبة (15%):</span>
                                    <span>{contract.taxAmount.toLocaleString()} ر.س</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '2px solid #1e3a8a', paddingTop: '5px', fontSize: '14px', color: '#1e3a8a' }}>
                                    <span>الإجمالي النهائي:</span>
                                    <span>{contract.totalValue.toLocaleString()} ر.س</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', textAlign: 'center' }}>
                            <div>
                                <div style={{ borderBottom: '1.5px solid #1e3a8a', paddingBottom: '5px', marginBottom: '40px', fontWeight: 'bold' }}>توقيع الطرف الأول (صاحب العمل)</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>الاسم: ...........................................</div>
                            </div>
                            <div>
                                <div style={{ borderBottom: '1.5px solid #1e3a8a', paddingBottom: '5px', marginBottom: '40px', fontWeight: 'bold' }}>توقيع الطرف الثاني (المقاول)</div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{contract.signatureName || companyInfo.name}</div>
                                <div style={{ marginTop: '10px' }}>
                                    <svg width="100" height="100" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#1e3a8a" strokeWidth="1" strokeDasharray="4,2" />
                                        <text x="50" y="55" fontSize="8" textAnchor="middle" fill="#1e3a8a" fontWeight="bold">رسمي مصادق</text>
                                        <circle cx="50" cy="50" r="35" fill="none" stroke="#1e3a8a" strokeWidth="0.5" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '5px', textAlign: 'center', fontSize: '9px', color: '#94a3b8' }}>
                        الصفحة 2 من 2 | صادر من "نظام ساوث نييو"
                    </div>
                </div>
            </div>

            <style>
                {`
                    @media print {
                        body { background: white !important; padding: 0 !important; margin: 0 !important; }
                        .no-print { display: none !important; }
                        #printable-area { padding: 0 !important; margin: 0 !important; }
                        .a4-page { Box-shadow: none !important; margin: 0 !important; page-break-after: always; border: none !important; }
                        @page { size: A4 portrait; margin: 0; }
                    }
                `}
            </style>
        </div>
    );
};

export default ContractPrint;
