import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, LogIn, Loader2, AlertCircle, Eye, EyeOff, ChevronRight, Phone, Hash, ShieldCheck, ArrowLeft, Building2, UserCircle, RefreshCw, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '@/config';

const Login = ({ onSuccess }) => {
    const [mode, setMode] = useState('login');
    const [userType, setUserType] = useState('EMPLOYEE');
    const [credentials, setCredentials] = useState({ email: '', password: '', contact: '', otp: '', newPassword: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [focusedField, setFocusedField] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    // Rotating welcome texts
    const welcomeTexts = [
        "نظام الجنوب.. حيث يلتقي البناء بالذكاء الاصطناعي",
        "إدارة المشاريع بدقة متناهية وسرعة فائقة",
        "تكامل محاسبي وهندسي في منصة سحابية واحدة",
        "بوابتك الذكية لإدارة الموارد المؤسسية بثقة"
    ];
    const [textIndex, setTextIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % welcomeTexts.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e) =>
        setCredentials({ ...credentials, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const endpoint = userType === 'CLIENT' ? `${API_URL}/client-portal/login` : `${API_URL}/login`;
            const payload = userType === 'CLIENT'
                ? { identifier: credentials.email, password: credentials.password }
                : { email: credentials.email, password: credentials.password };

            const res = await axios.post(endpoint, payload);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            onSuccess(res.data.user);
        } catch (err) {
            console.error('Login Failed:', err);
            setError(err.response?.data?.error || err.message || 'فشل الاتصال بالسيرفر');
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

    // --- Premium UI Shared Components ---
    
    // Floating Label Input Component
    const FloatingInput = ({ type, name, value, label, icon: Icon, required, placeholder, isPassword }) => {
        const isFocused = focusedField === name;
        const hasValue = value.length > 0;
        const isFloat = isFocused || hasValue;

        return (
            <div className={`premium-input-container ${isFocused ? 'focused' : ''}`}>
                <div className="input-icon">
                    <Icon size={20} />
                </div>
                <input
                    type={isPassword && !showPass ? 'password' : type === 'password' ? 'text' : type}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(name)}
                    onBlur={() => setFocusedField('')}
                    required={required}
                    className="premium-input text-white"
                    placeholder={isFocused ? placeholder : ' '}
                    autoComplete="off"
                    dir={(type === 'email' || type === 'password' || name === 'otp') ? 'ltr' : 'rtl'}
                    style={{ textAlign: (type === 'email' || type === 'password' || name === 'otp') ? 'left' : 'right' }}
                />
                <label className={`premium-label ${isFloat ? 'float' : ''}`}>
                    {label}
                </label>
                {isPassword && (
                    <button type="button" onClick={() => setShowPass(!showPass)} className="pass-toggle">
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
        );
    };

    const PremiumButton = ({ onClick, disabled, children, icon: Icon }) => (
        <motion.button 
            type="button" 
            onClick={onClick} 
            disabled={disabled}
            className="premium-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="btn-glow"></div>
            <span className="btn-content">
                {disabled ? <Loader2 size={24} className="spin" /> : 
                    <>
                        {children}
                        {Icon && <Icon size={22} />}
                    </>
                }
            </span>
        </motion.button>
    );

    // Form Pages
    const renderLoginForm = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="form-wrapper">
            {/* User Type Switcher (Glass Pill) */}
            <div className="premium-switcher">
                <button type="button" onClick={() => setUserType('EMPLOYEE')} className={`switch-btn ${userType === 'EMPLOYEE' ? 'active' : ''}`}>
                    <UserCircle size={18} /> الموظفين
                </button>
                <button type="button" onClick={() => setUserType('CLIENT')} className={`switch-btn ${userType === 'CLIENT' ? 'active' : ''}`}>
                    <Building2 size={18} /> العملاء
                </button>
            </div>

            <form onSubmit={handleLogin}>
                <FloatingInput 
                    type="text" name="email" value={credentials.email} 
                    label={userType === 'CLIENT' ? 'البريد الإلكتروني أو الجوال' : 'البريد الإلكتروني'} 
                    icon={Mail} required placeholder="admin@south.com" 
                />

                <FloatingInput 
                    type="password" name="password" value={credentials.password} 
                    label="كلمة المرور" icon={Lock} required isPassword placeholder="••••••••" 
                />

                <div className="form-actions">
                    <button type="button" onClick={() => setMode('forgot-password')} className="text-btn primary-glow">نسيت كلمة المرور؟</button>
                    <button type="button" onClick={() => setMode('forgot-username')} className="text-btn">نسيت اسم المستخدم؟</button>
                </div>

                <PremiumButton onClick={handleLogin} disabled={loading} icon={ArrowLeft}>
                    تسجيل الدخول
                </PremiumButton>
            </form>
        </motion.div>
    );

    const renderForgotPassword = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="form-wrapper">
            <div className="form-header">
                <div className="icon-circle"><ShieldCheck size={32} /></div>
                <h2>استعادة الحساب</h2>
                <p>أدخل بياناتك المسجلة لنرسل لك رمز الأمان السري.</p>
            </div>

            <FloatingInput type="text" name="contact" value={credentials.contact} label="البريد الإلكتروني أو الجوال" icon={Mail} required />

            <PremiumButton onClick={handleForgotPassword} disabled={loading} icon={ArrowLeft}>إرسال الرمز</PremiumButton>

            <button type="button" onClick={() => setMode('login')} className="back-btn"><ChevronRight size={18} /> العودة للرئيسية</button>
        </motion.div>
    );

    const renderVerifyOtp = () => (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="form-wrapper">
            <div className="form-header">
                <h2>رمز التحقق</h2>
                <p>قمنا بإرسال رمز من 6 أرقام إلى بريدك الإلكتروني.</p>
            </div>

            <FloatingInput type="text" name="otp" value={credentials.otp} label="الرمز السري (OTP)" icon={Hash} required placeholder="0 0 0 0 0 0" />

            <PremiumButton onClick={handleVerifyOtp} disabled={loading} icon={ShieldCheck}>التحقق والمتابعة</PremiumButton>
            
            <button type="button" onClick={() => setMode('forgot-password')} className="back-btn mt-4">إعادة إرسال الرمز؟</button>
        </motion.div>
    );

    const renderResetPassword = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="form-wrapper">
            <div className="form-header">
                <h2>كلمة مرور جديدة</h2>
                <p>قم باختيار كلمة مرور قوية لتأمين حسابك.</p>
            </div>
            
            <FloatingInput type="password" name="newPassword" value={credentials.newPassword} label="كلمة المرور الجديدة" icon={Lock} isPassword required />
            
            <PremiumButton onClick={handleResetPassword} disabled={loading} icon={ShieldCheck}>حفظ التغييرات</PremiumButton>
        </motion.div>
    );

    const renderForgotUsername = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="form-wrapper">
            <div className="form-header">
                <h2>استرجاع الحساب</h2>
                <p>أدخل رقم الجوال المربوط بحسابك لاسترجاع البيانات.</p>
            </div>
            
            <FloatingInput type="text" name="phone" value={credentials.phone} label="رقم الجوال" icon={Phone} required placeholder="05XXXXXXXX" />
            
            <PremiumButton onClick={handleForgotUsername} disabled={loading} icon={ArrowLeft}>استرجاع البيانات</PremiumButton>
            
            <button type="button" onClick={() => setMode('login')} className="back-btn"><ChevronRight size={18} /> العودة</button>
        </motion.div>
    );

    return (
        <div className="premium-login-container">
            {/* Left/Background Panel: Dynamic Gradient Mesh */}
            <div className="mesh-background">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
                <div className="mesh-overlay"></div>
                
                {/* Brand Showcase Layer */}
                <div className="brand-showcase hide-on-mobile">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                        <div className="glass-badge">ERP 2.0 System</div>
                        <h1 className="hero-title">SOUTH <span>NEW</span></h1>
                        
                        <div className="animated-text-container">
                            <AnimatePresence mode="wait">
                                <motion.p 
                                    key={textIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5 }}
                                    className="hero-subtitle"
                                >
                                    {welcomeTexts[textIndex]}
                                </motion.p>
                            </AnimatePresence>
                        </div>

                        <div className="stats-row">
                            <div className="stat-box">
                                <h3>+500</h3>
                                <span>مشروع منجز</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-box">
                                <h3>100%</h3>
                                <span>أتمتة مالية</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel: Glassmorphism Login Card */}
            <div className="glass-panel-container">
                <motion.div 
                    initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
                    transition={{ duration: 0.8 }}
                    className="glass-card-auth"
                >
                    <div className="auth-header">
                        <img 
                            src="/logo.png" 
                            alt="South New Logo" 
                            className="auth-logo"
                            onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = 'https://via.placeholder.com/180x60/0f172a/ffffff?text=South+New';
                            }}
                        />
                        <p className="auth-welcome">مرحباً بك في بوابة الوصول الآمنة</p>
                    </div>

                    <div className="notifications-area">
                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="premium-alert error">
                                    <AlertCircle size={20} /> <span>{error}</span>
                                </motion.div>
                            )}
                            {successMsg && !error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="premium-alert success">
                                    <ShieldCheck size={20} /> <span>{successMsg}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="forms-container">
                        <AnimatePresence mode="wait">
                            {mode === 'login' && renderLoginForm()}
                            {mode === 'forgot-password' && renderForgotPassword()}
                            {mode === 'verify-otp' && renderVerifyOtp()}
                            {mode === 'reset-password' && renderResetPassword()}
                            {mode === 'forgot-username' && renderForgotUsername()}
                        </AnimatePresence>
                    </div>

                    <div className="auth-footer">
                        <p>© 2026 مؤسسة الجنوب للتقنية والمقاولات. جميع الحقوق محفوظة.</p>
                        <div className="secure-badge"><Lock size={12} /> اتصال مشفر (SSL)</div>
                    </div>
                </motion.div>
            </div>

            {/* Injected Premium Styles for Login Component Only */}
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&family=Cairo:wght@400;600;700;800&display=swap');

                .premium-login-container {
                    display: flex;
                    min-height: 100vh;
                    width: 100%;
                    font-family: 'Cairo', 'Outfit', sans-serif;
                    direction: rtl;
                    background: #09090b; /* Deep Dark Base */
                    position: relative;
                    overflow: hidden;
                }

                /* --- Mesh Gradient Background --- */
                .mesh-background {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                    overflow: hidden;
                    background: #020617;
                }

                .orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(100px);
                    opacity: 0.6;
                    animation: float-orb 20s infinite alternate ease-in-out;
                }

                .orb-1 { width: 600px; height: 600px; background: #3b82f6; top: -10%; left: -10%; animation-delay: 0s; }
                .orb-2 { width: 800px; height: 800px; background: #8b5cf6; bottom: -20%; right: -10%; animation-delay: -5s; }
                .orb-3 { width: 500px; height: 500px; background: #0ea5e9; top: 40%; left: 30%; animation-delay: -10s; }

                .mesh-overlay {
                    position: absolute;
                    inset: 0;
                    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)" opacity="0.05"/></svg>');
                    mix-blend-mode: overlay;
                }

                @keyframes float-orb {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(100px, 50px) scale(1.2); }
                }

                /* --- Brand Showcase (Left side on desktop) --- */
                .brand-showcase {
                    position: absolute;
                    right: 10%;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 10;
                    color: white;
                    max-width: 500px;
                }

                .glass-badge {
                    display: inline-block;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    padding: 8px 16px;
                    border-radius: 30px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    font-family: 'Outfit', sans-serif;
                    margin-bottom: 20px;
                }

                .hero-title {
                    font-size: 5rem;
                    font-weight: 900;
                    font-family: 'Outfit', sans-serif;
                    line-height: 1;
                    margin: 0 0 20px 0;
                    letter-spacing: -2px;
                    background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .hero-title span {
                    color: transparent;
                    -webkit-text-stroke: 2px rgba(255,255,255,0.8);
                }

                .animated-text-container {
                    height: 80px;
                    display: flex;
                    align-items: center;
                }

                .hero-subtitle {
                    font-size: 1.3rem;
                    line-height: 1.8;
                    color: #94a3b8;
                    margin: 0;
                }

                .stats-row {
                    display: flex;
                    align-items: center;
                    gap: 30px;
                    margin-top: 50px;
                }

                .stat-box h3 {
                    font-size: 2.5rem;
                    font-family: 'Outfit', sans-serif;
                    margin: 0;
                    font-weight: 800;
                    background: linear-gradient(to right, #60a5fa, #c084fc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .stat-box span {
                    font-size: 0.9rem;
                    color: #cbd5e1;
                    font-weight: 600;
                }

                .stat-divider {
                    width: 1px;
                    height: 50px;
                    background: rgba(255,255,255,0.2);
                }

                /* --- Right Panel: Glassmorphism Card --- */
                .glass-panel-container {
                    flex: 1;
                    display: flex;
                    justify-content: flex-end;
                    padding: 40px 8%;
                    z-index: 10;
                    align-items: center;
                }

                .glass-card-auth {
                    width: 100%;
                    max-width: 480px;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 30px;
                    padding: 40px;
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1);
                    position: relative;
                }

                .auth-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .auth-logo {
                    height: 55px;
                    margin-bottom: 15px;
                    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
                }

                .auth-welcome {
                    color: #94a3b8;
                    font-size: 0.95rem;
                    font-weight: 600;
                    margin: 0;
                }

                /* --- Form Elements --- */
                .form-wrapper { width: 100%; }

                .form-header { text-align: center; margin-bottom: 30px; }
                .form-header .icon-circle { width: 64px; height: 64px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: #60a5fa; }
                .form-header h2 { color: white; font-size: 1.5rem; margin: 0 0 10px 0; font-weight: 800; }
                .form-header p { color: #94a3b8; font-size: 0.9rem; margin: 0; }

                .premium-switcher {
                    display: flex;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 6px;
                    margin-bottom: 30px;
                }

                .switch-btn {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #64748b;
                    padding: 12px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-family: 'Cairo', sans-serif;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 0.9rem;
                }

                .switch-btn.active {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.05);
                }

                /* Floating Input Styles */
                .premium-input-container {
                    position: relative;
                    margin-bottom: 24px;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    transition: all 0.3s ease;
                }
                
                .premium-input-container.focused {
                    border-color: rgba(96, 165, 250, 0.5);
                    background: rgba(0, 0, 0, 0.4);
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }

                .input-icon {
                    position: absolute;
                    right: 18px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                    transition: color 0.3s;
                    z-index: 2;
                }
                
                .premium-input-container.focused .input-icon { color: #60a5fa; }

                .premium-input {
                    width: 100%;
                    padding: 24px 48px 10px 18px;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-family: 'Outfit', 'Cairo', sans-serif;
                    font-size: 1.05rem;
                    color: white;
                    border-radius: 16px;
                    box-sizing: border-box;
                }
                
                .premium-input::placeholder { color: #475569; }

                .premium-label {
                    position: absolute;
                    right: 48px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    font-size: 1rem;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                    font-weight: 500;
                }

                .premium-label.float,
                .premium-input:focus ~ .premium-label,
                .premium-input:not(:placeholder-shown) ~ .premium-label,
                .premium-input:-webkit-autofill ~ .premium-label {
                    top: 14px !important;
                    font-size: 0.75rem !important;
                    color: #60a5fa !important;
                    font-weight: 700 !important;
                }

                .premium-input:-webkit-autofill,
                .premium-input:-webkit-autofill:hover, 
                .premium-input:-webkit-autofill:focus, 
                .premium-input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 50px rgba(15, 23, 42, 0.8) inset !important;
                    -webkit-text-fill-color: white !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
                
                .premium-input::-ms-reveal,
                .premium-input::-ms-clear {
                    display: none;
                }

                .pass-toggle {
                    position: absolute;
                    left: 18px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    padding: 0;
                    display: flex;
                    transition: color 0.3s;
                }
                .pass-toggle:hover { color: white; }

                .form-actions {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    padding: 0 4px;
                }

                .text-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    font-family: 'Cairo', sans-serif;
                    font-size: 0.85rem;
                    cursor: pointer;
                    font-weight: 600;
                    transition: color 0.3s;
                }
                .text-btn:hover { color: white; }
                .primary-glow:hover { color: #60a5fa; text-shadow: 0 0 10px rgba(96,165,250,0.5); }

                .premium-btn {
                    width: 100%;
                    padding: 18px;
                    background: linear-gradient(135deg, #2563eb, #7c3aed);
                    border: none;
                    border-radius: 16px;
                    color: white;
                    font-family: 'Cairo', sans-serif;
                    font-size: 1.1rem;
                    font-weight: 800;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
                }
                
                .premium-btn:disabled { background: #334155; box-shadow: none; cursor: not-allowed; }

                .btn-glow {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
                    transform: skewX(-20deg) translateX(-150%);
                    animation: btn-shine 3s infinite;
                }
                @keyframes btn-shine { 100% { transform: skewX(-20deg) translateX(150%); } }

                .btn-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .back-btn {
                    width: 100%;
                    margin-top: 20px;
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #cbd5e1;
                    padding: 14px;
                    border-radius: 12px;
                    font-family: 'Cairo', sans-serif;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.3s;
                }
                .back-btn:hover { background: rgba(255,255,255,0.05); color: white; }

                /* Alerts */
                .premium-alert {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    backdrop-filter: blur(10px);
                }
                .premium-alert.error { background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); color: #fca5a5; }
                .premium-alert.success { background: rgba(22, 163, 74, 0.1); border: 1px solid rgba(22, 163, 74, 0.3); color: #86efac; }


                .auth-footer {
                    margin-top: 40px;
                    text-align: center;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }
                
                .auth-footer p { color: #64748b; font-size: 0.75rem; margin: 0 0 10px 0; }
                .secure-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #10b981; font-weight: 700; background: rgba(16, 185, 129, 0.1); padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2); }

                .spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin { 100% { transform: rotate(360deg); } }

                /* Mobile Adjustments */
                @media (max-width: 900px) {
                    .brand-showcase { display: none; }
                    .glass-panel-container { justify-content: center; padding: 20px; }
                    .glass-card-auth { padding: 30px 20px; backdrop-filter: blur(40px); background: rgba(15, 23, 42, 0.6); }
                }
            `}} />
        </div>
    );
};

export default Login;
