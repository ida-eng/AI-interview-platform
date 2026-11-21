import { useMemo, useState } from "react";
import { COMPANIES, ROLES, type Job } from "../data";
import { CATEGORIES, matchScore } from "../analyzer";
import { actions, useStore, type Application } from "../store";
import { Avatar, Bars, Icon, Modal, Radar, Ring, Spark, go, salary, timeAgo, toast } from "../ui";

export function CompanyBadge({ job, size = 44 }: { job: Job; size?: number }) {
  return <span className="co-badge" style={{ width: size, height: size, background: `${job.color}1f`, color: job.color, fontSize: size * 0.42 }}>{job.company[0]}</span>;
}

// ---------------- dashboard ----------------
export function CandidateDashboard() {
  const me = useStore((s) => s.me);
  const sessions = useStore((s) => s.sessions);
  const jobs = useStore((s) => s.jobs);
  const invites = useStore((s) => s.invites);
  const apps = useStore((s) => s.applications);

  const avg = (k: (typeof CATEGORIES)[number]) => (sessions.length ? Math.round(sessions.slice(0, 5).reduce((a, x) => a + x.categories[k], 0) / Math.min(5, sessions.length)) : 0);
  const cats = Object.fromEntries(CATEGORIES.map((c) => [c, avg(c)])) as Record<string, number>;
  const latest = sessions[0]?.score ?? 0;
  const trend = sessions.slice(0, 8).map((s) => s.score).reverse();
  const minutes = Math.round(sessions.reduce((a, s) => a + s.durationSec, 0) / 60);
  const streak = useMemo(() => {
    const days = new Set(sessions.map((s) => new Date(s.date).toDateString()));
    let n = 0; const d = new Date();
    if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
    while (days.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }, [sessions]);
  const recommended = jobs.filter((j) => j.open).map((j) => ({ j, m: matchScore(j.skills, me.skills) })).sort((a, b) => b.m - a.m).slice(0, 4);
  const pending = invites.filter((i) => i.status === "pending");
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1>{hello}, <em>{me.name.split(" ")[0]}</em>.</h1>
        </div>
        <a className="btn primary" href="#/c/practice"><Icon name="mic" size={16} /> New practice</a>
      </header>

      {pending.map((inv) => {
        const job = jobs.find((j) => j.id === inv.jobId);
        if (!job) return null;
        return (
          <div className="invite" key={inv.id}>
            <span className="invite-ico"><Icon name="spark" size={20} /></span>
            <div>
              <b>You're invited to an AI screening</b>
              <p>{inv.from} invited you to a short screening for <b>{job.title}</b> at {job.company}. Your results go straight to the recruiter.</p>
            </div>
            <a className="btn light" href={`#/c/practice?job=${job.id}&invite=${inv.id}`}>Start screening <Icon name="arrow" size={16} /></a>
          </div>
        );
      })}

      <section className="hero-card">
        <div className="hero-copy">
          <span className="chip glass"><Icon name="flame" size={14} /> {streak > 0 ? `${streak}-day streak` : "Start a streak today"}</span>
          <h2>Your interview readiness is <em>{latest}%</em></h2>
          <p>Up {Math.max(0, latest - (trend[0] ?? latest))} points across your last {trend.length} sessions. One more {sessions[0]?.roleName || "practice"} run keeps the momentum.</p>
          <div className="hero-btns">
            <a className="btn light" href={`#/c/practice?role=${sessions[0]?.role || "backend"}`}><Icon name="play" size={15} /> Continue practising</a>
            <a className="btn glass" href="#/c/jobs">Browse {jobs.filter((j) => j.open).length} jobs</a>
          </div>
        </div>
        <div className="hero-viz"><Ring value={latest} size={150} stroke={12} label="readiness" color="#fff" /></div>
      </section>

      <section className="stat-row">
        <div className="stat"><span className="stat-ico violet"><Icon name="mic" /></span><div><b>{sessions.length}</b><span>Practice sessions</span></div><Spark values={trend} /></div>
        <div className="stat"><span className="stat-ico mint"><Icon name="trophy" /></span><div><b>{sessions.length ? Math.max(...sessions.map((s) => s.score)) : 0}%</b><span>Best score</span></div></div>
        <div className="stat"><span className="stat-ico peach"><Icon name="clock" /></span><div><b>{Math.floor(minutes / 60)}h {minutes % 60}m</b><span>Time practised</span></div></div>
        <div className="stat"><span className="stat-ico sky"><Icon name="brief" /></span><div><b>{apps.length}</b><span>Applications</span></div></div>
      </section>

      <div className="grid-2">
        <section className="card">
          <div className="card-head"><h3>Skill profile</h3><span className="muted small">Last 5 sessions</span></div>
          <div className="skill-viz"><Radar data={cats} size={250} /><Bars items={CATEGORIES.map((c) => ({ label: c, value: cats[c] }))} /></div>
        </section>
        <section className="card">
          <div className="card-head"><h3>Recent sessions</h3><a href="#/c/history" className="link">See all</a></div>
          <ul className="list">
            {sessions.slice(0, 5).map((s) => (
              <li key={s.id}>
                <a className="list-row" href={s.items.length ? `#/c/results/${s.id}` : "#/c/history"}>
                  <span className={`score-pill ${s.score >= 80 ? "good" : s.score >= 60 ? "ok" : "low"}`}>{s.score}</span>
                  <span className="grow"><b>{s.roleName}</b><small>{timeAgo(s.date)} · {Math.round(s.durationSec / 60)} min{s.inviteId ? " · Screening" : ""}</small></span>
                  <Icon name="arrow" size={16} className="muted" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <div className="section-head"><h3 className="section-title">Recommended for you</h3><a className="link" href="#/c/jobs">All jobs</a></div>
        <div className="job-grid">{recommended.map(({ j, m }) => <JobCard key={j.id} job={j} match={m} />)}</div>
      </section>
    </div>
  );
}

// ---------------- jobs ----------------
export function JobCard({ job, match, onOpen }: { job: Job; match: number; onOpen?: () => void }) {
  const saved = useStore((s) => s.saved.includes(job.id));
  const applied = useStore((s) => s.applications.some((a) => a.jobId === job.id));
  return (
    <article className="job" onClick={onOpen || (() => go(`/c/jobs?open=${job.id}`))} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && (onOpen ? onOpen() : go(`/c/jobs?open=${job.id}`))}>
      <div className="job-top">
        <CompanyBadge job={job} />
        <div className="grow"><h4>{job.title}</h4><p className="muted small">{job.company} · {timeAgo(job.posted)}</p></div>
        <button className={`icon-btn save ${saved ? "on" : ""}`} onClick={(e) => { e.stopPropagation(); actions.toggleSave(job.id); toast(saved ? "Removed from saved" : "Saved"); }} aria-label={saved ? "Unsave job" : "Save job"} aria-pressed={saved}><Icon name="bookmark" /></button>
      </div>
      <div className="tags">
        <span><Icon name="pin" size={13} /> {job.location}</span><span>{job.remote}</span><span>{job.type}</span><span>{job.level}</span>
      </div>
      <div className="job-foot">
        <b>{salary(...job.salary)}</b>
        {applied ? <span className="applied"><Icon name="check" size={14} /> Applied</span> : <span className={`match ${match >= 85 ? "hi" : match >= 65 ? "mid" : ""}`}>{match}% match</span>}
      </div>
    </article>
  );
}

export function Jobs({ params }: { params: URLSearchParams }) {
  const jobs = useStore((s) => s.jobs);
  const me = useStore((s) => s.me);
  const saved = useStore((s) => s.saved);
  const [q, setQ] = useState(params.get("q") || "");
  const [role, setRole] = useState("all");
  const [remote, setRemote] = useState("all");
  const [level, setLevel] = useState("all");
  const [minPay, setMinPay] = useState(0);
  const [onlySaved, setOnlySaved] = useState(false);
  const [sort, setSort] = useState("match");
  const openId = params.get("open");

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const r = jobs
      .filter((j) => j.open)
      .filter((j) => !t || `${j.title} ${j.company} ${j.skills.join(" ")} ${j.location}`.toLowerCase().includes(t))
      .filter((j) => role === "all" || j.role === role)
      .filter((j) => remote === "all" || j.remote === remote)
      .filter((j) => level === "all" || j.level === level)
      .filter((j) => j.salary[1] >= minPay * 1000)
      .filter((j) => !onlySaved || saved.includes(j.id))
      .map((j) => ({ j, m: matchScore(j.skills, me.skills) }));
    if (sort === "match") r.sort((a, b) => b.m - a.m);
    if (sort === "new") r.sort((a, b) => b.j.posted - a.j.posted);
    if (sort === "pay") r.sort((a, b) => b.j.salary[1] - a.j.salary[1]);
    return r;
  }, [jobs, q, role, remote, level, minPay, onlySaved, sort, saved, me.skills]);

  const reset = () => { setQ(""); setRole("all"); setRemote("all"); setLevel("all"); setMinPay(0); setOnlySaved(false); };

  return (
    <div className="page">
      <header className="page-head">
        <div><p className="eyebrow">Jobs</p><h1>Find your <em>next role</em></h1><p className="muted">{jobs.filter((j) => j.open).length} open roles from {COMPANIES.length} companies, matched to your skills.</p></div>
      </header>
      <div className="searchbar">
        <label className="search"><Icon name="search" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, company, skill or city" aria-label="Search jobs" /></label>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"><option value="match">Best match</option><option value="new">Newest</option><option value="pay">Highest pay</option></select>
      </div>
      <div className="filters">
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role"><option value="all">All roles</option>{ROLES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
        <div className="chips">{["all", "Remote", "Hybrid", "On-site"].map((r) => <button key={r} className={`chip ${remote === r ? "on" : ""}`} onClick={() => setRemote(r)} aria-pressed={remote === r}>{r === "all" ? "Any workplace" : r}</button>)}</div>
        <div className="chips">{["all", "Junior", "Mid", "Senior"].map((l) => <button key={l} className={`chip ${level === l ? "on" : ""}`} onClick={() => setLevel(l)} aria-pressed={level === l}>{l === "all" ? "Any level" : l}</button>)}</div>
        <label className="range"><span>Min pay <b>€{minPay}k</b></span><input type="range" min={0} max={90} step={5} value={minPay} onChange={(e) => setMinPay(Number(e.target.value))} /></label>
        <button className={`chip ${onlySaved ? "on" : ""}`} onClick={() => setOnlySaved((v) => !v)} aria-pressed={onlySaved}><Icon name="bookmark" size={14} /> Saved ({saved.length})</button>
      </div>
      <p className="muted small result-count">{list.length} {list.length === 1 ? "role" : "roles"}</p>
      {list.length ? (
        <div className="job-grid">{list.map(({ j, m }) => <JobCard key={j.id} job={j} match={m} onOpen={() => go(`/c/jobs?open=${j.id}`)} />)}</div>
      ) : (
        <div className="empty"><Icon name="search" size={28} /><b>No roles match these filters</b><button className="btn" onClick={reset}>Reset filters</button></div>
      )}
      <JobModal id={openId} />
    </div>
  );
}

