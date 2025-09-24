from flask import Blueprint, current_app, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from datetime import timedelta

auth_bp = Blueprint("auth", __name__)


def to_user_dto(user):
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user.get("role", "user"),
        "created_at": user.get("created_at")
    }


@auth_bp.post("/signup")
def signup():
    db = current_app.config["DB"]
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    name = data.get("name", "").strip()

    if not email or not password:
        return {"message": "Email and password are required"}, 400

    if db.users.find_one({"email": email}):
        return {"message": "Email already in use"}, 409

    hashed = generate_password_hash(password, method='pbkdf2:sha256')
    user = {
        "email": email,
        "password": hashed,
        "name": name,
        "role": "user",
        "created_at": current_app.config.get("ENV")
    }
    res = db.users.insert_one(user)

    access_token = create_access_token(identity=str(res.inserted_id), expires_delta=timedelta(days=7), additional_claims={"role": "user"})
    return {"token": access_token, "user": to_user_dto({"_id": res.inserted_id, **user})}


@auth_bp.post("/login")
def login():
    db = current_app.config["DB"]
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = db.users.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return {"message": "Invalid credentials"}, 401

    access_token = create_access_token(identity=str(user["_id"]), additional_claims={"role": user.get("role", "user")})
    return {"token": access_token, "user": to_user_dto(user)}


@auth_bp.get("/me")
@jwt_required()
def me():
    db = current_app.config["DB"]
    uid = get_jwt_identity()
    user = db.users.find_one({"_id": ObjectId(uid)})
    if not user:
        return {"message": "User not found"}, 404
    return {"user": to_user_dto(user)}
