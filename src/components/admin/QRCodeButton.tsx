'use client'

import { useState } from 'react'
import QRCode from 'qrcode'
import { Button } from './AdminUI'

const mono = "'DM Mono', monospace"

// ============================================================
// QR CODE BUTTON — generate QR (client-side, tanpa API pihak
// ketiga) yang mengarah ke halaman publik record ini, siap
// diunduh sebagai PNG untuk dicetak & ditempel di museum.
// ============================================================
export default function QRCodeButton({
  url,
  filename,
  label = 'QR Kode',
}: {
  url: string
  filename: string
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleToggle() {
    if (!url) return
    setOpen((o) => !o)
    if (dataUrl || busy) return
    setBusy(true)
    try {
      const png = await QRCode.toDataURL(url, {
        width: 480,
        margin: 2,
        color: { dark: '#111110', light: '#F0EDE6' },
      })
      setDataUrl(png)
    } catch {
      // biarkan user coba lagi lewat tombol
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <Button type="button" variant="outline" onClick={handleToggle} disabled={!url}>
        ⬛ {label}
      </Button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            zIndex: 50,
            width: '260px',
            background: 'var(--bone)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '1.25rem',
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', marginBottom: '0.75rem' }}>
            {busy && (
              <span style={{ fontFamily: mono, fontSize: '12px', color: 'var(--warm)' }}>Membuat QR…</span>
            )}
            {!busy && dataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dataUrl}
                alt="QR Code"
                style={{ width: '200px', height: '200px', border: '1px solid var(--border)', borderRadius: '6px' }}
              />
            )}
          </div>
          <p style={{ fontFamily: mono, fontSize: '11px', color: 'var(--warm)', wordBreak: 'break-all', lineHeight: 1.5, marginBottom: '0.75rem' }}>
            {url}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {dataUrl && (
              <a
                href={dataUrl}
                download={`${filename}-qr.png`}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: mono,
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '0.5rem',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: 'var(--charcoal)',
                }}
              >
                ⬇ Unduh PNG
              </a>
            )}
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} style={{ flex: 1 }}>
              Tutup
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
