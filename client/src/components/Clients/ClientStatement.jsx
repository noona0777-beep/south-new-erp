import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Printer, ChevronRight, User, FileText, Calendar, DollarSign } from 'lucide-react';
import API_URL from '../../config';

const ClientStatement = () => {
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_URL}/partners/${id}`)
            .then(res => {
                setClient(res.data);
                setLoading(false);
            })
            .catch(err => {
                alert('خطأ في تحميل كشف الحساب');
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Cairo' }}>جاري تحميل كشف الحساب...</div>;
    if (!client) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Cairo' }}>العميل غير موجود</div>;

    const print = () => window.print();

    const totalBalance = client.invoices?.reduce((acc, inv) => acc + inv.total, 0) || 0;

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', padding: '40px', fontFamily: 'Cairo, sans-serif' }}>
            {/* Toolbar (Don't Print) */}
            <div className="no-print" style={{ maxWidth: '210mm', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                <Link to="/clients" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#64748b', fontWeight: 'bold' }}>
                    <ChevronRight size={18} /> العودة للعملاء
                </Link>
                <button onClick={print} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgb(37 99 235 / 0.3)' }}>
                    <Printer size={18} /> طباعة كشف الحساب
                </button>
            </div>

            {/* A4 Page */}
            <div id="printable-area" style={{
                background: 'white', width: '100%', maxWidth: '210mm', minHeight: '260mm', margin: '0 auto', padding: '20mm',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a', boxSizing: 'border-box',
                direction: 'rtl', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden'
            }} className="print-page">

                {/* Professional Watermark */}
                <div style={{
                    position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '70%', opacity: 0.06, pointerEvents: 'none', zIndex: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <img src="/watermark.png" alt="watermark" style={{ width: '100%', height: 'auto' }} />
                </div>

                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #1e3a8a', paddingBottom: '25px', marginBottom: '35px' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1e3a8a', fontWeight: '800' }}>مؤسسة الجنوب الجديد</h1>
                            <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>للتطوير و الاستثمار و التسويق العقاري</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#475569' }}>الرقم الضريبي: <span dir="ltr">310123456700003</span></p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#475569' }}>العنوان: أحد المسارحة ، جازان</p>
                        </div>
                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <div style={{ background: '#1e3a8a', color: 'white', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>كشف حساب عميل</div>
                            <div style={{ fontSize: '0.9rem', color: '#1e3a8a', fontWeight: 'bold' }}>{new Date().toLocaleDateString('ar-SA')}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '5px', fontWeight: 'bold' }}>المرجع: <span dir="ltr">N S S-ST-{id.padStart(5, '0')}</span></div>
                        </div>
                    </div>

                    {/* Client Information Section */}
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', marginBottom: '8px' }}>
                                <User size={16} /> معلومات العميل
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' }}>{client.name}</div>
                            <div style={{ fontSize: '0.9rem', color: '#475569' }}>رقم الجوال: {client.phone || 'غير مسجل'}</div>
                            {client.vatNumber && <div style={{ fontSize: '0.9rem', color: '#475569' }}>الرقم الضريبي: {client.vatNumber}</div>}
                        </div>
                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>الرصيد الإجمالي المستحق</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#2563eb' }}>{totalBalance.toLocaleString()} <span style={{ fontSize: '1rem' }}>ر.س</span></div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div style={{ borderBottom: '4px solid #1e3a8a', marginBottom: '35px' }}></div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                        <thead>
                            <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem' }}>التاريخ</th>
                                <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem' }}>رقم العملية</th>
                                <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem' }}>البيان</th>
                                <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '0.9rem' }}>المجموع</th>
                            </tr>
                        </thead>
                        <tbody>
                            {client.invoices && client.invoices.length > 0 ? (
                                client.invoices.map((inv, i) => (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '12px 15px', fontSize: '0.9rem' }}>{new Date(inv.date).toLocaleDateString('ar-SA')}</td>
                                        <td style={{ padding: '12px 15px', fontSize: '0.9rem', fontWeight: 'bold' }}>{inv.invoiceNumber}</td>
                                        <td style={{ padding: '12px 15px', fontSize: '0.9rem' }}>فاتورة مبيعات ضريبية</td>
                                        <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 'bold' }}>{inv.total.toLocaleString()} ر.س</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>لا توجد عمليات مسجلة</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Summary Section */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                        <div style={{ width: '300px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#64748b' }}>إجمالي الفواتير:</span>
                                <span style={{ fontWeight: 'bold' }}>{totalBalance.toLocaleString()} ر.س</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#64748b' }}>إجمالي المدفوعات:</span>
                                <span style={{ fontWeight: 'bold', color: '#10b981' }}>0.00 ر.س</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '2px solid #0f172a', fontSize: '1.2rem', fontWeight: '800', color: '#2563eb' }}>
                                <span>الرصيد النهائي:</span>
                                <span>{totalBalance.toLocaleString()} ر.س</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '30px' }}>
                        <p style={{ margin: '0 0 5px 0' }}>مؤسسة الجنوب الجديد - سجل تجاري رقم: 5900123456</p>
                        <p style={{ margin: 0 }}>تم إنشاء هذا التقرير آلياً من نظام إدارة موارد المؤسسة</p>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    @page { 
                        size: A4; 
                        margin: 0 !important; 
                    }
                    body { 
                        background: white !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                    }
                    #printable-area { 
                        box-shadow: none !important; 
                        margin: 0 auto !important; 
                        width: 210mm !important; 
                        height: 297mm !important;
                        min-height: 297mm !important;
                        padding: 15mm !important; 
                        border: none !important; 
                        position: relative !important;
                        overflow: hidden !important;
                    }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
};

export default ClientStatement;
