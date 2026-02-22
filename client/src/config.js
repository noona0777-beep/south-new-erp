// Production: set VITE_API_URL in Vercel environment variables
// Development: uses localhost automatically
const API_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');
export default API_URL;
