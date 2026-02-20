import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import Footer from '../components/Footer';
import { getRecommendations, logSearch, getMoviesByGenres } from '../services/api';
import './SearchResults.css';

// ── Genre seed map: genre → seed movie title for Explore More calls ──
const GENRE_SEEDS = {
    'Action': 'mad max fury road',
    'Adventure': 'indiana jones',
    'Animation': 'toy story',
    'Comedy': 'superbad',
    'Crime': 'pulp fiction',
    'Documentary': 'planet earth',
    'Drama': 'the shawshank redemption',
    'Family': 'home alone',
    'Fantasy': 'lord of the rings',
    'History': 'gladiator',
    'Horror': 'the shining',
    'Music': 'whiplash',
    'Mystery': 'knives out',
    'Romance': 'titanic',
    'Science Fiction': 'interstellar',
    'Thriller': 'gone girl',
    'War': 'saving private ryan',
    'Western': 'django unchained',
};

function EmptyState({ query }) {
    return (
        <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2>No results for <span className="text-purple">"{query}"</span></h2>
            <p>We couldn't find a match. Check the spelling or try a different movie title.</p>
            <div className="empty-suggestions">
                <p>Try searching for:</p>
                <div className="empty-chips">
                    {['Interstellar', 'The Dark Knight', 'Inception', 'Avatar'].map((s) => (
                        <a key={s} href={`/search?q=${encodeURIComponent(s)}`} className="empty-chip">{s}</a>
                    ))}
                </div>
            </div>
        </div>
    );
}

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

// Decreasing match % from 99 down to 72
const matchPct = (rank) => Math.max(72, 99 - (rank - 1) * 3);

// Deterministic gradient helper
function getGradient(title = '') {
    const hash = [...title].reduce((a, c) => a + c.charCodeAt(0), 0);
    const h1 = hash % 360;
    const h2 = (hash * 37 + 120) % 360;
    return `linear-gradient(145deg, hsl(${h1},40%,18%), hsl(${h2},50%,12%))`;
}

// OMDB poster fetcher (shared logic)
const OMDB_KEY = 'trilogy';
const posterCache = {};
async function fetchPosterUrl(title) {
    if (posterCache[title] !== undefined) return posterCache[title];
    try {
        const res = await fetch(
            `https://www.omdbapi.com/?apikey=${OMDB_KEY}&t=${encodeURIComponent(title)}&type=movie`
        );
        const data = await res.json();
        const url = data?.Poster && data.Poster !== 'N/A' ? data.Poster : null;
        posterCache[title] = url;
        return url;
    } catch {
        posterCache[title] = null;
        return null;
    }
}

