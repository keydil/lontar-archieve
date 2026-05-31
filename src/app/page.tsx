'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import Link from 'next/link'
import useGSAPAnimations from '@/hooks/useGSAPAnimations'
import { useMusic } from '@/components/MusicPlayer'

// Dynamic imports to avoid SSR issues with Three.js
const HeroScene = dynamic(() => import('@/components/HeroScene'), { ssr: false })
const ArtifactScene = dynamic(() => import('@/components/ArtifactScene'), { ssr: false })
const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false })
const SplashScreen = dynamic(() => import('@/components/SplashScreen'), { ssr: false })

const manifestoText =
  'Setiap goresan aksara di atas daun lontar adalah warisan yang tak ternilai — jendela menuju peradaban Nusantara yang agung, menunggu untuk dibaca kembali oleh generasi yang akan datang.'

const collections = [
  {
    id: 'ARF — 001',
    title: 'Carita Parahyangan',
    sub: 'Aksara Sunda Kuno',
    date: 'Abad ke-16 M',
    maintenance: true,
  },
  {
    id: 'ARF — 002',
    title: 'Sanghyang Siksa Kandang Karesian',
    sub: 'Naskah Prosa',
    date: '1518 M',
  },
  {
    id: 'ARF — 003',
    title: 'Bujangga Manik',
    sub: 'Kidung Perjalanan',
    date: 'Abad ke-15/16 M',
  },
]

export default function Home() {
  const { hasSeenSplash, setHasSeenSplash } = useMusic()
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

  return (
    <>
      {!hasSeenSplash && <SplashScreen onEnter={() => setHasSeenSplash(true)} />}
      <CustomCursor />

      {/* NAV */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem 3rem',
          mixBlendMode: 'multiply',
        }}
      >
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
        <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
          {[
            { label: 'Koleksi', href: '/koleksi' },
            { label: 'Arsip', href: '#' },
            { label: 'Riset', href: '#' },
            { label: 'Kontak', href: '#' },
          ].map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="nav-link"
                style={{ opacity: 0, fontFamily: "'DM Mono', monospace" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
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
        <HeroScene />

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
              fontSize: '9px',
              letterSpacing: '0.3em',
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
              fontSize: '8px',
              letterSpacing: '0.25em',
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
                fontSize: '9px',
                letterSpacing: '0.2em',
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
              fontSize: '9px',
              letterSpacing: '0.3em',
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
            Koleksi
          </h2>
          <span
            className="col-meta"
            style={{
              fontSize: '9px',
              letterSpacing: '0.2em',
              color: 'var(--warm)',
              opacity: 0,
              fontFamily: "'DM Mono', monospace",
              textTransform: 'uppercase',
            }}
          >
            247 Naskah Terindeks
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
          {collections.map((item, idx) => (
            <div
              key={item.id}
              className={`grid-item ${item.maintenance ? 'maintenance-card' : ''}`}
              style={{
                padding: '2.5rem 2rem',
                borderRight: idx < collections.length - 1 ? '1px solid var(--border)' : 'none',
                opacity: 0,
                transform: 'translateY(30px)',
              }}
            >
              <p
                className="gi-text"
                style={{
                  fontSize: '9px',
                  letterSpacing: '0.2em',
                  color: 'var(--warm)',
                  marginBottom: '3rem',
                  fontFamily: "'DM Mono', monospace",
                  transition: 'color 0.3s',
                }}
              >
                {item.id}
              </p>
              <h3
                className="gi-text"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '26px',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.01em',
                  transition: 'color 0.3s',
                }}
              >
                {item.title}
              </h3>
              <p
                className="gi-text"
                style={{
                  fontSize: '9px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--warm)',
                  marginBottom: '0.5rem',
                  fontFamily: "'DM Mono', monospace",
                  transition: 'color 0.3s',
                }}
              >
                {item.sub}
              </p>
              <p
                className="gi-text"
                style={{
                  fontSize: '11px',
                  color: 'var(--warm)',
                  marginTop: '2rem',
                  fontFamily: "'DM Mono', monospace",
                  transition: 'color 0.3s',
                }}
              >
                {item.date}
              </p>
              {item.maintenance ? (
                <span
                  className="gi-link"
                  style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '9px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontFamily: "'DM Mono', monospace",
                    color: 'rgba(140, 138, 133, 0.5)',
                    cursor: 'not-allowed',
                  }}
                >
                  <span className="cta-line" style={{ width: '20px', background: 'rgba(140, 138, 133, 0.5)' }} />
                  Sedang Perawatan
                </span>
              ) : (
                <Link
                  href={idx === 0 ? '/viewer' : '/baca'}
                  className="gi-link"
                  style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '9px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontFamily: "'DM Mono', monospace",
                    color: 'var(--warm)',
                    textDecoration: 'none',
                  }}
                >
                  <span className="cta-line" style={{ width: '20px', background: 'var(--warm)' }} />
                  {idx === 0 ? 'Buka Viewer 3D' : 'Baca Naskah'}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ARTIFACT */}
      <section
        id="artifact"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: '100vh',
          padding: 0,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            padding: '8rem 4rem',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <p
            className="artifact-label"
            style={{
              fontSize: '9px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--warm)',
              marginBottom: '2rem',
              opacity: 0,
              transform: 'translateY(20px)',
              fontFamily: "'DM Mono', monospace",
            }}
          >
            — Artefak Digital / 3D Preview
          </p>
          <h2
            className="artifact-h2"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '2rem',
              opacity: 0,
              transform: 'translateY(30px)',
            }}
          >
            Sentuh
            <br />
            <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Masa Lalu</em>
            <br />
            Secara Digital
          </h2>
          <p
            className="artifact-body"
            style={{
              fontSize: '12px',
              lineHeight: 2.2,
              color: 'var(--warm)',
              maxWidth: '400px',
              opacity: 0,
              transform: 'translateY(20px)',
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Render 3D interaktif daun lontar asli akan hadir di sini — dimodelkan
            langsung dari artefak fisik. Setiap lekukan dan guratan aksara
            direproduksi secara akurat untuk pengalaman arsip yang otentik.
          </p>
        </div>

        <div style={{ position: 'relative', minHeight: '100vh' }}>
          <ArtifactScene />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'flex-end',
              padding: '3rem',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontSize: '9px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(17,17,16,0.35)',
                fontFamily: "'DM Mono', monospace",
              }}
            >
              Lontar Sunda Buhun — Wireframe Preview
            </span>
          </div>
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
            {['Koleksi Digital', 'Program Riset', 'Kontribusi', 'Kontak'].map((item) => (
              <a key={item} href="#" className="footer-link">
                {item}
                <span>↗</span>
              </a>
            ))}
            <div style={{ borderTop: '1px solid var(--border)' }} />
          </nav>
          <p
            style={{
              fontSize: '9px',
              letterSpacing: '0.1em',
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