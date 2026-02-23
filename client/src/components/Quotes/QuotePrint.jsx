import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Printer, ChevronRight, Download } from 'lucide-react';
import QRCode from 'qrcode.react';
import API_URL from '../../config';

const QuotePrint = () => {
    const { id } = useParams();
    const [quote, setQuote] = useState(null);

    const [qrContent, setQrContent] = useState('');
    const hideToolbar = new URLSearchParams(window.location.search).get('hideToolbar') === 'true';

    useEffect(() => {
        axios.get(`${API_URL}/quotes/${id}`)
            .then(res => setQuote(res.data))
            .catch(err => alert('خطأ في تحميل عرض السعر'));

        // Set QR content to current URL for online version
        setQrContent(window.location.href);
    }, [id]);

    const handleDownloadPDF = () => {
        const element = document.getElementById('printable-area');
        const opt = {
            margin: 0,
            filename: `Quote_${quote.quoteNumber}.pdf`,
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

    if (!quote) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Cairo' }}>جاري تحميل عرض السعر...</div>;

    const print = () => window.print();

    return (
        <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '40px', fontFamily: 'Cairo, sans-serif' }}>
            {/* Toolbar (Don't Print) */}
            {!hideToolbar && (
                <div className="no-print" style={{ maxWidth: '210mm', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                    <Link to="/quotes" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#64748b' }}>
                        <ChevronRight size={18} /> العودة لعروض الأسعار
                    </Link>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleDownloadPDF} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            <Download size={18} /> تحميل PDF
                        </button>
                        <button onClick={print} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            <Printer size={18} /> طباعة عرض السعر
                        </button>
                    </div>
                </div>
            )}

            {/* A4 Page */}
            <div id="printable-area" style={{
                background: 'white', width: '100%', maxWidth: '210mm', minHeight: '280mm', margin: '0 auto', padding: '20mm',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a', boxSizing: 'border-box',
                direction: 'rtl', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }} className="print-page">

                <div style={{ flex: 1 }}>
                    {/* Header Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#000', fontWeight: '900' }}>مؤسسة الجنوب الجديد</h1>
                            <p style={{ margin: '5px 0', color: '#64748b', fontSize: '1rem', fontWeight: 'bold' }}>للتطوير و الاستثمار و التسويق العقاري</p>
                            <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#475569' }}>الرقم الضريبي: <span dir="ltr">310123456700003</span></p>
                            <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#475569' }}>الموقع: أحد المسارحة، جازان</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ background: '#000', color: '#fff', padding: '12px 30px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px' }}>
                                عرض سعر
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#000', fontWeight: 'bold' }}>{new Date(quote.date).toLocaleDateString('en-GB')}</div>
                        </div>
                    </div>

                    {/* Thick Separator Line */}
                    <div style={{ borderBottom: '4px solid #000', marginBottom: '25px' }}></div>

                    {/* Client & Amount Box */}
                    <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', border: '1px solid #f1f5f9' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem', marginBottom: '10px' }}>
                                <div style={{ background: '#000', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <span style={{ fontSize: '12px' }}>👤</span>
                                </div>
                                معلومات العميل
                            </div>
                            <div style={{ fontWeight: '900', fontSize: '1.3rem', color: '#0f172a', marginBottom: '5px' }}>{quote.partner?.name || 'عميل محتمل'}</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{quote.partner?.phone || '0.......'}</div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '5px' }}>إجمالي العرض</div>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10b981' }}>
                                {quote.total.toFixed(2)} <span style={{ fontSize: '1.2rem' }}>ر.س</span>
                            </div>
                        </div>
                    </div>


                    {/* Items Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                        <thead>
                            <tr style={{ background: '#000', color: '#fff' }}>
                                <th style={{ padding: '15px', textAlign: 'right', fontSize: '0.9rem' }}>وصف البند / الخدمة</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontSize: '0.9rem', width: '10%' }}>الكمية</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontSize: '0.9rem', width: '18%' }}>سعر الوحدة</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontSize: '0.9rem', width: '18%' }}>المجموع</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quote.items.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px 15px', fontSize: '0.95rem' }}>{item.description || item.product?.name}</td>
                                    <td style={{ padding: '12px 15px', textAlign: 'center', fontSize: '0.95rem' }}>{item.quantity}</td>
                                    <td style={{ padding: '12px 15px', textAlign: 'center', fontSize: '0.95rem' }}>{item.unitPrice.toFixed(2)}</td>
                                    <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
                        <div style={{ padding: '10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <QRCode value={qrContent} size={100} />
                        </div>
                        <div style={{ width: '350px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b', fontWeight: 'bold' }}>المجموع الفرعي:</span>
                                <span style={{ fontWeight: 'bold' }}>{quote.subtotal.toFixed(2)} ر.س</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b', fontWeight: 'bold' }}>ضريبة القيمة المضافة (15%):</span>
                                <span style={{ fontWeight: 'bold' }}>{quote.taxAmount.toFixed(2)} ر.س</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', background: '#f8fafc', fontSize: '1.2rem', fontWeight: '900', color: '#000' }}>
                                <span>المجموع الكلي:</span>
                                <span>{quote.total.toFixed(2)} ر.س</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {quote.notes && (
                        <div style={{ marginTop: '30px', padding: '15px', background: '#f8fafc', borderRadius: '8px', borderRight: '4px solid #3b82f6' }}>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#334155' }}>ملاحظات العرض:</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', whiteSpace: 'pre-wrap' }}>{quote.notes}</p>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '30px' }}>
                    <p style={{ margin: '0 0 5px 0' }}>يسري هذا العرض لمدة محددة من تاريخ الإصدار</p>
                    <p style={{ margin: 0 }}>مؤسسة الجنوب الجديد - نعتز بثقتكم</p>
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
                        max-width: none !important;
                        min-height: auto !important;
                        padding: 0 !important; 
                        border: none !important; 
                        position: relative !important;
                    }
                    @page { 
                        size: A4; 
                        margin: 15mm; 
                    }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
};

export default QuotePrint;
