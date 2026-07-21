'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  useCMS,
  upsertNaskah,
  deleteNaskah,
  upsertKoleksi,
  deleteKoleksi,
  upsertArsip,
  deleteArsip,
  exportJSON,
  importJSON,
  seedIntoDatabase,
  type Artifact,
  type ArsipEntry,
  type LontarNaskah,
} from '@/lib/cms'
import { supabase, supabaseConfigured } from '@/lib/supabase'
import { Button } from '@/components/admin/AdminUI'
import NaskahEditor, { blankNaskah } from '@/components/admin/NaskahEditor'
import KoleksiEditor, { blankKoleksi } from '@/components/admin/KoleksiEditor'
import ArsipEditor, { blankArsip } from '@/components/admin/ArsipEditor'

const mono = "'DM Mono', monospace"
const serif = "'Playfair Display', serif"

type Tab = 'dashboard' | 'naskah' | 'koleksi' | 'arsip' | 'data'
type Editing =
  | { kind: 'naskah'; mode: 'new' | 'edit'; data: LontarNaskah }
  | { kind: 'koleksi'; mode: 'new' | 'edit'; data: Artifact }
  | { kind: 'arsip'; mode: 'new' | 'edit'; data: ArsipEntry }
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
    width: '100%', fontFamily: mono, fontSize: '13px', padding: '0.7rem',
    border: `1px solid ${bad ? '#a03434' : 'var(--border)'}`, background: 'var(--bone)',
    outline: 'none', marginBottom: '0.75rem',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bone)', cursor: 'auto' }}>
      <form onSubmit={submit} style={{ width: '340px', border: '1px solid var(--border)', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <p style={{ fontFamily: mono, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--warm)', marginBottom: '0.75rem' }}>
          Panel Admin
        </p>
        <h1 style={{ fontFamily: serif, fontSize: '28px', fontWeight: 900, marginBottom: '1.5rem' }}>Arsip Lontar</h1>
        <input type="email" value={email} autoFocus placeholder="Email" onChange={(e) => { setEmail(e.target.value); setErr('') }} style={inputStyle(Boolean(err))} />
        <input type="password" value={pass} placeholder="Password" onChange={(e) => { setPass(e.target.value); setErr('') }} style={inputStyle(Boolean(err))} />
        {err && <p style={{ fontFamily: mono, fontSize: '10px', color: '#a03434', margin: '0.25rem 0 0.75rem' }}>{err}</p>}
        <Button type="submit" variant="solid" disabled={busy} style={{ width: '100%', padding: '0.8rem', marginTop: '0.25rem' }}>
          {busy ? 'Masuk…' : 'Masuk'}
        </Button>
        <p style={{ fontFamily: mono, fontSize: '9px', color: 'var(--warm)', marginTop: '1.25rem', lineHeight: 1.6, opacity: 0.8 }}>
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
  const [tab, setTab] = useState<Tab>('dashboard')
  const [editing, setEditing] = useState<Editing>(null)

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'naskah', label: 'Naskah Baca', count: data.naskah.length },
    { id: 'koleksi', label: 'Koleksi 3D', count: data.koleksi.length },
    { id: 'arsip', label: 'Arsip Teks', count: data.arsip.length },
    { id: 'data', label: 'Data & Backup' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bone)', cursor: 'auto' }}>
      {/* Sidebar */}
      <aside style={{ width: '240px', flexShrink: 0, borderRight: '1px solid var(--border)', padding: '2rem 1.25rem', position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontFamily: mono, fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--warm)', marginBottom: '0.4rem' }}>Panel Admin</p>
          <p style={{ fontFamily: serif, fontSize: '20px', fontWeight: 900, lineHeight: 1 }}>Arsip Lontar</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setEditing(null) }}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: mono, fontSize: '11px', letterSpacing: '0.05em',
                padding: '0.7rem 0.85rem', textAlign: 'left', cursor: 'pointer',
                border: '1px solid transparent',
                background: tab === t.id ? 'var(--charcoal)' : 'transparent',
                color: tab === t.id ? 'var(--bone)' : 'var(--charcoal)',
              }}
            >
              {t.label}
              {t.count !== undefined && (
                <span style={{ fontSize: '9px', opacity: 0.6 }}>{t.count}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Link href="/" style={{ fontFamily: mono, fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--warm)', textDecoration: 'none' }}>
            ← Lihat Situs
          </Link>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ fontFamily: mono, fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--warm)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
          >
            Keluar ↩
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: '2.5rem 3rem', maxWidth: '1100px' }}>
        {!hydrated && <p style={{ fontFamily: mono, fontSize: '11px', color: 'var(--warm)' }}>Memuat data…</p>}

        {editing?.kind === 'naskah' && (
          <NaskahEditor
            initial={editing.data}
            onCancel={() => setEditing(null)}
            onSave={async (n) => { try { await upsertNaskah(n); setEditing(null); setTab('naskah') } catch (e) { alert('Gagal menyimpan: ' + (e as Error).message) } }}
          />
        )}
        {editing?.kind === 'koleksi' && (
          <KoleksiEditor
            initial={editing.data}
            isNew={editing.mode === 'new'}
            onCancel={() => setEditing(null)}
            onSave={async (a) => { try { await upsertKoleksi(a); setEditing(null); setTab('koleksi') } catch (e) { alert('Gagal menyimpan: ' + (e as Error).message) } }}
          />
        )}
        {editing?.kind === 'arsip' && (
          <ArsipEditor
            initial={editing.data}
            isNew={editing.mode === 'new'}
            koleksiOptions={data.koleksi}
            onCancel={() => setEditing(null)}
            onSave={async (a) => { try { await upsertArsip(a); setEditing(null); setTab('arsip') } catch (e) { alert('Gagal menyimpan: ' + (e as Error).message) } }}
          />
        )}

        {!editing && tab === 'dashboard' && <Dashboard data={data} onGo={setTab} />}
        {!editing && tab === 'naskah' && (
          <ListView
            title="Naskah Baca"
            desc="Teks bacaan interaktif per-ayat (aksara, latin, terjemah, makna). Ini yang tampil di halaman Baca."
            items={data.naskah.map((n) => ({
              key: n.id,
              primary: n.title || '(tanpa judul)',
              secondary: `${n.aksaraType ?? ''} · ${n.verses.length} ayat${n.published === false ? ' · DRAFT' : ''}`,
              thumb: n.coverImage,
            }))}
            onNew={() => setEditing({ kind: 'naskah', mode: 'new', data: blankNaskah() })}
            onEdit={(key) => setEditing({ kind: 'naskah', mode: 'edit', data: data.naskah.find((n) => n.id === key)! })}
            onDelete={async (key) => { try { await deleteNaskah(key) } catch (e) { alert('Gagal menghapus: ' + (e as Error).message) } }}
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
            onDelete={async (key) => { try { await deleteKoleksi(key) } catch (e) { alert('Gagal menghapus: ' + (e as Error).message) } }}
          />
        )}
        {!editing && tab === 'arsip' && (
          <ListView
            title="Arsip Teks"
            desc="Entri transkripsi & terjemahan. Tampil di halaman Arsip."
            items={data.arsip.map((a) => ({
              key: a.slug,
              primary: a.title,
              secondary: `${a.script} · ${a.period}`,
              thumb: a.image,
            }))}
            onNew={() => setEditing({ kind: 'arsip', mode: 'new', data: blankArsip() })}
            onEdit={(key) => setEditing({ kind: 'arsip', mode: 'edit', data: data.arsip.find((a) => a.slug === key)! })}
            onDelete={async (key) => { try { await deleteArsip(key) } catch (e) { alert('Gagal menghapus: ' + (e as Error).message) } }}
          />
        )}
        {!editing && tab === 'data' && <DataTab />}
      </main>
    </div>
  )
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ data, onGo }: { data: ReturnType<typeof useCMS>['data']; onGo: (t: Tab) => void }) {
  const cards: { label: string; count: number; tab: Tab; desc: string }[] = [
    { label: 'Naskah Baca', count: data.naskah.length, tab: 'naskah', desc: 'Teks interaktif per ayat' },
    { label: 'Koleksi 3D', count: data.koleksi.length, tab: 'koleksi', desc: 'Artefak & model 3D' },
    { label: 'Arsip Teks', count: data.arsip.length, tab: 'arsip', desc: 'Transkripsi & terjemahan' },
  ]
  return (
    <div>
      <p style={{ fontFamily: mono, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--warm)', marginBottom: '0.75rem' }}>Dashboard</p>
      <h1 style={{ fontFamily: serif, fontSize: '40px', fontWeight: 900, marginBottom: '0.5rem' }}>Selamat datang</h1>
      <p style={{ fontFamily: mono, fontSize: '12px', color: 'var(--warm)', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '620px' }}>
        Panel ini untuk ahli memasukkan &amp; mengedit data lontar. Semua perubahan langsung tampil di situs dan tersimpan
        di browser ini. Gunakan tab <b>Data &amp; Backup</b> untuk mengekspor JSON (backup / pindah perangkat).
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => onGo(c.tab)}
            style={{ textAlign: 'left', border: '1px solid var(--border)', padding: '1.5rem', background: 'transparent', cursor: 'pointer' }}
          >
            <div style={{ fontFamily: serif, fontSize: '44px', fontWeight: 900, lineHeight: 1 }}>{c.count}</div>
            <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--charcoal)', marginTop: '0.75rem' }}>{c.label}</div>
            <div style={{ fontFamily: mono, fontSize: '10px', color: 'var(--warm)', marginTop: '0.3rem' }}>{c.desc}</div>
          </button>
        ))}
      </div>
      <div style={{ border: '1px solid var(--border)', padding: '1.5rem', background: 'rgba(200,169,110,0.05)' }}>
        <p style={{ fontFamily: mono, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--warm)', marginBottom: '0.75rem' }}>Cara Menulis Aksara</p>
        <p style={{ fontFamily: mono, fontSize: '11px', color: 'var(--charcoal)', lineHeight: 1.9 }}>
          Di editor Naskah, tiap ayat dipecah per kata. Klik kolom <b>Aksara</b> lalu gunakan <b>Papan Aksara Sunda</b>
          {' '}untuk menyisipkan karakter Unicode. Lengkapi Latin, Terjemah, dan Kelas kata. Anda juga bisa mengunggah
          {' '}<b>foto scan</b> daun lontar asli sebagai pendamping.
        </p>
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
      <p style={{ fontFamily: mono, fontSize: '11px', color: 'var(--warm)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '620px' }}>{desc}</p>

      {items.length === 0 && (
        <div style={{ border: '1px dashed var(--border)', padding: '3rem', textAlign: 'center', fontFamily: mono, fontSize: '12px', color: 'var(--warm)' }}>
          Belum ada data. Klik “+ Tambah Baru”.
        </div>
      )}

      <div style={{ border: items.length ? '1px solid var(--border)' : 'none' }}>
        {items.map((it, i) => (
          <div
            key={it.key}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}
          >
            <div style={{ width: '52px', height: '52px', flexShrink: 0, border: '1px solid var(--border)', background: 'var(--charcoal)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {it.thumb
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={it.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: mono, fontSize: '18px', color: 'rgba(240,237,230,0.4)' }}>◇</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: serif, fontSize: '17px', fontWeight: 700, color: 'var(--charcoal)' }}>{it.primary}</div>
              <div style={{ fontFamily: mono, fontSize: '10px', color: 'var(--warm)', marginTop: '2px' }}>{it.secondary}</div>
            </div>
            <Button variant="outline" onClick={() => onEdit(it.key)}>Edit</Button>
            <Button
              variant="danger"
              onClick={() => { if (confirm(`Hapus "${it.primary}"? Tindakan ini tidak bisa dibatalkan.`)) onDelete(it.key) }}
            >
              Hapus
            </Button>
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
      <p style={{ fontFamily: mono, fontSize: '11px', color: 'var(--warm)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '620px' }}>
        Data tersimpan di database Supabase. Ekspor JSON untuk backup; impor untuk memulihkan. Jika database masih kosong,
        klik “Muat Data Awal” untuk mengisi contoh (seed) agar bisa langsung mulai mengedit.
      </p>

      {msg && (
        <div style={{ border: '1px solid var(--border)', background: 'rgba(200,169,110,0.08)', padding: '0.8rem 1rem', fontFamily: mono, fontSize: '11px', color: 'var(--charcoal)', marginBottom: '1.5rem' }}>{msg}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '520px' }}>
        <div style={{ border: '1px solid var(--border)', padding: '1.25rem' }}>
          <p style={{ fontFamily: serif, fontSize: '16px', fontWeight: 700, marginBottom: '0.4rem' }}>Muat Data Awal (Seed)</p>
          <p style={{ fontFamily: mono, fontSize: '10px', color: 'var(--warm)', marginBottom: '1rem' }}>Isi database dengan data contoh bawaan. Aman diklik berulang (upsert).</p>
          <Button variant="solid" disabled={busy} onClick={async () => {
            setBusy(true)
            try { await seedIntoDatabase(); setMsg('Data awal dimuat ke database.') }
            catch (e) { setMsg('Gagal seed: ' + (e as Error).message) }
            finally { setBusy(false) }
          }}>↧ Muat Data Awal</Button>
        </div>

        <div style={{ border: '1px solid var(--border)', padding: '1.25rem' }}>
          <p style={{ fontFamily: serif, fontSize: '16px', fontWeight: 700, marginBottom: '0.4rem' }}>Ekspor JSON</p>
          <p style={{ fontFamily: mono, fontSize: '10px', color: 'var(--warm)', marginBottom: '1rem' }}>Unduh seluruh data sebagai satu file.</p>
          <Button variant="outline" disabled={busy} onClick={download}>⬇ Unduh Backup</Button>
        </div>

        <div style={{ border: '1px solid var(--border)', padding: '1.25rem' }}>
          <p style={{ fontFamily: serif, fontSize: '16px', fontWeight: 700, marginBottom: '0.4rem' }}>Impor JSON</p>
          <p style={{ fontFamily: mono, fontSize: '10px', color: 'var(--warm)', marginBottom: '1rem' }}>Muat data dari file backup (upsert ke database).</p>
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
