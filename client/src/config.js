// Development: uses localhost
// Production: uses relative path /api (works on same domain deployment like Vercel)
const API_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api'
        : '/api');

export default API_URL;
