import { useSyncExternalStore } from "react";
import { SEED_CANDIDATES, SEED_JOBS, ME, type Candidate, type Job, type Persona, type RoleId, type Stage } from "./data";
import type { AnswerFeedback, Category } from "./analyzer";

export type Session = {
  id: string; role: RoleId; roleName: string; type: string; date: number; score: number; durationSec: number;
  categories: Record<Category, number>; summary: string; source: "ai" | "rules"; jobId?: string; inviteId?: string;
  items: { q: string; tip: string; answer: string; feedback: AnswerFeedback }[];
};
export type Application = { id: string; jobId: string; status: "Applied" | "Interviewing" | "Offer" | "Rejected"; note: string; date: number };
export type Invite = { id: string; jobId: string; from: string; date: number; status: "pending" | "done"; sessionId?: string; candidateId: string };
export type Notice = { id: string; text: string; date: number; read: boolean; for: Persona };

export type State = {
  version: number;
  persona: Persona;
  me: typeof ME & { headline: string };
  jobs: Job[];
  candidates: Candidate[];
  sessions: Session[];
  applications: Application[];
  saved: string[];
  invites: Invite[];
  notices: Notice[];
};

const KEY = "hireloop.v1";
const day = 864e5;
const uid = () => Math.random().toString(36).slice(2, 9);

function seedSessions(): Session[] {
  const mk = (daysAgo: number, role: RoleId, roleName: string, score: number, cats: number[]): Session => ({
    id: uid(), role, roleName, type: "mixed", date: Date.now() - daysAgo * day, score, durationSec: 600 + score * 3,
    categories: { Structure: cats[0], Relevance: cats[1], Clarity: cats[2], Depth: cats[3], Confidence: cats[4] },
    summary: "Practice session from your history.", source: "rules", items: [],
  });
  return [
    mk(1, "backend", "Backend Engineer", 84, [86, 82, 88, 78, 84]),
    mk(3, "fullstack", "Full-stack Developer", 78, [80, 76, 82, 70, 80]),
    mk(6, "backend", "Backend Engineer", 72, [70, 74, 80, 64, 72]),
    mk(10, "frontend", "Frontend Engineer", 66, [62, 70, 74, 58, 66]),
    mk(14, "fullstack", "Full-stack Developer", 61, [58, 64, 70, 54, 60]),
  ];
}

export function initialState(): State {
  return {
    version: 1,
    persona: "candidate",
    me: { ...ME, headline: "Full-stack developer who loves clean APIs and calm UIs" },
    jobs: SEED_JOBS,
    candidates: SEED_CANDIDATES,
    sessions: seedSessions(),
    applications: [
      { id: uid(), jobId: "j14", status: "Interviewing", note: "", date: Date.now() - 5 * day },
      { id: uid(), jobId: "j3", status: "Applied", note: "", date: Date.now() - 2 * day },
    ],
    saved: ["j1", "j12"],
    invites: [{ id: "inv1", jobId: "j1", from: "Daniel Reed · TalentBridge", date: Date.now() - 3600e3 * 5, status: "pending", candidateId: "me" }],
    notices: [
      { id: uid(), text: "Daniel Reed invited you to an AI screening for Backend Engineer at Northwind Labs.", date: Date.now() - 3600e3 * 5, read: false, for: "candidate" },
      { id: uid(), text: "Sara Kola accepted the offer call for Backend Engineer.", date: Date.now() - 3600e3 * 26, read: false, for: "recruiter" },
      { id: uid(), text: "Your Backend Engineer listing passed 400 views.", date: Date.now() - 3600e3 * 30, read: false, for: "company" },
    ],
  };
}

function load(): State {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s && s.version === 1) return s;
  } catch { /* ignore */ }
  return initialState();
}

let state: State = load();
const listeners = new Set<() => void>();

export function getState() { return state; }
export function setState(fn: (s: State) => State) {
  state = fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ }
  listeners.forEach((l) => l());
}
export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => select(state),
  );
}
export function resetDemo() { setState(() => initialState()); }

// ---------- actions ----------
const notice = (s: State, text: string, who: Persona): State => ({ ...s, notices: [{ id: uid(), text, date: Date.now(), read: false, for: who }, ...s.notices].slice(0, 30) });

