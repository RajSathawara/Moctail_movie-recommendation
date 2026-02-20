from flask import Flask, jsonify, request
from routes.auth_routes import auth
import pandas as pd
import pickle
import difflib
import numpy as np
import ast

app = Flask(__name__)

# Register authentication routes
app.register_blueprint(auth, url_prefix="/api")


# ==============================
# Load ML Files (only once)
# ==============================

movies = pickle.load(open("movies.pkl", "rb"))
similarity = pickle.load(open("similarity.pkl", "rb"))

movies["title"] = movies["title"].str.lower()

# ==============================
# Load Genre Lookup (from CSV)
# ==============================

def _build_genres_lookup():
    """Read only id+genres columns from CSV to build a {movie_id: [genres]} dict."""
    try:
        genres_csv = pd.read_csv(
            "dataset/tmdb_5000_movies.csv",
            usecols=["id", "genres"]
        )
        lookup = {}
        for _, row in genres_csv.iterrows():
            try:
                genre_names = [g["name"] for g in ast.literal_eval(row["genres"])]
                lookup[int(row["id"])] = genre_names
            except Exception:
                lookup[int(row["id"])] = []
        return lookup
    except Exception as e:
        print("WARNING: Could not load genres lookup:", e)
        return {}

genres_lookup = _build_genres_lookup()


# ==============================
# Response Helpers
# ==============================

def success_response(data, status=200):
    return jsonify({
        "success": True,
        "data": data,
        "error": None
    }), status


def error_response(message, status=400):
    return jsonify({
        "success": False,
        "data": None,
        "error": message
    }), status


# ==============================
# Home Route
# ==============================

@app.route("/")
def home():
    return success_response({"message": "Backend is running successfully"})


# ==============================
# Recommendation Route
# ==============================

@app.route("/api/recommend", methods=["GET"])
def recommend():
    movie_name = request.args.get("movie")

    if not movie_name:
        return error_response("Movie parameter is required", 400)

    movie_name = movie_name.lower()

    # Fuzzy match (handles typos)
    all_titles = movies["title"].tolist()
    closest_matches = difflib.get_close_matches(movie_name, all_titles, n=1, cutoff=0.6)

    if not closest_matches:
        return error_response("Movie not found", 404)

    matched_title = closest_matches[0]

    movie_index = movies[movies["title"] == matched_title].index[0]

    distances = similarity[movie_index]
    movie_list = sorted(
        list(enumerate(distances)),
        reverse=True,
        key=lambda x: x[1]
    )[1:11]  # Top 10 recommendations

    recommendations = []

    for i in movie_list:
        movie = movies.iloc[i[0]]
        mid = int(movie.movie_id)

        recommendations.append({
            "title": str(movie.title),
            "rating": float(movie.vote_average) if not pd.isna(movie.vote_average) else 0.0,
            "votes": int(movie.vote_count) if not pd.isna(movie.vote_count) else 0,
            "movie_id": mid,
            "genres": genres_lookup.get(mid, [])
        })

    # Sort recommendations by rating
    recommendations = sorted(
        recommendations,
        key=lambda x: x["rating"],
        reverse=True
    )

    searched_mid = int(movies.iloc[movie_index]["movie_id"])
    searched_genres = genres_lookup.get(searched_mid, [])

    return success_response({
        "searched_movie": matched_title,
        "searched_genres": searched_genres,
        "recommendations": recommendations
    })


# ==============================
# Global Error Handler
# ==============================

@app.errorhandler(500)
def internal_error(e):
    return error_response("Internal server error", 500)


# ==============================
# Run Server
# ==============================

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
