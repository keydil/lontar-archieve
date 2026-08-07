'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { exportJSON, importJSON, seedIntoDatabase, type useCMS } from '@/lib/cms'
import { Button, Skeleton } from './AdminUI'
import { confirmDialog } from './Feedback'

const mono = "'DM Mono', monospace"
const serif = "'Playfair Display', serif"

// ============================================================
// DASHBOARD
// ============================================================
export function Dashboard({ data }: { data: ReturnType<typeof useCMS>['data'] }) {
  const cards: { label: string; count: number; href: string; desc: string }[] = [
    { label: 'Arsip', count: data.naskah.length, href: '/admin/arsip', desc: 'Teks interaktif per ayat' },
    { label: 'Koleksi', count: data.koleksi.length, href: '/admin/koleksi-3d', desc: 'Artefak, foto & video' },
  ]
  return (
    <div>
      <p style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--warm)', marginBottom: '0.75rem' }}>Dashboard</p>
      <h1 style={{ fontFamily: serif, fontSize: '40px', fontWeight: 900, marginBottom: '0.5rem' }}>Selamat datang</h1>
      <p style={{ fontFamily: mono, fontSize: '15px', color: 'var(--warm)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '620px' }}>
        Panel ini untuk ahli memasukkan &amp; mengedit data lontar. Semua perubahan langsung tampil di situs dan tersimpan
        di browser ini. Gunakan tab <b>Data &amp; Backup</b> untuk mengekspor JSON (backup / pindah perangkat).
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            style={{ display: 'block', textAlign: 'left', textDecoration: 'none', color: 'inherit', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem', background: 'transparent' }}
          >
            <div style={{ fontFamily: serif, fontSize: '44px', fontWeight: 900, lineHeight: 1 }}>{c.count}</div>
            <div style={{ fontFamily: mono, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--charcoal)', marginTop: '0.75rem' }}>{c.label}</div>
            <div style={{ fontFamily: mono, fontSize: '12px', color: 'var(--warm)', marginTop: '0.3rem' }}>{c.desc}</div>
          </Link>
        ))}
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem', background: 'rgba(200,169,110,0.05)' }}>
        <p style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--warm)', marginBottom: '0.75rem' }}>Cara Menulis Aksara</p>
        <p style={{ fontFamily: mono, fontSize: '14px', color: 'var(--charcoal)', lineHeight: 1.8 }}>
          Di editor Arsip, tiap ayat dipecah per kata. Klik kolom <b>Aksara</b> lalu gunakan <b>Papan Aksara Sunda</b>
          {' '}untuk menyisipkan karakter Unicode. Lengkapi Latin, Terjemah, dan Kelas kata. Anda juga bisa mengunggah
          {' '}<b>foto scan</b> daun lontar asli sebagai pendamping.
        </p>
      </div>
    </div>
  )
}

// Placeholder shimmer — bentuknya ngikutin layout Dashboard asli di atas,
// biar pas data-nya kelar dimuat ga ada lompatan tata letak.
export function DashboardSkeleton() {
  return (
    <div>
      <Skeleton width="140px" height="11px" style={{ marginBottom: '0.75rem' }} />
      <Skeleton width="320px" height="40px" style={{ marginBottom: '0.75rem' }} />
      <Skeleton width="90%" height="15px" style={{ marginBottom: '0.5rem', maxWidth: '620px' }} />
      <Skeleton width="65%" height="15px" style={{ marginBottom: '2.5rem', maxWidth: '620px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem' }}>
            <Skeleton width="56px" height="44px" style={{ marginBottom: '0.75rem' }} />
            <Skeleton width="90px" height="13px" style={{ marginBottom: '0.4rem' }} />
            <Skeleton width="140px" height="12px" />
          </div>
        ))}
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem' }}>
        <Skeleton width="160px" height="11px" style={{ marginBottom: '0.75rem' }} />
        <Skeleton width="100%" height="14px" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="80%" height="14px" />
      </div>
    </div>
  )
}

// ============================================================
// LIST VIEW (reusable — Arsip & Koleksi 3D)
// ============================================================
export interface ListItem { key: string; primary: string; secondary: string; thumb?: string; badge?: string }

