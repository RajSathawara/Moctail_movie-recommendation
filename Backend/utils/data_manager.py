import pandas as pd
import pickle
import ast
import os
import requests

# Centralized data storage
movies = None
similarity = None
metadata_lookup = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "..")

# 🔹 Google Drive Direct Download Links
MOVIES_URL = "https://drive.google.com/uc?export=download&id=1mr-XpKUeurYpVS1PWLOsIFLdyNztJw3h"
SIMILARITY_URL = "https://drive.google.com/uc?export=download&id=1QV1n7j9MDnZBBdim28mxVBij5doG-nko"

def download_file(url, path):
    if not os.path.exists(path):
        print(f"Downloading {os.path.basename(path)} from cloud...")
        response = requests.get(url)
        if response.status_code == 200:
            with open(path, "wb") as f:
                f.write(response.content)
            print(f"{os.path.basename(path)} downloaded successfully.")
        else:
            raise Exception(f"Failed to download file from {url}")

def load_all_data():
    """Load ML models and metadata lookup precisely once."""
    global movies, similarity, metadata_lookup
    
    if movies is not None:
        return
        
    try:
        # Construct absolute paths inside backend folder
        movies_path = os.path.join(BACKEND_DIR, "movies.pkl")
        similarity_path = os.path.join(BACKEND_DIR, "similarity.pkl")
        
        print(f"DEBUG: Backend directory: {BACKEND_DIR}")
        
        # 🔥 Download from cloud if not exists
        download_file(MOVIES_URL, movies_path)
        download_file(SIMILARITY_URL, similarity_path)

        # Load ML Files
        movies = pickle.load(open(movies_path, "rb"))
        similarity = pickle.load(open(similarity_path, "rb"))
        movies["title"] = movies["title"].str.lower()
        
        # Build Metadata Lookup
        metadata_lookup = _build_metadata_lookup()
        
        print("✅ SUCCESS: Data and ML models loaded.")

    except Exception as e:
        print(f"❌ CRITICAL ERROR: Failed to load data: {e}")
        import traceback
        traceback.print_exc()
        movies = None
        similarity = None