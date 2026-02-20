import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import Footer from '../components/Footer';
import { getPopularMovies, getRecentMovies, getForYouMovies } from '../services/api';
import './Dashboard.css';

const SEED_MOVIES = ['inception', 'interstellar', 'the dark knight', 'avengers', 'avatar', 'titanic', 'joker', 'parasite'];
const TABS = ['Popular', 'Recently Released', 'For You'];

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-poster" />
      <div className="skeleton-info">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-meta" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchMovies = async () => {
    setLoading(true);
    setMovies([]);
    setPage(1);

    const storedUser = localStorage.getItem("moctail_user");
    let userId = null;
    if (storedUser && storedUser !== "undefined") {
      try {
        userId = JSON.parse(storedUser).id;
      } catch (e) {
        console.error("User ID parse failed", e);
      }
    }

    try {
      let res;
      if (activeTab === 0) {
        res = await getPopularMovies();
      } else if (activeTab === 1) {
        res = await getRecentMovies();
      } else {
        res = await getForYouMovies(userId);
      }

      const all = res.data?.data || [];
      setMovies(all);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q) => navigate(`/search?q=${encodeURIComponent(q)}`);
  const displayed = movies.slice(0, page * 12);

  return (
    <div className="dashboard">
      <Navbar showSearch onSearch={handleSearch} />

      <div className="dashboard-body container">
        {/* Tabs */}
        <div className="dash-tabs">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`dash-tab${activeTab === i ? ' active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="movies-grid">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            : displayed.map((m, i) => (
              <div key={m.title + i} onClick={() => navigate(`/search?q=${encodeURIComponent(m.title)}`)}>
                <MovieCard
                  title={m.title}
                  rating={m.rating}
                  votes={m.votes}
                  releaseYear={m.release_year}
                />
              </div>
            ))
          }
        </div>

        {/* Show more */}
        {!loading && movies.length > displayed.length && (
          <div className="dash-more">
            <button className="btn btn-outline show-more-btn" onClick={() => setPage(p => p + 1)}>
              Show More Results ↓
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}