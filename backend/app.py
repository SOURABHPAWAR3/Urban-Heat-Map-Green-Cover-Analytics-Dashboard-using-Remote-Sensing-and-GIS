from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {"status": "Backend Running - IIRS Project"}

# 🔥 New Heatmap API
@app.route("/heatmap")
def heatmap():
    # Dummy data for now (later we’ll replace with real NDVI/LST data)
    data = [
        {"lat": 28.6139, "lon": 77.2090, "temp": 34, "ndvi": 0.25},  # Delhi
        {"lat": 19.0760, "lon": 72.8777, "temp": 32, "ndvi": 0.35},  # Mumbai
        {"lat": 13.0827, "lon": 80.2707, "temp": 33, "ndvi": 0.40},  # Chennai
        {"lat": 22.5726, "lon": 88.3639, "temp": 31, "ndvi": 0.28},  # Kolkata
    ]
    return jsonify({"heatmap": data})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
