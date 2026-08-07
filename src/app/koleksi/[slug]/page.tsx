'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { getKoleksiBySlug } from '@/lib/cms'
import type { Artifact } from '@/data/koleksi'

const ModelViewer = dynamic(() => import('@/components/ModelViewer'), {
  ssr: false,
})

export default function KoleksiDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [artifact, setArtifact] = useState<Artifact | null>(null)
  const [langId, setLangId] = useState(true) // true = Indonesia, false = English
  // Foto dulu: indeks foto yang sedang dilihat. showModel=true baru
  // menampilkan model 3D (hanya untuk artefak yang punya .glb).
  const [activeMedia, setActiveMedia] = useState(0)
  const [showModel, setShowModel] = useState(false)

  useEffect(() => {
    let active = true
    getKoleksiBySlug(slug).then((found) => {
      if (active && found) setArtifact(found)
    })
    return () => { active = false }
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
  }, [artifact])

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
            fontSize: '30px',
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
            fontSize: '11px',
            letterSpacing: '0.18em',
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

  const media = artifact.media ?? []
  const has3D = Boolean(artifact.modelUrl)
  const current = media[activeMedia]
  // strip hanya berguna kalau ada lebih dari satu hal untuk dilihat
  const hasStrip = media.length + (has3D ? 1 : 0) > 1
  // artefak tanpa foto tapi punya 3D -> langsung tampilkan 3D
  const show3D = showModel || (has3D && media.length === 0)

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: '100vh',
        }}
        className="detail-layout"
      >
        {/* ============================================ */}
        {/* LEFT — Galeri Foto (3D bila modelnya ada)    */}
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
          {/* Model 3D hanya di-mount kalau artefak ini benar-benar punya
              file .glb. Sebagian besar koleksi baru berupa foto, jadi
              WebGL tidak dinyalakan percuma. */}
          {has3D && (
            <div style={{ position: 'absolute', inset: 0, visibility: show3D ? 'visible' : 'hidden' }}>
              <ModelViewer modelUrl={artifact.modelUrl!} rotation={artifact.modelRotation} />
            </div>
          )}

          {/* Foto / video terpilih */}
          {!show3D && current && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1A1918',
              }}
            >
              {current.type === 'video' ? (
                <video src={current.url} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.url}
                  alt={current.caption || artifact.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
              {current.caption && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: hasStrip ? '7.5rem' : '1.5rem',
                    left: 0,
                    right: 0,
                    padding: '0.75rem 1.5rem',
                    color: 'var(--bone)',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                  }}
                >
                  {current.caption}
                </div>
              )}
            </div>
          )}

          {/* Belum ada foto maupun 3D */}
          {!show3D && !current && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                color: 'var(--warm)',
                fontFamily: "'DM Mono', monospace",
              }}
            >
              <span style={{ fontSize: '30px', opacity: 0.5 }}>&#9707;</span>
              <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Dokumentasi belum tersedia
              </span>
            </div>
          )}

          {/* Strip thumbnail — muncul kalau ada lebih dari satu tampilan */}
          {hasStrip && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 6,
                display: 'flex',
                gap: '8px',
                padding: '1rem 1.5rem',
                overflowX: 'auto',
                background: 'linear-gradient(transparent, rgba(17,17,16,0.55))',
              }}
            >
              {media.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => { setShowModel(false); setActiveMedia(idx) }}
                  title={m.caption || 'Foto ' + (idx + 1)}
                  style={{
                    width: '64px',
                    height: '64px',
                    flexShrink: 0,
                    border: !show3D && activeMedia === idx ? '3px solid var(--bone)' : '1px solid rgba(240,237,230,0.4)',
                    background: '#1A1918',
                    color: 'var(--bone)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    padding: 0,
                  }}
                >
                  {m.type === 'video' && !m.thumbnail ? (
                    <span style={{ fontSize: '18px' }}>&#9654;</span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.thumbnail || m.url}
                      alt={m.caption || 'Foto ' + (idx + 1)}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </button>
              ))}

              {/* 3D ditaruh paling belakang — pelengkap, bukan yang utama */}
              {has3D && (
                <button
                  onClick={() => setShowModel(true)}
                  title="Lihat model 3D"
                  style={{
                    width: '64px',
                    height: '64px',
                    flexShrink: 0,
                    border: show3D ? '3px solid var(--bone)' : '1px solid rgba(240,237,230,0.4)',
                    background: '#1A1918',
                    color: 'var(--bone)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    padding: 0,
                  }}
                >
                  <span style={{ fontSize: '17px' }}>&#9707;</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '8px', letterSpacing: '0.1em' }}>3D</span>
                </button>
              )}
            </div>
          )}

          {/* Watermark */}
          <div
            style={{
              position: 'absolute',
              bottom: hasStrip ? '6rem' : '1.5rem',
              left: '1.5rem',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(17,17,16,0.35)',
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {show3D ? 'Model 3D' : media.length + ' foto'} &mdash; {artifact.slug}
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
                fontSize: '13px',
                letterSpacing: '0.06em',
                color: 'var(--charcoal)',
              }}
            >
              {artifact.artist}
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
            <span
              style={{
                fontSize: '11px',
                letterSpacing: '0.12em',
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
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  padding: '0.45rem 0.85rem',
                  border: '1px solid var(--border)',
                  background: langId ? 'var(--charcoal)' : 'transparent',
                  color: langId ? 'var(--bone)' : 'var(--warm)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                ID
              </button>
              <button
                onClick={() => setLangId(false)}
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  padding: '0.45rem 0.85rem',
                  border: '1px solid var(--border)',
                  background: !langId ? 'var(--charcoal)' : 'transparent',
                  color: !langId ? 'var(--bone)' : 'var(--warm)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                EN
              </button>
            </div>

            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '15px',
                lineHeight: 1.9,
                color: 'var(--warm)',
                maxWidth: '480px',
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
                    fontSize: '11px',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--warm)',
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '13px',
                    color: 'var(--charcoal)',
                    textAlign: 'right',
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

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
                fontSize: '10px',
                letterSpacing: '0.08em',
                color: 'var(--warm)',
                fontFamily: "'DM Mono', monospace",
              }}
            >
              © 2025 Arsip Naskah Lontar
            </span>
            <Link
              href="/koleksi"
              style={{
                fontSize: '11px',
                letterSpacing: '0.12em',
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
