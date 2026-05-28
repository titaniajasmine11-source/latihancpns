import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
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
      is_correct: boolean;
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
          is_correct: boolean;
          score: number;
        }[];
      }[];
};

type UserAnswer = {
  question_id: number;
  selected_option_id: number;
  score: number;
};

export default async function ResultPage({ params }: { params: Promise<{ sessionId: string }> }) {
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
    .select("id, status, total_questions, total_score, categories(code, name), topics(name)")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    redirect("/dashboard");
  }

  if (session.status !== "finished") {
    redirect(`/latihan/${sessionId}`);
  }

  const [{ data: sessionQuestions }, { data: answers }] = await Promise.all([
    supabase
      .from("session_questions")
      .select("position, questions(id, question_text, explanation, question_options(id, label, option_text, is_correct, score))")
      .eq("session_id", sessionId)
      .order("position", { ascending: true }),
    supabase
      .from("user_answers")
      .select("question_id, selected_option_id, score")
      .eq("session_id", sessionId)
      .eq("user_id", user.id),
  ]);

  const answerByQuestion = new Map<number, UserAnswer>();
  ((answers ?? []) as UserAnswer[]).forEach((answer) => {
    answerByQuestion.set(answer.question_id, answer);
  });

  const category = Array.isArray(session.categories) ? session.categories[0] : session.categories;
  const topic = Array.isArray(session.topics) ? session.topics[0] : session.topics;

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <header className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-200">
            <ArrowLeft className="size-4" /> Dashboard
          </Link>
          <div className="mt-6 flex items-end justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-slate-300">
                {category?.code} - {topic?.name}
              </p>
              <h1 className="mt-2 text-4xl font-black">Skor {session.total_score}</h1>
              <p className="mt-2 text-slate-300">{answerByQuestion.size} dari {session.total_questions} soal dijawab.</p>
            </div>
            <div className="grid size-16 place-items-center rounded-3xl bg-emerald-400 text-slate-950">
              <Trophy className="size-8" />
            </div>
          </div>
        </header>

        {((sessionQuestions ?? []) as SessionQuestion[]).map((item) => {
          const question = Array.isArray(item.questions) ? item.questions[0] : item.questions;
          const answer = answerByQuestion.get(question.id);
          const selectedOption = question.question_options.find((option) => option.id === answer?.selected_option_id);

          return (
            <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm" key={question.id}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white">
                  Soal {item.position}
                </span>
                <span className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800">
                  +{answer?.score ?? 0}
                </span>
              </div>
              <p className="text-lg font-bold leading-8">{question.question_text}</p>
              <div className="mt-5 space-y-3">
                {question.question_options
                  .sort((a, b) => a.label.localeCompare(b.label))
                  .map((option) => {
                    const selected = selectedOption?.id === option.id;
                    const correct = option.is_correct;

                    return (
                      <div
                        className={`rounded-2xl border p-4 text-sm font-semibold ${
                          correct
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                            : selected
                              ? "border-amber-400 bg-amber-50 text-amber-900"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                        key={option.id}
                      >
                        {option.label}. {option.option_text}
                        {selected ? " - Jawaban Anda" : ""}
                      </div>
                    );
                  })}
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-900">Pembahasan</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{question.explanation}</p>
              </div>
            </article>
          );
        })}

        <Link href="/latihan" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 font-black text-white hover:bg-emerald-800">
          <RotateCcw className="size-4" /> Latihan lagi
        </Link>
      </section>
    </main>
  );
}
