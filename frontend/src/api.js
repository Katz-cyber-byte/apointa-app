import { CONFIG } from './config';

const getHeaders = () => {
    const token = localStorage.getItem(CONFIG.ADMIN_TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '' // Standard "Bearer" format
    };
};

export const api = {
    get: async (endpoint) => {
        const res = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, { headers: getHeaders() });
        if (res.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
            return [];
        }
        return res.json();
    },
    post: async (endpoint, data) => {
        const res = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },
    patch: (endpoint, data) => fetch(`${CONFIG.API_BASE_URL}${endpoint}`, { 
        method: 'PATCH', 
        headers: getHeaders(), 
        body: JSON.stringify(data) 
    }),
    delete: (endpoint) => fetch(`${CONFIG.API_BASE_URL}${endpoint}`, { 
        method: 'DELETE', 
        headers: getHeaders() 
    }),
};