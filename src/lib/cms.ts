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
import type { Artifact, MediaItem } from '@/data/koleksi'
import { naskahSeed } from '@/data/naskah'
import type { LontarNaskah, LontarVerse } from '@/data/naskah'
import { defaultSettings } from '@/data/settings'
import type { SiteSettings } from '@/data/settings'

export type { Artifact, LontarNaskah, SiteSettings }

export interface CMSData {
  koleksi: Artifact[]
  naskah: LontarNaskah[]
}

// Nama tabel di Supabase
const T_NASKAH = 'naskah'
const T_KOLEKSI = 'koleksi'
const T_SETTINGS = 'settings'

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x))
}

// ============================================================
// NORMALIZE — kompatibilitas data lama.
//
// Data di Supabase disimpan sebagai jsonb apa adanya, jadi baris yang
// ditulis sebelum struktur berubah tetap memakai bentuk lama. Semua
// penyesuaian dilakukan SAAT BACA supaya tidak ada data yang "hilang"
// dari tampilan, dan ikut tersimpan dalam bentuk baru begitu pengelola
// menyimpan ulang lewat panel admin.
//
// Bentuk lama yang ditangani:
//  · naskah: `verses[]` + `scanImages[]` flat  → struktur `lembar[]`
//  · naskah: `media[]` (foto/video/glb)        → `images[]` (foto saja)
//  · koleksi: `images[]` (array string)        → `media[]` (MediaItem)
//  · koleksi: media bertipe `glb`              → dibuang, 3D pakai modelUrl
// ============================================================
type LegacyMedia = { id?: string; type?: string; url?: string; caption?: string; thumbnail?: string }

function normalizeNaskah(raw: unknown): LontarNaskah {
  const n = raw as LontarNaskah & {
    verses?: LontarVerse[]
    scanImages?: string[]
    media?: LegacyMedia[]
  }
  const { verses, scanImages, media, ...rest } = n

  // Galeri lama (media[]) → foto saja. Video/glb tidak dipakai di naskah,
  // tapi URL-nya tetap diambil kalau itu gambar supaya tidak hilang.
  let images = Array.isArray(rest.images) ? [...rest.images] : []
  if (Array.isArray(media)) {
    const fromMedia = media
      .filter((m) => m && (m.type === 'image' || !m.type) && typeof m.url === 'string' && m.url)
      .map((m) => m.url as string)
    images = [...images, ...fromMedia.filter((u) => !images.includes(u))]
  }

  // Struktur lama: ayat & scan masih flat di level naskah.
  let lembar = rest.lembar
  if (!Array.isArray(lembar)) {
    lembar = [
      { id: uid('lembar'), lembarNumber: 1, scanImage: scanImages?.[0], verses: verses ?? [] },
    ]
    // Sisa scan (selain yang dipakai lembar 1) diselamatkan ke galeri foto
    // supaya tidak ada gambar yang hilang begitu saja.
    for (const extra of (scanImages ?? []).slice(1)) {
      if (!images.includes(extra)) images.push(extra)
    }
  }

  return { ...rest, images, lembar } as LontarNaskah
}

function normalizeKoleksi(raw: unknown): Artifact {
  // Sengaja dibaca sebagai bentuk mentah: baris lama bisa memuat tipe
  // media yang sudah tidak ada lagi di definisi Artifact (mis. 'glb').
  const k = raw as Omit<Artifact, 'media'> & { images?: unknown; media?: LegacyMedia[] }
  const { images, media: rawMedia, ...rest } = k

  const media: MediaItem[] = []
  const seen = new Set<string>()
  const push = (url: string, item?: LegacyMedia) => {
    if (!url || seen.has(url)) return
    seen.add(url)
    media.push({
      id: item?.id || uid('media'),
      // `glb` lama diturunkan jadi gambar hanya bila ada thumbnail-nya;
      // kalau tidak, entri itu dilewati (3D sudah diwakili modelUrl).
      type: item?.type === 'video' ? 'video' : 'image',
      url,
      caption: item?.caption,
      thumbnail: item?.thumbnail,
    })
  }

  for (const m of rawMedia ?? []) {
    if (!m || typeof m.url !== 'string') continue
    if (m.type === 'glb') {
      if (m.thumbnail) push(m.thumbnail, { ...m, type: 'image', thumbnail: undefined })
      continue
    }
    push(m.url, m)
  }
  // Bentuk paling lama: images sebagai array string biasa.
  if (Array.isArray(images)) {
    for (const url of images) if (typeof url === 'string') push(url)
  }

  // Kartu koleksi butuh gambar; pakai foto pertama kalau belum diset.
  const thumbnail = rest.thumbnail || media.find((m) => m.type === 'image')?.url

  // modelUrl (Cloudflare R2) & modelRotation disimpan apa adanya di record —
  // gak ada lagi lookup ke file lokal/seed, semua sumbernya dari Supabase.
  const modelRotation = rest.modelRotation ?? [0, 0, 0]

  return { ...rest, modelRotation, thumbnail, media } as Artifact
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
  const koleksi = k.error ? seed.koleksi : (k.data ?? []).map((r) => normalizeKoleksi(r.data))

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
  return normalizeKoleksi(data.data)
}

