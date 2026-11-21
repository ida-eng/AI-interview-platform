// Rule-based interview feedback. Runs instantly in the browser and is the fallback
// when no AI model is configured. Pure functions, so they are unit-tested.

export type Category = "Structure" | "Relevance" | "Clarity" | "Depth" | "Confidence";
export const CATEGORIES: Category[] = ["Structure", "Relevance", "Clarity", "Depth", "Confidence"];

export type AnswerFeedback = {
  score: number;
  categories: Record<Category, number>;
  strengths: string[];
  improvements: string[];
  fillers: string[];
  words: number;
};

export type SessionFeedback = {
  score: number;
  categories: Record<Category, number>;
  summary: string;
  source: "ai" | "rules";
};

const FILLERS = ["um", "uh", "erm", "like", "you know", "basically", "actually", "literally", "sort of", "kind of", "i mean", "so yeah"];
const HEDGES = ["maybe", "i think", "i guess", "probably", "not sure", "i hope", "kind of", "sort of", "i feel like"];
const ACTION = ["built", "led", "designed", "created", "implemented", "launched", "improved", "reduced", "increased", "solved", "decided", "owned", "shipped", "automated", "migrated", "delivered", "organised", "organized", "wrote", "fixed", "analysed", "analyzed", "negotiated", "closed", "mentored"];
const SITUATION = ["when", "at my", "in my", "project", "team", "company", "client", "situation", "last year", "previous role", "while working"];
const TASK = ["goal", "needed to", "had to", "responsible", "task", "challenge", "problem", "deadline", "asked to", "objective"];
const RESULT = ["result", "as a result", "so that", "which led", "outcome", "improved", "reduced", "increased", "saved", "learned", "in the end", "finally", "%", "percent"];

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const words = (t: string) => (t.toLowerCase().match(/[a-z0-9%€$']+/g) || []);
const count = (text: string, phrase: string) => {
  const re = new RegExp(`(^|[^a-z])${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "g");
  return (text.match(re) || []).length;
};
const has = (text: string, list: string[]) => list.filter((p) => count(text, p) > 0);

export function analyzeAnswer(answer: string, keywords: string[], type: "behavioral" | "technical" = "behavioral"): AnswerFeedback {
  const text = ` ${answer.toLowerCase().replace(/\s+/g, " ").trim()} `;
  const w = words(answer);
  const n = w.length;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (n < 8) {
    return {
      score: n === 0 ? 0 : 12,
      categories: { Structure: 10, Relevance: 10, Clarity: n ? 30 : 0, Depth: 5, Confidence: n ? 30 : 0 },
      strengths: [],
      improvements: [n === 0 ? "No answer was recorded for this question." : "This answer is very short. Aim for at least 60–90 seconds of speaking."],
      fillers: [],
      words: n,
    };
  }

  // Structure: STAR markers for behavioural answers, explanation flow for technical ones
  const s = has(text, SITUATION).length > 0, t = has(text, TASK).length > 0;
  const a = has(text, ACTION).length > 0 || count(text, "i") >= 3, r = has(text, RESULT).length > 0;
  const starParts = [s, t, a, r].filter(Boolean).length;
  const flow = has(text, ["first", "then", "next", "finally", "because", "for example", "the reason", "trade-off", "depends"]).length;
  const structure = type === "behavioral" ? 25 + starParts * 18 + Math.min(flow, 2) * 2 : 35 + Math.min(flow, 4) * 14;
  if (type === "behavioral") {
    if (starParts >= 3) strengths.push("Clear story structure: you set the context, explained your actions and closed with an outcome.");
    else {
      const missing = [!s && "the situation", !t && "your goal", !a && "what you did", !r && "the result"].filter(Boolean).join(", ");
      improvements.push(`Use the STAR structure. Your answer is missing ${missing}.`);
    }
  } else if (flow >= 2) strengths.push("Your explanation follows a logical order and gives reasons.");
  else improvements.push("Walk through your answer step by step (first, then, finally) and explain why.");

  // Relevance: overlap with the question's key ideas
  const hit = keywords.filter((k) => text.includes(k.toLowerCase()));
  const relevance = 30 + (hit.length / Math.max(4, Math.min(keywords.length, 6))) * 70;
  if (hit.length >= 3) strengths.push(`You covered key ideas: ${hit.slice(0, 4).join(", ")}.`);
  else {
    const miss = keywords.filter((k) => !hit.includes(k)).slice(0, 3);
    improvements.push(`Tie it closer to the question. Consider mentioning ${miss.join(", ")}.`);
  }

  // Clarity: filler words and sentence length
  const fillers = FILLERS.flatMap((f) => Array(count(text, f)).fill(f));
  const fillerRate = fillers.length / n;
  const sentences = answer.split(/[.!?]+/).filter((x) => x.trim().length > 0);
  const avgLen = n / Math.max(1, sentences.length);
  let clarity = 100 - fillerRate * 600 - Math.max(0, avgLen - 28) * 1.5;
  if (fillers.length >= 3) improvements.push(`Cut filler words (${[...new Set(fillers)].slice(0, 4).join(", ")}). A short pause sounds more confident.`);
  else if (n > 30) strengths.push("Clean delivery with very few filler words.");

  // Depth: length in the sweet spot and concrete detail (numbers, tools, names)
  const numbers = (answer.match(/\d+(\.\d+)?\s?(%|percent|k|ms|users|people|hours|days|weeks|months)?/gi) || []).length;
  const [lo, hi] = type === "behavioral" ? [80, 230] : [60, 220];
  const lengthScore = n < lo ? (n / lo) * 70 : n > hi ? Math.max(55, 90 - (n - hi) / 6) : 90;
  const depth = lengthScore * 0.7 + Math.min(numbers, 3) * 10;
  if (numbers > 0) strengths.push("Concrete numbers make your impact believable.");
  else improvements.push("Add one concrete number: time saved, users, %, revenue or team size.");
  if (n < lo) improvements.push(`Go deeper. ${n} words is short; aim for ${lo}–${hi}.`);
  if (n > hi + 60) improvements.push("Trim it down. Lead with the key point and keep it under two minutes.");

  // Confidence: hedging vs strong verbs and ownership
  const hedges = HEDGES.reduce((acc, h) => acc + count(text, h), 0);
  const strong = has(text, ACTION).length;
  const confidence = 70 + Math.min(strong, 4) * 7 - hedges * 9;
  if (hedges >= 2) improvements.push("Fewer hedges like \"I think\" or \"maybe\". State what you did and decided.");
  else if (strong >= 2) strengths.push("Confident ownership: you used strong action verbs.");

  const categories = {
    Structure: clamp(structure),
    Relevance: clamp(relevance),
    Clarity: clamp(clarity),
    Depth: clamp(depth),
    Confidence: clamp(confidence),
  };
  const score = clamp(categories.Structure * 0.25 + categories.Relevance * 0.25 + categories.Clarity * 0.15 + categories.Depth * 0.2 + categories.Confidence * 0.15);
  return { score, categories, strengths: strengths.slice(0, 3), improvements: improvements.slice(0, 3), fillers, words: n };
}

export function summarize(items: AnswerFeedback[]): SessionFeedback {
  const cats = Object.fromEntries(CATEGORIES.map((c) => [c, items.length ? clamp(items.reduce((s, i) => s + i.categories[c], 0) / items.length) : 0])) as Record<Category, number>;
  const score = items.length ? clamp(items.reduce((s, i) => s + i.score, 0) / items.length) : 0;
  const sorted = [...CATEGORIES].sort((a, b) => cats[b] - cats[a]);
  const band = score >= 85 ? "Interview-ready" : score >= 70 ? "Strong foundation" : score >= 50 ? "Getting there" : "Keep practising";
  const summary = `${band}. Your strongest area is ${sorted[0].toLowerCase()}; focus next on ${sorted[sorted.length - 1].toLowerCase()}.`;
  return { score, categories: cats, summary, source: "rules" };
}

export function highlightFillers(answer: string): { text: string; filler: boolean }[] {
  const re = new RegExp(`\\b(${FILLERS.map((f) => f.replace(/ /g, "\\s+")).join("|")})\\b`, "gi");
  const out: { text: string; filler: boolean }[] = [];
  let last = 0;
  for (const m of answer.matchAll(re)) {
    if (m.index! > last) out.push({ text: answer.slice(last, m.index), filler: false });
    out.push({ text: m[0], filler: true });
    last = m.index! + m[0].length;
  }
  if (last < answer.length) out.push({ text: answer.slice(last), filler: false });
  return out;
}

export function matchScore(jobSkills: string[], mySkills: string[]): number {
  if (!jobSkills.length) return 0;
  const mine = new Set(mySkills.map((s) => s.toLowerCase()));
  const hits = jobSkills.filter((s) => mine.has(s.toLowerCase())).length;
  return Math.round(40 + (hits / jobSkills.length) * 60);
}
