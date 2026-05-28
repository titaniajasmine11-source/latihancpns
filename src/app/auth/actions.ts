"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?message=${encodeURIComponent("Email atau password tidak valid.")}`);
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function register(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirect(`/register?message=${encodeURIComponent("Registrasi gagal. Periksa email dan password.")}`);
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
