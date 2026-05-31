'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { getArtifactBySlug } from '@/data/koleksi'
import type { Artifact } from '@/data/koleksi'

const CustomCursor = dynamic(() => import('@/components/CustomCursor'), {
  ssr: false,
})
const ModelViewer = dynamic(() => import('@/components/ModelViewer'), {
  ssr: false,
})

export default function KoleksiDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [artifact, setArtifact] = useState<Artifact | null>(null)
  const [langId, setLangId] = useState(true) // true = Indonesia, false = English
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)

  useEffect(() => {
    const found = getArtifactBySlug(slug)
    if (found) setArtifact(found)
  }, [slug])

  // GSAP reveal for metadata panel
  useEffect(() => {
    if (!artifact) return

    const tl = gsap.timeline({ delay: 0.5 })
    tl.to('.detail-back', {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power3.out',
    })
      .to(
        '.detail-name',
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' },
        '-=0.4'
      )
      .to(
        '.detail-artist',
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.6'
      )
      .to(
        '.detail-desc',
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      )
      .to(
        '.detail-meta-item',
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' },
        '-=0.4'
      )
      .to(
        '.detail-hotspot-btn',
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' },
        '-=0.3'
      )
  }, [artifact])

  const handleHotspotClick = useCallback((id: string | null) => {
    setActiveHotspot(id)
  }, [])

  if (!artifact) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          background: 'var(--bone)',
        }}
      >
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '28px',
            fontWeight: 900,
            color: 'var(--charcoal)',
          }}
        >
          Artefak tidak ditemukan
        </p>
        <Link
          href="/koleksi"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--warm)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '14px' }}>←</span>
          Kembali ke Koleksi
        </Link>
      </div>
    )
  }

  const activeHs = artifact.hotspots.find((h) => h.id === activeHotspot)

  return (
    <>
      <CustomCursor />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: '100vh',
        }}
        className="detail-layout"
      >
        {/* ============================================ */}
        {/* LEFT — 3D Viewer                             */}
        {/* ============================================ */}
        <div
          style={{
            position: 'relative',
            height: '100vh',
            borderRight: '1px solid var(--border)',
            background:
              'linear-gradient(180deg, rgba(200,169,110,0.04) 0%, rgba(240,237,230,1) 100%)',
          }}
        >
          <ModelViewer
            slug={artifact.slug}
            type={artifact.type}
            hotspots={artifact.hotspots}
            activeHotspot={activeHotspot}
            onHotspotClick={handleHotspotClick}
          />

          {/* Watermark */}
          <div
            style={{
              position: 'absolute',
              bottom: '1.5rem',
              left: '1.5rem',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontSize: '8px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(17,17,16,0.25)',
                fontFamily: "'DM Mono', monospace",
              }}
            >
              3D Viewer — {artifact.slug}
            </span>
          </div>
        </div>

        {/* ============================================ */}
        {/* RIGHT — Metadata Panel                       */}
        {/* ============================================ */}
        <div
          style={{
            height: '100vh',
            overflowY: 'auto',
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
          }}
          className="detail-panel"
        >
          {/* Back link */}
          <Link
            href="/koleksi"
            className="detail-back"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontFamily: "'DM Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.2em',
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
            Kembali ke Koleksi
          </Link>

          {/* Artifact Name */}
          <h1
            className="detail-name"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 4vw, 56px)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--charcoal)',
              marginBottom: '1rem',
              opacity: 0,
              transform: 'translateY(25px)',
            }}
          >
            {artifact.name}
          </h1>

          {/* Artist + Year + Country */}
          <div
            className="detail-artist"
            style={{
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'baseline',
              marginBottom: '2.5rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid var(--border)',
              opacity: 0,
              transform: 'translateY(15px)',
            }}
          >
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.08em',
                color: 'var(--charcoal)',
              }}
            >
              {artifact.artist}
            </span>
            <span
              style={{
                fontSize: '9px',
                letterSpacing: '0.15em',
                color: 'var(--warm)',
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {artifact.year}
            </span>
            <span
              style={{
                fontSize: '9px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--warm)',
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {artifact.country}
            </span>
          </div>

          {/* Description with language toggle */}
          <div
            className="detail-desc"
            style={{
              marginBottom: '2.5rem',
              opacity: 0,
              transform: 'translateY(15px)',
            }}
          >
            {/* Language Toggle */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <button
                onClick={() => setLangId(true)}
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '9px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  padding: '0.4rem 0.8rem',
                  border: '1px solid var(--border)',
                  background: langId ? 'var(--charcoal)' : 'transparent',
                  color: langId ? 'var(--bone)' : 'var(--warm)',
                  cursor: 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                ID
              </button>
              <button
                onClick={() => setLangId(false)}
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '9px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  padding: '0.4rem 0.8rem',
                  border: '1px solid var(--border)',
                  background: !langId ? 'var(--charcoal)' : 'transparent',
                  color: !langId ? 'var(--bone)' : 'var(--warm)',
                  cursor: 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                EN
              </button>
            </div>

            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '12px',
                lineHeight: 2.2,
                color: 'var(--warm)',
                maxWidth: '450px',
              }}
            >
              {langId ? artifact.description_id : artifact.description_en}
            </p>
          </div>

          {/* Metadata List */}
          <div
            style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '2rem',
              marginBottom: '2.5rem',
            }}
          >
            {[
              { label: 'Lokasi', value: artifact.address },
              { label: 'Jenis', value: artifact.type },
              { label: 'Material', value: artifact.material },
              { label: 'Dimensi', value: artifact.dimensions },
            ].map((item) => (
              <div
                key={item.label}
                className="detail-meta-item"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--border)',
                  opacity: 0,
                  transform: 'translateY(10px)',
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '9px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--warm)',
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '11px',
                    color: 'var(--charcoal)',
                    textAlign: 'right',
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Hotspot Buttons */}
          <div style={{ marginBottom: '2rem' }}>
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '9px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--warm)',
                marginBottom: '1rem',
              }}
            >
              — Titik Anotasi
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {artifact.hotspots.map((hs) => (
                <button
                  key={hs.id}
                  className="detail-hotspot-btn"
                  onClick={() =>
                    setActiveHotspot(activeHotspot === hs.id ? null : hs.id)
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--border)',
                    background:
                      activeHotspot === hs.id ? 'var(--charcoal)' : 'transparent',
                    color:
                      activeHotspot === hs.id ? 'var(--bone)' : 'var(--charcoal)',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    cursor: 'none',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    opacity: 0,
                    transform: 'translateY(10px)',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background:
                        activeHotspot === hs.id ? '#C8A96E' : 'var(--warm)',
                      flexShrink: 0,
                    }}
                  />
                  {hs.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Hotspot Detail */}
          {activeHs && (
            <div
              style={{
                padding: '1.5rem',
                border: '1px solid var(--border)',
                background: 'rgba(200,169,110,0.04)',
                marginBottom: '2rem',
              }}
            >
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--charcoal)',
                  marginBottom: '0.75rem',
                }}
              >
                {activeHs.label}
              </p>
              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '11px',
                  lineHeight: 2,
                  color: 'var(--warm)',
                }}
              >
                {langId ? activeHs.description_id : activeHs.description_en}
              </p>
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Footer */}
          <div
            style={{
              paddingTop: '2rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '8px',
                letterSpacing: '0.1em',
                color: 'var(--warm)',
                fontFamily: "'DM Mono', monospace",
              }}
            >
              © 2025 Arsip Naskah Lontar
            </span>
            <Link
              href="/koleksi"
              style={{
                fontSize: '9px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--warm)',
                fontFamily: "'DM Mono', monospace",
                textDecoration: 'none',
              }}
            >
              Semua Koleksi ↗
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* Responsive CSS override for mobile           */}
      {/* ============================================ */}
      <style jsx>{`
        @media (max-width: 768px) {
          .detail-layout {
            grid-template-columns: 1fr !important;
          }
          .detail-layout > div:first-child {
            height: 50vh !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border);
          }
          .detail-panel {
            height: auto !important;
            min-height: 50vh;
          }
        }
      `}</style>
    </>
  )
}
