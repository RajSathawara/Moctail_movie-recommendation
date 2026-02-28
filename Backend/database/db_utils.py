from .db import get_db_connection

def add_search_history(user_id, movie_title):
    """Log a search query to the database."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "INSERT INTO search_history (user_id, movie_title) VALUES (?, ?)"
        import os
        if os.getenv("DATABASE_URL"): query = query.replace("?", "%s")
        cursor.execute(query, (user_id, movie_title))
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"DB Error (add_search_history): {e}")
        return False

def get_recent_searches(user_id, limit=3):
    """Retrieve recent search queries for a user."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT movie_title FROM search_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?"
        import os
        if os.getenv("DATABASE_URL"): query = query.replace("?", "%s")
        cursor.execute(query, (user_id, limit))
        results = [row["movie_title"] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"DB Error (get_recent_searches): {e}")
        return []
