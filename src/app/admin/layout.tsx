'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useCMS } from '@/lib/cms'
import { ADMIN_NAV_ITEMS } from '@/lib/nav'
import { FeedbackHost, confirmDialog } from '@/components/admin/Feedback'
import { useEditorDirty } from '@/components/admin/editorDirtyStore'

const mono = "'DM Mono', monospace"
const serif = "'Playfair Display', serif"

const UNSAVED_MSG = 'Ada perubahan yang belum disimpan. Kalau pindah sekarang, perubahan itu akan hilang.'

// ============================================================
// ADMIN LAYOUT — auth-guard + sidebar shell buat seluruh /admin/*.
//
// Auth: client-side check (supabase.auth.getSession() + onAuthStateChange).
// BUKAN middleware.ts — sesi Supabase di app ini disimpan di
// localStorage (lib/supabase.ts, createClient bawaan @supabase/supabase-js),
// dan middleware Next.js jalan di server/edge yang cuma bisa baca
// cookie/header, ga bisa akses localStorage. Middleware asli baru
// masuk akal kalau nanti migrasi ke @supabase/ssr (sesi berbasis
// cookie) — itu perubahan tersendiri, bukan bagian refactor routing ini.
// ============================================================
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [checked, setChecked] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isDirty = useEditorDirty()
  const { data } = useCMS()
  const isLoginRoute = pathname === '/admin/login'

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

  useEffect(() => {
    if (!checked) return
    if (!authed && !isLoginRoute) router.replace('/admin/login')
    if (authed && isLoginRoute) router.replace('/admin')
  }, [checked, authed, isLoginRoute, router])

  // Guard navigasi browser (tutup tab / refresh / ketik URL baru) — native
  // browser prompt, satu-satunya yang bisa dipakai buat real page unload.
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  async function guardedNavigate(href: string) {
    if (isDirty) {
      const ok = await confirmDialog(UNSAVED_MSG, { danger: true, confirmLabel: 'Ya, Buang Perubahan' })
      if (!ok) return
    }
    router.push(href)
  }

  if (!checked) return null
  if (isLoginRoute) {
    if (authed) return null // lagi redirect ke /admin
    return <>{children}</> // login berdiri sendiri, ga pake shell
  }
  if (!authed) return null // lagi redirect ke /admin/login

  const counts: Record<string, number | undefined> = {
    arsip: data.naskah.length,
    koleksi: data.koleksi.length,
  }

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
          {ADMIN_NAV_ITEMS.map((t) => {
            const isActive = t.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(t.href)
            const count = counts[t.id]
            return (
              <Link
                key={t.id}
                href={t.href}
                onClick={(e) => {
                  if (!isDirty) return
                  e.preventDefault()
                  guardedNavigate(t.href)
                }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontFamily: mono, fontSize: '13px', letterSpacing: '0.03em',
                  padding: '0.75rem 0.9rem', textAlign: 'left', cursor: 'pointer',
                  border: '1px solid transparent',
                  borderRadius: '6px',
                  background: isActive ? 'var(--charcoal)' : 'transparent',
                  color: isActive ? 'var(--bone)' : 'var(--charcoal)',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                }}
              >
                {t.label}
                {count !== undefined && (
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>{count}</span>
                )}
              </Link>
            )
          })}
        </nav>
        <div className="admin-sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Link
            href="/"
            onClick={(e) => {
              if (!isDirty) return
              e.preventDefault()
              guardedNavigate('/')
            }}
            style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm)', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            ← Lihat Situs
          </Link>
          <button
            onClick={async () => {
              if (isDirty) {
                const ok = await confirmDialog(UNSAVED_MSG, { danger: true, confirmLabel: 'Ya, Buang Perubahan' })
                if (!ok) return
              }
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
        {children}
      </main>
    </div>
  )
}
