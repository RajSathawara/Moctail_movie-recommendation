🎬 Moctail — AI Powered Movie Recommendation System

Moctail is a full-stack AI-powered movie recommendation platform that delivers intelligent, content-based movie suggestions using TF-IDF vectorization and Cosine Similarity.

The project showcases end-to-end software engineering — from machine learning model design to secure backend API development and modern frontend UI implementation.


## 🌐 Live Demo

Coming Soon — Deployment in Progress 🚀


🚀 Tech Stack

🔹  Frontend

 React (Vite)
 React Router
 Axios
 Tailwind CSS (custom cinematic UI)

🔹 Backend

 Python
 Flask
 SQLite
 RESTful API architecture

🔹 Machine Learning

 Scikit-learn
 TF-IDF Vectorization
 Cosine Similarity
 Content-based recommendation system

🔹 Tools

 Git & GitHub
 Postman (API Testing)


✨ Key Features :

🔐 User Authentication (Register & Login with hashed passwords)
🎯 Intelligent Movie Recommendations
🔎 Smart Fuzzy Search (Typo Tolerance)
⭐ Top Rated Filtering
📊 Rating & Vote-based Ranking
🎨 Modern Cinematic UI Design
⚡ Fast API Communication
📦 Clean Modular Architecture


🧠 How Recommendation Works

1. Movie metadata (overview, genres, keywords, cast, director) is merged.
2. Tags are created and vectorized using TF-IDF.
3. Cosine similarity is computed between movies.
4. Top similar movies are ranked by rating and vote count.
5. Results are returned via REST API to frontend.


📁 Project Structure
Moctail/
 ├── backend/
 │   ├── app.py
 │   ├── recommendation.py
 │   ├── routes/
 │   ├── utils/
 │   └── database/
 │
 ├── frontend/
 │   ├── src/
 │   ├── components/
 │   ├── pages/
 │   └── services/
 │
 └── README.md


⚙️ Setup Instructions

1️⃣ Clone Repository

git clone https://github.com/yourusername/moctail-ai-movie-recommendation.git
cd moctail-ai-movie-recommendation

2️⃣ Backend Setup

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py

Backend runs on:

http://127.0.0.1:5000

3️⃣ Frontend Setup

cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173


🎯 Learning Outcomes

This project demonstrates:

* Full-stack development workflow
* REST API integration
* Authentication & security practices
* Machine learning model deployment
* Debugging system-level issues
* Production-ready project structuring
* Git version control best practices

📌 Future Improvements

--> JWT-based authentication
--> Role-based access
--> Deploy to cloud (Render / Vercel)
--> Add user-based recommendation engine
--> Improve recommendation personalization

## 👨‍💻 Author

**Raj Sathawara**  
BCA Student | Full-Stack & AI Engineering Enthusiast  