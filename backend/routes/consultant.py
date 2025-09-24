from flask import Blueprint, current_app, request
from flask_jwt_extended import jwt_required, get_jwt

consultant_bp = Blueprint("consultant", __name__)


def to_public(dto):
    # Only return public fields
    return {
        "name": dto.get("name", ""),
        "email": dto.get("email", ""),
        "phone": dto.get("phone", ""),
        "officeHours": dto.get("officeHours", ""),
        "bookingUrl": dto.get("bookingUrl", "")
    }


@consultant_bp.get("")
def get_info():
    db = current_app.config["DB"]
    doc = db.consultant.find_one({}) or {}
    return {"consultant": to_public(doc)}