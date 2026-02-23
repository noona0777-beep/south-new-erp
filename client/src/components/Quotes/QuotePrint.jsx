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
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '25px', marginBottom: '35px' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', fontWeight: '800' }}>مؤسسة الجنوب الجديد</h1>
                            <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>للتطوير و الاستثمار و التسويق العقاري</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#334155' }}>الرقم الضريبي: <span dir="ltr">310123456700003</span></p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#334155' }}>الموقع: أحد المسارحة، جازان</p>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <h2 style={{ margin: 0, color: '#2563eb', fontWeight: 'bold' }}>عرض سعر</h2>
                            <h3 style={{ margin: '5px 0', fontSize: '1.2rem', color: '#64748b' }}>#{quote.id.toString().padStart(6, '0')}</h3>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{quote.quoteNumber}</div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, paddingRight: '20px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold' }}>معلومات العميل</h4>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>{quote.partner?.name || 'عميل محتمل'}</div>
                            <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                {quote.partner?.address || 'غير محدد'}<br />
                                {quote.partner?.phone || ''}
                            </div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <div style={{ marginBottom: '15px', textAlign: 'right' }}>
                                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>تاريخ العرض</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{new Date(quote.date).toLocaleDateString('ar-SA')}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>صالح حتى</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('ar-SA') : 'غير محدد'}</div>
                            </div>
                            {/* QR Code */}
                            <div style={{ marginTop: '20px', padding: '10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                <QRCode value={qrContent} size={110} />
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #0f172a' }}>
                                <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem', color: '#334155' }}>الوصف</th>
                                <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '0.9rem', color: '#334155', width: '15%' }}>الكمية</th>
                                <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '0.9rem', color: '#334155', width: '20%' }}>سعر الوحدة</th>
                                <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '0.9rem', color: '#334155', width: '20%' }}>المجموع</th>
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '350px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                                <span style={{ color: '#64748b' }}>المجموع الفرعي:</span>
                                <span style={{ fontWeight: 'bold' }}>{quote.subtotal.toFixed(2)} ر.س</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                                <span style={{ color: '#64748b' }}>الخصم:</span>
                                <span style={{ color: '#ef4444' }}>- {quote.discount.toFixed(2)} ر.س</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '2px solid #0f172a' }}>
                                <span style={{ color: '#64748b' }}>الضريبة (15%):</span>
                                <span style={{ fontWeight: 'bold' }}>{quote.taxAmount.toFixed(2)} ر.س</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontSize: '1.3rem', fontWeight: '800', color: '#2563eb' }}>
                                <span>الإجمالي الكلي:</span>
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
