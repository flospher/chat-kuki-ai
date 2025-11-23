export default async function handler(req, res) {
    try {
        const SAMBA_API_KEY = "628081f7-96e9-4bf1-a467-488a2f33284c";

        // ---- Get message from GET or POST ----
        let message =
            req.method === "GET"
                ? req.query.message
                : req.body?.message;

        if (!message) {
            return res.status(400).json({
                status: "error",
                error: "Missing `message`"
            });
        }

        // ---- AI Prompt ----
        const payload = {
            model: "ALLaM-7B-Instruct-preview",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a sweet, romantic girlfriend who talks in Hinglish. "
                        + "Be emotional, natural, human-like. Response always in JSON format "
                        + "like { reply: \"...\" }."
                },
                { role: "user", content: message }
            ],
            temperature: 0.4,
            top_p: 0.9
        };

        // ---- Fetch from SambaNova ----
        const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${SAMBA_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // ---- Extract safe reply ----
        let reply =
            data?.choices?.[0]?.message?.content ||
            "Baby shayad model ne reply nahi diya 😘";

        // Try to parse if AI returns JSON already
        let finalReply;
        try {
            finalReply = JSON.parse(reply).reply || reply;
        } catch {
            finalReply = reply; // AI text is raw
        }

        // ---- Structured JSON response ----
        return res.status(200).json({
            status: "success",
            input: message,
            ai: {
                reply: finalReply,
                raw: reply
            }
        });

    } catch (err) {
        return res.status(500).json({
            status: "error",
            error: err.message || String(err)
        });
    }
}
