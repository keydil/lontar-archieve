'use client'

import { useState, useRef, useCallback } from 'react'

// ============================================================
// DATA TYPES
// ============================================================
export interface LontarWord {
  id: string
  aksara: string       // Original script (aksara sunda/lontar)
  latin: string        // Latinisasi
  terjemah: string     // Word-level translation
  kelas?: string       // Grammar class: 'kata kerja' | 'kata benda' | 'kata sifat' | etc
}

export interface LontarVerse {
  id: string
  verseNumber: number
  words: LontarWord[]
  terjemahVerse: string   // Full verse translation
  makna?: string          // Deeper meaning / tafsir (optional, not every verse has it)
  catatan?: string        // Scholarly notes
}

export interface LontarNaskah {
  id: string
  title: string
  sumber: string
  tahun: string
  verses: LontarVerse[]
}

// ============================================================
// SAMPLE DATA — Replace with real data from Pa Edo
// ============================================================
export const sampleNaskah: LontarNaskah = {
  id: 'carita-parahyangan-001',
  title: 'Carita Parahyangan',
  sumber: 'Koleksi Pribadi — Arsip Lontar Sunda',
  tahun: 'Abad ke-16 M',
  verses: [
    {
      id: 'v1',
      verseNumber: 1,
      words: [
        { id: 'v1w1', aksara: 'ᮃᮓᮤ', latin: 'Adi', terjemah: 'Permulaan / Awal', kelas: 'kata benda' },
        { id: 'v1w2', aksara: 'ᮊᮤᮒ', latin: 'ning', terjemah: 'dari / milik', kelas: 'kata depan' },
        { id: 'v1w3', aksara: 'ᮘᮥᮙᮤ', latin: 'bumi', terjemah: 'bumi / tanah', kelas: 'kata benda' },
        { id: 'v1w4', aksara: 'ᮞᮥᮔ᮪ᮓ', latin: 'Sunda', terjemah: 'Sunda (nama wilayah)', kelas: 'nama diri' },
      ],
      terjemahVerse: 'Permulaan dari bumi Sunda.',
      makna: 'Kalimat pembuka ini menegaskan bahwa kisah yang akan diceritakan berakar dari tanah Sunda — bukan sekadar lokasi geografis, melainkan identitas peradaban yang akan diuraikan sepanjang naskah.',
      catatan: 'Kata "Adi" dalam konteks naskah Sunda kuno sering bermakna ganda: permulaan waktu sekaligus kemuliaan asal-usul.',
    },
    {
      id: 'v2',
      verseNumber: 2,
      words: [
        { id: 'v2w1', aksara: 'ᮞᮤ', latin: 'Si', terjemah: 'Sang / Si (penanda subjek)', kelas: 'partikel' },
        { id: 'v2w2', aksara: 'ᮛᮏ', latin: 'Raja', terjemah: 'Raja / Pemimpin', kelas: 'kata benda' },
        { id: 'v2w3', aksara: 'ᮙᮥᮜᮤᮃ', latin: 'mulia', terjemah: 'mulia / terhormat', kelas: 'kata sifat' },
        { id: 'v2w4', aksara: 'ᮘᮥᮜᮔ᮪', latin: 'bulana', terjemah: 'bulannya / pada masanya', kelas: 'kata benda' },
      ],
      terjemahVerse: 'Sang Raja yang mulia pada masanya.',
      makna: undefined,
      catatan: 'Frasa "bulana" merujuk pada era pemerintahan, bukan bulan kalender.',
    },
    {
      id: 'v3',
      verseNumber: 3,
      words: [
        { id: 'v3w1', aksara: 'ᮙᮔ᮪ᮓᮜ᮪', latin: 'Mandal', terjemah: 'Menetapkan / Menentukan', kelas: 'kata kerja' },
        { id: 'v3w2', aksara: 'ᮊᮥ', latin: 'ku', terjemah: 'oleh / dengan', kelas: 'kata depan' },
        { id: 'v3w3', aksara: 'ᮠᮥᮊᮥᮙ᮪', latin: 'hukum', terjemah: 'hukum / aturan', kelas: 'kata benda' },
        { id: 'v3w4', aksara: 'ᮃᮓᮒ᮪', latin: 'adat', terjemah: 'adat / tradisi', kelas: 'kata benda' },
        { id: 'v3w5', aksara: 'ᮜᮊ᮪ᮞᮔ', latin: 'laksana', terjemah: 'yang dijalankan / sesuai', kelas: 'kata kerja' },
      ],
      terjemahVerse: 'Menetapkan tatanan dengan hukum adat yang dijalankan.',
      makna: 'Ayat ini menggambarkan fondasi pemerintahan Sunda kuno yang bersandar pada hukum adat — bukan kekuasaan semata, melainkan legitimasi yang datang dari tradisi leluhur yang hidup di tengah masyarakat.',
      catatan: 'Kombinasi "hukum adat laksana" adalah frasa baku dalam naskah-naskah Sunda abad ke-15 hingga ke-17 yang menandai sistem yurisprudensi adat.',
    },
  ],
}

