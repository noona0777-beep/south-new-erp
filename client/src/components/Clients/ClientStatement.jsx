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
        <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '40px', fontFamily: 'Cairo, sans-serif' }}>
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
            <div style={{
                background: 'white', width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', position: 'relative', color: '#0f172a', boxSizing: 'border-box'
            }} className="print-page">

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #0f172a', paddingBottom: '25px', marginBottom: '35px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', fontWeight: '800' }}>مؤسسة الجنوب الجديد</h1>
                        <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>للمقاولات العامة والديكور وإدارة الأملاك</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#334155' }}>الرقم الضريبي: <span dir="ltr">310123456700003</span></p>
                    </div>
                    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{ background: '#0f172a', color: 'white', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>كشف حساب عميل</div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</div>
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
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                    <thead>
                        <tr style={{ background: '#0f172a', color: 'white' }}>
                            <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem' }}>التاريخ</th>
                            <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem' }}>رقم العملية</th>
                            <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '0.9rem' }}>البيان</th>
                            <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '0.9rem' }}>المبلغ</th>
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
                <div style={{ position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                    <p style={{ margin: '0 0 5px 0' }}>مؤسسة الجنوب الجديد - سجل تجاري رقم: 5900123456</p>
                    <p style={{ margin: 0 }}>تم إنشاء هذا التقرير آلياً من نظام إدارة موارد المؤسسة</p>
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
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
};

export default ClientStatement;