function FeaturedMovie({ movie, navigate }) {
    const [poster, setPoster] = useState(undefined);
    const gradient = getGradient(movie?.title);

    useEffect(() => {
        if (!movie?.title) return;
        setPoster(undefined);
        fetchPosterUrl(movie.title).then(setPoster);
    }, [movie?.title]);

    if (!movie) return null;

    return (
        <div className="featured-movie-container">
            <div className="featured-movie-card">
                <div className="featured-poster">
                    {poster === undefined ? (
                        <div className="skeleton" style={{ width: '100%', height: '100%' }} />
                    ) : poster ? (
                        <img src={poster} alt={movie.title} onError={() => setPoster(null)} />
                    ) : (
                        <div className="featured-poster-placeholder" style={{ background: gradient }}>
                            <span>🎬</span>
                        </div>
                    )}
                    <div className="featured-rating-badge">
                        <span className="star">★</span> {movie.rating?.toFixed(1)}
                    </div>
                </div>
                <div className="featured-info">
                    <div className="featured-header">
                        <span className="featured-label">Searched Movie</span>
                        <h1 className="featured-title">{movie.title}</h1>
                        {movie.tagline && <p className="featured-tagline">"{movie.tagline}"</p>}
                    </div>

                    <div className="featured-meta">
                        <span className="meta-item">{movie.releaseYear}</span>
                        <span className="meta-divider">•</span>
                        <div className="featured-genres">
                            {movie.genres?.map(g => <span key={g} className="featured-genre-pill">{g}</span>)}
                        </div>
                        <span className="meta-divider">•</span>
                        <span className="meta-item">{movie.votes?.toLocaleString()} votes</span>
                    </div>

                    <p className="featured-description">{movie.overview}</p>

                    <div className="featured-actions">
                        <button className="btn btn-primary" onClick={() => navigate(`/search?q=${encodeURIComponent(movie.title)}`)}>
                            <span>🔍</span> More Like This
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SearchResults() {
    const [params] = useSearchParams();
    const query = params.get('q') || '';
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [recs, setRecs] = useState([]);
    const [matched, setMatched] = useState('');
    const [searchedGenres, setSearchedGenres] = useState([]);
    const [searchedYear, setSearchedYear] = useState(0);
    const [featuredData, setFeaturedData] = useState(null);
    const [error, setError] = useState('');

    const [exploreMovies, setExploreMovies] = useState([]);
    const [exploreLoading, setExploreLoading] = useState(false);
    const [showMoreExplore, setShowMoreExplore] = useState(false);

    // ── Fetch main recommendations ──
    useEffect(() => {
        const fetchRecs = async () => {
            if (!query) return;
            setLoading(true);
            setRecs([]);
            setError('');
            setSearchedGenres([]);
            setExploreMovies([]);
            setShowMoreExplore(false);

            try {
                const res = await getRecommendations(query);
                const data = res.data?.data;
                const matchedTitle = data?.searched_movie || query;
                setMatched(matchedTitle);
                setRecs(data?.recommendations || []);
                setSearchedGenres(data?.searched_genres || []);
                setSearchedYear(data?.searched_year || 0);

                setFeaturedData({
                    title: matchedTitle,
                    genres: data?.searched_genres || [],
                    releaseYear: data?.searched_year || 0,
                    overview: data?.searched_overview || '',
                    tagline: data?.searched_tagline || '',
                    rating: data?.searched_rating || 0,
                    votes: data?.searched_votes || 0,
                    movie_id: data?.searched_movie_id
                });

                // Log search if user is logged in
                const storedUser = localStorage.getItem("moctail_user");
                if (storedUser && storedUser !== "undefined") {
                    try {
                        const user = JSON.parse(storedUser);
                        if (user?.id) {
                            logSearch(user.id, matchedTitle).catch(e => console.error("Log search failed", e));
                        }
                    } catch (e) {
                        console.error("User parse for log failed", e);
                    }
                }
            } catch (err) {
                setError(err.response?.data?.error || 'No results found for this title.');
            } finally {
                setLoading(false);
            }
        };
        fetchRecs();
    }, [query]);

    // ── Fetch Explore More based on genres ──
    useEffect(() => {
        const fetchExplore = async () => {
            if (!searchedGenres.length) return;

            setExploreLoading(true);
            try {
                const res = await getMoviesByGenres(searchedGenres.join(','), matched);
                const all = res.data?.data || [];
                setExploreMovies(all);
            } catch (err) {
                console.error("Explore More fetch error", err);
            } finally {
                setExploreLoading(false);
            }
        };
        fetchExplore();
    }, [searchedGenres, recs]);

    const displayedExplore = showMoreExplore ? exploreMovies : exploreMovies.slice(0, 10);

    return (
        <div className="search-page">
            <Navbar showSearch />

            <div className="search-body container">
                {/* Featured Movie Section */}
                {!loading && !error && featuredData && (
                    <FeaturedMovie movie={featuredData} navigate={navigate} />
                )}

                {/* Search header (Subtle now) */}
                {!loading && !error && (
                    <div className="search-header-refined">
                        <div className="section-header-row">
                            <div className="section-title-accent" />
                            <h2 className="section-heading">Personalized Matches</h2>
                        </div>
                        <p className="search-desc">
                            Based on your interest in <span className="text-purple">"{matched || query}"</span>,
                            we found these top recommendations.
                        </p>
                    </div>
                )}

                {/* Error / Empty State */}
                {error && <EmptyState query={query} />}

                {/* ── Top 10 Results: 5 × 2 grid ── */}
                {!error && (
                    <section className="top10-section">
                        <div className="section-header-row">
                            <div className="section-title-accent" />
                            <h2 className="section-heading">Top 10 Recommendations</h2>
                        </div>

                        <div className="results-grid-5col">
                            {loading
                                ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
                                : recs.slice(0, 10).map((m, i) => (
                                    <div
                                        key={m.title}
                                        onClick={() => navigate(`/search?q=${encodeURIComponent(m.title)}`)}
                                    >
                                        <MovieCard
                                            title={m.title}
                                            rating={m.rating}
                                            votes={m.votes}
                                            genres={m.genres}
                                            matchPercent={matchPct(i + 1)}
                                            matchRank={i + 1}
                                            releaseYear={m.release_year}
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    </section>
                )}

                {/* ── Explore More (same genre) ── */}
                {!error && searchedGenres.length > 0 && (
                    <section className="explore-section">
                        <div className="section-header-row">
                            <div className="section-title-accent" />
                            <div>
                                <h2 className="section-heading">
                                    Explore More
                                    {searchedGenres.length > 0 && (
                                        <span className="explore-genre-label">
                                            · {searchedGenres.slice(0, 2).join(' & ')}
                                        </span>
                                    )}
                                </h2>
                                <p className="explore-subtitle">
                                    More {searchedGenres[0]} movies you might enjoy
                                </p>
                            </div>
                        </div>

                        {exploreLoading ? (
                            <div className="explore-grid">
                                {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : exploreMovies.length === 0 && !exploreLoading ? (
                            <p className="explore-empty">
                                We couldn't find any other movies within the
                                <span className="text-purple"> {searchedGenres.join(' & ')} </span>
                                categories at this time.
                            </p>
                        ) : (
                            <>
                                <div className="explore-grid">
                                    {displayedExplore.map((m, i) => (
                                        <div
                                            key={m.title + i}
                                            onClick={() => navigate(`/search?q=${encodeURIComponent(m.title)}`)}
                                        >
                                            <MovieCard
                                                title={m.title}
                                                rating={m.rating}
                                                votes={m.votes}
                                                genres={m.genres}
                                                releaseYear={m.release_year}
                                                showGenres
                                            />
                                        </div>
                                    ))}
                                </div>
                                {exploreMovies.length > 10 && !showMoreExplore && (
                                    <div className="load-more-wrap">
                                        <button className="btn btn-outline" onClick={() => setShowMoreExplore(true)}>
                                            ↓ Load More Titles
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                )}
            </div>

            <Footer />
        </div>
    );
}
