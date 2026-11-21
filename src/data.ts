// Seed data for the Hireloop demo. Companies, people and jobs are fictional.

export type Level = "Junior" | "Mid" | "Senior";
export type QType = "behavioral" | "technical";

export const ROLES = [
  { id: "frontend", name: "Frontend Engineer", icon: "code", skills: ["React", "TypeScript", "CSS", "Accessibility", "Performance"] },
  { id: "backend", name: "Backend Engineer", icon: "server", skills: ["Python", "Django", "APIs", "SQL", "System design"] },
  { id: "fullstack", name: "Full-stack Developer", icon: "layers", skills: ["React", "Node.js", "APIs", "SQL", "Testing"] },
  { id: "data", name: "Data Analyst", icon: "chart", skills: ["SQL", "Python", "Dashboards", "Statistics", "Storytelling"] },
  { id: "devops", name: "DevOps Engineer", icon: "cloud", skills: ["CI/CD", "Docker", "Kubernetes", "AWS", "Monitoring"] },
  { id: "qa", name: "QA Engineer", icon: "check", skills: ["Test plans", "Automation", "APIs", "Postman", "Bug triage"] },
  { id: "pm", name: "Product Manager", icon: "compass", skills: ["Roadmaps", "Discovery", "Metrics", "Stakeholders", "Prioritisation"] },
  { id: "ux", name: "UX Designer", icon: "pen", skills: ["Research", "Figma", "Prototyping", "Usability", "Design systems"] },
  { id: "sales", name: "Account Executive", icon: "handshake", skills: ["Prospecting", "Negotiation", "CRM", "Discovery calls", "Closing"] },
  { id: "support", name: "Customer Success", icon: "heart", skills: ["Onboarding", "Retention", "Empathy", "Escalations", "CRM"] },
] as const;
export type RoleId = (typeof ROLES)[number]["id"];

type Q = { q: string; keywords: string[]; tip: string };

const BEHAVIORAL: Q[] = [
  { q: "Tell me about yourself and why you're interested in this role.", keywords: ["experience", "built", "team", "role", "interested", "skills", "years", "project"], tip: "Present, past, future: what you do now, what led you here, and why this role is the next step." },
  { q: "Describe a time you disagreed with a teammate. How did you handle it?", keywords: ["listened", "data", "compromise", "agreed", "discussed", "perspective", "decision", "result"], tip: "Show you can disagree respectfully, use evidence, and commit once a decision is made." },
  { q: "Tell me about a project you're proud of. What was your specific contribution?", keywords: ["I", "built", "led", "designed", "impact", "users", "result", "launched"], tip: "Use \"I\" for your part, then quantify the impact: users, time saved, revenue, quality." },
  { q: "Describe a time you made a mistake at work. What did you learn?", keywords: ["mistake", "learned", "fixed", "owned", "process", "changed", "prevent", "team"], tip: "Own it quickly, explain the fix, and end with what you changed so it doesn't happen again." },
  { q: "How do you prioritise when everything feels urgent?", keywords: ["impact", "deadline", "stakeholders", "priority", "communicate", "trade-off", "plan", "urgent"], tip: "Name a framework (impact vs effort, deadlines, dependencies) and give a real example." },
  { q: "Tell me about a time you had to learn something new quickly.", keywords: ["learned", "documentation", "practice", "days", "weeks", "applied", "mentor", "result"], tip: "Show your learning method and how fast you turned it into results." },
];

