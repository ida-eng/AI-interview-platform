import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ROLES, buildQuestions, type RoleId } from "../data";
import { CATEGORIES, highlightFillers } from "../analyzer";
import { getFeedback } from "../ai";
import { actions, newId, useStore, type Session } from "../store";
import { Bars, Icon, Radar, Ring, fmtTime, go, toast } from "../ui";

type Rec = {
  continuous: boolean; interimResults: boolean; lang: string;
  onresult: ((e: any) => void) | null; onend: (() => void) | null; onerror: ((e: any) => void) | null;
  start: () => void; stop: () => void;
};

const TYPES = [
  { id: "mixed", label: "Mixed", sub: "Behavioural + technical" },
  { id: "behavioral", label: "Behavioural", sub: "Stories and soft skills" },
  { id: "technical", label: "Technical", sub: "Role-specific depth" },
] as const;

// ---------------- setup ----------------
export function PracticeSetup({ params }: { params: URLSearchParams }) {
  const jobs = useStore((s) => s.jobs);
  const job = jobs.find((j) => j.id === params.get("job"));
  const inviteId = params.get("invite") || "";
  const [role, setRole] = useState<RoleId>((job?.role || params.get("role") || "backend") as RoleId);
  const [type, setType] = useState<"mixed" | "behavioral" | "technical">("mixed");
  const [count, setCount] = useState(job ? 5 : 3);
  const [voice, setVoice] = useState(true);

  const start = () => {
    const q = new URLSearchParams({ role, type, n: String(count), voice: voice ? "1" : "0" });
    if (job) q.set("job", job.id);
    if (inviteId) q.set("invite", inviteId);
    go(`/c/room?${q}`);
  };

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">{inviteId ? "AI screening" : "Practice"}</p>
          <h1>{job ? <>Prepare for <em>{job.title}</em></> : <>Set up your <em>mock interview</em></>}</h1>
          {job && <p className="muted">{job.company} · {job.location}. Questions are tailored to the role.</p>}
        </div>
      </header>

      <div className="setup">
        <section className="card">
          <h3 className="card-title">1. Choose a role</h3>
          <div className="role-grid">
            {ROLES.map((r) => (
              <button key={r.id} className={`role ${role === r.id ? "on" : ""}`} onClick={() => setRole(r.id)} aria-pressed={role === r.id}>
                <span className="role-ico"><Icon name={r.icon} size={20} /></span>
                <b>{r.name}</b>
                <small>{r.skills.slice(0, 3).join(" · ")}</small>
              </button>
            ))}
          </div>
        </section>

        <aside className="card setup-side">
          <h3 className="card-title">2. Interview style</h3>
          <div className="seg-list">
            {TYPES.map((t) => (
              <button key={t.id} className={`seg-item ${type === t.id ? "on" : ""}`} onClick={() => setType(t.id)} aria-pressed={type === t.id}>
                <b>{t.label}</b><small>{t.sub}</small>
              </button>
            ))}
          </div>
          <h3 className="card-title">3. Length</h3>
          <div className="seg">
            {[3, 5, 7].map((n) => <button key={n} className={count === n ? "on" : ""} onClick={() => setCount(n)} aria-pressed={count === n}>{n} questions<small>~{n * 2} min</small></button>)}
          </div>
          <label className="switch">
            <input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} />
            <span className="track"><i /></span>
            <span>Interviewer reads questions aloud</span>
          </label>
          <button className="btn primary big full" onClick={start}><Icon name="play" size={16} /> Start interview</button>
          <p className="tiny muted">Answer by voice (Chrome, Edge, Safari) or by typing. Nothing leaves your browser except the answers sent for feedback.</p>
        </aside>
      </div>
    </div>
  );
}

