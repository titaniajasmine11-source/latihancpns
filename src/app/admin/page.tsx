import Link from "next/link";
import { ArrowRight, Bot, ClipboardList, FileCheck2, Settings } from "lucide-react";
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
  await requireAdmin();

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-4 pb-28 pt-6 text-slate-950 sm:px-6 md:pb-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10">
          <Link href="/dashboard" className="text-sm font-bold text-emerald-200">
            Dashboard user
          </Link>
          <h1 className="mt-5 text-4xl font-black tracking-tight">Admin CPNS Practice</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Panel awal untuk menjaga kualitas bank soal sebelum fitur generator AI dipakai penuh.
          </p>
        </header>

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
