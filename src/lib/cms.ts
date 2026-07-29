'use client'

// ============================================================
// CMS STORE — sumber data tunggal untuk situs (backend: Supabase)
//
// Halaman publik MEMBACA data (anon key, RLS public read).
// Panel Admin MENULIS data (harus login — Supabase Auth).
// Gambar disimpan di Supabase Storage (bucket "media").
//
// Bila Supabase belum dikonfigurasi / tabel masih kosong, halaman
// otomatis fallback ke data seed di src/data/* agar situs tak kosong.
// ============================================================

import { useCallback, useEffect, useState } from 'react'
import { supabase, supabaseConfigured, MEDIA_BUCKET } from './supabase'
import { artifacts as koleksiSeed } from '@/data/koleksi'
import type { Artifact } from '@/data/koleksi'
import { naskahSeed } from '@/data/naskah'
import type { LontarNaskah, LontarVerse } from '@/data/naskah'

export type { Artifact, LontarNaskah }

export interface CMSData {
  koleksi: Artifact[]
  naskah: LontarNaskah[]
}

// Nama tabel di Supabase
const T_NASKAH = 'naskah'
const T_KOLEKSI = 'koleksi'

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x))
}

// ============================================================
// NORMALIZE — kompatibilitas data lama (verses[] + scanImages[]
// flat, sebelum struktur Buku → Lembar/Halaman). Data baru sudah
// punya `lembar`, jadi fungsi ini cuma dijalankan untuk data lama
// yang mungkin masih ada di Supabase / file backup JSON.
// ============================================================
function normalizeNaskah(raw: unknown): LontarNaskah {
  const n = raw as LontarNaskah & { verses?: LontarVerse[]; scanImages?: string[] }
  if (Array.isArray(n.lembar)) return n
  const { verses, scanImages, ...rest } = n
  return {
    ...rest,
    lembar: [
      { id: uid('lembar'), lembarNumber: 1, scanImage: scanImages?.[0], verses: verses ?? [] },
    ],
  } as LontarNaskah
}

export function seedData(): CMSData {
  return {
    koleksi: clone(koleksiSeed),
    naskah: clone(naskahSeed),
  }
}

// ── pub/sub agar semua komponen refetch saat data berubah ──
const listeners = new Set<() => void>()
function emit() {
  listeners.forEach((l) => l())
}

// ============================================================
// FETCH — ambil semua data dari Supabase (dengan fallback seed)
// ============================================================
export async function fetchAll(): Promise<CMSData> {
  if (!supabaseConfigured) return seedData()

  const [n, k] = await Promise.all([
    supabase.from(T_NASKAH).select('data').order('created_at', { ascending: true }),
    supabase.from(T_KOLEKSI).select('data').order('created_at', { ascending: true }),
  ])

  const seed = seedData()

  // Bila query error (mis. tabel belum dibuat), fallback ke seed.
  const naskah = n.error ? seed.naskah : (n.data ?? []).map((r) => normalizeNaskah(r.data))
  const koleksi = k.error ? seed.koleksi : (k.data ?? []).map((r) => r.data as Artifact)

  // Fallback per-tabel bila kosong (belum di-seed) supaya situs tak blank.
  return {
    naskah: naskah.length ? naskah : seed.naskah,
    koleksi: koleksi.length ? koleksi : seed.koleksi,
  }
}

// ============================================================
// REACT HOOK — dipakai halaman publik & admin
// SSR-safe: render pertama pakai seed, lalu fetch dari Supabase.
// ============================================================
export function useCMS() {
  const [data, setData] = useState<CMSData>(seedData)
  const [hydrated, setHydrated] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const next = await fetchAll()
      setData(next)
    } catch {
      /* biarkan data lama */
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    refresh()
    listeners.add(refresh)
    return () => {
      listeners.delete(refresh)
    }
  }, [refresh])

  return { data, hydrated, refresh }
}

// ============================================================
// MUTATIONS (butuh login/authenticated — RLS)
// ============================================================
async function requireConfigured() {
  if (!supabaseConfigured) {
    throw new Error('Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL & ANON_KEY di .env.')
  }
}

// -- Naskah (PK: id) --
export async function upsertNaskah(item: LontarNaskah) {
  await requireConfigured()
  const { error } = await supabase.from(T_NASKAH).upsert({
    id: item.id,
    title: item.title,
    published: item.published ?? true,
    data: item,
  })
  if (error) throw error
  emit()
}
export async function deleteNaskah(id: string) {
  await requireConfigured()
  const { error } = await supabase.from(T_NASKAH).delete().eq('id', id)
  if (error) throw error
  emit()
}

// -- Koleksi (PK: slug) --
export async function upsertKoleksi(item: Artifact) {
  await requireConfigured()
  const { error } = await supabase.from(T_KOLEKSI).upsert({
    slug: item.slug,
    name: item.name,
    data: item,
  })
  if (error) throw error
  emit()
}
export async function deleteKoleksi(slug: string) {
  await requireConfigured()
  const { error } = await supabase.from(T_KOLEKSI).delete().eq('slug', slug)
  if (error) throw error
  emit()
}

// ── getter async untuk halaman detail berbasis slug/id ──
export async function getKoleksiBySlug(slug: string): Promise<Artifact | undefined> {
  if (!supabaseConfigured) return seedData().koleksi.find((k) => k.slug === slug)
  const { data, error } = await supabase.from(T_KOLEKSI).select('data').eq('slug', slug).maybeSingle()
  if (error || !data) return seedData().koleksi.find((k) => k.slug === slug)
  return data.data as Artifact
}

// ============================================================
// SEED / EXPORT / IMPORT — untuk tab Data & Backup di admin
// ============================================================
export async function seedIntoDatabase() {
  await requireConfigured()
  const seed = seedData()
  const errs: string[] = []
  for (const n of seed.naskah) {
    const { error } = await supabase.from(T_NASKAH).upsert({ id: n.id, title: n.title, published: n.published ?? true, data: n })
    if (error) errs.push(error.message)
  }
  for (const k of seed.koleksi) {
    const { error } = await supabase.from(T_KOLEKSI).upsert({ slug: k.slug, name: k.name, data: k })
    if (error) errs.push(error.message)
  }
  emit()
  if (errs.length) throw new Error(errs.join('; '))
}

export async function exportJSON(): Promise<string> {
  return JSON.stringify(await fetchAll(), null, 2)
}

export async function importJSON(json: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const parsed = JSON.parse(json) as Partial<CMSData>
    for (const n of parsed.naskah ?? []) await upsertNaskah(normalizeNaskah(n))
    for (const k of parsed.koleksi ?? []) await upsertKoleksi(k)
    emit()
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ============================================================
// HELPERS
// ============================================================
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

// ============================================================
// IMAGE UPLOAD — kompres lalu unggah ke Supabase Storage,
// kembalikan URL publik. (Butuh login — RLS storage.)
// ============================================================
function compress(file: File, maxDim = 1600, quality = 0.78): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas gagal'))
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Kompresi gagal'))), 'image/jpeg', quality)
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function uploadImage(file: File): Promise<string> {
  await requireConfigured()
  const blob = await compress(file)
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
