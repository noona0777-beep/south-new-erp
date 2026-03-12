import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, ShieldCheck, AlertOctagon } from 'lucide-react';

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div style={{
            position: 'fixed',
            top: '32px',
            right: '32px',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            pointerEvents: 'none',
            maxWidth: '420px',
            width: '100%'
        }}>
            <AnimatePresence>
                {toasts.map((toast) => {
                    const isError = toast.type === 'error';
                    const isSuccess = toast.type === 'success';
                    const color = isSuccess ? '#10b981' : isError ? '#ef4444' : '#6366f1';
                    const bg = isSuccess ? 'rgba(16, 185, 129, 0.1)' : isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)';

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
                            style={{
                                background: 'rgba(15, 23, 42, 0.8)',
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                padding: '16px 20px',
                                borderRadius: '20px',
                                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                                border: `1px solid ${color}30`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                pointerEvents: 'auto',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', background: color, width: '100%', opacity: 0.5 }} />
                            
                            <div style={{
                                background: bg,
                                padding: '10px',
                                borderRadius: '12px',
                                color: color,
                                display: 'flex'
                            }}>
                                {isSuccess && <ShieldCheck size={22} />}
                                {isError && <AlertOctagon size={22} />}
                                {!isSuccess && !isError && <Info size={22} />}
                            </div>

                            <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: '700', color: '#fff', fontFamily: 'Cairo', textAlign: 'right' }}>
                                {toast.message}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.05)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeToast(toast.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '6px', borderRadius: '8px', display: 'flex' }}
                            >
                                <X size={18} />
                            </motion.button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
