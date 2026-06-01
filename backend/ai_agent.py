"""Agentic AI with Claude for Smart Grid system."""
import json
import os
from anthropic import Anthropic
from db import get_db

# Initialize the Anthropic client
try:
    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    AI_AVAILABLE = True
except Exception as e:
    print(f"⚠️ Warning: Anthropic API not configured. AI features disabled. Error: {e}")
    AI_AVAILABLE = False
    client = None

# System prompt for the AI agent
SYSTEM_PROMPT = """You are an intelligent AI agent for a smart grid billing system.
Your role is to:
1. Analyze power consumption data
2. Predict energy usage and costs
3. Detect anomalies and unusual consumption patterns
4. Recommend energy-saving strategies
5. Process payment information
6. Provide real-time insights on billing

When users ask questions about their energy usage, provide actionable insights backed by data.
Be helpful, accurate, and focused on helping users save money and energy."""

# Tool definitions for Claude
TOOLS = [
    {
        "name": "get_usage_history",
        "description": "Retrieve user's power consumption history (power in watts, timestamps)",
        "input_schema": {
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer",
                    "description": "Number of recent readings to retrieve (default 20)"
                }
            },
            "required": []
        }
    },
    {
        "name": "get_payment_history",
        "description": "Retrieve user's payment history and transaction records",
        "input_schema": {
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer",
                    "description": "Number of recent payments to retrieve (default 10)"
                }
            },
            "required": []
        }
    },
    {
        "name": "analyze_consumption_pattern",
        "description": "Analyze power consumption patterns to identify peak hours and anomalies",
        "input_schema": {
            "type": "object",
            "properties": {
                "data": {
                    "type": "array",
                    "description": "List of power readings (in watts)"
                }
            },
            "required": ["data"]
        }
    },
    {
        "name": "recommend_savings",
        "description": "Generate energy-saving recommendations based on usage patterns",
        "input_schema": {
            "type": "object",
            "properties": {
                "avg_power": {
                    "type": "number",
                    "description": "Average power consumption in watts"
                },
                "peak_power": {
                    "type": "number",
                    "description": "Peak power consumption in watts"
                }
            },
            "required": ["avg_power", "peak_power"]
        }
    }
]


def get_usage_history(limit=20):
    """Get power consumption history from database."""
    try:
        db = get_db()
        readings = db.execute(
            "SELECT power, timestamp FROM readings ORDER BY timestamp DESC LIMIT ?",
            (limit,)
        ).fetchall()
        return {
            "success": True,
            "data": [{"power": r["power"], "timestamp": r["timestamp"]} for r in readings]
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_payment_history(limit=10):
    """Get payment transaction history from database."""
    try:
        db = get_db()
        payments = db.execute(
            "SELECT amount, status, timestamp FROM payments ORDER BY timestamp DESC LIMIT ?",
            (limit,)
        ).fetchall()
        return {
            "success": True,
            "data": [{"amount": p["amount"], "status": p["status"], "timestamp": p["timestamp"]} for p in payments]
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def analyze_consumption_pattern(data):
    """Analyze power consumption patterns."""
    if not data:
        return {"success": False, "error": "No data provided"}

    avg_power = sum(data) / len(data)
    peak_power = max(data)
    min_power = min(data)
    variance = sum((x - avg_power) ** 2 for x in data) / len(data)

    # Detect if there's high variance (anomaly indicator)
    std_dev = variance ** 0.5
    anomaly_threshold = avg_power + (2 * std_dev)
    anomalies = [x for x in data if x > anomaly_threshold]

    return {
        "success": True,
        "average_power": round(avg_power, 2),
        "peak_power": round(peak_power, 2),
        "min_power": round(min_power, 2),
        "std_deviation": round(std_dev, 2),
        "anomalies_detected": len(anomalies),
        "has_high_variance": std_dev > avg_power * 0.3
    }


def recommend_savings(avg_power, peak_power):
    """Generate energy-saving recommendations."""
    recommendations = []

    if peak_power > avg_power * 2:
        recommendations.append(
            "⚡ High peak power detected. Spread heavy appliance usage across different times of day."
        )

    if avg_power > 1500:
        recommendations.append(
            "🔌 Consider upgrading to energy-efficient appliances or using LED lighting."
        )

    if peak_power > 2000:
        recommendations.append(
            "🌡️ High power usage. Avoid running AC, heater, and other high-draw appliances simultaneously."
        )

    recommendations.append(
        "📊 Track usage during peak hours (6-9 PM) and shift non-essential loads to off-peak times."
    )

    return {
        "success": True,
        "recommendations": recommendations,
        "estimated_monthly_savings": round((peak_power - avg_power) * 24 * 30 / 1000 * 12, 2)  # ₹12 per kWh
    }


def process_tool_call(tool_name, tool_input):
    """Execute tool calls from the agent."""
    if tool_name == "get_usage_history":
        return get_usage_history(tool_input.get("limit", 20))
    elif tool_name == "get_payment_history":
        return get_payment_history(tool_input.get("limit", 10))
    elif tool_name == "analyze_consumption_pattern":
        return analyze_consumption_pattern(tool_input.get("data", []))
    elif tool_name == "recommend_savings":
        return recommend_savings(
            tool_input.get("avg_power", 0),
            tool_input.get("peak_power", 0)
        )
    else:
        return {"success": False, "error": f"Unknown tool: {tool_name}"}


def run_agent_chat(user_message):
    """Run the agentic AI chat with tool use."""
    if not AI_AVAILABLE or not client:
        return {
            "response": "AI features are not available. Please configure ANTHROPIC_API_KEY in your .env file.",
            "stop_reason": "disabled"
        }

    messages = [
        {"role": "user", "content": user_message}
    ]

    # Agentic loop
    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages
        )

        # Check if we have tool calls
        if response.stop_reason == "tool_use":
            # Process all tool calls in the response
            tool_results = []

            for content_block in response.content:
                if content_block.type == "tool_use":
                    tool_name = content_block.name
                    tool_input = content_block.input
                    tool_use_id = content_block.id

                    # Execute the tool
                    result = process_tool_call(tool_name, tool_input)

                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_use_id,
                        "content": json.dumps(result)
                    })

            # Add assistant response and tool results to messages
            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})
        else:
            # No more tool calls, extract final text response
            for content_block in response.content:
                if hasattr(content_block, "text"):
                    return {
                        "response": content_block.text,
                        "stop_reason": response.stop_reason
                    }

            return {
                "response": "I couldn't generate a response. Please try again.",
                "stop_reason": response.stop_reason
            }
