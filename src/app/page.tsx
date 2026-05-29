import Link from "next/link";
import { ArrowUpRight, Check, Clock3, Database, Layers3, ShieldCheck } from "lucide-react";
import { MotionArticle, MotionDiv, MotionSection } from "@/components/motion-primitives";

const metrics = [
  ["810+", "soal published"],
  ["27", "topik aktif"],
  ["45", "soal simulasi"],
  ["100", "menit ujian"],
];

const pillars = [
  {
    icon: Clock3,
    title: "Ujian berbatas waktu",
    text: "Timer, auto-submit, dan pengalaman mengerjakan satu soal per layar.",
  },
  {
    icon: Layers3,
    title: "Navigasi CAT",
    text: "Palet nomor soal, status jawaban, dan perpindahan soal yang cepat.",
  },
  {
    icon: Database,
    title: "Bank soal terkelola",
    text: "Admin dapat import, generate, review, publish, dan mengatur passing grade.",
  },
  {
    icon: ShieldCheck,
    title: "Data aman",
    text: "Auth Supabase, RLS, dan pemisahan akses user/admin sudah aktif.",
  },
];

const categories = ["TWK", "TIU", "TKP"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#0d1512]">
      <MotionSection
        className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        <nav className="flex items-center justify-between border-b border-black/10 pb-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-[#0d1512] text-sm font-black text-white">CP</span>
            <span className="text-sm font-black tracking-tight">CPNS CAT Practice</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-bold text-black/70 transition hover:bg-black/5 sm:inline-flex">
              Masuk
            </Link>
            <Link href="/ujian" className="inline-flex items-center gap-2 rounded-full bg-[#0d1512] px-4 py-2 text-sm font-black text-white transition hover:bg-black">
              Mulai Ujian <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </nav>

        <section className="grid flex-1 gap-12 py-12 lg:grid-cols-[1fr_520px] lg:items-center lg:py-20">
          <div>
            <MotionDiv
              className="mb-7 inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-black/55"
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.08 }}
            >
              Simulasi CPNS 2026
            </MotionDiv>

            <MotionDiv initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.16 }}>
              <h1 className="max-w-5xl text-[clamp(3.5rem,10vw,8.5rem)] font-black leading-[0.86] tracking-[-0.08em]">
                Latihan CAT yang bersih, cepat, dan fokus.
              </h1>
              <p className="mt-8 max-w-2xl text-lg font-medium leading-8 text-black/62">
                Platform latihan CPNS dengan timer, palet nomor soal, auto-submit, pembahasan, riwayat, dan bank soal yang bisa dikelola admin.
              </p>
            </MotionDiv>

            <MotionDiv className="mt-9 flex flex-col gap-3 sm:flex-row" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.24 }}>
              <Link href="/ujian" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0d1512] px-6 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-black">
                Mulai Simulasi CAT <ArrowUpRight className="size-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-4 text-sm font-black text-[#0d1512] transition hover:-translate-y-0.5 hover:border-black/20">
                Buka Dashboard
              </Link>
            </MotionDiv>
          </div>

          <MotionDiv
            className="rounded-[2rem] border border-black/10 bg-white p-4 shadow-[0_30px_100px_rgba(15,23,42,0.08)]"
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.65 }}
          >
            <div className="rounded-[1.5rem] bg-[#0d1512] p-5 text-white">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">Simulasi CAT</p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight">Soal 18</h2>
                </div>
                <div className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#0d1512]">00:58:12</div>
              </div>

              <div className="mt-8 rounded-[1.25rem] bg-white p-5 text-[#0d1512]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">TIU - Silogisme</p>
                <p className="mt-4 text-xl font-black leading-8">
                  Semua pegawai disiplin datang tepat waktu. Sebagian peserta adalah pegawai. Kesimpulan paling tepat adalah...
                </p>
                <div className="mt-5 space-y-2.5">
                  {[
                    "Semua peserta datang tepat waktu",
                    "Sebagian peserta mungkin datang tepat waktu",
                    "Tidak ada peserta yang datang tepat waktu",
                  ].map((option, index) => (
                    <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${index === 1 ? "border-emerald-500 bg-emerald-50 text-emerald-950" : "border-black/10 bg-[#f7f8f5] text-black/72"}`} key={option}>
                      {String.fromCharCode(65 + index)}. {option}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-9 gap-1.5">
                {Array.from({ length: 27 }).map((_, index) => (
                  <span className={`grid aspect-square place-items-center rounded-lg text-[11px] font-black ${index < 18 ? "bg-emerald-400 text-[#0d1512]" : index === 18 ? "bg-white text-[#0d1512]" : "bg-white/10 text-white/70"}`} key={index}>
                    {index + 1}
                  </span>
                ))}
              </div>
            </div>
          </MotionDiv>
        </section>

        <section className="grid gap-4 border-t border-black/10 py-8 sm:grid-cols-4">
          {metrics.map(([value, label], index) => (
            <MotionArticle
              className="rounded-3xl border border-black/10 bg-white p-5"
              initial={{ y: 18, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              key={label}
            >
              <p className="text-4xl font-black tracking-tight">{value}</p>
              <p className="mt-2 text-sm font-bold text-black/55">{label}</p>
            </MotionArticle>
          ))}
        </section>

        <section className="grid gap-4 py-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] bg-[#0d1512] p-6 text-white">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">Kategori</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {categories.map((category) => (
                <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#0d1512]" key={category}>{category}</span>
              ))}
            </div>
            <p className="mt-8 max-w-sm text-sm font-medium leading-7 text-white/65">
              Latihan berbasis kompetensi TWK, TIU, dan TKP dengan hasil yang langsung bisa dievaluasi.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <MotionArticle
                  className="rounded-[2rem] border border-black/10 bg-white p-6"
                  initial={{ y: 18, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  key={pillar.title}
                >
                  <div className="mb-6 grid size-11 place-items-center rounded-2xl bg-[#eef4f1] text-emerald-700">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">{pillar.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-black/60">{pillar.text}</p>
                </MotionArticle>
              );
            })}
          </div>
        </section>

        <section className="pb-12 pt-4">
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-black/45">Siap digunakan</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Masuk, mulai ujian, lihat hasil.</h2>
                <div className="mt-5 grid gap-2 text-sm font-bold text-black/62 sm:grid-cols-3">
                  {['Jawaban tersimpan otomatis', 'Auto-submit saat waktu habis', 'Pembahasan tampil setelah submit'].map((item) => (
                    <span className="inline-flex items-center gap-2" key={item}><Check className="size-4 text-emerald-700" /> {item}</span>
                  ))}
                </div>
              </div>
              <Link href="/ujian" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0d1512] px-6 py-4 text-sm font-black text-white transition hover:bg-black">
                Mulai sekarang <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </MotionSection>
    </main>
  );
}
