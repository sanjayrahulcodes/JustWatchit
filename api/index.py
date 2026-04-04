import os
import sys

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

# Important: Vercel expects the app variable to be available at api.index.app
from main import app
