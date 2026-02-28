import sys
import os
import pickle
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
movies_path = os.path.join(BASE_DIR, "movies.pkl")

movies = pickle.load(open(movies_path, "rb"))
data = {
    "columns": list(movies.columns),
    "first_row": movies.iloc[0].to_dict()
}
with open(os.path.join(BASE_DIR, "movies_info.json"), "w") as f:
    json.dump(data, f, indent=4)
