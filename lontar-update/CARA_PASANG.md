# Cara Pasang ke Project `lontar-archivev2`

File-file ini siap copy-paste langsung ke project Next.js (App Router) lu.
Tidak ada dependency baru yang perlu diinstall — semuanya pakai Tailwind
classes yang sudah ada di project.

## Struktur file yang harus disalin

```
data/
  arsip.ts                  ← BARU
  riset.ts                  ← BARU

components/
  PageHeading.tsx            ← BARU
  TeamModal.tsx               ← BARU

app/
  arsip/
    page.tsx                 ← BARU (list naskah)
    [slug]/
      page.tsx                ← BARU (detail naskah + toggle bahasa)
  riset/
    page.tsx                 ← BARU (tentang proyek + tim + publikasi)
    [slug]/
      page.tsx                ← BARU (detail artikel)
  kontak/
    page.tsx                 ← BARU (form + info institusi)
```

## Langkah pemasangan

1. Copy folder `data/`, `components/`, dan `app/` di atas ke root project
   lu, gabungkan dengan struktur yang sudah ada (jangan timpa `app/page.tsx`
   atau `app/layout.tsx` yang sudah ada).

2. Cek path alias `@/` di `tsconfig.json` — biasanya Next.js 14 App Router
   sudah otomatis punya ini. Kalau belum ada, tambahkan:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```
   Sesuaikan `./src/*` dengan struktur folder project lu (kalau pakai
   `src/` directory atau tidak).

3. Pastikan font Playfair Display dan DM Mono sudah ter-load global
   (biasanya sudah ada di `app/layout.tsx` dari setup awal project,
   karena landing page "Warisan Abadi" sudah pakai font yang sama).

4. Jalankan:
   ```bash
   npm run dev
   ```

5. Cek halaman:
   - `localhost:3000/arsip` → daftar naskah
   - `localhost:3000/arsip/lontar-kaganga-01` → detail naskah
   - `localhost:3000/riset` → tentang proyek + tim + publikasi
   - `localhost:3000/riset/metodologi-fotogrametri` → detail artikel
   - `localhost:3000/kontak` → form kontak

## Catatan penting

- **Link "Lihat model 3D di Koleksi"** di halaman Arsip detail mengarah
  ke `/koleksi/${relatedKoleksiSlug}`. Pastikan slug di `data/arsip.ts`
  (field `relatedKoleksiSlug`) cocok sama slug yang ada di `data/koleksi.ts`
  lu yang sudah ada.

- **Form Kontak** saat ini cuma UI doang — submit-nya cuma mengubah state
  jadi "terkirim", belum nyambung ke backend/email service apapun. Itu
  next step terpisah kalau mau beneran kirim email (bisa pakai Resend,
  Formspree, atau API route Next.js sendiri).

- **Modal Tim** di halaman Riset pakai `'use client'` karena butuh state
  untuk buka/tutup popup. Halaman Riset secara keseluruhan jadi client
  component karena alasan ini — kalau mau dioptimasi nanti, modal bisa
  dipisah jadi client component kecil sementara sisanya tetap server
  component, tapi untuk sekarang ini sudah cukup ringan.

- Semua data (naskah, tim, publikasi) masih **hardcoded** di file
  `data/arsip.ts` dan `data/riset.ts` — sama persis pola yang dipakai
  `data/koleksi.ts` yang sudah ada. Kalau project berkembang, langkah
  selanjutnya biasanya migrasi ke database (Supabase) seperti yang
  sempat dibahas di rencana hotspot 3D sebelumnya.
