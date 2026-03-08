// Development: uses localhost or local ip depending on access
const API_URL = import.meta.env.VITE_API_URL ||
    (['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? `http://${window.location.hostname}:5000/api`
        : window.location.hostname.startsWith('192.168.')
            ? `http://${window.location.hostname}:5000/api`
            : '/api');

export default API_URL;
