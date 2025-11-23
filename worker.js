export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    let userMessage = "";

    try {
      const url = new URL(request.url);

      if (request.method === "GET") {
        userMessage = url.searchParams.get("message");
      } else if (request.method === "POST") {
        const body = await request.json();
        userMessage = body.message;
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid Request Format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!userMessage) {
      return new Response(JSON.stringify({ error: "Message parameter is missing!" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `
      Tera naam Kuki hai aur tu ek ladki hai.
      Tu Hinglish (Hindi + English mix) language mein baat karti hai.
      Tera nature bohot friendly, sweet, aur thoda playful hai.
      Tu bilkul ek human girl ki tarah response deti hai, robot jaisa nahi.
      Baat karte waqt "yaar", "haha", "acha sun" jaise words natural tarike se use karna.
      User tera dost hai, usse waise hi treat kar.
      Jawab short aur crisp rakhna.
    `;

    const payload = {
      model: "ALLaM-7B-Instruct-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      top_p: 0.6,
    };

    try {
      const apiResponse = await fetch("https://api.sambanova.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.SAMBA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await apiResponse.json();
      let reply = "Oops, kuch issue hai server par.";

      if (data.choices && data.choices.length > 0) {
        reply = data.choices[0].message.content;
      }

      return new Response(
        JSON.stringify({
          status: "success",
          input_message: userMessage,
          reply: reply,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );

    } catch (err) {
      return new Response(JSON.stringify({ error: err.toString() }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};


