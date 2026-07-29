'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { LontarLembar, LontarNaskah, LontarVerse, LontarWord } from '@/data/naskah'
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
  LockIcon,
  UnlockIcon,
} from './AdminUI'
import QRCodeButton from './QRCodeButton'
import { toast, confirmDialog } from './Feedback'

const mono = "'DM Mono', monospace"

function emptyWord(): LontarWord {
  return { id: uid('w'), aksara: '', latin: '', terjemah: '', kelas: 'kata benda' }
}
function emptyVerse(n: number): LontarVerse {
  return { id: uid('v'), verseNumber: n, words: [emptyWord()], terjemahVerse: '', makna: '', catatan: '' }
}
function emptyLembar(n: number): LontarLembar {
  return { id: uid('lembar'), lembarNumber: n, scanImage: undefined, verses: [emptyVerse(1)] }
}

export function blankNaskah(): LontarNaskah {
  return {
    id: uid('naskah'),
    title: '',
    sumber: '',
    tahun: '',
    aksaraType: 'Aksara Sunda Kuno',
    published: true,
    finalized: false,
    coverImage: undefined,
    sinopsis: '',
    lembar: [emptyLembar(1)],
  }
}

// renumber lembar & ayat berurutan (ayat lintas-lembar, 1..N untuk satu buku)
function buildClean(n: LontarNaskah): LontarNaskah {
  let counter = 0
  const lembar = n.lembar.map((l, li) => ({
    ...l,
    lembarNumber: li + 1,
    verses: l.verses.map((v) => ({ ...v, verseNumber: ++counter })),
  }))
  return { ...n, id: n.id || slugify(n.title) || uid('naskah'), lembar }
}

type Step = { key: string; label: string; kind: 'info' | 'lembar' | 'review'; lembarIndex?: number }