const TECHNICAL: Record<string, Q[]> = {
  frontend: [
    { q: "How would you make a slow React page faster?", keywords: ["profile", "memo", "render", "lazy", "bundle", "cache", "virtualize", "measure"], tip: "Measure first (Profiler, Lighthouse), then fix: fewer re-renders, code-splitting, virtualised lists, caching." },
    { q: "How do you make a web app accessible?", keywords: ["semantic", "aria", "keyboard", "contrast", "focus", "screen reader", "labels", "alt"], tip: "Semantic HTML first, keyboard and focus management, labels, contrast, and testing with a screen reader." },
    { q: "Explain the difference between state and props in React.", keywords: ["state", "props", "parent", "child", "immutable", "render", "component", "owner"], tip: "Props flow down and are read-only; state is owned by a component and triggers re-renders when it changes." },
  ],
  backend: [
    { q: "How would you design a REST API for a banking transfer?", keywords: ["idempotency", "transaction", "validation", "atomic", "status", "auth", "rollback", "audit"], tip: "Cover auth, validation, idempotency keys, an atomic DB transaction with locking, and an audit trail." },
    { q: "How do you find and fix a slow database query?", keywords: ["explain", "index", "query plan", "n+1", "join", "cache", "measure", "select"], tip: "Use EXPLAIN, add the right index, avoid N+1 queries, select only needed columns, then measure again." },
    { q: "What happens when two requests update the same record at the same time?", keywords: ["race", "lock", "transaction", "isolation", "optimistic", "version", "atomic", "conflict"], tip: "Explain race conditions and the fixes: row locks, optimistic locking with a version, or atomic updates." },
  ],
  fullstack: [
    { q: "Walk me through what happens when a user submits a form in your app.", keywords: ["validation", "request", "api", "database", "response", "state", "error", "loading"], tip: "Client validation, request, server validation, DB write, response, UI update with loading and error states." },
    { q: "How do you handle authentication in a web app?", keywords: ["session", "token", "jwt", "cookie", "hash", "password", "expiry", "https"], tip: "Hash passwords, use secure httpOnly cookies or short-lived tokens, HTTPS, and expiry/refresh." },
    { q: "How do you decide what to test?", keywords: ["unit", "integration", "critical", "edge cases", "coverage", "regression", "e2e", "risk"], tip: "Test by risk: core business logic, edge cases and critical user flows, with a few end-to-end tests." },
  ],
  data: [
    { q: "A key metric dropped 20% overnight. How do you investigate?", keywords: ["data quality", "segment", "tracking", "compare", "seasonality", "release", "root cause", "dashboard"], tip: "Check data quality first, then segment (platform, region, cohort) and line it up with releases or events." },
    { q: "Explain the difference between a LEFT JOIN and an INNER JOIN.", keywords: ["left", "inner", "rows", "match", "null", "table", "all", "only"], tip: "INNER keeps matching rows only; LEFT keeps every row from the left table and fills misses with NULL." },
    { q: "How do you present findings to non-technical stakeholders?", keywords: ["story", "visual", "recommendation", "simple", "decision", "context", "chart", "action"], tip: "Lead with the recommendation, one clear chart, and what decision you want them to make." },
  ],
  devops: [
    { q: "How would you set up CI/CD for a new service?", keywords: ["pipeline", "tests", "build", "deploy", "staging", "rollback", "docker", "automated"], tip: "Lint and test on every push, build an image, deploy to staging, then production with a rollback plan." },
    { q: "A production service is down. What are your first steps?", keywords: ["alerts", "logs", "metrics", "rollback", "communicate", "incident", "root cause", "postmortem"], tip: "Stabilise first (rollback or scale), communicate, use logs and metrics, then a blameless postmortem." },
    { q: "Containers vs virtual machines: when would you use each?", keywords: ["isolation", "kernel", "lightweight", "startup", "overhead", "security", "density", "os"], tip: "Containers share the kernel and start fast; VMs give stronger isolation and a full OS." },
  ],
  qa: [
    { q: "How would you test a login page?", keywords: ["valid", "invalid", "edge cases", "security", "lockout", "accessibility", "automation", "boundary"], tip: "Happy path, invalid inputs, boundaries, lockout, security (SQL injection, rate limits) and accessibility." },
    { q: "How do you decide what to automate?", keywords: ["repetitive", "regression", "stable", "roi", "critical", "flaky", "maintenance", "smoke"], tip: "Automate stable, repetitive, high-value flows like smoke and regression; keep exploratory testing manual." },
    { q: "How do you write a good bug report?", keywords: ["steps", "expected", "actual", "environment", "severity", "screenshot", "reproduce", "logs"], tip: "Clear title, steps to reproduce, expected vs actual, environment, severity and evidence." },
  ],
  pm: [
    { q: "How do you decide what goes into the next release?", keywords: ["impact", "effort", "users", "data", "strategy", "stakeholders", "trade-off", "metrics"], tip: "Tie items to the strategy, score impact vs effort with data, and explain the trade-offs openly." },
    { q: "How would you measure the success of a new feature?", keywords: ["metric", "adoption", "retention", "baseline", "goal", "experiment", "a/b", "north star"], tip: "Define the goal, one primary metric with a baseline and target, guardrail metrics, and an experiment." },
    { q: "Tell me about a product decision you made with incomplete data.", keywords: ["assumption", "risk", "test", "learned", "decision", "users", "iterate", "data"], tip: "State the assumptions, how you reduced risk, and what you learned after shipping." },
  ],
  ux: [
    { q: "Walk me through your design process.", keywords: ["research", "users", "problem", "prototype", "test", "iterate", "wireframes", "feedback"], tip: "Understand the problem and users, explore, prototype, test with users, and iterate." },
    { q: "How do you handle feedback you disagree with?", keywords: ["listen", "research", "data", "users", "test", "explain", "rationale", "compromise"], tip: "Listen for the underlying concern, bring user evidence, and test both options when you can." },
    { q: "How do you design for accessibility?", keywords: ["contrast", "keyboard", "screen reader", "wcag", "labels", "focus", "inclusive", "test"], tip: "WCAG contrast, keyboard paths, clear labels and focus states, and testing with assistive tech." },
  ],
  sales: [
    { q: "Walk me through how you run a discovery call.", keywords: ["questions", "pain", "budget", "decision", "timeline", "listen", "next steps", "needs"], tip: "Prepare, ask open questions about pain, budget, decision process and timeline, then agree next steps." },
    { q: "How do you handle a prospect who says your price is too high?", keywords: ["value", "roi", "understand", "objection", "compare", "options", "budget", "outcome"], tip: "Clarify the objection, reframe on value and ROI, and offer options instead of discounting straight away." },
    { q: "Tell me about a deal you lost. What would you do differently?", keywords: ["lost", "learned", "qualify", "stakeholders", "earlier", "champion", "differently", "process"], tip: "Be honest about why, and name a concrete change in how you qualify or multi-thread deals." },
  ],
  support: [
    { q: "How do you handle an angry customer?", keywords: ["listen", "empathy", "acknowledge", "solution", "follow up", "calm", "ownership", "escalate"], tip: "Listen, acknowledge, take ownership, give a clear next step and follow up when you said you would." },
    { q: "How would you reduce churn for a group of at-risk customers?", keywords: ["health score", "usage", "outreach", "onboarding", "value", "feedback", "data", "proactive"], tip: "Find signals (usage, tickets), reach out proactively, re-onboard on the value they bought, and track it." },
    { q: "How do you onboard a new customer successfully?", keywords: ["goals", "kickoff", "milestones", "training", "success", "check-in", "adoption", "plan"], tip: "Agree goals at kickoff, set milestones, train key users and check in on adoption early." },
  ],
};

