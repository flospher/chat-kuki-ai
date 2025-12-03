import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    try {
        const promptPath = path.join(process.cwd(), "PROMPT.md");
        const systemPrompt = fs.readFileSync(promptPath, "utf8");

        let message =
            req.method === "GET"
                ? req.query.message
                : req.body?.message || req.body?.text;

        if (!message) {
            return res.status(400).json({ status: "error", message: "Missing message" });
        }

        const API_URL = "https://sii3.top/api/deepseek/api.php";
        const API_KEY = "DarkAI-DeepAI-68932C027912AAE0FDF979E1";

        // ✅ IMPORTANT: URL ENCODED FORMAT (NOT JSON)
        const bodyData = new URLSearchParams();
        bodyData.append("api", API_KEY);   // ✅ correct param name
        bodyData.append("prompt", `${systemPrompt}\n\nUser: ${message}\nKuki:`);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0"
            },
            body: bodyData.toString()
        });

        const raw = await response.text();

        if (!response.ok) {
            return res.status(500).json({
                status: "error",
                message: "API error",
                debug: raw
            });
        }

        let reply = raw;

        try {
            const parsed = JSON.parse(raw);
            reply = parsed.reply || parsed.response || parsed.message || raw;
        } catch {}

        reply = reply.replace(/\s+/g, " ").trim();

        if (!reply) reply = "Jaan thoda glitch aa gaya 💔 phir try karein?";

        return res.json({ status: "success", response: reply });

    } catch (e) {
        return res.status(500).json({
            status: "error",
            message: "Server error",
            debug: e.message
        });
    }
}
