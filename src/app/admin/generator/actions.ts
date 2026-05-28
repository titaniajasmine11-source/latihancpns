"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  buildQuestionPrompt,
  generateQuestionsWithGemini,
  parseAndValidateQuestions,
} from "@/lib/gemini/questions";
import { requireAdmin } from "@/lib/admin";

export async function generateQuestionDrafts(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const categoryId = Number(formData.get("category_id"));
  const topicId = Number(formData.get("topic_id"));
  const difficulty = String(formData.get("difficulty") ?? "sedang");
  const requestedCount = Math.min(Number(formData.get("requested_count") ?? 3), 5);

  if (!categoryId || !topicId || requestedCount < 1) {
    redirect("/admin/generator?message=Payload generator tidak valid");
  }

  const [{ data: category }, { data: topic }] = await Promise.all([
    supabase.from("categories").select("id, code, name").eq("id", categoryId).single(),
    supabase.from("topics").select("id, name").eq("id", topicId).single(),
  ]);

  if (!category || !topic) {
    redirect("/admin/generator?message=Kategori atau topik tidak ditemukan");
  }

  const { data: job, error: jobError } = await supabase
    .from("generation_jobs")
    .insert({
      trigger_type: "admin_manual",
      category_id: category.id,
      topic_id: topic.id,
      difficulty,
      requested_count: requestedCount,
      status: "running",
      created_by: user.id,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (jobError || !job) {
    redirect("/admin/generator?message=Gagal membuat generation job");
  }

  const prompt = buildQuestionPrompt({
    category: category.code,
    topic: topic.name,
    difficulty,
    count: requestedCount,
  });

  try {
    const rawJson = await generateQuestionsWithGemini(prompt);
    const questions = parseAndValidateQuestions({
      rawJson,
      category: category.code,
      topic: topic.name,
      difficulty,
    });

    const { data: existingQuestions } = await supabase
      .from("questions")
      .select("question_text")
      .eq("topic_id", topic.id);

    const existingTexts = new Set((existingQuestions ?? []).map((question) => question.question_text.trim().toLowerCase()));
    const uniqueQuestions = questions.filter(
      (question) => !existingTexts.has(question.question_text.trim().toLowerCase()),
    );

    if (!uniqueQuestions.length) {
      throw new Error("Semua soal hasil AI terdeteksi duplikat");
    }

    const { error: draftsError } = await supabase.from("question_drafts").insert(
      uniqueQuestions.map((question) => ({
        generation_job_id: job.id,
        category_id: category.id,
        topic_id: topic.id,
        question_json: question,
        status: "draft",
        quality_score: 80,
        ai_model: "gemini-1.5-flash",
      })),
    );

    if (draftsError) {
      throw new Error(draftsError.message);
    }

    await supabase.from("ai_generation_logs").insert({
      generation_job_id: job.id,
      provider: "gemini",
      model: "gemini-1.5-flash",
      prompt,
      response_preview: rawJson.slice(0, 1000),
      success: true,
    });

    await supabase
      .from("generation_jobs")
      .update({ status: "success", finished_at: new Date().toISOString() })
      .eq("id", job.id);

    revalidatePath("/admin/generator");
    revalidatePath("/admin/draft");
    redirect(`/admin/generator?message=${encodeURIComponent(`${uniqueQuestions.length} draft soal berhasil dibuat`)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generator gagal";

    await supabase.from("ai_generation_logs").insert({
      generation_job_id: job.id,
      provider: "gemini",
      model: "gemini-1.5-flash",
      prompt,
      success: false,
      error_message: message,
    });

    await supabase
      .from("generation_jobs")
      .update({ status: "failed", error_message: message, finished_at: new Date().toISOString() })
      .eq("id", job.id);

    redirect(`/admin/generator?message=${encodeURIComponent(message)}`);
  }
}
