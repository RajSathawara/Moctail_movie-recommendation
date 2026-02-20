import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ showSearch = false }) {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('moctail_user') || 'null');

    const handleLogout = () => {
        localStorage.removeItem('moctail_user');
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery('');
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                {/* Logo */}
                <NavLink to={user ? '/dashboard' : '/'} className="navbar-logo">
                    <div className="navbar-logo-icon">🎬</div>
                    <span>Moctail</span>
                </NavLink>

                {/* Center search (dashboard / results) */}
                {showSearch && (
                    <form className="navbar-search" onSubmit={handleSearch}>
                        <span className="navbar-search-icon">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                        </span>
                        <input
                            className="navbar-search-input"
                            placeholder="Search for movies, actors, or genres..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </form>
                )}

                {/* Nav links */}
                <div className="navbar-links">
                    {user ? (
                        <>
                            <NavLink to="/dashboard" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>Browse</NavLink>
                            <button className="navbar-logout" onClick={handleLogout}>Logout</button>
                            <div className="navbar-avatar">{user.name?.[0]?.toUpperCase() || 'U'}</div>
                        </>
                    ) : (
                        <>
                            <NavLink to="/dashboard" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>Browse Movies</NavLink>
                            <NavLink to="/login" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>Popular</NavLink>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
