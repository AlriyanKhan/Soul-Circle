import os
from datetime import datetime, timedelta, date

import pandas as pd
from flask import Flask, request, redirect, url_for, session, render_template_string
from pymongo import MongoClient

from dash import Dash, html, dcc, Input, Output, State, callback_context, ALL
import plotly.express as px
from bson import ObjectId
from typing import Optional

# --- Config / Helpers ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "soul_circle")
SECRET_KEY = os.getenv("ADMIN_DASH_SECRET", "admin-dash-secret")
ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASS = os.getenv("ADMIN_PASS", "admin123")

# --- Custom Color Palette for Graphs ---
SOUL_CIRCLE_COLORS = ['#2A9D8F', '#E9C46A', '#F4A261', '#264653', '#E76F51', '#8ECAE6']

# --- Flask + Mongo ---
server = Flask(__name__)
server.secret_key = SECRET_KEY
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

@server.before_request
def require_login():
    open_paths = {"/login", "/static", "/_dash"}
    if request.path == "/login" or any(request.path.startswith(p) for p in open_paths):
        return
    if not session.get("admin_logged_in"):
        return redirect(url_for("login"))

LOGIN_TEMPLATE = """
<!doctype html>
<title>Admin Login</title>
<link rel="stylesheet" href="/static/style.css">
<div class="login-container"><div class="login-card"><h2>Admin Login</h2><form method="post"><label>Username</label><input name="username" /><label>Password</label><input name="password" type="password" /><button type="submit">Login</button>{% if error %}<div class="err">{{ error }}</div>{% endif %}</form></div></div>
"""

@server.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        if request.form.get("username") == ADMIN_USER and request.form.get("password") == ADMIN_PASS:
            session["admin_logged_in"] = True
            return redirect("/")
        error = "Invalid credentials"
    return render_template_string(LOGIN_TEMPLATE, error=error)

@server.route("/logout")
def logout():
    session.clear(); return redirect(url_for("login"))

# --- Dash App ---
app = Dash(__name__, server=server, url_base_pathname="/", external_stylesheets=['/static/style.css'])
app.title = "SOUL-CIRCLE Admin"

# --- Data Fetching Logic ---
def get_date_range_query(start_date_str, end_date_str):
    try:
        start_dt = datetime.fromisoformat(start_date_str)
        end_dt = datetime.fromisoformat(end_date_str) + timedelta(days=1)
        return {"created_at": {"$gte": start_dt.isoformat(), "$lt": end_dt.isoformat()}}
    except (TypeError, ValueError):
        return {"created_at": {"$gte": (datetime.utcnow() - timedelta(days=7)).isoformat()}}

def count_users(query):
    try: return db.users.count_documents(query)
    except Exception: return db.users.estimated_document_count()

def count_posts(query):
    return db.posts.count_documents(query)

def tests_taken(query, test_type: Optional[str] = None):
    if test_type and test_type != 'all':
        query["test_type"] = test_type
    return db.test_results.count_documents(query)

def average_score(query, test_type: Optional[str] = None):
    if test_type and test_type != 'all':
        query["test_type"] = test_type
    pipeline = [{"$match": query}, {"$group": {"_id": None, "avg": {"$avg": "$score"}}}]
    agg = list(db.test_results.aggregate(pipeline))
    return round(agg[0]["avg"], 2) if agg else 0.0

