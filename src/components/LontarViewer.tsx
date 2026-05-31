'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { lontarPages, LontarPage, WordAnnotation, PhraseAnnotation } from '@/data/lontarPages'

// ============================================================
// WORD TOOLTIP
// ============================================================
interface WordTooltipProps {
  word: WordAnnotation
  onClose: () => void
  pos: { x: number; y: number }
}

function WordTooltip({ word, onClose, pos }: WordTooltipProps) {
  const kelasColor: Record<string, string> = {
    'kata kerja': '#4A5E4A', 'kata benda': '#5E4A4A',
    'kata sifat': '#4A4A5E', 'kata depan': '#5E5A4A',
    'partikel': '#4A5A5E', 'nama diri': '#5E4A5A',
  }
  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed',
        left: Math.min(pos.x, window.innerWidth - 260),
        top: Math.min(pos.y + 12, window.innerHeight - 200),
        zIndex: 3000,
        background: '#111110',
        color: '#F0EDE6',
        padding: '1.25rem 1.5rem',
        width: '250px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        border: '1px solid rgba(240,237,230,0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '26px', fontFamily: 'serif', display: 'block', lineHeight: 1.3 }}>{word.aksara}</span>
          <span style={{ fontSize: '12px', fontFamily: "'Playfair Display',serif", fontStyle: 'italic', color: 'rgba(240,237,230,0.55)' }}>{word.latin}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(240,237,230,0.4)', cursor: 'pointer', fontSize: '18px', alignSelf: 'flex-start' }}>×</button>
      </div>
      {word.kelas && (
        <span style={{ display: 'inline-block', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '2px 8px', background: kelasColor[word.kelas] || '#444', marginBottom: '0.75rem', fontFamily: "'DM Mono',monospace" }}>{word.kelas}</span>
      )}
      <div style={{ height: '1px', background: 'rgba(240,237,230,0.12)', marginBottom: '0.75rem' }} />
      <p style={{ fontSize: '15px', fontFamily: "'Playfair Display',serif", fontWeight: 700, lineHeight: 1.4 }}>{word.terjemah}</p>
    </div>
  )
}

// ============================================================
// PHRASE PANEL
// ============================================================
interface PhrasePanelProps {
  phrase: PhraseAnnotation
  pageWords: WordAnnotation[]
  onClose: () => void
}

