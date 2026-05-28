"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, Send } from "lucide-react";
import { finishPractice, saveAnswer } from "@/app/latihan/actions";

type ExamQuestion = {
  position: number;
  question: {
    id: number;
    question_text: string;
    question_options: {
      id: number;
      label: string;
      option_text: string;
      score: number;
    }[];
  };
};

export function ExamClient({
  sessionId,
  expiresAt,
  questions,
  initialAnswers,
}: {
  sessionId: string;
  expiresAt: string | null;
  questions: ExamQuestion[];
  initialAnswers: Record<number, number>;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [remainingSeconds, setRemainingSeconds] = useState(() => getRemainingSeconds(expiresAt));
  const activeItem = questions[activeIndex];

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const interval = window.setInterval(() => {
      const nextRemaining = getRemainingSeconds(expiresAt);
      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 0) {
        window.clearInterval(interval);
        const formData = new FormData();
        formData.set("session_id", sessionId);
        void finishPractice(formData);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [expiresAt, sessionId]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const visibilityChange = () => {
      if (document.hidden) {
        window.alert("Anda meninggalkan tab ujian. Pastikan kembali sebelum waktu habis.");
      }
    };

    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("visibilitychange", visibilityChange);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("visibilitychange", visibilityChange);
    };
  }, []);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progress = Math.round((answeredCount / Math.max(questions.length, 1)) * 100);

  if (!activeItem) {
    return null;
  }

  async function chooseAnswer(questionId: number, optionId: number) {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    const formData = new FormData();
    formData.set("session_id", sessionId);
    formData.set("question_id", String(questionId));
    formData.set("selected_option_id", String(optionId));
    await saveAnswer(formData);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <section className="flex flex-col gap-5">
        <header className="sticky top-3 z-10 rounded-[2rem] border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-600">Simulasi ujian resmi</p>
              <h1 className="text-2xl font-black">Soal {activeItem.position}</h1>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black ${remainingSeconds <= 300 ? "bg-red-50 text-red-700" : "bg-slate-950 text-white"}`}>
              <Clock3 className="size-4" /> {formatTime(remainingSeconds)}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm font-black text-slate-600">
            <span>{answeredCount}/{questions.length} dijawab</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${progress}%` }} />
          </div>
        </header>

        <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-lg font-bold leading-8">{activeItem.question.question_text}</p>
          <div className="mt-5 space-y-3">
            {activeItem.question.question_options
              .sort((a, b) => a.label.localeCompare(b.label))
              .map((option) => {
                const selected = answers[activeItem.question.id] === option.id;

                return (
                  <button
                    className={`w-full rounded-2xl border p-4 text-left font-semibold transition ${selected ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50 hover:border-slate-400"}`}
                    key={option.id}
                    onClick={() => chooseAnswer(activeItem.question.id, option.id)}
                    type="button"
                  >
                    {option.label}. {option.option_text}
                  </button>
                );
              })}
          </div>
        </article>

        <div className="sticky bottom-4 grid grid-cols-2 gap-3 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-4 font-black text-slate-700 disabled:opacity-40"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))}
            type="button"
          >
            <ChevronLeft className="size-4" /> Sebelumnya
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 font-black text-white disabled:opacity-40"
            disabled={activeIndex === questions.length - 1}
            onClick={() => setActiveIndex((index) => Math.min(index + 1, questions.length - 1))}
            type="button"
          >
            Lanjut <ChevronRight className="size-4" />
          </button>
        </div>
      </section>

      <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5">
        <h2 className="text-xl font-black">Nomor soal</h2>
        <div className="mt-4 grid grid-cols-5 gap-2 lg:grid-cols-4">
          {questions.map((item, index) => {
            const answered = answers[item.question.id];
            const active = index === activeIndex;

            return (
              <button
                className={`grid aspect-square place-items-center rounded-2xl text-sm font-black ${active ? "bg-slate-950 text-white" : answered ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-1 ring-slate-200"}`}
                key={item.question.id}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                {item.position}
              </button>
            );
          })}
        </div>
        <form action={finishPractice} className="mt-5">
          <input type="hidden" name="session_id" value={sessionId} />
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 font-black text-white hover:bg-emerald-800">
            <Send className="size-4" /> Submit ujian
          </button>
        </form>
        <p className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-slate-500">
          <CheckCircle2 className="size-4 text-emerald-700" /> Jawaban tersimpan otomatis saat dipilih.
        </p>
      </aside>
    </div>
  );
}

function getRemainingSeconds(expiresAt: string | null) {
  if (!expiresAt) {
    return 0;
  }

  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}
