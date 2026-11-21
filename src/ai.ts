import { analyzeAnswer, summarize, type AnswerFeedback, type SessionFeedback } from "./analyzer";

export type QA = { q: string; keywords: string[]; tip: string; answer: string; type: "behavioral" | "technical" };

/** Score every answer with the built-in rules, then ask the AI endpoint (if configured) to refine the written feedback. */
export async function getFeedback(roleName: string, qas: QA[]): Promise<{ items: AnswerFeedback[]; session: SessionFeedback }> {
  const items = qas.map((x) => analyzeAnswer(x.answer, x.keywords, x.type));
  const session = summarize(items);
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: roleName, answers: qas.map((x) => ({ question: x.q, answer: x.answer })) }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    if (!Array.isArray(data.items) || data.items.length !== items.length) throw new Error("bad shape");
    const merged = items.map((it, i) => {
      const ai = data.items[i] || {};
      const score = typeof ai.score === "number" ? Math.round(it.score * 0.4 + ai.score * 0.6) : it.score;
      return {
        ...it,
        score,
        strengths: Array.isArray(ai.strengths) && ai.strengths.length ? ai.strengths.slice(0, 3) : it.strengths,
        improvements: Array.isArray(ai.improvements) && ai.improvements.length ? ai.improvements.slice(0, 3) : it.improvements,
      };
    });
    const s = summarize(merged);
    return { items: merged, session: { ...s, summary: typeof data.summary === "string" ? data.summary : s.summary, source: "ai" } };
  } catch {
    return { items, session };
  }
}
