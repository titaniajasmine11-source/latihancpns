# CPNS Practice Web

Aplikasi latihan CPNS mobile-first dengan Next.js, Supabase, dan generator soal Gemini. Fitur utama meliputi latihan per topik, simulasi ujian, skor otomatis, pembahasan, riwayat, admin soal, draft AI, dan settings dasar.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth, PostgreSQL, dan RLS
- Gemini API untuk generator soal

## Setup Lokal

1. Install dependency:

```bash
npm install
```

2. Salin env contoh:

```bash
cp .env.example .env.local
```

3. Isi `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DIRECT_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
CRON_SECRET=
APP_URL=http://localhost:3000
```

4. Jalankan schema dan seed database:

```bash
npm run db:setup
```

5. Jalankan dev server:

```bash
npm run dev
```

## Script

- `npm run dev` menjalankan Next.js development server.
- `npm run build` membuat production build.
- `npm run start` menjalankan build production.
- `npm run lint` menjalankan ESLint.
- `npm run db:setup` menjalankan `database/schema.sql` dan `database/seed.sql`.
- `npm run doctor:swc` mengecek native SWC Windows.

## Database

File utama:

- `database/schema.sql` berisi tabel, RLS policies, dan trigger profile user baru.
- `database/seed.sql` berisi data awal kategori, topik, settings, dan bank soal.
- `database/20260529_security_hardening.sql` berisi migrasi aman untuk database existing.
- `database/README.md` berisi catatan database tambahan.

Pastikan Supabase Auth dan environment database sudah benar sebelum menjalankan `npm run db:setup`.

## Admin

Role admin disimpan di tabel `profiles.role`. User baru default `user`. Untuk memberi akses admin, ubah role profile menjadi `admin` melalui SQL/Supabase dashboard atau script admin yang tersedia di `scripts/create-admin.cjs` jika environment sudah dikonfigurasi.

Admin dapat:

- Mengelola soal manual dan import JSON.
- Mengubah status soal.
- Generate draft soal Gemini.
- Review dan publish draft AI.
- Mengubah settings aplikasi.

## Catatan Keamanan

- Jangan commit `.env.local` atau secret Supabase/Gemini.
- `SUPABASE_SERVICE_ROLE_KEY` hanya untuk script server-side atau maintenance, bukan client.
- Halaman pengerjaan tidak mengirim `score` opsi ke client sebelum submit.
- RLS tetap perlu diaudit jika aplikasi berubah menjadi publik besar.

## Verifikasi

Sebelum deploy atau lanjut perubahan besar, jalankan:

```bash
npm run lint
npm run build
```
