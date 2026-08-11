'use client'

import { useState, useCallback } from 'react'
import { ScrollText, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { naskahSeed } from '@/data/naskah'
import type { LontarWord, LontarVerse, LontarNaskah } from '@/data/naskah'
import MediaGallery, { imagesToMedia } from './MediaGallery'

export type { LontarWord, LontarVerse, LontarNaskah }

// Data awal default (dipakai bila halaman tidak mengoper naskah)
export const sampleNaskah: LontarNaskah = naskahSeed[0]

// ============================================================
// TAFSIR KATA PER KATA — grid kata + panel inspeksi INLINE (dorong
// konten ke bawah), bukan tooltip mengambang yang bisa nutupin ayat
// di belakangnya.
// ============================================================
const kelasColor: Record<string, string> = {
  'kata kerja': '#5B6F5B',
  'kata benda': '#6F5B5B',
  'kata sifat': '#5B5B6F',
  'kata depan': '#6F6B5B',
  'partikel': '#5B6B6F',
  'nama diri': '#6F5B6B',
}

function WordTafsirGrid({
  words,
  selectedWordId,
  onSelectWord,
}: {
  words: LontarWord[]
  selectedWordId: string | null
  onSelectWord: (id: string | null) => void
}) {
  const activeWord = words.find((w) => w.id === selectedWordId) ?? null

  return (
    <div className="pt-4 border-t border-[#E2DBD0]">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8A7144] mb-2.5">
        Tafsir kata per kata (sorot / ketuk kata untuk detail)
      </span>

      <div className="flex flex-wrap gap-1.5">
        {words.map((word) => {
          const isActive = selectedWordId === word.id
          return (
            <button
              key={word.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelectWord(isActive ? null : word.id)
              }}
              className={`px-2.5 py-1.5 rounded-sm border transition-colors cursor-pointer flex flex-col items-center gap-0.5 ${
                isActive ? 'bg-[#8A7144] border-[#8A7144] text-white' : 'bg-white border-[#DCD3C1] hover:border-[#8A7144] text-[#2C2825]'
              }`}
            >
              <span className="font-serif text-base">{word.aksara}</span>
              <span className={`font-mono text-[10px] ${isActive ? 'text-white/85' : 'text-[#8A8172]'}`}>{word.latin}</span>
            </button>
          )
        })}
      </div>

      {activeWord && (
        <div onClick={(e) => e.stopPropagation()} className="mt-3 p-4 bg-[#F3EFE4] border-l-4 border-[#8A7144] rounded-r-sm">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex items-center gap-3">
              <span className="text-xl font-serif bg-white border border-[#DCD3C1] px-2.5 py-1 rounded-sm">{activeWord.aksara}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif italic font-bold text-sm text-[#1A1816]">&quot;{activeWord.latin}&quot;</span>
                  {activeWord.kelas && (
                    <span
                      className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm text-white font-bold"
                      style={{ background: kelasColor[activeWord.kelas] || '#8A7144' }}
                    >
                      {activeWord.kelas}
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#6B635B]">
                  Arti: <strong className="text-[#2C2825]">{activeWord.terjemah}</strong>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectWord(null)}
              title="Tutup analisis kata"
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#8A8172] hover:text-[#2C2825] bg-white hover:bg-[#EAE3D3] rounded-sm px-2 py-1 cursor-pointer transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// VERSE PANEL — drawer detail ayat penuh (makna, catatan, tiap kata)
// ============================================================
interface VersePanelProps {
  verse: LontarVerse
  onClose: () => void
}

function VersePanel({ verse, onClose }: VersePanelProps) {
  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-[440px] bg-[#FFFDF9] border-l border-[#DCD3C1] z-[60] overflow-y-auto p-6 sm:p-8 shadow-2xl">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 flex items-center gap-1.5 font-mono text-[11px] tracking-wider uppercase text-[#8A7144] hover:text-[#2C2825] cursor-pointer bg-transparent border-0"
      >
        Tutup <X className="w-3.5 h-3.5" />
      </button>

      <span className="block font-mono text-[11px] tracking-[0.2em] uppercase text-[#8A7144] mt-8 mb-3">
        Ayat {verse.verseNumber}
      </span>

      <div className="bg-[#F3EFE4] border border-[#DCD3C1] rounded-sm p-5 mb-5 text-center">
        <p className="font-serif text-2xl leading-relaxed tracking-wide text-[#2C2825]">{verse.verseAksara || verse.words.map((w) => w.aksara).join(' ')}</p>
        <p className="font-serif italic text-sm text-[#8A7144] mt-2">{verse.verseLatin || verse.words.map((w) => w.latin).join(' ')}</p>
      </div>

      <div className="border-t border-[#E2DBD0] pt-4 mb-5">
        <span className="block font-mono text-[10px] tracking-[0.18em] uppercase text-[#8A8172] mb-2">Terjemahan</span>
        <p className="font-serif font-bold text-lg leading-snug text-[#1A1816]">{verse.terjemahVerse}</p>
      </div>

      {verse.makna && (
        <div className="border-t border-[#E2DBD0] pt-4 mb-5">
          <span className="block font-mono text-[10px] tracking-[0.18em] uppercase text-[#8A8172] mb-2">Makna &amp; Tafsir</span>
          <p className="text-sm leading-relaxed text-[#2C2825]">{verse.makna}</p>
        </div>
      )}

      {verse.catatan && (
        <div className="border-t border-[#E2DBD0] pt-4 mb-5">
          <span className="block font-mono text-[10px] tracking-[0.18em] uppercase text-[#8A8172] mb-2">Catatan Filologi</span>
          <p className="text-xs italic leading-relaxed text-[#6B635B]">{verse.catatan}</p>
        </div>
      )}

      <div className="border-t border-[#E2DBD0] pt-4">
        <span className="block font-mono text-[10px] tracking-[0.18em] uppercase text-[#8A8172] mb-3">Terjemah Per Kata</span>
        {verse.words.map((word) => (
          <div key={word.id} className="flex justify-between items-baseline py-2 border-b border-[#EFEAE0]">
            <div>
              <span className="font-serif text-lg mr-2 text-[#2C2825]">{word.aksara}</span>
              <span className="font-serif italic text-xs text-[#8A7144]">{word.latin}</span>
            </div>
            <span className="text-xs text-[#2C2825] text-right max-w-[170px]">{word.terjemah}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// MAIN LONTAR READER COMPONENT
// ============================================================
interface LontarReaderProps {
  naskah?: LontarNaskah
}

export default function LontarReader({ naskah = sampleNaskah }: LontarReaderProps) {
  // Satu id kata terpilih cukup — antar-lembar/ayat ga akan tabrakan
  // karena cuma ayat pada lembar aktif yang dirender sekaligus.
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null)
  const [activeVerse, setActiveVerse] = useState<LontarVerse | null>(null)
  const [activeLembarIdx, setActiveLembarIdx] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)

  const totalLembar = naskah.lembar.length
  const currentLembar = naskah.lembar[Math.min(activeLembarIdx, totalLembar - 1)]
  const goPrevLembar = () => {
    setActiveVerse(null)
    setSelectedWordId(null)
    setActiveLembarIdx((i) => Math.max(0, i - 1))
  }
  const goNextLembar = () => {
    setActiveVerse(null)
    setSelectedWordId(null)
    setActiveLembarIdx((i) => Math.min(totalLembar - 1, i + 1))
  }

  const handleVerseClick = useCallback((verse: LontarVerse, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.wordid) return
    setActiveVerse(verse)
  }, [])

  const LembarNav = () => (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#F3EFE4] border border-[#DCD3C1] rounded-sm">
      <button
        onClick={goPrevLembar}
        disabled={activeLembarIdx === 0}
        className={`inline-flex items-center gap-1 font-mono text-[11px] tracking-wider uppercase ${
          activeLembarIdx === 0 ? 'text-[#B0A798] cursor-default' : 'text-[#2C2825] hover:text-[#8A7144] cursor-pointer'
        }`}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Sebelumnya
      </button>
      <span className="font-mono text-[11px] tracking-wider uppercase text-[#8A7144] font-bold">
        Lembar {activeLembarIdx + 1} / {totalLembar}
      </span>
      <button
        onClick={goNextLembar}
        disabled={activeLembarIdx === totalLembar - 1}
        className={`inline-flex items-center gap-1 font-mono text-[11px] tracking-wider uppercase ${
          activeLembarIdx === totalLembar - 1 ? 'text-[#B0A798] cursor-default' : 'text-[#2C2825] hover:text-[#8A7144] cursor-pointer'
        }`}
      >
        Berikutnya
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )

  return (
    <div className="relative">
      <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Header info naskah */}
        <div className="bg-white border border-[#DCD3C1] rounded-sm p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {naskah.aksaraType && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#2C2825] text-[#E8D099] text-[10px] font-bold uppercase tracking-wide">
                {naskah.aksaraType}
              </span>
            )}
            <span className="text-xs text-[#8A8172]">
              {naskah.tahun}{naskah.sumber ? ` • ${naskah.sumber}` : ''}
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#2C2825] leading-tight mb-2">{naskah.title}</h1>
          <p className="text-sm text-[#6B635B] leading-relaxed border-t border-[#E2DBD0] pt-3 mt-3">
            Membaca dan meneliti lembar naskah kuno digital dengan anotasi kata per kata dan transliterasi interaktif.
          </p>
        </div>

        {/* Cover + Gallery + Sinopsis */}
        {(naskah.coverImage || naskah.images?.length || naskah.sinopsis) && (
          <div className="bg-white border border-[#DCD3C1] rounded-sm p-5 sm:p-6 shadow-sm space-y-5">
            {naskah.images && naskah.images.length > 0 ? (
              <MediaGallery media={imagesToMedia(naskah.images)} title={naskah.title} />
            ) : naskah.coverImage ? (
              <div className="w-full max-w-2xl mx-auto rounded-sm overflow-hidden border border-[#DCD3C1]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={naskah.coverImage} alt={naskah.title} className="w-full h-auto max-h-[420px] object-cover block" />
              </div>
            ) : null}

            {naskah.sinopsis && (
              <p className="font-serif text-lg sm:text-xl font-bold text-[#2C2825] text-center max-w-xl mx-auto leading-relaxed">
                {naskah.sinopsis}
              </p>
            )}
          </div>
        )}

        {/* Instruksi singkat */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 px-4 sm:px-6 py-3 bg-[#F3EFE4] border border-[#DCD3C1] rounded-sm">
          {[
            { icon: '①', text: 'Ketuk kata untuk tafsir per kata' },
            { icon: '②', text: 'Ketuk baris ayat untuk makna keseluruhan' },
            { icon: '③', text: 'Titik kecil = ayat ini punya tafsir' },
          ].map((item) => (
            <div key={item.icon} className="flex items-center gap-2">
              <span className="font-serif font-black text-sm text-[#8A7144]">{item.icon}</span>
              <span className="font-mono text-[11px] text-[#6B635B]">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Navigasi lembar — atas */}
        {totalLembar > 1 && <LembarNav />}

        {/* Scan daun lontar asli — lembar aktif */}
        {currentLembar.scanImage && (
          <div className="bg-white border border-[#DCD3C1] rounded-sm overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#F3EFE4] border-b border-[#DCD3C1]">
              <span className="inline-flex items-center gap-1.5 font-serif font-bold text-sm text-[#8A7144]">
                <ScrollText className="w-4 h-4" />
                Lembar {currentLembar.lembarNumber}
              </span>
              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#8A7144] hover:bg-[#725C34] text-white text-[10px] font-bold rounded-sm cursor-pointer transition-colors"
              >
                <ZoomIn className="w-3 h-3" />
                Perbesar
              </button>
            </div>
            <button type="button" onClick={() => setZoomOpen(true)} className="block w-full cursor-zoom-in">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentLembar.scanImage}
                alt={`Scan lembar ${currentLembar.lembarNumber}`}
                className="w-full max-h-[360px] object-contain bg-[#EFEAE0]"
              />
            </button>
          </div>
        )}

        {/* Ayat — lembar aktif */}
        <div className="space-y-4">
          {currentLembar.verses.map((verse) => (
            <div
              key={verse.id}
              onClick={(e) => handleVerseClick(verse, e)}
              className="bg-white border border-[#DCD3C1] rounded-sm p-5 sm:p-6 shadow-sm hover:border-[#B09971] transition-colors cursor-pointer flex gap-4 sm:gap-6"
            >
              <div className="w-8 shrink-0 pt-1">
                <span className="font-serif italic text-sm text-[#8A7144]">{verse.verseNumber}</span>
                {verse.makna && <div className="w-1.5 h-1.5 rounded-full bg-[#8A7144] mt-1.5 opacity-60" />}
              </div>

              <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-wrap gap-x-3 gap-y-1 items-baseline mb-2">
                  {verse.words.map((word) => (
                    <span
                      key={word.id}
                      data-wordid={word.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedWordId((cur) => (cur === word.id ? null : word.id))
                      }}
                      className={`font-serif text-2xl sm:text-3xl leading-relaxed px-1 rounded-sm cursor-pointer transition-colors ${
                        selectedWordId === word.id ? 'bg-[#8A7144] text-white' : 'text-[#2C2825] hover:bg-[#F3EFE4]'
                      }`}
                    >
                      {word.aksara}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                  {verse.words.map((word) => (
                    <span key={word.id + '-latin'} className="font-serif italic text-xs text-[#8A7144]">
                      {word.latin}
                    </span>
                  ))}
                </div>

                <p
                  className={`text-sm sm:text-base text-[#2C2825] leading-relaxed ${
                    verse.makna ? 'border-l-2 border-[#8A7144] pl-3' : ''
                  }`}
                >
                  {verse.terjemahVerse}
                </p>

                <WordTafsirGrid
                  words={verse.words}
                  selectedWordId={selectedWordId && verse.words.some((w) => w.id === selectedWordId) ? selectedWordId : null}
                  onSelectWord={setSelectedWordId}
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveVerse(verse)
                  }}
                  className="mt-3 text-xs font-semibold text-[#8A7144] hover:text-[#725C34] cursor-pointer"
                >
                  {verse.makna ? 'Lihat tafsir lengkap →' : 'Lihat detail ayat →'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigasi lembar — bawah */}
        {totalLembar > 1 && <LembarNav />}
      </div>

      {/* Zoom scan lembar */}
      {zoomOpen && currentLembar.scanImage && (
        <div
          onClick={() => setZoomOpen(false)}
          className="fixed inset-0 z-[70] bg-black/85 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute top-5 right-5 text-white/70 hover:text-white cursor-pointer"
            title="Tutup"
          >
            <X className="w-7 h-7" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentLembar.scanImage}
            alt={`Scan lembar ${currentLembar.lembarNumber}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {/* Verse Panel */}
      {activeVerse && <VersePanel verse={activeVerse} onClose={() => setActiveVerse(null)} />}
    </div>
  )
}