export function buildQuestions(role: RoleId, type: "behavioral" | "technical" | "mixed", count: number, seed = Date.now()): Q[] {
  let s = seed % 2147483647 || 1;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const shuffle = <T,>(a: T[]) => a.map((x) => [rnd(), x] as const).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  const tech = shuffle(TECHNICAL[role] ?? TECHNICAL.fullstack);
  const beh = shuffle(BEHAVIORAL.slice(1));
  let list: Q[];
  if (type === "behavioral") list = [BEHAVIORAL[0], ...beh];
  else if (type === "technical") list = [...tech, ...beh];
  else list = [BEHAVIORAL[0], tech[0], beh[0], tech[1], beh[1], tech[2], beh[2]];
  return list.slice(0, count);
}

export type Job = {
  id: string; title: string; role: RoleId; company: string; companyId: string; location: string; remote: "Remote" | "Hybrid" | "On-site";
  type: "Full-time" | "Part-time" | "Contract"; level: Level; salary: [number, number]; currency: string; skills: string[];
  posted: number; description: string; open: boolean; views: number; color: string; recruiter?: string;
};

export const COMPANIES = [
  { id: "northwind", name: "Northwind Labs", color: "#8b6cff", blurb: "Developer tools for 40k teams" },
  { id: "lumen", name: "Lumen Health", color: "#3cc08a", blurb: "Telehealth across Europe" },
  { id: "orbit", name: "Orbit Pay", color: "#ff8a65", blurb: "Payments for marketplaces" },
  { id: "kite", name: "Kite Studio", color: "#f2a93b", blurb: "Design-led product studio" },
  { id: "atlas", name: "Atlas Logistics", color: "#4f95e0", blurb: "Smarter freight in 30 countries" },
  { id: "verde", name: "Verde Energy", color: "#2fae9b", blurb: "Home solar, made simple" },
];

