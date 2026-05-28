"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  await supabase
    .from("practice_sessions")
    .update({ status: "finished", total_score: totalScore, finished_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  await supabase.from("score_results").insert({
    session_id: sessionId,
    user_id: user.id,
    category_id: session.category_id,
    topic_id: session.topic_id,
    total_questions: session.total_questions,
    answered_questions: answeredQuestions,
    correct_count: correctCount,
    wrong_count: Math.max(answeredQuestions - correctCount, 0),
    total_score: totalScore,
  });

  revalidatePath("/dashboard");
  redirect(`/hasil/${sessionId}`);
}
