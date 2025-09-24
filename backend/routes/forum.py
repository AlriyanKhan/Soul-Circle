from flask import Blueprint, current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId
from datetime import datetime
from utils.moderation import contains_self_harm_risk

forum_bp = Blueprint("forum", __name__)


def post_dto(p, user_name_lookup=None):
    upvoters = p.get("upvoters", []) or []
    upvotes = len(upvoters) if isinstance(upvoters, list) else p.get("upvotes", 0)
    author_name = None
    if not p.get("anonymous") and p.get("author_id") and user_name_lookup:
        author_name = user_name_lookup.get(str(p.get("author_id")))
    return {
        "id": str(p["_id"]),
        "title": p.get("title", ""),
        "content": p.get("content", ""),
        "category": p.get("category", "general"),
        "authorId": str(p.get("author_id")) if p.get("author_id") else None,
        "authorName": author_name,
        "anonymous": bool(p.get("anonymous", False)),
        "createdAt": p.get("created_at"),
        "likes": p.get("likes", 0),
        "upvotes": upvotes,
        "flagged": p.get("flagged", False)
    }


def reply_dto(r, user_name_lookup=None):
    upvoters = r.get("upvoters", []) or []
    upvotes = len(upvoters) if isinstance(upvoters, list) else r.get("upvotes", 0)
    author_name = None
    if not r.get("anonymous") and r.get("author_id") and user_name_lookup:
        author_name = user_name_lookup.get(str(r.get("author_id")))
    return {
        "id": str(r["_id"]),
        "postId": str(r.get("post_id")) if r.get("post_id") else None,
        "parentReplyId": str(r.get("parent_reply_id")) if r.get("parent_reply_id") else None,
        "content": r.get("content", ""),
        "authorId": str(r.get("author_id")) if r.get("author_id") else None,
        "authorName": author_name,
        "anonymous": bool(r.get("anonymous", False)),
        "createdAt": r.get("created_at"),
        "upvotes": upvotes,
        "flagged": r.get("flagged", False)
    }

@forum_bp.get("/categories")
def categories():
    return {"categories": ["general", "anxiety", "depression", "stress", "mindfulness", "self-care"]}


@forum_bp.get("/posts")
def list_posts():
    db = current_app.config["DB"]
    category = request.args.get("category")
    q = {"category": category} if category else {}
    # Build a lookup for author names to avoid multiple queries per post
    author_ids = set()
    cursor = db.posts.find(q).sort("created_at", -1).limit(100)
    docs = list(cursor)
    for p in docs:
        if p.get("author_id") and not p.get("anonymous"):
            author_ids.add(p.get("author_id"))
    name_lookup = {}
    if author_ids:
        users = db.users.find({"_id": {"$in": list(author_ids)}})
        for u in users:
            name_lookup[str(u["_id"])]=u.get("name") or u.get("email")
    posts = [post_dto(p, user_name_lookup=name_lookup) for p in docs]
    return {"posts": posts}


