'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { artifacts } from '@/data/koleksi'

gsap.registerPlugin(ScrollTrigger)

const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false })
const CardPreview = dynamic(() => import('@/components/CardPreview'), { ssr: false })

export default function KoleksiPage() {
  const headerRef = useRef<HTMLDivElement>(null)

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
      duration: 0.9,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.koleksi-grid', start: 'top 80%' },
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <>
      <CustomCursor />

      {/* FIXED NAV — minimal */}
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
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* HEADER */}
      <section
        style={{
          padding: '10rem 4rem 4rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Link
          href="/"
          className="koleksi-nav-back"
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
          Kembali ke Beranda
        </Link>

        <div
          ref={headerRef}
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
                fontSize: '9px',
                letterSpacing: '0.3em',
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
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--warm)',
              fontFamily: "'DM Mono', monospace",
              opacity: 0,
              paddingBottom: '0.5rem',
            }}
          >
            {artifacts.length} Artefak Terindeks
          </span>
        </div>
      </section>

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
              transform: 'translateY(30px)',
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
              <CardPreview artifactType={artifact.type} />
            </div>

            {/* Card Info */}
            <div style={{ padding: '2rem 2rem 2.5rem' }}>
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
                    fontSize: '9px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--warm)',
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {artifact.type}
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
              </div>

              <h2
                className="koleksi-card-name"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '24px',
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
                    fontSize: '9px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--warm)',
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {artifact.material}
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    letterSpacing: '0.12em',
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
                  fontSize: '9px',
                  letterSpacing: '0.2em',
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
        style={{
          padding: '3rem 4rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '9px',
            letterSpacing: '0.1em',
            color: 'var(--warm)',
            fontFamily: "'DM Mono', monospace",
          }}
        >
          © 2025 Arsip Naskah Lontar — Digital Archive
        </span>
        <Link
          href="/"
          style={{
            fontSize: '9px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--warm)',
            fontFamily: "'DM Mono', monospace",
            textDecoration: 'none',
          }}
        >
          Beranda ↗
        </Link>
      </footer>
    </>
  )
}
