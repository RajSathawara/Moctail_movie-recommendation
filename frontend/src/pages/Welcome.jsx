import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import Footer from '../components/Footer';
import './Welcome.css';

const TRENDING = [
  { title: 'Nebula Dreams', genre: 'SCI-FI', year: '2024', rating: 8.0 },
  { title: 'Silent Streets', genre: 'DRAMA', year: '2023', rating: 7.5 },
  { title: 'The Last Horizon', genre: 'ACTION', year: '2024', rating: 8.2 },
  { title: 'Shadow Point', genre: 'THRILLER', year: '2024', rating: 7.8 },
];

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

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="welcome-hero">
        <div className="welcome-hero-noise" />
        <div className="welcome-hero-content">
          <div className="welcome-pill">🎬 Powered with AI</div>
          <h1 className="welcome-headline">
            Find Your Next<br />
            <span className="welcome-headline-accent">Favorite Movie</span>
          </h1>
          <p className="welcome-subtext">
            Personalized recommendations powered by cutting-edge AI.
            Discover hidden gems and blockbuster hits tailored specifically
            to your unique cinematic taste.
          </p>
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
            {TRENDING.map((m) => (
              <MovieCard key={m.title} {...m} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}