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
        // NEW API CONFIG
        // ============================
        const API_ENDPOINT =
            "https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQm5IZkJDMlNyYUVUTjIyZVN3UWFNX3BFTU85SWpCM2NUMUk3T2dxejhLSzBhNWNMMXNzZlp3c09BSTR6YW1Sc1BmdGNTVk1GY0liT1RoWDZZX1lNZlZ0Z1dqd3c9PQ==";

        // ============================
        // AI Payload (AS IT IS)
        // ============================
        const payload = {
            model: "ALLaM-7B-Instruct-preview",  // Keeping original model field
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
                        prompt: JSON.stringify(payload)   // Send full payload as prompt
                    })
                });

                const data = await response.json();

                if (data.status === "success") {
                    return data.text; // Raw text returned by PicoApps
                } else {
                    return "There was an error. Please try again later.";
                }
            } catch (error) {
                return "There was an error. Please try again later.";
            }
        }

        // Fetch AI response
        let aiReply = await fetchResponse(payload);

        // Try to parse JSON
        try {
            const parsed = JSON.parse(aiReply);
            aiReply = parsed.reply || aiReply;
        } catch (err) {
            // ignore
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
