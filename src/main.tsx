import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { PERSONAS, type Persona } from "./data";
import { actions, resetDemo, useStore } from "./store";
import { Avatar, Icon, Logo, Toaster, go, timeAgo, toast, useRoute } from "./ui";
import { Landing } from "./pages/Landing";
import { Applications, CandidateDashboard, History, Jobs, Profile } from "./pages/Candidate";
import { PracticeSetup, Results, Room } from "./pages/Practice";
import { Listings, Pipeline, PostJob, Talent } from "./pages/Hiring";

const NAV: Record<Persona, { to: string; label: string; icon: string }[]> = {
  candidate: [
    { to: "/c/dashboard", label: "Home", icon: "home" },
    { to: "/c/practice", label: "Practice", icon: "mic" },
    { to: "/c/jobs", label: "Jobs", icon: "brief" },
    { to: "/c/applications", label: "Applications", icon: "kanban" },
    { to: "/c/history", label: "History", icon: "chart" },
  ],
  recruiter: [
    { to: "/r/pipeline", label: "Pipeline", icon: "kanban" },
    { to: "/r/talent", label: "Talent", icon: "users" },
  ],
  company: [
    { to: "/co/jobs", label: "Listings", icon: "building" },
    { to: "/co/post", label: "Post a job", icon: "plus" },
  ],
};
const HOME: Record<Persona, string> = { candidate: "/c/dashboard", recruiter: "/r/pipeline", company: "/co/jobs" };

function Shell({ route, children }: { route: string; children: React.ReactNode }) {
  const persona = useStore((s) => s.persona);
  const allNotices = useStore((s) => s.notices);
  const notices = allNotices.filter((n) => n.for === persona);
  const [bell, setBell] = useState(false);
  const [who, setWho] = useState(false);
  const [menu, setMenu] = useState(false);
  const unread = notices.filter((n) => !n.read).length;
  const p = PERSONAS[persona];
  const path = route.split("?")[0];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const f = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) { setBell(false); setWho(false); } };
    document.addEventListener("mousedown", f);
    return () => document.removeEventListener("mousedown", f);
  }, []);
  useEffect(() => setMenu(false), [route]);

  const switchTo = (np: Persona) => { actions.setPersona(np); setWho(false); go(HOME[np]); toast(`Viewing as ${PERSONAS[np].name}`); };

  return (
    <div className={`shell p-${persona}`}>
      <header className="topbar" ref={ref}>
        <a className="brand" href="#/"><Logo /> <span>Hireloop</span></a>
        <nav className={`nav ${menu ? "open" : ""}`} aria-label="Main">
          {NAV[persona].map((n) => (
            <a key={n.to} href={`#${n.to}`} className={path.startsWith(n.to) || (n.to === "/c/practice" && (path.startsWith("/c/room") || path.startsWith("/c/results"))) ? "on" : ""}>
              <Icon name={n.icon} size={17} /> {n.label}
            </a>
          ))}
        </nav>
        <div className="top-right">
          <div className="pop-wrap">
            <button className="icon-btn" onClick={() => { setBell((b) => !b); setWho(false); if (!bell) setTimeout(() => actions.readNotices(persona), 1500); }} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} aria-expanded={bell}>
              <Icon name="bell" />{unread > 0 && <span className="dot">{unread}</span>}
            </button>
            {bell && (
              <div className="pop notif">
                <b className="pop-title">Notifications</b>
                {notices.length === 0 && <p className="muted small">You're all caught up.</p>}
                {notices.slice(0, 8).map((n) => <div key={n.id} className={`notice ${n.read ? "" : "unread"}`}><span /><div><p>{n.text}</p><small>{timeAgo(n.date)}</small></div></div>)}
              </div>
            )}
          </div>
          <div className="pop-wrap">
            <button className="who" onClick={() => { setWho((w) => !w); setBell(false); }} aria-expanded={who} aria-label="Switch demo account">
              <Avatar name={p.name} color={p.color} size={34} />
              <span className="who-txt"><b>{p.name}</b><small>{p.sub}</small></span>
              <Icon name="arrow" size={14} className="chev-d" />
            </button>
            {who && (
              <div className="pop who-pop">
                <b className="pop-title">Explore the demo as</b>
                {(Object.keys(PERSONAS) as Persona[]).map((k) => (
                  <button key={k} className={`who-opt ${k === persona ? "on" : ""}`} onClick={() => switchTo(k)}>
                    <Avatar name={PERSONAS[k].name} color={PERSONAS[k].color} size={36} />
                    <span><b>{PERSONAS[k].name}</b><small>{PERSONAS[k].sub}</small></span>
                    {k === persona && <Icon name="check" size={16} />}
                  </button>
                ))}
                {persona === "candidate" && <a className="who-link" href="#/c/profile"><Icon name="pen" size={15} /> Edit profile & skills</a>}
                <button className="who-link" onClick={() => { if (confirm("Reset all demo data?")) { resetDemo(); toast("Demo data reset"); go("/"); } }}><Icon name="refresh" size={15} /> Reset demo data</button>
              </div>
            )}
          </div>
          <button className="icon-btn menu-btn" onClick={() => setMenu((m) => !m)} aria-label="Menu" aria-expanded={menu}><Icon name={menu ? "x" : "menu"} /></button>
        </div>
      </header>
      <main className="main">{children}</main>
      <nav className="tabbar" aria-label="Quick navigation">
        {NAV[persona].slice(0, 5).map((n) => (
          <a key={n.to} href={`#${n.to}`} className={path.startsWith(n.to) ? "on" : ""}><Icon name={n.icon} size={20} /><span>{n.label}</span></a>
        ))}
      </nav>
    </div>
  );
}

function App() {
  const route = useRoute();
  const persona = useStore((s) => s.persona);
  const [path, qs] = route.split("?");
  const params = new URLSearchParams(qs || "");
  const seg = path.split("/").filter(Boolean);

  useEffect(() => {
    const want: Persona | null = seg[0] === "c" ? "candidate" : seg[0] === "r" ? "recruiter" : seg[0] === "co" ? "company" : null;
    if (want && want !== persona) actions.setPersona(want);
  }, [seg[0]]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!seg.length) return <><Landing /><Toaster /></>;
  if (seg[0] === "c" && seg[1] === "room") return <><Room key={route} params={params} /><Toaster /></>;

  let page: React.ReactNode;
  const k = `${seg[0]}/${seg[1] || ""}`;
  switch (k) {
    case "c/dashboard": page = <CandidateDashboard />; break;
    case "c/practice": page = <PracticeSetup key={route} params={params} />; break;
    case "c/results": page = <Results id={seg[2]} />; break;
    case "c/jobs": page = <Jobs params={params} />; break;
    case "c/applications": page = <Applications />; break;
    case "c/history": page = <History />; break;
    case "c/profile": page = <Profile />; break;
    case "r/pipeline": page = <Pipeline />; break;
    case "r/talent": page = <Talent />; break;
    case "co/jobs": page = <Listings />; break;
    case "co/post": page = <PostJob />; break;
    default: page = <div className="page empty"><b>Page not found</b><a className="btn" href="#/">Home</a></div>;
  }
  return <><Shell route={route}>{page}</Shell><Toaster /></>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
