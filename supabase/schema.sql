-- ============================================================
-- SKEMA DATABASE — Arsip Lontar (Museum Talaga Manggung)
-- Jalankan seluruh isi file ini di Supabase Dashboard:
--   SQL Editor → New query → tempel → Run
-- ============================================================

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

create table if not exists public.arsip (
  slug       text primary key,
  title      text,
  data       jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Row Level Security ─────────────────────────────────────
alter table public.naskah  enable row level security;
alter table public.koleksi enable row level security;
alter table public.arsip   enable row level security;

-- Publik boleh MEMBACA (halaman situs)
drop policy if exists "public read naskah"  on public.naskah;
drop policy if exists "public read koleksi" on public.koleksi;
drop policy if exists "public read arsip"   on public.arsip;
create policy "public read naskah"  on public.naskah  for select using (true);
create policy "public read koleksi" on public.koleksi for select using (true);
create policy "public read arsip"   on public.arsip   for select using (true);

-- Hanya user login (admin) yang boleh MENULIS
drop policy if exists "auth write naskah"  on public.naskah;
drop policy if exists "auth write koleksi" on public.koleksi;
drop policy if exists "auth write arsip"   on public.arsip;
create policy "auth write naskah"  on public.naskah  for all to authenticated using (true) with check (true);
create policy "auth write koleksi" on public.koleksi for all to authenticated using (true) with check (true);
create policy "auth write arsip"   on public.arsip   for all to authenticated using (true) with check (true);

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
