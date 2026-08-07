'use client'

import { forwardRef, useState, type CSSProperties, type ReactNode } from 'react'
import { aksaraSundaGroups } from '@/data/aksara-sunda'
import { uploadImage, uploadModel } from '@/lib/cms'
import { toast } from './Feedback'

const mono = "'DM Mono', monospace"

// ── Lock / Unlock icons — dipakai buat status "finalized" ──
export function LockIcon({ size = 12, style }: { size?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect x="3.25" y="7.25" width="9.5" height="6.75" rx="1.3" />
      <path d="M5.5 7.25V4.9a2.5 2.5 0 0 1 5 0v2.35" />
    </svg>
  )
}

export function UnlockIcon({ size = 12, style }: { size?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect x="3.25" y="7.25" width="9.5" height="6.75" rx="1.3" />
      <path d="M5.5 7.25V4.9a2.5 2.5 0 0 1 4.85-.65" />
    </svg>
  )
}

// ── Skeleton — placeholder shimmer buat state loading, gantiin teks
// "Memuat..." yang cuma numpang lewat & bikin layout kedip.
export function Skeleton({
  width = '100%',
  height = '14px',
  borderRadius = '4px',
  style,
}: {
  width?: string | number
  height?: string | number
  borderRadius?: string
  style?: CSSProperties
}) {
  return <div className="admin-skeleton" style={{ width, height, borderRadius, ...style }} />
}

// ── Label + field wrapper ──
// `error` menang atas `hint`: dipakai buat validasi form gaya login —
// teks merah tepat di bawah field yang bermasalah, bukan cuma toast
// generik yang gak jelas field mana yang dimaksud.
export const Field = forwardRef<HTMLLabelElement, {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}>(function Field({ label, hint, error, required, children }, ref) {
  return (
    <label ref={ref} style={{ display: 'block', marginBottom: '1.25rem' }}>
      <span
        style={{
          display: 'block',
          fontFamily: mono,
          fontSize: '11px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: error ? '#a03434' : 'var(--warm)',
          marginBottom: '0.5rem',
        }}
      >
        {label}
        {required && <span style={{ color: '#a03434' }}> *</span>}
      </span>
      {children}
      {error ? (
        <span
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.35rem',
            fontFamily: mono,
            fontSize: '12px',
            fontWeight: 700,
            color: '#a03434',
            marginTop: '0.4rem',
            lineHeight: 1.5,
          }}
        >
          <span aria-hidden style={{ flexShrink: 0 }}>⚠</span>
          {error}
        </span>
      ) : hint ? (
        <span
          style={{
            display: 'block',
            fontFamily: mono,
            fontSize: '12px',
            color: 'var(--warm)',
            marginTop: '0.35rem',
            lineHeight: 1.5,
            opacity: 0.9,
          }}
        >
          {hint}
        </span>
      ) : null}
    </label>
  )
})

const baseInput: CSSProperties = {
  width: '100%',
  fontFamily: mono,
  fontSize: '15px',
  color: 'var(--charcoal)',
  background: 'var(--bone)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  padding: '0.75rem 0.9rem',
  outline: 'none',
}

const invalidInput: CSSProperties = {
  borderColor: '#a03434',
  borderWidth: '2px',
  background: 'rgba(160,52,52,0.045)',
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ invalid, style, ...props }, ref) {
    return <input ref={ref} {...props} style={{ ...baseInput, ...(invalid ? invalidInput : null), ...style }} />
  }
)

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function Textarea({ invalid, style, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        style={{ ...baseInput, lineHeight: 1.7, resize: 'vertical', minHeight: '80px', ...(invalid ? invalidInput : null), ...style }}
      />
    )
  }
)

export function Select({
  children,
  invalid,
  style,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select {...props} style={{ ...baseInput, cursor: 'pointer', ...(invalid ? invalidInput : null), ...style }}>
      {children}
    </select>
  )
}

export function Button({
  children,
  variant = 'solid',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'outline' | 'ghost' | 'danger'
}) {
  const styles: Record<string, CSSProperties> = {
    solid: { background: 'var(--charcoal)', color: 'var(--bone)', border: '1px solid var(--charcoal)' },
    outline: { background: 'transparent', color: 'var(--charcoal)', border: '1px solid var(--border)' },
    ghost: { background: 'transparent', color: 'var(--warm)', border: '1px solid transparent' },
    danger: { background: 'transparent', color: '#a03434', border: '1px solid rgba(160,52,52,0.4)' },
  }
  return (
    <button
      {...props}
      style={{
        fontFamily: mono,
        fontSize: '12px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '0.65rem 1.2rem',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'opacity 0.2s, background 0.2s, border-color 0.2s',
        ...styles[variant],
        ...props.style,
      }}
    >
      {children}
    </button>
  )
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: '10px',
        background: 'rgba(17,17,16,0.015)',
        padding: '1.25rem',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: mono,
        fontSize: '11px',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: 'var(--warm)',
        marginBottom: '1rem',
      }}
    >
      {children}
    </p>
  )
}

