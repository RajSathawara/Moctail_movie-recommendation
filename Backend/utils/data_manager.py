import pandas as pd
import pickle
import ast
import os

# Centralized data storage
movies = None
similarity = None
metadata_lookup = None

def load_all_data():
    """Load ML models and metadata lookup precisely once."""
    global movies, similarity, metadata_lookup
    
    if movies is not None:
        return
        
    try:
        # Load ML Files
        movies = pickle.load(open("movies.pkl", "rb"))
        similarity = pickle.load(open("similarity.pkl", "rb"))
        movies["title"] = movies["title"].str.lower()
        
        # Build Metadata Lookup
        metadata_lookup = _build_metadata_lookup()
        
        print("SUCCESS: Data and ML models loaded.")
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to load data: {e}")

def _build_metadata_lookup():
    """Read id, genres, release_date, overview, and tagline from CSV."""
    try:
        df = pd.read_csv(
            "dataset/tmdb_5000_movies.csv",
            usecols=["id", "genres", "release_date", "overview", "tagline"]
        )
        lookup = {}
        for _, row in df.iterrows():
            try:
                genre_names = [g["name"] for g in ast.literal_eval(row["genres"])]
                release_year = 0
                if not pd.isna(row["release_date"]):
                    try:
                        release_year = int(str(row["release_date"]).split("-")[0])
                    except: pass
                
                lookup[int(row["id"])] = {
                    "genres": genre_names,
                    "release_year": release_year,
                    "overview": str(row["overview"]) if not pd.isna(row["overview"]) else "",
                    "tagline": str(row["tagline"]) if not pd.isna(row["tagline"]) else ""
                }
            except Exception:
                lookup[int(row["id"])] = {"genres": [], "release_year": 0, "overview": "", "tagline": ""}
        return lookup
    except Exception as e:
        print("WARNING: Could not load metadata lookup:", e)
        return {}

def get_movie_metadata(movie_id):
    """Safe helper to get metadata for a movie ID."""
    if metadata_lookup is None:
        return {"genres": [], "release_year": 0, "overview": "", "tagline": ""}
    return metadata_lookup.get(int(movie_id), {"genres": [], "release_year": 0, "overview": "", "tagline": ""})
