from flask import Blueprint, current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

tests_bp = Blueprint("tests", __name__)


PHQ9_ITEMS = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead or of hurting yourself in some way",
]

GAD7_ITEMS = [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it is hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid as if something awful might happen",
]

OPTIONS = [
    {"label": "Not at all", "value": 0},
    {"label": "Several days", "value": 1},
    {"label": "More than half the days", "value": 2},
    {"label": "Nearly every day", "value": 3},
]


def score_phq9(values):
    total = sum(values)
    if total <= 4:
        severity = "Minimal"
    elif total <= 9:
        severity = "Mild"
    elif total <= 14:
        severity = "Moderate"
    elif total <= 19:
        severity = "Moderately severe"
    else:
        severity = "Severe"
    feedback = "Consider self-care strategies and monitor symptoms." if total <= 9 else "Recommend speaking with a professional and exploring resources."
    return total, severity, feedback


def score_gad7(values):
    total = sum(values)
    if total <= 4:
        severity = "Minimal"
    elif total <= 9:
        severity = "Mild"
    elif total <= 14:
        severity = "Moderate"
    else:
        severity = "Severe"
    feedback = "Practice relaxation techniques and monitor." if total <= 9 else "Consider therapy resources and professional consultation."
    return total, severity, feedback


@tests_bp.get("/definitions")
def definitions():
    return {
        "tests": {
            "PHQ-9": {"items": PHQ9_ITEMS, "options": OPTIONS},
            "GAD-7": {"items": GAD7_ITEMS, "options": OPTIONS},
        }
    }


@tests_bp.post("/submit")
@jwt_required(optional=True)
def submit():
    db = current_app.config["DB"]
    data = request.get_json() or {}
    test_type = data.get("testType")
    answers = data.get("answers", [])  # list of integers

    if test_type not in ("PHQ-9", "GAD-7") or not isinstance(answers, list) or not answers:
        return {"message": "Invalid payload"}, 400

    if test_type == "PHQ-9":
        total, severity, feedback = score_phq9(answers)
    else:
        total, severity, feedback = score_gad7(answers)

    result_doc = {
        "test_type": test_type,
        "answers": answers,
        "score": total,
        "severity": severity,
        "feedback": feedback,
        "user_id": get_jwt_identity(),
        "created_at": datetime.utcnow().isoformat()
    }
    db.test_results.insert_one(result_doc)

    # Provide recommended resource categories
    rec_categories = ["mindfulness", "self-care"] if severity in ("Minimal", "Mild") else ["therapy", "depression", "anxiety"]

    return {
        "score": total,
        "severity": severity,
        "feedback": feedback,
        "recommendedCategories": rec_categories
    }
