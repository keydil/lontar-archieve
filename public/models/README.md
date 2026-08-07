# /public/models/

**Folder ini sekarang cuma tempat kerja LOKAL** — bukan sumber model 3D
situs lagi. Model 3D yang dipublikasikan disimpan di **Cloudflare R2**
(bukan di-commit ke Git), direferensikan lewat field `modelUrl` (URL
publik penuh) di record koleksi Supabase, diisi lewat form upload di
`/admin/koleksi-3d`. Ini yang bikin `.glb` beneran muncul di Vercel
(produksi) — sebelumnya file lokal di sini gitignored dan gak pernah
ke-deploy.

Folder ini masih berguna buat: (1) tempat taruh hasil export RealityScan
sebelum di-upload lewat admin panel, (2) sumber buat script migrasi
sekali-jalan (`scripts/migrate-models-to-storage.mjs`).

## Setup Cloudflare R2 (sekali doang)

Kalau lu udah punya akun Cloudflare (mis. buat project lain), **login ke
akun yang sama itu** — jangan bikin akun baru, biar gak perlu verifikasi
kartu/pembayaran lagi dari nol.

1. Dashboard Cloudflare → **R2 Object Storage** → **Create bucket**.
   Nama bucket bebas asal unik di akun lu (gak perlu unik global kayak B2).
2. Buka bucket itu → tab **Settings** → **Public access** → aktifkan
   **"Allow Access"** buat dapet URL publik `https://pub-xxxxxxxx.r2.dev`.
   Catat URL ini — ini yang diisi ke `STORAGE_PUBLIC_URL`.
3. Dashboard R2 (halaman utama, bukan di dalam bucket) → **Manage R2 API
   Tokens** → **Create API Token** → scope **Object Read & Write**, batasi
   ke bucket ini doang. Catat **Access Key ID** dan **Secret Access Key**
   (cuma ditampilkan sekali).
4. Endpoint API S3-nya ada di halaman yang sama, formatnya
   `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` — punya Account ID
   sendiri (bukan bagian dari nama bucket).
5. Isi ke `.env` project (lihat komentar di sana):
   `STORAGE_KEY_ID`, `STORAGE_SECRET_KEY`, `STORAGE_BUCKET_NAME`,
   `STORAGE_ENDPOINT`, `STORAGE_REGION=auto`, `STORAGE_PUBLIC_URL`.
6. Isi juga env yang sama di **Vercel Dashboard → Project → Settings →
   Environment Variables** (biar upload jalan di produksi juga, bukan cuma
   lokal), lalu redeploy.

R2 gratis 10GB/bulan **per akun** (dibagi rata sama project lain yang
numpang akun sama), egress-nya gratis gak terbatas dari sananya — gak
perlu setup CDN/domain tambahan buat itu (beda dari Backblaze B2 yang
butuh trik combo Cloudflare buat dapet egress gratis penuh).

## Migrasi model lama (sekali jalan)

Model yang dulu disimpan lokal (`buddha_fix.glb`, `macan_lonceng.glb`)
diupload ke R2 lewat script, bukan manual lewat admin panel (biar gak perlu
upload 50MB+ dari browser satu-satu). Butuh tambahan env
`SUPABASE_SERVICE_ROLE_KEY` (Dashboard Supabase → Project Settings → API →
`service_role` secret — JANGAN taruh di kode client-side).

```bash
node --env-file=.env scripts/migrate-models-to-storage.mjs
```

Script ini otomatis baca referensi tekstur eksternal dari tiap `.glb`
(kalau ada) dan ikut upload file PNG-nya sejajar di bucket, lalu update
`modelUrl` di record koleksi Supabase yang sesuai.

`panci_sakti.glb` **sengaja tidak** dimigrasi — mesh hasil scan-nya bolong
(RealityScan gagal merekonstruksi sebagian permukaan). Jangan dipublikasikan
sampai artefaknya (Goong Renteng) discan ulang dari RealityScan, baru upload
manual lewat admin panel.

## Nambah model baru ke depannya

Cukup lewat **admin panel** (`/admin/koleksi-3d` → edit artefak → unggah
`.glb`) — gak perlu sentuh file/kode di folder ini lagi. Kalau file `.glb`
hasil RealityScan-nya masih ditemenin `.png` terpisah (tekstur belum
ter-*embed*), cek dulu opsi **"Embed Textures" / "Pack Textures into
Binary"** waktu export — kalau tersedia, pakai itu supaya cukup unggah satu
file `.glb` saja tanpa perlu upload manual file PNG-nya.

Kalau suatu model gagal dimuat (tekstur eksternal ilang, geometri korup),
situs otomatis jatuh ke tampilan cadangan (pratinjau AR yang lebih toleran,
lalu placeholder/galeri foto) — tidak pernah bikin halaman error/crash.
