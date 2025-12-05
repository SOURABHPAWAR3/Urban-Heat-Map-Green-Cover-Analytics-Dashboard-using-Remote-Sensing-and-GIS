from flask import Flask, jsonify, request
from flask_cors import CORS
from extensions import db, jwt
from auth.routes import auth_bp
import requests
import datetime
import numpy as np

MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

CITY_SERIES = [
    {
        "city": "Delhi",
        "lat": 28.6139,
        "lon": 77.2090,
        "temp": [16, 18, 24, 31, 35, 35, 36, 34, 32, 28, 22, 18],
        "ndvi": [0.28, 0.3, 0.33, 0.38, 0.42, 0.36, 0.32, 0.3, 0.34, 0.36, 0.31, 0.29],
    },
    {
        "city": "Mumbai",
        "lat": 19.0760,
        "lon": 72.8777,
        "temp": [24, 26, 28, 30, 31, 32, 29, 28, 28, 29, 27, 25],
        "ndvi": [0.45, 0.46, 0.44, 0.42, 0.4, 0.38, 0.5, 0.54, 0.55, 0.52, 0.48, 0.46],
    },
    {
        "city": "Chennai",
        "lat": 13.0827,
        "lon": 80.2707,
        "temp": [25, 27, 30, 33, 35, 36, 35, 34, 33, 31, 28, 26],
        "ndvi": [0.3, 0.32, 0.34, 0.36, 0.35, 0.33, 0.31, 0.32, 0.34, 0.36, 0.33, 0.31],
    },
    {
        "city": "Kolkata",
        "lat": 22.5726,
        "lon": 88.3639,
        "temp": [18, 22, 28, 32, 34, 35, 34, 33, 32, 30, 25, 20],
        "ndvi": [0.4, 0.42, 0.45, 0.48, 0.44, 0.4, 0.38, 0.39, 0.41, 0.43, 0.44, 0.4],
    },
    {
        "city": "Bengaluru",
        "lat": 12.9716,
        "lon": 77.5946,
        "temp": [21, 23, 27, 30, 31, 29, 28, 27, 27, 26, 24, 22],
        "ndvi": [0.5, 0.52, 0.55, 0.58, 0.57, 0.54, 0.53, 0.55, 0.58, 0.6, 0.57, 0.53],
    },
]


def fetch_nasa_temperature(lat, lon, start, end):
    """
    Fetch NASA POWER daily 2m air temperature.
    Returns list of {"date": str, "temp": float} sorted by date.
    """
    base_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    params = {
        "parameters": "T2M",
        "community": "AG",
        "longitude": lon,
        "latitude": lat,
        "start": start,
        "end": end,
        "format": "JSON",
    }
    resp = requests.get(base_url, params=params, timeout=20)
    resp.raise_for_status()
    data = resp.json()
    t2m_dict = data.get("properties", {}).get("parameter", {}).get("T2M", {})

    series = [{"date": d, "temp": float(v)} for d, v in t2m_dict.items()]
    series.sort(key=lambda x: x["date"])
    return series


