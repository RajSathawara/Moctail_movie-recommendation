import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

export const register = (name, email, password) =>
    api.post('/register', { name, email, password });

export const login = (email, password) =>
    api.post('/login', { email, password });

export const getRecommendations = (movieName) =>
    api.get(`/recommend?movie=${encodeURIComponent(movieName)}`);

export default api;