// ---------------- interview room ----------------
export function Room({ params }: { params: URLSearchParams }) {
  const role = (params.get("role") || "backend") as RoleId;
  const type = (params.get("type") || "mixed") as "mixed" | "behavioral" | "technical";
  const n = Math.min(7, Math.max(1, Number(params.get("n")) || 3));
  const jobId = params.get("job") || undefined;
  const inviteId = params.get("invite") || undefined;
  const roleInfo = ROLES.find((r) => r.id === role) || ROLES[1];
  const questions = useMemo(() => buildQuestions(role, type, n), [role, type, n]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => questions.map(() => ""));
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(params.get("voice") !== "0");
  const [showTip, setShowTip] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [qElapsed, setQElapsed] = useState(0);
  const [phase, setPhase] = useState<"live" | "scoring">("live");
  const [canListen, setCanListen] = useState(false);
  const recRef = useRef<Rec | null>(null);
  const baseRef = useRef("");
  const levelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<{ ctx: AudioContext; stream: MediaStream; raf: number } | null>(null);

  const q = questions[idx];
  const answer = answers[idx];
  const setAnswer = (v: string) => setAnswers((a) => a.map((x, i) => (i === idx ? v : x)));

  // timers
  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => { setElapsed((e) => e + 1); setQElapsed((e) => e + 1); }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // text to speech
  const speak = useCallback((text: string) => {
    if (!voiceOn || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const vs = speechSynthesis.getVoices();
    u.voice = vs.find((v) => /Samantha|Google UK English Female|Serena|Karen|Moira|Female/i.test(v.name) && v.lang.startsWith("en")) || vs.find((v) => v.lang.startsWith("en")) || null;
    u.rate = 0.98; u.pitch = 1.02;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    speechSynthesis.speak(u);
  }, [voiceOn]);

  useEffect(() => {
    setQElapsed(0); setShowTip(false);
    const t = setTimeout(() => speak(q.q), 350);
    return () => clearTimeout(t);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  // speech recognition
  useEffect(() => {
    const R = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setCanListen(!!R);
    if (!R) return;
    const rec: Rec = new R();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
    rec.onresult = (e: any) => {
      let txt = "";
      for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
      const base = baseRef.current;
      setAnswers((a) => a.map((x, i) => (i === idxRef.current ? (base ? base.trimEnd() + " " : "") + txt.trim() : x)));
    };
    rec.onend = () => { setListening(false); stopMeter(); };
    rec.onerror = () => { setListening(false); stopMeter(); };
    recRef.current = rec;
    return () => { try { rec.stop(); } catch { /* */ } speechSynthesis?.cancel(); stopMeter(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const idxRef = useRef(0);
  idxRef.current = idx;

  const startMeter = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const an = ctx.createAnalyser(); an.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.frequencyBinCount);
      const loop = () => {
        an.getByteFrequencyData(buf);
        const lvl = buf.reduce((s, v) => s + v, 0) / buf.length / 128;
        levelRef.current?.style.setProperty("--lvl", Math.min(1, lvl * 1.6).toFixed(3));
        audioRef.current!.raf = requestAnimationFrame(loop);
      };
      audioRef.current = { ctx, stream, raf: requestAnimationFrame(loop) };
    } catch { /* mic meter is optional */ }
  };
  function stopMeter() {
    const a = audioRef.current;
    if (!a) return;
    cancelAnimationFrame(a.raf); a.stream.getTracks().forEach((t) => t.stop()); a.ctx.close().catch(() => {});
    audioRef.current = null;
    levelRef.current?.style.setProperty("--lvl", "0");
  }

  const toggleMic = () => {
    const rec = recRef.current;
    if (!rec) return;
    if (listening) { rec.stop(); setListening(false); stopMeter(); return; }
    speechSynthesis?.cancel();
    baseRef.current = answers[idx];
    try { rec.start(); setListening(true); startMeter(); } catch { toast("Microphone is busy, try again"); }
  };

  const next = async () => {
    if (listening) { recRef.current?.stop(); setListening(false); stopMeter(); }
    speechSynthesis?.cancel();
    if (idx < questions.length - 1) { setIdx(idx + 1); return; }
    await finish(answers);
  };

  const finish = async (all: string[]) => {
    setPhase("scoring");
    const techTypes = (i: number) => (type === "behavioral" ? "behavioral" : type === "technical" ? (i < 3 ? "technical" : "behavioral") : i % 2 === 1 ? "technical" : "behavioral");
    const qas = questions.map((qq, i) => ({ q: qq.q, keywords: qq.keywords, tip: qq.tip, answer: all[i] || "", type: techTypes(i) as "behavioral" | "technical" }));
    const { items, session } = await getFeedback(roleInfo.name, qas);
    const sess: Session = {
      id: newId(), role, roleName: roleInfo.name, type, date: Date.now(), score: session.score, durationSec: elapsed,
      categories: session.categories, summary: session.summary, source: session.source, jobId, inviteId,
      items: questions.map((qq, i) => ({ q: qq.q, tip: qq.tip, answer: all[i] || "", feedback: items[i] })),
    };
    actions.saveSession(sess);
    if (inviteId) toast("Screening complete, your results were shared with the recruiter");
    go(`/c/results/${sess.id}`);
  };

  const state = listening ? "listening" : speaking ? "speaking" : "idle";
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const limit = 120;

  if (phase === "scoring") {
    return (
      <div className="page center-page">
        <div className="scoring">
          <div className="orb big thinking" aria-hidden="true"><i /><i /><i /></div>
          <h2>Reviewing your answers…</h2>
          <p className="muted">Checking structure, relevance, clarity, depth and confidence.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="room">
      <div className="room-top">
        <button className="btn ghost small" onClick={() => { if (confirm("Leave this interview? Your answers will be lost.")) go("/c/practice"); }}><Icon name="back" size={16} /> Leave</button>
        <div className="steps" aria-label={`Question ${idx + 1} of ${questions.length}`}>
          {questions.map((_, i) => <span key={i} className={i < idx ? "done" : i === idx ? "on" : ""} />)}
        </div>
        <span className="pill-time"><Icon name="clock" size={15} /> {fmtTime(elapsed)}</span>
      </div>

      <div className="room-grid">
        <section className="interviewer">
          <div className="int-head">
            <span className="live"><i /> {inviteId ? "AI screening" : "Mock interview"} · {roleInfo.name}</span>
            <button className="icon-btn light" onClick={() => { setVoiceOn((v) => !v); speechSynthesis?.cancel(); }} aria-label={voiceOn ? "Mute interviewer" : "Unmute interviewer"} title={voiceOn ? "Mute interviewer" : "Unmute interviewer"}>
              <Icon name={voiceOn ? "volume" : "micOff"} />
            </button>
          </div>
          <div ref={levelRef} className={`orb ${state}`} aria-hidden="true"><i /><i /><i /></div>
          <p className="int-state">{state === "speaking" ? "Asking…" : state === "listening" ? "Listening to you" : "Your turn when you're ready"}</p>
          <p className="q-num">Question {idx + 1} of {questions.length}</p>
          <h2 className="question" key={idx}>{q.q}</h2>
          <div className="int-actions">
            <button className="btn glass small" onClick={() => speak(q.q)}><Icon name="refresh" size={15} /> Repeat</button>
            <button className="btn glass small" onClick={() => setShowTip((t) => !t)} aria-expanded={showTip}><Icon name="lightbulb" size={15} /> {showTip ? "Hide hint" : "Hint"}</button>
          </div>
          {showTip && <p className="tip">{q.tip}</p>}
        </section>

        <section className="answer card">
          <div className="answer-head">
            <div>
              <h3>Your answer</h3>
              <p className="muted small">{canListen ? "Tap the mic and speak, or type below." : "Type your answer below (voice works in Chrome, Edge and Safari)."}</p>
            </div>
            <div className="q-timer">
              <Ring value={Math.min(100, (qElapsed / limit) * 100)} size={54} stroke={5} color={qElapsed > limit ? "var(--rose)" : "var(--violet)"} />
              <span>{fmtTime(qElapsed)}</span>
            </div>
          </div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") next(); }}
            placeholder={listening ? "Listening… start speaking" : "Start with the situation, what you did, and the result…"}
            aria-label="Your answer"
          />
          <div className="answer-foot">
            <button className={`mic ${listening ? "rec" : ""}`} onClick={toggleMic} disabled={!canListen} aria-label={listening ? "Stop recording" : "Start recording"} aria-pressed={listening}>
              <Icon name={listening ? "micOff" : "mic"} size={22} />
            </button>
            <div className="wave" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 6) * 0.08}s` }} className={listening ? "on" : ""} />)}</div>
            <span className="muted small wc">{words} words</span>
            <button className="btn primary" onClick={next} disabled={!answer.trim()}>
              {idx === questions.length - 1 ? "Finish & get feedback" : "Next question"} <Icon name="arrow" size={16} />
            </button>
          </div>
          {idx < questions.length - 1 && <button className="link-btn" onClick={() => setIdx(idx + 1)}>Skip this question</button>}
        </section>
      </div>
    </div>
  );
}

// ---------------- results ----------------
export function Results({ id }: { id: string }) {
  const sess = useStore((s) => s.sessions.find((x) => x.id === id));
  const jobs = useStore((s) => s.jobs);
  const [open, setOpen] = useState(0);
  if (!sess) return <div className="page"><p>Session not found.</p><a className="btn" href="#/c/dashboard">Back</a></div>;
  const job = jobs.find((j) => j.id === sess.jobId);
  const best = [...CATEGORIES].sort((a, b) => sess.categories[b] - sess.categories[a]);
  const colors: Record<string, string> = { Structure: "var(--violet)", Relevance: "var(--peach)", Clarity: "var(--mint)", Depth: "var(--sky)", Confidence: "var(--amber)" };

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">{sess.inviteId ? "AI screening results" : "Interview results"} · {new Date(sess.date).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</p>
          <h1>{sess.roleName}{job ? <> · <em>{job.company}</em></> : null}</h1>
        </div>
        <div className="head-actions">
          <a className="btn" href={`#/c/practice?role=${sess.role}${job ? `&job=${job.id}` : ""}`}><Icon name="refresh" size={16} /> Practise again</a>
          <a className="btn primary" href="#/c/dashboard">Dashboard</a>
        </div>
      </header>

      <section className="result-hero card">
        <Ring value={sess.score} size={168} stroke={14} label="overall" />
        <div className="result-copy">
          <span className={`source ${sess.source}`}><Icon name="spark" size={14} /> {sess.source === "ai" ? "AI feedback" : "Instant feedback"}</span>
          <h2>{sess.summary}</h2>
          <p className="muted">Best: <b>{best[0]}</b> ({sess.categories[best[0]]}) · Work on: <b>{best[best.length - 1]}</b> ({sess.categories[best[best.length - 1]]}) · {Math.round(sess.durationSec / 60)} min</p>
          {sess.inviteId && <p className="shared"><Icon name="send" size={15} /> Shared with Daniel Reed at TalentBridge</p>}
        </div>
        <div className="result-radar"><Radar data={sess.categories} size={250} /></div>
      </section>

      <section className="card">
        <h3 className="card-title">Score breakdown</h3>
        <Bars items={CATEGORIES.map((c) => ({ label: c, value: sess.categories[c], color: colors[c] }))} />
      </section>

      {sess.items.length > 0 && (
        <section className="qa-list">
          <h3 className="section-title">Question by question</h3>
          {sess.items.map((it, i) => (
            <article key={i} className={`qa card ${open === i ? "open" : ""}`}>
              <button className="qa-head" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span className={`qa-score ${it.feedback.score >= 80 ? "good" : it.feedback.score >= 60 ? "ok" : "low"}`}>{it.feedback.score}</span>
                <span className="qa-q"><small>Question {i + 1}</small>{it.q}</span>
                <Icon name="arrow" className="chev" />
              </button>
              {open === i && (
                <div className="qa-body">
                  <div className="your-answer">
                    <p className="label">Your answer · {it.feedback.words} words{it.feedback.fillers.length ? ` · ${it.feedback.fillers.length} filler words highlighted` : ""}</p>
                    <p>{it.answer ? highlightFillers(it.answer).map((p, k) => (p.filler ? <mark key={k}>{p.text}</mark> : <span key={k}>{p.text}</span>)) : <em className="muted">No answer recorded.</em>}</p>
                  </div>
                  <div className="fb-cols">
                    <div className="fb good"><h4><Icon name="check" size={16} /> What worked</h4>{it.feedback.strengths.length ? <ul>{it.feedback.strengths.map((s) => <li key={s}>{s}</li>)}</ul> : <p className="muted small">Nothing stood out yet. Use the tips on the right.</p>}</div>
                    <div className="fb improve"><h4><Icon name="target" size={16} /> Improve next time</h4><ul>{it.feedback.improvements.map((s) => <li key={s}>{s}</li>)}</ul></div>
                  </div>
                  <p className="coach"><Icon name="lightbulb" size={16} /> <b>Coach tip:</b> {it.tip}</p>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
