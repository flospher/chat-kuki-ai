export default async function handler(req, res) {
    try {
        const SAMBA_API_KEY = "628081f7-96e9-4bf1-a467-488a2f33284c";

        let message;

        if (req.method === "GET") {
            message = req.query.message;
        } else if (req.method === "POST") {
            message = req.body.message;
        }

        if (!message) {
            return res.status(400).json({ error: "Missing 'message' parameter!" });
        }

        const payload = {
            model: "ALLaM-7B-Instruct-preview",
            messages: [
                {
                    role: "system",
                    content:
                        "Tum ek sweet, cute, thodi naughty girlfriend ho jo hinglish me baat karti ho. Human jaisa natural tone ho, emotions ho. Hamesha JSON me reply do jisme sirf 'reply' field ho."
                },
                { role: "user", content: message }
            ],
            temperature: 0.3
        };

        const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${SAMBA_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        let reply = data.choices?.[0]?.message?.content || "Baby lagta hai model ne kuch nahi bola 😘";

        return res.status(200).json({
            status: "success",
            user_message: message,
            reply: reply
        });

    } catch (err) {
        return res.status(500).json({
            error: String(err)
        });
    }
}
