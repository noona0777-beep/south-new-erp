import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    FileText, Printer, CheckCircle, AlertCircle, 
    Clock, DollarSign, CreditCard, Receipt, 
    ArrowUpRight, Download, ShieldCheck, 
    TrendingUp, History, Search, LayoutGrid
} from 'lucide-react';
import API_URL from '@/config';
import { useNavigate } from 'react-router-dom';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

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
            PAID: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'تم السداد بالكامل', icon: CheckCircle },
            UNPAID: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'غير مسددة', icon: AlertCircle },
            PARTIAL: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'سداد جزئي', icon: Clock },
            OVERDUE: { bg: 'rgba(220, 38, 38, 0.1)', color: '#ef4444', label: 'متأخرة جداً', icon: AlertCircle },
            DRAFT: { bg: 'rgba(255, 255, 255, 0.05)', color: '#a1a1aa', label: 'تحت المراجعة', icon: FileText }
        };

        const current = styles[status] || styles.DRAFT;
        const Icon = current.icon;
        const pillClass = status.toLowerCase();

        return (
            <div className={`status-pill ${pillClass}`} style={{ fontSize: '0.75rem', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={14} /> {current.label}
            </div>
        );
    };

    const openProfessionalPrint = (invoiceId) => {
        window.open(`/invoices/${invoiceId}/print?hideToolbar=true`, '_blank');
    };

    if (loading) return (
        <div style={{ padding: '80px', textAlign: 'center', color: '#71717a' }}>
            <Receipt className="animate-spin" size={48} style={{ margin: '0 auto 20px', color: '#6366f1' }} />
            <h3 style={{ color: '#fff', fontWeight: '800' }}>جاري استخراج كشف الحساب والمالية...</h3>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '900', color: '#fff' }} className="gradient-text">المالية والتدفقات النقدية</h2>
                    <p style={{ margin: '5px 0 0 0', fontSize: '1rem', color: '#a1a1aa', fontWeight: '600' }}>مراجعة الفواتير الصادرة، حالة السداد، والدفعات التاريخية.</p>
                </div>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: '900', marginBottom: '5px' }}>إجمالي الفواتير الصادرة</div>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#fff' }}>
                        {invoices.reduce((acc, inv) => acc + (inv.total || 0), 0).toLocaleString()} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>ر.س</span>
                    </div>
                </div>
            </div>

            {invoices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '2px dashed rgba(255,255,255,0.05)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', color: '#52525b' }}>
                         <Receipt size={40} />
                    </div>
                    <h3 style={{ color: '#fff', fontWeight: '900', fontSize: '1.4rem' }}>لا توجد فواتير مالية مفلترة</h3>
                    <p style={{ color: '#71717a', fontSize: '1rem', maxWidth: '500px', margin: '10px auto', fontWeight: '600' }}>لم تصدر المنصة أي فواتير مالية رسمية بحق حسابك حتى اللحظة.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                    {invoices.map((invoice, idx) => (
                        <motion.div
                            key={invoice.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                            className="glass-card"
                            style={{ 
                                padding: '30px', 
                                borderRadius: '32px', 
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, padding: '15px' }}>
                                <StatusBadge status={invoice.status} />
                            </div>
                            
                            <div style={{ textAlign: 'center', marginBottom: '25px', marginTop: '10px' }}>
                                <div style={{ 
                                    width: '60px', height: '60px', borderRadius: '20px', 
                                    background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    margin: '0 auto 15px' 
                                }}>
                                    <FileText size={28} />
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>فاتورة رقم {invoice.invoiceNumber}</div>
                                <div style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: '800', marginTop: '5px' }}>{new Date(invoice.date).toLocaleDateString('ar-SA')}</div>
                            </div>

                            <div style={{ 
                                background: 'rgba(255,255,255,0.02)', 
                                padding: '20px', 
                                borderRadius: '24px', 
                                marginBottom: '25px', 
                                border: '1px solid rgba(255,255,255,0.03)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '600' }}>
                                    <span>المبالغ (صافي الأداء):</span>
                                    <span>{invoice.subtotal?.toLocaleString()} ر.س</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '600' }}>
                                    <span>الضريبة المضافة (15%):</span>
                                    <span>{invoice.taxAmount?.toLocaleString()} ر.س</span>
                                </div>
                                <div style={{ margin: '10px 0', borderTop: '1px dashed rgba(255,255,255,0.05)' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', color: '#fff', fontWeight: '900' }}>
                                    <span>الإجمالي المستحق</span>
                                    <span style={{ color: '#818cf8' }}>{invoice.total?.toLocaleString()} ر.س</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <motion.button
                                    {...buttonClick}
                                    onClick={() => openProfessionalPrint(invoice.id)}
                                    style={{ 
                                        flex: 1, 
                                        padding: '12px', 
                                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                                        color: '#fff', 
                                        border: 'none', 
                                        borderRadius: '14px', 
                                        cursor: 'pointer', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        gap: '10px', 
                                        fontWeight: '900', 
                                        fontSize: '0.9rem',
                                        fontFamily: 'Cairo'
                                    }}
                                >
                                    <Printer size={18} /> عرض وتدقيق الفاتورة
                                </motion.button>
                                <motion.button
                                    {...buttonClick}
                                    onClick={() => openProfessionalPrint(invoice.id)}
                                    title="تحميل نسخة PDF"
                                    style={{ 
                                        width: '48px', 
                                        background: 'rgba(255,255,255,0.02)', 
                                        color: '#a1a1aa', 
                                        border: '1px solid rgba(255,255,255,0.05)', 
                                        borderRadius: '14px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Download size={18} />
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientInvoices;
