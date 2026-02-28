import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: baseURL,
    headers: { 'Content-Type': 'application/json' },
});

export const register = (name, email, password) =>
    api.post('/register', { name, email, password });

export const login = (email, password) =>
    api.post('/login', { email, password });

export const getRecommendations = (movieName) =>
    api.get(`/recommend?movie=${encodeURIComponent(movieName)}`);

export const getPopularMovies = () =>
    api.get('/movies/popular');

export const getRecentMovies = () =>
    api.get('/movies/recent');

export const getForYouMovies = (userId) =>
    api.get(`/movies/for-you?user_id=${userId}`);

export const getMoviesByGenres = (genres, excludeTitle = '') =>
    api.get(`/movies/by-genres?genres=${encodeURIComponent(genres)}&exclude=${encodeURIComponent(excludeTitle)}`);

export const logSearch = (userId, movieTitle) =>
    api.post('/log-search', { user_id: userId, movie_title: movieTitle });

export const getRandomMovies = () =>
    api.get('/movies/random');

export default api;
