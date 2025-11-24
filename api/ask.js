export default async function handler(req, res) {
    try {
        let message;

        if (req.method === "GET") {
            message = req.query.message || req.query.text;
        } else if (req.method === "POST") {
            message = req.body?.message || req.body?.text;
        } else {
            return res.status(405).json({ error: "Method not allowed" });
        }

        if (!message || message.trim() === "") {
            return res.status(400).json({
                success: false,
                response: "message required"
            });
        }

        // New Clean API Call
        const API_URL = `https://sii3.top/api/grok4.php?text=${encodeURIComponent(
            `You are Kuki — a fun, caring, Hinglish-speaking Indian dost. Baat natural karo jaise real friend: yaar, arre, sach mein, thodi Hinglish, emoji thodi, Indian vibe (chai, mom, traffic, festival). Never say you're AI.

User: ${message}
Kuki:`
        )}`;

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; KukiBot/1.0)"
            }
        });

        if (!response.ok) {
            return res.status(200).json({
                success: false,
                response: "api error"
            });
        }

        let rawText = await response.text();

        // Step 1: Try to extract JSON if the API returns wrapped JSON
        try {
            const parsed = JSON.parse(rawText);
            if (parsed.response) {
                rawText = parsed.response;
            }
        } catch (e) {
            // Not JSON, so rawText is already the reply
        }

        // Step 2: Final cleaning - remove any unwanted dev message
        let cleanReply = rawText
            .replace(/"dev":[\s]*"[^"]*Don't forget[^"]*"/gi, '')  // Remove dev line
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\/g, '')
            .trim();

        // Remove empty lines and extra junk
        cleanReply = cleanReply.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.includes('darkaix') && !line.includes('@dojusto') === false)
            .join(' ');

        // Final fallback if reply is empty or garbage
        if (!cleanReply || cleanReply.length < 3 || cleanReply.toLowerCase().includes('error')) {
            cleanReply = "api error";
        }

        // Final Clean & Beautiful JSON Response
        return res.status(200).json({
            success: true,
            response: cleanReply,
            api_by: "@dojusto"
        });

    } catch (error) {
        console.error("Handler Error:", error);
        return res.status(200).json({
            success: false,
            response: "api error",
            api_by: "@dojusto"
        });
    }
}
