import pandas as pd
import numpy as np
import ast
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ==============================
# 1️⃣ Load Datasets
# ==============================

movies = pd.read_csv('dataset/tmdb_5000_movies.csv')
credits = pd.read_csv('dataset/tmdb_5000_credits.csv')

# ==============================
# 2️⃣ Merge Datasets
# ==============================

movies = movies.merge(credits, on='title')

# ==============================
# 3️⃣ Select Important Columns
# ==============================

movies = movies[['movie_id','title','overview','genres','keywords','cast','crew','vote_average','vote_count']]

# Drop null values
movies.dropna(inplace=True)

# ==============================
# 4️⃣ Convert JSON Columns
# ==============================

def convert(text):
    L = []
    for i in ast.literal_eval(text):
        L.append(i['name'])
    return L

movies['genres'] = movies['genres'].apply(convert)
movies['keywords'] = movies['keywords'].apply(convert)

# ==============================
# 5️⃣ Extract Top 3 Cast Members
# ==============================

def convert_cast(text):
    L = []
    counter = 0
    for i in ast.literal_eval(text):
        if counter != 3:
            L.append(i['name'])
            counter += 1
        else:
            break
    return L

movies['cast'] = movies['cast'].apply(convert_cast)

# ==============================
# 6️⃣ Extract Director
# ==============================

def fetch_director(text):
    L = []
    for i in ast.literal_eval(text):
        if i['job'] == 'Director':
            L.append(i['name'])
            break
    return L

movies['crew'] = movies['crew'].apply(fetch_director)

# ==============================
# 7️⃣ Remove Spaces (Text Cleaning)
# ==============================

def remove_space(text_list):
    return [i.replace(" ", "") for i in text_list]

movies['genres'] = movies['genres'].apply(remove_space)
movies['keywords'] = movies['keywords'].apply(remove_space)
movies['cast'] = movies['cast'].apply(remove_space)
movies['crew'] = movies['crew'].apply(remove_space)

# ==============================
# 8️⃣ Create Tags Column
# ==============================

movies['overview'] = movies['overview'].apply(lambda x: x.split())

movies['tags'] = movies['overview'] + movies['genres'] + movies['keywords'] + movies['cast'] + movies['crew']

movies['tags'] = movies['tags'].apply(lambda x: " ".join(x))

# Final dataframe
new_df = movies[['movie_id','title','tags','vote_average','vote_count']]

# ==============================
# 9️⃣ Apply TF-IDF Vectorization
# ==============================

tfidf = TfidfVectorizer(stop_words='english', max_features=5000)

vectors = tfidf.fit_transform(new_df['tags']).toarray()

# ==============================
# 🔟 Compute Cosine Similarity
# ==============================

similarity = cosine_similarity(vectors)

# ==============================
# 1️⃣1️⃣ Recommendation Function
# ==============================

# ==============================
# 🔥 Updated Professional Recommendation Function
# ==============================

import difflib

def recommend(movie_name, min_rating=0, min_votes=0):

    movie_name = movie_name.lower()
    titles = new_df['title']
    titles_lower = titles.str.lower().tolist()

    # 🔥 Find closest match
    closest_matches = difflib.get_close_matches(movie_name, titles_lower, n=1, cutoff=0.6)

    if not closest_matches:
        return {"error": "Movie not found in database"}

    matched_title = closest_matches[0]

    movie_index = titles_lower.index(matched_title)
    distances = similarity[movie_index]

    movies_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:50]

    recommendations = []

    for i in movies_list:
        movie = new_df.iloc[i[0]]

        if movie.vote_average >= min_rating and movie.vote_count >= min_votes:
            recommendations.append({
                "title": str(movie.title),
                "rating": float(movie.vote_average),
                "votes": int(movie.vote_count)
            })

        if len(recommendations) == 10:
            break

    return {
        "searched_movie": titles.iloc[movie_index],
        "recommendations": recommendations
    }


# ==============================
# 🔥 Test Recommendation
# ==============================

if __name__ == "__main__":
    result = recommend("dark knight", min_rating=6, min_votes=1000)
    print(result)
