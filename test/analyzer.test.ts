import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeAnswer, summarize, highlightFillers, matchScore } from "../src/analyzer.ts";

const kw = ["listened", "data", "compromise", "agreed", "discussed", "perspective", "decision", "result"];

const strong = `In my previous role at a fintech startup, our team had to choose a database for a new payments service and the deadline was three weeks away.
I disagreed with a senior colleague who wanted MongoDB. I listened to his perspective first, then I built a small benchmark and shared the data with the team.
We discussed the trade-offs openly and agreed on PostgreSQL because we needed transactions. As a result we shipped on time, and the service now handles 40000 payments a day with zero data inconsistencies.
I learned that bringing data to a disagreement keeps it about the decision, not about people.`;

const weak = `Um, I think I basically just, like, talked to them and, you know, maybe we kind of agreed eventually I guess.`;

test("a structured, specific answer scores well", () => {
  const f = analyzeAnswer(strong, kw, "behavioral");
  assert.ok(f.score >= 75, `score ${f.score}`);
  assert.ok(f.categories.Structure >= 80);
  assert.ok(f.strengths.length >= 2);
});

test("a vague answer with fillers and hedges scores low and explains why", () => {
  const f = analyzeAnswer(weak, kw, "behavioral");
  assert.ok(f.score < 55, `score ${f.score}`);
  assert.ok(f.fillers.length >= 4);
  assert.ok(f.improvements.some((i) => i.includes("filler")));
});

test("empty and tiny answers are handled", () => {
  assert.equal(analyzeAnswer("", kw).score, 0);
  assert.equal(analyzeAnswer("I agreed.", kw).score, 12);
});

test("session summary averages answers", () => {
  const a = analyzeAnswer(strong, kw), b = analyzeAnswer(weak, kw);
  const s = summarize([a, b]);
  assert.equal(s.score, Math.round((a.score + b.score) / 2));
  assert.match(s.summary, /strongest area/);
});

test("fillers are highlighted in place", () => {
  const parts = highlightFillers("Um, I like it, you know.");
  assert.deepEqual(parts.filter((p) => p.filler).map((p) => p.text.toLowerCase()), ["um", "like", "you know"]);
  assert.equal(parts.map((p) => p.text).join(""), "Um, I like it, you know.");
});

test("job match score rewards overlapping skills", () => {
  assert.equal(matchScore(["Python", "Django"], ["python", "django"]), 100);
  assert.equal(matchScore(["Python", "Django"], []), 40);
  assert.equal(matchScore(["A", "B", "C", "D"], ["a", "b"]), 70);
});
