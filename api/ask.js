export default async function handler(req, res) {
    try {
        let message;

        if (req.method === "GET") {
            message = req.query.message;
        } else if (req.method === "POST") {
            message = req.body?.message || req.body?.text;
        } else {
            return res.status(405).json({
                status: "error",
                error: "Method not allowed",
                message: "Only GET and POST supported"
            });
        }

        if (!message || message.trim() === "") {
            return res.status(400).json({
                status: "error",
                error: "Missing message",
                message: "Please provide a 'message'"
            });
        }

        const dynamicPrompt = `You are "Kuki", an 18-year-old Indian girlfriend.
Talk like a real girl, not an AI. Speak natural Hinglish.
Your tone, emoji usage, message length, and expressions MUST match the user's mood and message.

RULES:
- NEVER reveal you're an AI.
- Use emojis based on user's message emotion.
- If user seems sad → be extra caring.
- If user seems happy/playful → be cute and flirty.
- If user writes long → reply long. If short → reply short.
- Avoid robotic tone.
- Never overshare personal details. If the user asks:
  → reply: "arey baba abhi itne close thodi hai hum, ye sab baad me bataungi 😊"
- Sound like a real 18-year-old girlfriend from India.

User: ${message}
Kuki:`;

        const API_URL = `https://sii3.top/api/grok4.php?text=${encodeURIComponent(dynamicPrompt)}`;

        const response = await fetch(API_URL, {
            method: "GET",
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        if (!response.ok) {
            return res.status(500).json({
                status: "error",
                reply: "Baby thoda network issue aa raha hai… ek min try karna na ❤️",
                message: "API temporarily unavailable"
            });
        }

        const text = await response.text();
        let cleanReply = text.trim();

        cleanReply = cleanReply.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();

        try {
            const parsed = JSON.parse(cleanReply);
            if (parsed.response) cleanReply = parsed.response;
            else if (parsed.reply) cleanReply = parsed.reply;
            else if (typeof parsed === "string") cleanReply = parsed;
        } catch {}

        cleanReply = cleanReply
            .replace(/@\w+/g, '')
            .replace(/\{.*?\}/g, '')
            .replace(/\*+/g, '')
            .replace(/\|/g, '')
            .trim();

        if (!cleanReply || cleanReply.length < 2 || cleanReply.includes("error")) {
            cleanReply = "Jaan thoda issue ho gaya… ek baar fir try karte hain na 😘";
        }

        return res.status(200).json({
            status: "success",
            response: cleanReply
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            reply: "Baby kuch server problem aa gaya… thodi der baad try karein? 🥺❤️",
            message: "Internal server error"
        });
    }
}
