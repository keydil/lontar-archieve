import Link from 'next/link'
import { getPublikasiBySlug } from '@/data/riset'

export default function ArtikelDetailPage({ params }: { params: { slug: string } }) {
  const artikel = getPublikasiBySlug(params.slug)

  if (!artikel) {
    return (
      <div style={{ padding: '10rem 4rem 4rem', fontFamily: "'DM Mono', monospace", fontSize: '13px', color: 'var(--warm)' }}>
        Artikel tidak ditemukan.{' '}
        <Link href="/riset" style={{ color: 'var(--charcoal)', textDecoration: 'underline' }}>
          Kembali ke Riset
        </Link>
      </div>
    )
  }

  const paragraphs = artikel.content.split('\n\n')

  return (
    <div style={{ padding: '8rem 4rem 6rem' }}>
      <Link
        href="/riset"
        style={{
          display: 'inline-block',
          fontFamily: "'DM Mono', monospace",
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--warm)',
          textDecoration: 'none',
          marginBottom: '2rem',
        }}
      >
        ← Riset
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--warm)' }}>
          {artikel.date}
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
          {artikel.category}
        </span>
      </div>

      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 900,
          lineHeight: 1.1,
          color: 'var(--charcoal)',
          marginBottom: '0.5rem',
        }}
      >
        {artikel.title}
      </h1>
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '11px',
          color: 'var(--warm)',
          marginBottom: '3rem',
        }}
      >
        Oleh {artikel.author}
      </div>

      <div
        style={{
          maxWidth: '680px',
          borderTop: '1px solid var(--border)',
          paddingTop: '2rem',
        }}
      >
        {paragraphs.map((para, i) => (
          <p
            key={i}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px',
              lineHeight: 1.78,
              color: 'var(--charcoal)',
              marginBottom: '1.5rem',
            }}
          >
            {para}
          </p>
        ))}
      </div>
    </div>
  )
}
