from flask import Blueprint, request, jsonify
from database.db import get_db_connection
from utils.security import hash_password
from utils.security import hash_password, check_password
import jwt
import datetime
import os

auth = Blueprint("auth", __name__)


@auth.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"error": "Invalid or missing JSON"}), 400

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            return jsonify({"error": "All fields are required"}), 400

        # hash password
        hashed_password = hash_password(password)

        conn = get_db_connection()
        cursor = conn.cursor()

        query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
        if os.getenv("DATABASE_URL"): query = query.replace("?", "%s")
        cursor.execute(query, (name, email, hashed_password))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        print("ERROR OCCURRED:", e)  # 🔥 Important for debugging
        return jsonify({"error": str(e)}), 500
    

@auth.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        query = "SELECT id, name, email, password FROM users WHERE email = ?"
        if os.getenv("DATABASE_URL"): query = query.replace("?", "%s")
        cursor.execute(query, (email,))
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if not user:
            return jsonify({"error": "User not found"}), 404

        # user tuple structure for SQLite:
        # (id, name, email, password)
        stored_password = user[3]

        if not check_password(password, stored_password):
            return jsonify({"error": "Invalid password"}), 401

        token = jwt.encode(
            {
                "user_id": user["id"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
            },
            os.getenv("SECRET_KEY"),
            algorithm="HS256"
        )
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"]
            }
        }), 200

    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({"error": str(e)}), 500