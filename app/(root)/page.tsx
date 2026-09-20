"use client";

import {
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  CalendarClock,
  ChevronRight,
  Clock3,
  Code2,
  Flame,
  LayoutDashboard,
  Mic2,
  Play,
  Plus,
  Settings2,
  Target,
  Trophy,
  Video,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const recentInterviews = [
  { role: "Frontend Engineer", company: "Northstar Labs", score: "82%", date: "Yesterday", tone: "violet" },
  { role: "Product Designer", company: "Orbital", score: "74%", date: "May 18", tone: "orange" },
  { role: "Full-stack Developer", company: "Arc & Co.", score: "91%", date: "May 14", tone: "green" },
];

const focusAreas = [
  { label: "Communication", value: 86, color: "bg-primary-200" },
  { label: "Technical depth", value: 72, color: "bg-[#f5b97b]" },
  { label: "Problem solving", value: 91, color: "bg-[#7bd6b1]" },
];

export default function Page() {
  const [activeView, setActiveView] = useState("Overview");

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 px-6 py-8 lg:flex">
          <div className="mb-14 flex items-center gap-3 px-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-200 text-dark-100"><BrainCircuit size={21} strokeWidth={2.5} /></span>
            <span className="text-xl font-bold tracking-tight">PrepAI</span>
          </div>
          <nav className="space-y-2" aria-label="Main navigation">
            {[{ label: "Overview", icon: LayoutDashboard }, { label: "My interviews", icon: Video }, { label: "Performance", icon: BarChart3 }].map(({ label, icon: Icon }) => (
              <button key={label} onClick={() => setActiveView(label)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${activeView === label ? "bg-primary-200 text-dark-100" : "text-light-400 hover:bg-white/5 hover:text-white"}`}>
                <Icon size={18} />{label}
              </button>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl border border-white/10 bg-[#111319] p-4">
            <div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-light-400">Weekly goal</span><Target size={16} className="text-primary-200" /></div>
            <p className="mb-3 text-sm text-white">2 of 3 sessions complete</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-primary-200" /></div>
            <p className="mt-3 text-xs text-light-400">One more practice run to stay on track.</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
          <header className="mb-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:hidden"><span className="flex size-9 items-center justify-center rounded-xl bg-primary-200 text-dark-100"><BrainCircuit size={21} /></span><span className="text-xl font-bold">PrepAI</span></div>
            <div className="hidden lg:block"><p className="mb-1 text-sm text-light-400">Tuesday, May 21, 2024</p><h1 className="text-3xl font-semibold tracking-tight">Good morning, Alex.</h1></div>
            <div className="ml-auto flex items-center gap-3"><button aria-label="Open settings" className="rounded-full border border-white/10 p-2.5 text-light-400 transition hover:border-white/25 hover:text-white"><Settings2 size={18} /></button><div className="flex size-10 items-center justify-center rounded-full bg-[#f5b97b] text-sm font-bold text-[#422513]">AC</div></div>
          </header>

          <div className="mb-10 lg:hidden"><p className="mb-1 text-sm text-light-400">Tuesday, May 21, 2024</p><h1 className="text-3xl font-semibold tracking-tight">Good morning, Alex.</h1></div>

          <div className="mb-10 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <div className="relative overflow-hidden rounded-3xl bg-primary-200 px-6 py-7 text-dark-100 sm:px-9 sm:py-9">
              <div className="relative z-10 max-w-lg"><div className="mb-5 flex items-center gap-2 text-sm font-semibold"><span className="flex size-7 items-center justify-center rounded-full bg-dark-100/10"><Zap size={15} fill="currentColor" /></span>Your next breakthrough is one session away</div><h2 className="mb-3 max-w-md text-3xl font-bold leading-tight sm:text-4xl">Ready to make your answers sharper?</h2><p className="mb-7 max-w-md text-sm leading-6 text-dark-100/70">Practice a realistic interview tailored to the role you want next.</p><Link href="/interview" className="inline-flex items-center gap-2 rounded-full bg-dark-100 px-5 py-3 text-sm font-bold text-white transition hover:bg-dark-200"><Play size={16} fill="currentColor" />Start an interview</Link></div>
              <div className="absolute -right-12 -top-20 size-64 rounded-full border-[28px] border-dark-100/10" /><div className="absolute -bottom-28 right-20 size-56 rounded-full border-[20px] border-dark-100/10" />
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#111319] p-6 sm:p-8"><div className="mb-7 flex items-start justify-between"><div><p className="mb-2 text-sm text-light-400">Interview streak</p><p className="text-4xl font-semibold">6 <span className="text-lg font-normal text-light-400">days</span></p></div><span className="flex size-11 items-center justify-center rounded-2xl bg-[#f5b97b]/15 text-[#f5b97b]"><Flame size={22} fill="currentColor" /></span></div><div className="flex items-center gap-2 text-sm text-light-400"><span className="text-[#7bd6b1]">+2 days</span> from last week <ArrowUpRight size={15} className="text-[#7bd6b1]" /></div></div>
          </div>

          <div className="mb-10 grid gap-5 sm:grid-cols-3">{[{ label: "Practice sessions", value: "12", icon: Mic2, detail: "+3 this month" }, { label: "Average score", value: "82%", icon: Trophy, detail: "+8% this month" }, { label: "Time practiced", value: "4h 20m", icon: Clock3, detail: "Across 12 sessions" }].map(({ label, value, icon: Icon, detail }) => <div key={label} className="border-b border-white/10 pb-5 sm:border-b-0 sm:border-r sm:pr-5 last:border-0"><div className="mb-4 flex items-center gap-2 text-sm text-light-400"><Icon size={16} className="text-primary-200" />{label}</div><p className="mb-1 text-2xl font-semibold">{value}</p><p className="text-xs text-light-400">{detail}</p></div>)}</div>

          <div className="grid gap-10 xl:grid-cols-[1.4fr_0.9fr]">
            <section><div className="mb-5 flex items-center justify-between"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-light-400">Your activity</p><h2 className="text-xl font-semibold">Recent interviews</h2></div><button className="flex items-center gap-1 text-sm text-primary-200 hover:text-white">View all <ChevronRight size={16} /></button></div><div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#111319] px-5">{recentInterviews.map((interview) => <div key={interview.role} className="flex items-center gap-4 py-5"><span className={`hidden size-10 items-center justify-center rounded-xl sm:flex ${interview.tone === "orange" ? "bg-[#f5b97b]/15 text-[#f5b97b]" : interview.tone === "green" ? "bg-[#7bd6b1]/15 text-[#7bd6b1]" : "bg-primary-200/15 text-primary-200"}`}><Code2 size={19} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{interview.role}</p><p className="mt-1 text-xs text-light-400">{interview.company} <span className="mx-1 text-white/30">•</span> {interview.date}</p></div><div className="text-right"><p className="text-sm font-semibold text-[#7bd6b1]">{interview.score}</p><p className="mt-1 text-xs text-light-400">Overall score</p></div><ChevronRight size={16} className="text-light-400" /></div>)}</div></section>
            <section><div className="mb-5 flex items-center justify-between"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-light-400">Keep growing</p><h2 className="text-xl font-semibold">Focus areas</h2></div><BarChart3 size={19} className="text-light-400" /></div><div className="rounded-2xl border border-white/10 bg-[#111319] p-6">{focusAreas.map((area) => <div key={area.label} className="mb-6 last:mb-0"><div className="mb-2 flex justify-between text-sm"><span>{area.label}</span><span className="text-light-400">{area.value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${area.color}`} style={{ width: `${area.value}%` }} /></div></div>)}</div></section>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-white/15 px-5 py-4"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-white/5 text-primary-200"><CalendarClock size={17} /></span><p className="text-sm text-light-400">Schedule your next practice session</p></div><button className="flex items-center gap-2 text-sm font-semibold text-white hover:text-primary-200"><Plus size={16} />Add reminder</button></div>
        </section>
      </div>
    </main>
  );
}
