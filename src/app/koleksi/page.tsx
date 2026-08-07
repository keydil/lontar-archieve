'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCMS } from '@/lib/cms'
import { NAV_ITEMS } from '@/lib/nav'

gsap.registerPlugin(ScrollTrigger)

import ArtifactThumb from '@/components/ArtifactThumb'

export default function KoleksiPage() {
  const headerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { data } = useCMS()
  const allArtifacts = data.koleksi

  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  // Kategori dirakit dari data (bukan daftar hardcoded) biar otomatis
  // ngikut kalau pengelola nambah kategori baru lewat panel admin.
  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const a of allArtifacts) {
      if (a.category) counts.set(a.category, (counts.get(a.category) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], 'id'))
  }, [allArtifacts])

  const artifacts = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allArtifacts.filter((a) => {
      if (activeCategory && a.category !== activeCategory) return false
      if (!q) return true
      return [a.name, a.type, a.material, a.year, a.description_id]
        .some((field) => field?.toLowerCase().includes(q))
    })
  }, [allArtifacts, activeCategory, query])

  useEffect(() => {
    // Header reveal
    const tl = gsap.timeline({ delay: 0.3 })
    tl.to('.koleksi-kicker', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
    })
      .to(
        '.koleksi-title',
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' },
        '-=0.6'
      )
      .to(
        '.koleksi-meta',
        { opacity: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.4'
      )
      .to(
        '.koleksi-nav-back',
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.6'
      )

    // Cards reveal
    gsap.to('.koleksi-card', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1,
      stagger: 0.18,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.koleksi-grid', start: 'top 80%' },
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Kartu punya opacity 0 bawaan (buat reveal saat scroll). Hasil filter bisa
  // berubah TANPA user nge-scroll lagi, jadi kartu baru harus dimunculkan
  // langsung — kalau nunggu ScrollTrigger, kartunya bisa nyangkut invisible.
  // Dilewati saat render pertama supaya animasi intro tetap jalan.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    gsap.set('.koleksi-card', { opacity: 1, y: 0, scale: 1 })
  }, [activeCategory, query, artifacts.length])

  return (
    <>
      {/* FIXED NAV — minimal */}
      <nav className="global-nav">
        {/* Logo museum asli (bukan wordmark "Arsip Lontar") + link balik ke
            situs utama — bagian ini cuma satu section interaktif dari
            museumtalagamanggung.com, bukan "rumah" terpisah. Pakai <a>
            biasa (bukan next/link) karena ini navigasi keluar domain. */}
        <a href="https://museumtalagamanggung.com" style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-museum.png" alt="Museum Talaga Manggung" style={{ height: '48px', width: 'auto' }} />
        </a>
        <ul>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href)

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
        className="koleksi-section koleksi-header"
        style={{
          padding: '10rem 4rem 4rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <a
          href="https://museumtalagamanggung.com"
          className="koleksi-nav-back"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontFamily: "'DM Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--warm)',
            textDecoration: 'none',
            marginBottom: '3rem',
            opacity: 0,
            transform: 'translateX(-20px)',
            transition: 'color 0.3s ease',
          }}
        >
          <span style={{ fontSize: '14px', lineHeight: 1 }}>←</span>
          Kembali ke Beranda
        </a>

        <div
          ref={headerRef}
          className="koleksi-header-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <p
              className="koleksi-kicker"
              style={{
                fontSize: '11px',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--warm)',
                marginBottom: '1.5rem',
                fontFamily: "'DM Mono', monospace",
                opacity: 0,
                transform: 'translateY(20px)',
              }}
            >
              — Koleksi Digital / Arsip 3D
            </p>
            <h1
              className="koleksi-title"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(48px, 8vw, 100px)',
                fontWeight: 900,
                lineHeight: 0.9,
                letterSpacing: '-0.03em',
                color: 'var(--charcoal)',
                opacity: 0,
                transform: 'translateY(30px)',
              }}
            >
              Koleksi
              <br />
              <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Artefak</em>
            </h1>
          </div>
          <span
            className="koleksi-meta"
            style={{
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--warm)',
              fontFamily: "'DM Mono', monospace",
              opacity: 0,
              paddingBottom: '0.5rem',
            }}
          >
            {artifacts.length === allArtifacts.length
              ? `${allArtifacts.length} Artefak Terindeks`
              : `${artifacts.length} dari ${allArtifacts.length} Artefak`}
          </span>
        </div>
      </section>

      {/* FILTER & PENCARIAN */}
      <section
        className="koleksi-section"
        style={{
          padding: '2rem 4rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama artefak, bahan, jenis…"
          aria-label="Cari artefak"
          style={{
            width: '100%',
            maxWidth: '420px',
            padding: '0.85rem 1.1rem',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            background: 'transparent',
            color: 'var(--charcoal)',
            fontFamily: "'DM Mono', monospace",
            fontSize: '13px',
          }}
        />

        <div className="koleksi-filter-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[{ label: `Semua (${allArtifacts.length})`, value: null }, ...categories.map(([cat, n]) => ({ label: `${cat} (${n})`, value: cat }))].map(
            ({ label, value }) => {
              const isActive = activeCategory === value
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveCategory(value)}
                  aria-pressed={isActive}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    border: '1px solid var(--border)',
                    background: isActive ? 'var(--charcoal)' : 'transparent',
                    color: isActive ? 'var(--bone)' : 'var(--warm)',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  {label}
                </button>
              )
            },
          )}
        </div>
      </section>

      {artifacts.length === 0 && (
        <section
          className="koleksi-section"
          style={{
            padding: '5rem 4rem',
            textAlign: 'center',
            fontFamily: "'DM Mono', monospace",
            fontSize: '13px',
            color: 'var(--warm)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          Tidak ada artefak yang cocok dengan pencarian ini.
        </section>
      )}

      {/* COLLECTION GRID */}
      <section
        className="koleksi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          border: '1px solid var(--border)',
          borderTop: 'none',
        }}
      >
        {artifacts.map((artifact, idx) => (
          <Link
            key={artifact.slug}
            href={`/koleksi/${artifact.slug}`}
            className="koleksi-card"
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              borderRight:
                idx < artifacts.length - 1 ? '1px solid var(--border)' : 'none',
              borderBottom: '1px solid var(--border)',
              opacity: 0,
              transform: 'translateY(30px) scale(0.96)',
              transition: 'background 0.5s cubic-bezier(0.76, 0, 0.24, 1)',
            }}
          >
            {/* 3D Preview */}
            <div
              style={{
                height: '260px',
                borderBottom: '1px solid var(--border)',
                position: 'relative',
                overflow: 'hidden',
                background:
                  'linear-gradient(135deg, rgba(200,169,110,0.05), rgba(200,169,110,0.02))',
              }}
            >
              <div className="koleksi-thumb-zoom" style={{ width: '100%', height: '100%' }}>
                <ArtifactThumb src={artifact.thumbnail} alt={artifact.name} />
              </div>
              {artifact.modelUrl && (
                <span
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 2,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.7rem',
                    borderRadius: '999px',
                    background: 'var(--charcoal)',
                    color: 'var(--bone)',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  ◇ 3D
                </span>
              )}
            </div>

            {/* Card Info */}
            <div className="koleksi-card-body" style={{ padding: '2rem 2rem 2.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '1.5rem',
                }}
              >
                <span
                  className="koleksi-card-type"
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--warm)',
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {artifact.type}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    color: 'var(--warm)',
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {artifact.year}
                </span>
              </div>

              <h2
                className="koleksi-card-name"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '26px',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                  marginBottom: '0.75rem',
                  color: 'var(--charcoal)',
                }}
              >
                {artifact.name}
              </h2>

              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--warm)',
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {artifact.material}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    color: 'var(--warm)',
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {artifact.dimensions}
                </span>
              </div>

              <div
                className="koleksi-card-cta"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontFamily: "'DM Mono', monospace",
                  color: 'var(--warm)',
                }}
              >
                <span
                  className="cta-line"
                  style={{ width: '20px', background: 'var(--warm)' }}
                />
                Lihat Detail
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* FOOTER — minimal */}
      <footer
        className="koleksi-footer"
        style={{
          padding: '3rem 4rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: 'var(--warm)',
            fontFamily: "'DM Mono', monospace",
          }}
        >
          © 2025 Arsip Naskah Lontar — Digital Archive
        </span>
        <a
          href="https://museumtalagamanggung.com"
          style={{
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--warm)',
            fontFamily: "'DM Mono', monospace",
            textDecoration: 'none',
          }}
        >
          Beranda ↗
        </a>
      </footer>
    </>
  )
}
