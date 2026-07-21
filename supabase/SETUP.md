# Setup Supabase — Arsip Lontar

Panel admin (`/admin`) menulis ke Supabase; halaman publik membacanya.
Ikuti 4 langkah ini sekali saja.

## 1. Isi kredensial di `.env`
Buka Supabase Dashboard → **Project Settings → API**, salin:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> Sudah terisi? Bagus. Setelah mengubah `.env`, **restart** `npm run dev`.

## 2. Buat tabel + storage
Dashboard → **SQL Editor → New query** → tempel seluruh isi
[`supabase/schema.sql`](./schema.sql) → **Run**.

Ini membuat tabel `naskah`, `koleksi`, `arsip`, mengaktifkan RLS
(publik hanya bisa baca, admin login bisa tulis), dan bucket storage `media`.

## 3. Buat akun admin
Dashboard → **Authentication → Users → Add user** →
isi email + password → **Create user**.
(Matikan "Auto Confirm"? jangan — biarkan tercentang agar langsung aktif.)

Akun inilah yang dipakai login di halaman `/admin`.

## 4. Isi data awal
Buka `/admin` → login → tab **Data & Backup** → **Muat Data Awal**.
Ini menyalin data contoh (Carita Parahyangan, dll.) ke database supaya
langsung bisa diedit. Setelah itu situs publik membaca dari database.

---

### Catatan keamanan
- `ANON_KEY` memang publik dan aman diekspos — RLS yang melindungi data.
- Menulis data & mengunggah gambar **wajib login**; pengunjung biasa hanya bisa membaca.
- Untuk menambah admin lain, cukup buat user baru di Authentication → Users.

### Kalau Supabase belum diisi
Situs tetap jalan dengan data contoh bawaan (seed) dan panel admin
menampilkan pesan bahwa Supabase belum dikonfigurasi.
