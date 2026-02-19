import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

const Login = ({ onSuccess }) => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/login`, credentials);

            // Save Token & User Info
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            onSuccess(res.data.user);
        } catch (err) {
            setError(err.response?.data?.error || 'فشل الاتصال بالسيرفر');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', fontFamily: 'Arial'
        }}>
            <div style={{
                width: '100%', maxWidth: '400px', padding: '40px', background: 'white',
                borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            }}>
                <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '10px' }}>مؤسسة الجنوب الجديد</h2>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px' }}>تسجيل الدخول للنظام</p>

                {error && (
                    <div style={{
                        background: '#fee2e2', color: '#dc2626', padding: '12px',
                        borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem' }}>البريد الإلكتروني</label>
                        <input
                            type="email" name="email"
                            value={credentials.email} onChange={handleChange}
                            required
                            style={{
                                width: '100%', padding: '12px', borderRadius: '6px',
                                border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none'
                            }}
                            placeholder="admin@south.com"
                        />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.9rem' }}>كلمة المرور</label>
                        <input
                            type="password" name="password"
                            value={credentials.password} onChange={handleChange}
                            required
                            style={{
                                width: '100%', padding: '12px', borderRadius: '6px',
                                border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none'
                            }}
                            placeholder="••••••"
                        />
                    </div>

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '14px', background: '#2563eb', color: 'white',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold',
                        transition: 'background 0.2s'
                    }}>
                        {loading ? 'جاري التحقق...' : 'دخول'}
                    </button>

                    <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                        البيانات الافتراضية: admin@south.com / 123456
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
