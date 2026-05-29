import Link from "next/link";
import { ArrowRight, Clock3, Database, Gauge, LockKeyhole, Radar, TerminalSquare } from "lucide-react";
import { MotionDiv, MotionSection } from "@/components/motion-primitives";

const panels = [
  { label: "BANK", value: "810+", sub: "SOAL PUBLISHED", icon: Database },
  { label: "MODE", value: "CAT", sub: "TIMER + AUTO SUBMIT", icon: Gauge },
  { label: "TRACK", value: "27", sub: "TOPIK AKTIF", icon: Radar },
  { label: "SAFE", value: "RLS", sub: "USER DATA ISOLATED", icon: LockKeyhole },
];

const rows = [
  ["01", "Instruksi ujian", "Baca aturan sebelum timer dimulai"],
  ["02", "Kerjakan soal", "Gunakan palet nomor dan simpan otomatis"],
  ["03", "Submit hasil", "Auto-submit aktif saat waktu habis"],
  ["04", "Evaluasi", "Skor, passing grade, pembahasan"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#070a08] text-[#e8f1eb]">
      <div className="fixed inset-0 opacity-30 [background-image:linear-gradient(rgba(52,211,153,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.12)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_20%_90%,rgba(132,204,22,0.12),transparent_30%)]" />

      <MotionSection className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <nav className="grid grid-cols-[1fr_auto] items-center border border-emerald-400/20 bg-black/30 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-emerald-100/80">
          <Link href="/" className="flex items-center gap-3">
            <TerminalSquare className="size-5 text-emerald-300" /> CPNS CAT COMMAND
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden border border-emerald-400/20 px-4 py-2 hover:bg-emerald-400/10 sm:block">Login</Link>
            <Link href="/ujian" className="bg-emerald-300 px-4 py-2 font-black text-black hover:bg-emerald-200">Start</Link>
          </div>
        </nav>

        <section className="grid flex-1 gap-4 py-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-4">
            <MotionDiv className="border border-emerald-400/20 bg-[#0b100d]/90 p-5 sm:p-8" initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.55 }}>
              <div className="mb-8 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-300">
                <span className="border border-emerald-400/30 px-3 py-1">CPNS 2026</span>
                <span className="border border-emerald-400/30 px-3 py-1">TWK/TIU/TKP</span>
                <span className="border border-emerald-400/30 px-3 py-1">LIVE BANK</span>
              </div>
              <h1 className="max-w-5xl font-mono text-[clamp(3rem,8.4vw,8rem)] font-black uppercase leading-[0.9] tracking-[-0.08em] text-white">
                CAT drill system.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-emerald-50/62">
                Interface latihan ujian CPNS yang fokus ke eksekusi: timer, palet nomor, auto-submit, passing grade, pembahasan, dan bank soal besar.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/ujian" className="group inline-flex items-center justify-center gap-2 bg-emerald-300 px-6 py-4 font-mono text-sm font-black uppercase tracking-[0.14em] text-black hover:bg-emerald-200">
                  Mulai Simulasi <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </Link>
                <Link href="/dashboard" className="inline-flex items-center justify-center border border-emerald-400/30 px-6 py-4 font-mono text-sm font-black uppercase tracking-[0.14em] text-emerald-100 hover:bg-emerald-400/10">
                  Dashboard
                </Link>
              </div>
            </MotionDiv>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {panels.map((panel, index) => {
                const Icon = panel.icon;
                return (
                  <MotionDiv className="border border-emerald-400/20 bg-[#0b100d]/80 p-4" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + index * 0.06 }} key={panel.label}>
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300/70">
                      {panel.label} <Icon className="size-4" />
                    </div>
                    <p className="mt-5 font-mono text-4xl font-black text-white">{panel.value}</p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-50/45">{panel.sub}</p>
                  </MotionDiv>
                );
              })}
            </div>
          </div>

          <MotionDiv className="border border-emerald-400/20 bg-[#0b100d]/90 p-4" initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.55, delay: 0.08 }}>
            <div className="mb-4 flex items-center justify-between border-b border-emerald-400/20 pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-300">
              <span>Exam Console</span>
              <span className="inline-flex items-center gap-2"><Clock3 className="size-4" /> 00:58:12</span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_120px]">
              <div className="border border-emerald-400/20 bg-black/20 p-4">
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-300">TIU / SILOGISME / Q-18</div>
                <p className="mt-5 text-2xl font-black leading-9 text-white">
                  Semua pegawai disiplin datang tepat waktu. Sebagian peserta adalah pegawai. Kesimpulan paling tepat adalah...
                </p>
                <div className="mt-6 grid gap-2">
                  {[
                    "Semua peserta datang tepat waktu",
                    "Sebagian peserta mungkin datang tepat waktu",
                    "Tidak ada peserta yang datang tepat waktu",
                    "Semua peserta adalah pegawai",
                  ].map((option, index) => (
                    <div className={`border px-4 py-3 font-mono text-sm ${index === 1 ? "border-emerald-300 bg-emerald-300 text-black" : "border-emerald-400/20 text-emerald-50/70"}`} key={option}>
                      {String.fromCharCode(65 + index)} / {option}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 self-start">
                {Array.from({ length: 27 }).map((_, index) => (
                  <span className={`grid aspect-square place-items-center border font-mono text-[10px] font-black ${index < 18 ? "border-emerald-300 bg-emerald-300 text-black" : index === 18 ? "border-white bg-white text-black" : "border-emerald-400/20 text-emerald-50/45"}`} key={index}>
                    {index + 1}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {rows.map(([num, title, desc]) => (
                <div className="grid grid-cols-[42px_1fr] gap-3 border border-emerald-400/20 p-3" key={num}>
                  <span className="font-mono text-sm font-black text-emerald-300">{num}</span>
                  <div>
                    <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-white">{title}</p>
                    <p className="mt-1 text-sm text-emerald-50/48">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </MotionDiv>
        </section>
      </MotionSection>
    </main>
  );
}
