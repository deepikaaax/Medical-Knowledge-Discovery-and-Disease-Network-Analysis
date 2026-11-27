import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database import init_db
from .routes import diseases, network, comparison, genes, analytics, research, stats

app = FastAPI(
    title="Web-Based Medical Knowledge Discovery and Disease Network Analysis API",
    description="Educational biomedical knowledge discovery and network analysis platform.",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite dev server or custom ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(stats.router)
app.include_router(diseases.router)
app.include_router(network.router)
app.include_router(comparison.router)
app.include_router(genes.router)
app.include_router(analytics.router)
app.include_router(research.router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Medical Knowledge Discovery API",
        "version": "1.0.0"
    }

# Mount static frontend production build if available
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Don't intercept API endpoints or docs
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi"):
            return None
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
