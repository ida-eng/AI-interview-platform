"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mic, MicOff, Play, RotateCcw, Volume2, Waves } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SpeechRecognitionResultEvent = Event & {
  results: { length: number; [index: number]: { [index: number]: { transcript: string } } };
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const questions = [
  "Tell me about yourself and the kind of work you enjoy doing most.",
  "Describe a difficult technical problem you solved recently. What did you learn?",
  "How do you handle disagreement with a teammate about an implementation decision?",
];

export default function InterviewPage() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const question = questions[questionIndex];

  const speakQuestion = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceAvailable(Boolean(Recognition && "speechSynthesis" in window));
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length }, (_, index) => event.results[index][0].transcript).join(" ");
      setAnswer(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const startInterview = () => {
    setStarted(true);
    speakQuestion(questions[0]);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const submitAnswer = () => {
    const nextAnswers = [...answers, answer.trim()];
    if (questionIndex === questions.length - 1) {
      setAnswers(nextAnswers);
      setFinished(true);
      window.speechSynthesis?.cancel();
      return;
    }
    const nextIndex = questionIndex + 1;
    setAnswers(nextAnswers);
    setQuestionIndex(nextIndex);
    setAnswer("");
    speakQuestion(questions[nextIndex]);
  };

  const resetInterview = () => {
    window.speechSynthesis?.cancel();
    recognitionRef.current?.stop();
    setStarted(false);
    setFinished(false);
    setQuestionIndex(0);
    setAnswer("");
    setAnswers([]);
    setIsListening(false);
  };

  return (
    <main className="min-h-screen bg-[#08090d] px-5 py-6 text-white sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-light-400 transition hover:text-white"><ArrowLeft size={17} />Back to dashboard</Link>
          <div className="flex items-center gap-2 text-sm font-semibold"><span className="flex size-8 items-center justify-center rounded-lg bg-primary-200 text-dark-100"><Waves size={17} /></span>Live AI interview</div>
        </header>

        {!started && !finished && (
          <section className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-[#111319] p-7 text-center sm:p-12">
            <span className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary-200/15 text-primary-200"><Mic size={30} /></span>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-200">Frontend Engineer practice</p>
            <h1 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">Your AI interviewer is ready.</h1>
            <p className="mx-auto mb-8 max-w-lg leading-7 text-light-400">You will get three behavioral questions. Speak your answer naturally and PrepAI will transcribe it in this browser.</p>
            <div className="mb-8 grid gap-3 text-left sm:grid-cols-3"><div className="rounded-2xl border border-white/10 p-4"><Volume2 className="mb-3 text-primary-200" size={19} /><p className="text-sm font-semibold">AI voice</p><p className="mt-1 text-xs text-light-400">Questions are spoken aloud.</p></div><div className="rounded-2xl border border-white/10 p-4"><Mic className="mb-3 text-primary-200" size={19} /><p className="text-sm font-semibold">Voice answers</p><p className="mt-1 text-xs text-light-400">Your browser transcribes your response.</p></div><div className="rounded-2xl border border-white/10 p-4"><CheckCircle2 className="mb-3 text-primary-200" size={19} /><p className="text-sm font-semibold">Instant recap</p><p className="mt-1 text-xs text-light-400">Review your completed answers.</p></div></div>
            {!voiceAvailable && <p className="mb-5 text-sm text-[#f5b97b]">Voice recognition is unavailable here. You can still type your answers.</p>}
            <button onClick={startInterview} className="inline-flex items-center gap-2 rounded-full bg-primary-200 px-6 py-3 font-bold text-dark-100 transition hover:bg-primary-100"><Play size={17} fill="currentColor" />Begin interview</button>
          </section>
        )}

        {started && !finished && (
          <section className="grid gap-6 lg:grid-cols-[0.85fr_1.35fr]">
            <div className="rounded-3xl border border-primary-200/20 bg-blue-gradient-dark p-7 sm:p-9"><div className="mb-14 flex items-center justify-between"><span className="text-sm text-light-400">Question {questionIndex + 1} of {questions.length}</span><span className="flex items-center gap-2 text-xs text-[#7bd6b1]"><span className="size-2 animate-pulse rounded-full bg-[#7bd6b1]" />AI interviewer live</span></div><div className="mb-8 flex size-20 items-center justify-center rounded-full bg-primary-200/15 text-primary-200"><Volume2 size={34} /></div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary-200">Interviewer asks</p><h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{question}</h1><button onClick={() => speakQuestion(question)} className="mt-8 inline-flex items-center gap-2 text-sm text-light-400 transition hover:text-white"><Volume2 size={16} />Replay question</button></div>
            <div className="rounded-3xl border border-white/10 bg-[#111319] p-6 sm:p-9"><div className="mb-5 flex items-center justify-between"><div><p className="text-lg font-semibold">Your answer</p><p className="mt-1 text-sm text-light-400">Speak or type your response below.</p></div><button onClick={toggleListening} disabled={!voiceAvailable} className={`flex size-12 items-center justify-center rounded-full transition ${isListening ? "bg-destructive-100 text-white" : "bg-primary-200 text-dark-100 hover:bg-primary-100"}`} aria-label={isListening ? "Stop recording" : "Start recording"}>{isListening ? <MicOff size={20} /> : <Mic size={20} />}</button></div><textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={isListening ? "Listening..." : "Your response will appear here..."} className="min-h-64 w-full resize-none rounded-2xl border border-white/10 bg-[#08090d] p-5 text-sm leading-7 text-white outline-none transition placeholder:text-light-400 focus:border-primary-200/60" /><div className="mt-5 flex items-center justify-between gap-4"><span className={`text-xs ${isListening ? "text-[#7bd6b1]" : "text-light-400"}`}>{isListening ? "Recording your answer" : "Ready when you are"}</span><button onClick={submitAnswer} disabled={!answer.trim()} className="rounded-full bg-primary-200 px-5 py-3 text-sm font-bold text-dark-100 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-40">{questionIndex === questions.length - 1 ? "Finish interview" : "Next question"}</button></div></div>
          </section>
        )}

        {finished && (
          <section className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-[#111319] p-7 sm:p-12"><span className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-[#7bd6b1]/15 text-[#7bd6b1]"><CheckCircle2 size={30} /></span><p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#7bd6b1]">Session complete</p><h1 className="mb-4 text-3xl font-semibold">Nice work. Your practice is saved locally.</h1><p className="mb-8 leading-7 text-light-400">You answered all three questions. Read through your responses while they are fresh, then run it again to sharpen your delivery.</p><div className="mb-8 space-y-3">{answers.map((item, index) => <div key={index} className="rounded-2xl border border-white/10 p-4"><p className="mb-2 text-xs font-semibold text-primary-200">Question {index + 1}</p><p className="text-sm leading-6 text-light-400">{item || "No response recorded."}</p></div>)}</div><button onClick={resetInterview} className="inline-flex items-center gap-2 rounded-full bg-primary-200 px-5 py-3 text-sm font-bold text-dark-100 transition hover:bg-primary-100"><RotateCcw size={16} />Practice again</button></section>
        )}
      </div>
    </main>
  );
}