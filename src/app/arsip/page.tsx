'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useCMS } from '@/lib/cms'
import { NAV_ITEMS } from '@/lib/nav'

export default function ArsipPage() {
  const pathname = usePathname()
  const { data } = useCMS()
  const arsipEntries = data.arsip
  const navItems = NAV_ITEMS

  return (
    <>
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

      {/* HEADER */}
      <section
        style={{
          padding: '9rem 4rem 4rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--warm)',
            marginBottom: '1rem',
          }}
        >
          Digital Archive — Teks &amp; Transkripsi
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(52px, 8vw, 96px)',
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: '-0.03em',
            color: 'var(--charcoal)',
          }}
        >
          Arsip
          <br />
          <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Naskah</em>
        </h1>
      </section>

      {/* LIST */}
      <section style={{ padding: '0 4rem 6rem' }}>
        {arsipEntries.map((entry) => (
          <Link
            key={entry.slug}
            href={`/arsip/${entry.slug}`}
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              borderBottom: '1px solid var(--border)',
              padding: '2rem 0',
              transition: 'background 0.3s ease',
            }}
            className="arsip-row"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
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
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(20px, 3vw, 26px)',
                    color: 'var(--charcoal)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {entry.title}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: 'var(--warm)',
                    maxWidth: '560px',
                  }}
                >
                  {entry.excerpt}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--charcoal)',
                  marginLeft: '2rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Baca →
              </div>
            </div>
          </Link>
        ))}
      </section>
    </>
  )
}
