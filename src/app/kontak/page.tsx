'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false })

const institusiInfo: [string, string][] = [
  ['Institusi', 'Lab Digitalisasi Warisan Budaya'],
  ['Alamat', 'Bandung, Jawa Barat, Indonesia'],
  ['Email', 'kontak@arsiplontar.id'],
  ['Jam Operasional', 'Senin – Jumat\n09.00 – 16.00 WIB'],
  ['Kerja Sama', 'Terbuka untuk museum, lembaga riset, dan institusi pendidikan'],
]

export default function KontakPage() {
  const pathname = usePathname()
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  const navItems = [
    { label: 'Koleksi', href: '/koleksi' },
    { label: 'Arsip', href: '/arsip' },
    { label: 'Riset', href: '/riset' },
    { label: 'Kontak', href: '/kontak' },
  ]

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid rgba(17, 17, 16, 0.2)',
    background: 'transparent',
    padding: '0.375rem 0',
    fontFamily: "'DM Mono', monospace",
    fontSize: '14px',
    color: 'var(--charcoal)',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'DM Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--warm)',
    marginBottom: '0.375rem',
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
          Hubungi Kami
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
          Mari
          <br />
          <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Bicara</em>
        </h1>
      </section>

      {/* FORM + INFO */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '0',
          padding: '4rem 4rem 6rem',
        }}
      >
        {/* FORM */}
        <div style={{ paddingRight: '3rem' }}>
          {sent ? (
            <div
              style={{
                border: '1px solid var(--border)',
                padding: '2.5rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '22px',
                  color: 'var(--charcoal)',
                  marginBottom: '0.5rem',
                }}
              >
                Pesan terkirim
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '13px',
                  color: 'var(--warm)',
                }}
              >
                Kami akan merespons dalam 1–2 hari kerja.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={labelStyle}>Nama</label>
                <input type="text" required style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={labelStyle}>Email</label>
                <input type="email" required style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={labelStyle}>Pesan</label>
                <textarea
                  rows={4}
                  required
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: 'var(--charcoal)',
                  color: 'var(--bone)',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'opacity 0.3s ease',
                }}
              >
                Kirim Pesan
              </button>
            </form>
          )}
        </div>

        {/* INSTITUTION INFO */}
        <div
          style={{
            borderLeft: '1px solid var(--border)',
            paddingLeft: '3rem',
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '20px',
              lineHeight: 1.3,
              color: 'var(--charcoal)',
              marginBottom: '2rem',
            }}
          >
            Arsip Naskah Lontar
            <br />
            <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Digital Archive</em>
          </div>
          {institusiInfo.map(([label, value]) => (
            <div key={label} style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '9px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--warm)',
                  marginBottom: '0.25rem',
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: 'var(--charcoal)',
                  whiteSpace: 'pre-line',
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
