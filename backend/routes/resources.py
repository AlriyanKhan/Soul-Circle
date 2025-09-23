from flask import Blueprint, current_app, request
from flask_jwt_extended import jwt_required, get_jwt
from bson import ObjectId
from datetime import datetime

resources_bp = Blueprint("resources", __name__)


def is_admin():
    claims = get_jwt()
    return claims.get("role") == "admin"


@resources_bp.get("")
def list_resources():
    db = current_app.config["DB"]
    category = request.args.get("category")
    q = {"category": category} if category else {}
    items = []
    for r in db.resources.find(q).sort("created_at", -1).limit(200):
        r["id"] = str(r.pop("_id"))
        items.append(r)
    return {"resources": items}


@resources_bp.post("")
@jwt_required()
def add_resource():
    if not is_admin():
        return {"message": "Admin only"}, 403
    db = current_app.config["DB"]
    data = request.get_json() or {}
    item = {
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "url": data.get("url", ""),
        "category": data.get("category", "article"),
        "created_at": datetime.utcnow().isoformat()
    }
    res = db.resources.insert_one(item)
    item["id"] = str(res.inserted_id)
    return {"resource": item}, 201


@resources_bp.delete("/<rid>")
@jwt_required()
def remove_resource(rid):
    if not is_admin():
        return {"message": "Admin only"}, 403
    db = current_app.config["DB"]
    db.resources.delete_one({"_id": ObjectId(rid)})
    return {"message": "Deleted"}
