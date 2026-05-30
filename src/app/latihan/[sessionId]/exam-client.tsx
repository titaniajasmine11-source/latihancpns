"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, List, Send } from "lucide-react";
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
    }[];
  };
};

export function ExamClient({
  sessionId,
  expiresAt,
  questions,
  initialAnswers,
  categoryName = "CPNS / CASN",
  topicName,
  mode = "exam",
}: {
  sessionId: string;
  expiresAt: string | null;
  questions: ExamQuestion[];
  initialAnswers: Record<number, number>;
  categoryName?: string;
  topicName?: string;
  mode?: "practice" | "exam";
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [remainingSeconds, setRemainingSeconds] = useState(() => getRemainingSeconds(expiresAt));
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const activeItem = questions[activeIndex];
  const isLastQuestion = activeIndex === questions.length - 1;

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
  const selectedAnswer = answers[activeItem?.question.id];
  const selectedLabel = activeItem?.question.question_options.find((option) => option.id === selectedAnswer)?.label;

  if (!activeItem) {
    return null;
  }

  async function chooseAnswer(questionId: number, optionId: number) {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    setSaveState("saving");
    const formData = new FormData();
    formData.set("session_id", sessionId);
    formData.set("question_id", String(questionId));
    formData.set("selected_option_id", String(optionId));
    try {
      await saveAnswer(formData);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  async function finishSession() {
    const formData = new FormData();
    formData.set("session_id", sessionId);
    await finishPractice(formData);
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <section className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          MODE <span className="text-amber-600">TRYOUT</span>
        </h1>
        <button aria-expanded={showQuestionList} aria-label="Tampilkan daftar nomor soal" className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-800 shadow-sm" onClick={() => setShowQuestionList((value) => !value)} type="button">
          <List className="size-5" /> <span className="hidden sm:inline">Nomor Soal</span> <ChevronDown className={`size-4 transition ${showQuestionList ? "rotate-180" : ""}`} />
        </button>
      </section>

      {showQuestionList ? (
        <section className="mb-5 grid grid-cols-5 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-8 md:grid-cols-10">
          {questions.map((item, index) => {
            const answered = answers[item.question.id];
            const active = index === activeIndex;

            return (
              <button className={`rounded-xl border px-3 py-2 text-sm font-bold shadow-sm ${active ? "border-slate-950 bg-slate-950 text-white" : answered ? "border-amber-500 bg-amber-50 text-amber-900" : "border-slate-200 bg-white text-slate-700"}`} key={item.question.id} onClick={() => setActiveIndex(index)} type="button">
                {item.position}
              </button>
            );
          })}
        </section>
      ) : null}

      <section className={`mb-5 rounded-2xl border bg-white p-4 text-sm font-medium text-slate-700 ${remainingSeconds > 0 && remainingSeconds <= 300 ? "border-red-500" : "border-amber-200"}`}>
        <p>Progress jawaban tersimpan otomatis. Selesaikan sesi setelah semua soal terjawab.</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full bg-slate-950 px-4 py-1.5 text-xs font-bold text-white">{answeredCount}/{questions.length} dijawab</span>
          {expiresAt ? <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs font-bold ${remainingSeconds <= 300 ? "bg-red-100 text-red-700" : "bg-slate-950 text-white"}`}><Clock3 className="size-3.5" /> {formatTime(remainingSeconds)}</span> : null}
          <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-800">{progress}%</span>
          <span className={`rounded-full px-4 py-1.5 text-xs font-bold ${saveState === "error" ? "bg-red-100 text-red-700" : saveState === "saving" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
            {saveState === "saving" ? "Menyimpan..." : saveState === "error" ? "Gagal menyimpan" : saveState === "saved" ? "Tersimpan" : "Autosave aktif"}
          </span>
        </div>
      </section>

      <section className="paper-card mb-5 rounded-2xl p-4">
        <div className="grid gap-3 border-b border-slate-200 pb-3 text-sm md:grid-cols-2">
          <div className="grid grid-cols-[120px_1fr] gap-2"><strong>Kelompok Soal</strong><span>{categoryName}</span></div>
          <div className="grid grid-cols-[120px_1fr] gap-2"><strong>Mata Pelajaran</strong><span>{topicName ?? (mode === "exam" ? "SIMULASI CPNS" : "LATIHAN TOPIK")}</span></div>
        </div>
        <div className="mt-3 grid grid-cols-[120px_1fr] gap-2 text-sm"><strong>Paket Soal</strong><span>{mode === "exam" ? "MODE TRYOUT" : "MODE LATIHAN"}</span></div>
      </section>

      <article className="paper-card mb-5 rounded-2xl p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 text-sm">
          <div>
            <span className="mr-2">Soal nomor</span>
            <select className="rounded-full border border-slate-300 px-2 py-1" onChange={(event) => setActiveIndex(Number(event.target.value))} value={activeIndex}>
              {questions.map((item, index) => <option key={item.question.id} value={index}>{item.position}</option>)}
            </select>
            <span className="mx-2">/</span><span className="rounded-full border border-slate-300 px-3 py-1">{questions.length}</span>
          </div>
          <span className="font-bold text-slate-500">{answeredCount}/{questions.length} dijawab</span>
        </div>
        <p className="question-text text-slate-950">{activeItem.question.question_text}</p>
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="size-4" /><em>Pilih jawaban berikut:</em></div>
        <div className="mt-4 space-y-3">
            {[...activeItem.question.question_options]
              .sort((a, b) => a.label.localeCompare(b.label))
              .map((option) => {
                const selected = answers[activeItem.question.id] === option.id;

                return (
                  <button
                    className={`group flex w-full items-start gap-3 rounded-2xl border bg-white p-3 text-left shadow-sm transition hover:border-amber-300 hover:bg-amber-50 ${selected ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}
                    key={option.id}
                    onClick={() => chooseAnswer(activeItem.question.id, option.id)}
                    type="button"
                  >
                    <span className={`grid size-[30px] shrink-0 place-items-center rounded-xl border text-sm font-bold ${selected ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-700 group-hover:border-amber-500"}`}>
                      {option.label}
                    </span>
                    <span className="option-text pt-0.5">
                      {option.option_text}
                    </span>
                  </button>
                );
              })}
        </div>
      </article>

      <section className="sticky bottom-4 rounded-3xl bg-white p-4 shadow-xl ring-1 ring-slate-200">
        <div className="mb-4 border-b border-slate-200 pb-3 text-sm">Jawaban Anda adalah <strong>{selectedLabel ?? "?"}</strong></div>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_160px]">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-3 font-bold text-slate-700 disabled:opacity-40"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))}
            type="button"
          >
            <ChevronLeft className="size-4" /> Soal Sebelumnya
          </button>
          <button className="primary-action inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 font-bold" onClick={isLastQuestion ? () => setShowFinishConfirm(true) : () => setActiveIndex((index) => Math.min(index + 1, questions.length - 1))} type="button">
            {isLastQuestion ? <Send className="size-4" /> : <ChevronRight className="size-4" />} {isLastQuestion ? "Selesai" : "Soal Berikutnya"}
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 font-bold text-white" onClick={() => setShowFinishConfirm(true)} type="button">
            <Send className="size-4" /> Selesai
          </button>
        </div>
      </section>
      {showFinishConfirm ? (
        <div className="fixed inset-0 z-[60] grid items-end bg-slate-950/40 px-4 pb-4 backdrop-blur-sm sm:place-items-center sm:p-4">
          <div className="w-full max-w-md rounded-[1.75rem] bg-white p-5 shadow-2xl shadow-slate-950/20">
            <h2 className="text-xl font-bold text-slate-950">Selesaikan latihan?</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
              Jawaban yang belum diisi akan dihitung kosong. Setelah selesai, pembahasan langsung terbuka.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button className="rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-700" onClick={() => setShowFinishConfirm(false)} type="button">
                Lanjut mengerjakan
              </button>
              <button className="rounded-2xl bg-emerald-700 px-4 py-3 font-bold text-white" onClick={finishSession} type="button">
                Ya, selesaikan
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
