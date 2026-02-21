import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, LogIn, Loader2, AlertCircle, Building2, Eye, EyeOff } from 'lucide-react';
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
        padding: '13px 44px 13px 16px',
        borderRadius: 12,
        border: `1.5px solid ${focusedField === name ? '#2563eb' : '#e2e8f0'}`,
        fontFamily: 'Cairo, sans-serif',
        fontSize: '0.95rem',
        outline: 'none',
        background: focusedField === name ? '#f8faff' : 'white',
        color: '#1e293b',
        direction: 'rtl',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
        boxShadow: focusedField === name ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
    });

    return (
        <div className="aurora-bg" style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '100vh', fontFamily: 'Cairo, sans-serif', direction: 'rtl',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Glowing orbs */}
            <div style={{ position: 'absolute', top: '15%', right: '20%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '15%', left: '20%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

            {/* Floating decoration icons */}
            <div className="floating" style={{ position: 'absolute', top: '10%', left: '8%', opacity: 0.06, color: 'white' }}>
                <Building2 size={90} />
            </div>
            <div className="floating" style={{ position: 'absolute', bottom: '12%', right: '8%', opacity: 0.05, color: 'white', animationDelay: '2s' }}>
                <Building2 size={70} />
            </div>

            {/* Login Card */}
            <div className="fade-in" style={{
                width: '100%', maxWidth: 420,
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(20px)',
                borderRadius: 24,
                boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)',
                overflow: 'hidden',
                position: 'relative',
                margin: '0 16px',
            }}>

                {/* Top accent bar */}
                <div style={{ height: 4, background: 'linear-gradient(90deg, #2563eb, #7c3aed, #2563eb)', backgroundSize: '200%', animation: 'aurora 4s ease infinite' }} />

                {/* Header */}
                <div style={{ padding: '36px 40px 28px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    {/* Company Logo */}
                    <div className="shine-effect" style={{ display: 'inline-block', marginBottom: 16, position: 'relative' }}>
                        <img
                            src="/logo.png"
                            alt="شعار مؤسسة الجنوب الجديد"
                            onError={e => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                            style={{ width: 110, height: 'auto', objectFit: 'contain', display: 'block' }}
                        />
                        {/* Fallback icon if logo not found */}
                        <div style={{
                            display: 'none', width: 70, height: 70, borderRadius: 18,
                            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                            alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
                        }}>
                            <Building2 size={32} color="white" />
                        </div>
                    </div>

                    <h1 style={{
                        margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 800,
                        color: '#0f172a', letterSpacing: '-0.3px', lineHeight: 1.3,
                    }}>
                        مؤسسة الجنوب الجديد
                    </h1>
                    <div style={{
                        display: 'inline-block', marginTop: 12, padding: '4px 14px',
                        background: 'linear-gradient(135deg, #eff6ff, #f0f4ff)',
                        borderRadius: 20, fontSize: '0.78rem', color: '#2563eb', fontWeight: 600,
                        border: '1px solid #dbeafe',
                    }}>
                        نظام إدارة الموارد المؤسسية
                    </div>
                </div>

                {/* Form */}
                <div style={{ padding: '28px 40px 32px' }}>
                    <h2 style={{ margin: '0 0 24px', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', textAlign: 'center' }}>
                        تسجيل الدخول
                    </h2>

                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: '#fef2f2', color: '#dc2626',
                            padding: '12px 16px', borderRadius: 12, marginBottom: 20,
                            fontSize: '0.85rem', fontWeight: 600, border: '1px solid #fecaca',
                        }}>
                            <AlertCircle size={16} style={{ flexShrink: 0 }} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: 18, position: 'relative' }}>
                            <label style={{
                                display: 'block', marginBottom: 7,
                                fontWeight: 600, fontSize: '0.83rem', color: '#374151',
                            }}>البريد الإلكتروني</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} color={focusedField === 'email' ? '#2563eb' : '#94a3b8'}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'color 0.2s' }} />
                                <input
                                    type="email" name="email"
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

                        {/* Password */}
                        <div style={{ marginBottom: 26, position: 'relative' }}>
                            <label style={{
                                display: 'block', marginBottom: 7,
                                fontWeight: 600, fontSize: '0.83rem', color: '#374151',
                            }}>كلمة المرور</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} color={focusedField === 'password' ? '#2563eb' : '#94a3b8'}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'color 0.2s' }} />
                                <input
                                    type={showPass ? 'text' : 'password'} name="password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField('')}
                                    required
                                    placeholder="••••••"
                                    style={{ ...inputStyle('password'), paddingLeft: 44 }}
                                />
                                <button type="button" onClick={() => setShowPass(s => !s)}
                                    tabIndex={-1}
                                    style={{
                                        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        padding: 2, display: 'flex', transition: 'color 0.2s',
                                        color: showPass ? '#2563eb' : '#94a3b8',
                                    }}>
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '14px',
                                background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                color: 'white', border: 'none', borderRadius: 12,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontFamily: 'Cairo, sans-serif', fontSize: '1rem',
                                fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                                boxShadow: loading ? 'none' : '0 6px 20px rgba(37,99,235,0.4)',
                                transition: 'all 0.25s ease',
                                transform: 'translateY(0)',
                            }}
                            onMouseOver={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(37,99,235,0.5)'; } }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.4)'; }}
                        >
                            {loading
                                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> جاري التحقق...</>
                                : <><LogIn size={18} /> دخول إلى النظام</>
                            }
                        </button>
                    </form>

                    {/* Hint */}
                    <div style={{
                        marginTop: 22, padding: '12px 16px',
                        background: '#f8fafc', borderRadius: 10,
                        border: '1px solid #f1f5f9', textAlign: 'center',
                        fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.7,
                    }}>
                        <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 3 }}>البيانات الافتراضية</div>
                        <span style={{ background: '#eff6ff', color: '#2563eb', padding: '1px 8px', borderRadius: 6, marginLeft: 6, fontWeight: 600 }}>admin@south.com</span>
                        <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '1px 8px', borderRadius: 6, fontWeight: 600 }}>123456</span>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 40px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '0.72rem', color: '#cbd5e1' }}>
                    نظام إدارة موارد مؤسسة الجنوب الجديد © 2026
                </div>
            </div>
        </div>
    );
};

export default Login;
