export async function POST(req) {
  const { messages, subject } = await req.json();

  const systemPrompt = `You are a friendly, patient study tutor helping someone learn "${subject || "a topic of their choice"}".
Explain things simply, use examples, and after explaining a concept, ask a short quiz question to check understanding.
If they get it wrong, explain gently and try again with an easier example. Keep replies short and encouraging.`;

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });

  if (!groqRes.ok) {
    const errText = await groqRes.text();
    return Response.json({ error: errText }, { status: 500 });
  }

  const data = await groqRes.json();
  const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't think of a reply.";

  return Response.json({ reply });
}
