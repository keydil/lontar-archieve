'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Artifact, MediaItem } from '@/data/koleksi'
import { uid, slugify, useCMS } from '@/lib/cms'
import { Field, Input, Textarea, Select, Button, Card, SectionTitle, ImageUpload, ModelUpload } from './AdminUI'
import QRCodeButton from './QRCodeButton'
import { toast } from './Feedback'

const mono = "'DM Mono', monospace"

function emptyMedia(): MediaItem {
  return { id: uid('media'), type: 'image', url: '', caption: '', thumbnail: '' }
}

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

  // Lapor ke parent kalau ada perubahan belum disimpan (dipakai buat
  // nge-warn sebelum pindah tab/halaman).
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 900 }}>
          {isNew ? 'Koleksi / Artefak Baru' : 'Edit Artefak'}
        </span>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {!isNew && (
            <QRCodeButton
              url={typeof window !== 'undefined' ? `${window.location.origin}/koleksi/${item.slug}` : ''}
              filename={item.slug}
              label="QR Kode"
            />
          )}
          <Button variant="outline" onClick={onCancel}>Batal</Button>
          <Button variant="solid" onClick={handleSave}>✓ Simpan</Button>
        </div>
      </div>

      <SectionTitle>Informasi Artefak</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
        <Field label="Nama Artefak" required error={errors.name}>
          <Input
            ref={nameInputRef}
            value={item.name}
            invalid={!!errors.name}
            onChange={(e) => {
              patch({ name: e.target.value })
              if (errors.name) setErrors((er) => ({ ...er, name: undefined }))
            }}
            placeholder="Naskah Lontar Sunda Kuno"
          />
        </Field>
        <Field
          label="Slug (URL)"
          hint={isNew ? 'Kosongkan untuk otomatis dari nama.' : 'Tidak bisa diubah setelah dibuat.'}
          error={errors.slug}
        >
          <Input
            ref={slugInputRef}
            value={item.slug}
            disabled={!isNew}
            invalid={!!errors.slug}
            onChange={(e) => {
              patch({ slug: e.target.value })
              if (errors.slug) setErrors((er) => ({ ...er, slug: undefined }))
            }}
            placeholder="naskah-lontar-01"
          />
        </Field>
        <Field label="Tahun / Periode">
          <Input value={item.year} onChange={(e) => patch({ year: e.target.value })} placeholder="Abad ke-14" />
        </Field>
        <Field label="Kategori">
          <Input
            list="kategori-koleksi-list"
            value={item.category}
            onChange={(e) => patch({ category: e.target.value })}
            placeholder="Arca Perunggu"
          />
          <datalist id="kategori-koleksi-list">
            {categoryOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Jenis (Type)">
          <Input value={item.type} onChange={(e) => patch({ type: e.target.value })} placeholder="Arca Perunggu / Keris / Genta" />
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
        <Field label="Lokasi di Museum">
          <Input value={item.location ?? ''} onChange={(e) => patch({ location: e.target.value })} placeholder="Ruang Pamer Utama" />
        </Field>
        <Field label="Lokasi / Alamat">
          <Input value={item.address} onChange={(e) => patch({ address: e.target.value })} placeholder="Museum Talaga Manggung, Majalengka" />
        </Field>
      </div>

      <SectionTitle>Gambar Kartu &amp; Model 3D</SectionTitle>
      <ImageUpload
        label="Gambar Kartu (JPG/PNG)"
        value={item.thumbnail}
        onChange={(url) => patch({ thumbnail: url })}
      />
      <p style={{ fontFamily: mono, fontSize: '13px', color: 'var(--warm)', marginTop: '-0.75rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
        Foto ini yang tampil di daftar Koleksi. Kalau dikosongkan, dipakai foto pertama dari Galeri Media di bawah.
      </p>
      <ModelUpload value={item.modelUrl} onChange={(url) => patch({ modelUrl: url })} />

      <Field
        label="Rotasi Model (derajat)"
        hint="Kalau model 3D tampil miring atau kebalik — putar sudut X, Y, Z di sini. Bawaan: X=-90, Y=0, Z=0."
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          {(['X', 'Y', 'Z'] as const).map((axis, idx) => (
            <div key={axis}>
              <span style={{ fontFamily: mono, fontSize: '11px', color: 'var(--warm)', display: 'block', marginBottom: '0.3rem' }}>
                {axis}
              </span>
              <Input
                type="number"
                step="5"
                value={(item.modelRotation ?? [-90, 0, 0])[idx]}
                onChange={(e) => {
                  const next: [number, number, number] = [...(item.modelRotation ?? [-90, 0, 0])]
                  next[idx] = parseFloat(e.target.value) || 0
                  patch({ modelRotation: next })
                }}
              />
            </div>
          ))}
        </div>
      </Field>

      <SectionTitle>Deskripsi</SectionTitle>
      <Field label="Deskripsi (Indonesia)">
        <Textarea value={item.description_id} onChange={(e) => patch({ description_id: e.target.value })} style={{ minHeight: '120px' }} />
      </Field>
      <Field label="Deskripsi (English)">
        <Textarea value={item.description_en} onChange={(e) => patch({ description_en: e.target.value })} style={{ minHeight: '120px' }} />
      </Field>

      {/* ── Galeri Media — foto, video, model 3D tambahan ── */}
      <SectionTitle>Galeri Media</SectionTitle>
      <p style={{ fontFamily: mono, fontSize: '13px', color: 'var(--warm)', marginBottom: '1rem', lineHeight: 1.6 }}>
        Dokumentasi artefak: foto detail, video (mis. proses Nyiramkeun), atau model 3D tambahan. Tampil sebagai
        galeri dengan thumbnail di halaman koleksi. Media pertama otomatis jadi tampilan utama.
      </p>

      {(item.media ?? []).map((m, idx) => (
        <Card key={m.id} style={{ marginBottom: '1rem', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 700 }}>Media {idx + 1}</span>
            <Button variant="danger" onClick={() => patch({ media: (item.media ?? []).filter((_, i) => i !== idx) })}>
              Hapus
            </Button>
          </div>

          <Field label="Jenis Media">
            <Select
              value={m.type}
              onChange={(e) => {
                const next = [...(item.media ?? [])]
                next[idx] = { ...m, type: e.target.value as MediaItem['type'] }
                patch({ media: next })
              }}
            >
              <option value="image">Gambar / Foto</option>
              <option value="video">Video</option>
            </Select>
          </Field>

          {m.type === 'image' ? (
            <ImageUpload
              label="Upload Gambar"
              value={m.url || undefined}
              onChange={(url) => {
                const next = [...(item.media ?? [])]
                next[idx] = { ...m, url: url ?? '' }
                patch({ media: next })
              }}
            />
          ) : (
            <Field label="URL Video" hint="mis. /videos/nyiramkeun.mp4">
              <Input
                value={m.url}
                onChange={(e) => {
                  const next = [...(item.media ?? [])]
                  next[idx] = { ...m, url: e.target.value }
                  patch({ media: next })
                }}
                placeholder="/videos/dokumentasi.mp4"
              />
            </Field>
          )}

          {m.type === 'video' && (
            <ImageUpload
              label="Sampul Video (JPG/PNG)"
              value={m.thumbnail || undefined}
              onChange={(url) => {
                const next = [...(item.media ?? [])]
                next[idx] = { ...m, thumbnail: url }
                patch({ media: next })
              }}
            />
          )}

          <Field label="Keterangan / Caption" hint="Opsional">
            <Input
              value={m.caption ?? ''}
              onChange={(e) => {
                const next = [...(item.media ?? [])]
                next[idx] = { ...m, caption: e.target.value }
                patch({ media: next })
              }}
              placeholder="mis. Detail pamor pada bilah keris"
            />
          </Field>
        </Card>
      ))}

      <Button
        variant="outline"
        onClick={() => patch({ media: [...(item.media ?? []), emptyMedia()] })}
        style={{ width: '100%', padding: '0.9rem', marginBottom: '2rem' }}
      >
        + Tambah Media
      </Button>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <Button variant="outline" onClick={onCancel}>Batal</Button>
        <Button variant="solid" onClick={handleSave}>✓ Simpan Artefak</Button>
      </div>
    </div>
  )
}