export default function NaskahEditor({
  initial,
  onSave,
  onCancel,
  onDirtyChange,
}: {
  initial: LontarNaskah
  onSave: (n: LontarNaskah) => void
  onCancel: () => void
  onDirtyChange?: (dirty: boolean) => void
}) {
  const [naskah, setNaskah] = useState<LontarNaskah>(initial)
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  // id kata yang terakhir difokuskan → target papan aksara
  const [focusedWord, setFocusedWord] = useState<string | null>(null)
  // error per-field, ditampilkan langsung di bawah field-nya (bukan cuma toast)
  const [errors, setErrors] = useState<{ title?: string }>({})
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Lapor ke parent kalau ada perubahan belum disimpan — dipakai buat
  // nge-warn sebelum pindah tab/halaman (misal lagi ngedit Lembar 2 Ayat 3
  // terus mau pindah ke Koleksi 3D, biar ga sia-sia tulisannya).
  const isDirty = JSON.stringify(naskah) !== JSON.stringify(initial)
  useEffect(() => {
    onDirtyChange?.(isDirty)
    return () => onDirtyChange?.(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty])

  const locked = naskah.finalized ?? false

  const steps: Step[] = [
    { key: 'info', label: 'Info Dasar', kind: 'info' },
    ...naskah.lembar.map((l, i): Step => ({ key: l.id, label: `Lembar ${i + 1}`, kind: 'lembar', lembarIndex: i })),
    { key: 'review', label: 'Review', kind: 'review' },
  ]
  const step = steps[Math.min(activeStepIndex, steps.length - 1)]
  const activeLembar = step.kind === 'lembar' ? naskah.lembar[step.lembarIndex!] : null
  const isFirstStep = activeStepIndex === 0
  const isLastStep = activeStepIndex === steps.length - 1

  // ── transisi antar-step (GSAP, arah-sadar) ──
  const contentRef = useRef<HTMLDivElement>(null)
  const directionRef = useRef<'forward' | 'backward'>('forward')
  const isFirstRender = useRef(true)

  const navigateToStep = (newIndex: number) => {
    setActiveStepIndex((i) => {
      const clamped = Math.max(0, Math.min(steps.length - 1, newIndex))
      directionRef.current = clamped >= i ? 'forward' : 'backward'
      return clamped
    })
  }
  const goBack = () => navigateToStep(activeStepIndex - 1)
  const goNext = () => navigateToStep(activeStepIndex + 1)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!contentRef.current) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return
    const offset = directionRef.current === 'backward' ? -24 : 24
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, x: offset },
      { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }
    )
  }, [activeStepIndex])

  const patch = (p: Partial<LontarNaskah>) => setNaskah((n) => ({ ...n, ...p }))

  function insertAksara(char: string) {
    if (!focusedWord) {
      toast('Klik dulu kolom "Aksara" pada kata yang ingin diisi.', 'info')
      return
    }
    setNaskah((n) => ({
      ...n,
      lembar: n.lembar.map((l) => ({
        ...l,
        verses: l.verses.map((v) => ({
          ...v,
          words: v.words.map((w) => (w.id === focusedWord ? { ...w, aksara: w.aksara + char } : w)),
        })),
      })),
    }))
  }

  // ── lembar ops ──
  const updateLembar = (lid: string, p: Partial<LontarLembar>) =>
    patch({ lembar: naskah.lembar.map((l) => (l.id === lid ? { ...l, ...p } : l)) })

  const addLembar = () => {
    const newIndex = naskah.lembar.length
    patch({ lembar: [...naskah.lembar, emptyLembar(newIndex + 1)] })
    navigateToStep(1 + newIndex) // lompat langsung ke lembar baru
  }

  const removeLembar = async (lid: string) => {
    if (naskah.lembar.length <= 1) return
    const ok = await confirmDialog('Hapus lembar ini beserta semua ayat di dalamnya?', { danger: true, confirmLabel: 'Hapus Lembar' })
    if (!ok) return
    const next = naskah.lembar.filter((l) => l.id !== lid).map((l, i) => ({ ...l, lembarNumber: i + 1 }))
    patch({ lembar: next })
    setActiveStepIndex((i) => Math.min(i, next.length + 1))
  }

  // ── verse ops (scoped ke lembar aktif) ──
  const updateVerse = (vid: string, p: Partial<LontarVerse>) => {
    if (!activeLembar) return
    updateLembar(activeLembar.id, {
      verses: activeLembar.verses.map((v) => (v.id === vid ? { ...v, ...p } : v)),
    })
  }

  const addVerse = () => {
    if (!activeLembar) return
    updateLembar(activeLembar.id, { verses: [...activeLembar.verses, emptyVerse(activeLembar.verses.length + 1)] })
  }

  const removeVerse = (vid: string) => {
    if (!activeLembar) return
    updateLembar(activeLembar.id, {
      verses: activeLembar.verses.filter((v) => v.id !== vid).map((v, i) => ({ ...v, verseNumber: i + 1 })),
    })
  }

  // ── word ops ──
  const updateWord = (vid: string, wid: string, p: Partial<LontarWord>) =>
    updateVerse(vid, {
      words: activeLembar!.verses.find((v) => v.id === vid)!.words.map((w) => (w.id === wid ? { ...w, ...p } : w)),
    })

  const addWord = (vid: string) =>
    updateVerse(vid, { words: [...activeLembar!.verses.find((v) => v.id === vid)!.words, emptyWord()] })

  const removeWord = (vid: string, wid: string) => {
    const words = activeLembar!.verses.find((v) => v.id === vid)!.words.filter((w) => w.id !== wid)
    updateVerse(vid, { words: words.length ? words : [emptyWord()] })
  }

  // Validasi seluruh form. Balikin true kalau semua sudah lengkap;
  // kalau ada yang kurang, error-nya disimpan per-field (bukan cuma
  // pesan generik) supaya bisa tampil tepat di bawah field-nya.
  function validate(): boolean {
    const next: { title?: string } = {}
    if (!naskah.title.trim()) {
      next.title = 'Wajib diisi — ini judul yang akan tampil di situs.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  // Kalau validasi gagal: bawa user langsung ke step & field yang
  // bermasalah, jangan cuma kasih tau lewat toast lalu tinggalkan
  // dia bingung nyari sendiri.
  function goToFirstError() {
    navigateToStep(0) // satu-satunya field wajib ada di step Info Dasar
    setTimeout(() => {
      titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      titleInputRef.current?.focus()
    }, 320) // nunggu animasi pindah step selesai dulu
  }

  function handleSave() {
    if (!validate()) {
      toast('Masih ada yang perlu dilengkapi di langkah "Info Dasar" — lihat tanda merah.', 'error')
      goToFirstError()
      return
    }
    onSave(buildClean(naskah))
  }

  function handleFinalize() {
    if (!validate()) {
      toast('Masih ada yang perlu dilengkapi di langkah "Info Dasar" — lihat tanda merah.', 'error')
      goToFirstError()
      return
    }
    const withFlag = { ...naskah, finalized: true }
    setNaskah(withFlag)
    onSave(buildClean(withFlag))
  }

  return (
    <div>
      {/* Sticky action bar */}
      <div
        className="wizard-topbar"
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
        <div className="wizard-topbar-actions" style={{ display: 'flex', gap: '0.6rem' }}>
          <QRCodeButton url={typeof window !== 'undefined' ? `${window.location.origin}/arsip/${naskah.id}` : ''} filename={naskah.id} label="QR Kode" />
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button variant="solid" onClick={handleSave}>
            ✓ Simpan
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* STEPPER — alur kaya form pendaftaran: satu langkah kelihatan  */}
      {/* dalam satu waktu, biar ga numpuk & bikin pusing.              */}
      {/* ============================================================ */}
      <p style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--warm)', marginBottom: '0.75rem' }}>
        Langkah {activeStepIndex + 1} dari {steps.length} — {step.label}
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-start', overflowX: 'auto', paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        {steps.map((s, i) => {
          const hasError = s.kind === 'info' && !!errors.title
          return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={() => navigateToStep(i)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.6rem' }}
            >
              <span
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `${hasError ? 2 : 1}px solid ${hasError ? '#a03434' : i <= activeStepIndex ? 'var(--charcoal)' : 'var(--border)'}`,
                  background: hasError ? 'rgba(160,52,52,0.08)' : i === activeStepIndex ? 'var(--charcoal)' : 'transparent',
                  color: hasError ? '#a03434' : i === activeStepIndex ? 'var(--bone)' : 'var(--charcoal)',
                  fontFamily: mono,
                  fontSize: '12px',
                  flexShrink: 0,
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                {hasError ? '!' : i < activeStepIndex ? '✓' : i + 1}
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: '10px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: hasError ? '#a03434' : i === activeStepIndex ? 'var(--charcoal)' : 'var(--warm)',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div style={{ width: '28px', height: '1px', background: 'var(--border)', marginTop: '-19px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--charcoal)',
                    transform: `scaleX(${i < activeStepIndex ? 1 : 0})`,
                    transformOrigin: 'left',
                    transition: 'transform 0.35s ease',
                  }}
                />
              </div>
            )}
          </div>
          )
        })}
      </div>

      <div ref={contentRef}>
      {/* ============================================================ */}
      {/* STEP: INFO DASAR */}
      {/* ============================================================ */}
      {step.kind === 'info' && (
        <div>
          <SectionTitle>Info Dasar Naskah</SectionTitle>
          <div className="wizard-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
            <Field label="Judul Arsip" required error={errors.title}>
              <Input
                ref={titleInputRef}
                value={naskah.title}
                invalid={!!errors.title}
                onChange={(e) => {
                  patch({ title: e.target.value })
                  if (errors.title) setErrors((er) => ({ ...er, title: undefined }))
                }}
                placeholder="Carita Parahyangan"
              />
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
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP: LEMBAR (satu halaman per langkah) */}
      {/* ============================================================ */}
      {step.kind === 'lembar' && activeLembar && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <SectionTitle>Lembar {step.lembarIndex! + 1} — Scan &amp; Transkripsi</SectionTitle>
            {!locked && naskah.lembar.length > 1 && (
              <Button variant="danger" onClick={() => removeLembar(activeLembar.id)}>Hapus Lembar Ini</Button>
            )}
          </div>

          <ImageUpload
            label={`Foto Scan — Lembar ${step.lembarIndex! + 1}`}
            value={activeLembar.scanImage}
            onChange={(url) => updateLembar(activeLembar.id, { scanImage: url })}
          />

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
            karakter. Isi juga <b>Latin</b>, <b>Terjemah</b>, dan <b>Kelas kata</b>. Nomor ayat otomatis berurutan
            untuk seluruh buku saat disimpan.
          </div>
          <AksaraKeyboard onInsert={insertAksara} />

          {activeLembar.verses.map((verse) => (
            <Card key={verse.id} style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '19px', fontWeight: 900 }}>
                  Ayat {verse.verseNumber}
                </span>
                {!locked && (
                  <Button variant="danger" onClick={() => removeVerse(verse.id)}>
                    Hapus Ayat
                  </Button>
                )}
              </div>

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

          {!locked && (
            <Button variant="outline" onClick={addVerse} style={{ width: '100%', padding: '0.9rem' }}>
              + Tambah Ayat di Lembar Ini
            </Button>
          )}

          {/* Sudah beres transkripsi lembar ini — lanjut ke lembar berikutnya atau ke Review */}
          {!locked && step.lembarIndex === naskah.lembar.length - 1 && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)' }}>
              <p style={{ fontFamily: mono, fontSize: '12px', color: 'var(--warm)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Sudah beres isi Lembar {step.lembarIndex! + 1}? Kalau masih ada daun lontar berikutnya yang mau
                ditranskripsi, lanjut ke lembar baru. Kalau ini lembar terakhir, langsung ke Review untuk finalisasi.
              </p>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <Button variant="solid" onClick={addLembar}>
                  + Lanjut ke Lembar {step.lembarIndex! + 2}
                </Button>
                <Button variant="outline" onClick={() => navigateToStep(steps.length - 1)}>
                  Ini Lembar Terakhir — Lanjut ke Review →
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP: REVIEW & FINALISASI */}
      {/* ============================================================ */}
      {step.kind === 'review' && (
        <div>
          <SectionTitle>Review Sebelum Disimpan</SectionTitle>

          {locked ? (
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                marginBottom: '1.25rem',
                background: 'rgba(200,169,110,0.06)',
              }}
            >
              <div className="wizard-review-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.6rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.3rem 0.7rem',
                    borderRadius: '999px',
                    background: 'var(--charcoal)',
                    color: 'var(--bone)',
                    fontFamily: mono,
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  <LockIcon size={11} /> Struktur Terkunci
                </span>
                <Button
                  variant="ghost"
                  onClick={() => patch({ finalized: false })}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <UnlockIcon size={11} /> Buka Kunci
                </Button>
              </div>
              <p style={{ fontFamily: mono, fontSize: '12px', color: 'var(--warm)', lineHeight: 1.6 }}>
                Naskah ini sudah difinalisasi — jumlah lembar &amp; ayat terkunci. Isi teks tetap bisa diedit dari langkah Lembar.
              </p>
            </div>
          ) : (
            <p style={{ fontFamily: mono, fontSize: '13px', color: 'var(--warm)', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '620px' }}>
              Cek ringkasan tiap lembar di bawah. Klik "Edit" untuk kembali ke lembar tertentu, atau tambah lembar baru
              kalau masih ada halaman yang belum dimasukkan. Klik <b>Selesai &amp; Finalisasi</b> kalau naskah sudah lengkap —
              strukturnya akan terkunci tapi isi teks tetap bisa diedit nanti.
            </p>
          )}

          <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            {naskah.lembar.map((l, i) => (
              <div
                key={l.id}
                className="wizard-review-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderBottom: i < naskah.lembar.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 700 }}>Lembar {i + 1}</div>
                  <div style={{ fontFamily: mono, fontSize: '11px', color: 'var(--warm)', marginTop: '2px' }}>
                    {l.verses.length} ayat{l.scanImage ? ' · scan terpasang' : ' · belum ada scan'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="outline" onClick={() => navigateToStep(1 + i)}>Edit</Button>
                  {!locked && naskah.lembar.length > 1 && (
                    <Button variant="danger" onClick={() => removeLembar(l.id)}>Hapus</Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!locked && (
            <Button variant="outline" onClick={addLembar} style={{ width: '100%', padding: '0.9rem', marginBottom: '1.5rem' }}>
              + Tambah Lembar Baru
            </Button>
          )}

          <p style={{ fontFamily: mono, fontSize: '12px', color: 'var(--warm)', marginBottom: '1.5rem' }}>
            Total: {naskah.lembar.length} lembar · {naskah.lembar.reduce((sum, l) => sum + l.verses.length, 0)} ayat
          </p>

          {!locked && (
            <Button variant="solid" onClick={handleFinalize} style={{ width: '100%', padding: '0.9rem' }}>
              ✓ Selesai &amp; Finalisasi Naskah
            </Button>
          )}
        </div>
      )}
      </div>

      {/* ============================================================ */}
      {/* NAVIGASI LANGKAH */}
      {/* ============================================================ */}
      <div className="wizard-footer-nav" style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <Button variant="outline" className="wizard-nav-btn" onClick={goBack} disabled={isFirstStep}>← Kembali</Button>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Button variant="outline" onClick={onCancel}>Batal</Button>
          {isLastStep ? (
            <Button variant="solid" className="wizard-nav-btn" onClick={handleSave}>✓ Simpan Arsip</Button>
          ) : (
            <Button variant="solid" className="wizard-nav-btn" onClick={goNext}>Lanjut →</Button>
          )}
        </div>
      </div>
    </div>
  )
}
