'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  useCMS,
  upsertNaskah,
  deleteNaskah,
  upsertKoleksi,
  deleteKoleksi,
  exportJSON,
  importJSON,
  seedIntoDatabase,
  type Artifact,
  type LontarNaskah,
} from '@/lib/cms'
import { supabase, supabaseConfigured } from '@/lib/supabase'
import { Button, Skeleton } from '@/components/admin/AdminUI'
import NaskahEditor, { blankNaskah } from '@/components/admin/NaskahEditor'
import KoleksiEditor, { blankKoleksi } from '@/components/admin/KoleksiEditor'
import { toast, confirmDialog, FeedbackHost } from '@/components/admin/Feedback'

const mono = "'DM Mono', monospace"
const serif = "'Playfair Display', serif"

type Tab = 'dashboard' | 'naskah' | 'koleksi' | 'data'
const TAB_IDS: Tab[] = ['dashboard', 'naskah', 'koleksi', 'data']
type Editing =
  | { kind: 'naskah'; mode: 'new' | 'edit'; data: LontarNaskah }
  | { kind: 'koleksi'; mode: 'new' | 'edit'; data: Artifact }
  | null

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(Boolean(data.session))
      setChecked(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(Boolean(session))
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!checked) return null
  if (!authed) return <Gate />
  return <AdminApp />
}

// ============================================================
// GATE — login Supabase Auth (email + password)
// ============================================================
function Gate() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabaseConfigured) {
      setErr('Supabase belum dikonfigurasi (.env).')
      return
    }
    setBusy(true)
    setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    setBusy(false)
    if (error) setErr('Login gagal: ' + error.message)
    // sukses → onAuthStateChange akan mengubah tampilan
  }

  const inputStyle = (bad: boolean) => ({
    width: '100%', fontFamily: mono, fontSize: '15px', padding: '0.8rem 0.9rem',
    border: `1px solid ${bad ? '#a03434' : 'var(--border)'}`, borderRadius: '6px', background: 'var(--bone)',
    outline: 'none', marginBottom: '0.75rem',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bone)', cursor: 'auto' }}>
      <form onSubmit={submit} style={{ width: '360px', border: '1px solid var(--border)', borderRadius: '12px', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <p style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--warm)', marginBottom: '0.75rem' }}>
          Panel Admin
        </p>
        <h1 style={{ fontFamily: serif, fontSize: '30px', fontWeight: 900, marginBottom: '1.5rem' }}>Arsip Lontar</h1>
        <input type="email" value={email} autoFocus placeholder="Email" onChange={(e) => { setEmail(e.target.value); setErr('') }} style={inputStyle(Boolean(err))} />
        <input type="password" value={pass} placeholder="Password" onChange={(e) => { setPass(e.target.value); setErr('') }} style={inputStyle(Boolean(err))} />
        {err && <p style={{ fontFamily: mono, fontSize: '12px', color: '#a03434', margin: '0.25rem 0 0.75rem' }}>{err}</p>}
        <Button type="submit" variant="solid" disabled={busy} style={{ width: '100%', padding: '0.85rem', marginTop: '0.25rem' }}>
          {busy ? 'Masuk…' : 'Masuk'}
        </Button>
        <p style={{ fontFamily: mono, fontSize: '11px', color: 'var(--warm)', marginTop: '1.25rem', lineHeight: 1.6, opacity: 0.9 }}>
          Akun dibuat lewat dashboard Supabase<br />(Authentication → Users).
        </p>
      </form>
    </div>
  )
}

