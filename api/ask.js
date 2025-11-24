export default async function handler(req, res) {
    try {
        let message;

        // Support GET and POST
        if (req.method === "GET") {
            message = req.query.message;
        } else if (req.method === "POST") {
            message = req.body?.message || req.body?.text;
        } else {
            return res.status(405).json({ error: "Method not allowed" });
        }

        if (!message || message.trim() === "") {
            return res.status(400).json({
                status: "error",
                error: "Missing 'message'"
            });
        }

        // NEW GROK-4 API (sii3.top)
        const API_URL = `https://sii3.top/api/grok4.php?text=${encodeURIComponent(
            `You are Kuki — a fun, friendly, Hinglish-speaking Indian AI friend. 
            Baat karo bilkul natural Indian dost ki tarah, thodi Hinglish, thoda emotion, emojis thodi si, yaar, arre, sach mein wagairah use karo. 
            Indian context add karo jaise chai, traffic, mom ki daant, festivals etc. 
            Never say you are AI. Reply short and natural.

            User: ${message}
            Kuki:`
        )}`;

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; Bot/1.0)"
            }
        });

        if (!response.ok) {
            return res.status(500).json({
                status: "error",
                reply: "Sorry yaar, abhi thodi network problem hai... thodi der mein try karna! 😅"
            });
        }

        const text = await response.text();

        // Clean reply (kuch APIs extra text ya JSON error daalte hain)
        let cleanReply = text.trim();

        // Agar API kuch garbage ya error de raha ho to fallback
        if (!cleanReply || cleanReply.length < 2 || cleanReply.includes("error") || cleanReply.includes("404")) {
            cleanReply = "Arre yaar, kuch toh gadbad ho gayi... ek baar aur bol na? 😅";
        }

        return res.status(200).json({
            status: "success",
            reply: cleanReply
        });

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({
            status: "error",
            reply: "Yaar abhi server thoda down lag raha hai, thodi der baad try karna okay? 🥲"
        });
    }
}
