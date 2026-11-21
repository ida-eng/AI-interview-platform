import { useMemo, useState, type FormEvent } from "react";
import { COMPANIES, ROLES, STAGES, type Candidate, type Job, type Level, type RoleId, type Stage } from "../data";
import { CATEGORIES } from "../analyzer";
import { actions, newId, useStore } from "../store";
import { Avatar, Bars, Icon, Modal, Ring, go, salary, timeAgo, toast } from "../ui";
import { CompanyBadge } from "./Candidate";

// ---------------- recruiter: pipeline ----------------
export function Pipeline() {
  const jobs = useStore((s) => s.jobs);
  const cands = useStore((s) => s.candidates);
  const [jobId, setJobId] = useState("all");
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<Stage | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const list = cands.filter((c) => jobId === "all" || c.jobId === jobId);
  const counts = (j: string) => cands.filter((c) => c.jobId === j).length;
  const total = list.length;
  const hiredRate = total ? Math.round((list.filter((c) => c.stage === "Offer" || c.stage === "Hired").length / total) * 100) : 0;
  const avgScore = Math.round(list.filter((c) => c.score != null).reduce((a, c, _, arr) => a + (c.score as number) / arr.length, 0));

  const drop = (stage: Stage) => {
    if (dragId) {
      const c = cands.find((x) => x.id === dragId);
      if (c && c.stage !== stage) { actions.moveCandidate(dragId, stage); toast(`${c.name} → ${stage}`); }
    }
    setDragId(null); setOver(null);
  };

  return (
    <div className="page wide">
      <header className="page-head">
        <div><p className="eyebrow">Recruiter · TalentBridge</p><h1>Hiring <em>pipeline</em></h1><p className="muted">Drag candidates between stages. Candidates who apply on Hireloop appear here instantly.</p></div>
        <a className="btn" href="#/r/talent"><Icon name="search" size={16} /> Search talent</a>
      </header>

      <section className="stat-row">
        <div className="stat"><span className="stat-ico violet"><Icon name="users" /></span><div><b>{total}</b><span>Candidates</span></div></div>
        <div className="stat"><span className="stat-ico mint"><Icon name="trophy" /></span><div><b>{avgScore || "–"}{avgScore ? "%" : ""}</b><span>Avg AI score</span></div></div>
        <div className="stat"><span className="stat-ico peach"><Icon name="target" /></span><div><b>{hiredRate}%</b><span>Reached offer</span></div></div>
        <div className="stat"><span className="stat-ico sky"><Icon name="brief" /></span><div><b>{jobs.filter((j) => j.open).length}</b><span>Open roles</span></div></div>
      </section>

      <div className="chips scroll-x">
        <button className={`chip ${jobId === "all" ? "on" : ""}`} onClick={() => setJobId("all")}>All roles <em>{cands.length}</em></button>
        {jobs.filter((j) => counts(j.id) > 0).map((j) => <button key={j.id} className={`chip ${jobId === j.id ? "on" : ""}`} onClick={() => setJobId(j.id)}>{j.title} · {j.company.split(" ")[0]} <em>{counts(j.id)}</em></button>)}
      </div>

      <div className="board">
        {STAGES.map((stage) => {
          const items = list.filter((c) => c.stage === stage);
          return (
            <section key={stage} className={`col ${over === stage ? "over" : ""}`} onDragOver={(e) => { e.preventDefault(); setOver(stage); }} onDragLeave={() => setOver(null)} onDrop={() => drop(stage)} aria-label={stage}>
              <div className="col-head"><b>{stage}</b><span>{items.length}</span></div>
              {items.map((c) => <CandidateCard key={c.id} c={c} job={jobs.find((j) => j.id === c.jobId)} dragging={dragId === c.id} onDrag={setDragId} onOpen={() => setOpen(c.id)} />)}
              {items.length === 0 && <p className="col-empty">Drop here</p>}
            </section>
          );
        })}
      </div>
      <CandidateDrawer id={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function CandidateCard({ c, job, dragging, onDrag, onOpen }: { c: Candidate; job?: Job; dragging: boolean; onDrag: (id: string | null) => void; onOpen: () => void }) {
  return (
    <article className={`kcard cand ${dragging ? "dragging" : ""} ${c.me ? "me" : ""}`} draggable onDragStart={() => onDrag(c.id)} onDragEnd={() => onDrag(null)} onClick={onOpen} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpen()}>
      <div className="cand-top">
        <Avatar name={c.name} color={c.color} size={38} />
        <div className="grow"><b>{c.name}{c.me && <span className="new-tag">New</span>}</b><small className="muted">{c.title} · {c.years}y</small></div>
        {c.score != null ? <span className={`score-pill sm ${c.score >= 80 ? "good" : c.score >= 60 ? "ok" : "low"}`}>{c.score}</span> : <span className="score-pill sm none">–</span>}
      </div>
      {job && <small className="muted job-line"><Icon name="brief" size={12} /> {job.title}</small>}
      <div className="mini-skills">{c.skills.slice(0, 3).map((s) => <span key={s}>{s}</span>)}</div>
    </article>
  );
}

function CandidateDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const c = useStore((s) => s.candidates.find((x) => x.id === id));
  const job = useStore((s) => s.jobs.find((j) => j.id === c?.jobId));
  const sess = useStore((s) => s.sessions.find((x) => x.id === c?.interview));
  const invited = useStore((s) => s.invites.some((i) => i.jobId === c?.jobId && c?.me));
  if (!c) return null;
  const idx = STAGES.indexOf(c.stage);
  return (
    <Modal open onClose={onClose} title={c.name} wide>
      <div className="drawer">
        <div className="drawer-top">
          <Avatar name={c.name} color={c.color} size={64} />
          <div className="grow"><h3>{c.title}</h3><p className="muted">{c.location} · {c.years} years · available {c.available}</p>
            <div className="skill-chips">{c.skills.map((s) => <span key={s} className={job?.skills.includes(s) ? "have" : ""}>{s}</span>)}</div></div>
          {c.score != null ? <Ring value={c.score} size={96} stroke={9} label="AI score" /> : <div className="no-score"><Icon name="spark" /> No AI score yet</div>}
        </div>
        {job && <p className="muted">Applied for <b>{job.title}</b> at {job.company}</p>}
        <div className="stage-track">{STAGES.map((s, i) => <button key={s} className={i < idx ? "done" : i === idx ? "on" : ""} onClick={() => { actions.moveCandidate(c.id, s); toast(`${c.name} → ${s}`); }}>{s}</button>)}</div>
        {sess && (
          <div className="screen-res">
            <h4><Icon name="spark" size={16} /> AI screening · {timeAgo(sess.date)}</h4>
            <p>{sess.summary}</p>
            <Bars items={CATEGORIES.map((k) => ({ label: k, value: sess.categories[k] }))} />
          </div>
        )}
        <div className="row-end">
          <button className="btn ghost danger" onClick={() => { actions.rejectCandidate(c.id); toast(`${c.name} archived`); onClose(); }}>Archive</button>
          {c.stage !== "Hired" && <button className="btn" onClick={() => { const n = STAGES[Math.min(idx + 1, STAGES.length - 1)]; actions.moveCandidate(c.id, n); toast(`${c.name} → ${n}`); }}>Move to {STAGES[Math.min(idx + 1, STAGES.length - 1)]}</button>}
          <button className="btn primary" disabled={c.me ? invited && !sess : false} onClick={() => { actions.invite(c.id, c.jobId); toast(c.me ? `AI screening sent to ${c.name}` : `AI screening sent to ${c.name}`); }}>
            <Icon name="spark" size={15} /> {c.me && invited && !sess ? "Screening sent" : "Invite to AI screening"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------- recruiter: talent search ----------------
export function Talent() {
  const cands = useStore((s) => s.candidates);
  const jobs = useStore((s) => s.jobs);
  const [q, setQ] = useState("");
  const [min, setMin] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const allSkills = useMemo(() => [...new Set(cands.flatMap((c) => c.skills))].sort(), [cands]);
  const [skill, setSkill] = useState("all");
  const list = cands
    .filter((c) => !q.trim() || `${c.name} ${c.title} ${c.location} ${c.skills.join(" ")}`.toLowerCase().includes(q.trim().toLowerCase()))
    .filter((c) => skill === "all" || c.skills.includes(skill))
    .filter((c) => (c.score ?? 0) >= min)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return (
    <div className="page wide">
      <header className="page-head"><div><p className="eyebrow">Talent search</p><h1>Find <em>proven</em> candidates</h1><p className="muted">Every score comes from a real AI interview, so you shortlist on skill, not just keywords.</p></div></header>
      <div className="searchbar">
        <label className="search"><Icon name="search" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, title, city or skill" aria-label="Search candidates" /></label>
        <select value={skill} onChange={(e) => setSkill(e.target.value)} aria-label="Skill"><option value="all">Any skill</option>{allSkills.map((s) => <option key={s}>{s}</option>)}</select>
        <label className="range"><span>AI score ≥ <b>{min}</b></span><input type="range" min={0} max={95} step={5} value={min} onChange={(e) => setMin(Number(e.target.value))} /></label>
      </div>
      <div className="talent-grid">
        {list.map((c) => {
          const j = jobs.find((x) => x.id === c.jobId);
          return (
            <article key={c.id} className="talent" onClick={() => setOpen(c.id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setOpen(c.id)}>
              <div className="cand-top"><Avatar name={c.name} color={c.color} size={48} /><div className="grow"><b>{c.name}</b><small className="muted">{c.title}</small></div>
                {c.score != null ? <Ring value={c.score} size={56} stroke={5} /> : <span className="score-pill sm none">–</span>}</div>
              <p className="muted small"><Icon name="pin" size={13} /> {c.location} · {c.years} years · {c.stage}{j ? ` · ${j.company}` : ""}</p>
              <div className="mini-skills">{c.skills.map((s) => <span key={s}>{s}</span>)}</div>
            </article>
          );
        })}
        {list.length === 0 && <div className="empty"><Icon name="users" size={28} /><b>No candidates match</b></div>}
      </div>
      <CandidateDrawer id={open} onClose={() => setOpen(null)} />
    </div>
  );
}

// ---------------- company: listings & analytics ----------------
export function Listings() {
  const all = useStore((s) => s.jobs);
  const cands = useStore((s) => s.candidates);
  const jobs = all.filter((j) => j.companyId === "northwind");
  const applicants = (id: string) => cands.filter((c) => c.jobId === id).length;
  const views = jobs.reduce((a, j) => a + j.views, 0);
  const apps = jobs.reduce((a, j) => a + applicants(j.id), 0);
  const maxViews = Math.max(1, ...jobs.map((j) => j.views));
  return (
    <div className="page wide">
      <header className="page-head">
        <div><p className="eyebrow">Northwind Labs</p><h1>Your <em>job listings</em></h1><p className="muted">Post roles, follow applicants and see how each listing performs.</p></div>
        <a className="btn primary" href="#/co/post"><Icon name="plus" size={16} /> Post a job</a>
      </header>
      <section className="stat-row">
        <div className="stat"><span className="stat-ico violet"><Icon name="brief" /></span><div><b>{jobs.filter((j) => j.open).length}</b><span>Open roles</span></div></div>
        <div className="stat"><span className="stat-ico sky"><Icon name="eye" /></span><div><b>{views.toLocaleString()}</b><span>Listing views</span></div></div>
        <div className="stat"><span className="stat-ico mint"><Icon name="users" /></span><div><b>{apps}</b><span>Applicants</span></div></div>
        <div className="stat"><span className="stat-ico peach"><Icon name="chart" /></span><div><b>{views ? ((apps / views) * 100).toFixed(1) : 0}%</b><span>View → apply</span></div></div>
      </section>
      <div className="grid-2 wide-left">
        <section className="card">
          <div className="card-head"><h3>Listings</h3></div>
          <ul className="list">
            {jobs.map((j) => (
              <li key={j.id} className="listing">
                <CompanyBadge job={j} size={40} />
                <div className="grow"><b>{j.title}</b><small className="muted">{j.location} · {j.remote} · {salary(...j.salary)} · posted {timeAgo(j.posted)}</small></div>
                <span className="kpi"><b>{applicants(j.id)}</b><small>applicants</small></span>
                <a className="btn tiny" href="#/r/pipeline">Pipeline</a>
                <button className={`toggle ${j.open ? "on" : ""}`} onClick={() => { actions.toggleJob(j.id); toast(j.open ? "Listing closed" : "Listing reopened"); }} aria-pressed={j.open} aria-label={j.open ? "Close listing" : "Reopen listing"}><i /><span>{j.open ? "Open" : "Closed"}</span></button>
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <div className="card-head"><h3>Views vs applicants</h3></div>
          <div className="vbars">
            {jobs.map((j) => (
              <div key={j.id} className="vbar">
                <div className="vbar-cols"><i style={{ height: `${(j.views / maxViews) * 100}%` }} title={`${j.views} views`} /><i className="b" style={{ height: `${Math.max(4, (applicants(j.id) / Math.max(1, ...jobs.map((x) => applicants(x.id)))) * 70)}%` }} title={`${applicants(j.id)} applicants`} /></div>
                <span>{j.title.split(" ")[0]}</span>
              </div>
            ))}
          </div>
          <div className="legend"><span><i /> Views</span><span><i className="b" /> Applicants</span></div>
        </section>
      </div>
    </div>
  );
}

export function PostJob() {
  const [f, setF] = useState({ title: "", role: "backend" as RoleId, location: "Berlin, DE", remote: "Hybrid" as Job["remote"], type: "Full-time" as Job["type"], level: "Mid" as Level, min: 50, max: 65, skills: "Python, Django, APIs", description: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f, v: string | number) => setF((x) => ({ ...x, [k]: v }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.title.trim().length < 4) er.title = "Give the role a clear title";
    if (f.description.trim().length < 40) er.description = "Describe the role in at least 40 characters";
    if (Number(f.max) < Number(f.min)) er.max = "Max must be above min";
    if (!f.skills.trim()) er.skills = "Add at least one skill";
    setErr(er);
    if (Object.keys(er).length) return;
    const co = COMPANIES[0];
    const job: Job = {
      id: "j" + newId(), title: f.title.trim(), role: f.role, company: co.name, companyId: co.id, location: f.location, remote: f.remote, type: f.type, level: f.level,
      salary: [Number(f.min) * 1000, Number(f.max) * 1000], currency: "€", skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8),
      posted: Date.now(), description: f.description.trim(), open: true, views: 0, color: co.color,
    };
    actions.postJob(job);
    toast("Job published. Candidates can see it now");
    go("/co/jobs");
  };
  const E = ({ k }: { k: string }) => (err[k] ? <em className="err">{err[k]}</em> : null);
  return (
    <div className="page">
      <header className="page-head"><div><p className="eyebrow">Northwind Labs</p><h1>Post a <em>new role</em></h1></div></header>
      <div className="grid-2 wide-left">
        <form className="card form" onSubmit={submit} noValidate>
          <label className={`field ${err.title ? "bad" : ""}`}><span>Job title</span><input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Senior Backend Engineer" /><E k="title" /></label>
          <div className="two">
            <label className="field"><span>Role family (sets the AI interview)</span><select value={f.role} onChange={(e) => set("role", e.target.value)}>{ROLES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
            <label className="field"><span>Location</span><input value={f.location} onChange={(e) => set("location", e.target.value)} /></label>
          </div>
          <div className="three">
            <label className="field"><span>Workplace</span><select value={f.remote} onChange={(e) => set("remote", e.target.value)}><option>Remote</option><option>Hybrid</option><option>On-site</option></select></label>
            <label className="field"><span>Type</span><select value={f.type} onChange={(e) => set("type", e.target.value)}><option>Full-time</option><option>Part-time</option><option>Contract</option></select></label>
            <label className="field"><span>Level</span><select value={f.level} onChange={(e) => set("level", e.target.value)}><option>Junior</option><option>Mid</option><option>Senior</option></select></label>
          </div>
          <div className="two">
            <label className="field"><span>Salary from (€k)</span><input type="number" min={10} max={300} value={f.min} onChange={(e) => set("min", e.target.value)} /></label>
            <label className={`field ${err.max ? "bad" : ""}`}><span>Salary to (€k)</span><input type="number" min={10} max={300} value={f.max} onChange={(e) => set("max", e.target.value)} /><E k="max" /></label>
          </div>
          <label className={`field ${err.skills ? "bad" : ""}`}><span>Skills (comma separated)</span><input value={f.skills} onChange={(e) => set("skills", e.target.value)} /><E k="skills" /></label>
          <label className={`field ${err.description ? "bad" : ""}`}><span>Description</span><textarea value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="What will this person build, and with whom?" /><E k="description" /></label>
          <div className="row-end"><a className="btn" href="#/co/jobs">Cancel</a><button className="btn primary" type="submit"><Icon name="send" size={15} /> Publish job</button></div>
        </form>
        <aside className="preview">
          <p className="eyebrow">Live preview</p>
          <article className="job static">
            <div className="job-top"><span className="co-badge" style={{ width: 44, height: 44, background: "#8b6cff1f", color: "#8b6cff" }}>N</span><div className="grow"><h4>{f.title || "Job title"}</h4><p className="muted small">Northwind Labs · just now</p></div></div>
            <div className="tags"><span><Icon name="pin" size={13} /> {f.location}</span><span>{f.remote}</span><span>{f.type}</span><span>{f.level}</span></div>
            <p className="small muted">{f.description || "Your description appears here."}</p>
            <div className="mini-skills">{f.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => <span key={s}>{s}</span>)}</div>
            <div className="job-foot"><b>€{f.min}k–{f.max}k</b><span className="match hi">AI interview included</span></div>
          </article>
          <p className="muted small">Every applicant can take a {ROLES.find((r) => r.id === f.role)?.name} AI interview, so you see their score before the first call.</p>
        </aside>
      </div>
    </div>
  );
}
