-- ============================================================
-- SKEMA DATABASE — Arsip Lontar (Museum Talaga Manggung)
-- Jalankan seluruh isi file ini di Supabase Dashboard:
--   SQL Editor → New query → tempel → Run
-- ============================================================

-- Migrasi: tabel "arsip" (transkripsi teks terpisah) sudah tidak
-- dipakai — "Arsip" sekarang ditampilkan langsung dari tabel naskah.
-- Aman dijalankan meski tabelnya belum pernah dibuat.
drop table if exists public.arsip cascade;

-- ── Tabel ──────────────────────────────────────────────────
create table if not exists public.naskah (
  id         text primary key,
  title      text,
  published  boolean default true,
  data       jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.koleksi (
  slug       text primary key,
  name       text,
  data       jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Satu baris (id='global') buat pengaturan SEO situs — meta title/desc
-- & identitas organisasi buat schema.org.
create table if not exists public.settings (
  id         text primary key,
  data       jsonb not null,
  updated_at timestamptz default now()
);

-- ── Row Level Security ─────────────────────────────────────
alter table public.naskah   enable row level security;
alter table public.koleksi  enable row level security;
alter table public.settings enable row level security;

-- Publik boleh MEMBACA (halaman situs, termasuk generateMetadata SSR)
drop policy if exists "public read naskah"   on public.naskah;
drop policy if exists "public read koleksi"  on public.koleksi;
drop policy if exists "public read settings" on public.settings;
create policy "public read naskah"   on public.naskah   for select using (true);
create policy "public read koleksi"  on public.koleksi  for select using (true);
create policy "public read settings" on public.settings for select using (true);

-- Hanya user login (admin) yang boleh MENULIS
drop policy if exists "auth write naskah"   on public.naskah;
drop policy if exists "auth write koleksi"  on public.koleksi;
drop policy if exists "auth write settings" on public.settings;
create policy "auth write naskah"   on public.naskah   for all to authenticated using (true) with check (true);
create policy "auth write koleksi"  on public.koleksi  for all to authenticated using (true) with check (true);
create policy "auth write settings" on public.settings for all to authenticated using (true) with check (true);

-- ── Grants — RLS policies ga cukup, role anon/authenticated juga perlu
-- diberi hak akses tabel di level Postgres. Tabel yang dibuat lewat SQL
-- Editor (bukan Table Editor UI) tidak otomatis dapat grant ini, makanya
-- perlu ditulis eksplisit — tanpa ini muncul error "permission denied
-- for table naskah/koleksi/settings" meski RLS policy di atas sudah benar.
grant usage on schema public to anon, authenticated;
grant select on public.naskah, public.koleksi, public.settings to anon, authenticated;
grant insert, update, delete on public.naskah, public.koleksi, public.settings to authenticated;

-- ── Storage: bucket "media" untuk gambar ───────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Publik boleh melihat gambar; user login boleh mengunggah/mengubah/menghapus
drop policy if exists "public read media"   on storage.objects;
drop policy if exists "auth write media"    on storage.objects;
create policy "public read media" on storage.objects
  for select using (bucket_id = 'media');
create policy "auth write media" on storage.objects
  for all to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');
