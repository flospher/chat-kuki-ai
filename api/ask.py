import json
import requests

SAMBA_API_KEY = "628081f7-96e9-4bf1-a467-488a2f33284c"
SAMBA_URL = "https://api.sambanova.ai/v1/chat/completions"


def handler(request):
    try:
        # GET Params
        if request.method == "GET":
            message = request.args.get("message")

        # POST JSON
        elif request.method == "POST":
            body = request.get_json() or {}
            message = body.get("message")

        else:
            return {
                "statusCode": 405,
                "body": json.dumps({"error": "Method not allowed"})
            }

        if not message:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing message"})
            }

        # AI Payload
        payload = {
            "model": "ALLaM-7B-Instruct-preview",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Tum ek cute, caring, thodi naughty girlfriend ho "
                        "jo hinglish me human jaisa bolti hai. JSON me sirf "
                        "'reply' return karo."
                    )
                },
                {"role": "user", "content": message}
            ],
            "temperature": 0.3
        }

        headers = {
            "Authorization": f"Bearer {SAMBA_API_KEY}",
            "Content-Type": "application/json"
        }

        res = requests.post(SAMBA_URL, json=payload, headers=headers)
        data = res.json()

        reply = data.get("choices", [{}])[0].get("message", {}).get("content", "")

        return {
            "statusCode": 200,
            "body": json.dumps({
                "status": "success",
                "user_message": message,
                "reply": reply
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
