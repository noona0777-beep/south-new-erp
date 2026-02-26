import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, LogIn, Loader2, AlertCircle, Eye, EyeOff, ChevronLeft, Phone, Hash, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config';

const Login = ({ onSuccess }) => {
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

    // Shared UI Utilities
    const inputContainerStyle = (name) => ({
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: focusedField === name ? 'scale(1.02)' : 'scale(1)',
        marginBottom: '20px'
    });

    const inputStyle = (name) => ({
        width: '100%',
        padding: '16px 48px 16px 16px',
        borderRadius: '12px',
        border: `2px solid ${focusedField === name ? '#0A1A2F' : '#F1F5F9'}`,
        fontFamily: 'Tajawal, sans-serif',
        fontSize: '1rem',
        outline: 'none',
        background: focusedField === name ? '#FFFFFF' : '#F8FAFC',
        color: '#1E293B',
        direction: 'rtl',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease',
        boxShadow: focusedField === name ? '0 8px 20px rgba(10, 26, 47, 0.08)' : 'none',
    });

    const buttonProps = {
        whileHover: { scale: 1.02, boxShadow: '0 12px 30px rgba(10, 26, 47, 0.25)' },
        whileTap: { scale: 0.98 },
        style: {
            width: '100%',
            padding: '16px',
            background: loading ? '#94A3B8' : 'linear-gradient(135deg, #0A1A2F 0%, #1c3a5f 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1.1rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'background 0.3s ease'
        }
    };

    const renderLoginForm = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem', color: '#475569' }}>البريد الإلكتروني</label>
                <div style={inputContainerStyle('email')}>
                    <Mail size={20} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'email' ? '#0A1A2F' : '#94A3B8' }} />
                    <input type="email" name="email" value={credentials.email} onChange={handleChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')} required placeholder="admin@south.com" style={inputStyle('email')} />
                </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem', color: '#475569' }}>كلمة المرور</label>
                <div style={inputContainerStyle('password')}>
                    <Lock size={20} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'password' ? '#0A1A2F' : '#94A3B8' }} />
                    <input type={showPass ? 'text' : 'password'} name="password" value={credentials.password} onChange={handleChange} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')} required placeholder="••••••••" style={inputStyle('password')} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                <button type="button" onClick={() => setMode('forgot-password')} style={{ background: 'none', border: 'none', color: '#0A1A2F', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 700 }}>نسيت كلمة المرور؟</button>
                <button type="button" onClick={() => setMode('forgot-username')} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.85rem', cursor: 'pointer' }}>نسيت اسم المستخدم؟</button>
            </div>

            <motion.button type="submit" onClick={handleLogin} {...buttonProps} disabled={loading}>
                {loading ? <Loader2 size={24} className="spin" /> : <><LogIn size={22} /> دخول للنظام</>}
            </motion.button>
        </motion.div>
    );

    const renderForgotPassword = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(10, 26, 47, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <ShieldCheck size={32} color="#0A1A2F" />
                </div>
                <h2 style={{ fontSize: '1.6rem', color: '#0A1A2F', fontWeight: 800 }}>استعادة الحساب</h2>
                <p style={{ color: '#64748B', fontSize: '0.95rem' }}>أدخل البيانات المسجلة لنرسل لك رمز الأمان</p>
            </div>

            <div style={inputContainerStyle('contact')}>
                <Mail size={20} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'contact' ? '#0A1A2F' : '#94A3B8' }} />
                <input name="contact" value={credentials.contact} onChange={handleChange} onFocus={() => setFocusedField('contact')} onBlur={() => setFocusedField('')} required placeholder="البريد الإلكتروني أو الجوال" style={inputStyle('contact')} />
            </div>

            <motion.button type="submit" onClick={handleForgotPassword} {...buttonProps} disabled={loading} style={{ ...buttonProps.style, marginTop: '10px' }}>
                {loading ? <Loader2 size={24} className="spin" /> : 'إرسال الرمز'}
            </motion.button>

            <button type="button" onClick={() => setMode('login')} style={backButtonStyle}><ChevronLeft size={18} /> العودة للرئيسية</button>
        </motion.div>
    );

    const renderVerifyOtp = () => (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.6rem', color: '#0A1A2F', fontWeight: 800 }}>رمز التحقق</h2>
                <p style={{ color: '#64748B', fontSize: '0.95rem' }}>تم إرسال الرمز إلى بريدك الإلكتروني</p>
            </div>

            <div style={inputContainerStyle('otp')}>
                <Hash size={20} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'otp' ? '#0A1A2F' : '#94A3B8' }} />
                <input name="otp" value={credentials.otp} onChange={handleChange} onFocus={() => setFocusedField('otp')} onBlur={() => setFocusedField('')} required placeholder="0 0 0 0 0 0" style={{ ...inputStyle('otp'), textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem', fontWeight: 800 }} />
            </div>

            <motion.button type="submit" onClick={handleVerifyOtp} {...buttonProps} disabled={loading}>
                {loading ? <Loader2 size={24} className="spin" /> : 'تحقق الآن'}
            </motion.button>
            <button type="button" onClick={() => setMode('forgot-password')} style={backButtonStyle}>لم يصلك الرمز؟ إعادة إرسال</button>
        </motion.div>
    );

    const renderResetPassword = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.6rem', color: '#0A1A2F', fontWeight: 800 }}>كلمة مرور جديدة</h2>
            </div>
            <div style={inputContainerStyle('newPassword')}>
                <Lock size={20} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'newPassword' ? '#0A1A2F' : '#94A3B8' }} />
                <input type="password" name="newPassword" value={credentials.newPassword} onChange={handleChange} onFocus={() => setFocusedField('newPassword')} onBlur={() => setFocusedField('')} required placeholder="كلمة المرور الجديدة" style={inputStyle('newPassword')} />
            </div>
            <motion.button type="submit" onClick={handleResetPassword} {...buttonProps} disabled={loading}>
                {loading ? <Loader2 size={24} className="spin" /> : 'تحديث كلمة المرور'}
            </motion.button>
        </motion.div>
    );

    const renderForgotUsername = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.6rem', color: '#0A1A2F', fontWeight: 800 }}>استرجاع المستخدم</h2>
                <p style={{ color: '#64748B', fontSize: '0.95rem' }}>أدخل رقم الجوال المربوط بحسابك</p>
            </div>
            <div style={inputContainerStyle('phone')}>
                <Phone size={20} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'phone' ? '#0A1A2F' : '#94A3B8' }} />
                <input name="phone" value={credentials.phone} onChange={handleChange} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField('')} required placeholder="05XXXXXXXX" style={inputStyle('phone')} />
            </div>
            <motion.button type="submit" onClick={handleForgotUsername} {...buttonProps} disabled={loading}>
                {loading ? <Loader2 size={24} className="spin" /> : 'طلب التذكير'}
            </motion.button>
            <button type="button" onClick={() => setMode('login')} style={backButtonStyle}><ChevronLeft size={18} /> عودة</button>
        </motion.div>
    );

    const backButtonStyle = {
        width: '100%',
        marginTop: '20px',
        background: 'none',
        border: 'none',
        color: '#64748B',
        fontSize: '0.9rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontWeight: 600
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Tajawal, sans-serif', direction: 'rtl', background: '#F8FAFC' }}>
            <div style={{ width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px', background: '#FFFFFF', position: 'relative', zIndex: 10, boxShadow: '-10px 0 30px rgba(0,0,0,0.05)' }}>
                <div style={{ maxWidth: '350px', margin: '0 auto', width: '100%' }}>

                    {/* Brand Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ textAlign: 'center', marginBottom: '48px' }}
                    >
                        <img
                            src="/logo.png"
                            alt="South New"
                            style={{ width: '220px', height: 'auto', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.05))' }}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/220x100?text=SOUTH+NEW'}
                        />
                    </motion.div>

                    {/* Messages */}
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FFF1F2', color: '#BE123C', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid #FECACA' }}>
                                    <AlertCircle size={20} /> {error}
                                </div>
                            </motion.div>
                        )}
                        {successMsg && !error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F0FDF4', color: '#15803D', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid #BBF7D0' }}>
                                    <ShieldCheck size={20} /> {successMsg}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Forms */}
                    <div style={{ minHeight: '340px' }}>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <AnimatePresence mode="wait">
                                {mode === 'login' && renderLoginForm()}
                                {mode === 'forgot-password' && renderForgotPassword()}
                                {mode === 'verify-otp' && renderVerifyOtp()}
                                {mode === 'reset-password' && renderResetPassword()}
                                {mode === 'forgot-username' && renderForgotUsername()}
                            </AnimatePresence>
                        </form>
                    </div>

                    <div style={{ marginTop: '64px', textAlign: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '32px' }}>
                        <p style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600 }}>نظام إدارة الموارد المؤسسية v2.0</p>
                        <p style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '6px' }}>© 2026 مؤسسة الجنوب الوثيق للمقاولات العامة</p>
                    </div>
                </div>
            </div>

            {/* Visual Panel */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }} className="login-visual-panel">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    style={{ position: 'absolute', inset: 0, backgroundImage: 'url("/login-bg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10, 26, 47, 0.9) 0%, rgba(10, 26, 47, 0.2) 100%)' }} />

                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 10% 0 0' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{ color: 'white', maxWidth: '500px' }}
                    >
                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1px', backdropFilter: 'blur(5px)' }}>نظام الجنوب المتكامل</span>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginTop: '24px', lineHeight: 1.1 }}>الجيل القادم من <br /><span style={{ color: '#cbd5e1' }}>إدارة المشاريع</span></h1>
                        <p style={{ fontSize: '1.2rem', opacity: 0.8, marginTop: '24px', lineHeight: 1.8 }}>قوة في الأداء، دقة في التنفيذ، ومرونة في الإدارة. نظام South New ERP يوفر لك كافة الأدوات الهندسية والمالية في منصة واحدة متكاملة.</p>

                        <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>+500</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>مشروع منجز</div>
                            </div>
                            <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>100%</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>دقة مالية</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
                input::placeholder { color: #94A3B8; opacity: 0.7; }
                @media (max-width: 1100px) {
                    .login-visual-panel { display: none !important; }
                    .login-form-panel { width: 100% !important; max-width: 100% !important; }
                }
            `}</style>
        </div>
    );
};

export default Login;
