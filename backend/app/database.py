import sqlite3
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "medical_discovery.db"

def get_db_connection():
    """Returns a SQLite connection with row factory configured."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    """Initializes the database schema if tables do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS diseases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        code TEXT,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS genes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        chromosome TEXT,
        description TEXT
    );

    CREATE TABLE IF NOT EXISTS symptoms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        category TEXT,
        description TEXT
    );

    CREATE TABLE IF NOT EXISTS disease_genes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        disease_id INTEGER NOT NULL,
        gene_id INTEGER NOT NULL,
        evidence_type TEXT DEFAULT 'Curated Literature',
        source TEXT DEFAULT 'NCBI / Open Targets (Sample)',
        FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE,
        FOREIGN KEY (gene_id) REFERENCES genes(id) ON DELETE CASCADE,
        UNIQUE(disease_id, gene_id)
    );

    CREATE TABLE IF NOT EXISTS disease_symptoms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        disease_id INTEGER NOT NULL,
        symptom_id INTEGER NOT NULL,
        frequency TEXT DEFAULT 'Common',
        FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE,
        FOREIGN KEY (symptom_id) REFERENCES symptoms(id) ON DELETE CASCADE,
        UNIQUE(disease_id, symptom_id)
    );

    CREATE TABLE IF NOT EXISTS disease_relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        disease_id_1 INTEGER NOT NULL,
        disease_id_2 INTEGER NOT NULL,
        shared_genes_count INTEGER NOT NULL,
        jaccard_score REAL NOT NULL,
        relationship_type TEXT DEFAULT 'Shared Genetic Etiology',
        FOREIGN KEY (disease_id_1) REFERENCES diseases(id) ON DELETE CASCADE,
        FOREIGN KEY (disease_id_2) REFERENCES diseases(id) ON DELETE CASCADE,
        UNIQUE(disease_id_1, disease_id_2)
    );

    CREATE TABLE IF NOT EXISTS research_papers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pmid TEXT,
        title TEXT NOT NULL,
        authors TEXT,
        journal TEXT,
        year INTEGER,
        url TEXT,
        disease_id INTEGER,
        FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        disease_id INTEGER,
        searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE SET NULL
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {DB_PATH}")
