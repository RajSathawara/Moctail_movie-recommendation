from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import difflib
import pandas as pd
from dotenv import load_dotenv

from routes.auth_routes import auth
from database.db import get_db_connection
from database.db_utils import add_search_history, get_recent_searches
import utils.data_manager as dm
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")


CORS(app, origins=["https://vercel.com/rajsathawaras-projects/moctail-movie-recommendation-s453/H5pNbji6MmtgJsNupi2YZUZng8Bc"])

# Initialize database tables and load ML/Data
def init_app():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            movie_title TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    conn.commit()
    cursor.close()
    conn.close()
    dm.load_all_data()

init_app()

app.register_blueprint(auth, url_prefix="/api")

# ==============================
# Response Helpers
# ==============================

def success_response(data, status=200):
    return jsonify({"success": True, "data": data, "error": None}), status

def error_response(message, status=400):
    return jsonify({"success": False, "data": None, "error": message}), status

# ==============================
# Routes
# ==============================

@app.route("/")
def home():
    return success_response({"message": "Backend is running successfully"})

@app.route("/api/recommend", methods=["GET"])
def recommend():
    movie_name = request.args.get("movie")
    if not movie_name:
        return error_response("Movie parameter is required", 400)

    movie_name = movie_name.lower()
    all_titles = dm.movies["title"].tolist()
    closest_matches = difflib.get_close_matches(movie_name, all_titles, n=1, cutoff=0.6)

    if not closest_matches:
        return error_response("Movie not found", 404)

    matched_title = closest_matches[0]
    movie_index = dm.movies[dm.movies["title"] == matched_title].index[0]
    distances = dm.similarity[movie_index]
    movie_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:11]

    recommendations = []
    for i in movie_list:
        movie = dm.movies.iloc[i[0]]
        mid = int(movie.movie_id)
        metadata = dm.get_movie_metadata(mid)
        recommendations.append({
            "title": str(movie.title),
            "rating": float(movie.vote_average) if not pd.isna(movie.vote_average) else 0.0,
            "votes": int(movie.vote_count) if not pd.isna(movie.vote_count) else 0,
            "movie_id": mid,
            "genres": metadata["genres"],
            "release_year": metadata["release_year"],
            "overview": metadata["overview"],
            "tagline": metadata["tagline"]
        })

    recommendations = sorted(recommendations, key=lambda x: x["rating"], reverse=True)
    searched_movie_data = dm.movies.iloc[movie_index]
    searched_mid = int(searched_movie_data["movie_id"]) if not pd.isna(searched_movie_data["movie_id"]) else 0
    metadata = dm.get_movie_metadata(searched_mid)

    return success_response({
        "searched_movie": matched_title,
        "searched_genres": metadata["genres"],
        "searched_year": metadata["release_year"],
        "searched_overview": metadata["overview"],
        "searched_tagline": metadata["tagline"],
        "searched_rating": float(searched_movie_data["vote_average"]),
        "searched_votes": int(searched_movie_data["vote_count"]),
        "searched_movie_id": searched_mid,
        "recommendations": recommendations
    })

@app.route("/api/movies/popular", methods=["GET"])
def get_popular_movies():
    top_popular = dm.movies.sort_values(by="vote_count", ascending=False).head(20)
    results = []
    for _, movie in top_popular.iterrows():
        mid = int(movie.movie_id) if not pd.isna(movie.movie_id) else 0
        metadata = dm.get_movie_metadata(mid)
        results.append({
            "title": str(movie.title),
            "rating": float(movie.vote_average) if not pd.isna(movie.vote_average) else 0.0,
            "votes": int(movie.vote_count) if not pd.isna(movie.vote_count) else 0,
            "movie_id": mid,
            "genres": metadata["genres"],
            "release_year": metadata["release_year"]
        })
    return success_response(results)

@app.route("/api/movies/recent", methods=["GET"])
def get_recent_movies():
    movie_list = []
    for _, movie in dm.movies.iterrows():
        mid = int(movie.movie_id) if not pd.isna(movie.movie_id) else 0
        metadata = dm.get_movie_metadata(mid)
        movie_list.append({
            "title": str(movie.title),
            "rating": float(movie.vote_average) if not pd.isna(movie.vote_average) else 0.0,
            "votes": int(movie.vote_count) if not pd.isna(movie.vote_count) else 0,
            "movie_id": mid,
            "genres": metadata["genres"],
            "release_year": metadata["release_year"]
        })
    sorted_movies = sorted(movie_list, key=lambda x: (x["release_year"], x["rating"]), reverse=True)
    return success_response(sorted_movies[:20])

