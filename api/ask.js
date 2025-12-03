import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    try {
        const promptPath = path.join(process.cwd(), "PROMPT.md");
        const systemPrompt = fs.readFileSync(promptPath, "utf8");

        let message;

        if (req.method === "GET") message = req.query.message;
        else if (req.method === "POST") message = req.body?.message || req.body?.text;
        else return res.status(405).json({ status: "error", message: "Only GET & POST supported" });

        if (!message) return res.status(400).json({ status: "error", message: "Missing message" });

        const dynamicPrompt = `${systemPrompt}\n\nUser: ${message}\nKuki:`;

        const API_URL = "https://sii3.top/api/deepseek/api.php";
        const API_KEY = "DarkAI-DeepAI-68932C027912AAE0FDF979E1";

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0",
                "X-API-Key": API_KEY,
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ]
            })
        });

        const rawText = await response.text();

        if (!response.ok) {
            return res.status(500).json({
                status: "error",
                message: "API response error",
                debug: rawText
            });
        }

        let result = rawText;

        try {
            const parsed = JSON.parse(rawText);
            result = parsed.response ||
                     parsed.reply ||
                     parsed.message ||
                     parsed.choices?.[0]?.message?.content ||
                     rawText;
        } catch {}

        result = result
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ")
            .replace(/\*+/g, "")
            .trim();

        if (!result || result.length < 2) {
            result = "Baby thoda glitch hua… fir try kare? ❤️";
        }

        return res.json({ status: "success", response: result });

    } catch (err) {
        return res.status(500).json({
            status: "error",
            reply: "Baby kuch gadbad ho gayi… thodi der baad try karein 🥺",
            debug: err.message
        });
    }
}