// ============================================================
// PENGATURAN SEO — satu baris (id='global'), dipakai form admin.
// Versi buat generateMetadata (server, SSR) ada terpisah di
// src/lib/settings-server.ts karena file ini 'use client'.
// ============================================================
export async function getSettings(): Promise<SiteSettings> {
  if (!supabaseConfigured) return defaultSettings
  const { data, error } = await supabase.from(T_SETTINGS).select('data').eq('id', 'global').maybeSingle()
  if (error || !data) return defaultSettings
  return { ...defaultSettings, ...(data.data as Partial<SiteSettings>) }
}

export async function upsertSettings(next: SiteSettings) {
  await requireConfigured()
  const { error } = await supabase.from(T_SETTINGS).upsert({ id: 'global', data: next })
  if (error) throw error
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
    for (const k of parsed.koleksi ?? []) await upsertKoleksi(normalizeKoleksi(k))
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

// ============================================================
// MODEL 3D UPLOAD — file `.glb` gak lewat Supabase Storage (kuota
// kekecilan buat file ratusan MB), tapi ke Cloudflare R2 lewat
// presigned URL (lihat /api/models/presign). Browser PUT LANGSUNG
// ke B2, server kita cuma nerbitin izinnya — jadi gak kena limit
// ukuran/durasi Vercel serverless function.
// ============================================================
// Cek cepat (baca JSON chunk doang, gak pakai gltf-transform) apakah
// .glb ini merujuk tekstur file terpisah (bukan ter-embed). Hasil
// export mentah RealityScan sering begini — browser gak bisa nyusul
// ambil file PNG-nya sendiri (cuma file .glb yang dipilih admin),
// jadi kalau diupload apa adanya, model bakal tampil TANPA tekstur.
export async function getExternalTextureUris(file: File): Promise<string[]> {
  try {
    const buffer = await file.arrayBuffer()
    const view = new DataView(buffer)
    if (view.getUint32(0, true) !== 0x46546c67) return [] // bukan .glb valid, biarin proses normal yang nangkep errornya
    const jsonLen = view.getUint32(12, true)
    const json = JSON.parse(new TextDecoder().decode(buffer.slice(20, 20 + jsonLen)))
    const images = (json.images ?? []) as { uri?: string }[]
    return images.map((img) => img.uri).filter((uri): uri is string => Boolean(uri) && !uri!.startsWith('data:'))
  } catch {
    return []
  }
}

// Kompres tekstur .glb di Web Worker sebelum upload (jalan di thread
// terpisah biar tab gak freeze). Kalau gagal (bentuk .glb gak biasa,
// dll), fallback ke file asli apa adanya — optimasi ini best-effort,
// jangan sampai gagalnya nge-block upload.
function optimizeModelInBrowser(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    file.arrayBuffer().then((buffer) => {
      const worker = new Worker(new URL('../workers/optimizeModel.worker.ts', import.meta.url))
      const cleanup = () => worker.terminate()
      worker.onmessage = (e: MessageEvent<{ ok: boolean; buffer?: ArrayBuffer; error?: string }>) => {
        cleanup()
        if (e.data.ok && e.data.buffer) {
          resolve(new Blob([e.data.buffer], { type: 'model/gltf-binary' }))
        } else {
          console.warn('[uploadModel] Optimasi tekstur dilewati:', e.data.error)
          resolve(file)
        }
      }
      worker.onerror = (err) => {
        cleanup()
        console.warn('[uploadModel] Worker optimasi gagal, pakai file asli:', err.message)
        resolve(file)
      }
      worker.postMessage({ buffer, name: file.name }, [buffer])
    })
  })
}

export async function uploadModel(
  file: File,
  onProgress?: (pct: number) => void,
  onPhase?: (phase: 'optimizing' | 'uploading') => void,
): Promise<string> {
  await requireConfigured()
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) throw new Error('Belum login.')

  onPhase?.('optimizing')
  const uploadBlob = await optimizeModelInBrowser(file)

  const presignRes = await fetch('/api/models/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ filename: file.name }),
  })
  if (!presignRes.ok) {
    const body = await presignRes.json().catch(() => ({}))
    throw new Error(body.error || 'Gagal menyiapkan upload.')
  }
  const { uploadUrl, publicUrl } = await presignRes.json() as { uploadUrl: string; publicUrl: string }

  onPhase?.('uploading')
  // XHR (bukan fetch) supaya bisa lapor progress — penting buat file
  // ratusan MB yang bisa makan waktu lama.
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', 'model/gltf-binary')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload gagal (${xhr.status}).`)))
    xhr.onerror = () => reject(new Error('Upload gagal — periksa koneksi internet.'))
    xhr.send(uploadBlob)
  })

  return publicUrl
}

// Upload video dokumentasi — presign yang sama kayak model 3D (satu API
// route ngelayanin .glb dan video), tapi tanpa langkah optimasi tekstur
// yang emang khusus GLB.
export async function uploadVideo(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  await requireConfigured()
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) throw new Error('Belum login.')

  const presignRes = await fetch('/api/models/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ filename: file.name }),
  })
  if (!presignRes.ok) {
    const body = await presignRes.json().catch(() => ({}))
    throw new Error(body.error || 'Gagal menyiapkan upload.')
  }
  const { uploadUrl, publicUrl } = await presignRes.json() as { uploadUrl: string; publicUrl: string }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload gagal (${xhr.status}).`)))
    xhr.onerror = () => reject(new Error('Upload gagal — periksa koneksi internet.'))
    xhr.send(file)
  })

  return publicUrl
}
