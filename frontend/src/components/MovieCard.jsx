import { useState, useEffect } from 'react';

// ── OMDB poster fetcher ──────────────────────────────────────────
// Uses free OMDB API. Falls back to gradient placeholder on any failure.
const OMDB_KEY = 'trilogy'; // Free demo key — swap with your own from omdbapi.com if needed

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

// ── Deterministic gradient from title ───────────────────────────
function getGradient(title = '') {
    const hash = [...title].reduce((a, c) => a + c.charCodeAt(0), 0);
    const h1 = hash % 360;
    const h2 = (hash * 37 + 120) % 360;
    return `linear-gradient(145deg, hsl(${h1},40%,18%), hsl(${h2},50%,12%))`;
}

// ── Match badge color by rank ────────────────────────────────────
function matchBadgeStyle(rank) {
    if (rank <= 3) return { background: 'rgba(34,197,94,0.18)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.35)' };
    if (rank <= 6) return { background: 'rgba(234,179,8,0.18)', color: '#facc15', border: '1px solid rgba(234,179,8,0.35)' };
    return { background: 'rgba(249,115,22,0.18)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.35)' };
}

// ── Component ────────────────────────────────────────────────────
export default function MovieCard({
    title,
    rating,
    votes,
    genres = [],
    matchPercent,
    matchRank,       // 1-based rank for badge colour
    releaseYear,
    showGenres = false,
    compact = false,
}) {
    const [posterUrl, setPosterUrl] = useState(undefined); // undefined = loading
    const stars = rating ? rating.toFixed(1) : null;
    const gradient = getGradient(title);

    useEffect(() => {
        if (!title) return;
        let cancelled = false;
        fetchPosterUrl(title).then((url) => {
            if (!cancelled) setPosterUrl(url);
        });
        return () => { cancelled = true; };
    }, [title]);

    const badgeStyle = matchRank ? matchBadgeStyle(matchRank) : null;
    const primaryGenre = genres?.[0] || null;

    return (
        <div className={`movie-card${compact ? ' movie-card--compact' : ''}`}>
            {/* Poster */}
            <div className="movie-card-poster">
                {posterUrl === undefined && (
                    /* Still loading — show shimmer */
                    <div className="movie-card-poster-placeholder skeleton" style={{ width: '100%', height: '100%' }} />
                )}
                {posterUrl ? (
                    <img
                        className="movie-card-poster-img"
                        src={posterUrl}
                        alt={title}
                        loading="lazy"
                        onError={() => setPosterUrl(null)}
                    />
                ) : posterUrl === null && (
                    /* No poster available — gradient placeholder */
                    <div className="movie-card-poster-placeholder" style={{ background: gradient }}>
                        <span className="poster-icon">🎬</span>
                    </div>
                )}

                {/* Match % badge — top-left corner pill */}
                {matchPercent && badgeStyle && (
                    <div className="match-badge-pill" style={badgeStyle}>
                        {matchPercent}%
                    </div>
                )}

                {/* Rating badge — bottom-left */}
                {stars && (
                    <div className="movie-card-rating">
                        <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {stars}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="movie-card-info">
                <div className="movie-card-title">{title || 'Unknown Title'}</div>
                {showGenres && primaryGenre ? (
                    <div className="movie-card-genres">
                        {genres.slice(0, 2).map((g) => (
                            <span key={g} className="genre-pill">{g}</span>
                        ))}
                    </div>
                ) : (
                    <div className="movie-card-meta">
                        {releaseYear ? `${releaseYear} • ` : ''}
                        {votes ? `${votes.toLocaleString()} votes` : primaryGenre || ''}
                    </div>
                )}
            </div>
        </div>
    );
}