// ============================================================
// TOOLTIP COMPONENT
// ============================================================
interface TooltipProps {
  word: LontarWord
  onClose: () => void
  position: { x: number; y: number }
}

function WordTooltip({ word, onClose, position }: TooltipProps) {
  const kelasColor: Record<string, string> = {
    'kata kerja': '#5B6F5B',
    'kata benda': '#6F5B5B',
    'kata sifat': '#5B5B6F',
    'kata depan': '#6F6B5B',
    'partikel': '#5B6B6F',
    'nama diri': '#6F5B6B',
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        left: Math.min(position.x, window.innerWidth - 280),
        top: position.y + 16,
        zIndex: 2000,
        background: 'var(--charcoal)',
        color: 'var(--bone)',
        padding: '1.25rem 1.5rem',
        width: '260px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '22px', fontFamily: 'serif', display: 'block', marginBottom: '2px' }}>
            {word.aksara}
          </span>
          <span style={{ fontSize: '13px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'rgba(240,237,230,0.7)' }}>
            {word.latin}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'rgba(240,237,230,0.4)', cursor: 'pointer', fontSize: '16px', padding: 0, marginTop: '-2px' }}
        >
          ×
        </button>
      </div>

      {/* Kelas kata badge */}
      {word.kelas && (
        <span style={{
          display: 'inline-block',
          fontSize: '8px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          padding: '2px 8px',
          background: kelasColor[word.kelas] || '#555',
          marginBottom: '0.75rem',
          fontFamily: "'DM Mono', monospace",
        }}>
          {word.kelas}
        </span>
      )}

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(240,237,230,0.15)', marginBottom: '0.75rem' }} />

      {/* Terjemah */}
      <p style={{ fontSize: '14px', fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.4 }}>
        {word.terjemah}
      </p>
    </div>
  )
}

// ============================================================
// VERSE PANEL COMPONENT
// ============================================================
interface VersePanelProps {
  verse: LontarVerse
  onClose: () => void
}

