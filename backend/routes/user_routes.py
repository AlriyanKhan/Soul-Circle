from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId

# We will reuse the DTO functions from your existing forum.py file
from .forum import post_dto, reply_dto

# Create a Blueprint for user-specific routes
user_api = Blueprint('user_api', __name__)


# ==============================================================================
#   API ROUTE 1: Get all posts created by the currently logged-in user
# ==============================================================================
# CHANGED: The path is now just '/posts'. Flask will add the '/api/user' prefix automatically.
@user_api.route('/posts', methods=['GET'])
@jwt_required()
def get_user_posts():
    """
    Fetches all posts authored by the authenticated user.
    """
    db = current_app.config["DB"]
    try:
        user_id = ObjectId(get_jwt_identity())

        user_posts_cursor = db.posts.find({
            'author_id': user_id
        })

        user = db.users.find_one({"_id": user_id})
        name_lookup = {}
        if user:
            name_lookup[str(user_id)] = user.get("name") or user.get("email")

        posts_list = [post_dto(p, user_name_lookup=name_lookup) for p in user_posts_cursor]

        return jsonify({"posts": posts_list}), 200

    except Exception as e:
        return jsonify({"message": "An error occurred fetching posts", "error": str(e)}), 500


# ==============================================================================
#   API ROUTE 2: Get all replies made by the currently logged-in user
# ==============================================================================
# CHANGED: The path is now just '/replies'.
@user_api.route('/replies', methods=['GET'])
@jwt_required()
def get_user_replies():
    """
    Fetches all replies authored by the authenticated user.
    """
    db = current_app.config["DB"]
    try:
        user_id = ObjectId(get_jwt_identity())

        user_replies_cursor = db.replies.find({
            'author_id': user_id
        })

        user = db.users.find_one({"_id": user_id})
        name_lookup = {}
        if user:
            name_lookup[str(user_id)] = user.get("name") or user.get("email")

        replies_list = [reply_dto(r, user_name_lookup=name_lookup) for r in user_replies_cursor]

        return jsonify({"replies": replies_list}), 200

    except Exception as e:
        return jsonify({"message": "An error occurred fetching replies", "error": str(e)}), 500