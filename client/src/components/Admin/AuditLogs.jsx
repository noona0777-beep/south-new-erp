import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_URL from '../../config';
import { Shield, Clock, User } from 'lucide-react';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const AuditLogs = () => {
    const { data: logs = [], isLoading } = useQuery({
        queryKey: ['auditLogs'],
        queryFn: async () => (await axios.get(`${API_URL}/logs`, { headers: H() })).data
    });

    const actionLabel = (action) => {
        const map = {
            'CREATE': 'إضافة',
            'UPDATE': 'تحديث',
            'DELETE': 'حذف',
            'LOGIN': 'تسجيل دخول'
        };
        return map[action] || action;
    };

    if (isLoading) return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontFamily: 'Cairo' }}>
            <Clock size={32} className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
            جاري تحميل سجل العمليات...
        </div>
    );

    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', direction: 'rtl' }}>
            <div className="mobile-grid-1" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <Shield size={24} color="#2563eb" />
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'Cairo' }}>سجل العمليات (Audit Trail)</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {logs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>لا توجد سجلات حالياً</div>
                ) : logs.map(log => (
                    <div key={log.id} className="mobile-grid-1" style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px', borderRadius: '12px', border: '1px solid #f8fafc',
                        background: '#fff', gap: '10px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <User size={20} color="#2563eb" />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 'bold', color: '#0f172a', fontFamily: 'Cairo' }}>{log.user?.name}</span>
                                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', background: '#e0e7ff', color: '#4338ca', fontFamily: 'Cairo' }}>
                                        {actionLabel(log.action)}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px', fontFamily: 'Cairo' }}>
                                    {log.entity}: {log.details}
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'left', color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                            <Clock size={14} />
                            {new Date(log.createdAt).toLocaleString('ar-SA')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AuditLogs;
