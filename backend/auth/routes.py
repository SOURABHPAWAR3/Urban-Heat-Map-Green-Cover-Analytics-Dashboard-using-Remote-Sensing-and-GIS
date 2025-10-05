from flask import Blueprint, request, jsonify
from extensions import db
from auth.models import User
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
import datetime

auth_bp = Blueprint("auth", __name__)

# ---------------------------
# REGISTER USER
# ---------------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    # Validate input
    if not data or not data.get("username") or not data.get("email") or not data.get("password"):
        return jsonify({
            "success": False,
            "message": "Missing username, email, or password"
        }), 400

    # Check if email or username already exists
    if User.query.filter_by(email=data["email"]).first() or User.query.filter_by(username=data["username"]).first():
        return jsonify({
            "success": False,
            "message": "User already exists"
        }), 400

    # Create new user
    new_user = User(username=data["username"], email=data["email"])
    new_user.set_password(data["password"])

    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Database error",
            "error": str(e)
        }), 500

    # Create token
    access_token = create_access_token(
        identity=str(new_user.id),
        expires_delta=datetime.timedelta(hours=1),
    )

    return jsonify({
        "success": True,
        "message": "User registered successfully",
        "token": access_token,
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email
        }
    }), 201

# ---------------------------
# LOGIN USER
# ---------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({
            "success": False,
            "message": "Missing email or password"
        }), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({
            "success": False,
            "message": "Invalid credentials"
        }), 401

    access_token = create_access_token(
        identity=str(user.id),
        expires_delta=datetime.timedelta(hours=1),
    )

    return jsonify({
        "success": True,
        "message": "Login successful",
        "token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }), 200

# ---------------------------
# PROTECTED: GET CURRENT USER
# ---------------------------
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        return jsonify({
            "success": True,
            "id": user.id,
            "username": user.username,
            "email": user.email
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error fetching user",
            "error": str(e)
        }), 500
