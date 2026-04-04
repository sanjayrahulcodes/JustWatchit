"""
main.py — FastAPI backend for the Movie Recommender.
"""

import json
import os
from contextlib import asynccontextmanager
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from recommender import Recommender

# ─── Globals ────────────────────────────────────────────────────────────────
recommender: Recommender | None = None
cluster_viz: list[dict] = []

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public")


# ─── Lifespan ────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global recommender, cluster_viz
    print("Loading models…")
    try:
        recommender = Recommender()
        print("✅ Models loaded.")
    except Exception as e:
        print(f"⚠️  Could not load models: {e}. Run train_model.py first.")

    viz_path = os.path.join(PUBLIC_DIR, "cluster_viz.json")
    if os.path.exists(viz_path):
        with open(viz_path, "r", encoding="utf-8") as f:
            cluster_viz = json.load(f)
        print(f"✅ cluster_viz.json loaded ({len(cluster_viz)} records).")
    else:
        print("⚠️  cluster_viz.json not found. Run train_model.py first.")

    yield
    print("Shutting down…")


# ─── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(title="Movie Recommender API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Schemas ─────────────────────────────────────────────────────────────────
class RecommendRequest(BaseModel):
    mood: str
    genre: str
    attention: str


# ─── Helpers ─────────────────────────────────────────────────────────────────
async def fetch_poster(title: str, tmdb_id: int | None = None) -> str:
    """
    Try to get a poster URL:
      1. OMDb free endpoint (works without an API key for most titles)
      2. TMDB (if TMDB_API_KEY env var is set)
      3. Return "" — frontend shows a styled gradient fallback card
    """
    # --- OMDb free ---
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(
                "https://www.omdbapi.com/",
                params={"apikey": "trilogy", "t": title, "type": "movie"},
            )
            data = r.json()
            poster = data.get("Poster", "")
            if poster and poster != "N/A":
                return poster
    except Exception:
        pass

    # --- TMDB (only if key provided) ---
    if TMDB_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                if tmdb_id:
                    r = await client.get(
                        f"https://api.themoviedb.org/3/movie/{tmdb_id}",
                        params={"api_key": TMDB_API_KEY},
                    )
                    data = r.json()
                    path = data.get("poster_path", "")
                else:
                    r = await client.get(
                        "https://api.themoviedb.org/3/search/movie",
                        params={"api_key": TMDB_API_KEY, "query": title},
                    )
                    data = r.json()
                    results = data.get("results", [])
                    path = results[0].get("poster_path", "") if results else ""
                if path:
                    return f"https://image.tmdb.org/t/p/w500{path}"
        except Exception:
            pass

    return ""


# ─── Endpoints ───────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/clusters")
async def clusters():
    return cluster_viz


@app.post("/recommend")
async def recommend(req: RecommendRequest):
    if recommender is None:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded. Run train_model.py first.",
        )
    result = recommender.recommend(req.mood, req.genre, req.attention)
    poster_url = await fetch_poster(result["title"], result.get("tmdb_id"))
    result["poster_url"] = poster_url
    return result