// ============================================================
// MAIN APP
// ============================================================
function AdminApp() {
  const { data, hydrated } = useCMS()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [tab, setTabState] = useState<Tab>(
    TAB_IDS.includes(tabFromUrl as Tab) ? (tabFromUrl as Tab) : 'dashboard'
  )
  const [editing, setEditing] = useState<Editing>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Sinkron ke URL (?tab=...) — biar pindah tab kelihatan di address bar
  // dan refresh ga balik ke Dashboard begitu aja.
  function setTab(next: Tab) {
    setTabState(next)
    router.replace(next === 'dashboard' ? '/admin' : `/admin?tab=${next}`, { scroll: false })
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'naskah', label: 'Arsip', count: data.naskah.length },
    { id: 'koleksi', label: 'Koleksi 3D', count: data.koleksi.length },
    { id: 'data', label: 'Data & Backup' },
  ]

  // Ahli lagi ngedit (mis. Lembar 2 Ayat 3) tapi mau pindah halaman —
  // jangan biarkan tulisannya sia-sia kebuang tanpa peringatan.
  async function confirmLeaveIfDirty() {
    if (!editing || !isDirty) return true
    return confirmDialog(
      'Ada perubahan yang belum disimpan. Kalau pindah sekarang, perubahan itu akan hilang.',
      { danger: true, confirmLabel: 'Ya, Buang Perubahan' }
    )
  }

  function closeEditor() {
    setEditing(null)
    setIsDirty(false)
  }

  // Guard navigasi browser (tutup tab / refresh / ketik URL baru) —
  // native browser prompt, satu-satunya yang bisa dipakai di titik ini.
  useEffect(() => {
    if (!editing || !isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [editing, isDirty])

  return (
    <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bone)', cursor: 'auto' }}>
      <FeedbackHost />
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ width: '240px', flexShrink: 0, borderRight: '1px solid var(--border)', padding: '2rem 1.25rem', position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="admin-sidebar-title" style={{ marginBottom: '2rem' }}>
          <p style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--warm)', marginBottom: '0.4rem' }}>Panel Admin</p>
          <p style={{ fontFamily: serif, fontSize: '22px', fontWeight: 900, lineHeight: 1 }}>Arsip Lontar</p>
        </div>
        <nav className="admin-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={async () => {
                if (!(await confirmLeaveIfDirty())) return
                setTab(t.id)
                closeEditor()
              }}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: mono, fontSize: '13px', letterSpacing: '0.03em',
                padding: '0.75rem 0.9rem', textAlign: 'left', cursor: 'pointer',
                border: '1px solid transparent',
                borderRadius: '6px',
                background: tab === t.id ? 'var(--charcoal)' : 'transparent',
                color: tab === t.id ? 'var(--bone)' : 'var(--charcoal)',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
              {t.count !== undefined && (
                <span style={{ fontSize: '11px', opacity: 0.7 }}>{t.count}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            onClick={async () => {
              if (!(await confirmLeaveIfDirty())) return
              router.push('/')
            }}
            style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, whiteSpace: 'nowrap' }}
          >
            ← Lihat Situs
          </button>
          <button
            onClick={async () => {
              if (!(await confirmLeaveIfDirty())) return
              supabase.auth.signOut()
            }}
            style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, whiteSpace: 'nowrap' }}
          >
            Keluar ↩
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="admin-main" style={{ flex: 1, minWidth: 0, padding: '2.5rem 3rem' }}>
        {!hydrated && tab === 'data' && <DataTab />}
        {!hydrated && tab !== 'data' && (
          tab === 'naskah' || tab === 'koleksi' ? <ListViewSkeleton /> : <DashboardSkeleton />
        )}
        {hydrated && (
        <>
        {editing?.kind === 'naskah' && (
          <NaskahEditor
            initial={editing.data}
            onDirtyChange={setIsDirty}
            onCancel={async () => {
              if (!(await confirmLeaveIfDirty())) return
              closeEditor()
            }}
            onSave={async (n) => {
              try { await upsertNaskah(n); closeEditor(); setTab('naskah'); toast('Arsip tersimpan.', 'success') }
              catch (e) { toast('Gagal menyimpan: ' + (e as Error).message, 'error') }
            }}
          />
        )}
        {editing?.kind === 'koleksi' && (
          <KoleksiEditor
            initial={editing.data}
            isNew={editing.mode === 'new'}
            onDirtyChange={setIsDirty}
            onCancel={async () => {
              if (!(await confirmLeaveIfDirty())) return
              closeEditor()
            }}
            onSave={async (a) => {
              try { await upsertKoleksi(a); closeEditor(); setTab('koleksi'); toast('Artefak tersimpan.', 'success') }
              catch (e) { toast('Gagal menyimpan: ' + (e as Error).message, 'error') }
            }}
          />
        )}
        {!editing && tab === 'dashboard' && <Dashboard data={data} onGo={setTab} />}
        {!editing && tab === 'naskah' && (
          <ListView
            title="Arsip"
            desc="Teks bacaan interaktif per-ayat (aksara, latin, terjemah, makna). Ini yang tampil di halaman Arsip."
            items={data.naskah.map((n) => ({
              key: n.id,
              primary: n.title || '(tanpa judul)',
              secondary: `${n.aksaraType ?? ''} · ${n.lembar.length} lembar · ${n.lembar.reduce((sum, l) => sum + l.verses.length, 0)} ayat${n.finalized ? ' · TERKUNCI' : ''}${n.published === false ? ' · DRAFT' : ''}`,
              thumb: n.coverImage,
            }))}
            onNew={() => setEditing({ kind: 'naskah', mode: 'new', data: blankNaskah() })}
            onEdit={(key) => setEditing({ kind: 'naskah', mode: 'edit', data: data.naskah.find((n) => n.id === key)! })}
            onDelete={async (key) => { try { await deleteNaskah(key); toast('Arsip dihapus.', 'success') } catch (e) { toast('Gagal menghapus: ' + (e as Error).message, 'error') } }}
          />
        )}
        {!editing && tab === 'koleksi' && (
          <ListView
            title="Koleksi 3D"
            desc="Artefak dengan model 3D & hotspot. Tampil di halaman Koleksi."
            items={data.koleksi.map((k) => ({
              key: k.slug,
              primary: k.name,
              secondary: `${k.type} · ${k.year} · ${k.hotspots.length} hotspot`,
              thumb: k.images?.[0],
            }))}
            onNew={() => setEditing({ kind: 'koleksi', mode: 'new', data: blankKoleksi() })}
            onEdit={(key) => setEditing({ kind: 'koleksi', mode: 'edit', data: data.koleksi.find((k) => k.slug === key)! })}
            onDelete={async (key) => { try { await deleteKoleksi(key); toast('Artefak dihapus.', 'success') } catch (e) { toast('Gagal menghapus: ' + (e as Error).message, 'error') } }}
          />
        )}
        {!editing && tab === 'data' && <DataTab />}
        </>
        )}
      </main>
    </div>
  )
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ data, onGo }: { data: ReturnType<typeof useCMS>['data']; onGo: (t: Tab) => void }) {
  const cards: { label: string; count: number; tab: Tab; desc: string }[] = [
    { label: 'Arsip', count: data.naskah.length, tab: 'naskah', desc: 'Teks interaktif per ayat' },
    { label: 'Koleksi 3D', count: data.koleksi.length, tab: 'koleksi', desc: 'Artefak & model 3D' },
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
          <button
            key={c.label}
            onClick={() => onGo(c.tab)}
            style={{ textAlign: 'left', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem', background: 'transparent', cursor: 'pointer' }}
          >
            <div style={{ fontFamily: serif, fontSize: '44px', fontWeight: 900, lineHeight: 1 }}>{c.count}</div>
            <div style={{ fontFamily: mono, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--charcoal)', marginTop: '0.75rem' }}>{c.label}</div>
            <div style={{ fontFamily: mono, fontSize: '12px', color: 'var(--warm)', marginTop: '0.3rem' }}>{c.desc}</div>
          </button>
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
function DashboardSkeleton() {
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
// LIST VIEW (reusable)
// ============================================================
interface ListItem { key: string; primary: string; secondary: string; thumb?: string }
function ListView({
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
              <div style={{ fontFamily: serif, fontSize: '18px', fontWeight: 700, color: 'var(--charcoal)' }}>{it.primary}</div>
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
function ListViewSkeleton() {
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
function DataTab() {
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