@forum_bp.post("/posts")
@jwt_required()
def create_post():
    db = current_app.config["DB"]
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    category = data.get("category", "general")
    anonymous = bool(data.get("anonymous", False))

    if not title or not content:
        return {"message": "Title and content are required"}, 400

    flagged = contains_self_harm_risk(content)

    p = {
        "title": title,
        "content": content,
        "category": category,
        "anonymous": anonymous,
        "author_id": ObjectId(get_jwt_identity()),
        "created_at": datetime.utcnow().isoformat(),
        "likes": 0,
        "upvoters": [],
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
    name_lookup = {}
    if p.get("author_id") and not p.get("anonymous"):
        u = db.users.find_one({"_id": p.get("author_id")})
        if u:
            name_lookup[str(u["_id"])]=u.get("name") or u.get("email")
    return {"post": post_dto(p, user_name_lookup=name_lookup)}


@forum_bp.post("/posts/<post_id>/like")
@jwt_required()
def like_post(post_id):
    db = current_app.config["DB"]
    db.posts.update_one({"_id": ObjectId(post_id)}, {"$inc": {"likes": 1}})
    p = db.posts.find_one({"_id": ObjectId(post_id)})
    return {"post": post_dto(p)}


@forum_bp.post("/posts/<post_id>/replies")
@jwt_required()
def create_reply(post_id):
    db = current_app.config["DB"]
    data = request.get_json() or {}
    content = data.get("content", "").strip()
    parent_reply_id = data.get("parentReplyId")
    anonymous = bool(data.get("anonymous", False))
    if not content:
        return {"message": "Content is required"}, 400
    flagged = contains_self_harm_risk(content)
    r = {
        "post_id": ObjectId(post_id),
        "parent_reply_id": ObjectId(parent_reply_id) if parent_reply_id else None,
        "content": content,
        "anonymous": anonymous,
        "author_id": ObjectId(get_jwt_identity()),
        "created_at": datetime.utcnow().isoformat(),
        "upvoters": [],
        "flagged": flagged
    }
    res = db.replies.insert_one(r)
    r["_id"] = res.inserted_id
    return {"reply": reply_dto(r)}, 201


@forum_bp.get("/posts/<post_id>/replies")
def list_replies(post_id):
    db = current_app.config["DB"]
    docs = list(db.replies.find({"post_id": ObjectId(post_id)}).sort("created_at", 1))
    # Build author name lookup for non-anonymous replies
    author_ids = {d.get("author_id") for d in docs if d.get("author_id") and not d.get("anonymous")}
    name_lookup = {}
    if author_ids:
        for u in db.users.find({"_id": {"$in": list(author_ids)}}):
            name_lookup[str(u["_id"])]=u.get("name") or u.get("email")
    items = [reply_dto(r, user_name_lookup=name_lookup) for r in docs]
    # Build tree
    by_id = {i["id"]: {**i, "replies": []} for i in items}
    roots = []
    for i in by_id.values():
        if i.get("parentReplyId") and i.get("parentReplyId") in by_id:
            by_id[i["parentReplyId"]]["replies"].append(i)
        else:
            roots.append(i)
    return {"replies": roots}


@forum_bp.post("/replies/<reply_id>/upvote")
@jwt_required()
def upvote_reply(reply_id):
    db = current_app.config["DB"]
    uid = ObjectId(get_jwt_identity())
    db.replies.update_one({"_id": ObjectId(reply_id)}, {"$addToSet": {"upvoters": uid}})
    r = db.replies.find_one({"_id": ObjectId(reply_id)})
    return {"reply": reply_dto(r)}


@forum_bp.post("/replies/<reply_id>/report")
@jwt_required()
def report_reply(reply_id):
    db = current_app.config["DB"]
    data = request.get_json() or {}
    reason = data.get("reason", "")
    report = {
        "type": "reply",
        "reply_id": ObjectId(reply_id),
        "reporter_id": ObjectId(get_jwt_identity()),
        "reason": reason,
        "created_at": datetime.utcnow().isoformat(),
        "status": "open"
    }
    db.reports.insert_one(report)
    db.replies.update_one({"_id": ObjectId(reply_id)}, {"$set": {"flagged": True}})
    return {"message": "Reported"}, 201


@forum_bp.post("/posts/<post_id>/upvote")
@jwt_required()
def upvote_post(post_id):
    db = current_app.config["DB"]
    uid = ObjectId(get_jwt_identity())
    db.posts.update_one({"_id": ObjectId(post_id)}, {"$addToSet": {"upvoters": uid}})
    p = db.posts.find_one({"_id": ObjectId(post_id)})
    return {"post": post_dto(p)}


@forum_bp.post("/posts/<post_id>/report")
@jwt_required()
def report_post(post_id):
    db = current_app.config["DB"]
    data = request.get_json() or {}
    reason = data.get("reason", "")
    report = {
        "type": "post",
        "post_id": ObjectId(post_id),
        "reporter_id": ObjectId(get_jwt_identity()),
        "reason": reason,
        "created_at": datetime.utcnow().isoformat(),
        "status": "open"
    }
    db.reports.insert_one(report)
    db.posts.update_one({"_id": ObjectId(post_id)}, {"$set": {"flagged": True}})
    return {"message": "Reported"}, 201
