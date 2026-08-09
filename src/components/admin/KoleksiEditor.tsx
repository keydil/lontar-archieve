'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Artifact, MediaItem } from '@/data/koleksi'
import { uid, slugify, useCMS } from '@/lib/cms'
import { Image as ImageIcon, Save, Trash2, Star, BookOpen } from 'lucide-react'
import { KoleksiModelUpload, KoleksiAddPhotoButton, KoleksiVideoSlot } from './koleksi/KoleksiUploads'
import QRCodeButton from './QRCodeButton'
import { toast } from './Feedback'

export function blankKoleksi(): KoleksiForm {
  return {
    slug: '',
    name: '',
    year: '',
    type: '',
    category: '',
    material: '',
    dimensions: '',
    artist: 'Unknown',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Pamer Utama',
    description_id: '',
    description_en: '',
  }
}

type KoleksiForm = Artifact

// ── Field/Input lokal — dipakai khusus di sini biar gak nyentuh AdminUI
// yang dipakai bareng NaskahEditor (skopnya redesain koleksi doang). ──
function KField({ label, hint, error, required, children }: { label: string; hint?: string; error?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-[#3D3730] mb-1">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      {children}
      {error ? (
        <span className="block text-[11px] font-bold text-red-700 mt-1">⚠ {error}</span>
      ) : hint ? (
        <span className="block text-[11px] text-[#8A8172] mt-1 leading-relaxed">{hint}</span>
      ) : null}
    </label>
  )
}

const inputCls = (invalid?: boolean) =>
  `w-full p-2.5 bg-[#F9F6EE] border rounded-sm text-xs text-[#2C2825] outline-none focus:border-[#8A7144] ${
    invalid ? 'border-red-400 bg-red-50' : 'border-[#DCD3C1]'
  }`

export default function KoleksiEditor({
  initial,
  isNew,
  onSave,
  onCancel,
  onDirtyChange,
}: {
  initial: KoleksiForm
  isNew: boolean
  onSave: (a: Artifact) => void
  onCancel: () => void
  onDirtyChange?: (dirty: boolean) => void
}) {
  const [item, setItem] = useState<KoleksiForm>(initial)
  const [errors, setErrors] = useState<{ name?: string; slug?: string }>({})
  const nameInputRef = useRef<HTMLInputElement>(null)
  const slugInputRef = useRef<HTMLInputElement>(null)
  const patch = (p: Partial<KoleksiForm>) => setItem((i) => ({ ...i, ...p }))

  // Kategori resmi diambil dari kategori yang beneran udah dipakai di data
  // (bukan daftar tetap) — biar gak pernah nyimpang dari taksonomi asli
  // yang dipakai buat filter pill di halaman publik.
  const { data } = useCMS()
  const categoryOptions = useMemo(() => {
    const set = new Set<string>()
    for (const a of data.koleksi) {
      if (a.category) set.add(a.category)
    }
    if (item.category) set.add(item.category)
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'id'))
  }, [data.koleksi, item.category])

  const isDirty = JSON.stringify(item) !== JSON.stringify(initial)
  useEffect(() => {
    onDirtyChange?.(isDirty)
    return () => onDirtyChange?.(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty])

  function handleSave() {
    const next: typeof errors = {}
    if (!item.name.trim()) next.name = 'Wajib diisi — ini nama yang akan tampil di situs.'
    const slug = isNew ? slugify(item.slug || item.name) : item.slug
    if (!slug) next.slug = 'Slug tidak valid — pakai huruf, angka, dan tanda strip (-) saja.'
    setErrors(next)

    if (Object.keys(next).length > 0) {
      toast('Masih ada yang perlu dilengkapi — lihat tanda merah di bawah.', 'error')
      const target = next.name ? nameInputRef.current : slugInputRef.current
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      target?.focus()
      return
    }
    onSave({ ...item, slug })
  }

  const rotation = item.modelRotation ?? [-90, 0, 0]

  // Foto & video dipisah dari array `media` mentah biar UI-nya jelas —
  // galeri foto (bebas berapa aja, sampulnya ditandain bintang) di kiri,
  // video (satu slot doang) gabung sama 3D di kanan.
  const media = item.media ?? []
  const photoEntries = media.map((m, idx) => ({ m, idx })).filter((e) => e.m.type === 'image')
  const videoEntry = media.map((m, idx) => ({ m, idx })).find((e) => e.m.type === 'video')

  function updateMediaAt(idx: number, p: Partial<MediaItem>) {
    const next = [...media]
    next[idx] = { ...next[idx], ...p }
    patch({ media: next })
  }
  function removeMediaAt(idx: number) {
    patch({ media: media.filter((_, i) => i !== idx) })
  }
  function addPhoto(url: string) {
    const newItem: MediaItem = { id: uid('media'), type: 'image', url, caption: '' }
    const isFirstPhoto = photoEntries.length === 0
    patch({
      media: [...media, newItem],
      ...(isFirstPhoto && !item.thumbnail ? { thumbnail: url } : {}),
    })
  }
  function setVideoField(fields: Partial<MediaItem> | null) {
    if (fields === null) {
      if (videoEntry) removeMediaAt(videoEntry.idx)
      return
    }
    if (videoEntry) {
      updateMediaAt(videoEntry.idx, fields)
    } else {
      const newItem: MediaItem = { id: uid('media'), type: 'video', url: '', caption: '', thumbnail: '', ...fields }
      patch({ media: [...media, newItem] })
    }
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#FFFDF9] p-5 border border-[#DCD3C1] rounded-sm shadow-sm">
        <div>
          <h2 className="text-2xl font-['Playfair_Display',serif] font-bold text-[#1A1816]">
            {isNew ? 'Tambah Artefak Baru' : `Edit Artefak: ${item.name || initial.name}`}
          </h2>
          <p className="text-xs text-[#6B5E4C]">Lengkapi metadata, foto, model 3D, dan deskripsi artefak.</p>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <QRCodeButton
              url={typeof window !== 'undefined' ? `${window.location.origin}/koleksi/${item.slug}` : ''}
              filename={item.slug}
              label="QR Kode"
            />
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[#EAE3D3] hover:bg-[#DDD2BA] text-[#4A433A] font-semibold text-xs rounded-sm transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#8A7144] hover:bg-[#725C34] text-white font-semibold text-xs rounded-sm transition-all cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            Simpan Artefak
          </button>
        </div>
      </div>

      {/* Section 1: Metadata */}
      <div className="bg-[#FFFDF9] p-6 border border-[#DCD3C1] rounded-sm shadow-sm space-y-4">
        <div className="border-b border-[#EAE3D3] pb-3">
          <h3 className="text-xl font-['Playfair_Display',serif] font-bold text-[#1A1816]">1. Informasi Metadata</h3>
          <p className="text-xs text-[#6B5E4C] mt-0.5">Identitas fisik, era, dan asal artefak.</p>
        </div>

        <KField label="Nama Artefak / Benda Pusaka" required error={errors.name}>
          <input
            ref={nameInputRef}
            value={item.name}
            onChange={(e) => {
              patch({ name: e.target.value })
              if (errors.name) setErrors((er) => ({ ...er, name: undefined }))
            }}
            placeholder="Contoh: Mahkota Emas Kraton"
            className={inputCls(!!errors.name)}
          />
        </KField>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KField label="Slug (URL)" error={errors.slug} hint={isNew ? 'Kosongkan = otomatis dari nama.' : 'Gak bisa diubah.'}>
            <input
              ref={slugInputRef}
              value={item.slug}
              disabled={!isNew}
              onChange={(e) => {
                patch({ slug: e.target.value })
                if (errors.slug) setErrors((er) => ({ ...er, slug: undefined }))
              }}
              placeholder="mahkota-emas-kraton"
              className={inputCls(!!errors.slug) + (!isNew ? ' opacity-60 cursor-not-allowed' : '')}
            />
          </KField>

          <KField label="Kategori">
            <input
              list="kategori-koleksi-list"
              value={item.category}
              onChange={(e) => patch({ category: e.target.value })}
              placeholder="Arca Perunggu"
              className={inputCls()}
            />
            <datalist id="kategori-koleksi-list">
              {categoryOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </KField>

          <KField label="Era / Periode">
            <input value={item.year} onChange={(e) => patch({ year: e.target.value })} placeholder="Abad ke-14" className={inputCls()} />
          </KField>

          <KField label="Jenis (Type)">
            <input value={item.type} onChange={(e) => patch({ type: e.target.value })} placeholder="Keris / Genta / Arca" className={inputCls()} />
          </KField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KField label="Material">
            <input value={item.material} onChange={(e) => patch({ material: e.target.value })} placeholder="Perunggu, Emas & Permata" className={inputCls()} />
          </KField>
          <KField label="Dimensi">
            <input value={item.dimensions} onChange={(e) => patch({ dimensions: e.target.value })} placeholder="Tinggi 20 cm" className={inputCls()} />
          </KField>
          <KField label="Pengrajin / Asal">
            <input value={item.artist} onChange={(e) => patch({ artist: e.target.value })} placeholder="Pengrajin Kerajaan Talaga Manggung" className={inputCls()} />
          </KField>
          <KField label="Negara">
            <input value={item.country} onChange={(e) => patch({ country: e.target.value })} placeholder="Indonesia" className={inputCls()} />
          </KField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KField label="Ruang Pamer">
            <input value={item.location ?? ''} onChange={(e) => patch({ location: e.target.value })} placeholder="Ruang Pamer Utama" className={inputCls()} />
          </KField>
          <KField label="Lokasi Penyimpanan / Alamat">
            <input value={item.address} onChange={(e) => patch({ address: e.target.value })} placeholder="Museum Talaga Manggung, Majalengka" className={inputCls()} />
          </KField>
        </div>
      </div>

      {/* Section 2: Media — foto, 3D, video kepisah, bukan satu array
          generik. Sampul katalog ditandain lewat bintang di galeri foto
          (gak ada lagi upload "gambar kartu" yang terpisah/ambigu). */}
      <div className="bg-[#FFFDF9] p-6 border border-[#DCD3C1] rounded-sm shadow-sm space-y-5">
        <div className="border-b border-[#EAE3D3] pb-3">
          <h3 className="text-xl font-['Playfair_Display',serif] font-bold text-[#1A1816] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#8A7144]" />
            2. Media Visual (Foto, 3D, Video)
          </h3>
          <p className="text-xs text-[#6B5E4C] mt-0.5">
            Klik ikon bintang di foto buat jadiin sampul katalog.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kiri: galeri foto */}
          <div className="bg-[#F9F6EE] p-4 border border-[#D5C9B2] rounded-sm space-y-3">
            <span className="text-xs font-bold text-[#1A1816] block pb-2 border-b border-[#D5C9B2]">
              Galeri Foto ({photoEntries.length})
            </span>

            {photoEntries.length === 0 && (
              <p className="text-[11px] text-[#8A8172] italic">Belum ada foto.</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              {photoEntries.map(({ m, idx }) => {
                const isCover = !!m.url && m.url === item.thumbnail
                return (
                  <div key={m.id} className={`p-2 bg-[#FFFDF9] border rounded-sm space-y-1.5 ${isCover ? 'border-[#8A7144] ring-1 ring-[#8A7144]/40' : 'border-[#DCD3C1]'}`}>
                    <div className="relative w-full h-24 bg-[#EAE3D3] rounded-sm overflow-hidden">
                      {m.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-[10px] text-[#B0A798]">Kosong</span>
                      )}
                      {isCover && (
                        <span className="absolute top-0 left-0 bg-[#8A7144] text-[#FFD700] p-1 rounded-br-sm shadow-sm" title="Sampul katalog">
                          <Star className="w-3.5 h-3.5 fill-[#FFD700]" />
                        </span>
                      )}
                    </div>
                    <input
                      value={m.caption ?? ''}
                      onChange={(e) => updateMediaAt(idx, { caption: e.target.value })}
                      placeholder="Keterangan foto (mis. Detail Ukiran)…"
                      className="w-full text-[11px] px-1.5 py-1 bg-transparent border-b border-[#DCD3C1] focus:border-[#8A7144] outline-none"
                    />
                    <div className="flex items-center justify-between pt-0.5">
                      {isCover ? (
                        <span className="text-[10px] font-bold text-[#8A7144]">★ Sampul</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => patch({ thumbnail: m.url })}
                          title="Jadikan sampul katalog"
                          className="p-1 text-[#8A7144] hover:bg-[#F3EFE4] rounded-sm cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeMediaAt(idx)}
                        title="Hapus foto"
                        className="p-1 text-red-600 hover:bg-red-50 rounded-sm cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <KoleksiAddPhotoButton onAdd={addPhoto} />
          </div>

          {/* Kanan: model 3D + video (satu slot) */}
          <div className="space-y-4">
            <KoleksiModelUpload
              value={item.modelUrl}
              onChange={(url) => patch({ modelUrl: url })}
              rotation={rotation}
              onRotationChange={(r) => patch({ modelRotation: r })}
              enabled={item.modelEnabled !== false}
              onEnabledChange={(v) => patch({ modelEnabled: v })}
            />
            <KoleksiVideoSlot
              active={!!videoEntry}
              videoSource={videoEntry?.m.videoSource ?? 'youtube'}
              youtubeUrl={videoEntry?.m.youtubeUrl ?? ''}
              fileUrl={videoEntry?.m.url ?? ''}
              caption={videoEntry?.m.caption}
              enabled={videoEntry?.m.enabled !== false}
              onEnabledChange={(v) => videoEntry && updateMediaAt(videoEntry.idx, { enabled: v })}
              onChange={setVideoField}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Deskripsi + pratinjau SERP */}
      <div className="bg-[#FFFDF9] p-6 border border-[#DCD3C1] rounded-sm shadow-sm space-y-4">
        <div className="border-b border-[#EAE3D3] pb-3">
          <h3 className="text-xl font-['Playfair_Display',serif] font-bold text-[#1A1816] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#8A7144]" />
            3. Deskripsi
          </h3>
          <p className="text-xs text-[#6B5E4C] mt-0.5">Narasi yang tampil di halaman detail publik.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <KField label="Deskripsi (Indonesia)">
            <textarea
              rows={5}
              value={item.description_id}
              onChange={(e) => patch({ description_id: e.target.value })}
              className={inputCls() + ' leading-relaxed'}
            />
          </KField>
          <KField label="Deskripsi (English)">
            <textarea
              rows={5}
              value={item.description_en}
              onChange={(e) => patch({ description_en: e.target.value })}
              className={inputCls() + ' leading-relaxed'}
            />
          </KField>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-sm space-y-1.5 font-sans">
          <span className="text-xs text-[#202124] block truncate font-mono">
            artefak.museumtalagamanggung.com › koleksi › {item.slug || 'nama-artefak'}
          </span>
          <h4 className="text-base text-[#1a0dab] font-medium truncate">
            {item.name || 'Nama Artefak'} — Museum Talaga Manggung
          </h4>
          <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
            {item.description_id || `Koleksi bersejarah dari era ${item.year || '—'}. Pelajari nilai sejarah dan model 3D interaktif di Museum Talaga Manggung.`}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-[#EAE3D3] hover:bg-[#DDD2BA] text-[#4A433A] font-semibold text-xs rounded-sm transition-colors cursor-pointer"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#8A7144] hover:bg-[#725C34] text-white font-semibold text-xs rounded-sm transition-all cursor-pointer shadow-sm"
        >
          <Save className="w-4 h-4" />
          Simpan Artefak
        </button>
      </div>
    </div>
  )
}
