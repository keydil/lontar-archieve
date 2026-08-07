'use client'

// ============================================================
// ARTIFACT THUMB — gambar kartu untuk daftar koleksi.
//
// Utamakan foto asli (JPG/PNG) karena jauh lebih informatif dan ringan
// daripada me-render WebGL di setiap kartu. Placeholder bergaya arsip
// hanya dipakai kalau artefak belum punya foto.
// ============================================================

export default function ArtifactThumb({
  src,
  alt,
  dark = false,
}: {
  src?: string
  alt: string
  dark?: boolean
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    )
  }

  const fg = dark ? 'rgba(240,237,230,0.4)' : 'var(--warm)'
  const grid = dark ? 'rgba(240,237,230,0.04)' : 'rgba(17,17,16,0.05)'

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${grid} 1px, transparent 1px), linear-gradient(90deg, ${grid} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '28px', marginBottom: '0.5rem', opacity: 0.6, color: fg }}>
          ⬡
        </div>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: fg,
          }}
        >
          Belum ada foto
        </div>
      </div>
    </div>
  )
}
