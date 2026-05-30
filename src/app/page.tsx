import { ArrowRight, BookOpenCheck, Brain, Clock3, ShieldCheck, Trophy } from "lucide-react";
import { startGuestExam, startGuestPractice } from "@/app/auth/actions";

export default async function Home({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;

  return (
    <main className="app-page min-h-screen px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <nav className="flex items-center justify-between rounded-[2rem] border border-white/70 bg-white/75 p-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-white">
              <BookOpenCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-black">CPNS Practice</p>
              <p className="text-xs font-bold text-slate-500">TWK, TIU, TKP</p>
            </div>
          </div>
          <form action={startGuestExam}>
            <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">
              Mulai
            </button>
          </form>
        </nav>

        <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="rounded-[2.5rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20 sm:p-8">
            <p className="inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-black text-emerald-200 ring-1 ring-emerald-300/20">
              Latihan CPNS mobile-first
            </p>
            <h1 className="mobile-title mt-6 max-w-3xl">
              Belajar CPNS tanpa ribet, langsung ujian.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-300 sm:text-lg">
              Klik mulai, langsung masuk simulasi CPNS. Tanpa daftar akun, tanpa login, tetap ada skor dan pembahasan setelah selesai.
            </p>
            {message ? (
              <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                {message}
              </div>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <form action={startGuestExam}>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-4 font-black text-slate-950 hover:bg-emerald-300 sm:w-auto">
                  Mulai Ujian Sekarang <ArrowRight className="size-4" />
                </button>
              </form>
              <form action={startGuestPractice}>
                <button className="inline-flex w-full justify-center rounded-2xl border border-white/15 px-5 py-4 font-black text-white hover:bg-white/10 sm:w-auto">
                  Pilih latihan topik
                </button>
              </form>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[
              [Clock3, "Simulasi CAT", "Timer, auto-submit, dan navigasi nomor soal."],
              [Trophy, "Skor otomatis", "Pembahasan muncul setelah sesi selesai."],
              [Brain, "Bank soal AI", "Draft Gemini direview admin sebelum publish."],
              [ShieldCheck, "RLS aman", "Data sesi dan jawaban dikunci per user."],
            ].map(([Icon, title, desc]) => {
              const TypedIcon = Icon as typeof Clock3;
              return (
                <article className="app-card rounded-[2rem] p-5" key={String(title)}>
                  <TypedIcon className="mb-4 size-7 text-emerald-700" />
                  <h2 className="text-lg font-bold">{String(title)}</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{String(desc)}</p>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
