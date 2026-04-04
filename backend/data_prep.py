"""
data_prep.py — Load and preprocess the TMDB 5000 movies dataset.
"""

import ast
import json
import os
import numpy as np
import pandas as pd
from scipy.sparse import hstack
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler


DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "tmdb_5000_movies.csv")


def parse_genres(genres_str: str) -> list[str]:
    """Parse the JSON-like genres column into a list of genre name strings."""
    try:
        genres = ast.literal_eval(genres_str)
        return [g["name"] for g in genres if isinstance(g, dict)]
    except Exception:
        return []


def load_and_prepare() -> tuple[pd.DataFrame, object, TfidfVectorizer, MinMaxScaler]:
    """
    Load the CSV, engineer features, vectorize, and return:
      df, feature_matrix (sparse), tfidf, scaler
    """
    df = pd.read_csv(DATA_PATH)

    # Keep only relevant columns and drop rows with critical NaN values
    df = df[["id", "title", "genres", "overview", "runtime", "vote_average", "vote_count"]].copy()
    df.dropna(subset=["title", "overview"], inplace=True)
    df["genres_list"] = df["genres"].fillna("[]").apply(parse_genres)
    df["genres_str"] = df["genres_list"].apply(lambda x: " ".join(x))

    # Combined text feature
    df["text_features"] = df["genres_str"] + " " + df["overview"].fillna("")

    # Fill numeric NaN
    df["runtime"] = df["runtime"].fillna(df["runtime"].median())
    df["vote_average"] = df["vote_average"].fillna(0.0)
    df["vote_count"] = df["vote_count"].fillna(0.0)

    df.reset_index(drop=True, inplace=True)

    # TF-IDF vectorization
    tfidf = TfidfVectorizer(max_features=500, stop_words="english")
    tfidf_matrix = tfidf.fit_transform(df["text_features"])

    # Numeric normalization
    numeric = df[["runtime", "vote_average", "vote_count"]].values.astype(np.float32)
    scaler = MinMaxScaler()
    numeric_scaled = scaler.fit_transform(numeric)

    # Concatenate
    from scipy.sparse import csr_matrix
    feature_matrix = hstack([tfidf_matrix, csr_matrix(numeric_scaled)])

    return df, feature_matrix, tfidf, scaler
