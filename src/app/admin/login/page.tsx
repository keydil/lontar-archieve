'use client'

import { useState } from 'react'
import { supabase, supabaseConfigured } from '@/lib/supabase'
import { Button } from '@/components/admin/AdminUI'

const mono = "'DM Mono', monospace"
const serif = "'Playfair Display', serif"

// ============================================================
// LOGIN — Supabase Auth (email + password). Berdiri sendiri, ga
// numpang di layout dashboard. Sukses login -> admin/layout.tsx
// yang deteksi perubahan sesi (onAuthStateChange) & redirect ke /admin.
// ============================================================
export default function AdminLoginPage() {
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
    // sukses → layout admin akan mengubah tampilan (onAuthStateChange)
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
