'use client'

import { useEffect, useRef, useState } from 'react'
import { Keyboard, Delete, MoveHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react'

// ============================================================
// PAPAN AKSARA MENGAMBANG — bisa ditarik & diubah ukurannya (gak
// nempel-di-atas doang), dua skrip (Aksara Sunda / Arab Pegon) x
// 4 kategori masing-masing (Ngalagena/Swara/Rarangken/Angka untuk
// Sunda; Huruf/Harakat untuk Pegon).
//
// PENTING: harus dirender DI LUAR elemen yang kena transform GSAP
// (mis. container transisi antar-step) — position:fixed ketiban
// transform ancestor jadi nempel ke situ, bukan ke viewport.
// ============================================================

const sundaSwara = [
  { char: 'ᮃ', latin: 'a' }, { char: 'ᮄ', latin: 'i' }, { char: 'ᮅ', latin: 'u' },
  { char: 'ᮆ', latin: 'é' }, { char: 'ᮇ', latin: 'o' }, { char: 'ᮈ', latin: 'e' }, { char: 'ᮉ', latin: 'eu' },
]

const sundaNgalagena = [
  { char: 'ᮊ', latin: 'ka' }, { char: 'ᮌ', latin: 'ga' }, { char: 'ᮍ', latin: 'nga' },
  { char: 'ᮎ', latin: 'ca' }, { char: 'ᮏ', latin: 'ja' }, { char: 'ᮑ', latin: 'nya' },
  { char: 'ᮒ', latin: 'ta' }, { char: 'ᮓ', latin: 'da' }, { char: 'ᮔ', latin: 'na' },
  { char: 'ᮕ', latin: 'pa' }, { char: 'ᮘ', latin: 'ba' }, { char: 'ᮙ', latin: 'ma' },
  { char: 'ᮚ', latin: 'ya' }, { char: 'ᮛ', latin: 'ra' }, { char: 'ᮜ', latin: 'la' },
  { char: 'ᮝ', latin: 'wa' }, { char: 'ᮞ', latin: 'sa' }, { char: 'ᮠ', latin: 'ha' },
  { char: 'ᮖ', latin: 'fa' }, { char: 'ᮗ', latin: 'va' }, { char: 'ᮐ', latin: 'za' },
  { char: 'ᮮ', latin: 'kha' }, { char: 'ᮯ', latin: 'sya' },
]

const sundaRarangken = [
  { char: 'ᮀ', latin: '+ng' }, { char: 'ᮁ', latin: '+r' }, { char: 'ᮂ', latin: '+h' },
  { char: 'ᮤ', latin: '+i' }, { char: 'ᮥ', latin: '+u' }, { char: 'ᮦ', latin: '+é' },
  { char: 'ᮧ', latin: '+o' }, { char: 'ᮨ', latin: '+e' }, { char: 'ᮩ', latin: '+eu' }, { char: '᮪', latin: 'Pamaéh' },
]

const sundaAngka = [
  { char: '᮰', latin: '0' }, { char: '᮱', latin: '1' }, { char: '᮲', latin: '2' }, { char: '᮳', latin: '3' },
  { char: '᮴', latin: '4' }, { char: '᮵', latin: '5' }, { char: '᮶', latin: '6' }, { char: '᮷', latin: '7' },
  { char: '᮸', latin: '8' }, { char: '᮹', latin: '9' },
]

const pegonHuruf = [
  { char: 'ا', latin: 'a/alif' }, { char: 'ب', latin: 'ba' }, { char: 'ت', latin: 'ta' }, { char: 'ث', latin: 'tsa' },
  { char: 'ج', latin: 'jim' }, { char: 'چ', latin: 'ca' }, { char: 'ح', latin: 'ha' }, { char: 'خ', latin: 'kha' },
  { char: 'د', latin: 'dal' }, { char: 'ذ', latin: 'dzal' }, { char: 'ر', latin: 'ra' }, { char: 'ز', latin: 'zai' },
  { char: 'س', latin: 'sin' }, { char: 'ش', latin: 'syin' }, { char: 'ص', latin: 'shad' }, { char: 'ض', latin: 'dhad' },
  { char: 'ط', latin: 'tha' }, { char: 'ظ', latin: 'zha' }, { char: 'ع', latin: "'ain" }, { char: 'غ', latin: 'ghain' },
  { char: 'ڠ', latin: 'nga' }, { char: 'ف', latin: 'fa' }, { char: 'ڤ', latin: 'pa' }, { char: 'ق', latin: 'qaf' },
  { char: 'ك', latin: 'kaf' }, { char: 'ݢ', latin: 'ga' }, { char: 'ل', latin: 'lam' }, { char: 'م', latin: 'mim' },
  { char: 'ن', latin: 'nun' }, { char: 'ڽ', latin: 'nya' }, { char: 'و', latin: 'wawu' }, { char: 'ه', latin: 'ha' }, { char: 'ي', latin: 'ya' },
]

const pegonHarakat = [
  { char: 'َ', latin: 'Fathah (a)' }, { char: 'ِ', latin: 'Kasrah (i)' }, { char: 'ُ', latin: 'Dhammad (u)' },
  { char: 'ْ', latin: 'Sukun' }, { char: 'ّ', latin: 'Tasydid' }, { char: 'ً', latin: 'Fanthatan' },
  { char: 'ٍ', latin: 'Kasratan' }, { char: 'ٌ', latin: 'Dhammatan' },
]

type ScriptMode = 'sunda' | 'pegon'
type SundaTab = 'ngalagena' | 'swara' | 'rarangken' | 'angka'

export function AksaraKeyboardPanel({
  open,
  onClose,
  onInsert,
  onBackspace,
  onSpace,
  onClearAll,
  focusedLabel,
  defaultScript,
}: {
  open: boolean
  onClose: () => void
  onInsert: (char: string) => void
  onBackspace?: () => void
  onSpace?: () => void
  onClearAll?: () => void
  focusedLabel?: string
  // skrip default (mengikuti Jenis Aksara Utama naskah) — dipakai ulang tiap kali panel dibuka,
  // tapi tetap bisa di-switch manual ke skrip lain selama panel terbuka.
  defaultScript?: ScriptMode
}) {
  const [scriptMode, setScriptMode] = useState<ScriptMode>(defaultScript ?? 'sunda')
  const [sundaTab, setSundaTab] = useState<SundaTab>('ngalagena')
  const [pegonTab, setPegonTab] = useState<'huruf' | 'harakat'>('huruf')
  const [minimized, setMinimized] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    if (open) setScriptMode(defaultScript ?? 'sunda')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const [size, setSize] = useState({ width: 420, height: 380 })
  const [resizing, setResizing] = useState(false)
  const resizeStart = useRef<{ width: number; height: number; x: number; y: number }>({ width: 0, height: 0, x: 0, y: 0 })

  const activeList =
    scriptMode === 'pegon'
      ? pegonTab === 'harakat' ? pegonHarakat : pegonHuruf
      : sundaTab === 'swara' ? sundaSwara
      : sundaTab === 'rarangken' ? sundaRarangken
      : sundaTab === 'angka' ? sundaAngka
      : sundaNgalagena

  // ── drag ──
  const handleDragStart = (clientX: number, clientY: number, target: HTMLElement) => {
    if (target.closest('button')) return
    const rect = panelRef.current?.getBoundingClientRect()
    if (!rect) return
    setDragging(true)
    dragStart.current = { x: clientX - rect.left, y: clientY - rect.top }
  }

  useEffect(() => {
    if (!dragging) return
    const move = (clientX: number, clientY: number) => {
      const width = panelRef.current?.offsetWidth || size.width
      const height = panelRef.current?.offsetHeight || size.height
      const newX = clientX - dragStart.current.x
      const newY = clientY - dragStart.current.y
      setPosition({
        x: Math.max(10, Math.min(newX, window.innerWidth - width - 10)),
        y: Math.max(10, Math.min(newY, window.innerHeight - height - 10)),
      })
    }
    const onMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) move(t.clientX, t.clientY)
    }
    const end = () => setDragging(false)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', end)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', end)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', end)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', end)
    }
  }, [dragging, size.width, size.height])

  // ── resize ──
  useEffect(() => {
    if (!resizing) return
    const move = (clientX: number, clientY: number) => {
      const dx = clientX - resizeStart.current.x
      const dy = clientY - resizeStart.current.y
      setSize({
        width: Math.max(320, Math.min(760, resizeStart.current.width + dx)),
        height: Math.max(260, Math.min(650, resizeStart.current.height + dy)),
      })
    }
    const onMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) move(t.clientX, t.clientY)
    }
    const end = () => setResizing(false)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', end)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', end)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', end)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', end)
    }
  }, [resizing])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        zIndex: 1000,
        ...(position
          ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
          : { right: '24px', bottom: '24px' }),
        width: minimized ? '260px' : `${size.width}px`,
        height: minimized ? 'auto' : `${size.height}px`,
      }}
      className={`flex flex-col rounded-sm border border-[#C5A86A] bg-[#FAF6ED] select-none ${
        dragging || resizing ? 'shadow-2xl ring-2 ring-[#8A7144]/20' : 'shadow-xl'
      }`}
    >
      {/* Header — bisa ditarik */}
      <div
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY, e.target as HTMLElement)}
        onTouchStart={(e) => {
          const t = e.touches[0]
          if (t) handleDragStart(t.clientX, t.clientY, e.target as HTMLElement)
        }}
        className={`flex items-center justify-between gap-2 px-3 py-2 bg-[#EAE2D1] border-b border-[#C5A86A]/40 rounded-t-sm shrink-0 ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        title="Tarik untuk memindahkan"
      >
        <div className="flex items-center gap-1.5 font-serif font-bold text-[#8A7144] text-xs min-w-0">
          <MoveHorizontal className="w-3.5 h-3.5 shrink-0" />
          <Keyboard className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Papan Aksara</span>
          <span className="text-[9px] font-sans font-semibold text-[#7A7163] bg-[#FAF6ED] border border-[#C5A86A]/30 px-1.5 py-0.5 rounded-xs shrink-0 whitespace-nowrap">
            {focusedLabel || 'Pilih Kolom'}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => setMinimized((m) => !m)} className="p-1 hover:bg-[#DCD3C1] rounded-xs text-[#7A7163] hover:text-[#2C2825] cursor-pointer" title={minimized ? 'Perbesar' : 'Kecilkan'}>
            {minimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button type="button" onClick={onClose} className="p-1 hover:bg-red-100 hover:text-red-700 rounded-xs text-[#7A7163] cursor-pointer" title="Tutup">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="flex-1 min-h-0 p-3 flex flex-col gap-2 relative">
          {!focusedLabel && (
            <div className="p-2 bg-[#FFFDF6] rounded-xs text-center border border-[#E5DEC3] text-[10px] text-[#8A7144] shrink-0">
              💡 Klik kolom &quot;Aksara&quot; pada kata yang mau diisi dulu.
            </div>
          )}

          {/* Script mode + kategori */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 shrink-0">
            <div className="flex items-center gap-1 bg-[#EAE2D1] p-0.5 rounded-xs border border-[#C5A86A]/40">
              <button type="button" onClick={() => setScriptMode('sunda')} className={`px-2.5 py-0.5 text-[10px] font-bold rounded-xs cursor-pointer transition-colors ${scriptMode === 'sunda' ? 'bg-[#8A7144] text-white' : 'text-[#5C4D32] hover:text-[#1A1816]'}`}>
                Aksara Sunda
              </button>
              <button type="button" onClick={() => setScriptMode('pegon')} className={`px-2.5 py-0.5 text-[10px] font-bold rounded-xs cursor-pointer transition-colors ${scriptMode === 'pegon' ? 'bg-[#8A7144] text-white' : 'text-[#5C4D32] hover:text-[#1A1816]'}`}>
                Arab Pegon
              </button>
            </div>

            <div className="flex items-center gap-1 bg-[#EAE2D1] p-0.5 rounded-xs border border-[#C5A86A]/40">
              {scriptMode === 'sunda' ? (
                (['ngalagena', 'swara', 'rarangken', 'angka'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSundaTab(t)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-xs cursor-pointer capitalize transition-colors ${sundaTab === t ? 'bg-[#8A7144] text-white' : 'text-[#5C4D32] hover:text-[#1A1816]'}`}
                  >
                    {t}
                  </button>
                ))
              ) : (
                <>
                  <button type="button" onClick={() => setPegonTab('huruf')} className={`px-2 py-0.5 text-[10px] font-bold rounded-xs cursor-pointer transition-colors ${pegonTab === 'huruf' ? 'bg-[#8A7144] text-white' : 'text-[#5C4D32] hover:text-[#1A1816]'}`}>
                    Huruf Pegon
                  </button>
                  <button type="button" onClick={() => setPegonTab('harakat')} className={`px-2 py-0.5 text-[10px] font-bold rounded-xs cursor-pointer transition-colors ${pegonTab === 'harakat' ? 'bg-[#8A7144] text-white' : 'text-[#5C4D32] hover:text-[#1A1816]'}`}>
                    Harakat
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Grid karakter */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 pb-2">
              {activeList.map((item, idx) => (
                <button
                  key={item.char + idx}
                  type="button"
                  onClick={() => onInsert(item.char)}
                  className="flex flex-col items-center justify-center py-2 px-1 bg-white hover:bg-[#8A7144] border border-[#D5C9B2] hover:border-[#8A7144] rounded-xs transition-all cursor-pointer active:scale-95 group"
                >
                  <span className="text-base font-bold text-[#2C2825] group-hover:text-white group-hover:scale-110 transition-transform font-serif">
                    {item.char}
                  </span>
                  <span className="text-[9px] font-mono text-[#7A7163] group-hover:text-white/90">{item.latin}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Kontrol */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#D5C9B2]/60 shrink-0">
            {onSpace && (
              <button type="button" onClick={onSpace} className="flex-1 py-1.5 bg-[#EAE2D1] hover:bg-[#DCD3C1] text-[#4A3E31] border border-[#C5A86A]/40 rounded-xs font-bold text-[11px] cursor-pointer transition-all">
                Spasi
              </button>
            )}
            {onBackspace && (
              <button type="button" onClick={onBackspace} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xs font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-all">
                <Delete className="w-3.5 h-3.5" />
                Hapus
              </button>
            )}
            {onClearAll && (
              <button type="button" onClick={onClearAll} className="px-3 py-1.5 bg-[#F1ECE1] hover:bg-amber-100 text-[#5C4D32] hover:text-amber-950 border border-[#DCD3C1] rounded-xs text-[10px] font-semibold cursor-pointer transition-all">
                Bersihkan
              </button>
            )}
          </div>

          {/* Pegangan resize */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              setResizing(true)
              resizeStart.current = { width: size.width, height: size.height, x: e.clientX, y: e.clientY }
            }}
            onTouchStart={(e) => {
              const t = e.touches[0]
              if (!t) return
              e.stopPropagation()
              setResizing(true)
              resizeStart.current = { width: size.width, height: size.height, x: t.clientX, y: t.clientY }
            }}
            title="Tarik untuk ubah ukuran"
            className="absolute right-0.5 bottom-0.5 w-4 h-4 cursor-se-resize"
          >
            <svg viewBox="0 0 10 10" className="w-full h-full opacity-40">
              <path d="M10 0 L0 10 M10 3 L3 10 M10 6 L6 10" stroke="#8A7144" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
