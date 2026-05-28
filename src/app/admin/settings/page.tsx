import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { updateAppSetting } from "@/app/admin/settings/actions";
import { requireAdmin } from "@/lib/admin";

type AppSetting = {
  key: string;
  value: unknown;
  updated_at: string | null;
};

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: settings, error } = await supabase
    .from("app_settings")
    .select("key, value, updated_at")
    .order("key", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-4 pb-28 pt-6 text-slate-950 sm:px-6 md:pb-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
            <ArrowLeft className="size-4" /> Admin
          </Link>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Konfigurasi</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Settings aplikasi</h1>
            </div>
            <div className="grid size-12 place-items-center rounded-3xl bg-slate-950 text-white">
              <Settings className="size-6" />
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Atur skor, passing grade, jumlah soal, dan limit generator tanpa mengubah kode.
          </p>
        </header>

        {message ? (
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            {message}
          </div>
        ) : null}

        {(settings as AppSetting[] | null)?.length ? (
          <div className="grid gap-4">
            {(settings as AppSetting[]).map((setting) => (
              <form action={updateAppSetting} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm" key={setting.key}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-black">{setting.key}</h2>
                  <span className="text-xs font-bold text-slate-500">
                    {setting.updated_at ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(setting.updated_at)) : "Belum diperbarui"}
                  </span>
                </div>
                <input type="hidden" name="key" value={setting.key} />
                <textarea
                  className="mt-4 min-h-48 w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm leading-6 text-emerald-100 outline-none focus:border-emerald-500"
                  name="value"
                  defaultValue={JSON.stringify(setting.value, null, 2)}
                />
                <button className="mt-4 w-full rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800 sm:w-auto">
                  Simpan {setting.key}
                </button>
              </form>
            ))}
          </div>
        ) : (
          <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <Settings className="mx-auto size-10 text-emerald-700" />
            <h2 className="mt-4 text-2xl font-black">Belum ada settings</h2>
            <p className="mt-2 text-sm text-slate-600">Jalankan `database/seed.sql` untuk membuat konfigurasi awal.</p>
          </section>
        )}
      </section>
    </main>
  );
}
