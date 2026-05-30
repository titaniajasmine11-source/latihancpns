import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { updateQuestion } from "@/app/admin/soal/actions";
import { requireAdmin } from "@/lib/admin";

type Category = {
  id: number;
  code: string;
  name: string;
  topics: { id: number; name: string; slug: string }[];
};

type Question = {
  id: number;
  category_id: number;
  topic_id: number;
  question_text: string;
  explanation: string | null;
  difficulty: string;
  status: string;
  question_options: {
    id: number;
    label: string;
    option_text: string;
    is_correct: boolean;
    score: number;
  }[];
};

const labels = ["A", "B", "C", "D", "E"];

export default async function AdminQuestionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{ message?: string }>;
}) {
  const { questionId } = await params;
  const { message } = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: categories }, { data: question }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, code, name, topics(id, name, slug)")
      .order("id", { ascending: true })
      .order("name", { referencedTable: "topics", ascending: true }),
    supabase
      .from("questions")
      .select("id, category_id, topic_id, question_text, explanation, difficulty, status, question_options(id, label, option_text, is_correct, score)")
      .eq("id", Number(questionId))
      .single(),
  ]);

  if (!question) {
    notFound();
  }

  const typedQuestion = question as Question;
  const answerLabel = typedQuestion.question_options.find((option) => option.is_correct)?.label ?? "A";
  const optionByLabel = new Map(typedQuestion.question_options.map((option) => [option.label, option]));

  return (
    <main className="app-page min-h-screen px-4 pb-28 pt-6 text-slate-950 sm:px-6 md:pb-6 lg:px-8">
      <section className="mx-auto w-full max-w-4xl space-y-5">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <Link href="/admin/soal" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
            <ArrowLeft className="size-4" /> Daftar soal
          </Link>
          <h1 className="mt-5 text-3xl font-black tracking-tight">Edit soal #{typedQuestion.id}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Review konten, opsi, skor, pembahasan, dan status publish.
          </p>
        </header>

        {message ? (
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            {message}
          </div>
        ) : null}

        <form action={updateQuestion} className="app-card space-y-4 rounded-[2rem] p-5">
          <input type="hidden" name="question_id" value={typedQuestion.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold">Kategori</span>
              <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name="category_id" defaultValue={typedQuestion.category_id} required>
                {((categories ?? []) as Category[]).map((category) => (
                  <option key={category.id} value={category.id}>{category.code} - {category.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold">Topik</span>
              <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name="topic_id" defaultValue={typedQuestion.topic_id} required>
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
              <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name="difficulty" defaultValue={typedQuestion.difficulty}>
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold">Status</span>
              <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name="status" defaultValue={typedQuestion.status}>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold">Jawaban terbaik</span>
              <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name="answer_label" defaultValue={answerLabel}>
                {labels.map((label) => <option key={label} value={label}>{label}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-bold">Pertanyaan</span>
            <textarea className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3" name="question_text" defaultValue={typedQuestion.question_text} required />
          </label>

          {labels.map((label) => {
            const option = optionByLabel.get(label);
            return (
              <div className="grid gap-3 sm:grid-cols-[1fr_110px]" key={label}>
                <input type="hidden" name={`option_id_${label.toLowerCase()}`} value={option?.id} />
                <label className="block">
                  <span className="text-sm font-bold">Opsi {label}</span>
                  <input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name={`option_${label.toLowerCase()}`} defaultValue={option?.option_text} required />
                </label>
                <label className="block">
                  <span className="text-sm font-bold">Skor TKP</span>
                  <input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" name={`score_${label.toLowerCase()}`} type="number" min="1" max="5" defaultValue={option?.score ?? 0} />
                </label>
              </div>
            );
          })}

          <label className="block">
            <span className="text-sm font-bold">Pembahasan</span>
            <textarea className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3" name="explanation" defaultValue={typedQuestion.explanation ?? ""} required />
          </label>

          <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 font-black text-white hover:bg-emerald-800">
            <Save className="size-4" /> Simpan perubahan
          </button>
        </form>
      </section>
    </main>
  );
}
