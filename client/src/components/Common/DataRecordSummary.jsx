import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Printer, ChevronRight, User, Briefcase, Users, MapPin, Phone, Building, Download } from 'lucide-react';
import API_URL from '../../config';

const DataRecordSummary = () => {
    const { type, id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [companyInfo, setCompanyInfo] = useState({ name: 'مؤسسة الجنوب الوثيق', vatNumber: '310123456700003' });
    const hideToolbar = new URLSearchParams(window.location.search).get('hideToolbar') === 'true';

    useEffect(() => {
        // Fetch Company Info
        axios.get(`${API_URL}/settings/companyInfo`)
            .then(res => setCompanyInfo(res.data))
            .catch(() => { });

        const fetchData = async () => {
            setLoading(true);
            try {
                let endpoint = '';
                if (type === 'CLIENT') endpoint = `/partners/${id}`;
                else if (type === 'PROJECT') endpoint = `/projects/${id}`;
                else if (type === 'EMPLOYEE') endpoint = `/employees/${id}`;

                const res = await axios.get(`${API_URL}${endpoint}`);
                setData(res.data);
            } catch (err) {
                console.error('Error loading summary data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [type, id]);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Cairo' }}>جاري التحميل...</div>;
    if (!data) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Cairo' }}>لا توجد بيانات متاحة لهذا السجل.</div>;

    const print = () => window.print();

    const handleDownloadPDF = () => {
        const element = document.getElementById('printable-area');
        const opt = {
            margin: 0,
            filename: `${data.name}_Summary.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        // @ts-ignore
        if (window.html2pdf) {
            // @ts-ignore
            window.html2pdf().from(element).set(opt).save();
        } else {
            alert('PDF library not loaded yet. Please try again in 2 seconds.');
        }
    };

    const InfoRow = ({ label, value, icon }) => (
        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', padding: '15px 0', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', color: '#64748b' }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{value || '-'}</div>
            </div>
        </div>
    );

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', padding: '40px', fontFamily: 'Cairo, sans-serif' }}>
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
                        min-height: auto !important;
                        height: auto !important;
                        max-height: 297mm !important;
                    }
                    @page { 
                        size: A4; 
                        margin: 10mm 0; 
                    }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>

            {/* Toolbar */}
            {!hideToolbar && (
                <div className="no-print" style={{ maxWidth: '210mm', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                    <Link to="/archive" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#64748b', gap: '5px' }}>
                        <ChevronRight size={18} /> العودة للأرشيف
                    </Link>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleDownloadPDF} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            <Download size={18} /> تحميل PDF
                        </button>
                        <button onClick={print} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            <Printer size={18} /> طباعة السجل
                        </button>
                    </div>
                </div>
            )}

            {/* A4 Page */}
            <div id="printable-area" style={{
                background: 'white', width: '100%', maxWidth: '210mm', minHeight: '260mm', margin: '0 auto', padding: '20mm',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a', boxSizing: 'border-box',
                direction: 'rtl', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden'
            }} className="print-page">

                {/* Professional Watermark */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '70%', opacity: 0.07, pointerEvents: 'none', zIndex: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <img src="/watermark.png" alt="watermark" style={{ width: '100%', height: 'auto' }} />
                </div>

                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                    {/* Header Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1e3a8a', fontWeight: '900' }}>{companyInfo.name}</h1>
                            <p style={{ margin: '5px 0', color: '#64748b', fontSize: '1rem', fontWeight: 'bold' }}>للتطوير و الاستثمار و التسويق العقاري</p>
                            <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#475569' }}>العنوان: أحد المسارحة ، جازان</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ background: '#1e3a8a', color: 'white', padding: '12px 30px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px' }}>
                                سجل بيانات نظام
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#1e3a8a', fontWeight: 'bold' }}>{new Date().toLocaleDateString('ar-SA')}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '5px', fontWeight: 'bold' }}>المرجع: <span dir="ltr">N S S-REC-{data.id.toString().padStart(5, '0')}</span></div>
                        </div>
                    </div>

                    {/* Thick Separator Line */}
                    <div style={{ borderBottom: '4px solid #1e3a8a', marginBottom: '35px' }}></div>

                    {/* Entity Info */}
                    <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '16px', marginBottom: '40px', border: '1px solid #eff6ff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                            <div style={{ background: '#1e3a8a', color: 'white', padding: '20px', borderRadius: '15px' }}>
                                {type === 'CLIENT' ? <Users size={40} /> : type === 'PROJECT' ? <Briefcase size={40} /> : <User size={40} />}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>{data.name}</h2>
                                <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>
                                    {type === 'CLIENT' ? 'عميل مسجل' : type === 'PROJECT' ? 'مشروع عقاري/مقاولات' : 'موظف مؤسسة'}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
                            {type === 'CLIENT' && (
                                <>
                                    <InfoRow icon={<Phone size={18} />} label="رقم الجوار" value={data.phone} />
                                    <InfoRow icon={<MapPin size={18} />} label="العنوان" value={data.address} />
                                    <InfoRow icon={<Building size={18} />} label="الرقم الضريبي" value={data.vatNumber} />
                                    <InfoRow icon={<Users size={18} />} label="نوع العميل" value={data.type === 'COMPANY' ? 'شركة' : 'فرد'} />
                                </>
                            )}
                            {type === 'PROJECT' && (
                                <>
                                    <InfoRow icon={<MapPin size={18} />} label="موقع المشروع" value={data.location} />
                                    <InfoRow icon={<Briefcase size={18} />} label="حالة المشروع" value={data.status} />
                                    <InfoRow icon={<Briefcase size={18} />} label="القيمة التعاقدية" value={`${data.contractValue?.toLocaleString()} ر.س`} />
                                    <InfoRow icon={<Briefcase size={18} />} label="تاريخ البدء" value={data.startDate ? new Date(data.startDate).toLocaleDateString('ar-SA') : '-'} />
                                </>
                            )}
                            {type === 'EMPLOYEE' && (
                                <>
                                    <InfoRow icon={<Briefcase size={18} />} label="المسمى الوظيفي" value={data.jobTitle} />
                                    <InfoRow icon={<Building size={18} />} label="القسم" value={data.department} />
                                    <InfoRow icon={<User size={18} />} label="الراتب الأساسي" value={`${data.salary?.toLocaleString()} ر.س`} />
                                    <InfoRow icon={<Briefcase size={18} />} label="حالة الموظف" value={data.status === 'ACTIVE' ? 'نشط' : 'إجازة / منقطع'} />
                                </>
                            )}
                        </div>
                    </div>

                    {type === 'PROJECT' && data.description && (
                        <div style={{ marginBottom: '40px' }}>
                            <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>وصف المشروع</h4>
                            <p style={{ lineHeight: '1.8', color: '#475569', textAlign: 'justify' }}>{data.description}</p>
                        </div>
                    )}

                </div>

                {/* Footer fixed to be at the bottom of the first page area if content is short */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginTop: '30px' }}>
                    <div>تم استخراج هذا السجل آلياً من نظام مؤسسة الجنوب الجديد</div>
                    <div>صفحة 1 من 1</div>
                </div>
            </div>
        </div>
    );
};

export default DataRecordSummary;
