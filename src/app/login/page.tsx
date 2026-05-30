import Link from "next/link";
import { ArrowRight, BookOpenCheck, CheckCircle2, Clock3, LockKeyhole, ShieldCheck, Trophy } from "lucide-react";
import { login, loginWithGoogle } from "@/app/auth/actions";

const loginHighlights = [
  { Icon: Clock3, label: "Timer CAT" },
  { Icon: Trophy, label: "Skor otomatis" },
  { Icon: ShieldCheck, label: "Data privat" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="app-page min-h-screen overflow-hidden px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <aside className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/25 sm:p-8 lg:min-h-[680px]">
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-28 left-10 size-80 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <nav className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-emerald-400 text-slate-950">
                  <BookOpenCheck className="size-6" />
                </span>
                <span>
                  <span className="block text-sm font-black">CPNS Practice</span>
                  <span className="block text-xs font-bold text-slate-400">TWK, TIU, TKP</span>
                </span>
              </Link>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-emerald-200">
                Secure login
              </span>
            </nav>

            <div>
              <p className="inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-black text-emerald-200 ring-1 ring-emerald-300/20">
                Akun belajar CPNS
              </p>
              <h1 className="mobile-title mt-6 max-w-xl">
                Masuk cepat, lanjut latihan tanpa kehilangan progres.
              </h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-300">
                Semua sesi ujian, jawaban tersimpan, skor, pembahasan, dan riwayat latihan berada dalam satu dashboard.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {loginHighlights.map(({ Icon, label }) => (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4" key={label}>
                    <Icon className="mb-3 size-5 text-emerald-300" />
                    <p className="text-sm font-black">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 size-5 shrink-0 text-emerald-300" />
                <p className="text-sm font-semibold leading-6 text-slate-300">
                  Gunakan Google untuk akses paling cepat. Email/password tetap tersedia untuk admin dan akun manual.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="rounded-[2.5rem] border border-white/70 bg-white/85 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur sm:p-8">
          <div className="mb-7">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700 ring-1 ring-emerald-100">
              <LockKeyhole className="size-4" /> Login area
            </Link>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Masuk akun</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
              Pilih Google untuk masuk instan, atau gunakan email/password yang sudah terdaftar.
            </p>
          </div>

          {message ? (
            <div className="mb-5 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800" role="alert">
              {message}
            </div>
          ) : null}

          <form action={loginWithGoogle}>
            <button className="group mb-5 flex w-full items-center justify-center gap-3 rounded-3xl bg-slate-950 px-5 py-4 font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800" type="submit">
              <span className="grid size-7 place-items-center rounded-full bg-white text-sm font-black text-slate-950" aria-hidden="true">G</span>
              Masuk dengan Google
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> atau email <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form action={login} className="space-y-4">
            <label className="block" htmlFor="email">
              <span className="text-sm font-bold text-slate-800">Email</span>
              <input
                className="app-input mt-2 w-full rounded-2xl px-4 py-4"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </label>
            <label className="block" htmlFor="password">
              <span className="text-sm font-bold text-slate-800">Password</span>
              <input
                className="app-input mt-2 w-full rounded-2xl px-4 py-4"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
            <button className="w-full rounded-3xl bg-emerald-600 px-5 py-4 font-black text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-700" type="submit">
              Masuk
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-slate-600">
            Belum punya akun?{" "}
            <Link className="font-bold text-emerald-700" href="/register">
              Daftar sekarang
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}
