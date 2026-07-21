'use client'

import { useState } from 'react'
import type { ArsipEntry } from '@/data/arsip'
import type { Artifact } from '@/data/koleksi'
import { slugify } from '@/lib/cms'
import { Field, Input, Textarea, Select, Button, SectionTitle, ImageUpload } from './AdminUI'

export function blankArsip(): ArsipEntry {
  return {
    slug: '',
    title: '',
    script: 'Aksara Kaganga',
    period: '',
    excerpt: '',
    transliteration: '',
    translation_id: '',
    translation_en: '',
    provenance: 'Museum Talaga Manggung, Majalengka',
    condition: '',
    relatedKoleksiSlug: undefined,
    image: undefined,
  }
}

export default function ArsipEditor({
  initial,
  isNew,
  koleksiOptions,
  onSave,
  onCancel,
}: {
  initial: ArsipEntry
  isNew: boolean
  koleksiOptions: Artifact[]
  onSave: (a: ArsipEntry) => void
  onCancel: () => void
}) {
  const [item, setItem] = useState<ArsipEntry>(initial)
  const patch = (p: Partial<ArsipEntry>) => setItem((i) => ({ ...i, ...p }))

  function handleSave() {
    if (!item.title.trim()) return alert('Judul wajib diisi.')
    const slug = isNew ? slugify(item.slug || item.title) : item.slug
    if (!slug) return alert('Slug tidak valid.')
    onSave({ ...item, slug })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 900 }}>
          {isNew ? 'Arsip Baru' : 'Edit Arsip'}
        </span>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Button variant="outline" onClick={onCancel}>Batal</Button>
          <Button variant="solid" onClick={handleSave}>✓ Simpan</Button>
        </div>
      </div>

      <SectionTitle>Metadata</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
        <Field label="Judul">
          <Input value={item.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Naskah Kaganga Tanah Sunda" />
        </Field>
        <Field label="Slug (URL)" hint={isNew ? 'Kosongkan untuk otomatis.' : 'Terkunci.'}>
          <Input value={item.slug} disabled={!isNew} onChange={(e) => patch({ slug: e.target.value })} />
        </Field>
        <Field label="Aksara / Script">
          <Input value={item.script} onChange={(e) => patch({ script: e.target.value })} placeholder="Aksara Kaganga" />
        </Field>
        <Field label="Periode">
          <Input value={item.period} onChange={(e) => patch({ period: e.target.value })} placeholder="Abad ke-14" />
        </Field>
        <Field label="Asal (Provenance)">
          <Input value={item.provenance} onChange={(e) => patch({ provenance: e.target.value })} />
        </Field>
        <Field label="Kondisi">
          <Input value={item.condition} onChange={(e) => patch({ condition: e.target.value })} placeholder="Baik (terlindungi dari kelembaban)" />
        </Field>
      </div>

      <Field label="Ringkasan (Excerpt)">
        <Textarea value={item.excerpt} onChange={(e) => patch({ excerpt: e.target.value })} style={{ minHeight: '70px' }} />
      </Field>

      <ImageUpload label="Foto Naskah Asli" value={item.image} onChange={(url) => patch({ image: url })} />

      <SectionTitle>Teks</SectionTitle>
      <Field label="Transliterasi" hint="Pisahkan baris dengan Enter.">
        <Textarea value={item.transliteration} onChange={(e) => patch({ transliteration: e.target.value })} style={{ minHeight: '120px', fontFamily: "'DM Mono', monospace" }} />
      </Field>
      <Field label="Terjemahan (Indonesia)">
        <Textarea value={item.translation_id} onChange={(e) => patch({ translation_id: e.target.value })} style={{ minHeight: '120px' }} />
      </Field>
      <Field label="Terjemahan (English)">
        <Textarea value={item.translation_en} onChange={(e) => patch({ translation_en: e.target.value })} style={{ minHeight: '120px' }} />
      </Field>

      <SectionTitle>Relasi</SectionTitle>
      <Field label="Artefak 3D Terkait" hint="Tautkan ke koleksi 3D bila item fisik yang sama punya model.">
        <Select value={item.relatedKoleksiSlug ?? ''} onChange={(e) => patch({ relatedKoleksiSlug: e.target.value || undefined })}>
          <option value="">— Tidak ada —</option>
          {koleksiOptions.map((k) => (
            <option key={k.slug} value={k.slug}>{k.name}</option>
          ))}
        </Select>
      </Field>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <Button variant="outline" onClick={onCancel}>Batal</Button>
        <Button variant="solid" onClick={handleSave}>✓ Simpan Arsip</Button>
      </div>
    </div>
  )
}
