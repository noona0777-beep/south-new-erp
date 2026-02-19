import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, AlertTriangle, TrendingUp, Package, Move, Edit, Trash2, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import API_URL from '../../config';

const InventoryPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showAdjust, setShowAdjust] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [adjustData, setAdjustData] = useState({ quantity: 1, type: 'ADD' });

    const [productData, setProductData] = useState({
        name: '',
        price: '',
        cost: '',
        quantity: 0
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/products`);
            setProducts(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch inventory');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await axios.put(`${API_URL}/products/${selectedProduct.id}`, productData);
            } else {
                await axios.post(`${API_URL}/products`, productData);
            }
            fetchProducts();
            closeForm();
        } catch (err) {
            alert('فشل في حفظ المنتج');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟ سيتم حذف سجلات المخزون المرتبطة به أيضاً.')) {
            try {
                await axios.delete(`${API_URL}/products/${id}`);
                fetchProducts();
            } catch (err) {
                alert('فشل الحذف');
            }
        }
    };

    const handleAdjust = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/products/${selectedProduct.id}/adjust`, adjustData);
            fetchProducts();
            setShowAdjust(false);
        } catch (err) {
            alert('فشل تعديل المخزون');
        }
    };

    const openForm = (product = null) => {
        if (product) {
            setSelectedProduct(product);
            setProductData({
                name: product.name,
                price: product.price,
                cost: product.cost,
                quantity: product.stocks?.[0]?.quantity || 0
            });
            setIsEdit(true);
        } else {
            setProductData({ name: '', price: '', cost: '', quantity: 0 });
            setIsEdit(false);
        }
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setIsEdit(false);
        setSelectedProduct(null);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStockValue = products.reduce((acc, p) => acc + (parseFloat(p.cost) * (p.stocks?.[0]?.quantity || 0)), 0);
    const lowStockCount = products.filter(p => (p.stocks?.[0]?.quantity || 0) < 10).length;

    return (
        <div className="fade-in" style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>بطاقة المخزون</h2>
                    <p style={{ margin: 0, color: '#64748b' }}>إدارة المنتجات ومراقبة مستويات المستودع</p>
                </div>
                <button
                    onClick={() => openForm()}
                    style={{
                        background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px',
                        borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgb(37 99 235 / 0.3)'
                    }}
                >
                    <Plus size={20} /> إضافة منتج جديد
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px', color: '#3b82f6' }}><Package size={24} /></div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>إجمالي الأصناف</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{products.length}</div>
                    </div>
                </div>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px', color: '#10b981' }}><TrendingUp size={24} /></div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>قيمة المخزون</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalStockValue.toLocaleString()} ر.س</div>
                    </div>
                </div>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '12px', color: '#ef4444' }}><AlertTriangle size={24} /></div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>أصناف منخفضة</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{lowStockCount}</div>
                    </div>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Search color="#94a3b8" size={20} />
                    <input
                        type="text"
                        placeholder="بحث عن منتج..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', border: 'none', outline: 'none', fontSize: '1rem', color: '#334155', fontFamily: 'Cairo' }}
                    />
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b' }}>المنتج</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', color: '#64748b' }}>الكمية</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', color: '#64748b' }}>التكلفة</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', color: '#64748b' }}>سعر البيع</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', color: '#64748b' }}>الحالة</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', color: '#64748b' }}>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>جاري التحميل...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>لا توجد منتجات</td></tr>
                        ) : (
                            filteredProducts.map(product => {
                                const qty = product.stocks?.[0]?.quantity || 0;
                                return (
                                    <tr key={product.id} style={{ borderBottom: '1px solid #f8fafc' }} className="card-hover">
                                        <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>{product.name}</td>
                                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                            <span style={{
                                                background: qty < 10 ? '#fef2f2' : '#f1f5f9',
                                                color: qty < 10 ? '#ef4444' : '#0f172a',
                                                padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold'
                                            }}>{qty}</span>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>{product.cost.toLocaleString()} ر.س</td>
                                        <td style={{ padding: '16px 24px', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>{product.price.toLocaleString()} ر.س</td>
                                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                            <span style={{ color: qty < 10 ? '#ef4444' : '#10b981', fontSize: '0.85rem' }}>
                                                {qty < 10 ? 'مخزون منخفض' : 'متوفر'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                <button onClick={() => { setSelectedProduct(product); setShowAdjust(true); }} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }} title="تعديل الكمية"><Move size={18} /></button>
                                                <button onClick={() => openForm(product)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #dbeafe', background: '#eff6ff', color: '#2563eb', cursor: 'pointer' }} title="تعديل"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(product.id)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }} title="حذف"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Product Form Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '450px', position: 'relative' }}>
                        <button onClick={closeForm} style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        <h3 style={{ margin: '0 0 25px 0' }}>{isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>اسم المنتج</label>
                                <input required type="text" value={productData.name} onChange={e => setProductData({ ...productData, name: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>التكلفة</label>
                                    <input required type="number" step="0.01" value={productData.cost} onChange={e => setProductData({ ...productData, cost: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>سعر البيع</label>
                                    <input required type="number" step="0.01" value={productData.price} onChange={e => setProductData({ ...productData, price: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                                </div>
                            </div>
                            {!isEdit && (
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>الكمية الأولية</label>
                                    <input required type="number" value={productData.quantity} onChange={e => setProductData({ ...productData, quantity: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                                <button type="button" onClick={closeForm} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>إلغاء</button>
                                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>حفظ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Stock Adjustment Modal */}
            {showAdjust && selectedProduct && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '400px' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>تعديل الكمية</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '25px' }}>المنتج: {selectedProduct.name}</p>
                        <form onSubmit={handleAdjust}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <button type="button" onClick={() => setAdjustData({ ...adjustData, type: 'ADD' })} style={{ padding: '15px', borderRadius: '12px', border: '2px solid', borderColor: adjustData.type === 'ADD' ? '#10b981' : '#f1f5f9', background: adjustData.type === 'ADD' ? '#f0fdf4' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <ArrowUpCircle color="#10b981" />
                                    <span style={{ fontWeight: 'bold' }}>إضافة</span>
                                </button>
                                <button type="button" onClick={() => setAdjustData({ ...adjustData, type: 'SUBTRACT' })} style={{ padding: '15px', borderRadius: '12px', border: '2px solid', borderColor: adjustData.type === 'SUBTRACT' ? '#ef4444' : '#f1f5f9', background: adjustData.type === 'SUBTRACT' ? '#fef2f2' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <ArrowDownCircle color="#ef4444" />
                                    <span style={{ fontWeight: 'bold' }}>سحب</span>
                                </button>
                            </div>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>الكمية</label>
                                <input required type="number" value={adjustData.quantity} onChange={e => setAdjustData({ ...adjustData, quantity: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setShowAdjust(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>إلغاء</button>
                                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>تحديث</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
