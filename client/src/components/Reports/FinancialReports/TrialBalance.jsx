import { useQuery } from '@tanstack/react-query';
import { Printer, Download, Clock, AlertOctagon } from 'lucide-react';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const TrialBalance = () => {
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

    const { data: accounts = [], isLoading, error } = useQuery({
        queryKey: ['report', 'trial-balance', asOfDate],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/reports/trial-balance?date=${asOfDate}`, {
                headers: H()
            });
            return res.data;
        }
    });

    const totalDebit = accounts.reduce((s, a) => s + (a.balance > 0 ? a.balance : 0), 0);
    const totalCredit = accounts.reduce((s, a) => s + (a.balance < 0 ? Math.abs(a.balance) : 0), 0);

    const exportToCSV = () => {
        const headers = ['كود الحساب', 'اسم الحساب', 'مدين', 'دائن'];
        const rows = accounts.map(a => [
            a.code,
            a.name,
            a.balance > 0 ? a.balance : 0,
            a.balance < 0 ? Math.abs(a.balance) : 0
        ]);

        // Add footer
        rows.push(['', 'المجموع', totalDebit, totalCredit]);

        const content = [headers, ...rows].map(e => e.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `TrialBalance_${asOfDate}.csv`;
        link.click();
    };

    if (isLoading) return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <Clock className="animate-spin" size={24} style={{ marginBottom: 10, display: 'block', margin: '0 auto' }} />
            جاري التحميل...
        </div>
    );

    if (error) return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444', background: '#fef2f2', borderRadius: 12 }}>
            <AlertOctagon size={24} style={{ marginBottom: 10, display: 'block', margin: '0 auto' }} />
            خطأ في تحميل ميزان المراجعة
        </div>
    );

    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <div className="mobile-grid-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '15px' }}>
                <div className="mobile-grid-1" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold' }}>ميزان المراجعة</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
                        <label style={{ fontSize: '0.85rem', color: '#64748b' }}>حتى تاريخ:</label>
                        <input
                            type="date"
                            value={asOfDate}
                            onChange={(e) => setAsOfDate(e.target.value)}
                            style={{ border: 'none', background: 'transparent', fontFamily: 'Cairo', fontSize: '0.9rem', outline: 'none', color: '#1e293b', width: '130px' }}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => window.print()} className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
                        <Printer size={16} /> طباعة
                    </button>
                    <button onClick={exportToCSV} className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer' }}>
                        <Download size={16} /> تصدير Excel
                    </button>
                </div>
            </div>

            <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', direction: 'rtl', minWidth: '700px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '12px', textAlign: 'right' }}>كود الحساب</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>اسم الحساب</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>مدين (Debit)</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>دائن (Credit)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map(acc => (
                            <tr key={acc.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                                <td style={{ padding: '12px', color: '#64748b' }}>{acc.code}</td>
                                <td style={{ padding: '12px', fontWeight: '600' }}>{acc.name}</td>
                                <td style={{ padding: '12px', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>
                                    {acc.balance > 0 ? format(acc.balance) : '-'}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center', color: '#ef4444', fontWeight: 'bold' }}>
                                    {acc.balance < 0 ? format(Math.abs(acc.balance)) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ background: '#f8fafc', fontWeight: 'bold', fontSize: '1.1rem', borderTop: '2px solid #e2e8f0' }}>
                            <td colSpan="2" style={{ padding: '15px', textAlign: 'left' }}>المجموع الإجمالي:</td>
                            <td style={{ padding: '15px', textAlign: 'center', color: '#10b981' }}>{format(totalDebit)}</td>
                            <td style={{ padding: '15px', textAlign: 'center', color: '#ef4444' }}>{format(totalCredit)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default TrialBalance;
