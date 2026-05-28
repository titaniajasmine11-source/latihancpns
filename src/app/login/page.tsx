import Link from "next/link";
import { login } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f0e8] px-4 py-10">
      <section className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10">
        <div className="mb-8">
          <Link href="/" className="text-sm font-bold text-emerald-700">
            CPNS Practice Web
          </Link>
          <h1 className="mt-4 text-3xl font-black text-slate-950">Masuk akun</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Lanjutkan latihan, lihat skor, dan simpan riwayat progres Anda.
          </p>
        </div>

        {message ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {message}
          </div>
        ) : null}

        <form action={login} className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-800">Email</span>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-800">Password</span>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="w-full rounded-2xl bg-emerald-700 px-5 py-4 font-black text-white transition hover:bg-emerald-800">
            Masuk
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Belum punya akun?{" "}
          <Link className="font-bold text-emerald-700" href="/register">
            Daftar sekarang
          </Link>
        </p>
      </section>
    </main>
  );
}