export function JobModal({ id }: { id: string | null }) {
  const job = useStore((s) => s.jobs.find((j) => j.id === id));
  const me = useStore((s) => s.me);
  const app = useStore((s) => s.applications.find((a) => a.jobId === id));
  const [applying, setApplying] = useState(false);
  const [note, setNote] = useState("");
  const close = () => { setApplying(false); go("/c/jobs"); };
  if (!job) return null;
  const m = matchScore(job.skills, me.skills);
  const have = new Set(me.skills.map((s) => s.toLowerCase()));
  return (
    <Modal open={!!job} onClose={close} title={job.title} wide>
      <div className="jd">
        <div className="jd-top">
          <CompanyBadge job={job} size={56} />
          <div className="grow"><p className="muted">{job.company} · {COMPANIES.find((c) => c.id === job.companyId)?.blurb}</p>
            <div className="tags"><span><Icon name="pin" size={13} /> {job.location}</span><span>{job.remote}</span><span>{job.type}</span><span>{job.level}</span><span><Icon name="euro" size={13} /> {salary(...job.salary)}</span></div></div>
          <Ring value={m} size={84} stroke={8} label="match" />
        </div>
        <p className="jd-desc">{job.description}</p>
        <h4>Skills</h4>
        <div className="skill-chips">{job.skills.map((s) => <span key={s} className={have.has(s.toLowerCase()) ? "have" : ""}>{have.has(s.toLowerCase()) && <Icon name="check" size={13} />} {s}</span>)}</div>
        <p className="muted small">Green skills are already on your profile.</p>
        {app ? (
          <div className="jd-applied"><Icon name="check" /> You applied {timeAgo(app.date)} · Status: <b>{app.status}</b></div>
        ) : applying ? (
          <form className="apply" onSubmit={(e) => { e.preventDefault(); actions.apply(job.id, note); toast(`Applied to ${job.company}`); close(); }}>
            <label className="field"><span>Note to the hiring team (optional)</span><textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} placeholder="Why this role, in two or three sentences…" /></label>
            <p className="muted small">We'll share your profile ({me.title}, {me.years} years, {me.skills.slice(0, 4).join(", ")}) and your best practice score.</p>
            <div className="row-end"><button type="button" className="btn" onClick={() => setApplying(false)}>Cancel</button><button className="btn primary" type="submit"><Icon name="send" size={15} /> Send application</button></div>
          </form>
        ) : null}
        {!app && !applying && (
          <div className="row-end">
            <a className="btn" href={`#/c/practice?job=${job.id}`}><Icon name="mic" size={15} /> Practise for this role</a>
            <button className="btn primary" onClick={() => setApplying(true)}>Apply now <Icon name="arrow" size={15} /></button>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ---------------- applications ----------------
const COLS: Application["status"][] = ["Applied", "Interviewing", "Offer", "Rejected"];
export function Applications() {
  const apps = useStore((s) => s.applications);
  const jobs = useStore((s) => s.jobs);
  return (
    <div className="page">
      <header className="page-head"><div><p className="eyebrow">Tracker</p><h1>My <em>applications</em></h1><p className="muted">Updates appear here as soon as a recruiter moves you forward.</p></div><a className="btn" href="#/c/jobs"><Icon name="search" size={16} /> Find jobs</a></header>
      {apps.length === 0 ? <div className="empty"><Icon name="brief" size={28} /><b>No applications yet</b><a className="btn primary" href="#/c/jobs">Browse jobs</a></div> : (
        <div className="board four">
          {COLS.map((c) => {
            const items = apps.filter((a) => a.status === c);
            return (
              <section key={c} className={`col col-${c.toLowerCase()}`}>
                <div className="col-head"><b>{c}</b><span>{items.length}</span></div>
                {items.map((a) => {
                  const j = jobs.find((x) => x.id === a.jobId);
                  if (!j) return null;
                  return (
                    <article key={a.id} className="kcard">
                      <div className="job-top"><CompanyBadge job={j} size={36} /><div className="grow"><b>{j.title}</b><small className="muted">{j.company}</small></div></div>
                      <small className="muted">Applied {timeAgo(a.date)}</small>
                      <div className="row-end small-gap">
                        <a className="btn tiny" href={`#/c/practice?job=${j.id}`}>Practise</a>
                        {c !== "Rejected" && <button className="btn tiny ghost" onClick={() => { actions.withdraw(a.id); toast("Application withdrawn"); }}>Withdraw</button>}
                      </div>
                    </article>
                  );
                })}
                {items.length === 0 && <p className="col-empty">Nothing here yet</p>}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------- history ----------------
export function History() {
  const sessions = useStore((s) => s.sessions);
  return (
    <div className="page">
      <header className="page-head"><div><p className="eyebrow">History</p><h1>All <em>sessions</em></h1></div><a className="btn primary" href="#/c/practice"><Icon name="mic" size={16} /> New practice</a></header>
      <section className="card">
        <ul className="list">
          {sessions.map((s) => (
            <li key={s.id}>
              <a className="list-row" href={s.items.length ? `#/c/results/${s.id}` : undefined} aria-disabled={!s.items.length}>
                <span className={`score-pill ${s.score >= 80 ? "good" : s.score >= 60 ? "ok" : "low"}`}>{s.score}</span>
                <span className="grow"><b>{s.roleName}</b><small>{new Date(s.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {s.type} · {Math.round(s.durationSec / 60)} min{s.inviteId ? " · AI screening" : ""}</small></span>
                <span className="mini-bars" aria-hidden="true">{CATEGORIES.map((c) => <i key={c} style={{ height: `${s.categories[c] * 0.3}px` }} />)}</span>
                {s.items.length > 0 && <Icon name="arrow" size={16} className="muted" />}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function Profile() {
  const me = useStore((s) => s.me);
  const [skill, setSkill] = useState("");
  return (
    <div className="page narrow">
      <header className="page-head"><div><p className="eyebrow">Profile</p><h1>How recruiters <em>see you</em></h1></div></header>
      <section className="card profile">
        <div className="profile-top"><Avatar name={me.name} size={72} /><div><h2>{me.name}</h2><p className="muted">{me.title} · {me.location} · {me.years} years</p></div></div>
        <label className="field"><span>Headline</span><input value={me.headline} onChange={(e) => actions.updateMe({ headline: e.target.value })} maxLength={120} /></label>
        <label className="field"><span>Title</span><input value={me.title} onChange={(e) => actions.updateMe({ title: e.target.value })} maxLength={60} /></label>
        <div className="field"><span>Skills (used for job matching)</span>
          <div className="skill-chips edit">{me.skills.map((s) => <span key={s} className="have">{s}<button onClick={() => actions.updateMe({ skills: me.skills.filter((x) => x !== s) })} aria-label={`Remove ${s}`}><Icon name="x" size={12} /></button></span>)}</div>
          <form className="row" onSubmit={(e) => { e.preventDefault(); const v = skill.trim(); if (v && !me.skills.includes(v)) actions.updateMe({ skills: [...me.skills, v] }); setSkill(""); }}>
            <input value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Add a skill, e.g. Docker" aria-label="New skill" /><button className="btn" type="submit"><Icon name="plus" size={15} /> Add</button>
          </form>
        </div>
      </section>
    </div>
  );
}
