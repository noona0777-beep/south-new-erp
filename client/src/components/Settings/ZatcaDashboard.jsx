import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    Activity, CheckCircle2, AlertCircle, Clock,
    ShieldCheck, Link as LinkIcon, Download, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../Common/MotionComponents';
import API_URL from '../../config';

const ZatcaDashboard = () => {
    const { data: status, isLoading } = useQuery({
        queryKey: ['zatcaStatus'],
        queryFn: async () => (await axios.get(`${API_URL}/zatca/status`)).data,
        initialData: {
            connectionStatus: 'connected',
            lastReported: new Date().toISOString(),
            stats: { reported: 142, pending: 3, error: 0 }
        }
    });

    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>لوحة مراقبة زاتكا (ZATCA Phase 2)</h2>
                    <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>مراقبة حالة الربط الرقمي للفواتير الإلكترونية مع الهيئة</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#ecfdf5', color: '#059669', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', boxShadow: '0 0 10px #059669' }}></div>
                        متصل بالهيئة
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <motion.div {...fadeInUp} style={glassStyle}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '12px', color: '#2563eb' }}><CheckCircle2 /></div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>فواتير معتمدة</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{status.stats.reported}</div>
                        </div>
                    </div>
                </motion.div>
                <motion.div {...fadeInUp} style={glassStyle}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ padding: '12px', background: '#fff7ed', borderRadius: '12px', color: '#f59e0b' }}><Clock /></div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>في انتظار الربط</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{status.stats.pending}</div>
                        </div>
                    </div>
                </motion.div>
                <motion.div {...fadeInUp} style={glassStyle}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '12px', color: '#ef4444' }}><AlertCircle /></div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>أخطاء الربط</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{status.stats.error}</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div {...fadeInUp} style={{ ...glassStyle, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>سجل عمليات الربط اللحظي</h3>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <RefreshCw size={14} /> تحديث السجل
                    </button>
                </div>
                <div style={{ padding: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.85rem' }}>
                                <th style={{ padding: '12px' }}>رقم الفاتورة</th>
                                <th style={{ padding: '12px' }}>التوقيت</th>
                                <th style={{ padding: '12px' }}>النوع</th>
                                <th style={{ padding: '12px' }}>الحالة</th>
                                <th style={{ padding: '12px' }}>التحقق (XML)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1082, 1081, 1080].map(id => (
                                <tr key={id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                                    <td style={{ padding: '15px' }}>INV-{id}</td>
                                    <td style={{ padding: '15px' }}>منذ 10 دقائق</td>
                                    <td style={{ padding: '15px' }}>فاتورة ضريبية</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ padding: '4px 10px', background: '#ecfdf5', color: '#059669', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>معتمدة (Cleared)</span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <button style={{ color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Download size={14} /> تحميل XML
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default ZatcaDashboard;
