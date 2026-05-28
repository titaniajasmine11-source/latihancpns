import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { finishPractice, saveAnswer } from "@/app/latihan/actions";
import { ExamClient } from "@/app/latihan/[sessionId]/exam-client";
import { createClient } from "@/lib/supabase/server";

type SessionQuestion = {
  position: number;
  questions:
    | {
    id: number;
    question_text: string;
    explanation: string | null;
    question_options: {
      id: number;
      label: string;
      option_text: string;
      score: number;
    }[];
  }
    | {
        id: number;
        question_text: string;
        explanation: string | null;
        question_options: {
          id: number;
          label: string;
          option_text: string;
          score: number;
        }[];
      }[];
};

type ExamClientQuestion = {
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

type UserAnswer = {
  question_id: number;
  selected_option_id: number;
};

export default async function PracticeSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .select("id, mode, status, total_questions, expires_at, categories(code, name), topics(name)")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    redirect("/dashboard");
  }

  if (session.status === "finished") {
    redirect(`/hasil/${sessionId}`);
  }

  const [{ data: sessionQuestions }, { data: answers }] = await Promise.all([
    supabase
      .from("session_questions")
      .select("position, questions(id, question_text, explanation, question_options(id, label, option_text, score))")
      .eq("session_id", sessionId)
      .order("position", { ascending: true }),
    supabase
      .from("user_answers")
      .select("question_id, selected_option_id")
      .eq("session_id", sessionId)
      .eq("user_id", user.id),
  ]);

  const answerByQuestion = new Map<number, number>();
  ((answers ?? []) as UserAnswer[]).forEach((answer) => {
    answerByQuestion.set(answer.question_id, answer.selected_option_id);
  });

  const answeredCount = answerByQuestion.size;
  const category = Array.isArray(session.categories) ? session.categories[0] : session.categories;
  const topic = Array.isArray(session.topics) ? session.topics[0] : session.topics;

  if (session.mode === "exam") {
    const examQuestions = ((sessionQuestions ?? []) as SessionQuestion[]).map((item) => ({
      position: item.position,
      question: Array.isArray(item.questions) ? item.questions[0] : item.questions,
    })) as ExamClientQuestion[];
    const initialAnswers = Object.fromEntries(answerByQuestion.entries());

    return (
      <main className="min-h-screen bg-[#f5f0e8] px-4 pb-28 pt-6 text-slate-950 sm:px-6 md:pb-6 lg:px-8">
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
          <Link href="/latihan" className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-emerald-700 shadow-sm ring-1 ring-slate-200">
            <ArrowLeft className="size-4" /> Keluar ke latihan
          </Link>
          <ExamClient
            expiresAt={session.expires_at}
            initialAnswers={initialAnswers}
            questions={examQuestions}
            sessionId={sessionId}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-4 pb-28 pt-6 text-slate-950 sm:px-6 md:pb-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <header className="sticky top-3 z-10 rounded-[2rem] border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
          <Link href="/latihan" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
            <ArrowLeft className="size-4" /> Pilih topik lain
          </Link>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-600">
                {category?.code && topic?.name ? `${category.code} - ${topic.name}` : "Simulasi ujian campuran"}
              </p>
              <h1 className="text-2xl font-black">Latihan berlangsung</h1>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800">
              {answeredCount}/{session.total_questions}
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${Math.round((answeredCount / Math.max(session.total_questions, 1)) * 100)}%` }}
            />
          </div>
        </header>

        {((sessionQuestions ?? []) as SessionQuestion[]).map((item) => {
          const question = Array.isArray(item.questions) ? item.questions[0] : item.questions;
          const selectedOptionId = answerByQuestion.get(question.id);

          return (
            <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm" key={question.id}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white">
                  Soal {item.position}
                </span>
                {selectedOptionId ? (
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                    <CheckCircle2 className="size-4" /> Tersimpan
                  </span>
                ) : null}
              </div>
              <p className="text-lg font-bold leading-8">{question.question_text}</p>
              <div className="mt-5 space-y-3">
                {question.question_options
                  .sort((a, b) => a.label.localeCompare(b.label))
                  .map((option) => {
                    const selected = selectedOptionId === option.id;

                    return (
                      <form action={saveAnswer} key={option.id}>
                        <input type="hidden" name="session_id" value={sessionId} />
                        <input type="hidden" name="question_id" value={question.id} />
                        <input type="hidden" name="selected_option_id" value={option.id} />
                        <button
                          className={`w-full rounded-2xl border p-4 text-left font-semibold transition ${
                            selected
                              ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                              : "border-slate-200 bg-slate-50 hover:border-slate-400"
                          }`}
                        >
                          {option.label}. {option.option_text}
                        </button>
                      </form>
                    );
                  })}
              </div>
            </article>
          );
        })}

        <form action={finishPractice} className="sticky bottom-4 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10">
          <input type="hidden" name="session_id" value={sessionId} />
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 font-black text-white hover:bg-slate-800">
            <Send className="size-4" /> Submit dan lihat hasil
          </button>
        </form>
      </section>
    </main>
  );
}
