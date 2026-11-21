# Hireloop: AI interview practice + jobs platform

Practise job interviews with an AI interviewer that speaks, listens and scores every answer, then apply to jobs matched to your skills. Recruiters screen candidates with AI interviews, and companies post roles and follow applicants, all in one connected platform.

**Live demo:** https://ai-interview-platform-frhn.vercel.app (with Gemini AI feedback)

> Portfolio project by [Aida Topalli](https://ida-eng.github.io/portfolio/). Companies, jobs and people are fictional. Switch between the candidate, recruiter and company views from the avatar menu.

## What you can do

**Candidates**
- Voice mock interviews for 10 roles (engineering, data, product, design, sales, customer success): behavioural, technical or mixed, 3–7 questions
- The interviewer reads questions aloud (Web Speech API); answer by voice with live transcription and a mic level meter, or type
- Per-answer scores for structure (STAR), relevance, clarity, depth and confidence, with filler words highlighted, strengths, improvements and coach tips
- Dashboard with readiness score, streak, skill radar, trends and history
- Job board with search, filters, salary slider, saved jobs and a skill-based match score; practise for a specific job before applying
- Application tracker that updates when a recruiter moves you forward

**Recruiters**
- Drag-and-drop pipeline across five stages, filtered by role
- Candidate profiles with AI scores; invite anyone to an AI screening
- Talent search by skill and minimum interview score

**Companies**
- Post jobs with validation and a live preview; open and close listings
- Views, applicants and view-to-apply conversion per listing

Everything is connected: a job a company posts appears for candidates, an application shows up in the recruiter's pipeline, a screening invite lands on the candidate's dashboard, and the finished screening score flows back to the recruiter.

## AI feedback

Answers are scored instantly in the browser by a rule-based analyser (`src/analyzer.ts`, unit-tested). If `GEMINI_API_KEY` is set on Vercel, the serverless function in `api/feedback.js` asks Google Gemini to refine the written feedback and scores; if the call fails, the app falls back to the built-in analyser.

## Tech

React 19 · TypeScript · Vite · Web Speech API (speech synthesis + recognition) · Web Audio API · Vercel serverless function · Google Gemini (optional) · localStorage persistence · hand-written CSS and SVG charts

## Run locally

```bash
npm install
npm run dev
npm test            # analyser unit tests (Node 22+)
```

## Deploy

Import the repository on Vercel (framework: Vite). Optionally add `GEMINI_API_KEY` (free from Google AI Studio) under Environment Variables and redeploy.
