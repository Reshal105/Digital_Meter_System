from datetime import datetime, timedelta, UTC
from flask import Flask, jsonify, request
from flask_cors import CORS
from db import init_db, get_db, close_db

from utils import (
    calculate_energy_units,
    calculate_cost,
    detect_high_usage_alert,
    monthly_estimate_units,
    format_reading,
)
from ai_agent import run_agent_chat
from uuid import uuid4
import bcrypt
import random
import threading
import os
import razorpay
import hmac
import hashlib
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# ✅ FIXED CORS
app.config["CORS_HEADERS"] = "Content-Type"
CORS(
    app,
    resources={r"/*": {"origins": ["http://localhost:3000"]}},
    supports_credentials=True,
)

app.config["DATABASE"] = "backend/data/energy.db"

# ✅ Initialize Razorpay client
razorpay_client = razorpay.Client(
    auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET"))
)

fake_sensor_data = {
    "voltage": 230,
    "current": 5.0,
    "power": 1150.0,
    "energy": 1.15,
    "timestamp": datetime.now(UTC).isoformat() + "Z",
}


def refresh_fake_sensor_data():
    global fake_sensor_data

    voltage = random.randint(210, 239)
    current = round(random.uniform(1.5, 10.0), 2)
    power = round(voltage * current, 2)
    energy = round(power * 0.001, 3)

    fake_sensor_data = {
        "voltage": voltage,
        "current": current,
        "power": power,
        "energy": energy,
        "timestamp": datetime.now(UTC).isoformat() + "Z",
    }

    threading.Timer(2.0, refresh_fake_sensor_data).start()


# -------------------------
# INIT DB ON START
# -------------------------
with app.app_context():
    init_db()


# -------------------------
# CLOSE DB
# -------------------------
@app.teardown_appcontext
def teardown(exception):
    close_db()


# -------------------------
# ROOT ROUTE
# -------------------------
@app.route("/")
def home():
    return jsonify({"message": "Backend is running successfully"})


# -------------------------
# FAKE SENSOR DATA
# -------------------------
@app.route("/api/data")
def fake_data():
    return jsonify(fake_sensor_data)


# -------------------------
# PASSWORD HELPERS
# -------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(hashed_password: str, password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


# -------------------------
# AUTH SIGNUP
# -------------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(force=True)

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    location = data.get("location", "").strip()
    meter_id = data.get("meterId", data.get("meter_id", "")).strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        db = get_db()
        db.execute(
            "INSERT INTO users (email, password, name, phone, location, meter_id, daily_limit) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (email, hash_password(password), name, phone, location, meter_id, 50),
        )
        db.commit()

        return jsonify({
            "message": "Signup successful",
            "user": {
                "id": email,
                "email": email,
                "name": name,
                "phone": phone,
                "location": location,
                "meterId": meter_id,
                "daily_limit": 50,
            },
        }), 201
    except Exception as e:
        if "UNIQUE constraint failed" in str(e):
            return jsonify({"error": "Email already registered"}), 409
        return jsonify({"error": str(e)}), 500


