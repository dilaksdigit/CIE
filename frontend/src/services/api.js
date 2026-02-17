import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('cie_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('cie_token');
            localStorage.removeItem('cie_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ====== Auth ======
export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (name, email, password, password_confirmation, role) => api.post('/auth/register', { 
        name, 
        email, 
        password,
        password_confirmation,
        role 
    }),
};

// ====== SKUs ======
export const skuApi = {
    list: (params) => api.get('/skus', { params }),
    get: (id) => api.get(`/skus/${id}`),
    create: (data) => api.post('/skus', data),
    update: (id, data) => api.put(`/skus/${id}`, data),
    validate: (id) => api.post(`/skus/${id}/validate`),
};

// ====== Clusters ======
export const clusterApi = {
    list: (params) => api.get('/clusters', { params }),
    create: (data) => api.post('/clusters', data),
    update: (id, data) => api.put(`/clusters/${id}`, data),
};

// ====== Tiers ======
export const tierApi = {
    recalculate: () => api.post('/tiers/recalculate'),
};

// ====== Audit ======
export const auditApi = {
    run: (skuId) => api.post(`/audit/${skuId}`),
};

// ====== Briefs ======
export const briefApi = {
    list: (params) => api.get('/briefs', { params }),
    create: (data) => api.post('/briefs', data),
};

export default api;
