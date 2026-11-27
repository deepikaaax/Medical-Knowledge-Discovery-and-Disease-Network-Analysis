"""
Helper script to start the FastAPI backend server.
Runs on http://127.0.0.1:8000
"""
import sys
import os
from pathlib import Path
import uvicorn

# Ensure backend directory is in sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR / "backend"))

if __name__ == "__main__":
    print("=================================================================")
    print("Starting Medical Knowledge Discovery Backend API...")
    print("API Documentation: http://127.0.0.1:8000/docs")
    print("Application Root:  http://127.0.0.1:8000/")
    print("=================================================================")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
