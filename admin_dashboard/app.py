import os
from datetime import datetime, timedelta
from urllib.parse import quote_plus

import pandas as pd
from flask import Flask, request, redirect, url_for, session, render_template_string
from pymongo import MongoClient

from dash import Dash, html, dcc, Input, Output, State, callback_context
from dash.dependencies import ALL
import plotly.express as px
from bson import ObjectId
from typing import Optional

# ----------------------
# Config / Helpers
# ----------------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "soul_circle")
SECRET_KEY = os.getenv("ADMIN_DASH_SECRET", "admin-dash-secret")
ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASS = os.getenv("ADMIN_PASS", "admin123")

# ----------------------
# Flask + Mongo
# ----------------------
server = Flask(__name__)
server.secret_key = SECRET_KEY

client = MongoClient(MONGO_URI)
db = client[DB_NAME]


@server.before_request
def require_login():
    open_paths = {"/login", "/static", "/_dash-component-suites", "/_dash-dependencies", "/_dash-layout"}
    if request.path == "/login" or any(request.path.startswith(p) for p in open_paths):
        return
    if not session.get("admin_logged_in"):
        return redirect(url_for("login"))


LOGIN_TEMPLATE = """
<!doctype html>
<title>Admin Login</title>
<style>
  body { font-family: system-ui, -apple-system, Arial; margin: 0; display: grid; place-items: center; height: 100vh; background: #f6f8fa; }
  .card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); width: 360px; }
  label { display:block; margin: 8px 0 4px; font-weight:600; }
  input { width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; }
  button { width:100%; margin-top:14px; padding:10px; background:#111; color:#fff; border:none; border-radius:8px; cursor:pointer; }
  .err { color:#c1121f; margin-top:8px; }
</style>
<div class="card">
  <h2>Admin Login</h2>
  <form method="post">
    <label>Username</label>
    <input name="username" />
    <label>Password</label>
    <input name="password" type="password" />
    <button type="submit">Login</button>
    {% if error %}<div class="err">{{ error }}</div>{% endif %}
  </form>
</div>
"""


@server.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        u = request.form.get("username", "").strip()
        p = request.form.get("password", "")
        if u == ADMIN_USER and p == ADMIN_PASS:
            session["admin_logged_in"] = True
            return redirect("/")
        error = "Invalid credentials"
    return render_template_string(LOGIN_TEMPLATE, error=error)


@server.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ----------------------
# Dash app
# ----------------------
app = Dash(__name__, server=server, url_base_pathname="/")
app.title = "SOUL-CIRCLE Admin Dashboard"

# UI controls
time_options = [
    {"label": "Day", "value": "day"},
    {"label": "Week", "value": "week"},
    {"label": "Month", "value": "month"},
]

TEST_TYPES = ["PHQ-9", "GAD-7"]

def time_window(range_key: str):
    now = datetime.utcnow()
    if range_key == "day":
        return now - timedelta(days=1)
    if range_key == "week":
        return now - timedelta(weeks=1)
    if range_key == "month":
        return now - timedelta(days=30)
    return now - timedelta(days=3650)


def iso_to_dt(s):
    try:
        return datetime.fromisoformat(s)
    except Exception:
        return None


def count_users(since_dt: datetime):
    # users.created_at may be missing in dev; fall back to total count
    q = {"created_at": {"$gte": since_dt.isoformat()}}
    try:
        return db.users.count_documents(q)
    except Exception:
        return db.users.estimated_document_count()


def count_posts(since_dt: datetime):
    q = {"created_at": {"$gte": since_dt.isoformat()}}
    return db.posts.count_documents(q)


def tests_taken(since_dt: datetime, test_type: Optional[str] = None):
    q = {"created_at": {"$gte": since_dt.isoformat()}}
    if test_type:
        q["test_type"] = test_type
    return db.test_results.count_documents(q)


def average_score(since_dt: datetime, test_type: Optional[str] = None):
    q = {"created_at": {"$gte": since_dt.isoformat()}}
    if test_type:
        q["test_type"] = test_type
    pipeline = [
        {"$match": q},
        {"$group": {"_id": None, "avg": {"$avg": "$score"}}}
    ]
    agg = list(db.test_results.aggregate(pipeline))
    return round(agg[0]["avg"], 2) if agg else 0.0


def posts_by_category():
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    rows = list(db.posts.aggregate(pipeline))
    return pd.DataFrame({
        "category": [r.get("_id") or "unknown" for r in rows],
        "count": [r.get("count", 0) for r in rows]
    })


def load_reports():
    rows = list(db.reports.find().sort("created_at", -1).limit(300))
    data = []
    for r in rows:
        doc = {k: r.get(k) for k in ("reason", "status")}
        rid = str(r.get("_id"))
        is_post = bool(r.get("post_id"))
        text = None
        category = None
        user_id = None
        if is_post:
            p = db.posts.find_one({"_id": r.get("post_id")})
            if p:
                text = p.get("content")
                category = p.get("category")
                user_id = str(p.get("author_id")) if not p.get("anonymous") else None
        else:
            rp = db.replies.find_one({"_id": r.get("reply_id")})
            if rp:
                text = rp.get("content")
                category = "reply"
                user_id = str(rp.get("author_id")) if not rp.get("anonymous") else None
        data.append({
            "report_id": rid,
            "kind": "post" if is_post else "reply",
            "text": text or "(no text)",
            "category": category or "unknown",
            "userId": user_id or "(anonymous)",
        })
    return data


