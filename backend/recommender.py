"""
recommender.py — Core recommendation logic.
"""

import os
import pickle

import numpy as np
from scipy.sparse import csr_matrix, hstack
from sklearn.metrics.pairwise import cosine_similarity

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

# Mood → preferred genre keywords added to query text
MOOD_GENRE_MAP = {
    "happy": ["Comedy", "Animation", "Romance"],
    "sad": ["Drama", "Romance"],
    "excited": ["Action", "Adventure", "Science Fiction"],
    "anxious": ["Thriller", "Mystery"],
    "relaxed": ["Documentary", "Family"],
    "bored": ["Action", "Comedy", "Crime"],
    "romantic": ["Romance", "Drama"],
}

# Attention → runtime range in minutes
ATTENTION_RUNTIME_MAP = {
    "low": (0, 100),
    "medium": (90, 135),
    "high": (120, 9999),
}

MOOD_REASON_MAP = {
    "happy": "light, feel-good",
    "sad": "emotionally resonant",
    "excited": "high-octane, adrenaline-filled",
    "anxious": "intense, suspenseful",
    "relaxed": "calm, contemplative",
    "bored": "fun, fast-paced",
    "romantic": "heartfelt, romantic",
}

# Normalize user-facing genre names to TMDB genre names in the dataset
GENRE_ALIAS = {
    "sci-fi": "Science Fiction",
    "scifi": "Science Fiction",
    "romance": "Romance",
    "action": "Action",
    "comedy": "Comedy",
    "drama": "Drama",
    "thriller": "Thriller",
    "horror": "Horror",
    "documentary": "Documentary",
    "animation": "Animation",
    "crime": "Crime",
}


def _normalize_genre(genre: str) -> str:
    """Map user-facing genre label to the TMDB genre label in the dataset."""
    return GENRE_ALIAS.get(genre.lower(), genre)


def _load(name: str):
    path = os.path.join(MODELS_DIR, name)
    with open(path, "rb") as f:
        return pickle.load(f)


