import { useEffect, useState } from "react";
import { ROLES, SEED_JOBS, type Persona } from "../data";
import { actions } from "../store";
import { Avatar, Icon, Logo, Ring, go } from "../ui";

const AUD: Record<Persona, { title: string; points: [string, string][]; cta: string; to: string }> = {
  candidate: {
    title: "Practise with an AI interviewer, then apply with confidence.",
    points: [["mic", "Voice interviews for 10 roles, with feedback on every answer"], ["chart", "Track readiness across structure, clarity, depth and confidence"], ["brief", "Jobs ranked by how well they match your skills"]],
    cta: "Start practising", to: "/c/dashboard",
  },
  recruiter: {
    title: "Shortlist on skill, not keywords.",
    points: [["spark", "Send AI screenings and get scored answers back"], ["kanban", "Drag-and-drop pipeline across every client role"], ["users", "Search talent by skill and verified interview score"]],
    cta: "Open the pipeline", to: "/r/pipeline",
  },
  company: {
    title: "Post a role and meet candidates who've already proven themselves.",
    points: [["plus", "Publish jobs in a minute, with a live preview"], ["eye", "See views, applicants and conversion per listing"], ["target", "Every applicant can take a role-specific AI interview"]],
    cta: "Post a job", to: "/co/jobs",
  },
};

const DEMO_Q = [
  "Tell me about a project you're proud of.",
  "How would you design a REST API for a banking transfer?",
  "How do you prioritise when everything feels urgent?",
];

