'use client'

import { Team } from '@/data/riset'

interface TeamModalProps {
  team: Team | null
  onClose: () => void
}

export default function TeamModal({ team, onClose }: TeamModalProps) {
  if (!team) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(17, 17, 16, 0.55)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '90%',
          maxWidth: '440px',
          background: 'var(--bone)',
          border: '1px solid var(--border)',
          padding: '2.5rem',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--warm)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ✕ Tutup
        </button>

        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--warm)',
            marginBottom: '0.5rem',
          }}
        >
          Tim
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '26px',
            color: 'var(--charcoal)',
            marginBottom: '0.75rem',
          }}
        >
          {team.nama}
        </div>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--warm)',
            marginBottom: '1.5rem',
          }}
        >
          {team.deskripsi}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--warm)',
              marginBottom: '0.875rem',
            }}
          >
            Anggota
          </div>
          {team.anggota.map((a) => (
            <div
              key={a.nama}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border)',
                padding: '0.625rem 0',
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '16px',
                  color: 'var(--charcoal)',
                }}
              >
                {a.nama}
              </span>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '11px',
                  color: 'var(--warm)',
                }}
              >
                {a.peran}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
