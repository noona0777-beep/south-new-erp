import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Package, Plus, Edit, Trash2, Search, AlertTriangle, 
    Download, Filter, RefreshCw, Check, X, FileText, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '@/config';
import * as XLSX from 'xlsx';
import { buttonClick, fadeInUp } from '../Common/MotionComponents';
import ProductModal from './ProductModal';


const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const InventoryPage = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);


    // Fetch Products
    const { data: products = [], isLoading: productsLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => (await axios.get(`${API_URL}/products`, { headers: H() })).data
    });

    // Fetch Categories
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => (await axios.get(`${API_URL}/categories`, { headers: H() })).data
    });

    // Stock Update Mutation
    const updateStockMutation = useMutation({
        mutationFn: async ({ id, quantity }) => await axios.put(`${API_URL}/products/${id}/stock`, { quantity }, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setEditingId(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await axios.delete(`${API_URL}/products/${id}`, { headers: H() }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
    });


    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(products);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
        XLSX.writeFile(workbook, "Inventory_Report.xlsx");
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || 
                          (activeTab === 'low' && (p.stocks?.[0]?.quantity ?? 0) > 0 && (p.stocks?.[0]?.quantity ?? 0) <= 10) ||
                          (activeTab === 'out' && (p.stocks?.[0]?.quantity ?? 0) <= 0);
        return matchesSearch && matchesTab;
    });

    const stats = {
        total: products.length,
        lowStock: products.filter(p => { const q = p.stocks?.[0]?.quantity ?? 0; return q > 0 && q <= 10; }).length,
        outOfStock: products.filter(p => (p.stocks?.[0]?.quantity ?? 0) <= 0).length
    };

    return (
        <div className="fade-in" style={{ direction: 'rtl' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', color: '#fff' }} className="gradient-text">إدارة المخزون</h2>
                    <p style={{ margin: '6px 0 0 0', color: '#a1a1aa', fontSize: '1.1rem', fontWeight: '500' }}>مراقبة المستودعات، تتبع الكميات، وإدارة الأصناف</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={exportToExcel} className="glass-card" style={{ padding: '12px 25px', borderRadius: '16px', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', cursor: 'pointer' }}>
                        <Download size={20} /> تصدير جرد
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} style={{ padding: '12px 30px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)' }} onClick={() => { setSelectedProduct(null); setShowModal(true); }}>
                        <Plus size={22} /> إضافة صنف جديد
                    </motion.button>

                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '35px' }}>
                {[
                    { label: 'إجمالي الأصناف', value: stats.total, icon: Package, color: '#6366f1', type: 'all' },
                    { label: 'أصناف منخفضة', value: stats.lowStock, icon: AlertTriangle, color: '#f59e0b', type: 'low' },
                    { label: 'نفذت من المخزن', value: stats.outOfStock, icon: X, color: '#ef4444', type: 'out' }
                ].map((stat, i) => (
                    <motion.div 
                        key={i} 
                        whileHover={{ y: -5 }} 
                        onClick={() => setActiveTab(stat.type)}
                        className={`glass-card ${activeTab === stat.type ? 'active-border' : ''}`} 
                        style={{ padding: '25px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', border: activeTab === stat.type ? `1px solid ${stat.color}` : '1px solid rgba(255,255,255,0.05)' }}
                    >
                        <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.95rem', color: '#a1a1aa', fontWeight: '600' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>{stat.value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="glass-card" style={{ padding: '20px 30px', borderRadius: '24px', marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={20} style={{ position: 'absolute', right: '15px', top: '12px', color: '#52525b' }} />
                    <input type="text" placeholder="بحث باسم المنتج، SKU، أو القسم..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="premium-input" style={{ width: '100%', paddingRight: '45px', border: 'none', background: 'transparent' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="premium-input" style={{ border: 'none', padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa' }}><Filter size={18} /> تصفية</button>
                    <button onClick={() => queryClient.invalidateQueries(['products'])} className="premium-input" style={{ border: 'none', padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa' }}><RefreshCw size={18} className={productsLoading ? 'animate-spin' : ''} /> تحديث</button>
                </div>
            </div>

            {/* Products Table */}
            <div className="glass-card" style={{ borderRadius: '28px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                {productsLoading ? (
                    <div style={{ padding: '100px', textAlign: 'center' }}><RefreshCw className="animate-spin" size={40} style={{ color: '#6366f1', marginBottom: '15px' }} /></div>
                ) : (
                    <div className="table-responsive">
                        <table className="table-glass" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'right', padding: '25px' }}>المنتج</th>
                                    <th style={{ textAlign: 'right' }}>القسم</th>
                                    <th style={{ textAlign: 'center' }}>الكمية الحالية</th>
                                    <th style={{ textAlign: 'center' }}>سعر البيع</th>
                                    <th style={{ textAlign: 'center' }}>الحالة</th>
                                    <th style={{ textAlign: 'center' }}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product, idx) => {
                                    const qty = product.stocks?.[0]?.quantity ?? 0;
                                    return (
                                        <motion.tr key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                                            <td style={{ padding: '20px 25px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Package size={20} color="#6366f1" />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '800', color: '#fff' }}>{product.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{product.sku || product.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span style={{ color: '#a1a1aa', fontWeight: '600' }}>{product.category?.name || 'عام'}</span></td>
                                            <td style={{ textAlign: 'center' }}>
                                                {editingId === product.id ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <input autoFocus type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="premium-input" style={{ width: '80px', padding: '5px', textAlign: 'center' }} />
                                                        <button onClick={() => updateStockMutation.mutate({ id: product.id, quantity: editValue })} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer' }}><Check size={18} /></button>
                                                        <button onClick={() => setEditingId(null)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                                                    </div>
                                                ) : (
                                                    <div onClick={() => { setEditingId(product.id); setEditValue(qty); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: '900', color: qty <= 10 ? '#ef4444' : '#fff', fontSize: '1.2rem' }}>{qty}</span>
                                                        {qty <= 10 && <AlertTriangle size={14} color="#ef4444" />}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}><div style={{ fontWeight: '900', color: '#10b981', fontSize: '1.1rem' }}>{product.price.toLocaleString()} <span style={{ fontSize: '0.7rem' }}>ر.س</span></div></td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={`status-pill ${qty > 10 ? 'status-paid' : qty > 0 ? 'status-pending' : 'status-cancelled'}`}>
                                                    {qty > 10 ? 'متوفر' : qty > 0 ? 'منخفض' : 'ناقد'}
                                                </span>
                                            </td>
                                             <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                    <motion.button onClick={() => { setSelectedProduct(product); setShowModal(true); }} whileHover={{ scale: 1.1 }} style={{ background: 'rgba(255,255,255,0.05)', color: '#a1a1aa', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><Edit size={18} /></motion.button>
                                                    <motion.button onClick={() => { if(confirm('هل أنت متأكد من حذف هذا الصنف؟')) deleteMutation.mutate(product.id); }} whileHover={{ scale: 1.1 }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><Trash2 size={18} /></motion.button>
                                                </div>
                                            </td>

                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <ProductModal 
                        categories={categories} 
                        product={selectedProduct} 
                        onClose={() => setShowModal(false)} 
                        onSave={() => queryClient.invalidateQueries({ queryKey: ['products'] })} 
                    />
                )}
            </AnimatePresence>

        </div>
    );
};

export default InventoryPage;
