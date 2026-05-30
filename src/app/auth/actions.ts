"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function ensureGuestSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      redirect(`/?message=${encodeURIComponent("Gagal memulai sesi tamu. Aktifkan anonymous sign-in di Supabase Auth.")}`);
    }
  }

  revalidatePath("/dashboard", "layout");
}

export async function startGuestExam() {
  await ensureGuestSession();
  redirect("/ujian");
}

export async function startGuestPractice() {
  await ensureGuestSession();
  redirect("/latihan");
}

export async function login(formData: FormData) {
  const rawEmail = String(formData.get("email") ?? "").trim();
  const email = rawEmail === "admin" ? "admin@latihancpns.local" : rawEmail;
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

  const { data, error } = await supabase.auth.signUp({
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

  if (!data.session) {
    redirect(`/login?message=${encodeURIComponent("Registrasi berhasil. Cek email untuk konfirmasi akun sebelum login.")}`);
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function loginWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect(`/login?message=${encodeURIComponent("Login Google gagal dimulai.")}`);
  }

  redirect(data.url);
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
