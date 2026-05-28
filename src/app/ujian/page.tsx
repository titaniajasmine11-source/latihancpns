import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck, Clock3, ShieldAlert } from "lucide-react";
import { startExam } from "@/app/latihan/actions";
import { createClient } from "@/lib/supabase/server";

type PracticeSetting = {
  exam_duration_minutes?: number;
  exam_category_targets?: Record<string, number>;
};

export default async function ExamInstructionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: practiceSetting } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "practice")
    .maybeSingle();
  const practice = practiceSetting?.value as PracticeSetting | null;
  const targets = practice?.exam_category_targets ?? { TWK: 5, TIU: 5, TKP: 5 };
  const totalQuestions = Object.values(targets).reduce((total, count) => total + count, 0);
  const duration = practice?.exam_duration_minutes ?? 100;

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-4 pb-28 pt-6 text-slate-950 sm:px-6 md:pb-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <header className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10">
          <p className="text-sm font-semibold text-emerald-200">Instruksi ujian</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Simulasi CAT CPNS</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Baca aturan sebelum mulai. Timer berjalan setelah tombol mulai ditekan dan ujian otomatis submit saat waktu habis.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <ClipboardCheck className="mb-5 size-7 text-emerald-700" />
            <p className="text-3xl font-black">{totalQuestions}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">Total soal</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <Clock3 className="mb-5 size-7 text-emerald-700" />
            <p className="text-3xl font-black">{duration}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">Menit</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldAlert className="mb-5 size-7 text-amber-600" />
            <p className="text-3xl font-black">Auto</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">Submit waktu habis</p>
          </article>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black">Aturan pengerjaan</h2>
          <div className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-slate-700">
            <p>1. Pastikan koneksi stabil sebelum mulai ujian.</p>
            <p>2. Jawaban tersimpan otomatis setiap kali memilih opsi.</p>
            <p>3. Gunakan palet nomor untuk berpindah soal.</p>
            <p>4. Hindari keluar halaman atau berpindah tab selama ujian.</p>
            <p>5. Setelah submit, jawaban tidak dapat diubah dan pembahasan langsung tampil.</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link href="/latihan" className="inline-flex justify-center rounded-2xl border border-slate-200 px-5 py-4 font-black text-slate-700 hover:border-slate-400">
              Kembali latihan
            </Link>
            <form action={startExam}>
              <button className="inline-flex w-full justify-center rounded-2xl bg-emerald-700 px-5 py-4 font-black text-white hover:bg-emerald-800">
                Mulai ujian sekarang
              </button>
            </form>
          </div>
        </section>
      </section>
    </main>
  );
}
