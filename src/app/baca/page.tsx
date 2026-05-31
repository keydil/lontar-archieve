'use client'

import LontarReader from '@/components/LontarReader'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false })

export default function BacaPage() {
  return (
    <>
      <CustomCursor />
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

      <LontarReader />
    </>
  )
}