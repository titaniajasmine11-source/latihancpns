"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

const optionLabels = ["A", "B", "C", "D", "E"] as const;
const reviewStatuses = new Set(["draft", "approved", "published", "rejected", "archived"]);
const importStatuses = new Set(["draft", "approved"]);
const difficulties = new Set(["mudah", "sedang", "sulit"]);

type ImportQuestion = {
  category_code: string;
  topic_slug: string;
  difficulty?: string;
  status?: string;
  question_text: string;
  explanation: string;
  options: {
    label: string;
    text: string;
    score: number;
    is_correct?: boolean;
  }[];
};

export async function createManualQuestion(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const categoryId = Number(formData.get("category_id"));
  const topicId = Number(formData.get("topic_id"));
  const difficulty = String(formData.get("difficulty") ?? "sedang");
  const status = String(formData.get("status") ?? "draft");
  const questionText = String(formData.get("question_text") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();
  const answerLabel = String(formData.get("answer_label") ?? "A");

  if (!categoryId || !topicId || !questionText || !explanation || !reviewStatuses.has(status) || !difficulties.has(difficulty)) {
    redirect("/admin/soal?message=Lengkapi kategori, topik, soal, dan pembahasan");
  }

  const { data: category } = await supabase
    .from("categories")
    .select("code")
    .eq("id", categoryId)
    .single();

  const isTkp = category?.code === "TKP";
  const options = optionLabels.map((label) => {
    const optionText = String(formData.get(`option_${label.toLowerCase()}`) ?? "").trim();
    const tkpScore = Number(formData.get(`score_${label.toLowerCase()}`) ?? 0);

    return {
      label,
      option_text: optionText,
      is_correct: label === answerLabel,
      score: isTkp ? tkpScore : label === answerLabel ? 5 : 0,
    };
  });

  if (!optionLabels.includes(answerLabel as (typeof optionLabels)[number]) || options.some((option) => !option.option_text)) {
    redirect("/admin/soal?message=Semua opsi A sampai E wajib diisi");
  }

  if (isTkp && options.some((option) => option.score < 1 || option.score > 5)) {
    redirect("/admin/soal?message=Skor TKP harus bernilai 1 sampai 5");
  }

  if (isTkp && !options.some((option) => option.score === 5)) {
    redirect("/admin/soal?message=Soal TKP wajib punya minimal satu opsi skor 5");
  }

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

  const { error: optionsError } = await supabase.from("question_options").insert(
    options.map((option) => ({ ...option, question_id: question.id })),
  );

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

  if (!questionId || !categoryId || !topicId || !questionText || !explanation || !reviewStatuses.has(status) || !difficulties.has(difficulty)) {
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

  if (!optionLabels.includes(answerLabel as (typeof optionLabels)[number])) {
    redirect(`/admin/soal/${questionId}?message=Jawaban benar tidak valid`);
  }

  if (isTkp) {
    const hasBestScore = optionLabels.some((label) => Number(formData.get(`score_${label.toLowerCase()}`) ?? 0) === 5);

    if (!hasBestScore) {
      redirect(`/admin/soal/${questionId}?message=Soal TKP wajib punya minimal satu opsi skor 5`);
    }
  }

  for (const label of optionLabels) {
    const optionId = Number(formData.get(`option_id_${label.toLowerCase()}`));
    const optionText = String(formData.get(`option_${label.toLowerCase()}`) ?? "").trim();
    const tkpScore = Number(formData.get(`score_${label.toLowerCase()}`) ?? 0);

    if (!optionId || !optionText) {
      redirect(`/admin/soal/${questionId}?message=Semua opsi wajib diisi`);
    }

    if (isTkp && (tkpScore < 1 || tkpScore > 5)) {
      redirect(`/admin/soal/${questionId}?message=Skor TKP harus bernilai 1 sampai 5`);
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

export async function importQuestions(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const rawJson = String(formData.get("questions_json") ?? "").trim();

  if (!rawJson) {
    redirect("/admin/soal?message=JSON import wajib diisi");
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawJson);
  } catch {
    redirect("/admin/soal?message=Format JSON import tidak valid");
  }

  const questions = Array.isArray(payload) ? payload as ImportQuestion[] : (payload as { questions?: ImportQuestion[] }).questions;

  if (!Array.isArray(questions) || questions.length === 0 || questions.length > 100) {
    redirect("/admin/soal?message=Import harus berisi 1 sampai 100 soal");
  }

  const [{ data: categories }, { data: topics }, { data: existingQuestions }] = await Promise.all([
    supabase.from("categories").select("id, code"),
    supabase.from("topics").select("id, slug, category_id, categories(code)"),
    supabase.from("questions").select("question_text"),
  ]);
  const categoryByCode = new Map((categories ?? []).map((category) => [category.code, category]));
  const topicByKey = new Map((topics ?? []).map((topic) => {
    const category = Array.isArray(topic.categories) ? topic.categories[0] : topic.categories;
    return [`${category?.code}:${topic.slug}`, topic];
  }));
  const existingTexts = new Set((existingQuestions ?? []).map((question) => question.question_text.trim().toLowerCase()));
  let imported = 0;

  for (const [index, item] of questions.entries()) {
    const category = categoryByCode.get(item.category_code);
    const topic = topicByKey.get(`${item.category_code}:${item.topic_slug}`);
    const difficulty = item.difficulty ?? "sedang";
    const status = item.status ?? "draft";
    const textKey = item.question_text?.trim().toLowerCase();

    if (!category || !topic || !textKey || !item.explanation?.trim() || !difficulties.has(difficulty) || !importStatuses.has(status)) {
      redirect(`/admin/soal?message=Data import soal ke-${index + 1} tidak valid`);
    }

    if (existingTexts.has(textKey)) {
      continue;
    }

    if (!Array.isArray(item.options) || item.options.length !== 5) {
      redirect(`/admin/soal?message=Opsi soal ke-${index + 1} harus lengkap A-E`);
    }

    const labels = item.options.map((option) => option.label).sort().join("");
    if (labels !== optionLabels.join("")) {
      redirect(`/admin/soal?message=Label opsi soal ke-${index + 1} harus A-E`);
    }

    const isTkp = item.category_code === "TKP";
    const correctCount = item.options.filter((option) => option.is_correct).length;
    if (!isTkp && correctCount !== 1) {
      redirect(`/admin/soal?message=TWK/TIU soal ke-${index + 1} harus punya satu jawaban benar`);
    }

    if (!isTkp && item.options.some((option) => option.score !== (option.is_correct ? 5 : 0))) {
      redirect(`/admin/soal?message=Skor TWK/TIU soal ke-${index + 1} harus 5 untuk benar dan 0 untuk salah`);
    }

    if (isTkp && item.options.some((option) => option.score < 1 || option.score > 5)) {
      redirect(`/admin/soal?message=Skor TKP soal ke-${index + 1} harus 1 sampai 5`);
    }

    if (isTkp && !item.options.some((option) => option.score === 5)) {
      redirect(`/admin/soal?message=TKP soal ke-${index + 1} wajib punya minimal satu opsi skor 5`);
    }

    const now = new Date().toISOString();
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .insert({
        category_id: category.id,
        topic_id: topic.id,
        question_text: item.question_text.trim(),
        explanation: item.explanation.trim(),
        difficulty,
        status,
        source_type: "manual_import",
        generated_by_ai: false,
        created_by: user.id,
        reviewed_by: status === "published" ? user.id : null,
        reviewed_at: status === "published" ? now : null,
        published_at: status === "published" ? now : null,
      })
      .select("id")
      .single();

    if (questionError || !question) {
      redirect(`/admin/soal?message=Gagal import soal ke-${index + 1}`);
    }

    const { error: optionsError } = await supabase.from("question_options").insert(
      item.options.map((option) => ({
        question_id: question.id,
        label: option.label,
        option_text: option.text.trim(),
        score: option.score,
        is_correct: isTkp ? option.score === 5 : option.is_correct === true,
      })),
    );

    if (optionsError) {
      redirect(`/admin/soal?message=Opsi soal ke-${index + 1} gagal disimpan`);
    }

    existingTexts.add(textKey);
    imported += 1;
  }

  redirect(`/admin/soal?message=${encodeURIComponent(`${imported} soal berhasil diimport`)}`);
}
