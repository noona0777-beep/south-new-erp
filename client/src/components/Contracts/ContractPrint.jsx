import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';
import {
    Printer, Download, ArrowRight, ShieldCheck,
    MapPin, Calendar, User, Briefcase, FileText
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * @component ContractPrint
 * @description نسخة مطورة لطباعة العقود بستايل الفاتورة الضريبية الحديثة لدقة واحترافية عالية.
 */
const ContractPrint = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
            margin: [5, 0],
            filename: `Contract_${contract?.contractNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                width: 794 // A4 width
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        if (window.html2pdf) {
            window.html2pdf().from(element).set(opt).save();
        } else {
            window.print();
        }
    };

    if (loading || !contract) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '18px', fontFamily: 'Cairo' }}>⏳ جاري تجهيز وثيقة التعاقد...</div>;

    const formattedDate = new Date(contract.createdAt).toLocaleDateString('ar-SA');

    return (
        <div style={{ direction: 'rtl', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Cairo, sans-serif' }}>
            {/* Toolbar */}
            <div className="no-print" style={{
                background: 'white', padding: '15px 40px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000
            }}>
                <button onClick={() => navigate('/contracts')} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold' }}>
                    <ArrowRight size={18} /> العودة للعقود
                </button>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleDownloadPDF} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={18} /> تحميل PDF
                    </button>
                    <button onClick={() => window.print()} style={{ background: '#1e3a8a', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Printer size={18} /> طباعة العقد
                    </button>
                </div>
            </div>

            {/* A4 Paper Container */}
            <div id="printable-area" style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
                <div style={{
                    width: '210mm', minHeight: '297mm', background: 'white', padding: '15mm 20mm',
                    position: 'relative', display: 'flex', flexDirection: 'column'
                }}>

                    {/* Header Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '28px', color: '#1e3a8a', fontWeight: '900' }}>عقد مقاولات إنشائية</h1>
                            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
                                <span>الرقم المرجعي: <strong>{contract.contractNumber}</strong></span>
                                <span>التاريخ: <strong>{formattedDate}</strong></span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e3a8a' }}>{companyInfo.name}</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>المملكة العربية السعودية | الرقم الضريبي: {companyInfo.vatNumber}</div>
                        </div>
                    </div>

                    {/* Parties Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                        <div style={{ padding: '0 20px', borderRight: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>الطرف الأول (صاحب العمل)</div>
                            <div style={{ fontSize: '18px', fontWeight: '900', color: '#1e3a8a' }}>{contract.partner?.name}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>هاتف: {contract.partner?.phone}</div>
                        </div>
                        <div style={{ padding: '0 20px', borderRight: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>الطرف الثاني (المقاول)</div>
                            <div style={{ fontSize: '18px', fontWeight: '900', color: '#1e3a8a' }}>{companyInfo.name}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>هاتف: {companyInfo.phone}</div>
                        </div>
                    </div>

                    {/* Contract Scope & Details */}
                    <div style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', borderBottom: '2px solid #1e3a8a', paddingBottom: '8px' }}>
                            <ShieldCheck size={24} color="#1e3a8a" />
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#1e3a8a', fontWeight: '900' }}>بنود العقد والشروط الفنية (SCA)</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                            <div style={{ borderRight: '3px solid #1e3a8a', paddingRight: '15px' }}>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>موضوع التعاقد</div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{contract.title}</div>
                            </div>
                            <div style={{ borderRight: '3px solid #1e3a8a', paddingRight: '15px' }}>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>مدة التنفيذ المتوقعة</div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>من {new Date(contract.startDate).toLocaleDateString('ar-SA')} إلى {new Date(contract.endDate).toLocaleDateString('ar-SA')}</div>
                            </div>
                        </div>

                        <div style={{ fontSize: '12px', lineHeight: '1.8', color: '#334155', textAlign: 'justify' }}>
                            {(() => {
                                const clauses = Array.isArray(contract.clauses) ? contract.clauses :
                                    (typeof contract.clauses === 'object' && contract.clauses !== null ? Object.values(contract.clauses) : []);

                                if (clauses.length > 0) {
                                    return clauses.map((c, idx) => (
                                        <div key={idx} style={{ marginBottom: '12px', pageBreakInside: 'avoid' }}>
                                            <strong style={{ color: '#1e3a8a' }}>المادة ({c.id || idx + 1}): {c.title}</strong>
                                            <p style={{ margin: '3px 0 0 0', paddingRight: '15px', color: '#475569' }}>{c.content}</p>
                                        </div>
                                    ));
                                }
                                return <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>لم يتم إدراج بنود إضافية</div>;
                            })()}
                        </div>
                    </div>

                    {/* BOQ Section */}
                    <div className="print-section" style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '8px 0', borderBottom: '1px solid #1e3a8a' }}>
                            <FileText size={18} color="#1e3a8a" />
                            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#1e3a8a' }}>ثانياً: جدول الكميات والمواصفات المعتمد (BOQ)</h2>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #e2e8f0' }}>
                            <thead style={{ display: 'table-header-group' }}>
                                <tr style={{ borderBottom: '2px solid #1e3a8a' }}>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>البيان / الوصف</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>الوحدة</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>الكمية</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>سعر الوحدة</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contract.items?.map((item, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', pageBreakInside: 'avoid' }}>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.description}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>{item.unit}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>{(item.unitPrice || 0).toLocaleString()}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#1e3a8a' }}>{(item.total || 0).toLocaleString()} ر.س</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals & Signatures Area */}
                    <div className="print-section" style={{ marginTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', pageBreakInside: 'avoid' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'inline-block' }}>
                                    <QRCodeSVG value={`https://south-new-system.com/verify/${contract.id}`} size={90} />
                                </div>
                                <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '5px' }}>تحقق من صحة العقد</div>
                            </div>

                            <div style={{ width: '60%', border: '2px solid #1e3a8a', padding: '20px', borderRadius: '12px', marginRight: '40px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: '#475569' }}>
                                    <span>المجموع الفرعي:</span>
                                    <span>{(contract.netValue || 0).toLocaleString()} ر.س</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '12px', color: '#475569' }}>
                                    <span>ضريبة القيمة المضافة (15%):</span>
                                    <span>{(contract.taxAmount || 0).toLocaleString()} ر.س</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '20px', fontWeight: '900', color: '#1e3a8a' }}>
                                    <span>إجمالي قيمة العقد:</span>
                                    <span>{(contract.totalValue || 0).toLocaleString()} ر.س</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', width: '100%', marginBottom: '20px', pageBreakInside: 'avoid' }}>
                            <div style={{ flex: 1, textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginLeft: '30px' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '20px' }}>الطرف الأول (صاحب العمل)</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{contract.partner?.name}</div>
                                <div style={{ height: '40px' }}></div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginRight: '30px' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '20px' }}>الطرف الثاني (المقاول)</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{companyInfo.name}</div>
                                <div style={{ height: '40px' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* System Footer */}
                    <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 'auto', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#cbd5e1' }}>
                        <span>تم إصدار هذا العقد آلياً من نظام {companyInfo.name}</span>
                        <span>رقم الوثيقة: {contract.id}-{Date.now()}</span>
                    </div>
                </div>
            </div>

            <style>
                {`
                    @media print {
                        @page { 
                            size: A4 portrait; 
                            margin: 15mm 10mm 15mm 10mm;
                        }
                        body { 
                            background: white !important; 
                            margin: 0; 
                            padding: 0;
                            -webkit-print-color-adjust: exact;
                        }
                        .no-print { display: none !important; }
                        #printable-area { 
                            padding: 0 !important; 
                            margin: 0 !important;
                            display: block !important;
                        }
                        #printable-area > div {
                            box-shadow: none !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            width: 100% !important;
                        }
                        .print-section {
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                            display: block;
                            width: 100%;
                        }
                        table { 
                            width: 100% !important;
                            border-collapse: collapse !important;
                            page-break-inside: auto !important;
                        }
                        tr { 
                            page-break-inside: avoid !important; 
                            page-break-after: auto !important;
                        }
                        thead { 
                            display: table-header-group !important;
                        }
                        h1, h2, h3 { 
                            page-break-after: avoid !important; 
                        }
                        p, div {
                            orphans: 3;
                            widows: 3;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default ContractPrint;
