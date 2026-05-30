import Link from "next/link";
import { BookOpenCheck, UserPlus } from "lucide-react";
import { loginWithGoogle, register } from "@/app/auth/actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="page-shell grid min-h-screen place-items-center px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] lg:grid-cols-[0.9fr_1fr]">
        <div className="ink-card hidden p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="grid size-14 place-items-center rounded-3xl bg-amber-400 text-slate-950">
            <BookOpenCheck className="size-7" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">Akun latihan</p>
            <h2 className="mobile-title mt-4">Mulai catat skor dari sesi pertama.</h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-slate-300">Satu akun untuk latihan topik, simulasi ujian, riwayat, dan pembahasan.</p>
          </div>
        </div>
        <div className="paper-card rounded-[2.5rem] p-6 sm:p-8 lg:rounded-l-none">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-2 text-sm font-black text-slate-900 ring-1 ring-amber-200">
            <UserPlus className="size-4" /> CPNS Practice Web
          </Link>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Buat akun</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Akun digunakan untuk menyimpan sesi latihan, skor, dan riwayat pembahasan.
          </p>
        </div>

        {message ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {message}
          </div>
        ) : null}

        <form action={loginWithGoogle}>
          <button className="primary-action mb-4 flex w-full items-center justify-center gap-3 rounded-3xl px-5 py-4 font-black transition" type="submit">
            <span className="grid size-6 place-items-center rounded-full bg-slate-950 text-xs font-black text-white" aria-hidden="true">G</span>
            Daftar dengan Google
          </button>
        </form>

        <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-slate-400">
          <span className="h-px flex-1 bg-slate-200" /> atau email <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form action={register} className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-800">Nama lengkap</span>
            <input
              className="app-input mt-2 w-full rounded-2xl px-4 py-4"
              name="full_name"
              type="text"
              autoComplete="name"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-800">Email</span>
            <input
              className="app-input mt-2 w-full rounded-2xl px-4 py-4"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-800">Password</span>
            <input
              className="app-input mt-2 w-full rounded-2xl px-4 py-4"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>
          <button className="w-full rounded-3xl bg-slate-950 px-5 py-4 font-black text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800">
            Daftar
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Sudah punya akun?{" "}
          <Link className="font-bold text-amber-700" href="/login">
            Masuk
          </Link>
        </p>
        </div>
      </section>
    </main>
  );
}
