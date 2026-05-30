"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseAndValidateQuestions, type GeneratedQuestion } from "@/lib/gemini/questions";
import { requireAdmin } from "@/lib/admin";

export async function publishDraft(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const draftId = Number(formData.get("draft_id"));

  if (!draftId) {
    redirect("/admin/draft?message=Draft tidak valid");
  }

  const { data: draft, error: draftError } = await supabase
    .from("question_drafts")
    .select("id, category_id, topic_id, question_json, status, ai_model")
    .eq("id", draftId)
    .single();

  if (draftError || !draft) {
    redirect("/admin/draft?message=Draft tidak ditemukan");
  }

  if (draft.status === "published") {
    redirect("/admin/draft?message=Draft sudah dipublish");
  }

  const questionJson = draft.question_json as GeneratedQuestion;
  const now = new Date().toISOString();

  try {
    parseAndValidateQuestions({
      rawJson: JSON.stringify({ questions: [questionJson] }),
      category: questionJson.category,
      topic: questionJson.topic,
      difficulty: questionJson.difficulty,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Format draft tidak valid";
    redirect(`/admin/draft?message=${encodeURIComponent(message)}`);
  }

  const { data: existing } = await supabase
    .from("questions")
    .select("id")
    .eq("question_text", questionJson.question_text)
    .maybeSingle();

  if (existing) {
    redirect("/admin/draft?message=Soal duplikat sudah ada di bank soal");
  }

  const { data: question, error: questionError } = await supabase
    .from("questions")
    .insert({
      category_id: draft.category_id,
      topic_id: draft.topic_id,
      question_text: questionJson.question_text,
      explanation: questionJson.explanation,
      difficulty: questionJson.difficulty,
      status: "published",
      source_type: "ai_generated",
      generated_by_ai: true,
      ai_model: draft.ai_model,
      created_by: user.id,
      reviewed_by: user.id,
      reviewed_at: now,
      published_at: now,
    })
    .select("id")
    .single();

  if (questionError || !question) {
    redirect("/admin/draft?message=Gagal membuat soal dari draft");
  }

  const { error: optionsError } = await supabase.from("question_options").insert(
    questionJson.options.map((option) => ({
      question_id: question.id,
      label: option.label,
      option_text: option.text,
      is_correct: option.is_correct,
      score: option.score,
    })),
  );

  if (optionsError) {
    redirect("/admin/draft?message=Soal dibuat tapi opsi gagal disimpan");
  }

  await supabase
    .from("question_drafts")
    .update({ status: "published", reviewed_at: now })
    .eq("id", draft.id);

  revalidatePath("/admin/draft");
  revalidatePath("/admin/soal");
  revalidatePath("/latihan");
  redirect("/admin/draft?message=Draft berhasil dipublish ke bank soal");
}

export async function rejectDraft(formData: FormData) {
  const { supabase } = await requireAdmin();
  const draftId = Number(formData.get("draft_id"));

  if (!draftId) {
    redirect("/admin/draft?message=Draft tidak valid");
  }

  const { error } = await supabase
    .from("question_drafts")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", draftId);

  if (error) {
    redirect("/admin/draft?message=Gagal reject draft");
  }

  revalidatePath("/admin/draft");
}