class Recommender:
    def __init__(self):
        self.kmeans = _load("kmeans.pkl")
        self.tfidf = _load("tfidf.pkl")
        self.scaler = _load("scaler.pkl")
        self.pca = _load("pca.pkl")
        self.feature_matrix = _load("feature_matrix.pkl")  # dense ndarray
        self.df = _load("dataframe.pkl")

    def _build_user_vector(self, mood: str, genre: str, attention: str) -> np.ndarray:
        mood_genres = MOOD_GENRE_MAP.get(mood.lower(), [])
        normalized_genre = _normalize_genre(genre)
        all_genres = list(set(mood_genres + [normalized_genre]))
        # Repeat the requested genre 3× to boost its weight in TF-IDF space
        text = " ".join(all_genres) + f" {normalized_genre} {normalized_genre} {normalized_genre} " + mood.lower()

        tfidf_vec = self.tfidf.transform([text])  # sparse (1, 500)

        rt_min, rt_max = ATTENTION_RUNTIME_MAP.get(attention.lower(), (0, 9999))
        rt_mid = (rt_min + rt_max) / 2
        numeric_raw = np.array([[rt_mid, 7.0, 500.0]])
        numeric_scaled = self.scaler.transform(numeric_raw)

        user_vec = hstack([tfidf_vec, csr_matrix(numeric_scaled)]).toarray()
        return user_vec

    def _genre_mask(self, df, genre: str):
        """Return a boolean mask for rows that contain the normalized genre."""
        normalized = _normalize_genre(genre)
        return df["genres_list"].apply(
            lambda gl: normalized in gl if isinstance(gl, list) else False
        )

    def recommend(self, mood: str, genre: str, attention: str) -> dict:
        user_vec = self._build_user_vector(mood, genre, attention)

        # Predict cluster
        cluster_id = int(self.kmeans.predict(user_vec)[0])

        rt_min, rt_max = ATTENTION_RUNTIME_MAP.get(attention.lower(), (0, 9999))
        cluster_mask = self.df["cluster"] == cluster_id
        runtime_mask = (self.df["runtime"] >= rt_min) & (self.df["runtime"] <= rt_max)
        genre_mask = self._genre_mask(self.df, genre)

        # ── Filtering cascade: strict → relaxed one step at a time ─────────
        rating_mask = self.df["vote_average"] > 7.0

        # Try with high rating first
        # 1. Cluster + runtime + genre + high rating
        filtered = self.df[cluster_mask & runtime_mask & genre_mask & rating_mask]

        # 2. Cluster + genre + high rating
        if filtered.empty:
            filtered = self.df[cluster_mask & genre_mask & rating_mask]

        # 3. Genre + runtime + high rating
        if filtered.empty:
            filtered = self.df[runtime_mask & genre_mask & rating_mask]

        # 4. Genre + high rating
        if filtered.empty:
            filtered = self.df[genre_mask & rating_mask]
            
        # Fall back to without high rating filter if no good high rated movies
        # 5. Cluster + runtime + genre
        if filtered.empty:
            filtered = self.df[cluster_mask & runtime_mask & genre_mask]

        # 6. Drop runtime constraint but keep genre
        if filtered.empty:
            filtered = self.df[cluster_mask & genre_mask]

        # 7. Expand to ALL clusters but keep genre + runtime
        if filtered.empty:
            filtered = self.df[runtime_mask & genre_mask]

        # 8. Genre only (across all clusters, all runtimes)
        if filtered.empty:
            filtered = self.df[genre_mask]

        # 9. Ultimate fallback — should almost never hit this
        if filtered.empty:
            filtered = self.df[cluster_mask]
        if filtered.empty:
            filtered = self.df

        # ── Cosine similarity + weighted-random pick from top 10 ────────────
        cluster_features = self.feature_matrix[filtered.index]
        sims = cosine_similarity(user_vec, cluster_features)[0]

        top_n = min(10, len(sims))
        top_local_indices = np.argsort(sims)[::-1][:top_n]
        top_sims = sims[top_local_indices]

        # Softmax with temperature — higher-similarity films more likely but not guaranteed
        top_sims_exp = np.exp((top_sims - top_sims.max()) * 8)
        weights = top_sims_exp / top_sims_exp.sum()
        chosen_pos = np.random.choice(len(top_local_indices), p=weights)

        best_local_idx = int(top_local_indices[chosen_pos])
        best_global_idx = filtered.index[best_local_idx]
        similarity = float(sims[best_local_idx])

        row = self.df.loc[best_global_idx]

        mood_desc = MOOD_REASON_MAP.get(mood.lower(), mood.lower())
        rt_label = "short" if rt_max <= 100 else "medium" if rt_max <= 135 else "longer"
        reason = (
            f"Matched because you're feeling {mood.lower()} and wanted {genre} — "
            f"this film sits in a cluster of {mood_desc} movies "
            f"with {rt_label} runtimes."
        )

        tmdb_id = (
            int(row["id"])
            if "id" in row and not (isinstance(row["id"], float) and np.isnan(row["id"]))
            else None
        )

        return {
            "title": row["title"],
            "genres": row["genres_list"] if isinstance(row["genres_list"], list) else [],
            "overview": _truncate(str(row["overview"])),
            "runtime": int(row["runtime"]) if not np.isnan(row["runtime"]) else 0,
            "rating": float(round(row["vote_average"], 1)),
            "cluster_id": cluster_id,
            "similarity": float(round(similarity * 100, 1)),
            "reason": reason,
            "tmdb_id": tmdb_id,
        }


def _truncate(text: str, max_sentences: int = 3) -> str:
    """Return at most max_sentences sentences."""
    sentences = text.replace("  ", " ").split(". ")
    return ". ".join(sentences[:max_sentences]) + ("." if len(sentences) > max_sentences else "")
