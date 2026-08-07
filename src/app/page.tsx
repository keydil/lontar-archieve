'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useGSAPAnimations from '@/hooks/useGSAPAnimations'
import { useMusic } from '@/components/MusicPlayer'
import { useCMS } from '@/lib/cms'
import { NAV_ITEMS } from '@/lib/nav'
import ArtifactThumb from '@/components/ArtifactThumb'

// Dynamic imports to avoid SSR issues with Three.js
const HeroScene = dynamic(() => import('@/components/HeroScene'), { ssr: false })
const SplashScreen = dynamic(() => import('@/components/SplashScreen'), { ssr: false })

// Splash screen dimatikan sementara (terasa berat) — set true untuk mengaktifkan lagi.
const SPLASH_ENABLED = false

const manifestoText =
  'Setiap goresan aksara di atas daun lontar adalah warisan yang tak ternilai — jendela menuju peradaban Nusantara yang agung, menunggu untuk dibaca kembali oleh generasi yang akan datang.'


export default function Home() {
  const { hasSeenSplash: hasSeenSplashRaw, setHasSeenSplash } = useMusic()
  const hasSeenSplash = SPLASH_ENABLED ? hasSeenSplashRaw : true
  const [shouldLoadHeavy, setShouldLoadHeavy] = useState(false)
  const pathname = usePathname()
  const { data } = useCMS()
  const artifacts = data.koleksi
  useGSAPAnimations()

  // Lock scroll when splash is visible
  useEffect(() => {
    if (!hasSeenSplash) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [hasSeenSplash])

  // Defer heavy 3D components to improve TBT and PageSpeed score
  useEffect(() => {
    if (hasSeenSplash) {
      setShouldLoadHeavy(true)
      return
    }
    const timer = setTimeout(() => {
      setShouldLoadHeavy(true)
    }, 3500) // Delay WebGL init by 3.5s to let splash animations run smoothly
    return () => clearTimeout(timer)
  }, [hasSeenSplash])

  return (
    <>
      {SPLASH_ENABLED && !hasSeenSplash && <SplashScreen onEnter={() => setHasSeenSplash(true)} />}

      {/* NAV */}
      <nav className="global-nav">
        <div
          className="nav-logo"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--charcoal)',
            opacity: 0,
          }}
        >
          Arsip Lontar
        </div>
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
                  style={{ opacity: 0, fontFamily: "'DM Mono', monospace" }}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* HERO */}
      <section
        id="hero"
        style={{
          position: 'relative',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {shouldLoadHeavy && <HeroScene />}

        <div
          className="hero-content"
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <p
            className="hero-kicker"
            style={{
              fontSize: '11px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--warm)',
              marginBottom: '2rem',
              opacity: 0,
              transform: 'translateY(20px)',
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Digital Archive — Naskah Daun Lontar
          </p>
          <h1
            className="hero-h1"
            style={{ opacity: 0, transform: 'translateY(40px)' }}
          >
            Warisan
            <br />
            <em>Abadi</em>
          </h1>
        </div>

        <div
          className="hero-scroll"
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            opacity: 0,
          }}
        >
          <div className="scroll-line" />
          <span
            style={{
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--warm)',
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Gulir ke bawah
          </span>
        </div>
      </section>

      {/* TICKER */}
      <div
        style={{
          overflow: 'hidden',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          background: 'var(--charcoal)',
          padding: '0.8rem 0',
        }}
      >
        <div className="ticker-track">
          {[
            'Naskah Sunda Kuno', '—', 'Aksara Kaganga', '—',
            'Daun Lontar', '—', 'Babad & Carita', '—',
            'Pantun Sunda', '—', 'Warisan Budaya', '—',
            'Naskah Sunda Kuno', '—', 'Aksara Kaganga', '—',
            'Daun Lontar', '—', 'Babad & Carita', '—',
            'Pantun Sunda', '—', 'Warisan Budaya', '—',
          ].map((item, i) => (
            <span
              key={i}
              style={{
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--bone)',
                opacity: 0.6,
                flexShrink: 0,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* MANIFESTO */}
      <section
        id="manifesto"
        style={{
          minHeight: '100vh',
          padding: '8rem 4rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ maxWidth: '900px', textAlign: 'center' }}>
          <span
            className="manifesto-num"
            style={{
              fontSize: '11px',
              letterSpacing: '0.25em',
              color: 'var(--warm)',
              marginBottom: '3rem',
              display: 'block',
              opacity: 0,
              transform: 'translateY(20px)',
              fontFamily: "'DM Mono', monospace",
            }}
          >
            — 001 / Manifesto
          </span>
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 4vw, 52px)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: 'var(--charcoal)',
            }}
          >
            {manifestoText.split(' ').map((word, i) => (
              <span
                key={i}
                className="manifesto-word"
                style={{
                  display: 'inline-block',
                  marginRight: '0.25em',
                  opacity: 0,
                  transform: 'translateY(30px)',
                  fontStyle: ['warisan', 'Nusantara', 'agung'].includes(word.replace(/[^a-zA-Z]/g, ''))
                    ? 'italic'
                    : 'normal',
                  fontWeight: ['warisan', 'tak', 'ternilai'].includes(word.replace(/[^a-zA-Z]/g, ''))
                    ? 400
                    : 900,
                }}
              >
                {word}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* COLLECTION */}
      <section
        id="collection"
        style={{
          padding: '8rem 4rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '4rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '1.5rem',
          }}
        >
          <h2
            className="col-title"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              opacity: 0,
              transform: 'translateX(-40px)',
            }}
          >
            Arsip
          </h2>
          <span
            className="col-meta"
            style={{
              fontSize: '11px',
              letterSpacing: '0.18em',
              color: 'var(--warm)',
              opacity: 0,
              fontFamily: "'DM Mono', monospace",
              textTransform: 'uppercase',
            }}
          >
            {data.naskah.filter(n => n.published !== false).length} Naskah Terindeks
          </span>
        </div>

        <div
          className="grid-items"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            border: '1px solid var(--border)',
          }}
        >
          {data.naskah.filter(n => n.published !== false).slice(0, 3).map((item, idx) => (
            <div
              key={item.id}
              className="grid-item"
              style={{
                borderRight: idx < 2 ? '1px solid var(--border)' : 'none',
                opacity: 0,
                transform: 'translateY(30px) scale(0.96)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* IMAGE AREA — atas card */}
              <div
                style={{
                  height: '200px',
                  borderBottom: '1px solid var(--border)',
                  background: 'linear-gradient(135deg, rgba(200,169,110,0.08), rgba(200,169,110,0.03))',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <img
                  src={item.coverImage || '/images/carita-parahyangan.jpg'}
                  alt={item.title}
                  className="gi-thumb-zoom"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.85,
                  }}
                  onError={(e) => {
                    // Fallback: show placeholder if image not found
                    const el = e.currentTarget as HTMLImageElement
                    el.style.display = 'none'
                    if (el.parentElement) {
                      el.parentElement.style.background =
                        'repeating-linear-gradient(45deg, rgba(200,169,110,0.06) 0px, rgba(200,169,110,0.06) 1px, transparent 1px, transparent 12px)'
                    }
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--warm)',
                    background: 'rgba(240,237,230,0.85)',
                    padding: '0.25rem 0.55rem',
                  }}
                >
                  {item.id.slice(0, 8)}
                </span>
              </div>

              {/* INFO AREA — bawah card */}
              <div style={{ padding: '2rem 2rem 2.5rem' }}>
                <h3
                  className="gi-text"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '24px',
                    fontWeight: 900,
                    lineHeight: 1.15,
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.01em',
                    transition: 'color 0.3s',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  className="gi-text"
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--warm)',
                    marginBottom: '0.5rem',
                    fontFamily: "'DM Mono', monospace",
                    transition: 'color 0.3s',
                  }}
                >
                  {item.aksaraType || 'Naskah Kuno'}
                </p>
                <p
                  className="gi-text"
                  style={{
                    fontSize: '13px',
                    color: 'var(--warm)',
                    marginTop: '1rem',
                    fontFamily: "'DM Mono', monospace",
                    transition: 'color 0.3s',
                  }}
                >
                  {item.tahun}
                </p>
                  <Link
                    href={`/arsip/${item.id}`}
                    className="gi-link"
                    style={{
                      marginTop: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '11px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      fontFamily: "'DM Mono', monospace",
                      color: 'var(--warm)',
                      textDecoration: 'none',
                    }}
                  >
                    <span className="cta-line" style={{ width: '20px' }} />
                    Baca Naskah
                  </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* KOLEKSI — 3D Artifacts */}
      <section
        id="koleksi-3d"
        style={{
          padding: '8rem 4rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '4rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '1.5rem',
          }}
        >
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
            }}
          >
            Koleksi
          </h2>
          <Link
            href="/koleksi"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--warm)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Lihat Semua →
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            border: '1px solid var(--border)',
          }}
        >
          {artifacts.map((artifact, idx) => (
            <Link
              key={artifact.slug}
              href={`/koleksi/${artifact.slug}`}
              className="koleksi-card"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                borderRight: idx < artifacts.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                opacity: 0,
                transform: 'translateY(30px) scale(0.96)',
              }}
            >
              {/* 3D Preview area */}
              <div
                style={{
                  height: '240px',
                  background: 'var(--charcoal)',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div className="koleksi-thumb-zoom" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArtifactThumb src={artifact.thumbnail} alt={artifact.name} dark />
                </div>
                <span
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(240,237,230,0.5)',
                    background: 'rgba(240,237,230,0.05)',
                    padding: '0.25rem 0.55rem',
                    border: '1px solid rgba(240,237,230,0.1)',
                    zIndex: 1,
                  }}
                >
                  {artifact.type}
                </span>
              </div>

              {/* Info area */}
              <div style={{ padding: '1.75rem 2rem 2rem' }}>
                <div
                  className="koleksi-card-type"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--warm)',
                    marginBottom: '0.5rem',
                    transition: 'color 0.3s',
                  }}
                >
                  {artifact.year} · {artifact.material}
                </div>
                <h3
                  className="koleksi-card-name"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '24px',
                    fontWeight: 900,
                    lineHeight: 1.15,
                    letterSpacing: '-0.01em',
                    color: 'var(--charcoal)',
                    marginBottom: '1rem',
                    transition: 'color 0.3s',
                  }}
                >
                  {artifact.name}
                </h3>
                <div
                  className="koleksi-card-cta"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--charcoal)',
                  }}
                >
                  <span className="cta-line" style={{ width: '16px', display: 'inline-block' }} />
                  Lihat Detail
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: '6rem 4rem 3rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="footer-brand"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(60px, 10vw, 120px)',
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: '-0.03em',
            opacity: 0,
            transform: 'translateY(30px)',
          }}
        >
          Arsip
          <br />
          <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Lontar</em>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <nav style={{ marginBottom: '3rem' }}>
            {[
              { label: 'Koleksi Digital', href: '/koleksi' },
              { label: 'Arsip Naskah', href: '/arsip' },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="footer-link">
                {item.label}
                <span>↗</span>
              </Link>
            ))}
            <div style={{ borderTop: '1px solid var(--border)' }} />
          </nav>
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              color: 'var(--warm)',
              fontFamily: "'DM Mono', monospace",
            }}
          >
            © 2025 Arsip Naskah Lontar — Prototype v0.2
          </p>
        </div>
      </footer>
    </>
  )
}