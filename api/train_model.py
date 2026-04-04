"""
train_model.py — Train KMeans, run PCA, and save all artefacts.

Run from the backend/ directory:
    python train_model.py
"""

import json
import os
import pickle
import random

import numpy as np
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

from data_prep import load_and_prepare

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public")
os.makedirs(PUBLIC_DIR, exist_ok=True)


def save_pkl(obj, name: str):
    path = os.path.join(MODELS_DIR, name)
    with open(path, "wb") as f:
        pickle.dump(obj, f)
    print(f"Saved {path}")


def main():
    print("Loading and preparing data…")
    df, feature_matrix, tfidf, scaler = load_and_prepare()

    print(f"Feature matrix shape: {feature_matrix.shape}")

    print("Training KMeans (k=20)…")
    kmeans = KMeans(n_clusters=20, random_state=42, n_init=10)
    kmeans.fit(feature_matrix)
    df["cluster"] = kmeans.labels_

    print("Running PCA (2 components)…")
    pca = PCA(n_components=2, random_state=42)
    feature_dense = feature_matrix.toarray()
    pca_result = pca.fit_transform(feature_dense)
    df["pca_x"] = pca_result[:, 0]
    df["pca_y"] = pca_result[:, 1]

    print("Saving model artefacts…")
    save_pkl(kmeans, "kmeans.pkl")
    save_pkl(tfidf, "tfidf.pkl")
    save_pkl(scaler, "scaler.pkl")
    save_pkl(pca, "pca.pkl")
    save_pkl(feature_dense, "feature_matrix.pkl")
    save_pkl(df, "dataframe.pkl")

    print("Generating cluster_viz.json (500 sampled movies)…")
    sample_size = min(500, len(df))
    sampled = df.sample(n=sample_size, random_state=42)

    viz_data = []
    for _, row in sampled.iterrows():
        viz_data.append(
            {
                "title": row["title"],
                "cluster": int(row["cluster"]),
                "pca_x": float(row["pca_x"]),
                "pca_y": float(row["pca_y"]),
                "genres_str": row["genres_str"],
            }
        )

    viz_path = os.path.join(PUBLIC_DIR, "cluster_viz.json")
    with open(viz_path, "w", encoding="utf-8") as f:
        json.dump(viz_data, f)
    print(f"Saved {viz_path}")

    print("\n✅ Training complete!")


if __name__ == "__main__":
    main()
