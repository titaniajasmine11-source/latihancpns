"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

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
