"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

const optionLabels = ["A", "B", "C", "D", "E"] as const;
const reviewStatuses = new Set(["draft", "approved", "published", "rejected", "archived"]);

export async function createManualQuestion(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const categoryId = Number(formData.get("category_id"));
  const topicId = Number(formData.get("topic_id"));
  const difficulty = String(formData.get("difficulty") ?? "sedang");
  const status = String(formData.get("status") ?? "draft");
  const questionText = String(formData.get("question_text") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();
  const answerLabel = String(formData.get("answer_label") ?? "A");

  if (!categoryId || !topicId || !questionText || !explanation) {
    redirect("/admin/soal?message=Lengkapi kategori, topik, soal, dan pembahasan");
  }

  const { data: category } = await supabase
    .from("categories")
    .select("code")
    .eq("id", categoryId)
    .single();

  const { data: question, error: questionError } = await supabase
    .from("questions")
    .insert({
      category_id: categoryId,
      topic_id: topicId,
      difficulty,
      status,
      question_text: questionText,
      explanation,
      source_type: "manual",
      generated_by_ai: false,
      created_by: user.id,
      reviewed_by: status === "published" ? user.id : null,
      reviewed_at: status === "published" ? new Date().toISOString() : null,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (questionError || !question) {
    redirect("/admin/soal?message=Gagal menyimpan soal");
  }

  const options = optionLabels.map((label) => {
    const optionText = String(formData.get(`option_${label.toLowerCase()}`) ?? "").trim();
    const tkpScore = Number(formData.get(`score_${label.toLowerCase()}`) ?? 0);
    const isTkp = category?.code === "TKP";

    return {
      question_id: question.id,
      label,
      option_text: optionText,
      is_correct: isTkp ? label === answerLabel : label === answerLabel,
      score: isTkp ? tkpScore : label === answerLabel ? 5 : 0,
    };
  });

  if (options.some((option) => !option.option_text)) {
    redirect("/admin/soal?message=Semua opsi A sampai E wajib diisi");
  }

  const { error: optionsError } = await supabase.from("question_options").insert(options);

  if (optionsError) {
    redirect("/admin/soal?message=Soal tersimpan tapi opsi gagal dibuat");
  }

  revalidatePath("/admin/soal");
  revalidatePath("/latihan");
  redirect("/admin/soal?message=Soal berhasil ditambahkan");
}

export async function updateQuestionStatus(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const questionId = Number(formData.get("question_id"));
  const status = String(formData.get("status") ?? "draft");

  if (!questionId || !reviewStatuses.has(status)) {
    redirect("/admin/soal?message=Status soal tidak valid");
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("questions")
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: now,
      published_at: status === "published" ? now : null,
    })
    .eq("id", questionId);

  if (error) {
    redirect("/admin/soal?message=Gagal mengubah status soal");
  }

  revalidatePath("/admin/soal");
  revalidatePath(`/admin/soal/${questionId}`);
  revalidatePath("/latihan");
}

export async function updateQuestion(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const questionId = Number(formData.get("question_id"));
  const categoryId = Number(formData.get("category_id"));
  const topicId = Number(formData.get("topic_id"));
  const difficulty = String(formData.get("difficulty") ?? "sedang");
  const status = String(formData.get("status") ?? "draft");
  const questionText = String(formData.get("question_text") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();
  const answerLabel = String(formData.get("answer_label") ?? "A");

  if (!questionId || !categoryId || !topicId || !questionText || !explanation || !reviewStatuses.has(status)) {
    redirect(`/admin/soal/${questionId}?message=Data soal belum lengkap`);
  }

  const { data: category } = await supabase
    .from("categories")
    .select("code")
    .eq("id", categoryId)
    .single();

  const now = new Date().toISOString();
  const { error: questionError } = await supabase
    .from("questions")
    .update({
      category_id: categoryId,
      topic_id: topicId,
      difficulty,
      status,
      question_text: questionText,
      explanation,
      reviewed_by: user.id,
      reviewed_at: now,
      published_at: status === "published" ? now : null,
    })
    .eq("id", questionId);

  if (questionError) {
    redirect(`/admin/soal/${questionId}?message=Gagal memperbarui soal`);
  }

  const isTkp = category?.code === "TKP";

  for (const label of optionLabels) {
    const optionId = Number(formData.get(`option_id_${label.toLowerCase()}`));
    const optionText = String(formData.get(`option_${label.toLowerCase()}`) ?? "").trim();
    const tkpScore = Number(formData.get(`score_${label.toLowerCase()}`) ?? 0);

    if (!optionId || !optionText) {
      redirect(`/admin/soal/${questionId}?message=Semua opsi wajib diisi`);
    }

    const { error: optionError } = await supabase
      .from("question_options")
      .update({
        option_text: optionText,
        is_correct: label === answerLabel,
        score: isTkp ? tkpScore : label === answerLabel ? 5 : 0,
      })
      .eq("id", optionId)
      .eq("question_id", questionId);

    if (optionError) {
      redirect(`/admin/soal/${questionId}?message=Gagal memperbarui opsi ${label}`);
    }
  }

  revalidatePath("/admin/soal");
  revalidatePath(`/admin/soal/${questionId}`);
  revalidatePath("/latihan");
  redirect(`/admin/soal/${questionId}?message=Soal berhasil diperbarui`);
}
