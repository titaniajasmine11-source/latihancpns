# Database Setup

Jalankan `schema.sql` terlebih dahulu di Supabase SQL Editor, lalu jalankan `seed.sql`.

File ini menyiapkan tabel utama, RLS, trigger profil user baru, kategori TWK/TIU/TKP, topik awal, contoh soal, dan konfigurasi skor/generator.

## Admin Pertama

Setelah user admin mendaftar melalui aplikasi, ubah role profilnya di Supabase SQL Editor:

```sql
update profiles
set role = 'admin'
where id = '<USER_ID_ADMIN>';
```

`<USER_ID_ADMIN>` bisa dilihat di Supabase Authentication atau tabel `profiles`.

## Menjalankan dari Lokal

Jika `DATABASE_URL` tersedia, setup juga bisa dijalankan dari terminal:

```bash
npm run db:setup
```

Pastikan `.env.local` berisi nilai Supabase dan `GEMINI_API_KEY` jika fitur generator AI digunakan.
