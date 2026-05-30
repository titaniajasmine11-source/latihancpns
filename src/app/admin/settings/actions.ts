"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

const allowedSettingKeys = new Set(["practice", "scoring"]);

type PracticeSetting = {
  default_question_count?: unknown;
  allowed_question_counts?: unknown;
  exam_category_targets?: unknown;
  exam_duration_minutes?: unknown;
  low_stock_threshold?: unknown;
};

type ScoringSetting = Record<string, { passing_grade?: unknown }>;

function validateSetting(key: string, value: unknown) {
  if (!allowedSettingKeys.has(key)) {
    return "Key settings tidak dikenal";
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "Value settings harus berupa object JSON";
  }

  if (key === "practice") {
    const practice = value as PracticeSetting;

    if (practice.default_question_count !== undefined && !isPositiveInteger(practice.default_question_count)) {
      return "default_question_count harus angka bulat positif";
    }

    if (practice.allowed_question_counts !== undefined) {
      if (!Array.isArray(practice.allowed_question_counts) || !practice.allowed_question_counts.every(isPositiveInteger)) {
        return "allowed_question_counts harus array angka bulat positif";
      }
    }

    if (practice.exam_duration_minutes !== undefined && !isPositiveInteger(practice.exam_duration_minutes)) {
      return "exam_duration_minutes harus angka bulat positif";
    }

    if (practice.low_stock_threshold !== undefined && !isPositiveInteger(practice.low_stock_threshold)) {
      return "low_stock_threshold harus angka bulat positif";
    }

    if (practice.exam_category_targets !== undefined) {
      if (!practice.exam_category_targets || typeof practice.exam_category_targets !== "object" || Array.isArray(practice.exam_category_targets)) {
        return "exam_category_targets harus object kategori";
      }

      const targets = practice.exam_category_targets as Record<string, unknown>;
      const invalidTarget = Object.entries(targets).some(([code, count]) => !["TWK", "TIU", "TKP"].includes(code) || !isPositiveInteger(count));

      if (invalidTarget) {
        return "exam_category_targets hanya boleh berisi TWK/TIU/TKP dengan angka bulat positif";
      }
    }
  }

  if (key === "scoring") {
    const scoring = value as ScoringSetting;
    const invalidScoring = Object.entries(scoring).some(([code, config]) => {
      return !["TWK", "TIU", "TKP"].includes(code)
        || !config
        || typeof config !== "object"
        || !isPositiveInteger(config.passing_grade);
    });

    if (invalidScoring) {
      return "scoring hanya boleh berisi TWK/TIU/TKP dengan passing_grade angka bulat positif";
    }
  }

  return null;
}

function isPositiveInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export async function updateAppSetting(formData: FormData) {
  const { supabase } = await requireAdmin();
  const key = String(formData.get("key") ?? "").trim();
  const rawValue = String(formData.get("value") ?? "").trim();

  if (!key || !rawValue) {
    redirect("/admin/settings?message=Key dan value wajib diisi");
  }

  let value: unknown;

  try {
    value = JSON.parse(rawValue);
  } catch {
    redirect("/admin/settings?message=Format JSON tidak valid");
  }

  const validationMessage = validateSetting(key, value);

  if (validationMessage) {
    redirect(`/admin/settings?message=${encodeURIComponent(validationMessage)}`);
  }

  const { error } = await supabase.from("app_settings").upsert(
    {
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) {
    redirect(`/admin/settings?message=${encodeURIComponent("Gagal menyimpan settings")}`);
  }

  revalidatePath("/admin/settings");
  revalidatePath("/latihan");
  redirect("/admin/settings?message=Settings berhasil disimpan");
}