// ============================================================
// AKSARA SUNDA KEYBOARD — palet karakter on-screen
// Menyisipkan karakter ke input yang sedang aktif via onInsert.
// ============================================================
export function AksaraKeyboard({ onInsert }: { onInsert: (char: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom: '1rem' }}>
      <Button type="button" variant="outline" onClick={() => setOpen((o) => !o)}>
        ⌨ Papan Aksara Sunda {open ? '▲' : '▼'}
      </Button>
      {open && (
        <div
          style={{
            marginTop: '0.75rem',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '1rem',
            background: 'var(--bone)',
            maxHeight: '340px',
            overflowY: 'auto',
          }}
        >
          {aksaraSundaGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--warm)',
                  marginBottom: '0.5rem',
                }}
              >
                {group.label} — <span style={{ opacity: 0.85 }}>{group.hint}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {group.chars.map((c, i) => (
                  <button
                    key={c.name + i}
                    type="button"
                    onClick={() => onInsert(c.char)}
                    title={c.name}
                    style={{
                      minWidth: '44px',
                      padding: '0.4rem',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: 'var(--bone)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <span style={{ fontSize: '24px', fontFamily: 'serif', lineHeight: 1 }}>{c.char}</span>
                    <span style={{ fontFamily: mono, fontSize: '10px', color: 'var(--warm)' }}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// IMAGE UPLOAD — kompres & simpan sebagai data URL
// ============================================================
export function ImageUpload({
  value,
  onChange,
  label = 'Gambar',
}: {
  value?: string
  onChange: (dataUrl: string | undefined) => void
  label?: string
}) {
  const [busy, setBusy] = useState(false)
  return (
    <Field label={label} hint="JPG/PNG. Otomatis dikompres agar muat di penyimpanan.">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            flexShrink: 0,
            border: '1px solid var(--border)',
            borderRadius: '8px',
            background: 'var(--charcoal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: mono, fontSize: '11px', color: 'rgba(240,237,230,0.5)' }}>
              {busy ? 'Memproses…' : 'Kosong'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setBusy(true)
                try {
                  const url = await uploadImage(file)
                  onChange(url)
                } catch (err) {
                  toast('Gagal mengunggah gambar: ' + (err as Error).message, 'error')
                } finally {
                  setBusy(false)
                }
              }}
            />
            <span
              style={{
                display: 'inline-block',
                fontFamily: mono,
                fontSize: '12px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '0.65rem 1.2rem',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ⬆ Unggah
            </span>
          </label>
          {value && (
            <Button type="button" variant="danger" onClick={() => onChange(undefined)}>
              Hapus
            </Button>
          )}
        </div>
      </div>
    </Field>
  )
}

// ── Upload model 3D (.glb) — file besar (puluhan-ratusan MB), jadi
// pakai progress bar, bukan pratinjau kayak ImageUpload. ──
export function ModelUpload({
  value,
  onChange,
  label = 'Model 3D (.glb)',
}: {
  value?: string
  onChange: (url: string | undefined) => void
  label?: string
}) {
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState<'optimizing' | 'uploading'>('optimizing')
  const [progress, setProgress] = useState(0)

  const statusText = busy
    ? phase === 'optimizing'
      ? 'Mengoptimasi tekstur…'
      : `Mengunggah… ${progress}%`
    : value
      ? value.split('/').pop()
      : 'Belum ada model 3D'

  return (
    <Field label={label} hint="File .glb, ukuran berapapun. Tekstur dikompres otomatis di browser sebelum diunggah ke penyimpanan cloud, langsung tampil di situs setelah disimpan.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ fontFamily: mono, fontSize: '12px', color: 'rgba(240,237,230,0.7)', wordBreak: 'break-all' }}>
          {statusText}
        </div>
        {busy && (
          <div style={{ height: '4px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: phase === 'optimizing' ? '100%' : `${progress}%`,
                background: 'var(--warm)',
                transition: 'width 0.2s',
                animation: phase === 'optimizing' ? 'pulse 1.2s ease-in-out infinite' : undefined,
              }}
            />
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <label>
            <input
              type="file"
              accept=".glb,model/gltf-binary"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setBusy(true)
                setPhase('optimizing')
                setProgress(0)
                try {
                  const url = await uploadModel(file, setProgress, setPhase)
                  onChange(url)
                  toast('Model 3D berhasil diunggah.', 'success')
                } catch (err) {
                  toast('Gagal mengunggah model: ' + (err as Error).message, 'error')
                } finally {
                  setBusy(false)
                }
              }}
            />
            <span
              style={{
                display: 'inline-block',
                fontFamily: mono,
                fontSize: '12px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '0.65rem 1.2rem',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                cursor: busy ? 'default' : 'pointer',
                opacity: busy ? 0.5 : 1,
                pointerEvents: busy ? 'none' : 'auto',
              }}
            >
              ⬆ Unggah .glb
            </span>
          </label>
          {value && !busy && (
            <Button type="button" variant="danger" onClick={() => onChange(undefined)}>
              Hapus
            </Button>
          )}
        </div>
      </div>
    </Field>
  )
}