export const actions = {
  setPersona: (p: Persona) => setState((s) => ({ ...s, persona: p })),
  toggleSave: (jobId: string) => setState((s) => ({ ...s, saved: s.saved.includes(jobId) ? s.saved.filter((x) => x !== jobId) : [...s.saved, jobId] })),
  apply: (jobId: string, note: string) => setState((s) => {
    if (s.applications.some((a) => a.jobId === jobId)) return s;
    const job = s.jobs.find((j) => j.id === jobId)!;
    const meCand: Candidate = {
      id: "me-" + jobId, name: s.me.name, title: s.me.title, location: s.me.location, years: s.me.years, skills: s.me.skills,
      score: s.sessions[0]?.score ?? null, color: "#8b6cff", jobId, stage: "Applied", available: "2 weeks", me: true,
    };
    let next: State = { ...s, applications: [{ id: uid(), jobId, status: "Applied", note, date: Date.now() }, ...s.applications], candidates: [meCand, ...s.candidates] };
    next = notice(next, `${s.me.name} applied to ${job.title} (${job.company}).`, "recruiter");
    next = notice(next, `New applicant for ${job.title}: ${s.me.name}.`, "company");
    return next;
  }),
  withdraw: (appId: string) => setState((s) => {
    const app = s.applications.find((a) => a.id === appId);
    return { ...s, applications: s.applications.filter((a) => a.id !== appId), candidates: s.candidates.filter((c) => c.id !== "me-" + app?.jobId) };
  }),
  saveSession: (sess: Session) => setState((s) => {
    let next: State = { ...s, sessions: [sess, ...s.sessions] };
    if (sess.inviteId) {
      const inv = s.invites.find((i) => i.id === sess.inviteId);
      next.invites = s.invites.map((i) => (i.id === sess.inviteId ? { ...i, status: "done", sessionId: sess.id } : i));
      if (inv) {
        next.candidates = next.candidates.map((c) => (c.me && c.jobId === inv.jobId ? { ...c, score: sess.score, stage: c.stage === "Applied" ? "Screening" : c.stage, interview: sess.id } : c));
        const job = s.jobs.find((j) => j.id === inv.jobId);
        next = notice(next, `${s.me.name} completed the AI screening for ${job?.title}: ${sess.score}%.`, "recruiter");
      }
    }
    next.candidates = next.candidates.map((c) => (c.me ? { ...c, score: c.interview ? c.score : sess.score } : c));
    return next;
  }),
  moveCandidate: (id: string, stage: Stage) => setState((s) => {
    const c = s.candidates.find((x) => x.id === id);
    let next: State = { ...s, candidates: s.candidates.map((x) => (x.id === id ? { ...x, stage } : x)) };
    if (c?.me) {
      const map: Record<Stage, Application["status"]> = { Applied: "Applied", Screening: "Interviewing", Interview: "Interviewing", Offer: "Offer", Hired: "Offer" };
      next.applications = next.applications.map((a) => (a.jobId === c.jobId ? { ...a, status: map[stage] } : a));
      const job = s.jobs.find((j) => j.id === c.jobId);
      next = notice(next, `Your application for ${job?.title} moved to ${stage}.`, "candidate");
    }
    return next;
  }),
  rejectCandidate: (id: string) => setState((s) => {
    const c = s.candidates.find((x) => x.id === id);
    let next: State = { ...s, candidates: s.candidates.filter((x) => x.id !== id) };
    if (c?.me) {
      next.applications = next.applications.map((a) => (a.jobId === c.jobId ? { ...a, status: "Rejected" } : a));
      const job = s.jobs.find((j) => j.id === c.jobId);
      next = notice(next, `Update on ${job?.title}: the team decided not to move forward this time.`, "candidate");
    }
    return next;
  }),
  invite: (candidateId: string, jobId: string) => setState((s) => {
    const job = s.jobs.find((j) => j.id === jobId)!;
    const cand = s.candidates.find((c) => c.id === candidateId);
    const isMe = cand?.me || candidateId === "me";
    if (isMe) {
      if (s.invites.some((i) => i.jobId === jobId && i.status === "pending")) return s;
      let next: State = { ...s, invites: [{ id: uid(), jobId, from: "Daniel Reed · TalentBridge", date: Date.now(), status: "pending", candidateId: "me" }, ...s.invites] };
      next = notice(next, `Daniel Reed invited you to an AI screening for ${job.title} at ${job.company}.`, "candidate");
      return next;
    }
    return { ...s, candidates: s.candidates.map((c) => (c.id === candidateId ? { ...c, stage: c.stage === "Applied" ? "Screening" : c.stage } : c)) };
  }),
  postJob: (job: Job) => setState((s) => notice({ ...s, jobs: [job, ...s.jobs] }, `New role from ${job.company}: ${job.title}. It matches your profile.`, "candidate")),
  toggleJob: (id: string) => setState((s) => ({ ...s, jobs: s.jobs.map((j) => (j.id === id ? { ...j, open: !j.open } : j)) })),
  readNotices: (p: Persona) => setState((s) => ({ ...s, notices: s.notices.map((n) => (n.for === p ? { ...n, read: true } : n)) })),
  updateMe: (patch: Partial<State["me"]>) => setState((s) => ({ ...s, me: { ...s.me, ...patch } })),
};

export const newId = uid;
