# Database Setup

Jalankan `schema.sql` terlebih dahulu di Supabase SQL Editor, lalu jalankan `seed.sql`.

File ini menyiapkan tabel utama, RLS, trigger profil user baru, kategori TWK/TIU/TKP, topik awal, contoh soal, dan konfigurasi skor/generator.

## Migrasi Existing Project

Untuk database yang sudah berisi data, jalankan migrasi non-destruktif ini di Supabase SQL Editor:

```sql
-- database/20260529_security_hardening.sql
```

Migrasi ini memperketat RLS, menambah RPC sesi/hasil, dan tidak menjalankan seed ulang.

## Admin Pertama

Setelah user admin mendaftar melalui aplikasi, ubah role profilnya di Supabase SQL Editor:

```sql
update profiles
set role = 'admin'
where id = '<USER_ID_ADMIN>';
```

`<USER_ID_ADMIN>` bisa dilihat di Supabase Authentication atau tabel `profiles`.

## Menjalankan dari Lokal

Jika `DIRECT_URL` tersedia, setup juga bisa dijalankan dari terminal:

```bash
npm run db:setup
```

Pastikan `.env.local` berisi nilai Supabase, `DIRECT_URL`, dan `GEMINI_API_KEY` jika fitur generator AI digunakan.
