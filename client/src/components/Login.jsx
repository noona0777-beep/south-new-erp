import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, LogIn, Loader2, AlertCircle, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import API_URL from '../config';

const Login = ({ onSuccess }) => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [focusedField, setFocusedField] = useState('');

    const handleChange = (e) =>
        setCredentials({ ...credentials, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/login`, credentials);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            onSuccess(res.data.user);
        } catch (err) {
            setError(err.response?.data?.error || 'فشل الاتصال بالسيرفر');
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

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            fontFamily: 'Tajawal, Cairo, sans-serif',
            direction: 'rtl',
            background: '#FFFFFF'
        }}>
            {/* Left Side: Professional Photography Overlay */}
            <div style={{
                flex: 1,
                position: 'relative',
                display: 'none', // Hidden on mobile
                '@media (minWidth: 1024px)': { display: 'block' }
            }} className="login-visual-panel">
                <style>{`
                    @media (max-width: 1024px) {
                        .login-visual-panel { display: none !important; }
                        .login-form-panel { width: 100% !important; flex: 1 !important; }
                    }
                `}</style>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'url("/login-bg.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }} />
                {/* Overlay 40% Navy Blue */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(10, 26, 47, 0.4)',
                    backdropFilter: 'grayscale(20%)'
                }} />
                {/* Floating Content on Left (Optional) */}
                <div style={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '10%',
                    color: 'white',
                    zIndex: 2,
                    maxWidth: '400px'
                }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '15px', color: '#FFFFFF' }}>South New ERP</h2>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6, color: '#C8CCD4' }}>
                        نظام إدارة هندسي متكامل يجمع بين القوة والمرونة، مصمم خصيصاً لقطاع المقاولات والتطوير العقاري.
                    </p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div style={{
                width: '100%',
                maxWidth: '600px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '40px 60px',
                background: '#FFFFFF',
                boxShadow: '-10px 0 50px rgba(0,0,0,0.02)',
                zIndex: 3
            }} className="login-form-panel">
                <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                    {/* Logo Section */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <img
                            src="/logo.png"
                            alt="South New Logo"
                            style={{ width: '140px', height: 'auto', marginBottom: '20px' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/140x60?text=NEW+SOUTH'; }}
                        />
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0A1A2F', margin: '0 0 10px' }}>تسجيل الدخول</h1>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>مرحباً بك مجدداً في نظام الجنوب الجديد</p>
                    </div>

                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            background: '#fef2f2', color: '#dc2626',
                            padding: '14px 16px', borderRadius: '10px', marginBottom: '24px',
                            fontSize: '0.9rem', border: '1px solid #fecaca'
                        }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>
                                البريد الإلكتروني
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail
                                    size={18}
                                    style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'email' ? '#0A1A2F' : '#94a3b8' }}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField('')}
                                    required
                                    placeholder="admin@south.com"
                                    style={inputStyle('email')}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>
                                كلمة المرور
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock
                                    size={18}
                                    style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'password' ? '#0A1A2F' : '#94a3b8' }}
                                />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField('')}
                                    required
                                    placeholder="••••••••"
                                    style={inputStyle('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                            <a href="#" style={{ color: '#0A1A2F', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
                                نسيت كلمة المرور؟
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
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
                            }}
                            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            {loading ? (
                                <><Loader2 size={20} className="spin" /> جاري الدخول...</>
                            ) : (
                                <><LogIn size={20} /> دخول للنظام</>
                            )}
                        </button>
                    </form>

                    {/* Footer / CopyRight */}
                    <div style={{ marginTop: '50px', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                        نظام إدارة الموارد © 2026<br />
                        مؤسسة الجنوب الوثيق للمقاولات العامة
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
                input::placeholder { color: #cbd5e1; opacity: 0.8; }
            `}</style>
        </div>
    );
};

export default Login;
