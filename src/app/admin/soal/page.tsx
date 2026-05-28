import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { createManualQuestion, updateQuestionStatus } from "@/app/admin/soal/actions";
import { requireAdmin } from "@/lib/admin";

type Category = {
  id: number;
  code: string;
  name: string;
  topics: { id: number; name: string; slug: string }[];
};

type Question = {
  id: number;
  question_text: string;
  difficulty: string;
  status: string;
  source_type: string;
  created_at: string;
  categories: { code: string } | { code: string }[] | null;
  topics: { name: string } | { name: string }[] | null;
};

export default async function AdminQuestionsPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: categories }, { data: questions }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, code, name, topics(id, name, slug)")
      .order("id", { ascending: true })
      .order("name", { referencedTable: "topics", ascending: true }),
    supabase
      .from("questions")
      .select("id, question_text, difficulty, status, source_type, created_at, categories(code), topics(name)")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <header className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
              <ArrowLeft className="size-4" /> Admin
            </Link>
            <h1 className="mt-5 text-3xl font-black tracking-tight">Kelola soal</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tambah soal manual sebagai bank awal. Soal AI nanti masuk draft untuk direview.
            </p>
          </header>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <PlusCircle className="size-5 text-emerald-700" />
              <h2 className="text-xl font-black">Tambah soal manual</h2>
            </div>
            {message ? (
              <div className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
                {message}
              </div>
            ) : null}
            <form action={createManualQuestion} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
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
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-bold">Difficulty</span>
                  <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name="difficulty" defaultValue="sedang">
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold">Status</span>
                  <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name="status" defaultValue="draft">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold">Jawaban terbaik</span>
                  <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name="answer_label" defaultValue="A">
                    {['A', 'B', 'C', 'D', 'E'].map((label) => <option key={label} value={label}>{label}</option>)}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-bold">Pertanyaan</span>
                <textarea className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3" name="question_text" required />
              </label>
              {['a', 'b', 'c', 'd', 'e'].map((label, index) => (
                <div className="grid gap-3 sm:grid-cols-[1fr_110px]" key={label}>
                  <label className="block">
                    <span className="text-sm font-bold">Opsi {label.toUpperCase()}</span>
                    <input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name={`option_${label}`} required />
                  </label>
                  <label className="block">
                    <span className="text-sm font-bold">Skor TKP</span>
                    <input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name={`score_${label}`} type="number" min="1" max="5" defaultValue={5 - index} />
                  </label>
                </div>
              ))}
              <label className="block">
                <span className="text-sm font-bold">Pembahasan</span>
                <textarea className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3" name="explanation" required />
              </label>
              <button className="w-full rounded-2xl bg-emerald-700 px-5 py-4 font-black text-white hover:bg-emerald-800">
                Simpan soal
              </button>
            </form>
          </section>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Daftar soal terbaru</h2>
          <div className="mt-5 space-y-3">
            {((questions ?? []) as Question[]).map((question) => {
              const category = Array.isArray(question.categories) ? question.categories[0] : question.categories;
              const topic = Array.isArray(question.topics) ? question.topics[0] : question.topics;

              return (
                <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4" key={question.id}>
                  <div className="mb-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
                    <span className="rounded-full bg-slate-950 px-2 py-1 text-white">{category?.code}</span>
                    <span className="rounded-full bg-white px-2 py-1 text-slate-700 ring-1 ring-slate-200">{topic?.name}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-800">{question.status}</span>
                  </div>
                  <p className="line-clamp-3 font-bold leading-6">{question.question_text}</p>
                  <p className="mt-2 text-sm text-slate-600">{question.difficulty} - {question.source_type}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white" href={`/admin/soal/${question.id}`}>
                      Edit
                    </Link>
                    {[
                      ["published", "Publish"],
                      ["draft", "Draft"],
                      ["rejected", "Reject"],
                      ["archived", "Archive"],
                    ].map(([status, label]) => (
                      <form action={updateQuestionStatus} key={status}>
                        <input type="hidden" name="question_id" value={question.id} />
                        <input type="hidden" name="status" value={status} />
                        <button className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:ring-slate-400">
                          {label}
                        </button>
                      </form>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
