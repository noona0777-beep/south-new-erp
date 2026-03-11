import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, LogIn, LogOut, Clock, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import API_URL from '@/config';
import { exportToExcel } from '../../utils/excelExport';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const GeoAttendanceTab = ({ employees }) => {
    const queryClient = useQueryClient();
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedEmp, setSelectedEmp] = useState('');
    const [geoError, setGeoError] = useState('');
    const [loadingGeo, setLoadingGeo] = useState(false);

    // Filter active employees for manual tracking/selection
    const activeEmployees = employees.filter(e => e.status === 'ACTIVE');
    const myEmployeeId = selectedEmp || (activeEmployees.length > 0 ? activeEmployees[0].id : 1);

    const { data: records = [], isLoading } = useQuery({
        queryKey: ['attendance', filterDate],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/attendance?date=${filterDate}`, { headers: H() });
            return res.data;
        }
    });

    const getUserLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('الخرائط غير مدعومة في متصفحك');
            } else {
                navigator.geolocation.getCurrentPosition(
                    position => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
                    err => reject('الرجاء السماح بصلاحيات الموقع (GPS) لتسجيل الحضور')
                );
            }
        });
    };

    const clockInMutation = useMutation({
        mutationFn: async ({ lat, lng }) => axios.post(`${API_URL}/attendance/clock-in`, { employeeId: myEmployeeId, lat, lng, notes: 'تسجيل دخول جغرافي' }, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            alert('✅ تم تسجيل الدخول الميداني بنجاح!');
        },
        onError: (e) => setGeoError(e.response?.data?.error || 'فشل تسجيل الدخول')
    });

    const clockOutMutation = useMutation({
        mutationFn: async ({ lat, lng }) => axios.post(`${API_URL}/attendance/clock-out`, { employeeId: myEmployeeId, lat, lng, notes: 'تسجيل خروج ميداني' }, { headers: H() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
            alert('✅ تم تسجيل الانصراف الميداني بنجاح!');
        },
        onError: (e) => setGeoError(e.response?.data?.error || 'فشل تسجيل الانصراف')
    });

    const handleClockIn = async () => {
        setLoadingGeo(true); setGeoError('');
        try {
            const loc = await getUserLocation();
            clockInMutation.mutate(loc);
        } catch (e) { setGeoError(e); }
        setLoadingGeo(false);
    };

    const handleClockOut = async () => {
        setLoadingGeo(true); setGeoError('');
        try {
            const loc = await getUserLocation();
            clockOutMutation.mutate(loc);
        } catch (e) { setGeoError(e); }
        setLoadingGeo(false);
    };

    const formatTime = (iso) => {
        if (!iso) return '--:--';
        return new Date(iso).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    };

    const exportData = () => {
        const data = records.map(r => ({
            'الموظف': r.employee?.name || 'غير محدد',
            'التاريخ': new Date(r.date).toLocaleDateString('ar-SA'),
            'الدخول': formatTime(r.checkIn),
            'إحداثيات الدخول': r.checkInLat ? `${r.checkInLat.toFixed(5)}, ${r.checkInLng.toFixed(5)}` : 'بدون',
            'الخروج': formatTime(r.checkOut),
            'إحداثيات الخروج': r.checkOutLat ? `${r.checkOutLat.toFixed(5)}, ${r.checkOutLng.toFixed(5)}` : 'بدون',
            'الحالة': r.status
        }));
        exportToExcel(data, `سجل_الحضور_${filterDate}`, 'الحضور الجغرافي');
    };

    return (
        <div>
            {/* Control Panel (Geo-Fencing Punch In/Out) */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                        <MapPin size={20} color="#3b82f6" /> نقطة تسجيل الحضور الجغرافي
                    </h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>يسحب الموقع فوراً من GPS الجوال أو المتصفح لإثبات الحضور الميداني.</p>
                    
                    <div style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <select value={myEmployeeId} onChange={(e) => setSelectedEmp(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', outline: 'none' }}>
                            {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.jobTitle})</option>)}
                        </select>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={handleClockIn} disabled={loadingGeo} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: '700', fontFamily: 'Cairo', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}>
                        {loadingGeo ? <Clock className="animate-spin" size={18} /> : <LogIn size={18} />} تسجيل دخول
                    </button>
                    <button onClick={handleClockOut} disabled={loadingGeo} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'white', color: '#ef4444', fontWeight: '700', border: '1px solid #fecaca', fontFamily: 'Cairo', cursor: 'pointer' }}>
                        {loadingGeo ? <Clock className="animate-spin" size={18} /> : <LogOut size={18} />} تسجيل انصراف
                    </button>
                </div>
            </div>

            {geoError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '10px', color: '#ef4444', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                    <AlertTriangle size={16} /> {geoError}
                </div>
            )}

            {/* Attendance Logs */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Calendar size={18} color="#64748b" />
                        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'Cairo', outline: 'none' }} />
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>{records.length} موظفاً سجلوا حضورهم</span>
                    </div>
                    <button onClick={exportData} disabled={records.length === 0} style={{ padding: '8px 16px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 'bold' }}>
                        📥 تصدير الإحداثيات
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '14px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>اسم الموظف</th>
                                <th style={{ padding: '14px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>وقت الدخول</th>
                                <th style={{ padding: '14px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>موقع الدخول (GPS)</th>
                                <th style={{ padding: '14px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>وقت الانصراف</th>
                                <th style={{ padding: '14px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>جاري سحب الإحداثيات...</td></tr> : null}
                            {records.length === 0 && !isLoading ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>لا توجد سجلات حضور جغرافية في هذا اليوم.</td></tr> : null}
                            {records.map(record => (
                                <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '14px', fontWeight: '700', color: '#0f172a' }}>{record.employee?.name}</td>
                                    <td style={{ padding: '14px', color: '#10b981', fontWeight: '800' }}>{formatTime(record.checkIn)}</td>
                                    <td style={{ padding: '14px', fontSize: '0.8rem' }}>
                                        {record.checkInLat ? (
                                            <a href={`https://maps.google.com/?q=${record.checkInLat},${record.checkInLng}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', textDecoration: 'none', background: '#eff6ff', padding: '4px 8px', borderRadius: '6px', width: 'fit-content' }}>
                                                <MapPin size={12} /> عرض الخريطة
                                            </a>
                                        ) : <span style={{ color: '#94a3b8' }}>بدون موقع</span>}
                                    </td>
                                    <td style={{ padding: '14px', color: record.checkOut ? '#ef4444' : '#94a3b8', fontWeight: record.checkOut ? '800' : '400' }}>{formatTime(record.checkOut)}</td>
                                    <td style={{ padding: '14px' }}>
                                        <span style={{ padding: '4px 10px', background: record.checkOut ? '#ecfdf5' : '#fff7ed', color: record.checkOut ? '#059669' : '#c2410c', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                                            {record.checkOut ? 'مكتمل الدوام' : 'في الموقع'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GeoAttendanceTab;
