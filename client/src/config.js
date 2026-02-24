// Development: uses localhost
// Production: uses relative path /api (works on same domain deployment like Vercel)
const API_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
        ? 'https://south-new-erp-1.onrender.com/api'
        : '/api');

export default API_URL;