function PhrasePanel({ phrase, pageWords, onClose }: PhrasePanelProps) {
  const words = phrase.words.map(id => pageWords.find(w => w.id === id)).filter(Boolean) as WordAnnotation[]
  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: '400px',
      background: '#F0EDE6', borderLeft: '1px solid rgba(17,17,16,0.15)',
      zIndex: 2500, overflowY: 'auto', padding: '3rem 2.5rem',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: '1.5rem', right: '1.5rem',
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
        fontFamily: "'DM Mono',monospace", color: '#8C8A85', display: 'flex', alignItems: 'center', gap: '0.4rem',
      }}>Tutup ×</button>

      <span style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8C8A85', fontFamily: "'DM Mono',monospace", display: 'block', marginBottom: '1.5rem', marginTop: '1rem' }}>
        Makna Kalimat
      </span>

      {/* Aksara display */}
      <div style={{ background: '#E8E4DC', border: '1px solid rgba(17,17,16,0.15)', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '22px', fontFamily: 'serif', lineHeight: 2, letterSpacing: '0.08em' }}>
          {words.map(w => w.aksara).join(' ')}
        </p>
        <p style={{ fontSize: '12px', fontFamily: "'Playfair Display',serif", fontStyle: 'italic', color: '#8C8A85', marginTop: '0.5rem' }}>
          {words.map(w => w.latin).join(' ')}
        </p>
      </div>

      {/* Terjemah */}
      <div style={{ borderTop: '1px solid rgba(17,17,16,0.12)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8A85', fontFamily: "'DM Mono',monospace", display: 'block', marginBottom: '0.75rem' }}>Terjemahan</span>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '18px', fontWeight: 700, lineHeight: 1.5 }}>{phrase.terjemah}</p>
      </div>

      {/* Makna */}
      {phrase.makna && (
        <div style={{ borderTop: '1px solid rgba(17,17,16,0.12)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8A85', fontFamily: "'DM Mono',monospace", display: 'block', marginBottom: '0.75rem' }}>Makna & Tafsir</span>
          <p style={{ fontSize: '12px', lineHeight: 2.1, color: '#111110', fontFamily: "'DM Mono',monospace", fontWeight: 300 }}>{phrase.makna}</p>
        </div>
      )}

      {/* Catatan */}
      {phrase.catatan && (
        <div style={{ borderTop: '1px solid rgba(17,17,16,0.12)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8A85', fontFamily: "'DM Mono',monospace", display: 'block', marginBottom: '0.75rem' }}>Catatan Filologi</span>
          <p style={{ fontSize: '11px', lineHeight: 1.9, color: '#8C8A85', fontFamily: "'DM Mono',monospace", fontStyle: 'italic' }}>{phrase.catatan}</p>
        </div>
      )}

      {/* Word breakdown */}
      <div style={{ borderTop: '1px solid rgba(17,17,16,0.12)', paddingTop: '1.5rem' }}>
        <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8A85', fontFamily: "'DM Mono',monospace", display: 'block', marginBottom: '1rem' }}>Per Kata</span>
        {words.map(w => (
          <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.6rem 0', borderBottom: '1px solid rgba(17,17,16,0.06)' }}>
            <div>
              <span style={{ fontSize: '18px', fontFamily: 'serif', marginRight: '0.75rem' }}>{w.aksara}</span>
              <span style={{ fontSize: '11px', fontFamily: "'Playfair Display',serif", fontStyle: 'italic', color: '#8C8A85' }}>{w.latin}</span>
            </div>
            <span style={{ fontSize: '11px', fontFamily: "'DM Mono',monospace", color: '#111110', textAlign: 'right', maxWidth: '130px' }}>{w.terjemah}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// SCAN IMAGE + ANNOTATIONS OVERLAY
// ============================================================
interface ScanViewerProps {
  page: LontarPage
  zoom: number
}

function ScanOverlay({ page, zoom }: ScanViewerProps) {
  const [activeWord, setActiveWord] = useState<WordAnnotation | null>(null)
  const [activePhrase, setActivePhrase] = useState<PhraseAnnotation | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [hoveredWordIds, setHoveredWordIds] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  // Find which phrase a word belongs to
  const getWordPhrase = useCallback((wordId: string) => {
    return page.phrases.find(p => p.words.includes(wordId))
  }, [page.phrases])

  const handleWordClick = useCallback((word: WordAnnotation, e: React.MouseEvent) => {
    e.stopPropagation()
    setTooltipPos({ x: e.clientX, y: e.clientY })
    setActiveWord(word)
    setActivePhrase(null)
  }, [])

  const handleWordDoubleClick = useCallback((word: WordAnnotation, e: React.MouseEvent) => {
    e.stopPropagation()
    const phrase = getWordPhrase(word.id)
    if (phrase) {
      setActivePhrase(phrase)
      setActiveWord(null)
    }
  }, [getWordPhrase])

  const handleWordHover = useCallback((word: WordAnnotation, entering: boolean) => {
    const phrase = getWordPhrase(word.id)
    if (phrase && entering) {
      setHoveredWordIds(new Set(phrase.words))
    } else {
      setHoveredWordIds(new Set())
    }
  }, [getWordPhrase])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }} onClick={() => { setActiveWord(null) }}>
      {/* Scan image or placeholder */}
      <div style={{
        width: '100%',
        background: '#C8A96E',
        aspectRatio: `${page.imageWidth} / ${page.imageHeight}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Placeholder texture — ganti dengan <img src={page.imagePath} /> kalau scan asli sudah ada */}
        <PlaceholderScan pageNumber={page.pageNumber} />

        {/* Word annotation overlays */}
        {page.words.map(word => {
          const isHovered = hoveredWordIds.has(word.id)
          const isActive = activeWord?.id === word.id
          const isInActivePhrase = activePhrase?.words.includes(word.id)
          return (
            <div
              key={word.id}
              onClick={e => handleWordClick(word, e)}
              onDoubleClick={e => handleWordDoubleClick(word, e)}
              onMouseEnter={() => handleWordHover(word, true)}
              onMouseLeave={() => handleWordHover(word, false)}
              title={`${word.latin} — ${word.terjemah}`}
              style={{
                position: 'absolute',
                left: `${word.x}%`,
                top: `${word.y}%`,
                width: `${word.w}%`,
                height: `${word.h}%`,
                background: isActive || isInActivePhrase
                  ? 'rgba(17,17,16,0.75)'
                  : isHovered
                    ? 'rgba(200,169,110,0.55)'
                    : 'rgba(200,169,110,0.18)',
                border: isActive || isInActivePhrase
                  ? '1.5px solid rgba(17,17,16,0.9)'
                  : isHovered
                    ? '1px solid rgba(200,169,110,0.8)'
                    : '1px solid rgba(200,169,110,0.35)',
                cursor: 'pointer',
                transition: 'background 0.15s, border 0.15s',
                zIndex: 10,
                borderRadius: '1px',
              }}
            />
          )
        })}
      </div>

      {/* Tooltips & Panels */}
      {activeWord && <WordTooltip word={activeWord} pos={tooltipPos} onClose={() => setActiveWord(null)} />}
      {activePhrase && <PhrasePanel phrase={activePhrase} pageWords={page.words} onClose={() => setActivePhrase(null)} />}

      {/* Hint */}
      <div style={{ padding: '0.75rem 1rem', background: '#E8E4DC', borderTop: '1px solid rgba(17,17,16,0.1)', display: 'flex', gap: '2rem' }}>
        {[
          { icon: '①', text: 'Klik kata untuk terjemah' },
          { icon: '②', text: 'Double-klik untuk makna kalimat' },
          { icon: '③', text: 'Hover untuk highlight kalimat' },
        ].map(h => (
          <div key={h.icon} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '13px', fontWeight: 900 }}>{h.icon}</span>
            <span style={{ fontSize: '9px', letterSpacing: '0.05em', color: '#8C8A85', fontFamily: "'DM Mono',monospace" }}>{h.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// PLACEHOLDER SCAN (sampai foto asli ada)
// ============================================================
function PlaceholderScan({ pageNumber }: { pageNumber: number }) {
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #C8A96E 0%, #D4B882 30%, #C2A060 60%, #B8956A 100%)', position: 'absolute', inset: 0 }}>
      {/* Simulated text lines */}
      <div style={{ position: 'absolute', inset: '6% 6%', display: 'flex', flexDirection: 'column', gap: '2%' }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '1%', alignItems: 'center' }}>
            {Array.from({ length: Math.floor(8 + Math.random() * 6) }).map((_, j) => (
              <div key={j} style={{
                height: '8px',
                width: `${20 + Math.random() * 40}px`,
                background: 'rgba(60,35,10,0.35)',
                borderRadius: '1px',
              }} />
            ))}
          </div>
        ))}
      </div>
      {/* Vein lines overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 98%, rgba(90,60,20,0.08) 100%)', backgroundSize: '4% 100%' }} />
      {/* Page label */}
      <div style={{ position: 'absolute', bottom: '2%', right: '3%', fontFamily: "'Playfair Display',serif", fontSize: '11px', fontStyle: 'italic', color: 'rgba(60,35,10,0.45)' }}>
        [Scan halaman {pageNumber} — placeholder]
      </div>
    </div>
  )
}

// ============================================================
// MAIN VIEWER COMPONENT
// ============================================================
export default function LontarViewer() {
  const [currentPageIdx, setCurrentPageIdx] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })
  const viewerRef = useRef<HTMLDivElement>(null)

  const page = lontarPages[currentPageIdx]
  const totalPages = lontarPages.length

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(z => Math.min(4, Math.max(0.5, z + delta)))
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.altKey) {
      setIsPanning(true)
      setLastMouse({ x: e.clientX, y: e.clientY })
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPanX(x => x + (e.clientX - lastMouse.x))
      setPanY(y => y + (e.clientY - lastMouse.y))
      setLastMouse({ x: e.clientX, y: e.clientY })
    }
  }, [isPanning, lastMouse])

  const handleMouseUp = useCallback(() => setIsPanning(false), [])

  const resetView = () => { setZoom(1); setPanX(0); setPanY(0) }
  const goPage = (idx: number) => { setCurrentPageIdx(idx); resetView() }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', background: '#111110', overflow: 'hidden' }}>

      {/* SIDEBAR — page list */}
      <div style={{ width: '180px', flexShrink: 0, borderRight: '1px solid rgba(240,237,230,0.08)', overflowY: 'auto', background: '#0D0D0C' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(240,237,230,0.08)' }}>
          <span style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.35)', fontFamily: "'DM Mono',monospace" }}>
            {totalPages} Lembar
          </span>
        </div>
        {lontarPages.map((p, idx) => (
          <button key={p.id} onClick={() => goPage(idx)} style={{
            width: '100%', padding: '0.75rem 1.25rem', background: idx === currentPageIdx ? 'rgba(200,169,110,0.15)' : 'transparent',
            border: 'none', borderBottom: '1px solid rgba(240,237,230,0.06)', cursor: 'pointer', textAlign: 'left',
            borderLeft: idx === currentPageIdx ? '2px solid #C8A96E' : '2px solid transparent',
          }}>
            {/* Thumb placeholder */}
            <div style={{ width: '100%', aspectRatio: '3/4', background: 'linear-gradient(135deg, #C8A96E, #B8956A)', marginBottom: '0.6rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: '8%', display: 'flex', flexDirection: 'column', gap: '6%' }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ height: '5px', background: 'rgba(60,35,10,0.3)', borderRadius: '1px', width: `${50 + Math.random() * 40}%` }} />
                ))}
              </div>
            </div>
            <span style={{ fontSize: '9px', color: idx === currentPageIdx ? '#C8A96E' : 'rgba(240,237,230,0.45)', fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em', display: 'block' }}>
              Lembar {p.pageNumber}
            </span>
            <span style={{ fontSize: '8px', color: 'rgba(240,237,230,0.25)', fontFamily: "'DM Mono',monospace", display: 'block', marginTop: '2px', lineHeight: 1.4 }}>
              {p.words.length} kata
            </span>
          </button>
        ))}
      </div>

      {/* MAIN VIEWER */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ height: '48px', borderBottom: '1px solid rgba(240,237,230,0.08)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '1rem', flexShrink: 0 }}>
          {/* Page nav */}
          <button onClick={() => goPage(Math.max(0, currentPageIdx - 1))} disabled={currentPageIdx === 0}
            style={{ background: 'none', border: '1px solid rgba(240,237,230,0.15)', color: currentPageIdx === 0 ? 'rgba(240,237,230,0.2)' : '#F0EDE6', cursor: currentPageIdx === 0 ? 'default' : 'pointer', padding: '4px 12px', fontSize: '10px', fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em' }}>
            ← Prev
          </button>
          <span style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(240,237,230,0.5)', fontFamily: "'DM Mono',monospace", minWidth: '80px', textAlign: 'center' }}>
            {currentPageIdx + 1} / {totalPages}
          </span>
          <button onClick={() => goPage(Math.min(totalPages - 1, currentPageIdx + 1))} disabled={currentPageIdx === totalPages - 1}
            style={{ background: 'none', border: '1px solid rgba(240,237,230,0.15)', color: currentPageIdx === totalPages - 1 ? 'rgba(240,237,230,0.2)' : '#F0EDE6', cursor: currentPageIdx === totalPages - 1 ? 'default' : 'pointer', padding: '4px 12px', fontSize: '10px', fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em' }}>
            Next →
          </button>

          <div style={{ width: '1px', height: '20px', background: 'rgba(240,237,230,0.1)', margin: '0 0.25rem' }} />

          {/* Zoom controls */}
          <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} style={{ background: 'none', border: '1px solid rgba(240,237,230,0.15)', color: '#F0EDE6', cursor: 'pointer', padding: '4px 12px', fontSize: '14px', fontFamily: 'monospace' }}>+</button>
          <span style={{ fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(240,237,230,0.5)', fontFamily: "'DM Mono',monospace", minWidth: '40px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} style={{ background: 'none', border: '1px solid rgba(240,237,230,0.15)', color: '#F0EDE6', cursor: 'pointer', padding: '4px 12px', fontSize: '14px', fontFamily: 'monospace' }}>−</button>
          <button onClick={resetView} style={{ background: 'none', border: '1px solid rgba(240,237,230,0.1)', color: 'rgba(240,237,230,0.4)', cursor: 'pointer', padding: '4px 12px', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'DM Mono',monospace" }}>Reset</button>

          <div style={{ flex: 1 }} />

          {/* Page title */}
          <span style={{ fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(240,237,230,0.35)', fontFamily: "'DM Mono',monospace" }}>{page.title}</span>
          <span style={{ fontSize: '8px', letterSpacing: '0.1em', color: 'rgba(240,237,230,0.2)', fontFamily: "'DM Mono',monospace" }}>Alt+drag = pan · Scroll = zoom</span>
        </div>

        {/* Canvas area */}
        <div
          ref={viewerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ flex: 1, overflow: 'hidden', position: 'relative', cursor: isPanning ? 'grabbing' : 'default', background: '#1A1918' }}
        >
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.1s ease',
            maxWidth: '560px',
            width: '70%',
            boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
          }}>
            <ScanOverlay page={page} zoom={zoom} />
          </div>
        </div>
      </div>
    </div>
  )
}
