from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from config import Config
from pathlib import Path
from dotenv import load_dotenv

# Blueprints
from routes.auth import auth_bp
from routes.forum import forum_bp
from routes.resources import resources_bp
from routes.tests import tests_bp
from routes.admin import admin_bp
from routes.consultant import consultant_bp


def create_app():
    # Load environment variables from backend/.env if present
    load_dotenv(dotenv_path=Path(__file__).parent / ".env", override=True)

    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"], "supports_credentials": True}})

    # JWT
    jwt = JWTManager(app)

    @jwt.additional_claims_loader
    def add_claims_to_access_token(identity):
        # identity will be user_id; role will be looked up per request as needed
        return {}

    # Database
    client = MongoClient(app.config["MONGO_URI"])
    db = client[app.config["MONGO_DB_NAME"]]
    app.config["DB"] = db

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(forum_bp, url_prefix="/api/forum")
    app.register_blueprint(resources_bp, url_prefix="/api/resources")
    app.register_blueprint(tests_bp, url_prefix="/api/tests")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(consultant_bp, url_prefix="/api/consultant")

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