const day = 864e5;
const now = Date.now();
const J = (id: string, title: string, role: RoleId, companyId: string, location: string, remote: Job["remote"], type: Job["type"], level: Level, salary: [number, number], skills: string[], daysAgo: number, views: number, description: string): Job => {
  const c = COMPANIES.find((x) => x.id === companyId)!;
  return { id, title, role, company: c.name, companyId, location, remote, type, level, salary, currency: "€", skills, posted: now - daysAgo * day, description, open: true, views, color: c.color };
};

export const SEED_JOBS: Job[] = [
  J("j1", "Backend Engineer (Python/Django)", "backend", "northwind", "Berlin, DE", "Hybrid", "Full-time", "Mid", [58000, 72000], ["Python", "Django", "APIs", "SQL", "Docker"], 1, 412, "Build the APIs behind our developer platform: billing, usage metering and integrations used by 40k teams."),
  J("j2", "Frontend Engineer", "frontend", "northwind", "Remote, EU", "Remote", "Full-time", "Mid", [55000, 68000], ["React", "TypeScript", "CSS", "Accessibility"], 3, 298, "Own the dashboard experience end to end, from design system components to performance budgets."),
  J("j3", "Full-stack Developer", "fullstack", "orbit", "Amsterdam, NL", "Hybrid", "Full-time", "Junior", [42000, 52000], ["React", "Node.js", "APIs", "SQL", "Testing"], 2, 356, "Ship merchant-facing features across our React front end and Node.js payment services."),
  J("j4", "Software Engineer, Payments", "backend", "orbit", "Remote, EU", "Remote", "Full-time", "Senior", [75000, 95000], ["Python", "APIs", "SQL", "System design", "Payments"], 6, 520, "Design reliable payment flows: SEPA, cards and payouts, with idempotency and strong audit trails."),
  J("j5", "QA Automation Engineer", "qa", "lumen", "Tirana, AL", "Hybrid", "Full-time", "Mid", [28000, 36000], ["Automation", "APIs", "Postman", "Test plans", "Playwright"], 4, 187, "Build our automated regression suite for patient and clinician apps, and coach teams on quality."),
  J("j6", "Data Analyst", "data", "lumen", "Lisbon, PT", "Hybrid", "Full-time", "Junior", [32000, 40000], ["SQL", "Python", "Dashboards", "Statistics"], 5, 241, "Turn clinical and product data into decisions; own weekly metrics and experiment readouts."),
  J("j7", "Product Manager, Growth", "pm", "kite", "London, UK", "On-site", "Full-time", "Senior", [70000, 88000], ["Discovery", "Metrics", "Experiments", "Stakeholders"], 8, 330, "Lead growth bets for our client products, from research to experiments and roadmap."),
  J("j8", "UX Designer", "ux", "kite", "Remote, EU", "Remote", "Contract", "Mid", [45000, 55000], ["Figma", "Research", "Prototyping", "Design systems"], 2, 276, "Design end-to-end flows for fintech and health clients, backed by research and usability tests."),
  J("j9", "DevOps Engineer", "devops", "atlas", "Munich, DE", "Hybrid", "Full-time", "Mid", [60000, 76000], ["Docker", "Kubernetes", "AWS", "CI/CD", "Monitoring"], 7, 198, "Run the platform behind real-time freight tracking; own CI/CD, observability and incident response."),
  J("j10", "Account Executive, DACH", "sales", "atlas", "Vienna, AT", "Hybrid", "Full-time", "Mid", [50000, 65000], ["Prospecting", "Negotiation", "CRM", "Discovery calls"], 9, 143, "Own a mid-market territory and close new logos with a strong SDR and solutions team."),
  J("j11", "Customer Success Manager", "support", "verde", "Milan, IT", "Hybrid", "Full-time", "Junior", [30000, 38000], ["Onboarding", "Retention", "CRM", "Italian"], 3, 165, "Help homeowners and installers get the most from Verde, from onboarding to renewal."),
  J("j12", "Junior Python Developer", "backend", "verde", "Tirana, AL", "Hybrid", "Part-time", "Junior", [18000, 24000], ["Python", "Django", "SQL", "Git"], 1, 221, "Join our Tirana hub building internal tools and APIs for installer scheduling and billing."),
  J("j13", "Frontend Developer (React)", "frontend", "atlas", "Remote, EU", "Remote", "Contract", "Junior", [36000, 44000], ["React", "JavaScript", "CSS", "APIs"], 10, 302, "Build shipment-tracking views and maps for shippers and carriers."),
  J("j14", "Full-stack Engineer (Django + React)", "fullstack", "lumen", "Remote, EU", "Remote", "Full-time", "Mid", [52000, 64000], ["Python", "Django", "React", "APIs", "SQL"], 2, 388, "Work across our Django services and React apps for clinicians, with a focus on reliability."),
];

