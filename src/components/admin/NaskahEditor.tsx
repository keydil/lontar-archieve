'use client'

import { useState } from 'react'
import type { LontarNaskah, LontarVerse, LontarWord } from '@/data/naskah'
import { kelasKataOptions } from '@/data/aksara-sunda'
import { uid, slugify } from '@/lib/cms'
import {
  Field,
  Input,
  Textarea,
  Select,
  Button,
  Card,
  SectionTitle,
  AksaraKeyboard,
  ImageUpload,
} from './AdminUI'

const mono = "'DM Mono', monospace"

function emptyWord(): LontarWord {
  return { id: uid('w'), aksara: '', latin: '', terjemah: '', kelas: 'kata benda' }
}
function emptyVerse(n: number): LontarVerse {
  return { id: uid('v'), verseNumber: n, words: [emptyWord()], terjemahVerse: '', makna: '', catatan: '' }
}

export function blankNaskah(): LontarNaskah {
  return {
    id: uid('naskah'),
    title: '',
    sumber: '',
    tahun: '',
    aksaraType: 'Aksara Sunda Kuno',
    published: true,
    coverImage: undefined,
    scanImages: [],
    sinopsis: '',
    verses: [emptyVerse(1)],
  }
}

export default function NaskahEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: LontarNaskah
  onSave: (n: LontarNaskah) => void
  onCancel: () => void
}) {
  const [naskah, setNaskah] = useState<LontarNaskah>(initial)
  // id kata yang terakhir difokuskan → target papan aksara
  const [focusedWord, setFocusedWord] = useState<string | null>(null)

  const patch = (p: Partial<LontarNaskah>) => setNaskah((n) => ({ ...n, ...p }))

  function insertAksara(char: string) {
    if (!focusedWord) {
      alert('Klik dulu kolom "Aksara" pada kata yang ingin diisi.')
      return
    }
    setNaskah((n) => ({
      ...n,
      verses: n.verses.map((v) => ({
        ...v,
        words: v.words.map((w) => (w.id === focusedWord ? { ...w, aksara: w.aksara + char } : w)),
      })),
    }))
  }

  // ── verse ops ──
  const updateVerse = (vid: string, p: Partial<LontarVerse>) =>
    patch({ verses: naskah.verses.map((v) => (v.id === vid ? { ...v, ...p } : v)) })

  const addVerse = () =>
    patch({ verses: [...naskah.verses, emptyVerse(naskah.verses.length + 1)] })

  const removeVerse = (vid: string) =>
    patch({
      verses: naskah.verses
        .filter((v) => v.id !== vid)
        .map((v, i) => ({ ...v, verseNumber: i + 1 })),
    })

  // ── word ops ──
  const updateWord = (vid: string, wid: string, p: Partial<LontarWord>) =>
    updateVerse(vid, {
      words: naskah.verses.find((v) => v.id === vid)!.words.map((w) => (w.id === wid ? { ...w, ...p } : w)),
    })

  const addWord = (vid: string) =>
    updateVerse(vid, { words: [...naskah.verses.find((v) => v.id === vid)!.words, emptyWord()] })

  const removeWord = (vid: string, wid: string) => {
    const words = naskah.verses.find((v) => v.id === vid)!.words.filter((w) => w.id !== wid)
    updateVerse(vid, { words: words.length ? words : [emptyWord()] })
  }

  function handleSave() {
    if (!naskah.title.trim()) {
      alert('Judul arsip wajib diisi.')
      return
    }
    // pastikan id stabil & slug-friendly bila baru
    const clean: LontarNaskah = {
      ...naskah,
      id: naskah.id || slugify(naskah.title) || uid('naskah'),
      verses: naskah.verses.map((v, i) => ({ ...v, verseNumber: i + 1 })),
    }
    onSave(clean)
  }

  return (
    <div>
      {/* Sticky action bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 0',
          background: 'var(--bone)',
          borderBottom: '1px solid var(--border)',
          marginBottom: '1.5rem',
        }}
      >
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 900 }}>
          {initial.title ? 'Edit Arsip' : 'Arsip Baru'}
        </span>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button variant="solid" onClick={handleSave}>
            ✓ Simpan
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <SectionTitle>Metadata Arsip</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
        <Field label="Judul Arsip">
          <Input value={naskah.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Carita Parahyangan" />
        </Field>
        <Field label="Jenis Aksara">
          <Input value={naskah.aksaraType ?? ''} onChange={(e) => patch({ aksaraType: e.target.value })} placeholder="Aksara Sunda Kuno" />
        </Field>
        <Field label="Sumber / Koleksi">
          <Input value={naskah.sumber} onChange={(e) => patch({ sumber: e.target.value })} placeholder="Museum Talaga Manggung" />
        </Field>
        <Field label="Tahun / Periode">
          <Input value={naskah.tahun} onChange={(e) => patch({ tahun: e.target.value })} placeholder="Abad ke-16 M" />
        </Field>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: mono, fontSize: '13px', color: 'var(--charcoal)', cursor: 'pointer' }}>
          <input type="checkbox" checked={naskah.published ?? true} onChange={(e) => patch({ published: e.target.checked })} />
          Tampilkan di situs publik (jika tidak dicentang = draft)
        </label>
      </div>

      <ImageUpload label="Gambar Sampul" value={naskah.coverImage} onChange={(url) => patch({ coverImage: url })} />

      <Field label="Sinopsis" hint="Ringkasan singkat naskah — tampil di kartu beranda & halaman baca.">
        <Textarea value={naskah.sinopsis ?? ''} onChange={(e) => patch({ sinopsis: e.target.value })} placeholder="Ringkasan singkat isi naskah…" style={{ minHeight: '90px' }} />
      </Field>

      {/* Scan daun lontar */}
      <SectionTitle>Foto Scan Daun Lontar</SectionTitle>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        {(naskah.scanImages ?? []).map((img, i) => (
          <div key={i} style={{ position: 'relative', width: '140px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={`scan ${i + 1}`} style={{ width: '140px', height: '180px', objectFit: 'cover', border: '1px solid var(--border)', borderRadius: '6px' }} />
            <button
              onClick={() => patch({ scanImages: (naskah.scanImages ?? []).filter((_, j) => j !== i) })}
              style={{ position: 'absolute', top: 4, right: 4, background: 'var(--charcoal)', color: 'var(--bone)', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12 }}
            >
              ×
            </button>
          </div>
        ))}
        <ImageUpload
          label="+ Tambah Scan"
          value={undefined}
          onChange={(url) => url && patch({ scanImages: [...(naskah.scanImages ?? []), url] })}
        />
      </div>

      {/* Aksara keyboard */}
      <SectionTitle>Transkripsi per Ayat</SectionTitle>
      <div
        style={{
          background: 'rgba(200,169,110,0.06)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          fontFamily: mono,
          fontSize: '13px',
          color: 'var(--warm)',
          lineHeight: 1.7,
          marginBottom: '1rem',
        }}
      >
        Cara isi: klik kolom <b>Aksara</b> pada sebuah kata, lalu gunakan Papan Aksara Sunda di bawah untuk menyisipkan
        karakter. Isi juga <b>Latin</b>, <b>Terjemah</b>, dan <b>Kelas kata</b>. Terjemah &amp; makna ayat ada di bagian bawah tiap ayat.
      </div>
      <AksaraKeyboard onInsert={insertAksara} />

      {/* Verses */}
      {naskah.verses.map((verse) => (
        <Card key={verse.id} style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '19px', fontWeight: 900 }}>
              Ayat {verse.verseNumber}
            </span>
            <Button variant="danger" onClick={() => removeVerse(verse.id)}>
              Hapus Ayat
            </Button>
          </div>

          {/* Words table */}
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: '620px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1.5fr 1fr 40px', gap: '0.5rem', marginBottom: '0.4rem' }}>
                {['Aksara', 'Latin', 'Terjemah', 'Kelas', ''].map((h) => (
                  <span key={h} style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm)' }}>
                    {h}
                  </span>
                ))}
              </div>
              {verse.words.map((word) => (
                <div key={word.id} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1.5fr 1fr 40px', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'center' }}>
                  <Input
                    value={word.aksara}
                    onFocus={() => setFocusedWord(word.id)}
                    onChange={(e) => updateWord(verse.id, word.id, { aksara: e.target.value })}
                    placeholder="ᮃᮓᮤ"
                    style={{
                      fontSize: '22px',
                      fontFamily: 'serif',
                      borderColor: focusedWord === word.id ? 'var(--charcoal)' : 'var(--border)',
                      borderWidth: focusedWord === word.id ? '2px' : '1px',
                    }}
                  />
                  <Input value={word.latin} onChange={(e) => updateWord(verse.id, word.id, { latin: e.target.value })} placeholder="Adi" />
                  <Input value={word.terjemah} onChange={(e) => updateWord(verse.id, word.id, { terjemah: e.target.value })} placeholder="Permulaan" />
                  <Select value={word.kelas} onChange={(e) => updateWord(verse.id, word.id, { kelas: e.target.value })}>
                    {kelasKataOptions.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </Select>
                  <button
                    onClick={() => removeWord(verse.id, word.id)}
                    title="Hapus kata"
                    style={{ border: '1px solid var(--border)', borderRadius: '6px', background: 'transparent', cursor: 'pointer', height: '38px', color: '#a03434' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <Button variant="outline" onClick={() => addWord(verse.id)} style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
            + Tambah Kata
          </Button>

          {/* Verse-level meaning */}
          <Field label="Terjemah Ayat (kalimat penuh)">
            <Textarea value={verse.terjemahVerse} onChange={(e) => updateVerse(verse.id, { terjemahVerse: e.target.value })} placeholder="Permulaan dari bumi Sunda." style={{ minHeight: '56px' }} />
          </Field>
          <Field label="Makna & Tafsir" hint="Opsional — ayat dengan makna diberi penanda di halaman baca.">
            <Textarea value={verse.makna ?? ''} onChange={(e) => updateVerse(verse.id, { makna: e.target.value })} />
          </Field>
          <Field label="Catatan Filologi" hint="Opsional.">
            <Textarea value={verse.catatan ?? ''} onChange={(e) => updateVerse(verse.id, { catatan: e.target.value })} style={{ minHeight: '56px' }} />
          </Field>
        </Card>
      ))}

      <Button variant="outline" onClick={addVerse} style={{ width: '100%', padding: '0.9rem' }}>
        + Tambah Ayat
      </Button>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <Button variant="outline" onClick={onCancel}>Batal</Button>
        <Button variant="solid" onClick={handleSave}>✓ Simpan Arsip</Button>
      </div>
    </div>
  )
}