def posts_by_category():
    rows = list(db.posts.aggregate([{"$group": {"_id": "$category", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}]))
    return pd.DataFrame({"category": [r.get("_id") or "unknown" for r in rows], "count": [r.get("count", 0) for r in rows]})

def load_reports():
    rows = list(db.reports.find().sort("created_at", -1).limit(300))
    data = []
    for r in rows:
        text, category, user_id = None, None, None
        is_post = bool(r.get("post_id"))
        doc = db.posts.find_one({"_id": r["post_id"]}) if is_post else db.replies.find_one({"_id": r["reply_id"]})
        if doc:
            text = doc.get("content"); category = doc.get("category", "reply") if is_post else "reply"
            user_id = str(doc.get("author_id")) if not doc.get("anonymous") else None
        data.append({"report_id": str(r["_id"]), "kind": "post" if is_post else "reply", "text": text or "(no text)", "category": category or "unknown", "userId": user_id or "(anonymous)"})
    return data

# --- App Layout ---
app.layout = html.Div([
    html.Header([
        html.H1("SOUL-CIRCLE", className="header-logo"),
        html.H2("Admin Dashboard", className="header-title"),
        html.A("Logout", href="/logout", className="logout-button")
    ], className="app-header"),
    html.Div([
        html.Div([
            html.Label("Select Date Range"),
            dcc.DatePickerRange(
                id='date-picker-range', min_date_allowed=date(2025, 9, 1), max_date_allowed=date.today(),
                initial_visible_month=date.today(), start_date=date.today() - timedelta(days=7), end_date=date.today()
            )
        ], className="filter-group"),
        html.Div([
            html.Label("Filter by Test Type"),
            dcc.Dropdown(
                id="test-type-filter",
                options=[{'label': 'All Tests', 'value': 'all'}] + [{'label': t, 'value': t} for t in ["PHQ-9", "GAD-7"]],
                value='all', clearable=False
            )
        ], className="filter-group"),
    ], className="filter-bar"),
    html.Div([
        html.Div(id="kpi-row", className="kpi-row"),
        html.Div([
            html.Div([dcc.Graph(id="bar-posts")], className="graph-card"),
            html.Div([dcc.Graph(id="pie-posts")], className="graph-card"),
        ], className="graph-row"),
        html.Div([html.H3("Reported Content"), html.Div(id="reports-list")], className="reports-section")
    ])
])

# --- Helper function to style figures consistently ---
def style_figure(fig):
    fig.update_layout(
        plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
        font_color='#264653', margin=dict(l=40, r=20, t=60, b=20)
    )
    return fig

# --- Callbacks ---
@app.callback(
    Output("kpi-row", "children"), Output("bar-posts", "figure"), Output("pie-posts", "figure"),
    Input('date-picker-range', 'start_date'), Input('date-picker-range', 'end_date'), Input('test-type-filter', 'value')
)
def update_dashboard(start_date, end_date, test_type):
    date_query = get_date_range_query(start_date, end_date)
    def card(title, value):
        return html.Div([html.Div(title, className="kpi-card-title"), html.Div(str(value), className="kpi-card-value")], className="kpi-card")
    kpis = [
        card("New Users", count_users(date_query.copy())), card("New Posts", count_posts(date_query.copy())),
        card(f"Tests Taken", tests_taken(date_query.copy(), test_type)), card(f"Avg Score", average_score(date_query.copy(), test_type)),
    ]
    df = posts_by_category()
    
    # === THE FIX IS HERE ===
    # We add `color="category"` to tell Plotly to assign a unique color to each category bar.
    bar_fig = px.bar(df, x="category", y="count", title="Posts by Category",
                     color="category", # <--- THIS IS THE ADDED ARGUMENT
                     color_discrete_sequence=SOUL_CIRCLE_COLORS)
    style_figure(bar_fig)
    
    # The pie chart already works correctly because `names="category"` tells it what to color.
    pie_fig = px.pie(df, names="category", values="count", title="Posts Distribution", color_discrete_sequence=SOUL_CIRCLE_COLORS)
    style_figure(pie_fig)
    
    return kpis, bar_fig, pie_fig

@app.callback(Output("reports-list", "children"), Input('date-picker-range', 'start_date'))
def refresh_reports(_):
    items = load_reports()
    rows = []
    for it in items:
        rows.append(html.Div([
            html.Div([
                html.Div(it["text"], className="report-text"),
                html.Div([html.Span(f"Type: {it['kind']} • "), html.Span(f"Category: {it['category']} • "), html.Span(f"User: {it['userId']}")], className="report-meta")
            ], className="report-text-content"),
            html.Div([
                html.Button("Delete", id={"type": "delete-report", "rid": it["report_id"]}, n_clicks=0, className="btn-delete"),
                html.Button("Ignore", id={"type": "ignore-report", "rid": it["report_id"]}, n_clicks=0, className="btn-ignore"),
            ], className="report-actions")
        ], className="report-item"))
    return rows

@app.callback(
    Output('date-picker-range', 'start_date'),
    [Input({"type": "delete-report", "rid": ALL}, "n_clicks"), Input({"type": "ignore-report", "rid": ALL}, "n_clicks")],
    [State({"type": "delete-report", "rid": ALL}, "id"), State({"type": "ignore-report", "rid": ALL}, "id"), State('date-picker-range', 'start_date')],
    prevent_initial_call=True
)
def handle_report_actions(del_clicks, ign_clicks, del_ids, ign_ids, start_date):
    ctx = callback_context
    if not ctx.triggered: return start_date
    try:
        import json
        obj = json.loads(ctx.triggered[0]["prop_id"].split(".")[0])
        rid = obj.get("rid")
        rep = db.reports.find_one({"_id": ObjectId(rid)})
        if not rep: return start_date
        if obj.get("type") == "delete-report":
            if rep.get("post_id"):
                db.posts.delete_one({"_id": rep["post_id"]}); db.reports.delete_many({"post_id": rep["post_id"]})
            elif rep.get("reply_id"):
                db.replies.delete_one({"_id": rep["reply_id"]}); db.reports.delete_many({"reply_id": rep["reply_id"]})
        elif obj.get("type") == "ignore-report":
            db.reports.delete_one({"_id": rep["_id"]})
    except Exception: pass
    return start_date

if __name__ == "__main__":
    port = int(os.getenv("ADMIN_DASH_PORT", "8060"))
    server.run(host="0.0.0.0", port=port, debug=True)