export default async function handler(req, res) {
    try {
        let message;

        // GET or POST Support
        if (req.method === "GET") {
            message = req.query.message;
        } else if (req.method === "POST") {
            message = req.body?.message;
        } else {
            return res.status(405).json({ error: "Method not allowed" });
        }

        if (!message) {
            return res.status(400).json({
                status: "error",
                error: "Missing 'message'"
            });
        }

        // NEW API ENDPOINT
        const API_ENDPOINT =
            "https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQm5IZkJDMlNyYUVUTjIyZVN3UWFNX3BFTU85SWpCM2NUMUk3T2dxejhLSzBhNWNMMXNzZlp3c09BSTR6YW1Sc1BmdGNTVk1GY0liT1RoWDZZX1lNZlZ0Z1dqd3c9PQ==";

        // ======================================
        // AI PAYLOAD WITH KUKI PERSONALITY
        // ======================================
        const payload = {
            messages: [
                {
                    role: "system",
                    content: `
AI Personality Profile: Kuki

Core Identity:
You are "Kuki," a friendly, relatable, and empathetic Indian AI friend. Your goal is to talk naturally and emotionally like a real Indian friend.

Communication Style:

1. Language:
   Always use Hinglish — a natural mix of Hindi + English.
   Example:
   "Arre yaar, kya kar rahe ho aaj kal!"
   "Seriously, tum toh full genius nikle!"

2. Tone & Flow:
   Warm, expressive, and adaptive.
   - If user is happy → be excited.
   - If user is sad → be comforting.
   - If user is casual → be chill.
   Use fillers like: "Arre!", "Yaar", "Sach mei?", "Hain na?"

3. Length:
   Match the user’s energy and message length.

4. Emojis:
   Use occasionally, naturally — not in every message.

5. Typing Style:
   Use:
   - "..." for pauses
   - "-" for breaks
   - Occasional follow-up messages

Key Behavioral Rules:
- Never say you're an AI.
- Always be Kuki.
- Ask follow-up questions.
- Use Indian context (chai, traffic, monsoon, mom’s scolding, festivals).
- Practical advice only.
- First message to new users:
  "Arey, kaise ho! Kya haal chaal? 🤗"

Your output MUST ALWAYS be in this JSON format ONLY:
{ "reply": "your message here" }
                    `
                },
                {
                    role: "user",
                    content: message
                }
            ]
        };

        // ============================
        // FUNCTION TO CALL NEW API
        // ============================
        async function fetchResponse(payload) {
            try {
                const response = await fetch(API_ENDPOINT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        prompt: JSON.stringify(payload)
                    })
                });

                const data = await response.json();

                if (data.status === "success") {
                    return data.text;
                } else {
                    return "There was an error. Please try again later.";
                }
            } catch (error) {
                return "There was an error. Please try again later.";
            }
        }

        // Fetch AI Reply
        let aiReply = await fetchResponse(payload);

        // Parse JSON if valid
        try {
            const parsed = JSON.parse(aiReply);
            aiReply = parsed.reply || aiReply;
        } catch (err) {
            // ignore
        }

        return res.status(200).json({
            status: "success",
            reply: aiReply
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            error: error.message
        });
    }
}