export function ListView({
  title, desc, items, onNew, onEdit, onDelete,
}: {
  title: string; desc: string; items: ListItem[]
  onNew: () => void; onEdit: (key: string) => void; onDelete: (key: string) => void
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h1 style={{ fontFamily: serif, fontSize: '36px', fontWeight: 900 }}>{title}</h1>
        <Button variant="solid" onClick={onNew}>+ Tambah Baru</Button>
      </div>
      <p style={{ fontFamily: mono, fontSize: '14px', color: 'var(--warm)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '620px' }}>{desc}</p>

      {items.length === 0 && (
        <div style={{ border: '1px dashed var(--border)', borderRadius: '10px', padding: '3rem', textAlign: 'center', fontFamily: mono, fontSize: '14px', color: 'var(--warm)' }}>
          Belum ada data. Klik “+ Tambah Baru”.
        </div>
      )}

      <div style={{ border: items.length ? '1px solid var(--border)' : 'none', borderRadius: '10px', overflow: 'hidden' }}>
        {items.map((it, i) => (
          <div
            key={it.key}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}
          >
            <div style={{ width: '52px', height: '52px', flexShrink: 0, borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--charcoal)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {it.thumb
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={it.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: mono, fontSize: '18px', color: 'rgba(240,237,230,0.4)' }}>◇</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontFamily: serif, fontSize: '18px', fontWeight: 700, color: 'var(--charcoal)' }}>{it.primary}</span>
                {it.badge && (
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: '10px',
                      letterSpacing: '0.08em',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '999px',
                      background: 'var(--charcoal)',
                      color: 'var(--bone)',
                      flexShrink: 0,
                    }}
                  >
                    {it.badge}
                  </span>
                )}
              </div>
              <div style={{ fontFamily: mono, fontSize: '12px', color: 'var(--warm)', marginTop: '3px' }}>{it.secondary}</div>
            </div>
            <Button variant="outline" onClick={() => onEdit(it.key)}>Edit</Button>
            <Button
              variant="danger"
              onClick={async () => {
                const ok = await confirmDialog(`Hapus "${it.primary}"? Tindakan ini tidak bisa dibatalkan.`, { danger: true, confirmLabel: 'Hapus' })
                if (ok) onDelete(it.key)
              }}
            >
              Hapus
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Placeholder shimmer — ngikutin layout ListView asli (judul+tombol,
// deskripsi, 3 baris item dengan thumb + 2 tombol).
export function ListViewSkeleton() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <Skeleton width="180px" height="36px" />
        <Skeleton width="130px" height="40px" style={{ borderRadius: '6px' }} />
      </div>
      <Skeleton width="55%" height="14px" style={{ marginBottom: '2rem', maxWidth: '620px' }} />
      <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}
          >
            <Skeleton width="52px" height="52px" style={{ borderRadius: '6px', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Skeleton width="50%" height="18px" style={{ marginBottom: '6px' }} />
              <Skeleton width="30%" height="12px" />
            </div>
            <Skeleton width="64px" height="34px" style={{ borderRadius: '6px', flexShrink: 0 }} />
            <Skeleton width="64px" height="34px" style={{ borderRadius: '6px', flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// DATA TAB — export / import / reset
// ============================================================
export function DataTab() {
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function download() {
    setBusy(true)
    const json = await exportJSON()
    setBusy(false)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lontar-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Data diekspor ke file JSON.')
  }

  return (
    <div>
      <h1 style={{ fontFamily: serif, fontSize: '36px', fontWeight: 900, marginBottom: '0.5rem' }}>Data &amp; Backup</h1>
      <p style={{ fontFamily: mono, fontSize: '14px', color: 'var(--warm)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '620px' }}>
        Data tersimpan di database Supabase. Ekspor JSON untuk backup; impor untuk memulihkan. Jika database masih kosong,
        klik “Muat Data Awal” untuk mengisi contoh (seed) agar bisa langsung mulai mengedit.
      </p>

      {msg && (
        <div style={{ border: '1px solid var(--border)', borderRadius: '8px', background: 'rgba(200,169,110,0.08)', padding: '0.8rem 1rem', fontFamily: mono, fontSize: '13px', color: 'var(--charcoal)', marginBottom: '1.5rem' }}>{msg}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '520px' }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem' }}>
          <p style={{ fontFamily: serif, fontSize: '17px', fontWeight: 700, marginBottom: '0.4rem' }}>Muat Data Awal (Seed)</p>
          <p style={{ fontFamily: mono, fontSize: '12px', color: 'var(--warm)', marginBottom: '1rem' }}>Isi database dengan data contoh bawaan. Aman diklik berulang (upsert).</p>
          <Button variant="solid" disabled={busy} onClick={async () => {
            setBusy(true)
            try { await seedIntoDatabase(); setMsg('Data awal dimuat ke database.') }
            catch (e) { setMsg('Gagal seed: ' + (e as Error).message) }
            finally { setBusy(false) }
          }}>↧ Muat Data Awal</Button>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem' }}>
          <p style={{ fontFamily: serif, fontSize: '17px', fontWeight: 700, marginBottom: '0.4rem' }}>Ekspor JSON</p>
          <p style={{ fontFamily: mono, fontSize: '12px', color: 'var(--warm)', marginBottom: '1rem' }}>Unduh seluruh data sebagai satu file.</p>
          <Button variant="outline" disabled={busy} onClick={download}>⬇ Unduh Backup</Button>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem' }}>
          <p style={{ fontFamily: serif, fontSize: '17px', fontWeight: 700, marginBottom: '0.4rem' }}>Impor JSON</p>
          <p style={{ fontFamily: mono, fontSize: '12px', color: 'var(--warm)', marginBottom: '1rem' }}>Muat data dari file backup (upsert ke database).</p>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setBusy(true)
              const text = await file.text()
              const res = await importJSON(text)
              setBusy(false)
              setMsg(res.ok ? 'Data berhasil diimpor.' : 'Gagal impor: ' + res.error)
              if (fileRef.current) fileRef.current.value = ''
            }}
          />
          <Button variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>⬆ Pilih File</Button>
        </div>
      </div>
    </div>
  )
}
