const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_south_new_system_2024';

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access Denied: No Token Provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err.message);
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'SESSION_EXPIRED', message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى' });
            }
            return res.status(403).json({ error: 'INVALID_TOKEN', message: 'خطأ في التحقق من الهوية (Token غير صالح)' });
        }
        req.user = user;
        next();
    });
};

const authorize = (roles = []) => {
    if (typeof roles === 'string') roles = [roles];
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Unauthorized: You do not have permission for this action' });
        }
        next();
    };
};

module.exports = { authenticate, authorize, JWT_SECRET };
