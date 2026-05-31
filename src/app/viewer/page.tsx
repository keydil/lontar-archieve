'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'

const LontarViewer = dynamic(() => import('@/components/LontarViewer'), { ssr: false })
const ArtifactScene = dynamic(() => import('@/components/ArtifactScene'), { ssr: false })
const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false })

export default function ViewerPage() {
  const [showViewer, setShowViewer] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)

  // Entrance animation
  useEffect(() => {
    gsap.fromTo('.viewer-kicker', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.3 })
    gsap.fromTo('.viewer-h1', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out', delay: 0.5 })
    gsap.fromTo('.viewer-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.8 })
    gsap.fromTo('.viewer-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 1.1 })
    gsap.fromTo('.viewer-meta', { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.3 })
  }, [])

  const handleOpenViewer = () => {
    // Animate hero out, show viewer
    if (heroRef.current) {
      gsap.to(heroRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => setShowViewer(true),
      })
    } else {
      setShowViewer(true)
    }
  }

  const handleCloseViewer = () => {
    setShowViewer(false)
    setTimeout(() => {
      gsap.fromTo(heroRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
    }, 50)
  }

  return (
    <div style={{ background: '#F0EDE6', minHeight: '100vh' }}>
      <CustomCursor />

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.25rem 3rem', borderBottom: showViewer ? '1px solid rgba(240,237,230,0.08)' : '1px solid rgba(17,17,16,0.1)',
        background: showViewer ? '#111110' : '#F0EDE6',
        transition: 'background 0.4s, border-color 0.4s',
      }}>
        <Link href="/" style={{
          fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '0.25em',
          textTransform: 'uppercase', color: showViewer ? '#F0EDE6' : '#111110', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          ← Arsip Lontar
        </Link>

        {showViewer ? (
          <button onClick={handleCloseViewer} style={{
            background: 'none', border: '1px solid rgba(240,237,230,0.2)', color: 'rgba(240,237,230,0.6)',
            cursor: 'pointer', padding: '6px 16px', fontSize: '8px', letterSpacing: '0.2em',
            textTransform: 'uppercase', fontFamily: "'DM Mono',monospace",
          }}>
            ← Kembali ke 3D View
          </button>
        ) : (
          <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8A85', fontFamily: "'DM Mono',monospace" }}>
            Carita Parahyangan — Abad ke-16
          </span>
        )}
      </nav>

      {/* HERO — 3D LONTAR */}
      {!showViewer && (
        <div ref={heroRef} style={{ paddingTop: '60px' }}>

          {/* Full-height 3D hero */}
          <div style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>

            {/* 3D Canvas — full background */}
            <div ref={canvasWrapRef} style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
              <ArtifactScene />
            </div>

            {/* Content overlay */}
            <div style={{ position: 'relative', zIndex: 2, padding: '0 6rem', maxWidth: '680px' }}>
              <p className="viewer-kicker" style={{
                opacity: 0, fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase',
                color: '#8C8A85', fontFamily: "'DM Mono',monospace", marginBottom: '1.75rem',
              }}>
                ARF — 001 / Koleksi Digital
              </p>
              <h1 className="viewer-h1" style={{
                opacity: 0, fontFamily: "'Playfair Display',serif",
                fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 900,
                lineHeight: 0.9, letterSpacing: '-0.03em', color: '#111110',
                marginBottom: '2rem',
              }}>
                Carita<br /><em style={{ fontStyle: 'italic', fontWeight: 400 }}>Parahyangan</em>
              </h1>
              <p className="viewer-sub" style={{
                opacity: 0, fontSize: '12px', lineHeight: 2, color: '#8C8A85',
                fontFamily: "'DM Mono',monospace", fontWeight: 300, maxWidth: '420px',
                marginBottom: '3rem',
              }}>
                Naskah Sunda kuno dari abad ke-16 yang mengisahkan asal-usul dan sejarah tanah Parahyangan. Ditulis dalam aksara Sunda Buhun di atas daun lontar.
              </p>

              <button
                className="viewer-cta"
                onClick={handleOpenViewer}
                style={{
                  opacity: 0, background: '#111110', border: 'none', color: '#F0EDE6',
                  cursor: 'pointer', padding: '1rem 2.5rem',
                  fontFamily: "'DM Mono',monospace", fontSize: '10px',
                  letterSpacing: '0.25em', textTransform: 'uppercase',
                  display: 'inline-flex', alignItems: 'center', gap: '1rem',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#2A2A28')}
                onMouseLeave={e => (e.currentTarget.style.background = '#111110')}
              >
                Buka Naskah
                <span style={{ display: 'inline-block', width: '30px', height: '1px', background: '#F0EDE6' }} />
              </button>
            </div>

            {/* Bottom meta */}
            <div className="viewer-meta" style={{
              opacity: 0, position: 'absolute', bottom: '2.5rem', left: '6rem', right: '6rem',
              zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            }}>
              <div style={{ display: 'flex', gap: '3rem' }}>
                {[
                  { label: 'Usia', value: 'Abad ke-16 M' },
                  { label: 'Aksara', value: 'Sunda Buhun' },
                  { label: 'Lembar', value: '3 tersedia' },
                ].map(item => (
                  <div key={item.label}>
                    <span style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8A85', fontFamily: "'DM Mono',monospace", display: 'block', marginBottom: '4px' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '8px', letterSpacing: '0.15em', color: '#8C8A85', fontFamily: "'DM Mono',monospace" }}>
                  Putar objek 3D — gerak mouse
                </p>
              </div>
            </div>

            {/* Scroll indicator */}
            <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '1px', height: '40px', background: '#111110', opacity: 0.2, animation: 'pulse 2s ease-in-out infinite' }} />
            </div>
          </div>
        </div>
      )}

      {/* SCAN VIEWER */}
      {showViewer && (
        <div style={{ paddingTop: '60px' }}>
          <LontarViewer />
        </div>
      )}
    </div>
  )
}