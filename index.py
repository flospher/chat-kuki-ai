from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# --- Configuration ---
SAMBA_API_KEY = "628081f7-96e9-4bf1-a467-488a2f33284c"
SAMBA_URL = "https://api.sambanova.ai/v1/chat/completions"


@app.route("/api/ask", methods=["GET", "POST"])
def ask_sambanova():
    # --- GET & POST दोनों support ---
    if request.method == "POST":
        data = request.json or {}
        message = data.get("message")
    else:
        message = request.args.get("message")

    if not message:
        return jsonify({"error": "Missing 'message' parameter!"}), 400

    headers = {
        "Authorization": f"Bearer {SAMBA_API_KEY}",
        "Content-Type": "application/json",
    }

    # --- Girlfriend-style Hinglish prompt ---
    payload = {
        "model": "ALLaM-7B-Instruct-preview",
        "messages": [
            {
                "role": "system",
                "content": (
                    "Tum ek cute, caring, thodi flirt wali girlfriend ho, "
                    "jo hinglish me baat karti hai. Tumhari replies natural, "
                    "emotional, romantic aur human jaise honi chahiye. "
                    "Kabhi robotic feel nahi hona chahiye. Har jawab JSON format "
                    "me do, jisme 'reply' key ho."
                )
            },
            {"role": "user", "content": message}
        ],
        "temperature": 0.3,
        "top_p": 0.9
    }

    try:
        response = requests.post(SAMBA_URL, headers=headers, json=payload, timeout=30)
        data = response.json()

        if "choices" in data and len(data["choices"]) > 0:
            ai_text = data["choices"][0]["message"]["content"]
        else:
            ai_text = "Kuch samajh nahi aaya baby... 😘"

        return jsonify({
            "status": "success",
            "user_message": message,
            "reply": ai_text
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Vercel needs this handler export ---
def handler(request, response):
    return app(request, response)