export type Candidate = {
  id: string; name: string; title: string; location: string; years: number; skills: string[]; score: number | null;
  color: string; jobId: string; stage: Stage; available: string; me?: boolean; interview?: string;
};
export const STAGES = ["Applied", "Screening", "Interview", "Offer", "Hired"] as const;
export type Stage = (typeof STAGES)[number];

export const SEED_CANDIDATES: Candidate[] = [
  { id: "c1", name: "Leon Fischer", title: "Backend Developer", location: "Hamburg, DE", years: 4, skills: ["Python", "Django", "SQL", "Docker"], score: 86, color: "#8b6cff", jobId: "j1", stage: "Interview", available: "1 month" },
  { id: "c2", name: "Sara Kola", title: "Python Engineer", location: "Tirana, AL", years: 3, skills: ["Python", "Django", "APIs", "AWS"], score: 91, color: "#3cc08a", jobId: "j1", stage: "Offer", available: "2 weeks" },
  { id: "c3", name: "Tom Becker", title: "Software Engineer", location: "Berlin, DE", years: 6, skills: ["Go", "Python", "Kubernetes"], score: 74, color: "#ff8a65", jobId: "j1", stage: "Screening", available: "Now" },
  { id: "c4", name: "Priya Shah", title: "Frontend Engineer", location: "London, UK", years: 5, skills: ["React", "TypeScript", "Accessibility"], score: 88, color: "#f2a93b", jobId: "j2", stage: "Interview", available: "1 month" },
  { id: "c5", name: "Marco Rossi", title: "UI Developer", location: "Milan, IT", years: 2, skills: ["React", "CSS", "Figma"], score: null, color: "#4f95e0", jobId: "j2", stage: "Applied", available: "Now" },
  { id: "c6", name: "Ana Petrović", title: "Full-stack Developer", location: "Belgrade, RS", years: 3, skills: ["React", "Node.js", "SQL"], score: 79, color: "#e86aa0", jobId: "j3", stage: "Screening", available: "2 weeks" },
  { id: "c7", name: "James Walker", title: "Backend Engineer", location: "Dublin, IE", years: 7, skills: ["Python", "Payments", "System design"], score: 93, color: "#2fae9b", jobId: "j4", stage: "Hired", available: "—" },
  { id: "c8", name: "Elif Demir", title: "QA Engineer", location: "Istanbul, TR", years: 4, skills: ["Playwright", "Postman", "APIs"], score: 82, color: "#a08bff", jobId: "j5", stage: "Applied", available: "1 month" },
  { id: "c9", name: "Noah Martin", title: "Data Analyst", location: "Paris, FR", years: 2, skills: ["SQL", "Python", "Tableau"], score: 77, color: "#f08a5d", jobId: "j6", stage: "Screening", available: "Now" },
  { id: "c10", name: "Chloe Evans", title: "Product Designer", location: "Bristol, UK", years: 5, skills: ["Figma", "Research", "Prototyping"], score: 89, color: "#5ab0f0", jobId: "j8", stage: "Interview", available: "2 weeks" },
  { id: "c11", name: "Luka Novak", title: "DevOps Engineer", location: "Ljubljana, SI", years: 5, skills: ["Kubernetes", "AWS", "Terraform"], score: null, color: "#58c38f", jobId: "j9", stage: "Applied", available: "1 month" },
  { id: "c12", name: "Mia Hoxha", title: "Junior Developer", location: "Tirana, AL", years: 1, skills: ["Python", "Django", "Git"], score: 72, color: "#d98bff", jobId: "j12", stage: "Screening", available: "Now" },
];

export const ME = {
  name: "Maya Collins",
  title: "Full-stack Developer",
  location: "Tirana, AL",
  years: 3,
  skills: ["Python", "Django", "React", "APIs", "SQL", "Git"],
};

export const PERSONAS = {
  candidate: { name: "Maya Collins", sub: "Candidate", color: "#8b6cff" },
  recruiter: { name: "Daniel Reed", sub: "Recruiter · TalentBridge", color: "#3cc08a" },
  company: { name: "Sofia Marin", sub: "Hiring · Northwind Labs", color: "#ff8a65" },
} as const;
export type Persona = keyof typeof PERSONAS;
