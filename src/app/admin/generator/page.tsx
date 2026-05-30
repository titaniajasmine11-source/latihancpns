import Link from "next/link";
import { ArrowLeft, Bot, Clock3 } from "lucide-react";
import { generateQuestionDrafts } from "@/app/admin/generator/actions";
import { requireAdmin } from "@/lib/admin";

type Category = {
  id: number;
  code: string;
  name: string;
  topics: { id: number; name: string; slug: string }[];
};

type GenerationJob = {
  id: string;
  status: string;
  trigger_type: string;
  requested_count: number;
  difficulty: string | null;
  error_message: string | null;
  created_at: string;
  categories: { code: string } | { code: string }[] | null;
  topics: { name: string } | { name: string }[] | null;
};

export default async function AdminGeneratorPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: categories }, { data: jobs }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, code, name, topics(id, name, slug)")
      .order("id", { ascending: true })
      .order("name", { referencedTable: "topics", ascending: true }),
    supabase
      .from("generation_jobs")
      .select("id, status, trigger_type, requested_count, difficulty, error_message, created_at, categories(code), topics(name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <main className="app-page min-h-screen px-4 pb-28 pt-6 text-slate-950 sm:px-6 md:pb-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <header className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
              <ArrowLeft className="size-4" /> Admin
            </Link>
            <h1 className="mt-5 text-3xl font-black tracking-tight">Generator Gemini</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Buat draft soal AI dalam batch kecil. Draft tetap perlu direview sebelum dipublish.
            </p>
          </header>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Bot className="size-5 text-emerald-700" />
              <h2 className="text-xl font-black">Generate draft soal</h2>
            </div>
            {message ? (
              <div className="mb-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
                {message}
              </div>
            ) : null}
            <form action={generateQuestionDrafts} className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold">Kategori</span>
                <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name="category_id" required>
                  {((categories ?? []) as Category[]).map((category) => (
                    <option key={category.id} value={category.id}>{category.code} - {category.name}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold">Topik</span>
                <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name="topic_id" required>
                  {((categories ?? []) as Category[]).flatMap((category) =>
                    category.topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>{category.code} - {topic.name}</option>
                    )),
                  )}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold">Difficulty</span>
                  <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name="difficulty" defaultValue="sedang">
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold">Jumlah</span>
                  <input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name="requested_count" type="number" min="1" max="5" defaultValue="3" />
                </label>
              </div>
              <button className="w-full rounded-2xl bg-emerald-700 px-5 py-4 font-black text-white hover:bg-emerald-800">
                Generate ke draft
              </button>
            </form>
          </section>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Clock3 className="size-5 text-emerald-700" />
            <h2 className="text-xl font-black">Job terbaru</h2>
          </div>
          <div className="space-y-3">
            {((jobs ?? []) as GenerationJob[]).map((job) => {
              const category = Array.isArray(job.categories) ? job.categories[0] : job.categories;
              const topic = Array.isArray(job.topics) ? job.topics[0] : job.topics;

              return (
                <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4" key={job.id}>
                  <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
                    <span className="rounded-full bg-slate-950 px-2 py-1 text-white">{job.status}</span>
                    <span className="rounded-full bg-white px-2 py-1 text-slate-700 ring-1 ring-slate-200">{category?.code}</span>
                    <span className="rounded-full bg-white px-2 py-1 text-slate-700 ring-1 ring-slate-200">{topic?.name}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    {job.requested_count} soal - {job.difficulty} - {job.trigger_type}
                  </p>
                  {job.error_message ? (
                    <p className="mt-2 text-sm font-semibold text-red-700">{job.error_message}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
