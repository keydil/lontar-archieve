'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FileText, Box, Settings, Database, Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCMS } from '@/lib/cms'
import { ADMIN_NAV_ITEMS, type AdminNavItem } from '@/lib/nav'
import { FeedbackHost, confirmDialog } from '@/components/admin/Feedback'
import { useEditorDirty } from '@/components/admin/editorDirtyStore'

const NAV_ICONS: Record<AdminNavItem['id'], typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  arsip: FileText,
  koleksi: Box,
  seo: Settings,
  backup: Database,
}

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
  const [mobileOpen, setMobileOpen] = useState(false)
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

  // Tutup sidebar mobile tiap ganti halaman.
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

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
    <div className="admin-shell flex min-h-screen bg-[#F8F5EC]" style={{ cursor: 'auto' }}>
      <FeedbackHost />

      {/* Tombol hamburger — cuma muncul di mobile */}
      <button
        onClick={() => setMobileOpen((o) => !o)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#FFFDF9] border border-[#DCD3C1] rounded-sm shadow-sm cursor-pointer"
        aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
      >
        {mobileOpen ? <X className="w-5 h-5 text-[#1A1816]" /> : <Menu className="w-5 h-5 text-[#1A1816]" />}
      </button>

      {/* Backdrop — cuma di mobile pas sidebar kebuka */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-[240px] shrink-0 border-r border-[#DCD3C1] bg-[#FFFDF9] p-8 px-5 flex flex-col
          fixed inset-y-0 left-0 z-40 h-screen overflow-y-auto transition-transform duration-200
          lg:sticky lg:top-0 lg:translate-x-0 lg:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-8 pt-10 lg:pt-0">
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#8A7144] mb-1">Panel Admin</p>
          <p className="font-['Playfair_Display',serif] text-[22px] font-black leading-none text-[#1A1816]">Arsip Lontar</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {ADMIN_NAV_ITEMS.map((t) => {
            const isActive = t.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(t.href)
            const count = counts[t.id]
            const Icon = NAV_ICONS[t.id]
            return (
              <Link
                key={t.id}
                href={t.href}
                onClick={(e) => {
                  if (!isDirty) return
                  e.preventDefault()
                  guardedNavigate(t.href)
                }}
                className={`flex justify-between items-center font-mono text-[13px] tracking-[0.03em] px-3.5 py-3 rounded-sm whitespace-nowrap no-underline cursor-pointer transition-colors ${
                  isActive ? 'bg-[#8A7144] text-white' : 'text-[#4A433A] hover:bg-[#F3EFE4]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#8A7144]'}`} />
                  {t.label}
                </span>
                {count !== undefined && <span className="text-[11px] opacity-70">{count}</span>}
              </Link>
            )
          })}
        </nav>
        <div className="flex flex-col gap-3 mt-6">
          <Link
            href="/"
            onClick={(e) => {
              if (!isDirty) return
              e.preventDefault()
              guardedNavigate('/')
            }}
            className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#8A7144] hover:text-[#2C2825] no-underline whitespace-nowrap transition-colors"
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
            className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#8A7144] hover:text-[#2C2825] bg-transparent border-0 cursor-pointer text-left p-0 whitespace-nowrap transition-colors"
          >
            Keluar ↩
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 p-5 pt-20 sm:p-6 sm:pt-20 lg:p-10 lg:px-12 lg:pt-10">
        {children}
      </main>
    </div>
  )
}
