import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpenCheck, Clock3, LogOut, Target } from "lucide-react";
import { logout } from "@/app/auth/actions";
import { MotionArticle, MotionDiv, MotionSection } from "@/components/motion-primitives";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = user.user_metadata.full_name ?? user.email;
  const [sessionsResult, scoresResult, topicsResult] = await Promise.all([
    supabase
      .from("practice_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "finished"),
    supabase.from("score_results").select("total_score").eq("user_id", user.id),
    supabase.from("topics").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const scores = scoresResult.data ?? [];
  const averageScore = scores.length
    ? Math.round(scores.reduce((total, score) => total + (score.total_score ?? 0), 0) / scores.length)
    : null;
  const quickStats = [
    { label: "Sesi selesai", value: String(sessionsResult.count ?? 0), icon: Clock3 },
    { label: "Skor rata-rata", value: averageScore === null ? "-" : String(averageScore), icon: Target },
    { label: "Topik aktif", value: String(topicsResult.count ?? 0), icon: BookOpenCheck },
  ];

  return (
    <main className="min-h-screen aurora-bg px-4 pb-28 pt-6 text-slate-950 sm:px-6 md:pb-6 lg:px-8">
      <MotionSection className="mx-auto flex w-full max-w-6xl flex-col gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <header className="glass-panel flex items-center justify-between rounded-[2rem] p-4">
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

        <MotionDiv className="dark-glass rounded-[2.4rem] p-6 text-white" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="text-sm font-semibold text-emerald-200">Ujian berikutnya</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
            Mulai simulasi CAT CPNS atau latihan per topik.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            Simulasi ujian memakai timer, palet nomor soal, auto-submit, skor otomatis,
            pembahasan, dan status kelulusan berdasarkan ambang TWK, TIU, dan TKP.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/ujian" className="inline-flex justify-center rounded-2xl bg-emerald-500 px-5 py-4 font-black text-slate-950">
              Mulai Simulasi CAT
            </Link>
            <Link href="/latihan" className="inline-flex justify-center rounded-2xl bg-emerald-500 px-5 py-4 font-black text-slate-950">
              Latihan Topik
            </Link>
            <Link href="/riwayat" className="inline-flex justify-center rounded-2xl border border-white/20 px-5 py-4 font-black text-white hover:bg-white/10">
              Lihat Riwayat
            </Link>
          </div>
        </MotionDiv>

        <section className="grid gap-4 sm:grid-cols-3">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <MotionArticle whileHover={{ y: -6 }} className="glass-panel rounded-3xl p-5" key={stat.label}>
                <Icon className="mb-5 size-6 text-emerald-700" />
                <p className="text-3xl font-black">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
              </MotionArticle>
            );
          })}
        </section>
      </MotionSection>
    </main>
  );
}
