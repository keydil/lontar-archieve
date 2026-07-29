'use client'

import { useEffect, useRef, useState } from 'react'
import type { Artifact, Hotspot } from '@/data/koleksi'
import { uid, slugify } from '@/lib/cms'
import { Field, Input, Textarea, Button, Card, SectionTitle, ImageUpload } from './AdminUI'
import QRCodeButton from './QRCodeButton'
import { toast } from './Feedback'

const mono = "'DM Mono', monospace"

function emptyHotspot(): Hotspot {
  return { id: uid('hs'), label: '', description_id: '', description_en: '', position: [0, 0, 0] }
}

export function blankKoleksi(): Artifact & { modelSlug?: string; images?: string[] } {
  return {
    slug: '',
    name: '',
    year: '',
    type: 'Manuscript',
    material: '',
    dimensions: '',
    artist: 'Unknown',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    description_id: '',
    description_en: '',
    hotspots: [],
  }
}

// Artifact extended with optional media fields (disimpan sebagai bagian objek)
type KoleksiForm = Artifact & { modelSlug?: string; images?: string[] }

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

  // Lapor ke parent kalau ada perubahan belum disimpan (dipakai buat
  // nge-warn sebelum pindah tab/halaman).
  const isDirty = JSON.stringify(item) !== JSON.stringify(initial)
  useEffect(() => {
    onDirtyChange?.(isDirty)
    return () => onDirtyChange?.(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty])

  const updateHotspot = (id: string, p: Partial<Hotspot>) =>
    patch({ hotspots: item.hotspots.map((h) => (h.id === id ? { ...h, ...p } : h)) })

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
        <Field label="Jenis (Type)">
          <Input value={item.type} onChange={(e) => patch({ type: e.target.value })} placeholder="Manuscript / Footwear / Statue" />
        </Field>
        <Field label="Material">
          <Input value={item.material} onChange={(e) => patch({ material: e.target.value })} placeholder="Lontar Leaf" />
        </Field>
        <Field label="Dimensi">
          <Input value={item.dimensions} onChange={(e) => patch({ dimensions: e.target.value })} placeholder="30 × 5 × 0.3 cm" />
        </Field>
        <Field label="Pembuat / Artist">
          <Input value={item.artist} onChange={(e) => patch({ artist: e.target.value })} placeholder="Unknown" />
        </Field>
        <Field label="Negara">
          <Input value={item.country} onChange={(e) => patch({ country: e.target.value })} placeholder="Indonesia" />
        </Field>
      </div>
      <Field label="Lokasi / Alamat">
        <Input value={item.address} onChange={(e) => patch({ address: e.target.value })} placeholder="Museum Talaga Manggung, Majalengka" />
      </Field>

      <SectionTitle>Model 3D</SectionTitle>
      <Field
        label="Nama File Model (.glb)"
        hint="File .glb diletakkan di public/models/. Isi nama tanpa .glb — mis. 'macan_lonceng'. Kosongkan bila belum ada."
      >
        <Input value={item.modelSlug ?? item.slug} onChange={(e) => patch({ modelSlug: e.target.value })} placeholder="macan_lonceng" />
      </Field>

      <SectionTitle>Deskripsi</SectionTitle>
      <Field label="Deskripsi (Indonesia)">
        <Textarea value={item.description_id} onChange={(e) => patch({ description_id: e.target.value })} style={{ minHeight: '120px' }} />
      </Field>
      <Field label="Deskripsi (English)">
        <Textarea value={item.description_en} onChange={(e) => patch({ description_en: e.target.value })} style={{ minHeight: '120px' }} />
      </Field>

      {/* Hotspots */}
      <SectionTitle>Titik Anotasi (Hotspot)</SectionTitle>
      <p style={{ fontFamily: mono, fontSize: '13px', color: 'var(--warm)', marginBottom: '1rem', lineHeight: 1.6 }}>
        Titik interaktif pada model 3D. Posisi X/Y/Z menentukan letak titik pada model (biasanya antara -2 dan 2).
      </p>
      {item.hotspots.map((hs, idx) => (
        <Card key={hs.id} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontFamily: mono, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm)' }}>
              Hotspot {idx + 1}
            </span>
            <Button variant="danger" onClick={() => patch({ hotspots: item.hotspots.filter((h) => h.id !== hs.id) })}>
              Hapus
            </Button>
          </div>
          <Field label="Label">
            <Input value={hs.label} onChange={(e) => updateHotspot(hs.id, { label: e.target.value })} placeholder="Aksara Kaganga" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
            <Field label="Deskripsi (ID)">
              <Textarea value={hs.description_id} onChange={(e) => updateHotspot(hs.id, { description_id: e.target.value })} style={{ minHeight: '56px' }} />
            </Field>
            <Field label="Deskripsi (EN)">
              <Textarea value={hs.description_en} onChange={(e) => updateHotspot(hs.id, { description_en: e.target.value })} style={{ minHeight: '56px' }} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 1rem' }}>
            {(['x', 'y', 'z'] as const).map((axis, ai) => (
              <Field key={axis} label={`Posisi ${axis.toUpperCase()}`}>
                <Input
                  type="number"
                  step="0.1"
                  value={hs.position[ai]}
                  onChange={(e) => {
                    const pos = [...hs.position] as [number, number, number]
                    pos[ai] = parseFloat(e.target.value) || 0
                    updateHotspot(hs.id, { position: pos })
                  }}
                />
              </Field>
            ))}
          </div>
        </Card>
      ))}
      <Button variant="outline" onClick={() => patch({ hotspots: [...item.hotspots, emptyHotspot()] })} style={{ width: '100%', padding: '0.8rem' }}>
        + Tambah Hotspot
      </Button>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <Button variant="outline" onClick={onCancel}>Batal</Button>
        <Button variant="solid" onClick={handleSave}>✓ Simpan Artefak</Button>
      </div>
    </div>
  )
}
