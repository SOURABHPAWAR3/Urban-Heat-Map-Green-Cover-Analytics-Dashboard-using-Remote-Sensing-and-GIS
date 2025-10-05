from flask import Flask
from flask_cors import CORS
from extensions import db, jwt
from auth.routes import auth_bp

def create_app():
    app = Flask(__name__)

    # --- Configuration ---
    app.config["SECRET_KEY"] = "mysecret123"
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = "jwt-secret-456"  # for Flask-JWT-Extended

    # --- Initialize Extensions ---
    db.init_app(app)
    jwt.init_app(app)

    # --- Enable CORS (for React Frontend) ---
    CORS(app, origins=["http://localhost:5173"])


    # --- Register Blueprints ---
    app.register_blueprint(auth_bp, url_prefix="/api")

    # --- Create Tables ---
    with app.app_context():
        db.create_all()

    # --- Root Endpoint ---
    @app.route("/")
    def home():
        return {"message": "Flask backend is running successfully!"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
