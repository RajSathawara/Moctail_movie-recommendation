import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import Footer from '../components/Footer';
import { getRecommendations } from '../services/api';
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

export default function SearchResults() {
    const [params] = useSearchParams();
    const query = params.get('q') || '';
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [recs, setRecs] = useState([]);
    const [matched, setMatched] = useState('');
    const [searchedGenres, setSearchedGenres] = useState([]);
    const [error, setError] = useState('');

    const [exploreMovies, setExploreMovies] = useState([]);
    const [exploreLoading, setExploreLoading] = useState(false);
    const [showMoreExplore, setShowMoreExplore] = useState(false);

    // ── Fetch main recommendations ──
    useEffect(() => {
        if (!query) return;
        setLoading(true);
        setRecs([]);
        setError('');
        setSearchedGenres([]);
        setExploreMovies([]);
        setShowMoreExplore(false);

        getRecommendations(query)
            .then((res) => {
                const data = res.data?.data;
                setMatched(data?.searched_movie || query);
                setRecs(data?.recommendations || []);
                setSearchedGenres(data?.searched_genres || []);
            })
            .catch((err) => {
                setError(err.response?.data?.error || 'No results found for this title.');
            })
            .finally(() => setLoading(false));
    }, [query]);

    // ── Fetch Explore More based on genres ──
    useEffect(() => {
        if (!searchedGenres.length) return;

        // Pick up to 2 genre seeds to call the recommend API with
        const seeds = searchedGenres
            .map((g) => GENRE_SEEDS[g])
            .filter(Boolean)
            .slice(0, 2);

        if (!seeds.length) return;

        setExploreLoading(true);
        const recTitles = new Set(recs.map((r) => r.title.toLowerCase()));

        Promise.allSettled(seeds.map((s) => getRecommendations(s)))
            .then((results) => {
                const all = [];
                results.forEach((r) => {
                    if (r.status === 'fulfilled') {
                        all.push(...(r.value.data?.data?.recommendations || []));
                    }
                });
                // Deduplicate and exclude already-shown recs
                const seen = new Set();
                const filtered = all.filter((m) => {
                    const key = m.title.toLowerCase();
                    if (seen.has(key) || recTitles.has(key)) return false;
                    seen.add(key);
                    return true;
                });
                setExploreMovies(filtered.sort((a, b) => b.rating - a.rating));
            })
            .finally(() => setExploreLoading(false));
    }, [searchedGenres, recs]);

    const displayedExplore = showMoreExplore ? exploreMovies : exploreMovies.slice(0, 10);

    return (
        <div className="search-page">
            <Navbar showSearch />

            <div className="search-body container">
                {/* Search header */}
                {!loading && !error && (
                    <div className="search-header">
                        <h1 className="search-title">
                            Results for <span className="text-purple">'{matched || query}'</span>
                        </h1>
                        <p className="search-desc">
                            We analyzed your preferences and the current search to find these matches.
                            Explore the top recommendations and related content below.
                        </p>
                        {searchedGenres.length > 0 && (
                            <div className="searched-genre-pills">
                                {searchedGenres.map((g) => (
                                    <span key={g} className="genre-pill">{g}</span>
                                ))}
                            </div>
                        )}
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
                            <p className="explore-empty">No additional {searchedGenres[0]} movies found.</p>
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
