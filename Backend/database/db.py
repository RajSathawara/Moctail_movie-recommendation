import sqlite3
import psycopg2
import psycopg2.extras
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.getenv("DATABASE_NAME", "moctail.db")
DB_PATH = os.path.join(BASE_DIR, "..", DB_NAME)

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    if DATABASE_URL:
        # PostgreSQL connection
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.DictCursor)
        return conn
    else:
        # SQLite connection
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn