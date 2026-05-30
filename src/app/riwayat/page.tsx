import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, ClipboardList, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type PracticeSession = {
  id: string;
  total_questions: number;
  total_score: number;
  finished_at: string | null;
  categories:
    | {
        code: string;
        name: string;
      }
    | {
        code: string;
        name: string;
      }[]
    | null;
  topics:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: sessions, error } = await supabase
    .from("practice_sessions")
    .select("id, total_questions, total_score, finished_at, categories(code, name), topics(name)")
    .eq("user_id", user.id)
    .eq("status", "finished")
    .order("finished_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="app-page min-h-screen px-4 pb-28 pt-6 text-slate-950 sm:px-6 md:pb-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
            <ArrowLeft className="size-4" /> Kembali ke dashboard
          </Link>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Riwayat latihan</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                Progres sesi CPNS Anda
              </h1>
            </div>
            <div className="hidden rounded-3xl bg-slate-950 p-4 text-white sm:block">
              <ClipboardList className="size-7" />
            </div>
          </div>
        </header>

        {sessions?.length ? (
          <div className="grid gap-4">
            {(sessions as PracticeSession[]).map((session) => {
              const category = Array.isArray(session.categories) ? session.categories[0] : session.categories;
              const topic = Array.isArray(session.topics) ? session.topics[0] : session.topics;
              const finishedAt = session.finished_at
                ? new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(session.finished_at))
                : "Belum tercatat";

              return (
                <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm" key={session.id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="inline-flex rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white">
                        {category?.code ?? "CPNS"}
                      </span>
                      <h2 className="mt-4 text-xl font-black">{topic?.name ?? category?.name ?? "Latihan CPNS"}</h2>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="size-4" /> {finishedAt}
                        </span>
                        <span>{session.total_questions} soal</span>
                      </div>
                    </div>
                    <div className="rounded-3xl bg-emerald-50 p-4 text-emerald-900 sm:text-right">
                      <div className="flex items-center gap-2 sm:justify-end">
                        <Trophy className="size-5" />
                        <span className="text-sm font-bold">Skor</span>
                      </div>
                      <p className="mt-1 text-3xl font-black">{session.total_score}</p>
                    </div>
                  </div>
                  <Link
                    href={`/hasil/${session.id}`}
                    className="mt-5 inline-flex w-full justify-center rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white hover:bg-emerald-800 sm:w-auto"
                  >
                    Lihat pembahasan
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto grid size-14 place-items-center rounded-3xl bg-emerald-50 text-emerald-700">
              <ClipboardList className="size-7" />
            </div>
            <h2 className="mt-5 text-2xl font-black">Belum ada riwayat latihan</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Mulai sesi pertama Anda. Setelah submit, skor dan pembahasan akan tersimpan di sini.
            </p>
            <Link href="/latihan" className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-4 font-black text-white hover:bg-emerald-800">
              Mulai Latihan
            </Link>
          </section>
        )}
      </section>
    </main>
  );
}
