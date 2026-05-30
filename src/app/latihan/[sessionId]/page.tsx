import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { finishExpiredSession } from "@/app/latihan/actions";
import { ExamClient } from "@/app/latihan/[sessionId]/exam-client";
import { createClient } from "@/lib/supabase/server";

type SessionQuestion = {
  position: number;
  question_id: number;
  question_text: string;
  options:
    | {
      id: number;
      label: string;
      option_text: string;
    }[]
    | string;
};

type SafeOption = {
  id: number;
  label: string;
  option_text: string;
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
    redirect("/");
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

  if (session.mode === "exam" && session.expires_at && new Date(session.expires_at) <= new Date()) {
    const finished = await finishExpiredSession(sessionId, user.id);

    if (finished) {
      redirect(`/hasil/${sessionId}`);
    }
  }

  const [{ data: sessionQuestions }, { data: answers }] = await Promise.all([
    supabase.rpc("get_session_questions_safe", { p_session_id: sessionId }),
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

  const category = Array.isArray(session.categories) ? session.categories[0] : session.categories;
  const topic = Array.isArray(session.topics) ? session.topics[0] : session.topics;

  const examQuestions = ((sessionQuestions ?? []) as SessionQuestion[]).map((item) => ({
    position: item.position,
    question: {
      id: item.question_id,
      question_text: item.question_text,
      question_options: parseOptions(item.options),
    },
  }));
  const initialAnswers = Object.fromEntries(answerByQuestion.entries());

  return (
    <main className="exam-surface min-h-screen px-4 pb-28 pt-6 text-slate-950 sm:px-6 md:pb-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <Link href="/latihan" className="inline-flex w-fit items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm hover:border-blue-500 hover:bg-blue-50">
          <ArrowLeft className="size-4" /> {category?.code && topic?.name ? `${category.code} - ${topic.name}` : "Keluar ke latihan"}
        </Link>
        <ExamClient
          categoryName={category?.name ?? category?.code ?? "CPNS / CASN"}
          expiresAt={session.expires_at}
          initialAnswers={initialAnswers}
          mode={session.mode === "exam" ? "exam" : "practice"}
          questions={examQuestions}
          sessionId={sessionId}
          topicName={topic?.name}
        />
      </section>
    </main>
  );
}

function parseOptions(options: SessionQuestion["options"]): SafeOption[] {
  if (typeof options === "string") {
    return JSON.parse(options) as SafeOption[];
  }

  return options;
}
