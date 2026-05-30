"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const defaultExamCategoryTargets = new Map([
  ["TWK", 5],
  ["TIU", 5],
  ["TKP", 5],
]);

type ExamQuestion = {
  id: number;
  category_id: number;
  categories: { code: string } | { code: string }[] | null;
};

type PracticeConfig = {
  exam_category_targets?: Record<string, number>;
  exam_duration_minutes?: number;
};

type PracticeSession = {
  id: string;
  category_id: number | null;
  topic_id: number | null;
  total_questions: number;
  status: string;
  mode: string;
  expires_at: string | null;
};

function shuffle<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = crypto.getRandomValues(new Uint32Array(1))[0] % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

async function finalizeSession({
  supabase,
  session,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  session: PracticeSession;
}) {
  const { error } = await supabase.rpc("finish_session", { p_session_id: session.id });

  if (error) {
    return { ok: false, message: error.message || "Gagal menyelesaikan sesi" };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "Sesi selesai" };
}

export async function startPractice(formData: FormData) {
  const topicId = Number(formData.get("topic_id"));
  const questionCount = Number(formData.get("question_count") ?? 10);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select("id, category_id")
    .eq("id", topicId)
    .single();

  if (topicError || !topic) {
    redirect("/latihan?message=Topik tidak ditemukan");
  }

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id")
    .eq("topic_id", topicId)
    .eq("status", "published");

  if (questionsError || !questions?.length) {
    redirect("/latihan?message=Belum ada soal published untuk topik ini");
  }

  const selectedQuestions = shuffle(questions).slice(0, questionCount);

  const { data: sessionId, error: sessionError } = await supabase.rpc("create_practice_session", {
    p_category_id: topic.category_id,
    p_topic_id: topic.id,
    p_mode: "practice",
    p_question_ids: selectedQuestions.map((question) => question.id),
    p_duration_seconds: null,
    p_expires_at: null,
  });

  if (sessionError || !sessionId) {
    redirect("/latihan?message=Gagal membuat sesi latihan");
  }

  redirect(`/latihan/${sessionId}`);
}

export async function startExam() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [{ data: questions, error: questionsError }, { data: practiceSetting }] = await Promise.all([
    supabase
      .from("questions")
      .select("id, category_id, categories(code)")
      .eq("status", "published"),
    supabase.from("app_settings").select("value").eq("key", "practice").maybeSingle(),
  ]);

  if (questionsError || !questions?.length) {
    redirect("/latihan?message=Belum ada soal published untuk simulasi ujian");
  }

  const practiceConfig = practiceSetting?.value as PracticeConfig | null;
  const targetEntries = Object.entries(practiceConfig?.exam_category_targets ?? Object.fromEntries(defaultExamCategoryTargets));
  const durationMinutes = practiceConfig?.exam_duration_minutes ?? 100;
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
  const selectedQuestions: ExamQuestion[] = [];

  for (const [categoryCode, target] of targetEntries) {
    const categoryQuestions = ((questions ?? []) as ExamQuestion[]).filter((question) => {
      const category = Array.isArray(question.categories) ? question.categories[0] : question.categories;
      return category?.code === categoryCode;
    });

    if (categoryQuestions.length < target) {
      redirect(`/latihan?message=${encodeURIComponent(`Stok soal ${categoryCode} belum cukup (${categoryQuestions.length}/${target})`)}`);
    }

    selectedQuestions.push(...shuffle(categoryQuestions).slice(0, target));
  }

  if (selectedQuestions.length !== targetEntries.reduce((total, [, target]) => total + target, 0)) {
    redirect("/latihan?message=Stok soal simulasi belum cukup. Tambahkan soal TWK, TIU, dan TKP terlebih dahulu");
  }

  const shuffledQuestions = shuffle(selectedQuestions);
  const { data: sessionId, error: sessionError } = await supabase.rpc("create_practice_session", {
    p_category_id: null,
    p_topic_id: null,
    p_mode: "exam",
    p_question_ids: shuffledQuestions.map((question) => question.id),
    p_duration_seconds: durationMinutes * 60,
    p_expires_at: expiresAt.toISOString(),
  });

  if (sessionError || !sessionId) {
    redirect("/latihan?message=Gagal membuat simulasi ujian");
  }

  redirect(`/latihan/${sessionId}`);
}

export async function saveAnswer(formData: FormData) {
  const sessionId = String(formData.get("session_id") ?? "");
  const questionId = Number(formData.get("question_id"));
  const selectedOptionId = Number(formData.get("selected_option_id"));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { error } = await supabase.rpc("save_session_answer", {
    p_session_id: sessionId,
    p_question_id: questionId,
    p_selected_option_id: selectedOptionId,
  });

  if (error) {
    redirect(`/latihan/${sessionId}?message=${encodeURIComponent(error.message || "Gagal menyimpan jawaban")}`);
  }

  revalidatePath(`/latihan/${sessionId}`);
}

export async function finishPractice(formData: FormData) {
  const sessionId = String(formData.get("session_id") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .select("id, category_id, topic_id, total_questions, status, mode, expires_at")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    redirect("/dashboard");
  }

  if (session.status === "finished") {
    redirect(`/hasil/${sessionId}`);
  }

  const now = new Date();
  const expired = session.mode === "exam" && session.expires_at && new Date(session.expires_at) <= now;
  const result = await finalizeSession({ supabase, session: session as PracticeSession });

  if (!result.ok && !expired) {
    redirect(`/latihan/${sessionId}?message=${encodeURIComponent(result.message)}`);
  }

  redirect(`/hasil/${sessionId}`);
}

export async function finishExpiredSession(sessionId: string, userId: string) {
  const supabase = await createClient();
  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .select("id, category_id, topic_id, total_questions, status, mode, expires_at")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (sessionError || !session || session.status !== "ongoing" || session.mode !== "exam") {
    return false;
  }

  if (!session.expires_at || new Date(session.expires_at) > new Date()) {
    return false;
  }

  const result = await finalizeSession({ supabase, session: session as PracticeSession });
  return result.ok;
}
