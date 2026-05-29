import Link from "next/link";
import { ArrowRight, BookOpenCheck, Bot, Clock3, Layers3, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { MotionArticle, MotionDiv, MotionHeader, MotionSection, MotionSpan } from "@/components/motion-primitives";

const categories = [
  { code: "TWK", name: "Wawasan Kebangsaan", tone: "from-emerald-400 to-teal-500", detail: "Pancasila, UUD 1945, NKRI, nasionalisme" },
  { code: "TIU", name: "Intelegensia Umum", tone: "from-sky-400 to-indigo-500", detail: "Analogi, numerik, silogisme, figural" },
  { code: "TKP", name: "Karakteristik Pribadi", tone: "from-lime-400 to-emerald-500", detail: "Pelayanan, integritas, adaptasi, profesionalisme" },
];

const features = [
  { icon: Clock3, title: "Timer CAT", text: "Simulasi ujian berbatas waktu dengan auto-submit saat waktu habis." },
  { icon: Layers3, title: "Palet Nomor", text: "Pindah soal cepat, lihat status terjawab, dan lanjut tanpa kehilangan jawaban." },
  { icon: Trophy, title: "Status Lulus", text: "Hasil menampilkan skor TWK, TIU, TKP dan ambang kelulusan simulasi." },
  { icon: Bot, title: "Bank Soal AI", text: "Admin dapat generate, import massal, review, dan publish soal latihan." },
];

const stats = [
  ["810+", "Soal published"],
  ["27", "Topik CPNS"],
  ["45", "Soal simulasi"],
  ["100", "Menit ujian"],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden aurora-bg text-slate-950">
      <div className="pointer-events-none fixed inset-0 opacity-70 [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:44px_44px]" />
      <MotionSection className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-5 sm:px-6 lg:px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <MotionHeader className="glass-panel sticky top-4 z-20 flex items-center justify-between rounded-full px-4 py-3" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.55 }}>
          <Link href="/" className="flex items-center gap-3 font-black tracking-tight">
            <span className="grid size-10 place-items-center rounded-full bg-slate-950 text-white shadow-lg shadow-slate-950/20">CP</span>
            <span>CPNS CAT Practice</span>
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className="rounded-full px-4 py-2 text-sm font-black text-slate-700 hover:bg-white/60">Masuk</Link>
            <Link href="/ujian" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white shadow-xl shadow-slate-950/20">Mulai Ujian</Link>
          </div>
        </MotionHeader>

        <section className="grid min-h-[calc(100vh-110px)] gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
          <div className="space-y-7">
            <MotionDiv className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1.5 text-sm font-black text-emerald-800 shadow-sm backdrop-blur" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <Sparkles className="size-4" /> Simulasi CPNS 2026 siap latihan
            </MotionDiv>
            <MotionDiv initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18, duration: 0.7 }}>
              <h1 className="max-w-4xl text-5xl font-black tracking-[-0.06em] text-slate-950 sm:text-7xl lg:text-8xl">
                Latihan CAT CPNS yang terasa serius, cepat, dan modern.
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-700 sm:text-xl">
                Kerjakan TWK, TIU, dan TKP dengan timer, palet nomor, auto-submit, pembahasan, riwayat, serta admin bank soal yang siap diisi ribuan soal.
              </p>
            </MotionDiv>
            <MotionDiv className="flex flex-col gap-3 sm:flex-row" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.28 }}>
              <Link href="/ujian" className="group inline-flex items-center justify-center gap-2 rounded-3xl bg-slate-950 px-6 py-5 font-black text-white shadow-2xl shadow-slate-950/25 transition hover:-translate-y-1 hover:bg-slate-800">
                Mulai Simulasi CAT <ArrowRight className="size-5 transition group-hover:translate-x-1" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-3xl border border-white/70 bg-white/70 px-6 py-5 font-black text-slate-950 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:bg-white">
                Buka Dashboard
              </Link>
            </MotionDiv>
            <MotionDiv className="grid grid-cols-2 gap-3 sm:grid-cols-4" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.38 }}>
              {stats.map(([value, label]) => (
                <div className="glass-panel rounded-3xl p-4" key={label}>
                  <p className="text-3xl font-black">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                </div>
              ))}
            </MotionDiv>
          </div>

          <MotionDiv className="relative" initial={{ x: 40, opacity: 0, scale: 0.96 }} animate={{ x: 0, opacity: 1, scale: 1 }} transition={{ delay: 0.22, duration: 0.7 }}>
            <MotionDiv className="absolute -left-8 top-10 hidden rounded-3xl bg-white/80 p-4 shadow-2xl backdrop-blur lg:block" animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity }}>
              <p className="text-xs font-black uppercase text-slate-500">Progress</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">32/45</p>
            </MotionDiv>
            <div className="dark-glass rounded-[2.5rem] p-4 text-white">
              <div className="rounded-[2rem] bg-white/[0.06] p-5 ring-1 ring-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-200">Simulasi CAT CPNS</p>
                    <h2 className="mt-1 text-3xl font-black">Soal 18</h2>
                  </div>
                  <div className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-black text-slate-950">00:58:12</div>
                </div>
                <div className="mt-6 rounded-[2rem] bg-white p-5 text-slate-950 shadow-2xl">
                  <p className="text-sm font-black text-emerald-700">TIU - Silogisme</p>
                  <p className="mt-3 text-xl font-black leading-8">Semua pegawai disiplin datang tepat waktu. Sebagian peserta adalah pegawai. Kesimpulan paling tepat adalah...</p>
                  <div className="mt-5 space-y-3">
                    {["Semua peserta datang tepat waktu", "Sebagian peserta mungkin datang tepat waktu", "Tidak ada peserta yang datang tepat waktu", "Semua peserta adalah pegawai"].map((option, index) => (
                      <MotionDiv whileHover={{ scale: 1.015 }} className={`rounded-2xl border p-4 text-sm font-bold ${index === 1 ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50"}`} key={option}>
                        {String.fromCharCode(65 + index)}. {option}
                      </MotionDiv>
                    ))}
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-9 gap-2">
                  {Array.from({ length: 27 }).map((_, index) => (
                    <MotionSpan whileHover={{ scale: 1.1 }} className={`grid aspect-square place-items-center rounded-xl text-xs font-black ${index < 18 ? "bg-emerald-400 text-slate-950" : index === 18 ? "bg-white text-slate-950" : "bg-white/10 text-white"}`} key={index}>
                      {index + 1}
                    </MotionSpan>
                  ))}
                </div>
              </div>
            </div>
          </MotionDiv>
        </section>

        <MotionSection className="grid gap-4 md:grid-cols-3" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}>
          {categories.map((category) => (
            <MotionArticle variants={{ hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1 } }} whileHover={{ y: -8 }} className="glass-panel overflow-hidden rounded-[2rem] p-5" key={category.code}>
              <div className={`mb-8 h-2 rounded-full bg-gradient-to-r ${category.tone}`} />
              <div className="flex items-center justify-between">
                <span className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white">{category.code}</span>
                <BookOpenCheck className="size-6 text-emerald-700" />
              </div>
              <h3 className="mt-5 text-2xl font-black">{category.name}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{category.detail}</p>
            </MotionArticle>
          ))}
        </MotionSection>

        <section className="grid gap-4 pb-12 lg:grid-cols-[0.85fr_1.15fr]">
          <MotionDiv className="dark-glass rounded-[2rem] p-6 text-white" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <ShieldCheck className="mb-6 size-9 text-emerald-300" />
            <h2 className="text-3xl font-black">Bukan sekadar tampilan. Alurnya siap dipakai.</h2>
            <p className="mt-4 leading-7 text-slate-300">Auth, RLS, sesi ujian, penyimpanan jawaban, bank soal, admin, import massal, dan konfigurasi passing grade sudah berada dalam satu sistem.</p>
          </MotionDiv>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <MotionArticle className="glass-panel rounded-[2rem] p-5" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} viewport={{ once: true }} key={feature.title}>
                  <Icon className="mb-5 size-7 text-emerald-700" />
                  <h3 className="text-xl font-black">{feature.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{feature.text}</p>
                </MotionArticle>
              );
            })}
          </div>
        </section>
      </MotionSection>
    </main>
  );
}
