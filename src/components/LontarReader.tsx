'use client'

import { useState, useCallback } from 'react'
import { naskahSeed } from '@/data/naskah'
import type { LontarWord, LontarVerse, LontarNaskah } from '@/data/naskah'
import MediaGallery, { imagesToMedia } from './MediaGallery'

export type { LontarWord, LontarVerse, LontarNaskah }

// Data awal default (dipakai bila halaman tidak mengoper naskah)
export const sampleNaskah: LontarNaskah = naskahSeed[0]

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
        left: Math.min(position.x, window.innerWidth - 300),
        top: position.y + 16,
        zIndex: 2000,
        background: 'var(--charcoal)',
        color: 'var(--bone)',
        padding: '1.25rem 1.5rem',
        width: '280px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '24px', fontFamily: 'serif', display: 'block', marginBottom: '2px' }}>
            {word.aksara}
          </span>
          <span style={{ fontSize: '14px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'rgba(240,237,230,0.75)' }}>
            {word.latin}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'rgba(240,237,230,0.5)', cursor: 'pointer', fontSize: '18px', padding: 0, marginTop: '-2px' }}
        >
          ×
        </button>
      </div>

      {/* Kelas kata badge */}
      {word.kelas && (
        <span style={{
          display: 'inline-block',
          fontSize: '10px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '3px 8px',
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
      <p style={{ fontSize: '16px', fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.4 }}>
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
      width: '460px',
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
          fontSize: '12px',
          letterSpacing: '0.15em',
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
        fontSize: '11px',
        letterSpacing: '0.25em',
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
        <p style={{ fontSize: '26px', fontFamily: 'serif', lineHeight: 1.8, letterSpacing: '0.1em' }}>
          {verse.words.map(w => w.aksara).join(' ')}
        </p>
        <p style={{ fontSize: '14px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--warm)', marginTop: '0.5rem' }}>
          {verse.words.map(w => w.latin).join(' ')}
        </p>
      </div>

      {/* Terjemah ayat */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--warm)', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: '0.75rem' }}>
          Terjemahan
        </span>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '19px', fontWeight: 700, lineHeight: 1.5 }}>
          {verse.terjemahVerse}
        </p>
      </div>

      {/* Makna — only if exists */}
      {verse.makna && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--warm)', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: '0.75rem' }}>
            Makna & Tafsir
          </span>
          <p style={{ fontSize: '14px', lineHeight: 1.9, color: 'var(--charcoal)', fontFamily: "'DM Mono', monospace", fontWeight: 300 }}>
            {verse.makna}
          </p>
        </div>
      )}

      {/* Catatan */}
      {verse.catatan && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--warm)', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: '0.75rem' }}>
            Catatan Filologi
          </span>
          <p style={{ fontSize: '13px', lineHeight: 1.8, color: 'var(--warm)', fontFamily: "'DM Mono', monospace", fontStyle: 'italic' }}>
            {verse.catatan}
          </p>
        </div>
      )}

      {/* Word breakdown */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--warm)', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: '1rem' }}>
          Terjemah Per Kata
        </span>
        {verse.words.map(word => (
          <div key={word.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.6rem 0', borderBottom: '1px solid rgba(17,17,16,0.06)' }}>
            <div>
              <span style={{ fontSize: '18px', fontFamily: 'serif', marginRight: '0.75rem' }}>{word.aksara}</span>
              <span style={{ fontSize: '13px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--warm)' }}>{word.latin}</span>
            </div>
            <span style={{ fontSize: '13px', fontFamily: "'DM Mono', monospace", color: 'var(--charcoal)', textAlign: 'right', maxWidth: '170px' }}>
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
  const [activeLembarIdx, setActiveLembarIdx] = useState(0)

  const totalLembar = naskah.lembar.length
  const currentLembar = naskah.lembar[Math.min(activeLembarIdx, totalLembar - 1)]
  const goPrevLembar = () => {
    setActiveVerse(null)
    setActiveWord(null)
    setActiveLembarIdx((i) => Math.max(0, i - 1))
  }
  const goNextLembar = () => {
    setActiveVerse(null)
    setActiveWord(null)
    setActiveLembarIdx((i) => Math.min(totalLembar - 1, i + 1))
  }

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
          <span style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--warm)', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: '0.75rem' }}>
            Baca & Terjemah — Interaktif
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {naskah.title}
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '12px', letterSpacing: '0.08em', color: 'var(--warm)', fontFamily: "'DM Mono', monospace", lineHeight: 1.7 }}>
            {naskah.sumber}<br />{naskah.tahun}
          </p>
        </div>
      </div>

      {/* Cover + Gallery + Sinopsis */}
      {(naskah.coverImage || naskah.images?.length || naskah.sinopsis) && (
        <div style={{
          padding: '4rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2.5rem',
          background: 'var(--bone)',
        }}>
          {/* Galeri foto naskah — foto saja, tanpa video/3D */}
          {naskah.images && naskah.images.length > 0 ? (
            <MediaGallery media={imagesToMedia(naskah.images)} title={naskah.title} />
          ) : naskah.coverImage ? (
            <div style={{
              width: '100%',
              maxWidth: '960px',
              border: '6px solid var(--charcoal)',
              background: 'var(--charcoal)',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={naskah.coverImage}
                alt={naskah.title}
                style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ) : null}

          {/* Sinopsis */}
          {naskah.sinopsis && (
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(22px, 3.5vw, 30px)',
              fontWeight: 700,
              color: 'var(--charcoal)',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.5,
              marginTop: '0.5rem',
            }}>
              {naskah.sinopsis}
            </h3>
          )}
        </div>
      )}

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
            <span style={{ fontSize: '15px', fontFamily: "'Playfair Display', serif", fontWeight: 900 }}>{item.icon}</span>
            <span style={{ fontSize: '12px', letterSpacing: '0.04em', color: 'var(--warm)', fontFamily: "'DM Mono', monospace" }}>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Navigasi Lembar — biar kaya e-book, halaman per halaman */}
      {totalLembar > 1 && (
        <div style={{
          padding: '1.25rem 4rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#E8E4DC',
        }}>
          <button
            onClick={goPrevLembar}
            disabled={activeLembarIdx === 0}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: activeLembarIdx === 0 ? 'rgba(94,91,84,0.35)' : 'var(--charcoal)',
              background: 'none',
              border: 'none',
              cursor: activeLembarIdx === 0 ? 'default' : 'pointer',
              padding: 0,
            }}
          >
            ← Halaman Sebelumnya
          </button>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm)' }}>
            Lembar {activeLembarIdx + 1} / {totalLembar}
          </span>
          <button
            onClick={goNextLembar}
            disabled={activeLembarIdx === totalLembar - 1}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: activeLembarIdx === totalLembar - 1 ? 'rgba(94,91,84,0.35)' : 'var(--charcoal)',
              background: 'none',
              border: 'none',
              cursor: activeLembarIdx === totalLembar - 1 ? 'default' : 'pointer',
              padding: 0,
            }}
          >
            Halaman Berikutnya →
          </button>
        </div>
      )}

      {/* Scan daun lontar asli — lembar aktif */}
      {currentLembar.scanImage && (
        <div style={{ padding: '2rem 4rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentLembar.scanImage}
            alt={`Scan lembar ${currentLembar.lembarNumber}`}
            style={{ maxHeight: '360px', width: 'auto', border: '1px solid var(--border)', objectFit: 'contain', background: '#E8E4DC' }}
          />
        </div>
      )}

      {/* Verses — lembar aktif */}
      <div style={{ padding: '3rem 4rem', maxWidth: activeVerse ? 'calc(100% - 460px)' : '100%', transition: 'max-width 0.4s ease' }}>
        {currentLembar.verses.map((verse) => (
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
            <div style={{ width: '48px', flexShrink: 0, paddingTop: '4px' }}>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '15px',
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
                      fontSize: '30px',
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
                      fontSize: '14px',
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
                fontSize: '16px',
                fontFamily: "'DM Mono', monospace",
                color: 'var(--charcoal)',
                lineHeight: 1.75,
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
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--warm)',
                fontFamily: "'DM Mono', monospace",
                opacity: 0.7,
              }}>
                {verse.makna ? 'Ada tafsir →' : 'Lihat detail →'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigasi Lembar — bawah */}
      {totalLembar > 1 && (
        <div style={{
          padding: '2rem 4rem 3rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={goPrevLembar}
            disabled={activeLembarIdx === 0}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: activeLembarIdx === 0 ? 'rgba(94,91,84,0.35)' : 'var(--charcoal)',
              background: 'none',
              border: 'none',
              cursor: activeLembarIdx === 0 ? 'default' : 'pointer',
              padding: 0,
            }}
          >
            ← Halaman Sebelumnya
          </button>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm)' }}>
            Lembar {activeLembarIdx + 1} / {totalLembar}
          </span>
          <button
            onClick={goNextLembar}
            disabled={activeLembarIdx === totalLembar - 1}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: activeLembarIdx === totalLembar - 1 ? 'rgba(94,91,84,0.35)' : 'var(--charcoal)',
              background: 'none',
              border: 'none',
              cursor: activeLembarIdx === totalLembar - 1 ? 'default' : 'pointer',
              padding: 0,
            }}
          >
            Halaman Berikutnya →
          </button>
        </div>
      )}

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
