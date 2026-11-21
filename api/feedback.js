// Vercel serverless function: refines interview feedback with Google Gemini.
// Set GEMINI_API_KEY in the Vercel project settings. Without it the app falls back
// to its built-in rule-based scoring.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(501).json({ error: "AI not configured" });

  const { role = "Software Engineer", answers = [] } = req.body || {};
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > 8) return res.status(400).json({ error: "Send 1–8 answers" });
  const clean = answers.map((a) => ({ question: String(a.question || "").slice(0, 400), answer: String(a.answer || "").slice(0, 4000) }));

  const prompt = `You are an experienced, kind but honest interviewer hiring a ${String(role).slice(0, 80)}.
Score each answer from 0 to 100 and give feedback the candidate can act on.
Return JSON only, exactly in this shape:
{"summary": "two sentences on overall performance",
 "items": [{"score": 0-100, "strengths": ["max 2 short points"], "improvements": ["max 3 short, specific points"]}]}
Keep the items in the same order as the answers. An empty answer scores 0.

${clean.map((a, i) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer || "(no answer)"}`).join("\n\n")}`;

  try {
    // Model names change over time, so try the configured one first and then current aliases.
    const models = [process.env.GEMINI_MODEL, "gemini-flash-latest", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-lite-latest"].filter(Boolean);
    let r;
    for (const model of models) {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
        }),
      });
      if (![404, 429, 500, 503].includes(r.status)) break; // not found or busy: try the next model
    }
    if (!r.ok) return res.status(502).json({ error: `Model error ${r.status}` });
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(502).json({ error: "AI request failed" });
  }
}
