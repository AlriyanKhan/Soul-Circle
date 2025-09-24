from flask import Blueprint, current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId
from datetime import datetime
from utils.moderation import contains_self_harm_risk

forum_bp = Blueprint("forum", __name__)


def post_dto(p):
    return {
        "id": str(p["_id"]),
        "title": p.get("title", ""),
        "content": p.get("content", ""),
        "category": p.get("category", "general"),
        "authorId": str(p.get("author_id")) if p.get("author_id") else None,
        "createdAt": p.get("created_at"),
        "likes": p.get("likes", 0),
        "upvotes": p.get("upvotes", 0),
        "flagged": p.get("flagged", False)
    }

@forum_bp.get("/categories")
def categories():
    return {"categories": ["general", "anxiety", "depression", "stress", "mindfulness", "self-care"]}


@forum_bp.get("/posts")
def list_posts():
    db = current_app.config["DB"]
    category = request.args.get("category")
    q = {"category": category} if category else {}
    posts = [post_dto(p) for p in db.posts.find(q).sort("created_at", -1).limit(100)]
    return {"posts": posts}


@forum_bp.post("/posts")
@jwt_required()
def create_post():
    db = current_app.config["DB"]
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    category = data.get("category", "general")

    if not title or not content:
        return {"message": "Title and content are required"}, 400

    flagged = contains_self_harm_risk(content)

    p = {
        "title": title,
        "content": content,
        "category": category,
        "author_id": ObjectId(get_jwt_identity()),
        "created_at": datetime.utcnow().isoformat(),
        "likes": 0,
        "upvotes": 0,
        "flagged": flagged
    }
    res = db.posts.insert_one(p)
    p["_id"] = res.inserted_id
    return {"post": post_dto(p)}, 201


@forum_bp.get("/posts/<post_id>")
def get_post(post_id):
    db = current_app.config["DB"]
    p = db.posts.find_one({"_id": ObjectId(post_id)})
    if not p:
        return {"message": "Not found"}, 404
    return {"post": post_dto(p)}


@forum_bp.post("/posts/<post_id>/like")
@jwt_required()
def like_post(post_id):
    db = current_app.config["DB"]
    db.posts.update_one({"_id": ObjectId(post_id)}, {"$inc": {"likes": 1}})
    p = db.posts.find_one({"_id": ObjectId(post_id)})
    return {"post": post_dto(p)}


@forum_bp.post("/posts/<post_id>/upvote")
@jwt_required()
def upvote_post(post_id):
    db = current_app.config["DB"]
    db.posts.update_one({"_id": ObjectId(post_id)}, {"$inc": {"upvotes": 1}})
    p = db.posts.find_one({"_id": ObjectId(post_id)})
    return {"post": post_dto(p)}


@forum_bp.post("/posts/<post_id>/report")
@jwt_required()
def report_post(post_id):
    db = current_app.config["DB"]
    data = request.get_json() or {}
    reason = data.get("reason", "")
    report = {
        "post_id": ObjectId(post_id),
        "reporter_id": ObjectId(get_jwt_identity()),
        "reason": reason,
        "created_at": datetime.utcnow().isoformat(),
        "status": "open"
    }
    db.reports.insert_one(report)
    db.posts.update_one({"_id": ObjectId(post_id)}, {"$set": {"flagged": True}})
    return {"message": "Reported"}, 201
