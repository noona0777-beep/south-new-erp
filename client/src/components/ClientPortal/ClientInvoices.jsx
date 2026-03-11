import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Printer, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import API_URL from '@/config';
import { useNavigate } from 'react-router-dom';
// Import font data if you have it, else rely on system fonts for basic English/Numbers
// import { fontData } from '../Common/Amiri-Regular';

const ClientInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/client-portal/invoices`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvoices(res.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            PAID: { bg: '#dcfce7', text: '#15803d', icon: <CheckCircle size={14} />, label: 'مدفوعة' },
            UNPAID: { bg: '#fef2f2', text: '#b91c1c', icon: <AlertCircle size={14} />, label: 'غير مدفوعة' },
            PARTIAL: { bg: '#fef9c3', text: '#a16207', icon: <Clock size={14} />, label: 'مدفوعة جزئياً' },
            OVERDUE: { bg: '#fee2e2', text: '#991b1b', icon: <AlertCircle size={14} />, label: 'متأخرة' },
            DRAFT: { bg: '#f1f5f9', text: '#475569', icon: <FileText size={14} />, label: 'مسودة' }
        };

        const currentStyle = styles[status] || styles.DRAFT;

        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: currentStyle.bg, color: currentStyle.text,
                padding: '4px 12px', borderRadius: '20px',
                fontSize: '0.8rem', fontWeight: 700
            }}>
                {currentStyle.icon} {currentStyle.label}
            </span>
        );
    };

    const openProfessionalPrint = (invoiceId) => {
        // We use the central InvoicePrint component that is already correctly styled
        // We open it in a new tab with hideToolbar=true to make it look like a clean PDF view
        window.open(`/invoices/${invoiceId}/print?hideToolbar=true`, '_blank');
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>جاري تحميل الفواتير المالية...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>فواتيري والحساب المالي</h2>

            {invoices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                    <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>لا توجد فواتير</h3>
                    <p>لم يتم إصدار أي فواتير بحق حسابك حتى الآن.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {invoices.map((invoice) => (
                        <motion.div
                            whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            key={invoice.id}
                            style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>{invoice.invoiceNumber}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(invoice.date).toLocaleDateString()}</div>
                                </div>
                                <StatusBadge status={invoice.status} />
                            </div>

                            <div style={{ padding: '16px 0', borderTop: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>
                                    <span>المبلغ الصافي:</span>
                                    <span>{invoice.subtotal} ر.س</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>
                                    <span>الضريبة (15%):</span>
                                    <span>{invoice.taxAmount} ر.س</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', color: '#0f172a', marginTop: '12px' }}>
                                    <span>الإجمالي:</span>
                                    <span>{invoice.total} ر.س</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                <button
                                    onClick={() => openProfessionalPrint(invoice.id)}
                                    style={{ flex: 1, padding: '10px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}
                                    onMouseOver={(e) => Object.assign(e.target.style, { background: '#dbeafe' })}
                                    onMouseOut={(e) => Object.assign(e.target.style, { background: '#eff6ff' })}
                                >
                                    <Printer size={16} /> عرض وطباعة الفاتورة الرسمية
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientInvoices;
