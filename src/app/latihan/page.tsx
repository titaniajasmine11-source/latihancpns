import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpenCheck, CircleAlert, ClipboardCheck, Layers3 } from "lucide-react";
import { startPractice } from "@/app/latihan/actions";
import { createClient } from "@/lib/supabase/server";

type Category = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  topics: {
    id: number;
    name: string;
    slug: string;
    is_active: boolean | null;
  }[];
};

type QuestionStock = {
  topic_id: number;
};

type PracticeSetting = {
  default_question_count?: number;
  allowed_question_counts?: number[];
  low_stock_threshold?: number;
};

export default async function PracticePickerPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [{ data: categories, error: categoriesError }, { data: questionStock }, { data: practiceSetting }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, code, name, description, topics(id, name, slug, is_active)")
      .order("id", { ascending: true })
      .order("name", { referencedTable: "topics", ascending: true }),
    supabase.from("questions").select("topic_id").eq("status", "published"),
    supabase.from("app_settings").select("value").eq("key", "practice").maybeSingle(),
  ]);

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  const stockByTopic = new Map<number, number>();
  ((questionStock ?? []) as QuestionStock[]).forEach((question) => {
    stockByTopic.set(question.topic_id, (stockByTopic.get(question.topic_id) ?? 0) + 1);
  });
  const practiceConfig = practiceSetting?.value as PracticeSetting | null;
  const allowedQuestionCounts = practiceConfig?.allowed_question_counts?.length ? practiceConfig.allowed_question_counts : [5, 10, 20];
  const defaultQuestionCount = practiceConfig?.default_question_count ?? 10;
  const lowStockThreshold = practiceConfig?.low_stock_threshold ?? defaultQuestionCount;

  return (
    <main className="exam-surface min-h-screen px-4 pb-28 pt-6 text-slate-950 sm:px-6 md:pb-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
            <ArrowLeft className="size-4" /> Kembali ke dashboard
          </Link>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Pilih latihan</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                Kategori dan topik CPNS
              </h1>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900 ring-1 ring-emerald-100">
              Soal diacak, jawaban otomatis tersimpan.
            </div>
          </div>
        </header>

        {message ? (
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
            {message}
          </div>
        ) : null}

        <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-200">Mode ujian</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">Simulasi CPNS campuran</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Ambil soal published dari TWK, TIU, dan TKP secara acak. Cocok untuk latihan rasa ujian tanpa memilih topik satu per satu.
              </p>
            </div>
            <Link href="/ujian" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-4 font-black text-slate-950 hover:bg-emerald-300 sm:w-auto">
                <ClipboardCheck className="size-5" /> Mulai Simulasi
            </Link>
          </div>
        </section>

        <div className="grid gap-5">
          {((categories ?? []) as Category[]).map((category) => (
            <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm" key={category.id}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white">
                    {category.code}
                  </span>
                  <h2 className="mt-4 text-2xl font-black">{category.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{category.description}</p>
                </div>
                <Layers3 className="mt-2 size-6 shrink-0 text-emerald-700" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {category.topics.filter((topic) => topic.is_active !== false).map((topic) => {
                  const stock = stockByTopic.get(topic.id) ?? 0;
                  const hasStock = stock > 0;
                  const lowStock = hasStock && stock < lowStockThreshold;

                  return (
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md" key={topic.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-black">{topic.name}</h3>
                          <p className="mt-1 text-sm font-semibold text-slate-600">{stock} soal siap latihan</p>
                          {lowStock ? <p className="mt-1 text-xs font-black text-amber-700">Stok rendah</p> : null}
                        </div>
                        {hasStock ? (
                          <BookOpenCheck className="size-5 text-emerald-700" />
                        ) : (
                          <CircleAlert className="size-5 text-amber-600" />
                        )}
                      </div>
                      {hasStock ? (
                        <form action={startPractice} className="mt-4">
                          <input type="hidden" name="topic_id" value={topic.id} />
                          <label className="mb-3 block">
                            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Jumlah soal</span>
                            <select className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" name="question_count" defaultValue={Math.min(stock, defaultQuestionCount)}>
                              {allowedQuestionCounts
                                .filter((count) => count <= stock)
                                .map((count) => (
                                  <option key={count} value={count}>{count} soal</option>
                                ))}
                              {!allowedQuestionCounts.some((count) => count <= stock) ? <option value={stock}>{stock} soal</option> : null}
                            </select>
                          </label>
                          <button className="inline-flex w-full justify-center rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-900/10 hover:bg-emerald-800">
                            Mulai topik ini
                          </button>
                        </form>
                      ) : (
                        <div className="mt-4 inline-flex w-full justify-center rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-500 ring-1 ring-slate-200">
                          Butuh soal
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
