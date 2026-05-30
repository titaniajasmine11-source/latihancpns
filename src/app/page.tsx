import { ArrowRight, BookOpenCheck, Brain, CheckCircle2, Clock3, ShieldCheck, Trophy } from "lucide-react";
import { startGuestExam, startGuestPractice } from "@/app/auth/actions";

export default async function Home({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;

  return (
    <main className="page-shell min-h-screen px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <nav className="nav-pill flex items-center justify-between rounded-[1.5rem] p-3">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-white">
              <BookOpenCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-black">CPNS Practice</p>
              <p className="text-xs font-bold text-slate-500">Tryout SKD modern</p>
            </div>
          </div>
          <form action={startGuestExam}>
            <button className="primary-action rounded-2xl px-4 py-3 text-sm font-black transition">
              Mulai
            </button>
          </form>
        </nav>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="ink-card relative overflow-hidden rounded-[2.5rem] p-6 text-white sm:p-8 lg:min-h-[620px]">
            <div className="absolute -right-20 top-10 size-72 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="relative">
            <p className="inline-flex rounded-full bg-amber-300 px-3 py-1 text-sm font-black text-slate-950">
              Latihan CPNS siap pakai
            </p>
            <h1 className="mt-7 max-w-4xl text-5xl font-black tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              Tryout SKD yang terasa seperti hari ujian.
            </h1>
            <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-slate-300 sm:text-lg">
              Mulai dari latihan cepat, lanjut simulasi CAT, lihat skor, cek pembahasan, lalu ulangi bagian terlemah.
            </p>
            {message ? (
              <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                {message}
              </div>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <form action={startGuestExam}>
                <button className="primary-action inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-black transition sm:w-auto">
                  Mulai Ujian Sekarang <ArrowRight className="size-4" />
                </button>
              </form>
              <form action={startGuestPractice}>
                <button className="inline-flex w-full justify-center rounded-2xl border border-white/15 px-5 py-4 font-black text-white transition hover:bg-white/10 sm:w-auto">
                  Pilih latihan topik
                </button>
              </form>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Timer", "Autosave", "Pembahasan"].map((item) => <div className="rounded-2xl bg-white/8 p-4 text-sm font-black" key={item}><CheckCircle2 className="mb-2 size-4 text-amber-300" />{item}</div>)}
            </div>
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
                <article className="paper-card rounded-[2rem] p-5 transition hover:-translate-y-1" key={String(title)}>
                  <TypedIcon className="mb-4 size-7 text-amber-600" />
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
