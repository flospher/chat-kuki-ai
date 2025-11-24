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
                error: "Method not allowed"
            });
        }

        if (!message || message.trim() === "") {
            return res.status(400).json({
                status: "error",
                error: "Missing message parameter"
            });
        }

        const userMessage = message.toLowerCase().trim();
        let responseLength = "medium";
        let emotion = "friendly";
        let emoji = "😊";

        if (userMessage.includes('?') && (userMessage.includes('who') || userMessage.includes('what') || userMessage.includes('where') || userMessage.includes('when') || userMessage.includes('why') || userMessage.includes('how'))) {
            responseLength = "long";
            emotion = "helpful";
            emoji = "🤔";
        } else if (userMessage.includes('!') || userMessage.includes('amazing') || userMessage.includes('wow') || userMessage.includes('great')) {
            emotion = "excited";
            emoji = "🎉";
        } else if (userMessage.includes('sad') || userMessage.includes('upset') || userMessage.includes('cry') || userMessage.includes('depressed')) {
            emotion = "caring";
            emoji = "🤗";
        } else if (userMessage.includes('love') || userMessage.includes('miss') || userMessage.includes('care')) {
            emotion = "affectionate";
            emoji = "❤️";
        } else if (userMessage.includes('angry') || userMessage.includes('hate') || userMessage.includes('annoying')) {
            emotion = "calm";
            emoji = "☺️";
        } else if (userMessage.length < 10) {
            responseLength = "short";
            emotion = "playful";
            emoji = "😄";
        }

        const personalInfoBlock = userMessage.includes('age') || userMessage.includes('old') || userMessage.includes('live') || userMessage.includes('address') || userMessage.includes('phone') || userMessage.includes('number') || userMessage.includes('name') || userMessage.includes('where are you') || userMessage.includes('location') ? 
            "IMPORTANT: If asked about personal details like age, location, phone, address, or real name, politely decline saying we're not close enough yet and you don't share personal information easily. You're 18 but only share this if specifically asked about age." : 
            "";

        const advancedPrompt = `You are Kuki - an 18-year-old Indian girl who talks like a real friend. You're sweet, playful, and use Hinglish naturally.

Personality: Friendly, caring, sometimes shy, uses Indian slang like "yaar", "arre", "wah", "accha". You're modern but respect Indian values.

Response Style: 
- ${responseLength} response
- ${emotion} tone
- Use ${emoji} appropriately
- Mix Hindi and English naturally
- Be relatable like an Indian friend
- Never reveal you're AI
- ${personalInfoBlock}

User: ${message}
Kuki:`;

        const API_URL = `https://sii3.top/api/grok4.php?text=${encodeURIComponent(advancedPrompt)}`;

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; Bot/1.0)"
            }
        });

        if (!response.ok) {
            return res.status(500).json({
                status: "error",
                reply: "Sorry yaar, network issue ho raha hai... thodi der baad try karna!"
            });
        }

        const text = await response.text();

        let cleanReply = text.trim()
            .replace(/\\n/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/\{.*?\}/g, '')
            .replace(/dev.*?@\w+/gi, '')
            .replace(/support.*?channel/gi, '')
            .replace(/api by.*?/gi, '')
            .replace(/@\w+/g, '')
            .replace(/\*+/g, '')
            .replace(/\|/g, '')
            .trim();

        try {
            const parsedResponse = JSON.parse(cleanReply);
            if (parsedResponse.response) {
                cleanReply = parsedResponse.response;
            } else if (parsedResponse.reply) {
                cleanReply = parsedResponse.reply;
            }
        } catch (e) {
        }

        if (!cleanReply || cleanReply.length < 2 || cleanReply.includes("error") || cleanReply.includes("404")) {
            cleanReply = "Arre yaar, kuch technical issue ho raha hai... phir se try karo na! 😊";
        }

        return res.status(200).json({
            status: "success",
            reply: cleanReply,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({
            status: "error",
            reply: "Server issue ho raha hai, thodi der baad baat karte hain!"
        });
    }
}
