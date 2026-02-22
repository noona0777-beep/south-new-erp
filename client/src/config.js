// Development: uses localhost
// Production: uses Render API via environment variable or fallback
const API_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : 'https://south-new-system.onrender.com/api');

export default API_URL;