def create_app():
    app = Flask(__name__)

    # --- Configuration ---
    app.config["SECRET_KEY"] = "mysecret123"
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = "jwt-secret-456"

    db.init_app(app)
    jwt.init_app(app)

    # --- Enable CORS ---
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ]
    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
    )

    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get("Origin")
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Headers"] = (
                "Content-Type, Authorization"
            )
            response.headers["Access-Control-Allow-Methods"] = (
                "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            )
        return response

    # --- Register Blueprints ---
    app.register_blueprint(auth_bp, url_prefix="/api")

    # --- Create Tables ---
    with app.app_context():
        db.create_all()

    # --- Root Endpoint ---
    @app.route("/")
    def home():
        return {"message": "Flask backend is running successfully!"}

    # --- Existing Heatmap Data API ---
    @app.route("/api/cities")
    def get_cities():
        return jsonify(
            [
                {
                    "city": c["city"],
                    "lat": c["lat"],
                    "lon": c["lon"],
                    "temp": c["temp"][5],  # June snapshot
                    "ndvi": c["ndvi"][5],
                }
                for c in CITY_SERIES
            ]
        )

    @app.route("/api/cities/timeseries")
    def get_city_timeseries():
        payload = []
        for c in CITY_SERIES:
            payload.append(
                {
                    "city": c["city"],
                    "lat": c["lat"],
                    "lon": c["lon"],
                    "timeSeries": {
                        "dates": MONTHS,
                        "temp": c["temp"],
                        "ndvi": c["ndvi"],
                    },
                }
            )
        summary = {
            "warmestCity": max(payload, key=lambda x: max(x["timeSeries"]["temp"])),
            "greenestCity": max(payload, key=lambda x: max(x["timeSeries"]["ndvi"])),
        }
        return jsonify({"months": MONTHS, "cities": payload, "summary": summary})

    # --- NASA POWER Temperature API (with -999 cleanup) ---
    @app.route("/api/temperature")
    def api_temperature():
        """
        Returns NASA POWER daily temperature for given lat/lon & date range.
        If no start/end provided, defaults to last 7 days.
        Filters out missing values (-999) and adds synthetic NDVI.
        """
        lat = request.args.get("lat", type=float, default=28.6139)
        lon = request.args.get("lon", type=float, default=77.2090)
        start = request.args.get("start")
        end = request.args.get("end")

        # If no start/end, use last 7 days
        if not start or not end:
            end_date = datetime.date.today()
            start_date = end_date - datetime.timedelta(days=6)
            start = start_date.strftime("%Y%m%d")
            end = end_date.strftime("%Y%m%d")

        try:
            raw_series = fetch_nasa_temperature(lat, lon, start, end)
        except requests.RequestException as e:
            return (
                jsonify(
                    {"message": "NASA API request failed", "error": str(e)}
                ),
                502,
            )
        except Exception as e:
            return (
                jsonify(
                    {"message": "Internal server error", "error": str(e)}
                ),
                500,
            )

        # 🔧 Filter out missing / invalid values (NASA uses -999/-99 as no-data flags)
        cleaned_series = [
            item for item in raw_series
            if item["temp"] > -90 and item["temp"] < 60  # keep reasonable temps
        ]

        if not cleaned_series:
            return (
                jsonify(
                    {
                        "message": "No valid temperature data available for this range",
                        "lat": lat,
                        "lon": lon,
                        "start": start,
                        "end": end,
                    }
                ),
                502,
            )

        # Build synthetic NDVI aligned with cleaned temps
        for item in cleaned_series:
            t = item["temp"]
            normalized = max(0.0, min(1.0, (40 - t) / 30.0))
            item["ndvi"] = round(0.2 + normalized * 0.6, 3)

        return jsonify(
            {
                "lat": lat,
                "lon": lon,
                "start": start,
                "end": end,
                "series": cleaned_series,
            }
        )

    # --- ML Forecast API ---
    @app.route("/api/predict")
    def api_predict():
        """
        Predicts temperature and NDVI for the next N months using historical data.
        Works for any city by lat/lon, or by city name for predefined cities.
        """
        city_name = request.args.get("city", "").strip()
        lat = request.args.get("lat", type=float)
        lon = request.args.get("lon", type=float)
        months_ahead = request.args.get("months_ahead", type=int, default=6)

        city_data = None
        
        # Try to find by city name first (for predefined cities)
        if city_name:
            for c in CITY_SERIES:
                if c["city"].lower() == city_name.lower():
                    city_data = c
                    break
        
        # If not found by name, try to use lat/lon (for searched cities)
        if not city_data and lat is not None and lon is not None:
            # Fetch recent NASA data to create a baseline
            try:
                end_date = datetime.date.today()
                start_date = end_date - datetime.timedelta(days=365)  # Last year
                start = start_date.strftime("%Y%m%d")
                end = end_date.strftime("%Y%m%d")
                
                raw_series = fetch_nasa_temperature(lat, lon, start, end)
                if raw_series:
                    # Group by month and calculate averages
                    monthly_data = {}
                    for item in raw_series:
                        date_str = item["date"]
                        month = int(date_str[4:6]) - 1  # 0-11
                        if month not in monthly_data:
                            monthly_data[month] = {"temps": [], "ndvis": []}
                        monthly_data[month]["temps"].append(item["temp"])
                        # Synthetic NDVI from temp
                        t = item["temp"]
                        normalized = max(0.0, min(1.0, (40 - t) / 30.0))
                        ndvi_val = 0.2 + normalized * 0.6
                        monthly_data[month]["ndvis"].append(ndvi_val)
                    
                    # Create 12-month averages
                    hist_temp = []
                    hist_ndvi = []
                    for m in range(12):
                        if m in monthly_data:
                            hist_temp.append(sum(monthly_data[m]["temps"]) / len(monthly_data[m]["temps"]))
                            hist_ndvi.append(sum(monthly_data[m]["ndvis"]) / len(monthly_data[m]["ndvis"]))
                        else:
                            # Fallback: use average of all available data
                            all_temps = [t for month_data in monthly_data.values() for t in month_data["temps"]]
                            all_ndvis = [n for month_data in monthly_data.values() for n in month_data["ndvis"]]
                            hist_temp.append(sum(all_temps) / len(all_temps) if all_temps else 25)
                            hist_ndvi.append(sum(all_ndvis) / len(all_ndvis) if all_ndvis else 0.4)
                    
                    # Create a synthetic city_data
                    city_data = {
                        "city": city_name or f"Location ({lat}, {lon})",
                        "temp": hist_temp if len(hist_temp) == 12 else [25] * 12,
                        "ndvi": hist_ndvi if len(hist_ndvi) == 12 else [0.4] * 12,
                    }
            except Exception as e:
                # Fallback: use average values
                city_data = {
                    "city": city_name or f"Location ({lat}, {lon})",
                    "temp": [25] * 12,
                    "ndvi": [0.4] * 12,
                }

        if not city_data:
            return jsonify({"message": "City not found. Provide city name or lat/lon."}), 404

        # Get historical data
        hist_temp = city_data["temp"]
        hist_ndvi = city_data["ndvi"]
        
        # Ensure we have 12 months of data
        if len(hist_temp) < 12:
            hist_temp = (hist_temp * (12 // len(hist_temp) + 1))[:12]
        if len(hist_ndvi) < 12:
            hist_ndvi = (hist_ndvi * (12 // len(hist_ndvi) + 1))[:12]

        # Simple forecast: seasonal pattern + trend
        base_months = MONTHS.copy()
        base_temp = hist_temp[:12].copy()
        base_ndvi = hist_ndvi[:12].copy()

        # Calculate trend (simple linear regression)
        x = np.arange(len(base_temp))
        temp_trend = np.polyfit(x, base_temp, 1)[0]  # slope
        ndvi_trend = np.polyfit(x, base_ndvi, 1)[0]

        # Get current month index
        current_month_idx = datetime.date.today().month - 1

        # Predict future months
        future_months = []
        temp_predictions = []
        ndvi_predictions = []

        for i in range(1, months_ahead + 1):
            # Calculate month index (wrap around)
            future_idx = (current_month_idx + i) % 12
            future_months.append(MONTHS[future_idx])

            # Seasonal component (use historical value for that month)
            seasonal_temp = base_temp[future_idx]
            seasonal_ndvi = base_ndvi[future_idx]

            # Trend component (extrapolate forward)
            trend_temp = temp_trend * (i / 12.0)
            trend_ndvi = ndvi_trend * (i / 12.0)

            # Combine: 70% seasonal + 30% trend
            pred_temp = seasonal_temp * 0.7 + (base_temp[-1] + trend_temp) * 0.3
            pred_ndvi = seasonal_ndvi * 0.7 + (base_ndvi[-1] + trend_ndvi) * 0.3

            # Add some randomness for realism
            pred_temp += np.random.uniform(-1, 1)
            pred_ndvi += np.random.uniform(-0.02, 0.02)

            # Clamp values to reasonable ranges
            pred_temp = max(0, min(50, pred_temp))
            pred_ndvi = max(0.0, min(1.0, pred_ndvi))

            temp_predictions.append(float(round(pred_temp, 1)))
            ndvi_predictions.append(float(round(pred_ndvi, 3)))

        return jsonify(
            {
                "city": city_data["city"],
                "baseMonths": base_months,
                "baseTemp": [float(t) for t in base_temp],
                "baseNdvi": [float(n) for n in base_ndvi],
                "futureMonths": future_months,
                "tempPred": temp_predictions,
                "ndviPred": ndvi_predictions,
            }
        )

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
