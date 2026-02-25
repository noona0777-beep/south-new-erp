import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, LogIn, Loader2, AlertCircle, Eye, EyeOff, ChevronLeft, Phone, Hash } from 'lucide-react';
import API_URL from '../config';

const Login = ({ onSuccess }) => {
    // Modes: 'login', 'forgot-password', 'verify-otp', 'reset-password', 'forgot-username'
    const [mode, setMode] = useState('login');
    const [credentials, setCredentials] = useState({ email: '', password: '', contact: '', otp: '', newPassword: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [focusedField, setFocusedField] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (e) =>
        setCredentials({ ...credentials, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/login`, { email: credentials.email, password: credentials.password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            onSuccess(res.data.user);
        } catch (err) {
            setError(err.response?.data?.error || 'فشل الاتصال بالسيرفر');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/forgot-password`, { contact: credentials.contact });
            setSuccessMsg(res.data.message);
            setMode('verify-otp');
        } catch (err) {
            setError(err.response?.data?.error || 'فشل إرسال الرمز');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post(`${API_URL}/verify-otp`, { contact: credentials.contact, otp: credentials.otp });
            setMode('reset-password');
        } catch (err) {
            setError(err.response?.data?.error || 'الرمز غير صحيح');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/reset-password`, {
                contact: credentials.contact,
                otp: credentials.otp,
                newPassword: credentials.newPassword
            });
            setSuccessMsg(res.data.message);
            setMode('login');
            setCredentials({ ...credentials, password: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'فشل تغيير كلمة المرور');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotUsername = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/forgot-username`, { phone: credentials.phone });
            setSuccessMsg(res.data.message);
            setMode('login');
        } catch (err) {
            setError(err.response?.data?.error || 'فشل طلب استرجاع البيانات');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (name) => ({
        width: '100%',
        padding: '14px 44px 14px 16px',
        borderRadius: '10px',
        border: `1.5px solid ${focusedField === name ? '#0A1A2F' : '#E2E8F0'}`,
        fontFamily: 'Tajawal, Cairo, sans-serif',
        fontSize: '0.95rem',
        outline: 'none',
        background: 'white',
        color: '#1e293b',
        direction: 'rtl',
        boxSizing: 'border-box',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: focusedField === name ? '0 0 0 4px rgba(10,26,47,0.05)' : 'none',
    });

    const renderLoginForm = () => (
        <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>البريد الإلكتروني</label>
                <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'email' ? '#0A1A2F' : '#94a3b8' }} />
                    <input type="email" name="email" value={credentials.email} onChange={handleChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')} required placeholder="admin@south.com" style={inputStyle('email')} />
                </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>كلمة المرور</label>
                <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'password' ? '#0A1A2F' : '#94a3b8' }} />
                    <input type={showPass ? 'text' : 'password'} name="password" value={credentials.password} onChange={handleChange} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')} required placeholder="••••••••" style={inputStyle('password')} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <button type="button" onClick={() => setMode('forgot-password')} style={{ background: 'none', border: 'none', color: '#0A1A2F', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>نسيت كلمة المرور؟</button>
                <button type="button" onClick={() => setMode('forgot-username')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}>نسيت اسم المستخدم؟</button>
            </div>
            <button type="submit" disabled={loading} style={buttonStyle}>{loading ? <><Loader2 size={20} className="spin" /> جاري الدخول...</> : <><LogIn size={20} /> دخول للنظام</>}</button>
        </form>
    );

    const renderForgotPassword = () => (
        <form onSubmit={handleForgotPassword}>
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#0A1A2F' }}>استعادة كلمة المرور</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>أدخل بريدك الإلكتروني أو رقم جوالك المسجل</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'contact' ? '#0A1A2F' : '#94a3b8' }} />
                    <input name="contact" value={credentials.contact} onChange={handleChange} onFocus={() => setFocusedField('contact')} onBlur={() => setFocusedField('')} required placeholder="البريد أو الجوال" style={inputStyle('contact')} />
                </div>
            </div>
            <button type="submit" disabled={loading} style={buttonStyle}>{loading ? <Loader2 size={20} className="spin" /> : 'إرسال رمز التحقق'}</button>
            <button type="button" onClick={() => setMode('login')} style={backButtonStyle}><ChevronLeft size={18} /> العودة لتسجيل الدخول</button>
        </form>
    );

    const renderVerifyOtp = () => (
        <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#0A1A2F' }}>التحقق من الرمز</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>تم إرسال رمز التحقق إلى بياناتك المسجلة</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <Hash size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'otp' ? '#0A1A2F' : '#94a3b8' }} />
                    <input name="otp" value={credentials.otp} onChange={handleChange} onFocus={() => setFocusedField('otp')} onBlur={() => setFocusedField('')} required placeholder="أدخل الرمز المكون من 6 أرقام" style={{ ...inputStyle('otp'), textAlign: 'center', letterSpacing: '8px' }} />
                </div>
            </div>
            <button type="submit" disabled={loading} style={buttonStyle}>{loading ? <Loader2 size={20} className="spin" /> : 'تحقق من الرمز'}</button>
            <button type="button" onClick={() => setMode('forgot-password')} style={backButtonStyle}><ChevronLeft size={18} /> إعادة إرسال الرمز</button>
        </form>
    );

    const renderResetPassword = () => (
        <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#0A1A2F' }}>كلمة مرور جديدة</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>يرجى اختيار كلمة مرور قوية</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'newPassword' ? '#0A1A2F' : '#94a3b8' }} />
                    <input type="password" name="newPassword" value={credentials.newPassword} onChange={handleChange} onFocus={() => setFocusedField('newPassword')} onBlur={() => setFocusedField('')} required placeholder="كلمة المرور الجديدة" style={inputStyle('newPassword')} />
                </div>
            </div>
            <button type="submit" disabled={loading} style={buttonStyle}>{loading ? <Loader2 size={20} className="spin" /> : 'حفظ كلمة المرور الجديدة'}</button>
        </form>
    );

    const renderForgotUsername = () => (
        <form onSubmit={handleForgotUsername}>
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#0A1A2F' }}>استرجاع اسم المستخدم</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>أدخل رقم جوالك المسجل لنرسل لك بريدك الإلكتروني</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'phone' ? '#0A1A2F' : '#94a3b8' }} />
                    <input name="phone" value={credentials.phone} onChange={handleChange} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField('')} required placeholder="05xxxxxxxx" style={inputStyle('phone')} />
                </div>
            </div>
            <button type="submit" disabled={loading} style={buttonStyle}>{loading ? <Loader2 size={20} className="spin" /> : 'طلب استرجاع البيانات'}</button>
            <button type="button" onClick={() => setMode('login')} style={backButtonStyle}><ChevronLeft size={18} /> العودة لتسجيل الدخول</button>
        </form>
    );

    const buttonStyle = {
        width: '100%',
        padding: '16px',
        background: loading ? '#C8CCD4' : '#0A1A2F',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '10px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '1rem',
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.3s ease',
        boxShadow: loading ? 'none' : '0 10px 30px rgba(10,26,47,0.2)'
    };

    const backButtonStyle = {
        width: '100%',
        marginTop: '15px',
        background: 'none',
        border: 'none',
        color: '#64748b',
        fontSize: '0.9rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px'
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Tajawal, Cairo, sans-serif', direction: 'rtl', background: '#FFFFFF' }}>
            <div style={{ flex: 1, position: 'relative' }} className="login-visual-panel">
                <style>{`
                    @media (max-width: 1024px) {
                        .login-visual-panel { display: none !important; }
                        .login-form-panel { width: 100% !important; flex: 1 !important; }
                    }
                `}</style>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("/login-bg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10, 26, 47, 0.4)', backdropFilter: 'grayscale(20%)' }} />
                <div style={{ position: 'absolute', bottom: '10%', right: '10%', color: 'white', zIndex: 2, maxWidth: '400px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '15px', color: '#FFFFFF' }}>South New ERP</h2>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6, color: '#C8CCD4' }}>نظام إدارة هندسي متكامل يجمع بين القوة والمرونة، مصمم خصيصاً لقطاع المقاولات والتطوير العقاري.</p>
                </div>
            </div>

            <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 60px', background: '#FFFFFF', boxShadow: '-10px 0 50px rgba(0,0,0,0.02)', zIndex: 3 }} className="login-form-panel">
                <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <img src="/logo.png" alt="South New Logo" style={{ width: '140px', height: 'auto', marginBottom: '20px' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/140x60?text=NEW+SOUTH'; }} />
                    </div>

                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fef2f2', color: '#dc2626', padding: '14px 16px', borderRadius: '10px', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}
                    {successMsg && !error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f0fdf4', color: '#16a34a', padding: '14px 16px', borderRadius: '10px', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid #bbf7d0' }}>
                            <LogIn size={18} /> {successMsg}
                        </div>
                    )}

                    <div className="mode-container" style={{ transition: 'all 0.5s ease' }}>
                        {mode === 'login' && renderLoginForm()}
                        {mode === 'forgot-password' && renderForgotPassword()}
                        {mode === 'verify-otp' && renderVerifyOtp()}
                        {mode === 'reset-password' && renderResetPassword()}
                        {mode === 'forgot-username' && renderForgotUsername()}
                    </div>

                    <div style={{ marginTop: '50px', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                        نظام إدارة الموارد © 2026<br /> مؤسسة الجنوب الوثيق للمقاولات العامة
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
                input::placeholder { color: #cbd5e1; opacity: 0.8; }
                .mode-container { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Login;
