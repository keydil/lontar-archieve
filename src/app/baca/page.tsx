'use client'

import { useState } from 'react'
import LontarReader from '@/components/LontarReader'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useCMS } from '@/lib/cms'

export default function BacaPage() {
  const { data, hydrated } = useCMS()
  // hanya naskah yang published (atau semua bila field tidak ada)
  const naskahList = data.naskah.filter((n) => n.published !== false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const active =
    naskahList.find((n) => n.id === activeId) ?? naskahList[0] ?? null

  return (
    <>
      {/* Nav */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 4rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bone)',
      }}>
        <Link
          href="/"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--charcoal)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          ← Arsip Lontar
        </Link>

        {/* Pemilih naskah (jika lebih dari satu) */}
        {naskahList.length > 1 && (
          <select
            value={active?.id ?? ''}
            onChange={(e) => setActiveId(e.target.value)}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--charcoal)',
              background: 'var(--bone)',
              border: '1px solid var(--border)',
              padding: '0.4rem 0.6rem',
              cursor: 'pointer',
            }}
          >
            {naskahList.map((n) => (
              <option key={n.id} value={n.id}>{n.title}</option>
            ))}
          </select>
        )}

        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--warm)',
        }}>
          Mode Baca — Interaktif
        </span>
      </nav>

      {!hydrated ? (
        <div style={{ padding: '6rem 4rem', fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--warm)' }}>
          Memuat naskah…
        </div>
      ) : active ? (
        <LontarReader key={active.id} naskah={active} />
      ) : (
        <div style={{ padding: '6rem 4rem', fontFamily: "'DM Mono', monospace", fontSize: '13px', color: 'var(--warm)' }}>
          Belum ada naskah yang dipublikasikan.{' '}
          <Link href="/admin" style={{ color: 'var(--charcoal)', textDecoration: 'underline' }}>Buka Panel Admin</Link>
        </div>
      )}
    </>
  )
}
