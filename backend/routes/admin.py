from flask import Blueprint, current_app
from flask_jwt_extended import jwt_required, get_jwt
from bson import ObjectId

admin_bp = Blueprint("admin", __name__)


def require_admin():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return False
    return True


@admin_bp.get("/users")
@jwt_required()
def users():
    if not require_admin():
        return {"message": "Admin only"}, 403
    db = current_app.config["DB"]
    users = []
    for u in db.users.find().limit(200):
        u["id"] = str(u.pop("_id"))
        u.pop("password", None)
        users.append(u)
    return {"users": users}


@admin_bp.get("/reports")
@jwt_required()
def reports():
    if not require_admin():
        return {"message": "Admin only"}, 403
    db = current_app.config["DB"]
    reps = []
    for r in db.reports.find().sort("created_at", -1).limit(200):
        r["id"] = str(r.pop("_id"))
        r["post_id"] = str(r["post_id"]) if isinstance(r.get("post_id"), ObjectId) else r.get("post_id")
        r["reporter_id"] = str(r["reporter_id"]) if isinstance(r.get("reporter_id"), ObjectId) else r.get("reporter_id")
        reps.append(r)
    return {"reports": reps}


@admin_bp.get("/analytics/tests")
@jwt_required()
def tests_analytics():
    if not require_admin():
        return {"message": "Admin only"}, 403
    db = current_app.config["DB"]
    pipeline = [
        {"$group": {"_id": {"type": "$test_type", "severity": "$severity"}, "count": {"$sum": 1}}}
    ]
    agg = list(db.test_results.aggregate(pipeline))
    data = {}
    for row in agg:
        t = row["_id"]["type"]
        s = row["_id"]["severity"]
        data.setdefault(t, {})[s] = row["count"]
    return {"analytics": data}
