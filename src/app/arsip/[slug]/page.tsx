'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getArsipBySlug } from '@/data/arsip'

const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false })

export default function ArsipDetailPage() {
  const params = useParams<{ slug: string }>()
  const pathname = usePathname()
  const entry = getArsipBySlug(params.slug)
  const [lang, setLang] = useState<'id' | 'en'>('id')

  const navItems = [
    { label: 'Koleksi', href: '/koleksi' },
    { label: 'Arsip', href: '/arsip' },
    { label: 'Riset', href: '/riset' },
    { label: 'Kontak', href: '/kontak' },
  ]

  if (!entry) {
    return (
      <>
        <nav className="global-nav">
          <Link href="/" style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--charcoal)', textDecoration: 'none' }}>
            Arsip Lontar
          </Link>
          <ul>
            {navItems.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className={`nav-link ${pathname?.startsWith(item.href) ? 'nav-active' : ''}`} style={{ fontFamily: "'DM Mono', monospace" }}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: '10rem 4rem 4rem', fontFamily: "'DM Mono', monospace", fontSize: '13px', color: 'var(--warm)' }}>
          Naskah tidak ditemukan.{' '}
          <Link href="/arsip" style={{ color: 'var(--charcoal)', textDecoration: 'underline' }}>
            Kembali ke Arsip
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <CustomCursor />
      {/* NAV */}
      <nav className="global-nav">
        <Link
          href="/"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--charcoal)',
            textDecoration: 'none',
          }}
        >
          Arsip Lontar
        </Link>
        <ul>
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href)
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`nav-link ${isActive ? 'nav-active' : ''}`}
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* CONTENT */}
      <div style={{ padding: '8rem 4rem 6rem' }}>
        <Link
          href="/arsip"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--warm)',
            textDecoration: 'none',
            marginBottom: '2rem',
          }}
        >
          ← Arsip
        </Link>

        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--warm)',
            marginBottom: '0.5rem',
          }}
        >
          {entry.script} · {entry.period}
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 900,
            color: 'var(--charcoal)',
            marginBottom: '3rem',
            lineHeight: 1.1,
          }}
        >
          {entry.title}
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
          }}
        >
          {/* LEFT: original script + transliteration */}
          <div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--warm)',
                marginBottom: '0.625rem',
              }}
            >
              Aksara Asli
            </div>
            <div
              style={{
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--charcoal)',
                fontFamily: "'DM Mono', monospace",
                fontSize: '11px',
                color: 'rgba(240, 237, 230, 0.25)',
                marginBottom: '1.5rem',
              }}
            >
              [ foto naskah asli ]
            </div>

            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--warm)',
                marginBottom: '0.625rem',
              }}
            >
              Transliterasi
            </div>
            <div
              style={{
                whiteSpace: 'pre-line',
                background: 'rgba(17, 17, 16, 0.04)',
                padding: '1rem 1.25rem',
                fontFamily: "'DM Mono', monospace",
                fontSize: '14px',
                lineHeight: 2,
                color: 'var(--charcoal)',
              }}
            >
              {entry.transliteration}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginTop: '1.5rem',
              }}
            >
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warm)', marginBottom: '0.25rem' }}>
                  Asal
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--charcoal)' }}>{entry.provenance}</div>
              </div>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warm)', marginBottom: '0.25rem' }}>
                  Kondisi
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--charcoal)' }}>{entry.condition}</div>
              </div>
            </div>
          </div>

          {/* RIGHT: translation toggle */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm)' }}>
                Terjemahan
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {(['id', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    style={{
                      border: '1px solid var(--border)',
                      padding: '0.2rem 0.6rem',
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '9px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      background: lang === l ? 'var(--charcoal)' : 'transparent',
                      color: lang === l ? 'var(--bone)' : 'var(--warm)',
                      cursor: 'pointer',
                    }}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '17px',
                lineHeight: 1.8,
                color: 'var(--charcoal)',
                marginBottom: '2rem',
              }}
            >
              {lang === 'id' ? entry.translation_id : entry.translation_en}
            </div>

            {entry.relatedKoleksiSlug && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warm)', marginBottom: '0.5rem' }}>
                  Artefak Terkait
                </div>
                <Link
                  href={`/koleksi/${entry.relatedKoleksiSlug}`}
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '12px',
                    letterSpacing: '0.08em',
                    color: 'var(--charcoal)',
                    textDecoration: 'underline',
                  }}
                >
                  Lihat model 3D di Koleksi →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
