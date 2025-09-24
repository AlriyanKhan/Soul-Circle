from pymongo import MongoClient
from werkzeug.security import generate_password_hash
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "soul_circle")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Clear small collections (dev only)
db.resources.delete_many({})
db.posts.delete_many({})
db.reports.delete_many({})

# Ensure an admin user exists
admin_email = "admin@soul-circle.local"
if not db.users.find_one({"email": admin_email}):
    db.users.insert_one({
        "email": admin_email,
        "password": generate_password_hash("AdminPass123!", method='pbkdf2:sha256'),
        "name": "Admin",
        "role": "admin"
    })

# Resources
resources = [
    {"title": "Mindfulness Basics", "description": "Intro guide to mindfulness.", "url": "https://example.com/mindfulness", "category": "mindfulness"},
    {"title": "Coping with Anxiety", "description": "Article on coping strategies.", "url": "https://example.com/anxiety", "category": "anxiety"},
    {"title": "Self-care Routine", "description": "Video: daily self-care.", "url": "https://example.com/selfcare", "category": "self-care"},
]
for r in resources:
    db.resources.insert_one(r)

print("Seeded resources and admin user.")
