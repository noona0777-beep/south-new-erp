import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Printer, ChevronRight, Download } from 'lucide-react';
import QRCode from 'qrcode.react';
import API_URL from '../../config';

const InvoicePrint = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);

    const [qrValue, setQrValue] = useState('');
    const [companyInfo, setCompanyInfo] = useState({ name: 'مؤسسة الجنوب الوثيق', vatNumber: '310123456700003' });
    const hideToolbar = new URLSearchParams(window.location.search).get('hideToolbar') === 'true';

    const generateZatcaTLV = (seller, vatNo, timestamp, total, vatTotal) => {
        const tags = [seller, vatNo, timestamp, total, vatTotal];
        let tlv = [];
        tags.forEach((val, i) => {
            const tag = i + 1;
            const textEncoder = new TextEncoder();
            const value = textEncoder.encode(val.toString());
            tlv.push(tag, value.length, ...value);
        });
        return btoa(String.fromCharCode(...tlv));
    };

    const handleDownloadPDF = () => {
        const element = document.getElementById('printable-area');
        const opt = {
            margin: 0,
            filename: `Invoice_${invoice.invoiceNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        // @ts-ignore
        if (window.html2pdf) {
            // @ts-ignore
            window.html2pdf().from(element).set(opt).save();
        } else {
            alert('PDF library not loaded yet. Please try again.');
        }
    };

    useEffect(() => {
        // Fetch Company Info
        axios.get(`${API_URL}/settings/companyInfo`)
            .then(res => setCompanyInfo(res.data))
            .catch(() => { });

        axios.get(`${API_URL}/invoices/${id}`)
            .then(res => {
                const inv = res.data;
                setInvoice(inv);
                if (inv.qrCode) {
                    setQrValue(inv.qrCode);
                } else {
                    const qr = generateZatcaTLV(
                        companyInfo.name || "مؤسسة الجنوب الجديد",
                        companyInfo.vatNumber || "310123456700003",
                        new Date(inv.date).toISOString(),
                        inv.total.toFixed(2),
                        inv.taxAmount.toFixed(2)
                    );
                    setQrValue(qr);
                }
            })
            .catch(err => alert('Error loading invoice'));
    }, [id, companyInfo.name, companyInfo.vatNumber]);

    if (!invoice) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Cairo' }}>جاري تحميل الفاتورة...</div>;

    const print = () => window.print();

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', padding: '40px', fontFamily: 'Cairo, sans-serif' }}>
            {/* Toolbar (Don't Print) */}
            {!hideToolbar && (
                <div className="no-print" style={{ maxWidth: '210mm', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                    <Link to="/invoices" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#64748b' }}>
                        <ChevronRight size={18} /> العودة للفواتير
                    </Link>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleDownloadPDF} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            <Download size={18} /> تحميل PDF
                        </button>
                        <button onClick={print} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            <Printer size={18} /> طباعة الفاتورة
                        </button>
                    </div>
                </div>
            )}

            {/* A4 Page */}
            <div id="printable-area" style={{
                background: 'white', width: '100%', maxWidth: '210mm', minHeight: '280mm', margin: '0 auto', padding: '20mm',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a', boxSizing: 'border-box',
                direction: 'rtl', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden'
            }} className="print-page">

                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                    {/* Header Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1e3a8a', fontWeight: '900' }}>{companyInfo.name || 'مؤسسة الجنوب الجديد'}</h1>
                            <p style={{ margin: '5px 0', color: '#64748b', fontSize: '1rem', fontWeight: 'bold' }}>للتطوير و الاستثمار و التسويق العقاري</p>
                            <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#475569' }}>الرقم الضريبي: <span dir="ltr">{companyInfo.vatNumber || '310123456700003'}</span></p>
                            <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#475569' }}>العنوان: أحد المسارحة ، جازان</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ background: '#1e3a8a', color: '#fff', padding: '12px 30px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px' }}>
                                فاتورة ضريبية
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#1e3a8a', fontWeight: 'bold' }}>{new Date(invoice.date).toLocaleDateString('en-GB')}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '5px', fontWeight: 'bold' }}>المرجع: <span dir="ltr">N S S-INV-{invoice.id.toString().padStart(5, '0')}</span></div>
                        </div>
                    </div>

                    {/* Thick Separator Line */}
                    <div style={{ borderBottom: '4px solid #1e3a8a', marginBottom: '25px' }}></div>

                    {/* Client & Amount Box */}
                    <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', border: '1px solid #f1f5f9' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem', marginBottom: '10px' }}>
                                <div style={{ background: '#1e3a8a', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <span style={{ fontSize: '12px' }}>👤</span>
                                </div>
                                معلومات العميل
                            </div>
                            <div style={{ fontWeight: '900', fontSize: '1.3rem', color: '#0f172a', marginBottom: '5px' }}>{invoice.partner?.name || 'عميل نقدي'}</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{invoice.partner?.phone || '0.......'}</div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '5px' }}>المبلغ المستحق</div>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e40af' }}>
                                {invoice.total.toFixed(2)} <span style={{ fontSize: '1.2rem' }}>ر.س</span>
                            </div>
                        </div>
                    </div>


                    {/* Items Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                        <thead>
                            <tr style={{ background: '#1e3a8a', color: '#fff' }}>
                                <th style={{ padding: '15px', textAlign: 'right', fontSize: '0.9rem' }}>الصنف / الخدمة</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontSize: '0.9rem', width: '10%' }}>الكمية</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontSize: '0.9rem', width: '18%' }}>سعر الوحدة</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontSize: '0.9rem', width: '18%' }}>المجموع</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px 15px', fontSize: '0.95rem' }}>{item.description}</td>
                                    <td style={{ padding: '12px 15px', textAlign: 'center', fontSize: '0.95rem' }}>{item.quantity}</td>
                                    <td style={{ padding: '12px 15px', textAlign: 'center', fontSize: '0.95rem' }}>{item.unitPrice.toFixed(2)}</td>
                                    <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>{(item.quantity * item.unitPrice * 1.15).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
                        <div style={{ padding: '10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <QRCode value={qrValue} size={100} />
                        </div>
                        <div style={{ width: '350px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b', fontWeight: 'bold' }}>المجموع الفرعي:</span>
                                <span style={{ fontWeight: 'bold' }}>{invoice.subtotal.toFixed(2)} ر.س</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b', fontWeight: 'bold' }}>ضريبة القيمة المضافة (15%):</span>
                                <span style={{ fontWeight: 'bold' }}>{invoice.taxAmount.toFixed(2)} ر.س</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', background: '#f8fafc', fontSize: '1.2rem', fontWeight: '900', color: '#1e3a8a' }}>
                                <span>المجموع الكلي:</span>
                                <span>{invoice.total.toFixed(2)} ر.س</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '30px' }}>
                    <p style={{ margin: '0 0 5px 0' }}>شكراً لاستخدامكم خدمات مؤسسة الجنوب الجديد</p>
                    <p style={{ margin: 0 }}>تم إصدار هذه الفاتورة إلكترونياً وهي معتمدة. لا يتطلب توقيع.</p>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; margin: 0; padding: 0 !important; }
                    .print-page { 
                        box-shadow: none !important; 
                        margin: 0 !important; 
                        width: 100% !important; 
                        padding: 10mm !important; 
                        border: none !important; 
                        height: auto !important;
                        min-height: auto !important;
                    }
                    @page { 
                        size: A4; 
                        margin: 10mm 0; 
                    }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
};

export default InvoicePrint;
