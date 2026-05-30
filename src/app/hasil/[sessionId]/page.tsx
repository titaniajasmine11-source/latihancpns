import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type SessionQuestion = {
  position: number;
  question_id: number;
  question_text: string;
  explanation: string | null;
  category_code: string | null;
  topic_name: string | null;
  options:
    | {
        id: number;
        label: string;
        option_text: string;
        is_correct: boolean;
        score: number;
      }[]
    | string;
};

type UserAnswer = {
  question_id: number;
  selected_option_id: number;
  score: number;
};

type ScoringSetting = {
  TWK?: { passing_grade?: number };
  TIU?: { passing_grade?: number };
  TKP?: { passing_grade?: number };
};

export default async function ResultPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .select("id, mode, status, total_questions, total_score, categories(code, name), topics(name)")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    redirect("/dashboard");
  }

  if (session.status !== "finished") {
    redirect(`/latihan/${sessionId}`);
  }

  const [{ data: sessionQuestions }, { data: answers }, { data: scoringSetting }] = await Promise.all([
    supabase
      .rpc("get_finished_session_review", { p_session_id: sessionId }),
    supabase
      .from("user_answers")
      .select("question_id, selected_option_id, score")
      .eq("session_id", sessionId)
      .eq("user_id", user.id),
    supabase.from("app_settings").select("value").eq("key", "scoring").maybeSingle(),
  ]);

  const answerByQuestion = new Map<number, UserAnswer>();
  ((answers ?? []) as UserAnswer[]).forEach((answer) => {
    answerByQuestion.set(answer.question_id, answer);
  });

  const category = Array.isArray(session.categories) ? session.categories[0] : session.categories;
  const topic = Array.isArray(session.topics) ? session.topics[0] : session.topics;
  const breakdown = new Map<string, { score: number; answered: number; total: number }>();
  const topicBreakdown = new Map<string, { score: number; answered: number; total: number }>();

  ((sessionQuestions ?? []) as SessionQuestion[]).forEach((item) => {
    const code = item.category_code ?? "CPNS";
    const topicKey = `${code} - ${item.topic_name ?? "Tanpa topik"}`;
    const answer = answerByQuestion.get(item.question_id);
    const current = breakdown.get(code) ?? { score: 0, answered: 0, total: 0 };
    const currentTopic = topicBreakdown.get(topicKey) ?? { score: 0, answered: 0, total: 0 };

    breakdown.set(code, {
      score: current.score + (answer?.score ?? 0),
      answered: current.answered + (answer ? 1 : 0),
      total: current.total + 1,
    });
    topicBreakdown.set(topicKey, {
      score: currentTopic.score + (answer?.score ?? 0),
      answered: currentTopic.answered + (answer ? 1 : 0),
      total: currentTopic.total + 1,
    });
  });

  const scoring = scoringSetting?.value as ScoringSetting | null;
  const passingGrades = new Map([
    ["TWK", scoring?.TWK?.passing_grade ?? 65],
    ["TIU", scoring?.TIU?.passing_grade ?? 80],
    ["TKP", scoring?.TKP?.passing_grade ?? 166],
  ]);
  const categoryStatuses = Array.from(breakdown.entries()).map(([code, item]) => {
    const passingGrade = passingGrades.get(code);
    return {
      code,
      score: item.score,
      passingGrade,
      passed: passingGrade ? item.score >= passingGrade : true,
    };
  });
  const isExam = session.mode === "exam";
  const finalPassed = isExam && categoryStatuses.length > 0 && categoryStatuses.every((item) => item.passed);
  const weakestTopics = Array.from(topicBreakdown.entries())
    .map(([name, item]) => ({
      name,
      ...item,
      average: item.total ? item.score / item.total : 0,
      completion: item.total ? item.answered / item.total : 0,
    }))
    .sort((a, b) => a.average - b.average || a.completion - b.completion)
    .slice(0, 3);

  return (
    <main className="app-page min-h-screen px-4 pb-28 pt-6 text-slate-950 sm:px-6 md:pb-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <header className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-200">
            <ArrowLeft className="size-4" /> Dashboard
          </Link>
          <div className="mt-6 flex items-end justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-slate-300">
                {category?.code && topic?.name ? `${category.code} - ${topic.name}` : "Simulasi ujian campuran"}
              </p>
              <h1 className="mt-2 text-4xl font-black">Skor {session.total_score}</h1>
              <p className="mt-2 text-slate-300">{answerByQuestion.size} dari {session.total_questions} soal dijawab.</p>
            </div>
            <div className="grid size-16 place-items-center rounded-3xl bg-emerald-400 text-slate-950">
              <Trophy className="size-8" />
            </div>
          </div>
        </header>

        {isExam ? (
          <section className={`rounded-[2rem] border p-5 shadow-sm ${finalPassed ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}>
            <p className="text-sm font-black uppercase tracking-wide">Status akhir</p>
            <h2 className="mt-2 text-3xl font-black">{finalPassed ? "Lulus simulasi" : "Belum lulus simulasi"}</h2>
            <p className="mt-2 text-sm font-semibold leading-6">
              {finalPassed
                ? "Semua kategori memenuhi ambang batas yang aktif di settings."
                : "Minimal satu kategori belum memenuhi ambang batas. Gunakan pembahasan untuk memperbaiki area lemah."}
            </p>
          </section>
        ) : (
          <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 shadow-sm">
            <p className="text-sm font-black uppercase tracking-wide">Ringkasan latihan</p>
            <h2 className="mt-2 text-3xl font-black">Latihan selesai</h2>
            <p className="mt-2 text-sm font-semibold leading-6">
              Gunakan pembahasan di bawah untuk mengecek jawaban dan memperbaiki topik yang masih lemah.
            </p>
          </section>
        )}

        <section className="grid gap-3 sm:grid-cols-3">
          {Array.from(breakdown.entries()).map(([code, item]) => {
            const passingGrade = passingGrades.get(code);
            const status = passingGrade ? (item.score >= passingGrade ? "Lulus ambang" : "Belum lulus") : null;

            return (
              <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm" key={code}>
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white">{code}</span>
                  <span className="text-sm font-bold text-slate-500">{item.answered}/{item.total}</span>
                </div>
                <p className="mt-4 text-3xl font-black">{item.score}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {passingGrade ? `Ambang simulasi: ${passingGrade}` : "Skor kategori"}
                </p>
                {status ? (
                  <p className={`mt-3 rounded-2xl px-3 py-2 text-sm font-black ${item.score >= (passingGrade ?? 0) ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
                    {status}
                  </p>
                ) : null}
              </article>
            );
          })}
        </section>

        {weakestTopics.length ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Analisis kelemahan</p>
            <h2 className="mt-2 text-2xl font-black">Prioritas belajar berikutnya</h2>
            <div className="mt-4 grid gap-3">
              {weakestTopics.map((item) => (
                <article className="rounded-3xl bg-slate-50 p-4" key={item.name}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-black">{item.name}</h3>
                    <span className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-slate-700 ring-1 ring-slate-200">
                      {item.answered}/{item.total} dijawab
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    Rata-rata skor per soal: {item.average.toFixed(1)}. Ulangi topik ini untuk menaikkan konsistensi.
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {((sessionQuestions ?? []) as SessionQuestion[]).map((item) => {
          const options = parseOptions(item.options);
          const answer = answerByQuestion.get(item.question_id);
          const selectedOption = options.find((option) => option.id === answer?.selected_option_id);

          return (
            <article className="question-card rounded-[2rem] p-5 sm:p-6" key={item.question_id}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white">
                  {item.category_code ?? "CPNS"} - Soal {item.position}
                </span>
                <span className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800">
                  +{answer?.score ?? 0}
                </span>
              </div>
              <p className="text-base font-bold leading-7 text-slate-950">{item.question_text}</p>
              <details className="group mt-3" open={item.position === 1}>
                <summary className="cursor-pointer list-none rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 group-open:bg-slate-950 group-open:text-white">
                  Lihat opsi dan pembahasan
                </summary>
                <div className="mt-5">
                  <p className="question-text text-slate-950">{item.question_text}</p>
                  <div className="mt-5 space-y-3">
                    {options
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map((option) => {
                        const selected = selectedOption?.id === option.id;
                        const correct = option.is_correct;

                        return (
                          <div
                            className={`flex items-start gap-4 rounded-3xl border p-4 sm:p-5 ${
                              correct
                                ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                                : selected
                                  ? "border-red-300 bg-red-50 text-red-900"
                                  : "border-slate-200 bg-slate-50 text-slate-700"
                            }`}
                            key={option.id}
                          >
                            <span className={`grid size-11 shrink-0 place-items-center rounded-2xl text-base font-black ${correct ? "bg-emerald-700 text-white" : selected ? "bg-red-500 text-white" : "bg-slate-100 text-slate-700"}`}>
                              {option.label}
                            </span>
                            <span className="option-text pt-2">
                              {option.option_text}
                              {correct ? <span className="ml-2 text-sm font-black">Jawaban terbaik</span> : null}
                              {selected ? <span className="ml-2 text-sm font-black">Jawaban Anda</span> : null}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-black text-slate-900">Pembahasan</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{item.explanation}</p>
                  </div>
                </div>
              </details>
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

function parseOptions(options: SessionQuestion["options"]): Exclude<SessionQuestion["options"], string> {
  if (typeof options === "string") {
    return JSON.parse(options) as Exclude<SessionQuestion["options"], string>;
  }

  return options;
}