function VersePanel({ verse, onClose }: VersePanelProps) {
  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      width: '420px',
      background: 'var(--bone)',
      borderLeft: '1px solid var(--border)',
      zIndex: 1500,
      overflowY: 'auto',
      padding: '3rem 2.5rem',
    }}>
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontFamily: "'DM Mono', monospace",
          color: 'var(--warm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        Tutup ×
      </button>

      {/* Verse number */}
      <span style={{
        fontSize: '9px',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'var(--warm)',
        fontFamily: "'DM Mono', monospace",
        display: 'block',
        marginBottom: '1rem',
        marginTop: '1rem',
      }}>
        Ayat {verse.verseNumber}
      </span>

      {/* Aksara display */}
      <div style={{
        background: '#E8E4DC',
        border: '1px solid var(--border)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '24px', fontFamily: 'serif', lineHeight: 1.8, letterSpacing: '0.1em' }}>
          {verse.words.map(w => w.aksara).join(' ')}
        </p>
        <p style={{ fontSize: '12px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--warm)', marginTop: '0.5rem' }}>
          {verse.words.map(w => w.latin).join(' ')}
        </p>
      </div>

      {/* Terjemah ayat */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--warm)', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: '0.75rem' }}>
          Terjemahan
        </span>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, lineHeight: 1.5 }}>
          {verse.terjemahVerse}
        </p>
      </div>

      {/* Makna — only if exists */}
      {verse.makna && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--warm)', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: '0.75rem' }}>
            Makna & Tafsir
          </span>
          <p style={{ fontSize: '12px', lineHeight: 2.1, color: 'var(--charcoal)', fontFamily: "'DM Mono', monospace", fontWeight: 300 }}>
            {verse.makna}
          </p>
        </div>
      )}

      {/* Catatan */}
      {verse.catatan && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--warm)', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: '0.75rem' }}>
            Catatan Filologi
          </span>
          <p style={{ fontSize: '11px', lineHeight: 1.9, color: 'var(--warm)', fontFamily: "'DM Mono', monospace", fontStyle: 'italic' }}>
            {verse.catatan}
          </p>
        </div>
      )}

      {/* Word breakdown */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
        <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--warm)', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: '1rem' }}>
          Terjemah Per Kata
        </span>
        {verse.words.map(word => (
          <div key={word.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.6rem 0', borderBottom: '1px solid rgba(17,17,16,0.06)' }}>
            <div>
              <span style={{ fontSize: '16px', fontFamily: 'serif', marginRight: '0.75rem' }}>{word.aksara}</span>
              <span style={{ fontSize: '11px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--warm)' }}>{word.latin}</span>
            </div>
            <span style={{ fontSize: '11px', fontFamily: "'DM Mono', monospace", color: 'var(--charcoal)', textAlign: 'right', maxWidth: '140px' }}>
              {word.terjemah}
            </span>
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
  const [activeWord, setActiveWord] = useState<LontarWord | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [activeVerse, setActiveVerse] = useState<LontarVerse | null>(null)
  const [hoveredVerse, setHoveredVerse] = useState<string | null>(null)

  const handleWordClick = useCallback((word: LontarWord, e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setTooltipPos({ x: rect.left, y: rect.bottom })
    setActiveWord(word)
    setActiveVerse(null)
  }, [])

  const handleVerseClick = useCallback((verse: LontarVerse, e: React.MouseEvent) => {
    // Only trigger if not clicking a word
    if ((e.target as HTMLElement).dataset.wordid) return
    setActiveVerse(verse)
    setActiveWord(null)
  }, [])

  return (
    <div
      onClick={() => { setActiveWord(null) }}
      style={{ position: 'relative', minHeight: '100vh', background: 'var(--bone)' }}
    >
      {/* Header */}
      <div style={{
        padding: '4rem 4rem 2rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}>
        <div>
          <span style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--warm)', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: '0.75rem' }}>
            Baca & Terjemah — Interaktif
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {naskah.title}
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'var(--warm)', fontFamily: "'DM Mono', monospace', lineHeight: 2" }}>
            {naskah.sumber}<br />{naskah.tahun}
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        padding: '1.25rem 4rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        gap: '3rem',
        background: '#E8E4DC',
      }}>
        {[
          { icon: '①', text: 'Tap kata untuk terjemah per kata' },
          { icon: '②', text: 'Tap baris/ayat untuk makna keseluruhan' },
          { icon: '③', text: 'Ayat dengan garis bawah memiliki tafsir' },
        ].map(item => (
          <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '14px', fontFamily: "'Playfair Display', serif", fontWeight: 900 }}>{item.icon}</span>
            <span style={{ fontSize: '10px', letterSpacing: '0.05em', color: 'var(--warm)', fontFamily: "'DM Mono', monospace" }}>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Verses */}
      <div style={{ padding: '3rem 4rem', maxWidth: activeVerse ? 'calc(100% - 420px)' : '100%', transition: 'max-width 0.4s ease' }}>
        {naskah.verses.map((verse) => (
          <div
            key={verse.id}
            onMouseEnter={() => setHoveredVerse(verse.id)}
            onMouseLeave={() => setHoveredVerse(null)}
            onClick={(e) => handleVerseClick(verse, e)}
            style={{
              display: 'flex',
              gap: '3rem',
              padding: '2.5rem 0',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
              background: hoveredVerse === verse.id ? 'rgba(17,17,16,0.02)' : 'transparent',
              transition: 'background 0.2s',
              position: 'relative',
            }}
          >
            {/* Verse number */}
            <div style={{ width: '40px', flexShrink: 0, paddingTop: '4px' }}>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '13px',
                color: 'var(--warm)',
                fontStyle: 'italic',
              }}>
                {verse.verseNumber}
              </span>
              {verse.makna && (
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--charcoal)', marginTop: '6px', opacity: 0.4 }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              {/* Aksara row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.75rem', marginBottom: '1rem', alignItems: 'baseline' }}>
                {verse.words.map((word) => (
                  <span
                    key={word.id}
                    data-wordid={word.id}
                    onClick={(e) => handleWordClick(word, e)}
                    style={{
                      fontFamily: 'serif',
                      fontSize: '28px',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: '2px',
                      background: activeWord?.id === word.id ? 'var(--charcoal)' : 'transparent',
                      color: activeWord?.id === word.id ? 'var(--bone)' : 'var(--charcoal)',
                      transition: 'background 0.15s, color 0.15s',
                      lineHeight: 1.6,
                      display: 'inline-block',
                    }}
                    onMouseEnter={e => {
                      if (activeWord?.id !== word.id) {
                        (e.target as HTMLElement).style.background = 'rgba(17,17,16,0.08)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (activeWord?.id !== word.id) {
                        (e.target as HTMLElement).style.background = 'transparent'
                      }
                    }}
                  >
                    {word.aksara}
                  </span>
                ))}
              </div>

              {/* Latin row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.75rem', marginBottom: '1.25rem' }}>
                {verse.words.map((word) => (
                  <span
                    key={word.id + '-latin'}
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '13px',
                      fontStyle: 'italic',
                      color: 'var(--warm)',
                    }}
                  >
                    {word.latin}
                  </span>
                ))}
              </div>

              {/* Terjemah */}
              <p style={{
                fontSize: '14px',
                fontFamily: "'DM Mono', monospace",
                color: 'var(--charcoal)',
                lineHeight: 1.8,
                borderLeft: verse.makna ? '2px solid var(--charcoal)' : '2px solid transparent',
                paddingLeft: verse.makna ? '1rem' : '0',
                fontWeight: 300,
              }}>
                {verse.terjemahVerse}
              </p>
            </div>

            {/* Tap hint */}
            {hoveredVerse === verse.id && (
              <div style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '9px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--warm)',
                fontFamily: "'DM Mono', monospace",
                opacity: 0.6,
              }}>
                {verse.makna ? 'Ada tafsir →' : 'Lihat detail →'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Word Tooltip */}
      {activeWord && (
        <WordTooltip
          word={activeWord}
          position={tooltipPos}
          onClose={() => setActiveWord(null)}
        />
      )}

      {/* Verse Panel */}
      {activeVerse && (
        <VersePanel
          verse={activeVerse}
          onClose={() => setActiveVerse(null)}
        />
      )}
    </div>
  )
}
