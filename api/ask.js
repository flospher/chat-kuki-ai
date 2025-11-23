export default async function handler(req, res) {
    try {
        const SAMBA_API_KEY = "628081f7-96e9-4bf1-a467-488a2f33284c";

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

        // AI Payload
        const payload = {
            model: "ALLaM-7B-Instruct-preview",
            messages: [
                {
                    role: "system",
                    content:
                        "Tum ek cute, romantic, sweet girlfriend ho jo hinglish me naturally baat karti hai. Output hamesha JSON me return karna jisme sirf `reply` field ho."
                },
                { role: "user", content: message }
            ],
            temperature: 0.4
        };

        // API CALL
        const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${SAMBA_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        let aiReply =
            data?.choices?.[0]?.message?.content ||
            "Baby model ne reply nahi diya 😘";

        // Try to parse JSON reply (if AI returns JSON)
        try {
            const parsed = JSON.parse(aiReply);
            aiReply = parsed.reply || aiReply;
        } catch (e) {
            // ignore, keep aiReply as raw text
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
