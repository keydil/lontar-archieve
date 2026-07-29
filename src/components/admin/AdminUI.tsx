'use client'

import { useState, type CSSProperties, type ReactNode } from 'react'
import { aksaraSundaGroups } from '@/data/aksara-sunda'
import { uploadImage } from '@/lib/cms'

const mono = "'DM Mono', monospace"

// ── Label + field wrapper ──
export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label style={{ display: 'block', marginBottom: '1.25rem' }}>
      <span
        style={{
          display: 'block',
          fontFamily: mono,
          fontSize: '11px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--warm)',
          marginBottom: '0.5rem',
        }}
      >
        {label}
      </span>
      {children}
      {hint && (
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
      )}
    </label>
  )
}

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

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...baseInput, ...props.style }} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{ ...baseInput, lineHeight: 1.7, resize: 'vertical', minHeight: '80px', ...props.style }}
    />
  )
}

export function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} style={{ ...baseInput, cursor: 'pointer', ...props.style }}>
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
                  alert('Gagal mengunggah gambar: ' + (err as Error).message)
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