export function Landing() {
  const [aud, setAud] = useState<Persona>("candidate");
  const [qi, setQi] = useState(0);
  const [typed, setTyped] = useState("");
  useEffect(() => {
    const q = DEMO_Q[qi];
    let i = 0;
    setTyped("");
    const t = setInterval(() => {
      i++;
      setTyped(q.slice(0, i));
      if (i >= q.length) { clearInterval(t); setTimeout(() => setQi((x) => (x + 1) % DEMO_Q.length), 2600); }
    }, 38);
    return () => clearInterval(t);
  }, [qi]);

  const enter = (p: Persona, to: string) => { actions.setPersona(p); go(to); };
  const a = AUD[aud];

  return (
    <div className="landing">
      <header className="l-nav">
        <a className="brand" href="#/"><Logo /> Hireloop</a>
        <nav className="l-links"><a href="#how">How it works</a><a href="#roles">Roles</a><a href="#audiences">For teams</a></nav>
        <button className="btn primary small" onClick={() => enter("candidate", "/c/dashboard")}>Open the app</button>
      </header>

      <section className="l-hero">
        <div className="l-copy">
          <span className="chip glass-l"><Icon name="spark" size={14} /> AI interview practice + jobs, in one place</span>
          <h1>Practise the interview.<br /><em>Land the job.</em></h1>
          <p>Hireloop gives you a realistic AI interviewer for your next role, honest feedback on every answer, and jobs from companies that care about skill, not just CVs.</p>
          <div className="l-cta">
            <button className="btn primary big" onClick={() => enter("candidate", "/c/practice")}><Icon name="mic" size={18} /> Try a free interview</button>
            <button className="btn big" onClick={() => enter("recruiter", "/r/pipeline")}>I'm hiring</button>
          </div>
          <div className="l-proof">
            <div className="faces">{["Sara Kola", "Leon Fischer", "Priya Shah", "Noah Martin"].map((n, i) => <Avatar key={n} name={n} size={34} color={["#8b6cff", "#3cc08a", "#f2a93b", "#ff8a65"][i]} />)}</div>
            <span><b>Demo platform</b> with sample companies, jobs and candidates</span>
          </div>
        </div>

        <div className="l-visual" aria-hidden="true">
          <div className="l-stage">
            <div className="orb speaking hero-orb"><i /><i /><i /></div>
            <div className="l-bubble"><small>AI interviewer</small><p>{typed}<span className="caret" /></p></div>
            <div className="float f1"><Ring value={92} size={64} stroke={6} /><div><b>Interview-ready</b><small>Structure 95 · Depth 88</small></div></div>
            <div className="float f2"><span className="fi mint"><Icon name="check" size={16} /></span><div><b>Offer stage</b><small>Backend Engineer · Northwind</small></div></div>
            <div className="float f3"><span className="fi violet"><Icon name="brief" size={16} /></span><div><b>94% match</b><small>Full-stack · Lumen Health</small></div></div>
          </div>
        </div>
      </section>

      <section className="marquee-l" id="roles" aria-label="Roles you can practise">
        <div className="mq">
          {[0, 1].map((k) => (
            <ul key={k} aria-hidden={k === 1}>
              {ROLES.map((r) => <li key={r.id}><Icon name={r.icon} size={16} /> {r.name}</li>)}
            </ul>
          ))}
        </div>
      </section>

      <section className="l-section" id="how">
        <p className="eyebrow center">How it works</p>
        <h2 className="center">From first practice to <em>signed offer</em></h2>
        <div className="steps-l">
          {[
            ["mic", "Practise out loud", "Pick a role and talk to an AI interviewer that reads questions aloud and listens to your answers."],
            ["chart", "Get scored feedback", "See structure, relevance, clarity, depth and confidence, with filler words highlighted."],
            ["brief", "Apply to matched jobs", "Roles are ranked by your skills. Practise for a specific job before you apply."],
            ["spark", "Ace the AI screening", "Recruiters invite you to a screening; your scores go straight to their pipeline."],
          ].map(([ic, t, d], i) => (
            <article key={t} className="step-l"><span className="step-n">0{i + 1}</span><span className="step-ico"><Icon name={ic} size={22} /></span><h3>{t}</h3><p>{d}</p></article>
          ))}
        </div>
      </section>

      <section className="l-section aud" id="audiences">
        <div className="aud-tabs" role="tablist">
          {(["candidate", "recruiter", "company"] as Persona[]).map((p) => (
            <button key={p} role="tab" aria-selected={aud === p} className={aud === p ? "on" : ""} onClick={() => setAud(p)}>
              {p === "candidate" ? "For candidates" : p === "recruiter" ? "For recruiters" : "For companies"}
            </button>
          ))}
        </div>
        <div className="aud-body" key={aud}>
          <div>
            <h2>{a.title}</h2>
            <ul className="aud-points">{a.points.map(([ic, t]) => <li key={t}><span><Icon name={ic} size={18} /></span>{t}</li>)}</ul>
            <button className="btn primary big" onClick={() => enter(aud, a.to)}>{a.cta} <Icon name="arrow" size={16} /></button>
          </div>
          <div className="aud-art">
            {aud === "candidate" && <div className="mock-results"><Ring value={84} size={120} stroke={11} label="score" /><div className="mock-bars">{[["Structure", 88], ["Relevance", 82], ["Clarity", 90], ["Depth", 76], ["Confidence", 84]].map(([l, v]) => <div key={l as string}><span>{l}</span><i style={{ width: `${v}%` }} /></div>)}</div></div>}
            {aud === "recruiter" && <div className="mock-board">{["Screening", "Interview", "Offer"].map((c, i) => <div key={c} className="mock-col"><b>{c}</b>{[0, 1].slice(0, 2 - (i === 2 ? 1 : 0)).map((k) => <div key={k} className="mock-card"><Avatar name={["Leon F", "Priya S", "Sara K", "Ana P", "Tom B"][i * 2 + k]} size={26} color={["#8b6cff", "#f2a93b", "#3cc08a", "#ff8a65", "#4f95e0"][i * 2 + k]} /><span>{[86, 88, 91, 79, 74][i * 2 + k]}</span></div>)}</div>)}</div>}
            {aud === "company" && <div className="mock-list">{SEED_JOBS.slice(0, 3).map((j) => <div key={j.id} className="mock-job"><span className="co-badge" style={{ width: 34, height: 34, background: `${j.color}22`, color: j.color }}>{j.company[0]}</span><div><b>{j.title}</b><small>{j.views} views</small></div><i className="on-dot" /></div>)}</div>}
          </div>
        </div>
      </section>

      <section className="l-cta-band">
        <h2>Your next interview is a <em>conversation away</em>.</h2>
        <button className="btn light big" onClick={() => enter("candidate", "/c/practice")}><Icon name="play" size={16} /> Start a mock interview</button>
      </section>

      <footer className="l-foot">
        <span className="brand"><Logo size={24} /> Hireloop</span>
        <span>A portfolio project by <a href="https://ida-eng.github.io/portfolio/">Aida Topalli</a>. Companies, jobs and people are fictional.</span>
      </footer>
    </div>
  );
}
