import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    try {
        // Read system prompt from PROMPT.md
        const promptPath = path.join(process.cwd(), "PROMPT.md");
        const systemPrompt = fs.readFileSync(promptPath, "utf8");

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

        // Combine system prompt + user message
        const fullPrompt = `${systemPrompt}\n\nUser: ${message}\nKuki:`;

        // NEW API → sii3.top DeepSeek
        const API_URL = "https://sii3.top/api/deepseek/api.php";
        const API_KEY = "DarkAI-DeepAI-68932C027912AAE0FDF979E1";

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0",
                "Authorization": `Bearer ${API_KEY}`  // agar key header mein chahiye ho
            },
            body: JSON.stringify({
                message: fullPrompt,
                // kuch extra parameters agar zarurat ho to yahan add kar sakte ho
                stream: false
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("DeepSeek API Error:", errText);
            return res.status(500).json({
                status: "error",
                reply: "Baby thoda network issue aa raha hai… ek min try karna na ❤️",
                message: "API temporarily unavailable"
            });
        }

        const data = await response.json();

        // DeepSeek usually response ko "reply" ya "response" field mein deta hai
        let cleanReply = data.reply || data.response || data.output || data.text || JSON.stringify(data);

        // Cleanup (tumhare purane filters same rakhe hain)
        cleanReply = cleanReply
            .replace(/\\n/g, " ")
            .replace(/\s+/g, " ")
            .replace(/@\w+/g, "")
            .replace(/\{.*?\}/g, "")
            .replace(/\*+/g, "")
            .replace(/\|/g, "")
            .trim();

        // Fallback agar reply empty ya error jaisa ho
        if (!cleanReply || cleanReply.length < 2 || cleanReply.toLowerCase().includes("error")) {
            cleanReply = "Jaan thoda issue ho gaya… ek baar fir try karte hain na 😘";
        }

        return res.status(200).json({
            status: "success",
            response: cleanReply
        });

    } catch (error) {
        console.error("Handler Error:", error);
        return res.status(500).json({
            status: "error",
            reply: "Baby kuch server problem aa gaya… thodi der baad try karein? 🥺❤️",
            message: "Internal server error"
        });
    }
}