# Layout
app.layout = html.Div([
    # Controls row
    html.Div([
        html.Div([
            html.Label("Time Range"),
            dcc.Dropdown(id="time-range", options=time_options, value="week", clearable=False)
        ], style={"width": "200px"}),
        html.Div([
            html.Label("Test Type"),
            dcc.Dropdown(id="test-type", options=[{"label": t, "value": t} for t in TEST_TYPES], value="PHQ-9", clearable=False)
        ], style={"width": "220px", "marginLeft": "12px"}),
        html.Div([
            html.A("Logout", href="/logout")
        ], style={"flex": 1, "textAlign": "right", "alignSelf": "end"})
    ], style={"display": "flex", "gap": "12px", "padding": "12px 16px", "borderBottom": "1px solid #eee"}),

    # KPIs
    html.Div(id="kpi-row", style={"display": "grid", "gridTemplateColumns": "repeat(4, 1fr)", "gap": "12px", "padding": "12px 16px"}),

    # Graphs
    html.Div([
        html.Div([dcc.Graph(id="bar-posts")], style={"flex": 1}),
        html.Div([dcc.Graph(id="pie-posts")], style={"flex": 1}),
    ], style={"display": "flex", "gap": "12px", "padding": "0 16px"}),

    # Reports table
    html.Div([
        html.H3("Reported Content"),
        html.Div(id="reports-list")
    ], style={"padding": "12px 16px"})
])


# KPIs update
@app.callback(
    Output("kpi-row", "children"),
    Output("bar-posts", "figure"),
    Output("pie-posts", "figure"),
    Input("time-range", "value"),
    Input("test-type", "value")
)
def update_dashboard(range_key, test_type):
    since = time_window(range_key)

    users_cnt = count_users(since)
    posts_cnt = count_posts(since)
    tests_cnt = tests_taken(since, test_type)
    avg_score = average_score(since, test_type)

    # KPI cards
    def card(title, value):
        return html.Div([
            html.Div(title, style={"color": "#666", "fontSize": 14}),
            html.Div(str(value), style={"fontSize": 28, "fontWeight": 700})
        ], style={"background": "#fff", "border": "1px solid #eee", "borderRadius": 8, "padding": 16})

    kpis = [
        card("Users", users_cnt),
        card("Posts", posts_cnt),
        card(f"Tests Taken ({test_type})", tests_cnt),
        card(f"Avg Score ({test_type})", avg_score),
    ]

    # Graphs
    df = posts_by_category()
    bar_fig = px.bar(df, x="category", y="count", title="Posts by Category")
    pie_fig = px.pie(df, names="category", values="count", title="Posts Distribution")

    return kpis, bar_fig, pie_fig


# Reports list generation and actions
@app.callback(
    Output("reports-list", "children"),
    Input("time-range", "value")  # reuse any input to refresh periodically when user changes filters
)
def refresh_reports(_):
    items = load_reports()
    rows = []
    for it in items:
        rid = it["report_id"]
        rows.append(html.Div([
            html.Div([
                html.Div(it["text"], style={"fontWeight": 600}),
                html.Div([
                    html.Span(f"Type: {it['kind']} • "),
                    html.Span(f"Category: {it['category']} • "),
                    html.Span(f"User: {it['userId']}")
                ], style={"color": "#666"})
            ], style={"flex": 1}),
            html.Div([
                html.Button("Delete", id={"type": "delete-report", "rid": rid}, n_clicks=0, style={"marginRight": "8px", "background": "#c1121f", "color": "#fff", "border": "none", "padding": "8px 12px", "borderRadius": 6, "cursor": "pointer"}),
                html.Button("Ignore", id={"type": "ignore-report", "rid": rid}, n_clicks=0, style={"background": "#777", "color": "#fff", "border": "none", "padding": "8px 12px", "borderRadius": 6, "cursor": "pointer"}),
            ])
        ], style={"display": "flex", "gap": "12px", "alignItems": "center", "borderBottom": "1px solid #eee", "padding": "8px 0"}))
    return rows


@app.callback(
    Output("time-range", "value"),  # dummy output to trigger refresh
    Input({"type": "delete-report", "rid": ALL}, "n_clicks"),
    Input({"type": "ignore-report", "rid": ALL}, "n_clicks"),
    State({"type": "delete-report", "rid": ALL}, "id"),
    State({"type": "ignore-report", "rid": ALL}, "id"),
    State("time-range", "value"),
    prevent_initial_call=True
)
def handle_report_actions(del_clicks, ign_clicks, del_ids, ign_ids, current_range):
    ctx = callback_context
    if not ctx.triggered:
        return current_range
    trig = ctx.triggered[0]["prop_id"].split(".")[0]
    try:
        import json
        obj = json.loads(trig)
        rid = obj.get("rid")
        rep = db.reports.find_one({"_id": ObjectId(rid)})
        if not rep:
            return current_range
        if obj.get("type") == "delete-report":
            if rep.get("post_id"):
                db.posts.delete_one({"_id": rep.get("post_id")})
                db.reports.delete_many({"post_id": rep.get("post_id")})
            elif rep.get("reply_id"):
                db.replies.delete_one({"_id": rep.get("reply_id")})
                db.reports.delete_many({"reply_id": rep.get("reply_id")})
        elif obj.get("type") == "ignore-report":
            if rep.get("post_id"):
                db.reports.delete_many({"post_id": rep.get("post_id")})
            elif rep.get("reply_id"):
                db.reports.delete_many({"reply_id": rep.get("reply_id")})
    except Exception:
        pass
    # Return same value to leave dropdown unchanged but trigger refresh
    return current_range


if __name__ == "__main__":
    # Run the admin dashboard server (default port 8060)
    port = int(os.getenv("ADMIN_DASH_PORT", "8060"))
    server.run(host="0.0.0.0", port=port, debug=True)
