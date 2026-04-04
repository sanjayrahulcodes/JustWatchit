<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="scikit-learn" />
</div>

<br>

<h1 align="center">🎬 JustWatchIt — AI Movie Recommender</h1>

<p align="center">
  <b>No more endless scrolling. Tell the AI how you feel, and it finds your perfect film.</b><br>
  A full-stack web application powered by Unsupervised Machine Learning.
</p>

---

## ✨ Features

- **🧠 Machine Learning Pipeline**: Built from scratch using KMeans Clustering and TF-IDF Vectorization on a dataset of 5,000 top movies. Extracts text features from movie overviews and genres to calculate exact cluster placements.
- **🎯 Dynamic Taste Matching**: Uses Cosine Similarity combined with an advanced Fallback Filtering Cascade to prioritize exact mood hits and highly-reviewed films (`>7.0 rating`). Every result is uniquely fresh.
- **📊 "How the Model Thinks" Module**: A live, interactive pipeline visualizer and 2D Scatter Plot mapped with Principal Component Analysis (PCA) directly in the UI. Watch the exact math that recommended your film.
- **📋 Persistent Watchlist**: Full interactive section to save, track, filter, and clear your movie backlog locally.
- **🌓 Fluent Design System**: Smooth animations, dynamic mood-palette UI, and dark mode toggles out of the box.

---

## 🏗️ Architecture Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend UI** | React, Vite, Tailwind CSS, Chart.js (`react-chartjs-2`) |
| **Backend API** | FastAPI, Uvicorn, Python 3.10+ |
| **ML Engine** | `scikit-learn`, Pandas, NumPy, SciPy |
| **Poster API Integration** | Real-time fetching via OMDb with fallback TMDB capabilities |

---

## 🚀 How to Run Locally

Because the backend runs actual Machine Learning models, the application is divided into two parts. You can run both locally in two separate terminals.

### 1. Start the Machine Learning Backend

Open terminal #1:

```bash
cd backend
# Create and activate a Virtual Environment (Recommended)
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate # Mac/Linux

# Install the Python requirements
pip install -r requirements.txt

# Run the training script (Takes ~30-60 secs. Generates ML Clusters)
python train_model.py

# Launch the FastAPI Web Server
uvicorn main:app --reload --port 8000
```
*API is live at `http://localhost:8000`*

### 2. Start the React Frontend

Open terminal #2:

```bash
cd frontend

# Install the Node packages
npm install

# Start the Vite Dev Server
npm run dev
```
*Web App is live at `http://localhost:5173`*

---

## 🌍 How to Deploy to Production (Free)

The codebase has already been fully optimized for production deployment, complete with a `Procfile` and dynamic `VITE_API_URL` environment injection.

### Deploy the Backend to Render.com
Render natively supports Python applications and handles our ML model installation automatically.
1. Connect this repo to **Render.com** (New > Web Service)
2. Use **Build Command**: `pip install -r requirements.txt && cd backend && python train_model.py`
3. Use **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

### Deploy the Frontend to Netlify
1. Connect this repo to **Netlify**
2. Important: In Environmental Variables, add `VITE_API_URL` pointing to your new `https://----.onrender.com` backend URL.
3. Use **Build Command**: `npm run build`
4. Use **Publish Directory**: `dist`

---
> *Dataset explicitly included (`data/tmdb_5000_movies.csv`) to trigger automated CI/CD builds on deployment.*
