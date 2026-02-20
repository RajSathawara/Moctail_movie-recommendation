import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import Footer from '../components/Footer';
import { getRandomMovies } from '../services/api';
import './Welcome.css';

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI-Powered Picks',
    desc: 'Sophisticated machine learning models that understand mood, genre, and sub-text to find your perfect match.',
  },
  {
    icon: '🎞️',
    title: 'Huge Library',
    desc: 'Instant access to metadata for over 10,000 movies and TV shows across all major streaming platforms.',
  },
  {
    icon: '📌',
    title: 'Smart Watchlist',
    desc: 'Save your discoveries and get notified when they become available on your favorite streaming services.',
  },
];

const DYNAMIC_GENRES = ['Action', 'Sci-Fi', 'Romance', 'Comedy', 'Thriller', 'Drama'];

export default function Welcome() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Typing Animation Logic ──
  const [genreIndex, setGenreIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState(DYNAMIC_GENRES[0]); // Start with first genre
  const [isDeleting, setIsDeleting] = useState(false);
  const typingSpeed = isDeleting ? 70 : 120;

  useEffect(() => {
    let timeout;
    const currentGenre = DYNAMIC_GENRES[genreIndex % DYNAMIC_GENRES.length];

    if (isDeleting) {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, typingSpeed);
      } else {
        setIsDeleting(false);
        setGenreIndex((prev) => prev + 1);
      }
    } else {
      if (displayedText.length < currentGenre.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentGenre.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, genreIndex]);

  // ── Persistence Check ──
  useEffect(() => {
    const user = localStorage.getItem('moctail_user');
    if (user && user !== 'undefined') {
      navigate('/dashboard');
    }
  }, [navigate]);

  // ── Fetch Random Movies ──
  useEffect(() => {
    const fetchRandom = async () => {
      try {
        const res = await getRandomMovies();
        setTrending(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch trending movies", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRandom();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/register?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="welcome">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="welcome-hero">
        <div className="welcome-hero-noise" />
        <div className="welcome-hero-content">
          <div className="welcome-pill">🎬 Powered with AI</div>
          <h1 className="welcome-headline">
            Find Your Next <br />
            <span className="welcome-headline-accent">
              {displayedText || "Favorite"}<span className="typing-cursor">|</span> Movie
            </span>
          </h1>
          <p className="welcome-subtext">
            Personalized recommendations powered by cutting-edge AI.
            Discover hidden gems tailored specifically to your unique cinematic taste.
          </p>

          <form className="hero-search-container" onSubmit={handleSearch}>
            <input
              type="text"
              className="hero-search-input"
              placeholder="What are you in the mood for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="hero-search-btn">
              <span>🔍</span> Search
            </button>
          </form>

          <div className="welcome-cta">
            <button className="btn btn-primary welcome-btn-primary" onClick={() => navigate('/register')}>
              <span>🚀</span> Start Your Journey
            </button>
            <button className="btn btn-outline" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </button>
          </div>
        </div>
        <div className="welcome-scroll-hint">
          <span>Explore</span>
          <div className="welcome-scroll-arrow">↓</div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section id="features" className="welcome-features">
        <div className="container">
          <h2 className="section-title">Why Choose <span className="text-purple">Moctail?</span></h2>
          <p className="section-sub">Experience a smarter way to discover cinema. Our algorithms learn your preferences to provide suggestions you'll actually love.</p>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending ──────────────────────────────────── */}
      <section className="welcome-trending">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Trending Now</h2>
            <button className="view-all-btn" onClick={() => navigate('/dashboard')}>
              View all →
            </button>
          </div>
          <div className="trending-grid">
            {loading ? (
              <div className="loading-placeholder">Picking some fresh titles...</div>
            ) : (
              trending.map((m) => (
                <div key={m.movie_id} onClick={() => navigate('/register')}>
                  <MovieCard
                    title={m.title}
                    rating={m.rating}
                    votes={m.votes}
                    genres={m.genres}
                    releaseYear={m.release_year}
                    compact
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
