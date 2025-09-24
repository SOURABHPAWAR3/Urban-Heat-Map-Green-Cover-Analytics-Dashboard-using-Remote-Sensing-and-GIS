from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 🔧 Dummy city data (can be replaced with real satellite/API data later)
city_data = [
    {"city": "Delhi", "lat": 28.6139, "lon": 77.2090, "temp": 34, "ndvi": 0.25},
    {"city": "Mumbai", "lat": 19.0760, "lon": 72.8777, "temp": 32, "ndvi": 0.35},
    {"city": "Chennai", "lat": 13.0827, "lon": 80.2707, "temp": 33, "ndvi": 0.40},
    {"city": "Kolkata", "lat": 22.5726, "lon": 88.3639, "temp": 31, "ndvi": 0.28},
]

@app.route("/")
def home():
    return {"status": "Backend Running - IIRS Project"}

# ✅ New API route with city names (for dynamic markers in frontend)
@app.route("/api/cities")
def get_cities():
    return jsonify(city_data)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
