import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Bot,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const categories = [
  { code: "TWK", name: "Tes Wawasan Kebangsaan", topics: "Pancasila, UUD 1945, NKRI", mode: "Draft review untuk AI" },
  { code: "TIU", name: "Tes Intelegensia Umum", topics: "Analogi, deret, silogisme", mode: "Auto-publish terbatas" },
  { code: "TKP", name: "Tes Karakteristik Pribadi", topics: "Pelayanan, integritas, adaptasi", mode: "Skor per opsi" },
];

const roadmap = [
  "Auth Supabase dan profil user",
  "Bank soal dengan status draft sampai published",
  "Sesi latihan, jawaban, skor, dan pembahasan",
  "Admin soal dan generator Gemini",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f0e8] text-slate-950">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid size-9 place-items-center rounded-full bg-emerald-700 text-white">
              CP
            </span>
            CPNS Practice Web
          </div>
          <a
            href="#mvp"
            className="hidden rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white sm:inline-flex"
          >
            Lihat MVP
          </a>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
              <Sparkles className="size-4" /> Mobile-first dengan generator soal AI
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
                Latihan CPNS pribadi yang siap tumbuh jadi platform tryout.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">
                Fondasi aplikasi mengikuti PRD: latihan TWK, TIU, TKP, skor otomatis,
                pembahasan, riwayat, admin soal, dan generator Gemini dengan validasi aman.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#kategori"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800"
              >
                Mulai Rancang Latihan <ArrowRight className="size-4" />
              </a>
              <a
                href="#security"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-4 font-bold text-slate-900 transition hover:border-slate-500"
              >
                Cek Prinsip Security
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white p-4 shadow-2xl shadow-slate-900/10">
            <div className="rounded-[1.5rem] bg-slate-950 p-4 text-white">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Sesi latihan</p>
                  <h2 className="text-xl font-bold">TIU - Silogisme</h2>
                </div>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-sm text-emerald-200">3/10</span>
              </div>
              <div className="rounded-3xl bg-white p-5 text-slate-950">
                <p className="mb-4 text-sm font-semibold text-emerald-700">Pertanyaan</p>
                <p className="text-lg font-bold leading-7">
                  Semua pegawai disiplin datang tepat waktu. Sebagian peserta adalah pegawai.
                  Kesimpulan paling tepat adalah...
                </p>
                <div className="mt-5 space-y-3">
                  {["Semua peserta datang tepat waktu", "Sebagian peserta mungkin datang tepat waktu", "Tidak ada peserta yang datang tepat waktu"].map((option, index) => (
                    <button
                      className={`w-full rounded-2xl border p-4 text-left font-medium ${
                        index === 1
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-slate-50"
                      }`}
                      key={option}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="kategori" className="grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" key={category.code}>
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white">{category.code}</span>
                <BookOpenCheck className="size-5 text-emerald-700" />
              </div>
              <h3 className="text-xl font-bold">{category.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{category.topics}</p>
              <p className="mt-4 rounded-2xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">{category.mode}</p>
            </article>
          ))}
        </section>

        <section id="mvp" className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl bg-emerald-800 p-6 text-white">
            <ClipboardList className="mb-5 size-8" />
            <h2 className="text-2xl font-black">Scope MVP</h2>
            <p className="mt-3 leading-7 text-emerald-50">
              Fokus pertama adalah alur latihan yang stabil sebelum fitur publik seperti ranking,
              payment, sertifikat, atau tryout resmi penuh.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {roadmap.map((item) => (
              <div className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-5" key={item}>
                <CheckCircle2 className="mt-1 size-5 shrink-0 text-emerald-700" />
                <p className="font-semibold leading-6">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="security" className="grid gap-4 pb-10 md:grid-cols-3">
          <InfoCard icon={<ShieldCheck />} title="RLS wajib aktif" text="User hanya boleh membaca data miliknya sendiri. Admin dikunci lewat profiles.role." />
          <InfoCard icon={<Bot />} title="Gemini server-side" text="API key tidak dikirim ke browser. Output AI masuk draft/published sesuai validasi." />
          <InfoCard icon={<BarChart3 />} title="Skor configurable" text="Aturan skor dan passing grade disimpan sebagai konfigurasi, bukan hardcode permanen." />
        </section>
      </section>
    </main>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 grid size-11 place-items-center rounded-2xl bg-slate-100 text-emerald-700">
        {icon}
      </div>
      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