# -------------------------
# AUTH LOGIN
# -------------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        db = get_db()
        user = db.execute(
            "SELECT email, password, name, phone, location, meter_id, COALESCE(daily_limit, 50) AS daily_limit FROM users WHERE email = ?",
            (email,),
        ).fetchone()

        if not user or not check_password(user["password"], password):
            return jsonify({"error": "Invalid credentials"}), 401

        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user["email"],
                "email": user["email"],
                "name": user["name"],
                "phone": user["phone"],
                "location": user["location"],
                "meterId": user["meter_id"],
                "daily_limit": user["daily_limit"],
            },
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# USER SETTINGS UPDATE
# -------------------------
@app.route("/api/users/update", methods=["PUT"])
def update_user():
    data = request.get_json(force=True)

    user_id = data.get("user_id", "").strip()
    daily_limit = data.get("daily_limit", None)

    if not user_id:
        return jsonify({"error": "User ID required"}), 400
    if daily_limit is None:
        return jsonify({"error": "daily_limit is required"}), 400

    try:
        db = get_db()
        db.execute(
            "UPDATE users SET daily_limit = ? WHERE email = ?",
            (daily_limit, user_id),
        )
        db.commit()

        return jsonify({"message": "Settings updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# AI FORECAST ENDPOINTS
# -------------------------
@app.route("/api/forecast/usage", methods=["GET"])
def forecast_usage():
    try:
        db = get_db()

        # Get recent readings to analyze trend
        readings = db.execute(
            "SELECT power FROM readings ORDER BY timestamp DESC LIMIT 20"
        ).fetchall()

        if not readings:
            # Return mock forecast if no historical data
            return jsonify({
                "forecast": {
                    "next_24h_units": 15.4,
                    "next_24h_cost": 184.80,
                    "risk_level": "medium",
                    "trend": "stable",
                    "current_avg_power": 1200,
                    "peak_power": 2100,
                    "suggestion": "Your usage is tracking normally. Consider reducing peak load during 6-9 PM to save energy."
                }
            }), 200

        # Calculate statistics from readings
        powers = [r["power"] for r in readings]
        avg_power = sum(powers) / len(powers) if powers else 1200
        peak_power = max(powers) if powers else 2100
        current_power = powers[0] if powers else 1200

        # Determine trend
        if len(powers) > 5:
            recent_avg = sum(powers[:5]) / 5
            older_avg = sum(powers[5:]) / (len(powers) - 5) if len(powers) > 5 else recent_avg
            if recent_avg > older_avg * 1.1:
                trend = "increasing"
            elif recent_avg < older_avg * 0.9:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            trend = "stable"

        # Calculate forecast
        next_24h_units = (avg_power * 24) / 1000  # Convert Watts to kWh
        next_24h_cost = round(next_24h_units * 12, 2)  # ₹12 per kWh estimate

        # Risk assessment
        daily_limit = 50  # Default limit in kWh
        if next_24h_units > daily_limit:
            risk_level = "high"
        elif next_24h_units > daily_limit * 0.8:
            risk_level = "medium"
        else:
            risk_level = "low"

        # Generate suggestion based on data
        if risk_level == "high":
            suggestion = "High usage predicted for next 24 hours. Recommend reducing non-essential loads, particularly AC usage during peak hours (6-9 PM)."
        elif risk_level == "medium":
            suggestion = "Moderate usage expected. Consider shifting heavy appliance usage to off-peak hours to optimize costs."
        else:
            suggestion = "Usage is within healthy limits. Continue current patterns or consider increased usage if needed."

        return jsonify({
            "forecast": {
                "next_24h_units": round(next_24h_units, 1),
                "next_24h_cost": next_24h_cost,
                "risk_level": risk_level,
                "trend": trend,
                "current_avg_power": round(avg_power),
                "peak_power": round(peak_power),
                "suggestion": suggestion
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# PAYMENT ENDPOINTS
# -------------------------
@app.route("/api/payments", methods=["GET"])
def get_payment_history():
    try:
        db = get_db()
        payments = db.execute(
            "SELECT id, timestamp, amount, status, method, reference, description FROM payments ORDER BY timestamp DESC LIMIT 50"
        ).fetchall()

        return jsonify({
            "payments": [dict(p) for p in payments]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/payments", methods=["POST"])
def create_payment():
    try:
        data = request.get_json(force=True)
        amount = data.get("amount", 0)

        if amount <= 0:
            return jsonify({"error": "Invalid amount"}), 400

        # Create Razorpay order
        order_data = {
            "amount": int(amount * 100),  # Amount in paisa
            "currency": "INR",
            "receipt": f"receipt_{str(uuid4())[:8]}",
        }

        razorpay_order = razorpay_client.order.create(data=order_data)

        # Store payment record in database
        db = get_db()
        db.execute(
            "INSERT INTO payments (order_id, amount, status, method, description, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
            (
                razorpay_order["id"],
                amount,
                "pending",
                "card",
                data.get("description", ""),
                datetime.now(UTC).isoformat(),
            ),
        )
        db.commit()

        return jsonify({
            "payment": {
                "order_id": razorpay_order["id"],
                "key": os.getenv("RAZORPAY_KEY_ID"),
                "amount": amount,
                "description": data.get("description", ""),
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/payments/verify", methods=["POST"])
def verify_payment():
    try:
        data = request.get_json(force=True)

        razorpay_order_id = data.get("razorpay_order_id")
        razorpay_payment_id = data.get("razorpay_payment_id")
        razorpay_signature = data.get("razorpay_signature")

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return jsonify({"error": "Missing payment details"}), 400

        # Verify signature
        key_secret = os.getenv("RAZORPAY_KEY_SECRET")
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        expected_signature = hmac.new(
            key_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()

        if expected_signature != razorpay_signature:
            return jsonify({"error": "Payment verification failed"}), 400

        # Update payment status in database
        db = get_db()
        db.execute(
            "UPDATE payments SET status = ?, reference = ?, timestamp = ? WHERE order_id = ?",
            (
                "success",
                razorpay_payment_id,
                datetime.now(UTC).isoformat(),
                razorpay_order_id,
            ),
        )
        db.commit()

        return jsonify({
            "message": "Payment verified successfully",
            "payment_id": razorpay_payment_id,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# AGENTIC AI ENDPOINTS
# -------------------------
@app.route("/api/ai/chat", methods=["POST"])
def ai_chat():
    """Interactive AI agent for energy insights and recommendations."""
    try:
        data = request.get_json(force=True)
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        # Run the agentic AI
        response = run_agent_chat(user_message)

        return jsonify({
            "response": response.get("response", ""),
            "messages": [
                {"role": "user", "content": user_message},
                {"role": "assistant", "content": response.get("response", "")}
            ]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/ai/insights", methods=["GET"])
def ai_insights():
    """Get AI-generated insights about energy usage."""
    try:
        message = "Please analyze my recent energy consumption and provide recommendations for saving money on my electricity bill. Include any anomalies detected in my usage patterns."
        response = run_agent_chat(message)

        return jsonify({
            "insights": response.get("response", ""),
            "type": "energy_analysis"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# RUN APP
# -------------------------
if __name__ == "__main__":
    refresh_fake_sensor_data()  # ✅ START SENSOR HERE
    app.run(debug=True)