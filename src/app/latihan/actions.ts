"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const examCategoryTargets = new Map([
  ["TWK", 5],
  ["TIU", 5],
  ["TKP", 5],
]);

type ExamQuestion = {
  id: number;
  category_id: number;
  categories: { code: string } | { code: string }[] | null;
};

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function startPractice(formData: FormData) {
  const topicId = Number(formData.get("topic_id"));
  const questionCount = Number(formData.get("question_count") ?? 10);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
    .eq("status", "published")
    .limit(questionCount);

  if (questionsError || !questions?.length) {
    redirect("/latihan?message=Belum ada soal published untuk topik ini");
  }

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: user.id,
      category_id: topic.category_id,
      topic_id: topic.id,
      total_questions: questions.length,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    redirect("/latihan?message=Gagal membuat sesi latihan");
  }

  const sessionQuestions = questions.map((question, index) => ({
    session_id: session.id,
    question_id: question.id,
    position: index + 1,
  }));

  const { error: sessionQuestionsError } = await supabase
    .from("session_questions")
    .insert(sessionQuestions);

  if (sessionQuestionsError) {
    redirect("/latihan?message=Gagal menyiapkan soal latihan");
  }

  redirect(`/latihan/${session.id}`);
}

export async function startExam() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id, category_id, categories(code)")
    .eq("status", "published");

  if (questionsError || !questions?.length) {
    redirect("/latihan?message=Belum ada soal published untuk simulasi ujian");
  }

  const selectedQuestions: ExamQuestion[] = [];

  for (const [categoryCode, target] of examCategoryTargets) {
    const categoryQuestions = ((questions ?? []) as ExamQuestion[]).filter((question) => {
      const category = Array.isArray(question.categories) ? question.categories[0] : question.categories;
      return category?.code === categoryCode;
    });

    selectedQuestions.push(...shuffle(categoryQuestions).slice(0, target));
  }

  if (selectedQuestions.length < 3) {
    redirect("/latihan?message=Stok soal simulasi belum cukup. Tambahkan soal TWK, TIU, dan TKP terlebih dahulu");
  }

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: user.id,
      category_id: null,
      topic_id: null,
      total_questions: selectedQuestions.length,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    redirect("/latihan?message=Gagal membuat simulasi ujian");
  }

  const sessionQuestions = shuffle(selectedQuestions).map((question, index) => ({
    session_id: session.id,
    question_id: question.id,
    position: index + 1,
  }));

  const { error: sessionQuestionsError } = await supabase
    .from("session_questions")
    .insert(sessionQuestions);

  if (sessionQuestionsError) {
    redirect("/latihan?message=Gagal menyiapkan simulasi ujian");
  }

  redirect(`/latihan/${session.id}`);
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
    redirect("/login");
  }

  const { data: sessionQuestion } = await supabase
    .from("session_questions")
    .select("id, practice_sessions!inner(id, status)")
    .eq("session_id", sessionId)
    .eq("question_id", questionId)
    .eq("practice_sessions.user_id", user.id)
    .eq("practice_sessions.status", "ongoing")
    .maybeSingle();

  if (!sessionQuestion) {
    redirect(`/latihan/${sessionId}?message=Sesi atau soal tidak valid`);
  }

  const { data: option, error: optionError } = await supabase
    .from("question_options")
    .select("id, score")
    .eq("id", selectedOptionId)
    .eq("question_id", questionId)
    .single();

  if (optionError || !option) {
    redirect(`/latihan/${sessionId}?message=Pilihan jawaban tidak valid`);
  }

  const { error } = await supabase.from("user_answers").upsert(
    {
      session_id: sessionId,
      user_id: user.id,
      question_id: questionId,
      selected_option_id: option.id,
      score: option.score,
      answered_at: new Date().toISOString(),
    },
    { onConflict: "session_id,question_id" },
  );

  if (error) {
    redirect(`/latihan/${sessionId}?message=Gagal menyimpan jawaban`);
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
    redirect("/login");
  }

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .select("id, category_id, topic_id, total_questions, status")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    redirect("/dashboard");
  }

  if (session.status === "finished") {
    redirect(`/hasil/${sessionId}`);
  }

  const { data: answers, error: answersError } = await supabase
    .from("user_answers")
    .select("score, question_options(is_correct)")
    .eq("session_id", sessionId)
    .eq("user_id", user.id);

  if (answersError) {
    redirect(`/latihan/${sessionId}?message=Gagal menghitung skor`);
  }

  const totalScore = (answers ?? []).reduce((total, answer) => total + (answer.score ?? 0), 0);
  const correctCount = (answers ?? []).filter((answer) => {
    const option = Array.isArray(answer.question_options)
      ? answer.question_options[0]
      : answer.question_options;
    return option?.is_correct === true;
  }).length;
  const answeredQuestions = answers?.length ?? 0;

  const { error: sessionUpdateError } = await supabase
    .from("practice_sessions")
    .update({ status: "finished", total_score: totalScore, finished_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .eq("status", "ongoing");

  if (sessionUpdateError) {
    redirect(`/latihan/${sessionId}?message=Gagal menyelesaikan sesi`);
  }

  const { error: scoreError } = await supabase.from("score_results").upsert(
    {
      session_id: sessionId,
      user_id: user.id,
      category_id: session.category_id,
      topic_id: session.topic_id,
      total_questions: session.total_questions,
      answered_questions: answeredQuestions,
      correct_count: correctCount,
      wrong_count: Math.max(answeredQuestions - correctCount, 0),
      total_score: totalScore,
    },
    { onConflict: "session_id" },
  );

  if (scoreError) {
    redirect(`/latihan/${sessionId}?message=Gagal menyimpan skor`);
  }

  revalidatePath("/dashboard");
  redirect(`/hasil/${sessionId}`);
}
