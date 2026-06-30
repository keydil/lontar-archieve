'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import TeamModal from '@/components/TeamModal'
import { teams, publikasi, getTeamByName } from '@/data/riset'

const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false })

export default function RisetPage() {
  const pathname = usePathname()
  const [activeTeam, setActiveTeam] = useState<string | null>(null)
  const teamData = activeTeam ? getTeamByName(activeTeam) ?? null : null

  const navItems = [
    { label: 'Koleksi', href: '/koleksi' },
    { label: 'Arsip', href: '/arsip' },
    { label: 'Riset', href: '/riset' },
    { label: 'Kontak', href: '/kontak' },
  ]

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

      {/* HEADER */}
      <section style={{ padding: '9rem 4rem 4rem', borderBottom: '1px solid var(--border)' }}>
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
          Metodologi &amp; Publikasi
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
          Catatan
          <br />
          <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Riset</em>
        </h1>
      </section>

      {/* TENTANG PROYEK + TIM */}
      <section style={{ padding: '4rem 4rem 3rem', borderBottom: '1px solid var(--border)' }}>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--warm)',
            marginBottom: '1rem',
          }}
        >
          Tentang Proyek
        </div>
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(17px, 2.5vw, 21px)',
            lineHeight: 1.7,
            color: 'var(--charcoal)',
            maxWidth: '660px',
            marginBottom: '2.5rem',
          }}
        >
          Proyek ini mendigitalkan naskah dan artefak Nusantara melalui fotogrametri non-invasif,
          menghasilkan model tiga dimensi yang dapat diakses tanpa membahayakan kondisi fisik
          benda yang rapuh.
        </p>

        {/* Team buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {teams.map((t) => (
            <button
              key={t.nama}
              onClick={() => setActiveTeam(t.nama)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                padding: '0.75rem 1.25rem 0.75rem 0',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'border-color 0.3s ease',
              }}
              className="team-btn"
            >
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', color: 'var(--charcoal)' }}>
                {t.nama}
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--warm)', marginTop: '0.2rem' }}>
                {t.anggota.length} anggota · lihat detail ↗
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* PUBLIKASI */}
      <section style={{ padding: '4rem 4rem 6rem' }}>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--warm)',
            marginBottom: '2rem',
          }}
        >
          Publikasi
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {publikasi.map((r) => (
            <div
              key={r.slug}
              style={{
                border: '1px solid var(--border)',
                padding: '1.75rem',
                transition: 'border-color 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--warm)' }}>
                  {r.date}
                </span>
                <span
                  style={{
                    background: 'rgba(17, 17, 16, 0.06)',
                    padding: '0.15rem 0.5rem',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '9px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--warm)',
                  }}
                >
                  {r.category}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '19px',
                  lineHeight: 1.3,
                  color: 'var(--charcoal)',
                  marginBottom: '0.75rem',
                }}
              >
                {r.title}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: 'var(--warm)',
                  marginBottom: '1.25rem',
                }}
              >
                {r.summary}
              </div>
              <Link
                href={`/riset/${r.slug}`}
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--charcoal)',
                  textDecoration: 'underline',
                }}
              >
                Baca selengkapnya →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <TeamModal team={teamData} onClose={() => setActiveTeam(null)} />
    </>
  )
}
