import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpenCheck, Clock3, LogOut, Settings, Target, TrendingDown } from "lucide-react";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const fullName = user.user_metadata.full_name ?? user.email ?? "Pejuang CPNS";
  const [sessionsResult, scoresResult, topicsResult, profileResult, categoryScoresResult] = await Promise.all([
    supabase
      .from("practice_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "finished"),
    supabase.from("score_results").select("total_score").eq("user_id", user.id),
    supabase.from("topics").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabase
      .from("score_results")
      .select("total_score, answered_questions, categories(code, name)")
      .eq("user_id", user.id)
      .not("category_id", "is", null),
  ]);
  const isAdmin = profileResult.data?.role === "admin";

  const scores = scoresResult.data ?? [];
  const averageScore = scores.length
    ? Math.round(scores.reduce((total, score) => total + (score.total_score ?? 0), 0) / scores.length)
    : null;
  const quickStats = [
    { label: "Sesi selesai", value: String(sessionsResult.count ?? 0), icon: Clock3 },
    { label: "Skor rata-rata", value: averageScore === null ? "-" : String(averageScore), icon: Target },
    { label: "Topik aktif", value: String(topicsResult.count ?? 0), icon: BookOpenCheck },
  ];
  const categoryPerformance = new Map<string, { name: string; score: number; answered: number; sessions: number }>();

  (categoryScoresResult.data ?? []).forEach((result) => {
    const category = Array.isArray(result.categories) ? result.categories[0] : result.categories;
    const code = category?.code ?? "CPNS";
    const current = categoryPerformance.get(code) ?? { name: category?.name ?? code, score: 0, answered: 0, sessions: 0 };

    categoryPerformance.set(code, {
      name: current.name,
      score: current.score + (result.total_score ?? 0),
      answered: current.answered + (result.answered_questions ?? 0),
      sessions: current.sessions + 1,
    });
  });
  const weakestCategories = Array.from(categoryPerformance.entries())
    .map(([code, item]) => ({
      code,
      ...item,
      averagePerQuestion: item.answered ? item.score / item.answered : 0,
    }))
    .sort((a, b) => a.averagePerQuestion - b.averagePerQuestion)
    .slice(0, 3);

  return (
    <main className="page-shell min-h-screen px-4 pb-28 pt-6 text-slate-950 sm:px-6 md:pb-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="nav-pill flex items-center justify-between rounded-[1.5rem] p-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Dashboard</p>
            <h1 className="mt-1 text-xl font-black sm:text-2xl">Halo, {fullName}</h1>
          </div>
          <form action={logout}>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold hover:border-slate-400">
              <LogOut className="size-4" /> Keluar
            </button>
          </form>
        </header>

        <div className="ink-card rounded-[2.4rem] p-6 text-white">
          <p className="text-sm font-semibold text-amber-200">Ujian berikutnya</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
            Mulai simulasi CAT CPNS atau latihan per topik.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            Simulasi ujian memakai timer, palet nomor soal, auto-submit, skor otomatis,
            pembahasan, dan status kelulusan berdasarkan ambang TWK, TIU, dan TKP.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/ujian" className="primary-action inline-flex justify-center rounded-2xl px-5 py-4 font-black">
              Mulai Simulasi CAT
            </Link>
            <Link href="/latihan" className="inline-flex justify-center rounded-2xl bg-white px-5 py-4 font-black text-slate-950">
              Latihan Topik
            </Link>
            <Link href="/riwayat" className="inline-flex justify-center rounded-2xl border border-white/20 px-5 py-4 font-black text-white hover:bg-white/10">
              Lihat Riwayat
            </Link>
            {isAdmin ? (
              <Link href="/admin" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300/40 px-5 py-4 font-black text-emerald-100 hover:bg-white/10">
                <Settings className="size-4" /> Admin
              </Link>
            ) : null}
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article className="paper-card rounded-3xl p-5" key={stat.label}>
                <Icon className="mb-5 size-6 text-amber-600" />
                <p className="text-3xl font-black">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
              </article>
            );
          })}
        </section>

        <section className="paper-card rounded-[2rem] p-5">
          <div className="flex items-center gap-2">
            <TrendingDown className="size-5 text-amber-600" />
            <h2 className="text-xl font-black">Fokus belajar</h2>
          </div>
          {weakestCategories.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {weakestCategories.map((item) => (
                <article className="rounded-3xl bg-white/70 p-4 ring-1 ring-slate-200" key={item.code}>
                  <span className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white">{item.code}</span>
                  <h3 className="mt-4 font-black">{item.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    Rata-rata {item.averagePerQuestion.toFixed(1)} poin/soal dari {item.sessions} sesi.
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm font-semibold text-slate-600">
              Selesaikan beberapa latihan per topik untuk melihat kategori yang perlu diprioritaskan.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}
