import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Printer, ChevronRight } from 'lucide-react';
import QRCode from 'qrcode.react';
import API_URL from '../../config';

const InvoicePrint = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);

    const [qrValue, setQrValue] = useState('');

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

    useEffect(() => {
        axios.get(`${API_URL}/invoices/${id}`)
            .then(res => {
                const inv = res.data;
                setInvoice(inv);
                // Generate Official ZATCA QR Code
                const qr = generateZatcaTLV(
                    "مؤسسة الجنوب الجديد",
                    "310123456700003",
                    new Date(inv.date).toISOString(),
                    inv.total.toFixed(2),
                    inv.taxAmount.toFixed(2)
                );
                setQrValue(qr);
            })
            .catch(err => alert('Error loading invoice'));
    }, [id]);

    if (!invoice) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Cairo' }}>جاري تحميل الفاتورة...</div>;

    const print = () => window.print();

    return (
        <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '40px', fontFamily: 'Cairo, sans-serif' }}>
            {/* Toolbar (Don't Print) */}
            <div className="no-print" style={{ maxWidth: '210mm', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                <Link to="/invoices" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#64748b' }}>
                    <ChevronRight size={18} /> العودة للفواتير
                </Link>
                <button onClick={print} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <Printer size={18} /> طباعة الفاتورة
                </button>
            </div>

            {/* A4 Page */}
            <div style={{
                background: 'white', width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', position: 'relative', color: '#0f172a', boxSizing: 'border-box'
            }} className="print-page">

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '25px', marginBottom: '35px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', fontWeight: '800' }}>مؤسسة الجنوب الجديد</h1>
                        <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>للمقاولات العامة والديكور وإدارة الأملاك</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#334155' }}>الرقم الضريبي: <span dir="ltr">310123456700003</span></p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#334155' }}>الموقع: أحد المسارحة، جازان</p>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <h2 style={{ margin: 0, color: '#2563eb', fontWeight: 'bold' }}>فاتورة ضريبية</h2>
                        <h3 style={{ margin: '5px 0', fontSize: '1.2rem', color: '#64748b' }}>#{invoice.id.toString().padStart(6, '0')}</h3>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{invoice.invoiceNumber}</div>
                    </div>
                </div>

                {/* Details Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, paddingRight: '20px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>معلومات العميل</h4>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>{invoice.partner?.name || 'عميل نقدي'}</div>
                        <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            {invoice.partner?.address || 'غير محدد'}<br />
                            {invoice.partner?.phone || ''}
                        </div>
                        {invoice.partner?.vatNumber && (
                            <div style={{ marginTop: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>الرقم الضريبي: {invoice.partner.vatNumber}</div>
                        )}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{ marginBottom: '15px', textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>تاريخ الإصدار</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{new Date(invoice.date).toLocaleDateString('en-GB')}</div>
                        </div>
                        {/* QR Code */}
                        <div style={{ padding: '10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <QRCode value={qrValue} size={110} />
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #0f172a' }}>
                            <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem', color: '#334155' }}>وصف السلعة / الخدمة</th>
                            <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '0.9rem', color: '#334155', width: '15%' }}>الكمية</th>
                            <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '0.9rem', color: '#334155', width: '20%' }}>سعر الوحدة</th>
                            <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '0.9rem', color: '#334155', width: '20%' }}>المجموع (شامل الضريبة)</th>
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
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '350px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                            <span style={{ color: '#64748b' }}>الإجمالي (غير شامل الضريبة):</span>
                            <span style={{ fontWeight: 'bold' }}>{invoice.subtotal.toFixed(2)} ر.س</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                            <span style={{ color: '#64748b' }}>الخصم:</span>
                            <span style={{ color: '#ef4444' }}>- {invoice.discount.toFixed(2)} ر.س</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '2px solid #0f172a' }}>
                            <span style={{ color: '#64748b' }}>ضريبة القيمة المضافة (15%):</span>
                            <span style={{ fontWeight: 'bold' }}>{invoice.taxAmount.toFixed(2)} ر.س</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontSize: '1.3rem', fontWeight: '800', color: '#2563eb' }}>
                            <span>المبلغ المستحق:</span>
                            <span>{invoice.total.toFixed(2)} ر.س</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
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
                    }
                    @page { 
                        size: A4; 
                        margin: 0; 
                    }
                    /* Ensure colors print */
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
};

export default InvoicePrint;
