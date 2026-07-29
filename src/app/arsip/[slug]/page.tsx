'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useCMS } from '@/lib/cms'
import LontarReader from '@/components/LontarReader'

export default function ArsipDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data, hydrated } = useCMS()

  if (!hydrated) {
    return (
      <div style={{ padding: '6rem 4rem', fontFamily: "'DM Mono', monospace", fontSize: '14px', color: 'var(--warm)' }}>
        Memuat naskah…
      </div>
    )
  }

  const naskahList = data.naskah.filter((n) => n.published !== false)
  const active = naskahList.find((n) => n.id === slug)

  if (!active) {
    return (
      <div style={{ padding: '6rem 4rem', fontFamily: "'DM Mono', monospace", fontSize: '15px', color: 'var(--warm)' }}>
        Naskah tidak ditemukan.{' '}
        <Link href="/arsip" style={{ color: 'var(--charcoal)', textDecoration: 'underline' }}>Kembali ke Arsip</Link>
      </div>
    )
  }

  return (
    <>
      {/* Sticky Nav */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 4rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bone)',
      }}>
        <Link
          href="/arsip"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '12px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--charcoal)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          ← Arsip Lontar
        </Link>

        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '12px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--charcoal)',
        }}>
          {active.title}
        </span>

        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--warm)',
        }}>
          Mode Baca — Interaktif
        </span>
      </nav>

      {/* Konten Lontar Reader */}
      <LontarReader key={active.id} naskah={active} />
    </>
  )
}
