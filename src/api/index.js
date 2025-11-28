import axios from './axios';

export const authApi = {
    register: (userData) => axios.post('/auth/register', userData),
    login: (credentials) => axios.post('/auth/login', credentials),
    getMe: () => axios.get('/auth/me'),
};

export const productsApi = {
    getAll: () => axios.get('/products'),
    getOne: (id) => axios.get(`/products/${id}`),
    create: (data) => axios.post('/products', data),
    update: (id, data) => axios.put(`/products/${id}`, data),
    delete: (id) => axios.delete(`/products/${id}`),
};

export const clientsApi = {
    getAll: () => axios.get('/clients'),
    getOne: (id) => axios.get(`/clients/${id}`),
    create: (data) => axios.post('/clients', data),
    update: (id, data) => axios.put(`/clients/${id}`, data),
    delete: (id) => axios.delete(`/clients/${id}`),
};

export const ordersApi = {
    getAll: () => axios.get('/orders'),
    getOne: (id) => axios.get(`/orders/${id}`),
    create: (data) => axios.post('/orders', data),
    update: (id, data) => axios.put(`/orders/${id}`, data),
    delete: (id) => axios.delete(`/orders/${id}`),
};

export const commentsApi = {
    getAll: () => axios.get('/comments'),
    getOne: (id) => axios.get(`/comments/${id}`),
    create: (data) => axios.post('/comments', data),
    update: (id, data) => axios.put(`/comments/${id}`, data),
    delete: (id) => axios.delete(`/comments/${id}`),
};

export const usersApi = {
    getAll: () => axios.get('/users'),
    getOne: (id) => axios.get(`/users/${id}`),
    create: (data) => axios.post('/users', data),
    update: (id, data) => axios.put(`/users/${id}`, data),
    delete: (id) => axios.delete(`/users/${id}`),
};

export const permissionsApi = {
    getPermissions: (userId) => axios.get(`/permissions/${userId}`),
    updatePermissions: (userId, data) => axios.put(`/permissions/${userId}`, data),
};
