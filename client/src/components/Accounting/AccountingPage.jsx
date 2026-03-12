import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
    LayoutDashboard, PieChart, Landmark, ArrowUpRight, ArrowDownLeft, 
    Plus, History, Search, Filter, MoreVertical, ChevronDown, 
    ChevronRight, BookOpen, Calculator, Calendar, Download,
    FolderTree, Wallet, Receipt, TrendingUp, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '@/config';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';

import JournalModal from './JournalModal.jsx';
import AccountModal from './AccountModal.jsx';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const AccountingPage = () => {
    const { t } = useTranslation();
    const [view, setView] = useState('tree'); // tree, journal, reports
    const [searchTerm, setSearchTerm] = useState('');
    const [showJournalModal, setShowJournalModal] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);

    const { data: accountTree = [], isLoading: isLoadingTree, refetch: refetchTree } = useQuery({
        queryKey: ['accounts-tree'],
        queryFn: async () => (await axios.get(`${API_URL}/accounts`, { headers: H() })).data
    });

    const { data: journal = [], isLoading: isLoadingJournal, refetch: refetchJournal } = useQuery({
        queryKey: ['journal-entries'],
        queryFn: async () => (await axios.get(`${API_URL}/journal`, { headers: H() })).data
    });

    const rootAccounts = useMemo(() => accountTree.filter(acc => !acc.parentId), [accountTree]);

    const calculatedStats = useMemo(() => {
        const assets = accountTree.filter(a => a.code.startsWith('1')).reduce((sum, a) => sum + (a.balance || 0), 0);
        const revenue = accountTree.filter(a => a.code.startsWith('4')).reduce((sum, a) => sum + (a.balance || 0), 0);
        const expenses = accountTree.filter(a => a.code.startsWith('5')).reduce((sum, a) => sum + (a.balance || 0), 0);
        const netProfit = revenue - expenses;

        return [
            { label: 'إجمالي الأصول', value: assets.toLocaleString() + ' ر.س', icon: <Landmark size={24} />, color: '#6366f1' },
            { label: 'الإيرادات التشغيلية', value: revenue.toLocaleString() + ' ر.س', icon: <TrendingUp size={24} />, color: '#10b981' },
            { label: 'المصروفات', value: expenses.toLocaleString() + ' ر.س', icon: <ArrowDownLeft size={24} />, color: '#ef4444' },
            { label: 'صافي الربح', value: netProfit.toLocaleString() + ' ر.س', icon: <Calculator size={24} />, color: '#f59e0b' },
        ];
    }, [accountTree]);


    const AccountNode = ({ node, depth = 0 }) => {
        const [isOpen, setIsOpen] = useState(false);
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div style={{ marginRight: depth * 25 }}>
                <motion.div 
                    whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ 
                        display: 'flex', alignItems: 'center', padding: '12px 15px', borderRadius: '14px', cursor: 'pointer', gap: '12px',
                        borderBottom: '1px solid rgba(255,255,255,0.02)'
                    }}
                >
                    <div style={{ width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>
                        {hasChildren ? (isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />) : <div style={{ width: '4px', height: '4px', background: '#3f3f46', borderRadius: '50%' }} />}
                    </div>
                    <div style={{ color: node.type === 'HEADING' ? '#6366f1' : '#fff', fontWeight: node.type === 'HEADING' ? '900' : '700', flex: 1, fontSize: '1rem' }}>
                        {node.code} - {node.name}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: node.balance < 0 ? '#ef4444' : '#10b981' }}>
                        {node.balance.toLocaleString()} ر.س
                    </div>
                </motion.div>
                <AnimatePresence>
                    {isOpen && hasChildren && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                            {node.children.map(child => <AccountNode key={child.id} node={child} depth={depth + 1} />)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const JournalRow = ({ entry, idx }) => {
        const totalAmount = entry.entries?.filter(e => e.debit > 0).reduce((sum, e) => sum + e.debit, 0) || 0;
        return (
            <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '20px', color: '#52525b', fontWeight: '800' }}>#{entry.id}</td>
                <td style={{ padding: '20px' }}>
                    <div style={{ fontWeight: '900', color: '#fff' }}>{entry.description}</div>
                    <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '4px' }}>{new Date(entry.date).toLocaleDateString('ar-SA')}</div>
                </td>
                <td style={{ padding: '20px' }}>
                    {entry.entries?.map((ln, i) => (
                        <div key={i} style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '2px' }}>{ln.account?.name}</div>
                    ))}
                </td>
                <td style={{ padding: '20px', textAlign: 'left' }}>
                    <div style={{ fontWeight: '900', color: '#6366f1', fontSize: '1.1rem' }}>{totalAmount.toLocaleString()} ر.س</div>
                </td>
            </motion.tr>
        );
    };

    const FinancialReports = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {[
                { title: 'ميزان المراجعة', desc: 'تفصيل أرصدة كافة الحسابات المدينة والدائنة.', icon: <ClipboardList size={28} />, path: '/accounting/reports/trial-balance' },
                { title: 'قائمة الدخل', desc: 'تحليل الأرباح والخسائر خلال فترة زمنية محددة.', icon: <TrendingUp size={28} />, path: '/accounting/reports/income-statement' },
                { title: 'الميزانية العمومية', desc: 'بيان الأصول والالتزامات وحقوق الملكية.', icon: <HardDrive size={28} />, path: '/accounting/reports/balance-sheet' },
                { title: 'دفتر الأستاذ العام', desc: 'كشف تفصيلي لحركات حساب معين.', icon: <BookOpen size={28} />, path: '/accounting/reports/general-ledger' }
            ].map((report, i) => (
                <motion.div key={i} whileHover={{ y: -5, background: 'rgba(255,255,255,0.02)' }} className="glass-card" style={{ padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                    <div style={{ background: 'rgba(99,102,241,0.1)', padding: '15px', borderRadius: '20px', color: '#818cf8', width: 'fit-content', marginBottom: '20px' }}>
                        {report.icon}
                    </div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.2rem', fontWeight: '900' }}>{report.title}</h4>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.6' }}>{report.desc}</p>
                    <motion.button {...buttonClick} style={{ marginTop: '25px', width: '100%', padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', fontWeight: '800' }}>عرض التقرير الآن</motion.button>
                </motion.div>
            ))}
        </div>
    );


    return (
        <div className="fade-in" style={{ direction: 'rtl' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '45px' }}>
                <div>
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '2.8rem', fontWeight: '900', color: '#fff' }} className="gradient-text">المركز المالي والمحاسبي</h2>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '1.1rem', fontWeight: '600' }}>إدارة الدفاتر المحاسبية، مراقبة السيولة، والتقارير الختامية الموثقة.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <motion.button {...buttonClick} onClick={() => setShowJournalModal(true)} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '14px 30px', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(99,102,241,0.2)' }}>
                        <Plus size={20} /> تسجيل قيد محاسبي
                    </motion.button>
                </div>
            </div>

            { calculatedStats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '45px' }}>
                  {calculatedStats.map((s, i) => (
                      <motion.div key={i} whileHover={{ y: -5 }} className="glass-card card-hover" style={{ padding: '25px 30px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <div style={{ background: `${s.color}15`, padding: '12px', borderRadius: '15px', color: s.color }}>{s.icon}</div>
                          <div>
                              <div style={{ fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '800' }}>{s.label}</div>
                              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>{s.value}</div>
                          </div>
                      </motion.div>
                  ))}
              </div>
            )}


            {/* Navigation Tabs */}
            <div className="glass-card" style={{ display: 'flex', gap: '12px', marginBottom: '40px', padding: '8px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                    { id: 'tree', label: 'شجرة الحسابات', icon: <FolderTree size={20} /> },
                    { id: 'journal', label: 'دفتر اليومية', icon: <BookOpen size={20} /> },
                    { id: 'reports', label: 'التقارير المالية', icon: <PieChart size={20} /> }

                ].map(t => (
                    <motion.button
                        key={t.id}
                        onClick={() => setView(t.id)}
                        style={{
                            padding: '14px 25px', display: 'flex', alignItems: 'center', gap: '10px',
                            background: view === t.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                            color: view === t.id ? '#fff' : '#71717a',
                            border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.3s'
                        }}
                    >
                        {t.icon} {t.label}
                    </motion.button>
                ))}
            </div>

            {/* View Content */}
            <AnimatePresence mode="wait">
                {view === 'tree' && (
                    <motion.div key="tree" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card" style={{ padding: '40px', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                            <h3 style={{ margin: 0, fontWeight: '900', color: '#fff', fontSize: '1.5rem' }}>الهيكل المحاسبي العام</h3>
                            <motion.button {...buttonClick} onClick={() => setShowAccountModal(true)} style={{ background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 20px', borderRadius: '12px', fontWeight: '800' }}>إضافة حساب فرعي</motion.button>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '20px' }}>
                            {isLoadingTree ? <div style={{ color: '#71717a', padding: '50px', textAlign: 'center' }}><RefreshCw className="animate-spin" /></div> : rootAccounts.map(node => <AccountNode key={node.id} node={node} />)}
                        </div>

                    </motion.div>
                )}

                {view === 'journal' && (
                    <motion.div key="journal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card" style={{ borderRadius: '35px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ padding: '35px', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <h3 style={{ margin: 0, fontWeight: '900', color: '#fff', fontSize: '1.5rem' }}>سجل العمليات المالية (Journal)</h3>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.02)', color: '#71717a', fontSize: '0.85rem', fontWeight: '900' }}>
                                    <tr>
                                        <th style={{ padding: '20px', textAlign: 'right' }}>الرقم</th>
                                        <th style={{ padding: '20px', textAlign: 'right' }}>البيان والتاريخ</th>
                                        <th style={{ padding: '20px', textAlign: 'right' }}>الحسابات المتأثرة</th>
                                        <th style={{ padding: '20px', textAlign: 'left' }}>المبلغ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingJournal ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '100px' }}><RefreshCw className="animate-spin" size={30} style={{ color: '#6366f1' }} /></td></tr>
                                    ) : (
                                        journal.map((entry, idx) => <JournalRow key={entry.id} entry={entry} idx={idx} />)
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {view === 'reports' && (
                    <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <FinancialReports />
                    </motion.div>
                )}


            </AnimatePresence>

            <AnimatePresence>
                {showJournalModal && <JournalModal accounts={accountTree} onClose={() => setShowJournalModal(false)} onSave={() => { refetchJournal(); refetchTree(); }} />}
                {showAccountModal && <AccountModal accounts={accountTree} onClose={() => setShowAccountModal(false)} onSave={() => { refetchTree(); }} />}
            </AnimatePresence>


            <style dangerouslySetInnerHTML={{ __html: `
                .glass-card.active-border { border-color: #6366f1 !important; background: rgba(99,102,241,0.05) !important; }
            `}} />
        </div>
    );
};

export default AccountingPage;
