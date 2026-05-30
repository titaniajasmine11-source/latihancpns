import Link from "next/link";
import { ArrowLeft, Bot, CheckCircle2, XCircle } from "lucide-react";
import { publishDraft, rejectDraft } from "@/app/admin/draft/actions";
import type { GeneratedQuestion } from "@/lib/gemini/questions";
import { requireAdmin } from "@/lib/admin";

type Draft = {
  id: number;
  question_json: GeneratedQuestion;
  status: string;
  quality_score: number | null;
  ai_model: string | null;
  created_at: string;
  categories: { code: string } | { code: string }[] | null;
  topics: { name: string } | { name: string }[] | null;
};

export default async function AdminDraftPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: drafts } = await supabase
    .from("question_drafts")
    .select("id, question_json, status, quality_score, ai_model, created_at, categories(code), topics(name)")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <main className="app-page min-h-screen px-4 pb-28 pt-6 text-slate-950 sm:px-6 md:pb-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
            <ArrowLeft className="size-4" /> Admin
          </Link>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Review AI</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight">Draft soal Gemini</h1>
            </div>
            <div className="grid size-12 place-items-center rounded-3xl bg-slate-950 text-white">
              <Bot className="size-6" />
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Publish hanya draft yang sudah masuk akal. TWK sebaiknya dicek fakta dan regulasinya sebelum digunakan.
          </p>
        </header>

        {message ? (
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
            {message}
          </div>
        ) : null}

        {drafts?.length ? (
          <div className="grid gap-4">
            {(drafts as Draft[]).map((draft) => {
              const category = Array.isArray(draft.categories) ? draft.categories[0] : draft.categories;
              const topic = Array.isArray(draft.topics) ? draft.topics[0] : draft.topics;
              const question = draft.question_json;

              return (
                <article className="app-card rounded-[2rem] p-5" key={draft.id}>
                  <div className="mb-4 flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
                    <span className="rounded-full bg-slate-950 px-2 py-1 text-white">{category?.code}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{topic?.name}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-800">{draft.status}</span>
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-900">{draft.ai_model}</span>
                  </div>
                  <h2 className="text-xl font-black leading-8 tracking-[-0.01em]">{question.question_text}</h2>
                  <div className="mt-4 grid gap-2">
                    {question.options.map((option) => (
                      <div className={`flex items-start gap-3 rounded-3xl border p-4 ${option.is_correct ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white"}`} key={option.label}>
                        <span className={`grid size-10 shrink-0 place-items-center rounded-2xl text-sm font-black ${option.is_correct ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}>
                          {option.label}
                        </span>
                        <span className="pt-1 text-sm font-bold leading-6">{option.text} <span className="text-xs font-black text-slate-500">Skor {option.score}</span></span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-black">Pembahasan</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{question.explanation}</p>
                  </div>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <form action={publishDraft}>
                      <input type="hidden" name="draft_id" value={draft.id} />
                      <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white hover:bg-emerald-800 sm:w-auto">
                        <CheckCircle2 className="size-4" /> Publish
                      </button>
                    </form>
                    <form action={rejectDraft}>
                      <input type="hidden" name="draft_id" value={draft.id} />
                      <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-red-700 ring-1 ring-red-200 hover:ring-red-400 sm:w-auto">
                        <XCircle className="size-4" /> Reject
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <Bot className="mx-auto size-10 text-emerald-700" />
            <h2 className="mt-4 text-2xl font-black">Belum ada draft AI</h2>
            <p className="mt-2 text-sm text-slate-600">Jalankan generator untuk membuat draft soal baru.</p>
            <Link href="/admin/generator" className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-4 font-black text-white hover:bg-emerald-800">
              Buka generator
            </Link>
          </section>
        )}
      </section>
    </main>
  );
}
