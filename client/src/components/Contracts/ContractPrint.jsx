import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';
import {
    Printer, Download, ArrowRight, ShieldCheck,
    MapPin, Calendar, User, Briefcase, FileText
} from 'lucide-react';

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
                    boxShadow: '0 0 40px rgba(0,0,0,0.05)', position: 'relative', display: 'flex', flexDirection: 'column'
                }}>

                    {/* Header: Logo & Company Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ background: '#1e3a8a', color: 'white', padding: '12px 30px', borderRadius: '30px 5px 30px 5px', display: 'inline-block', marginBottom: '15px' }}>
                                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900' }}>عقد مقاولات</h2>
                            </div>
                            <div style={{ color: '#64748b', fontSize: '13px' }}>
                                <div style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{formattedDate}</div>
                                <div>المرجع: {contract.contractNumber}</div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'left' }}>
                            <h1 style={{ margin: '0 0 5px 0', fontSize: '26px', color: '#1e3a8a', fontWeight: '900' }}>{companyInfo.name}</h1>
                            <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'left' }}>
                                <div>{companyInfo.crNumber} :سجل تجاري | {companyInfo.vatNumber} :الرقم الضريبي</div>
                                <div>{companyInfo.address} | {companyInfo.phone} :الهاتف</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '3px', background: '#1e3a8a', marginBottom: '40px', borderRadius: '2px' }}></div>

                    {/* Parties Info Card (Styled like Invoice Client ID) */}
                    <div style={{
                        background: '#f8fafc', borderRadius: '20px', padding: '25px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '40px', border: '1px solid #f1f5f9'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>
                                <User size={15} /> الطرف الأول (صاحب العمل)
                            </div>
                            <div style={{ fontSize: '22px', fontWeight: '900', color: '#1e3a8a', marginBottom: '5px' }}>{contract.partner?.name}</div>
                            <div style={{ color: '#94a3b8', fontSize: '13px' }}>{contract.partner?.phone}</div>
                        </div>

                        <div style={{ textAlign: 'left', flex: 1 }}>
                            <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '5px' }}>القيمة الإجمالية</div>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#1e3a8a' }}>{contract.totalValue.toLocaleString()} <span style={{ fontSize: '14px' }}>ر.س</span></div>
                        </div>
                    </div>

                    {/* Contract Scope & Details */}
                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <ShieldCheck size={22} color="#1e3a8a" />
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#1e3a8a', borderBottom: '2px solid #e2e8f0', flex: 1, paddingBottom: '5px' }}>بنود الاتفاقية وشروط التعاقد (SCA Standard)</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                            <div style={{ padding: '12px', borderRight: '4px solid #1e3a8a', background: '#f8fafc', borderRadius: '0 10px 10px 0' }}>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '3px' }}>موضوع العقد</div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>{contract.title}</div>
                            </div>
                            <div style={{ padding: '12px', borderRight: '4px solid #1e3a8a', background: '#f8fafc', borderRadius: '0 10px 10px 0' }}>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '3px' }}>موقع التنفيذ</div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>{contract.location || 'موقع العميل المعتمد'}</div>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '20px',
                            fontSize: '11px',
                            lineHeight: '1.6',
                            color: '#475569',
                            textAlign: 'justify'
                        }}>
                            {contract.clauses && Object.keys(contract.clauses).length > 0 ? (
                                Object.values(contract.clauses).map((c, i) => (
                                    <div key={i} style={{ marginBottom: '8px', padding: '8px', borderBottom: '1px solid #f1f5f9' }}>
                                        <strong style={{ color: '#1e3a8a', display: 'block', marginBottom: '3px' }}>المادة ({c.id || i + 1}): {c.title}</strong>
                                        <div>{c.content}</div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: '#94a3b8' }}>لم يتم إدراج بنود إضافية</div>
                            )}
                        </div>
                    </div>

                    {/* BOQ Table (Styled like Invoice Table) */}
                    <div style={{ marginBottom: '50px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <FileText size={20} color="#1e3a8a" />
                            <h4 style={{ margin: 0, color: '#1e3a8a' }}>جدول الكميات والمواصفات (BOQ)</h4>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', overflow: 'hidden', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <thead>
                                <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                    <th style={{ padding: '15px 10px', textAlign: 'right' }}>الصنف / الخدمة</th>
                                    <th style={{ padding: '15px 10px' }}>الكمية</th>
                                    <th style={{ padding: '15px 10px' }}>سعر الوحدة</th>
                                    <th style={{ padding: '15px 10px' }}>المجموع</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contract.items?.map((item, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '15px 10px', fontWeight: 'bold', color: '#1e293b' }}>{item.description}</td>
                                        <td style={{ padding: '15px 10px', textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                                        <td style={{ padding: '15px 10px', textAlign: 'center' }}>{item.unitPrice.toLocaleString()}</td>
                                        <td style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '900', color: '#1e3a8a' }}>{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary & QR Code (Exactly like Invoice Footer) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 'auto', paddingTop: '30px' }}>
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', width: '300px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                                <span style={{ color: '#64748b' }}>المجموع الفني:</span>
                                <span style={{ fontWeight: 'bold' }}>{contract.netValue.toLocaleString()} ر.س</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#64748b' }}>
                                <span>ضريبة القيمة المضافة (15%):</span>
                                <span style={{ fontWeight: 'bold' }}>{contract.taxAmount.toLocaleString()} ر.س</span>
                            </div>
                            <div style={{ height: '1px', background: '#e2e8f0', margin: '10px 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '900', color: '#1e3a8a' }}>
                                <span>إجمالي قيمة العقد:</span>
                                <span>{contract.totalValue.toLocaleString()} ر.س</span>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            {/* Placeholder for QR Code (In a real app, use a QR generator component) */}
                            <div style={{ width: '120px', height: '120px', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', background: '#fff' }}>
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=CONTRACT-${contract.contractNumber}`} alt="QR" style={{ width: '100px', height: '100px' }} />
                            </div>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>مسح للتحقق من العقد</div>
                        </div>
                    </div>

                    {/* Signature Section */}
                    <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', color: '#64748b', marginBottom: '30px', fontSize: '13px' }}>توقيع الطرف الأول (المؤسسة)</div>
                            <div style={{ width: '150px', height: '1px', background: '#e2e8f0', margin: '0 auto 10px' }}></div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a' }}>{companyInfo.name}</div>
                            <div style={{ color: '#10b981', fontSize: '11px', fontWeight: 'bold' }}>رسمي مصادق</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', color: '#64748b', marginBottom: '30px', fontSize: '13px' }}>توقيع الطرف الثاني (العميل)</div>
                            <div style={{ width: '150px', height: '1px', background: '#e2e8f0', margin: '0 auto 10px' }}></div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{contract.partner?.name}</div>
                        </div>
                    </div>

                    {/* Footer Page Numbering */}
                    <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '10px', textAlign: 'center', fontSize: '10px', color: '#cbd5e1' }}>
                        صادر من نظام ساوث نييو (South New System) - الرقم المرجعي للوثيقة عبر السيرفر: {contract.id}
                    </div>
                </div>
            </div>

            <style>
                {`
                    @media print {
                        body { background: white !important; margin: 0; padding: 0; }
                        .no-print { display: none !important; }
                        #printable-area { padding: 0 !important; margin: 0 !important; }
                        @page { size: A4 portrait; margin: 0; }
                        .card-shadow { box-shadow: none !important; border: 1px solid #f1f5f9 !important; }
                    }
                `}
            </style>
        </div>
    );
};

export default ContractPrint;
