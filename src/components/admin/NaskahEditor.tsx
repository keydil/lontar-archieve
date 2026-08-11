'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { Save, Trash2, Plus, X, BookOpen, Keyboard, Sparkles } from 'lucide-react'
import type { LontarLembar, LontarNaskah, LontarVerse, LontarWord } from '@/data/naskah'
import { kelasKataOptions } from '@/data/aksara-sunda'
import { uid, slugify } from '@/lib/cms'
import { KoleksiPhotoUpload } from './koleksi/KoleksiUploads'
import { AksaraKeyboardPanel } from './naskah/AksaraKeyboardPanel'
import QRCodeButton from './QRCodeButton'
import { toast, confirmDialog } from './Feedback'

function emptyWord(): LontarWord {
  return { id: uid('w'), aksara: '', latin: '', terjemah: '', kelas: 'kata benda' }
}
function emptyVerse(n: number): LontarVerse {
  return { id: uid('v'), verseNumber: n, words: [emptyWord()], terjemahVerse: '', makna: '', catatan: '' }
}
function emptyLembar(n: number): LontarLembar {
  return { id: uid('lembar'), lembarNumber: n, judul: undefined, scanImage: undefined, verses: [emptyVerse(1)] }
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
    images: [],
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

type StepKind = 'info' | 'transkripsi' | 'review'
type Step = { key: StepKind; label: string; kind: StepKind }
const STEPS: Step[] = [
  { key: 'info', label: 'Info Dasar', kind: 'info' },
  { key: 'transkripsi', label: 'Transkripsi & Aksara', kind: 'transkripsi' },
  { key: 'review', label: 'Review & Finalisasi', kind: 'review' },
]

// ── Field/Input lokal — dipakai khusus di sini (skopnya redesain naskah
// doang, gak nyentuh AdminUI yang dipakai bareng Dashboard/Backup/SEO). ──
function NField({ label, hint, error, required, children }: { label: string; hint?: string; error?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block mb-4">
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

// varian bg-putih — dipakai buat field yang langsung nempel di kartu krem (mis. field
// tingkat-ayat di dalam kartu Ayat), biar ada kontras lapis alih-alih rata satu warna.
const inputClsWhite = () => 'w-full p-2.5 bg-white border border-[#DCD3C1] rounded-sm text-xs text-[#2C2825] outline-none focus:border-[#8A7144]'

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A7144] mb-3">{children}</p>
}

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
  // tab lembar aktif di dalam step "Transkripsi & Aksara" — independen dari activeStepIndex
  const [activeLembarTab, setActiveLembarTab] = useState(0)
  // id kata yang terakhir difokuskan → target papan aksara
  const [focusedWord, setFocusedWord] = useState<string | null>(null)
  const [showKeyboard, setShowKeyboard] = useState(false)
  // error per-field, ditampilkan langsung di bawah field-nya (bukan cuma toast)
  const [errors, setErrors] = useState<{ title?: string }>({})
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Lapor ke parent kalau ada perubahan belum disimpan — dipakai buat
  // nge-warn sebelum pindah tab/halaman (misal lagi ngedit Lembar 2 Ayat 3
  // terus mau pindah ke Koleksi, biar ga sia-sia tulisannya).
  const isDirty = JSON.stringify(naskah) !== JSON.stringify(initial)
  useEffect(() => {
    onDirtyChange?.(isDirty)
    return () => onDirtyChange?.(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty])

  const steps = STEPS
  const step = steps[Math.min(activeStepIndex, steps.length - 1)]
  const clampedLembarTab = Math.min(activeLembarTab, naskah.lembar.length - 1)
  const activeLembar = naskah.lembar[clampedLembarTab] ?? null
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

  // "aksara target" bisa nunjuk ke kata (id kata) atau ke teks-ayat-utuh
  // (id ayat + sufiks ':full') — dua-duanya dituju lewat focusedWord yang sama.
  const fullVerseTargetId = (vid: string) => `${vid}:full`

  function insertAksara(char: string) {
    if (!focusedWord) {
      toast('Klik dulu kolom "Aksara" yang ingin diisi.', 'info')
      return
    }
    setNaskah((n) => ({
      ...n,
      lembar: n.lembar.map((l) => ({
        ...l,
        verses: l.verses.map((v) =>
          fullVerseTargetId(v.id) === focusedWord
            ? { ...v, verseAksara: (v.verseAksara ?? '') + char }
            : { ...v, words: v.words.map((w) => (w.id === focusedWord ? { ...w, aksara: w.aksara + char } : w)) }
        ),
      })),
    }))
  }

  function backspaceAksara() {
    if (!focusedWord) return
    setNaskah((n) => ({
      ...n,
      lembar: n.lembar.map((l) => ({
        ...l,
        verses: l.verses.map((v) =>
          fullVerseTargetId(v.id) === focusedWord
            ? { ...v, verseAksara: (v.verseAksara ?? '').slice(0, -1) }
            : { ...v, words: v.words.map((w) => (w.id === focusedWord ? { ...w, aksara: w.aksara.slice(0, -1) } : w)) }
        ),
      })),
    }))
  }

  function spaceAksara() {
    insertAksara(' ')
  }

  function clearAksara() {
    if (!focusedWord) return
    setNaskah((n) => ({
      ...n,
      lembar: n.lembar.map((l) => ({
        ...l,
        verses: l.verses.map((v) =>
          fullVerseTargetId(v.id) === focusedWord
            ? { ...v, verseAksara: '' }
            : { ...v, words: v.words.map((w) => (w.id === focusedWord ? { ...w, aksara: '' } : w)) }
        ),
      })),
    }))
  }

  // ── lembar ops ──
  const updateLembar = (lid: string, p: Partial<LontarLembar>) =>
    patch({ lembar: naskah.lembar.map((l) => (l.id === lid ? { ...l, ...p } : l)) })

  const addLembar = () => {
    const newIndex = naskah.lembar.length
    patch({ lembar: [...naskah.lembar, emptyLembar(newIndex + 1)] })
    setActiveLembarTab(newIndex) // lompat langsung ke tab lembar baru
    navigateToStep(1) // step "Transkripsi & Aksara"
  }

  const removeLembar = async (lid: string) => {
    if (naskah.lembar.length <= 1) return
    const ok = await confirmDialog('Hapus lembar ini beserta semua ayat di dalamnya?', { danger: true, confirmLabel: 'Hapus Lembar' })
    if (!ok) return
    const next = naskah.lembar.filter((l) => l.id !== lid).map((l, i) => ({ ...l, lembarNumber: i + 1 }))
    patch({ lembar: next })
    setActiveLembarTab((t) => Math.min(t, next.length - 1))
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

  const focusedLabel = (() => {
    if (!focusedWord || !activeLembar) return undefined
    for (const v of activeLembar.verses) {
      if (fullVerseTargetId(v.id) === focusedWord) return `Ayat ${v.verseNumber} · Teks Aksara Kuno`
      const idx = v.words.findIndex((w) => w.id === focusedWord)
      if (idx !== -1) return `Ayat ${v.verseNumber} · Kata ${idx + 1}`
    }
    return undefined
  })()

  // Skrip default papan aksara mengikuti "Jenis Aksara Utama" naskah — tetap bisa di-switch manual.
  const defaultScript: 'sunda' | 'pegon' = (naskah.aksaraType ?? '').toLowerCase().includes('pegon') ? 'pegon' : 'sunda'

  function focusAndOpenKeyboard(id: string) {
    setFocusedWord(id)
    setShowKeyboard(true)
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#FFFDF9] p-5 border border-[#DCD3C1] rounded-sm shadow-sm sticky top-0 z-20">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7144] block mb-1">
            Editor Filologi — Langkah {activeStepIndex + 1} dari {steps.length}
          </span>
          <h2 className="text-2xl font-['Playfair_Display',serif] font-bold text-[#1A1816]">
            {naskah.title || (initial.title ? 'Edit Arsip' : 'Arsip Baru')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <QRCodeButton url={typeof window !== 'undefined' ? `${window.location.origin}/arsip/${naskah.id}` : ''} filename={naskah.id} label="QR Kode" />
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
            Simpan Arsip
          </button>
        </div>
      </div>

      {/* Stepper — tab datar, bukan lingkaran nomor */}
      <div className="bg-[#FFFDF9] p-1.5 border border-[#DCD3C1] rounded-sm flex gap-1.5 overflow-x-auto">
        {steps.map((s, i) => {
          const hasError = s.kind === 'info' && !!errors.title
          const isActive = i === activeStepIndex
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => navigateToStep(i)}
              className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-colors cursor-pointer border ${
                hasError
                  ? 'border-red-400 bg-red-50 text-red-600'
                  : isActive
                    ? 'bg-[#8A7144] text-white border-[#8A7144]'
                    : 'bg-transparent text-[#8A8172] border-transparent hover:bg-[#F3EFE4] hover:text-[#2C2825]'
              }`}
            >
              {hasError ? '⚠ ' : ''}{i + 1}. {s.label}
            </button>
          )
        })}
      </div>

      <div ref={contentRef} className="space-y-6">
        {/* ============================================================ */}
        {/* STEP: INFO DASAR */}
        {/* ============================================================ */}
        {step.kind === 'info' && (
          <div className="bg-[#FFFDF9] p-6 border border-[#DCD3C1] rounded-sm shadow-sm space-y-4">
            <div className="border-b border-[#EAE3D3] pb-3">
              <h3 className="text-xl font-['Playfair_Display',serif] font-bold text-[#1A1816]">1. Info Dasar Naskah</h3>
              <p className="text-xs text-[#6B5E4C] mt-0.5">Identitas naskah, sumber, dan sampul katalog.</p>
            </div>

            <div className="bg-[#F9F6EE] p-4 border border-[#D5C9B2] rounded-sm">
              <KoleksiPhotoUpload
                label="Gambar Sampul Utama (Sampul Katalog)"
                value={naskah.coverImage}
                onChange={(url) => patch({ coverImage: url })}
                hint="Tampil di daftar Arsip & halaman baca."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NField label="Judul Naskah" required error={errors.title}>
                <input
                  ref={titleInputRef}
                  value={naskah.title}
                  onChange={(e) => {
                    patch({ title: e.target.value })
                    if (errors.title) setErrors((er) => ({ ...er, title: undefined }))
                  }}
                  placeholder="Carita Parahyangan"
                  className={inputCls(!!errors.title)}
                />
              </NField>
              <NField label="Jenis Aksara Utama">
                <select value={naskah.aksaraType ?? 'Aksara Sunda Kuno'} onChange={(e) => patch({ aksaraType: e.target.value })} className={inputCls()}>
                  <option value="Aksara Sunda Kuno">Aksara Sunda Kuno</option>
                  <option value="Pegon">Arab Pegon</option>
                  <option value="Hanacaraka">Hanacaraka / Cacarakan</option>
                  <option value="Latin">Latin / Transliterasi</option>
                </select>
              </NField>
              <NField label="Sumber / Koleksi">
                <input value={naskah.sumber} onChange={(e) => patch({ sumber: e.target.value })} placeholder="Museum Talaga Manggung" className={inputCls()} />
              </NField>
              <NField label="Tahun / Periode">
                <input value={naskah.tahun} onChange={(e) => patch({ tahun: e.target.value })} placeholder="Abad ke-16 M" className={inputCls()} />
              </NField>
            </div>

            <label className="flex items-center gap-2 cursor-pointer w-fit bg-[#F3EFE4] px-3 py-2 rounded-sm border border-[#D5C9B2]">
              <input type="checkbox" checked={naskah.published ?? true} onChange={(e) => patch({ published: e.target.checked })} className="w-3.5 h-3.5 accent-[#8A7144] cursor-pointer" />
              <span className="text-xs font-semibold text-[#2C2825]">Tampilkan di situs publik (kalau tidak dicentang = draft)</span>
            </label>

            <NField label="Sinopsis" hint="Ringkasan singkat naskah — tampil di kartu katalog & halaman baca.">
              <textarea
                rows={3}
                value={naskah.sinopsis ?? ''}
                onChange={(e) => patch({ sinopsis: e.target.value })}
                placeholder="Ringkasan singkat isi naskah…"
                className={inputCls() + ' leading-relaxed'}
              />
            </NField>

          </div>
        )}

        {/* ============================================================ */}
        {/* STEP: TRANSKRIPSI & AKSARA (tab per lembar) */}
        {/* ============================================================ */}
        {step.kind === 'transkripsi' && activeLembar && (
          <div className="space-y-5">
            {/* Papan Aksara — kartu toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#F9F6EE] border border-[#D5C9B2] rounded-sm shadow-sm">
              <div>
                <strong className="text-[#8A7144] block font-['Playfair_Display',serif] text-sm">
                  Papan Aksara Sunda Virtual (Keyboard Melayang)
                </strong>
                <p className="text-[11px] text-[#6B5E4C] mt-0.5">
                  Gunakan papan ketik virtual yang melayang di pojok layar. Keyboard akan otomatis mengarah ke kolom
                  input Aksara apa pun yang sedang Anda pilih/klik.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyboard((o) => !o)}
                className={`px-3 py-1.5 font-bold text-xs rounded-sm cursor-pointer flex items-center gap-1.5 transition-colors shadow-sm shrink-0 ${
                  showKeyboard ? 'bg-[#8A7144] text-white' : 'bg-[#EAE3D3] text-[#3D3730] hover:bg-[#E0D7C6]'
                }`}
              >
                <Keyboard className="w-4 h-4" />
                {showKeyboard ? 'Sembunyikan Keyboard' : 'Aktifkan Keyboard Melayang'}
              </button>
            </div>

            {/* Kelola Lembar Lontar */}
            <div className="p-4 bg-[#F9F6EE] border border-[#D5C9B2] rounded-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE3D3] pb-3">
                <div>
                  <span className="text-[10px] font-bold text-[#8A7144] uppercase tracking-wider block">
                    Kelola Lembar Lontar &amp; Foto Scan Digital HD ({naskah.lembar.length} Lembar)
                  </span>
                  <p className="text-[11px] text-[#6B5E4C] mt-0.5">
                    Pilih lembar lontar untuk mengedit foto scan, judul lembar, dan daftar ayat.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addLembar}
                  className="px-3 py-1.5 bg-[#8A7144] hover:bg-[#725C34] text-white font-bold text-xs rounded-sm flex items-center gap-1 cursor-pointer shrink-0 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Lembar Lontar</span>
                </button>
              </div>

              {/* Tab lembar — wrap, bukan scroll horizontal */}
              <div className="flex flex-wrap gap-2">
                {naskah.lembar.map((l, i) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setActiveLembarTab(i)}
                    className={`px-3 py-1.5 font-bold text-xs rounded-sm cursor-pointer border transition-all flex items-center gap-1.5 ${
                      i === clampedLembarTab ? 'bg-[#8A7144] text-white border-[#8A7144] shadow-sm' : 'bg-white text-[#5C4D32] border-[#DCD3C1] hover:bg-[#F3EFE4]'
                    }`}
                  >
                    <span>{l.judul ? `Lembar ${i + 1}: ${l.judul}` : `Lembar ${i + 1}`}</span>
                    {naskah.lembar.length > 1 && (
                      <span
                        onClick={(e) => { e.stopPropagation(); removeLembar(l.id) }}
                        title="Hapus Lembar Ini"
                        className={`p-0.5 rounded-sm ${i === clampedLembarTab ? 'hover:text-red-200' : 'hover:text-red-600'}`}
                      >
                        <X className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Detail lembar terpilih */}
              <div className="p-3 bg-white border border-[#DCD3C1] rounded-sm space-y-4">
                <NField label="Judul Lembar Lontar Ini">
                  <input
                    value={activeLembar.judul ?? ''}
                    onChange={(e) => updateLembar(activeLembar.id, { judul: e.target.value })}
                    placeholder={`Lembar ${clampedLembarTab + 1}: ...`}
                    className={`${inputCls()} font-serif font-bold text-[#1A1816]`}
                  />
                </NField>

                <div className="p-4 bg-[#F9F6EE] border border-[#D5C9B2] rounded-sm">
                  <KoleksiPhotoUpload
                    label="Foto Scan HD Daun Lontar"
                    value={activeLembar.scanImage}
                    onChange={(url) => updateLembar(activeLembar.id, { scanImage: url })}
                  />
                </div>
              </div>
            </div>

            {/* Ayat editor */}
            <div className="bg-[#FFFDF9] p-6 border border-[#DCD3C1] rounded-sm shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-[#EAE3D3] pb-3">
                <h4 className="text-base font-['Playfair_Display',serif] font-bold text-[#1A1816] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#8A7144]" />
                  Ayat-Ayat pada {activeLembar.judul ? `Lembar ${clampedLembarTab + 1}: ${activeLembar.judul}` : `Lembar ${clampedLembarTab + 1}`}
                </h4>
                <button
                  type="button"
                  onClick={addVerse}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#8A7144] hover:bg-[#725C34] text-white text-xs font-bold rounded-sm cursor-pointer transition-colors shadow-sm shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Ayat Baru
                </button>
              </div>

              {activeLembar.verses.map((verse) => (
                <div key={verse.id} className="p-4 bg-[#F9F6EE] border border-[#D5C9B2] rounded-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-['Playfair_Display',serif] font-bold text-[#1A1816]">Ayat ke-{verse.verseNumber}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#7A7163]">{verse.words.length} Kata Terurai</span>
                      <button
                        type="button"
                        onClick={() => removeVerse(verse.id)}
                        title="Hapus ayat"
                        className="p-1.5 text-red-700 hover:bg-red-50 rounded-sm cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    <NField label="Teks Aksara Kuno">
                      <div className="relative">
                        <input
                          value={verse.verseAksara ?? ''}
                          onFocus={() => focusAndOpenKeyboard(fullVerseTargetId(verse.id))}
                          onChange={(e) => updateVerse(verse.id, { verseAksara: e.target.value })}
                          placeholder="ᮃᮓᮤ ᮔᮤᮀ ᮘᮥᮙᮤ…"
                          className={`${inputClsWhite()} font-serif text-lg pr-28 ${focusedWord === fullVerseTargetId(verse.id) ? 'border-2 border-[#8A7144]' : ''}`}
                        />
                        {focusedWord === fullVerseTargetId(verse.id) && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#8A7144] font-bold flex items-center gap-1 bg-[#F9F6EE] px-1.5 py-0.5 rounded-sm border border-[#D5C9B2] select-none">
                            <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                            Papan Ketik Aktif
                          </span>
                        )}
                      </div>
                    </NField>
                    <NField label="Transliterasi Latin">
                      <input
                        value={verse.verseLatin ?? ''}
                        onChange={(e) => updateVerse(verse.id, { verseLatin: e.target.value })}
                        placeholder="Adi ning bumi Talaga Manggung"
                        className={`${inputClsWhite()} italic`}
                      />
                    </NField>
                  </div>

                  <NField label="Terjemahan Bahasa Indonesia">
                    <textarea rows={2} value={verse.terjemahVerse} onChange={(e) => updateVerse(verse.id, { terjemahVerse: e.target.value })} placeholder="Inilah permulaan penceritaan tanah dan peradaban…" className={inputClsWhite()} />
                  </NField>
                  <NField label="Catatan Kebahasaan & Filologi">
                    <textarea rows={2} value={verse.catatan ?? ''} onChange={(e) => updateVerse(verse.id, { catatan: e.target.value })} className={inputClsWhite()} />
                  </NField>
                  <NField label="Makna & Tafsir">
                    <textarea rows={2} value={verse.makna ?? ''} onChange={(e) => updateVerse(verse.id, { makna: e.target.value })} className={inputClsWhite()} />
                  </NField>

                  <div className="pt-2 border-t border-dashed border-[#DCD3C1]">
                    <div className="flex items-center justify-between mb-2">
                      <SectionLabel>Uraian Tafsir Kata per Kata ({verse.words.length} kata)</SectionLabel>
                      <button
                        type="button"
                        onClick={() => addWord(verse.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#DCD3C1] hover:bg-[#F3EFE4] text-[#2C2825] text-xs font-semibold rounded-sm transition-colors cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Kata
                      </button>
                    </div>
                    {verse.words.length > 0 && (
                      <div className="space-y-2">
                        {verse.words.map((word) => (
                          <div key={word.id} className="p-2 bg-white border border-[#DCD3C1] rounded-sm grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-xs">
                            <div>
                              <span className="text-[9px] text-[#7A7163] font-bold block mb-0.5">Aksara:</span>
                              <div className="relative">
                                <input
                                  value={word.aksara}
                                  onFocus={() => focusAndOpenKeyboard(word.id)}
                                  onChange={(e) => updateWord(verse.id, word.id, { aksara: e.target.value })}
                                  placeholder="ᮃᮓᮤ"
                                  className={`w-full p-1.5 bg-[#F9F6EE] border rounded-sm font-serif text-sm font-bold text-[#8A7144] outline-none transition-all ${
                                    focusedWord === word.id ? 'ring-2 ring-[#8A7144] border-transparent' : 'border-[#DCD3C1] hover:border-[#8A7144]/60'
                                  }`}
                                />
                                {focusedWord === word.id && (
                                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500 animate-ping" title="Input Aktif" />
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-[9px] text-[#7A7163] font-bold block mb-0.5">Transliterasi:</span>
                              <input value={word.latin} onChange={(e) => updateWord(verse.id, word.id, { latin: e.target.value })} placeholder="Adi" className="w-full p-1.5 bg-[#F9F6EE] border border-[#DCD3C1] rounded-sm font-serif italic text-xs outline-none" />
                            </div>
                            <div>
                              <span className="text-[9px] text-[#7A7163] font-bold block mb-0.5">Arti Indonesia:</span>
                              <input value={word.terjemah} onChange={(e) => updateWord(verse.id, word.id, { terjemah: e.target.value })} placeholder="Permulaan" className="w-full p-1.5 bg-[#F9F6EE] border border-[#DCD3C1] rounded-sm text-xs outline-none" />
                            </div>
                            <div>
                              <span className="text-[9px] text-[#7A7163] font-bold block mb-0.5">Kelas Kata:</span>
                              <select value={word.kelas} onChange={(e) => updateWord(verse.id, word.id, { kelas: e.target.value })} className="w-full p-1.5 bg-[#F9F6EE] border border-[#DCD3C1] rounded-sm text-xs outline-none">
                                {kelasKataOptions.map((k) => (
                                  <option key={k} value={k}>{k}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => removeWord(verse.id, word.id)}
                                title="Hapus kata"
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP: REVIEW & FINALISASI */}
        {/* ============================================================ */}
        {step.kind === 'review' && (
          <div className="bg-[#FFFDF9] p-6 border border-[#DCD3C1] rounded-sm shadow-sm space-y-4">
            <div className="border-b border-[#EAE3D3] pb-3">
              <h3 className="text-xl font-['Playfair_Display',serif] font-bold text-[#1A1816] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#8A7144]" />
                3. Review &amp; Finalisasi
              </h3>
              <p className="text-xs text-[#6B5E4C] mt-0.5">Cek ringkasan sebelum disimpan ke situs publik.</p>
            </div>

            <p className="text-xs text-[#6B5E4C] leading-relaxed max-w-2xl">
              Cek ringkasan tiap lembar di bawah. Klik &quot;Edit&quot; untuk kembali ke lembar tertentu, atau tambah lembar
              baru kalau masih ada halaman yang belum dimasukkan. Klik <b>Simpan Arsip</b> kalau naskah sudah lengkap.
            </p>

            <div className="border border-[#DCD3C1] rounded-sm overflow-hidden divide-y divide-[#EAE3D3]">
              {naskah.lembar.map((l, i) => (
                <div key={l.id} className="flex items-center justify-between gap-4 p-4 bg-white">
                  <div>
                    <div className="text-base font-['Playfair_Display',serif] font-bold text-[#1A1816]">
                      Lembar {i + 1}{l.judul ? `: ${l.judul}` : ''}
                    </div>
                    <div className="text-[11px] text-[#8A8172] mt-0.5">
                      {l.verses.length} ayat &bull; {l.scanImage ? 'scan terpasang' : 'belum ada scan'}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => { setActiveLembarTab(i); navigateToStep(1) }}
                      className="px-3 py-1.5 border border-[#DCD3C1] hover:bg-[#F3EFE4] text-[#2C2825] text-xs font-semibold rounded-sm cursor-pointer transition-colors"
                    >
                      Edit
                    </button>
                    {naskah.lembar.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLembar(l.id)}
                        className="p-1.5 text-red-700 hover:bg-red-50 rounded-sm cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLembar}
              className="w-full py-3 border-2 border-dashed border-[#D5C9B2] hover:border-[#8A7144] text-[#8A7144] text-xs font-bold rounded-sm cursor-pointer transition-colors"
            >
              + Tambah Lembar Baru
            </button>

            <p className="text-xs text-[#8A8172]">
              Total: {naskah.lembar.length} lembar &bull; {naskah.lembar.reduce((sum, l) => sum + l.verses.length, 0)} ayat
            </p>

            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3 bg-[#8A7144] hover:bg-[#725C34] text-white font-bold text-sm rounded-sm cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan Arsip
            </button>
          </div>
        )}
      </div>

      {/* Panel keyboard di LUAR div ber-transform GSAP (contentRef) —
          position:fixed jadi bener nempel ke viewport, bukan ketarik
          ngikut container yang di-translate pas transisi step. */}
      <AksaraKeyboardPanel
        open={showKeyboard}
        onClose={() => setShowKeyboard(false)}
        onInsert={insertAksara}
        onBackspace={backspaceAksara}
        onSpace={spaceAksara}
        onClearAll={clearAksara}
        focusedLabel={focusedLabel}
        defaultScript={defaultScript}
      />

      {/* Navigasi langkah */}
      <div className="flex justify-between gap-2 pt-2">
        <button
          type="button"
          onClick={goBack}
          disabled={isFirstStep}
          className="px-4 py-2 border border-[#DCD3C1] text-[#2C2825] text-xs font-semibold rounded-sm cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-[#F3EFE4]"
        >
          ← Kembali
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-[#EAE3D3] hover:bg-[#DDD2BA] text-[#4A433A] font-semibold text-xs rounded-sm transition-colors cursor-pointer">
            Batal
          </button>
          {isLastStep ? (
            <button type="button" onClick={handleSave} className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#8A7144] hover:bg-[#725C34] text-white font-semibold text-xs rounded-sm transition-all cursor-pointer shadow-sm">
              <Save className="w-4 h-4" />
              Simpan Arsip
            </button>
          ) : (
            <button type="button" onClick={goNext} className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#8A7144] hover:bg-[#725C34] text-white font-semibold text-xs rounded-sm transition-all cursor-pointer shadow-sm">
              Lanjut →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