@app.route("/api/movies/for-you", methods=["GET"])
def get_for_you_movies():
    user_id = request.args.get("user_id")
    if not user_id:
        top_rated = dm.movies.sort_values(by="vote_average", ascending=False).head(20)
        results = []
        for _, movie in top_rated.iterrows():
            mid = int(movie.movie_id) if not pd.isna(movie.movie_id) else 0
            metadata = dm.get_movie_metadata(mid)
            results.append({
                "title": str(movie.title),
                "rating": float(movie.vote_average) if not pd.isna(movie.vote_average) else 0.0,
                "votes": int(movie.vote_count) if not pd.isna(movie.vote_count) else 0,
                "movie_id": mid,
                "genres": metadata["genres"],
                "release_year": metadata["release_year"]
            })
        return success_response(results)

    recent_searches = get_recent_searches(user_id)
    if not recent_searches:
        return get_popular_movies()

    all_recommendations = []
    seen_titles = set()
    all_titles = dm.movies["title"].tolist()
    
    for term in recent_searches:
        matches = difflib.get_close_matches(term.lower(), all_titles, n=1, cutoff=0.6)
        if matches:
            idx = dm.movies[dm.movies["title"] == matches[0]].index[0]
            distances = dm.similarity[idx]
            m_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:11]
            for i in m_list:
                m = dm.movies.iloc[i[0]]
                if m.title not in seen_titles:
                    mid = int(m.movie_id) if not pd.isna(m.movie_id) else 0
                    metadata = dm.get_movie_metadata(mid)
                    all_recommendations.append({
                        "title": str(m.title),
                        "rating": float(m.vote_average) if not pd.isna(m.vote_average) else 0.0,
                        "votes": int(m.vote_count) if not pd.isna(m.vote_count) else 0,
                        "movie_id": mid,
                        "genres": metadata["genres"],
                        "release_year": metadata["release_year"]
                    })
                    seen_titles.add(m.title)

    all_recommendations = sorted(all_recommendations, key=lambda x: x["rating"], reverse=True)
    return success_response(all_recommendations[:20])

@app.route("/api/log-search", methods=["POST"])
def log_search():
    data = request.get_json()
    user_id = data.get("user_id")
    movie_title = data.get("movie_title")
    if not user_id or not movie_title:
        return error_response("Missing user_id or movie_title", 400)
    
    if add_search_history(user_id, movie_title):
        return success_response({"message": "Search logged"})
    return error_response("Failed to log search", 500)

@app.route("/api/movies/by-genres", methods=["GET"])
def get_movies_by_genres():
    genres_query = request.args.get("genres", "")
    exclude_title = request.args.get("exclude", "")
    if not genres_query:
        return error_response("Genres parameter is required", 400)

    target_genres = set(g.strip().lower() for g in genres_query.split(","))
    scored_movies = []
    for _, movie in dm.movies.iterrows():
        if exclude_title and str(movie.title).lower() == exclude_title.lower():
            continue
        mid = int(movie.movie_id) if not pd.isna(movie.movie_id) else 0
        metadata = dm.get_movie_metadata(mid)
        movie_genres = set(g.lower() for g in metadata["genres"])
        intersection = target_genres.intersection(movie_genres)
        if intersection:
            scored_movies.append({
                "title": str(movie.title),
                "rating": float(movie.vote_average) if not pd.isna(movie.vote_average) else 0.0,
                "votes": int(movie.vote_count) if not pd.isna(movie.vote_count) else 0,
                "movie_id": mid,
                "genres": metadata["genres"],
                "release_year": metadata["release_year"],
                "overlap_count": len(intersection)
            })
    scored_movies = sorted(scored_movies, key=lambda x: (x["overlap_count"], x["rating"]), reverse=True)
    return success_response(scored_movies[:30])

@app.route("/api/movies/random", methods=["GET"])
def get_random_movies():
    """Return 4 random movies with decent ratings."""
    # Filter movies with rating > 6 to ensure quality
    quality_movies = dm.movies[dm.movies["vote_average"] > 6]
    random_sample = quality_movies.sample(4)
    results = []
    for _, movie in random_sample.iterrows():
        mid = int(movie.movie_id) if not pd.isna(movie.movie_id) else 0
        metadata = dm.get_movie_metadata(mid)
        results.append({
            "title": str(movie.title),
            "rating": float(movie.vote_average),
            "votes": int(movie.vote_count),
            "movie_id": mid,
            "genres": metadata["genres"],
            "release_year": metadata["release_year"]
        })
    return success_response(results)

@app.errorhandler(500)
def internal_error(e):
    return error_response("Internal server error", 500)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)