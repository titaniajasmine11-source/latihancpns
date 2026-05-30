import Link from "next/link";
import { ArrowRight, Bot, ClipboardList, FileCheck2, Layers3, Settings, TriangleAlert } from "lucide-react";
import { generateQuestionDrafts } from "@/app/admin/generator/actions";
import { requireAdmin } from "@/lib/admin";

const adminMenus = [
  {
    title: "Kelola Soal",
    description: "Lihat, tambah, dan publish soal TWK, TIU, TKP.",
    href: "/admin/soal",
    icon: ClipboardList,
  },
  {
    title: "Generator AI",
    description: "Buat draft soal Gemini untuk direview sebelum dipublish.",
    href: "/admin/generator",
    icon: Bot,
  },
  {
    title: "Review Draft",
    description: "Approve atau reject draft soal hasil Gemini.",
    href: "/admin/draft",
    icon: FileCheck2,
  },
  {
    title: "Settings",
    description: "Atur skor, stok minimum, dan limit generate.",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default async function AdminPage() {
  const { supabase } = await requireAdmin();

  const [totalQuestions, publishedQuestions, draftAi, categoriesResult, topicsResult, publishedStock, practiceSetting, latestJobs] = await Promise.all([
    supabase.from("questions").select("id", { count: "exact", head: true }),
    supabase.from("questions").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("question_drafts").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("categories").select("id, code, questions(id)"),
    supabase
      .from("topics")
      .select("id, name, is_active, categories(id, code)")
      .eq("is_active", true),
    supabase.from("questions").select("topic_id").eq("status", "published"),
    supabase.from("app_settings").select("value").eq("key", "practice").maybeSingle(),
    supabase
      .from("generation_jobs")
      .select("id, status, requested_count, error_message, created_at, categories(code), topics(name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Total soal", value: totalQuestions.count ?? 0, icon: ClipboardList },
    { label: "Published", value: publishedQuestions.count ?? 0, icon: FileCheck2 },
    { label: "Draft AI", value: draftAi.count ?? 0, icon: Bot },
    { label: "Kategori", value: categoriesResult.data?.length ?? 0, icon: Layers3 },
  ];

  const categoryCounts = (categoriesResult.data ?? []).map((category) => ({
    code: category.code,
    count: Array.isArray(category.questions) ? category.questions.length : 0,
  }));

  const practiceConfig = practiceSetting.data?.value as { low_stock_threshold?: number; default_question_count?: number } | null;
  const lowStockThreshold = practiceConfig?.low_stock_threshold ?? practiceConfig?.default_question_count ?? 10;
  const stockByTopic = new Map<number, number>();

  (publishedStock.data ?? []).forEach((question) => {
    if (question.topic_id) {
      stockByTopic.set(question.topic_id, (stockByTopic.get(question.topic_id) ?? 0) + 1);
    }
  });

  const lowStock = (topicsResult.data ?? [])
    .map((topic) => {
      const category = Array.isArray(topic.categories) ? topic.categories[0] : topic.categories;
      return {
        id: topic.id,
        categoryId: category?.id,
        name: topic.name,
        code: category?.code ?? "CPNS",
        count: stockByTopic.get(topic.id) ?? 0,
      };
    })
    .filter((topic) => topic.count < lowStockThreshold)
    .sort((a, b) => a.count - b.count)
    .slice(0, 6);

  return (
    <main className="app-page min-h-screen px-4 pb-28 pt-6 text-slate-950 sm:px-6 md:pb-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10">
          <Link href="/dashboard" className="text-sm font-bold text-emerald-200">
            Dashboard user
          </Link>
          <h1 className="mt-5 text-4xl font-black tracking-tight">Admin CPNS Practice</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Pantau kualitas bank soal, stok published, draft AI, dan generator sebelum digunakan latihan produksi.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm" key={stat.label}>
                <Icon className="mb-5 size-7 text-emerald-700" />
                <p className="text-3xl font-black">{stat.value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">{stat.label}</p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Soal per kategori</h2>
            <div className="mt-4 grid gap-3">
              {categoryCounts.map((item) => (
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3" key={item.code}>
                  <span className="font-black">{item.code}</span>
                  <span className="font-black text-emerald-700">{item.count}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <TriangleAlert className="size-5 text-amber-600" />
              <h2 className="text-xl font-black">Stok rendah</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {lowStock.length ? lowStock.map((topic) => (
                <div className="rounded-2xl bg-amber-50 px-4 py-3" key={topic.id}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold">{topic.code} - {topic.name}</span>
                    <span className="font-black text-amber-800">{topic.count}</span>
                  </div>
                  {topic.categoryId ? (
                    <form action={generateQuestionDrafts} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input type="hidden" name="category_id" value={topic.categoryId} />
                      <input type="hidden" name="topic_id" value={topic.id} />
                      <input type="hidden" name="difficulty" value="sedang" />
                      <input type="hidden" name="requested_count" value="3" />
                      <Link href="/admin/generator" className="inline-flex justify-center rounded-2xl bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                        Atur manual
                      </Link>
                      <button className="rounded-2xl bg-emerald-700 px-3 py-2 text-xs font-black text-white hover:bg-emerald-800">
                        Generate 3 draft
                      </button>
                    </form>
                  ) : null}
                </div>
              )) : <p className="text-sm font-semibold text-slate-600">Tidak ada topik di bawah ambang stok {lowStockThreshold} soal.</p>}
            </div>
          </article>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Job generator terakhir</h2>
          <div className="mt-4 grid gap-3">
            {(latestJobs.data ?? []).map((job) => {
              const category = Array.isArray(job.categories) ? job.categories[0] : job.categories;
              const topic = Array.isArray(job.topics) ? job.topics[0] : job.topics;
              return (
                <article className="rounded-3xl bg-slate-50 p-4" key={job.id}>
                  <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
                    <span className="rounded-full bg-slate-950 px-2 py-1 text-white">{job.status}</span>
                    <span className="rounded-full bg-white px-2 py-1 text-slate-700 ring-1 ring-slate-200">{category?.code}</span>
                    <span className="rounded-full bg-white px-2 py-1 text-slate-700 ring-1 ring-slate-200">{topic?.name}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">{job.requested_count} soal diminta</p>
                  {job.error_message ? <p className="mt-2 text-sm font-bold text-red-700">{job.error_message}</p> : null}
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {adminMenus.map((menu) => {
            const Icon = menu.icon;
            return (
              <Link className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg" href={menu.href} key={menu.href}>
                <Icon className="mb-5 size-7 text-emerald-700" />
                <h2 className="text-xl font-black">{menu.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{menu.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-700">
                  Buka <ArrowRight className="size-4" />
                </span>
              </Link>
            );
          })}
        </section>
      </section>
    </main>
  );
}
