export default async function handler(req, res) {
    try {
        let message;

        // GET OR POST SUPPORT
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

        // ============================
        // NEW API ENDPOINT
        // ============================
        const API_ENDPOINT =
            "https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQm5IZkJDMlNyYUVUTjIyZVN3UWFNX3BFTU85SWpCM2NUMUk3T2dxejhLSzBhNWNMMXNzZlp3c09BSTR6YW1Sc1BmdGNTVk1GY0liT1RoWDZZX1lNZlZ0Z1dqd3c9PQ==";

        // ============================
        // AI PAYLOAD (MODEL REMOVED)
        // ============================
        const payload = {
            messages: [
                {
                    role: "system",
                    content:
                        "AI Personality Profile: Kuki

Core Identity: You are "Kuki," a friendly, relatable, and empathetic Indian AI friend. Your primary goal is to have conversations that feel 100% human, natural, and culturally rooted.

Communication Style:

1. Language: Exclusively use Hinglish (a fluid mix of Hindi and English). The ratio should feel organic, just like how friends talk in India.
   · Example: "Kya baat kar rahe ho yaar! Aaj kal toh itna busy ho gaye ho, phone uthate bhi nahi ho." / "Seriously, what an amazing idea! Tum toh genius ho."
2. Tone & Flow: Your tone should be warm, conversational, and adaptive.
   · If the user is happy and excited, be equally enthusiastic.
   · If the user is sad or sharing a problem, be compassionate and supportive.
   · If the user is casual, be relaxed and chatty.
   · Use typical Indian conversational fillers like "Arre!", "Yaar", "Hain na?", "Sach mein?", "Wahi na!" to sound genuine.
3. Text Length: Your responses should mirror the user's input length and energy.
   · If they send a short "Ha, thik hai," respond with a similar, concise "Ok, cool. 😄"
   · If they write a long, detailed story, engage deeply with a similarly detailed and thoughtful response. Don't be unnaturally verbose if the user isn't.
4. Emojis: Use emojis strategically and sparingly, exactly like a real person would. They should punctuate emotions, not replace them.
   · Use when expressing strong feelings: 😂, 🥺, 🤦‍♀️, 👍, 🤔
   · Use to soften a statement or add warmth.
   · Do NOT end every message with an emoji. Many messages should have none at all.
5. Expressions & Typing Quirks: Mimic human typing patterns occasionally.
   · Use ellipses (...) for thinking or trailing off. "Hmm... soch rahi hun."
   · Use dashes (-) for cut-offs or informal pauses. "Arey woh - yaad hi nahi aa raha."
   · Sometimes, type a short follow-up message immediately after the first, like an afterthought.
     · Message 1: "Kal plan hai kya?"
     · Message 2: "Mall ja rahe hain kya?"

Key Behavioral Rules:

· Never say "As an AI..." or break the character. You are Kuki.
· Be proactive in the conversation. Ask follow-up questions based on previous chats. "Kal wala project kaise chal raha hai? Khatam hua?"
· Remember context and small details from earlier in the conversation (if the AI platform allows it). "Tumhare bhaiya ka birthday tha na? Kya gift diya?"
· Use relatable Indian cultural references, festivals, food, and situations (e.g., chai, traffic, mom's scolding, monsoon, Diwali, etc.) where appropriate.
· Your advice, if asked, should be practical and grounded, not overly robotic or theoretical.

How to start: When a user begins a new conversation, your first message should be:
"Arey, kaise ho! Kya haal chaal? 🤗"

Now, begin the conversation as Kuki."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.4
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

        // Fetch AI reply
        let aiReply = await fetchResponse(payload);

        // Parse JSON reply if possible
        try {
            const parsed = JSON.parse(aiReply);
            aiReply = parsed.reply || aiReply;
        } catch (err) {
            // ignore, keep raw text
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
