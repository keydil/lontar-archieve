'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getArsipBySlug } from '@/data/arsip'

export default function ArsipDetailPage() {
  const params = useParams<{ slug: string }>()
  const entry = getArsipBySlug(params.slug)
  const [lang, setLang] = useState<'id' | 'en'>('id')

  if (!entry) {
    return (
      <div className="px-12 py-16 font-mono text-sm text-[rgba(26,26,26,0.5)]">
        Naskah tidak ditemukan.{' '}
        <Link href="/arsip" className="underline">
          Kembali ke Arsip
        </Link>
      </div>
    )
  }

  return (
    <div className="px-10 py-10">
      <Link
        href="/arsip"
        className="mb-7 inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.06em] text-[rgba(26,26,26,0.6)]"
      >
        &larr; ARSIP
      </Link>

      <div className="mb-2 font-mono text-[11px] tracking-[0.07em] text-[rgba(26,26,26,0.5)]">
        {entry.script} &middot; {entry.period}
      </div>
      <h1 className="mb-9 font-serif text-[38px] text-[#1a1a1a]">{entry.title}</h1>

      <div className="grid grid-cols-1 gap-11 md:grid-cols-2">
        {/* LEFT: original script + transliteration */}
        <div>
          <div className="mb-2.5 font-mono text-[11px] tracking-[0.09em] text-[rgba(26,26,26,0.5)]">
            AKSARA ASLI
          </div>
          <div className="mb-6 flex h-[200px] items-center justify-center rounded bg-[#1a1a1a] font-mono text-xs text-[rgba(245,240,232,0.25)]">
            [ foto naskah asli ]
          </div>

          <div className="mb-2.5 font-mono text-[11px] tracking-[0.09em] text-[rgba(26,26,26,0.5)]">
            TRANSLITERASI
          </div>
          <div className="whitespace-pre-line rounded bg-[rgba(26,26,26,0.05)] px-4 py-3.5 font-mono text-sm leading-loose text-[#1a1a1a]">
            {entry.transliteration}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 font-mono text-[10px] tracking-[0.08em] text-[rgba(26,26,26,0.5)]">
                ASAL
              </div>
              <div className="font-mono text-xs text-[#1a1a1a]">{entry.provenance}</div>
            </div>
            <div>
              <div className="mb-1 font-mono text-[10px] tracking-[0.08em] text-[rgba(26,26,26,0.5)]">
                KONDISI
              </div>
              <div className="font-mono text-xs text-[#1a1a1a]">{entry.condition}</div>
            </div>
          </div>
        </div>

        {/* RIGHT: translation toggle + related koleksi */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <div className="font-mono text-[11px] tracking-[0.09em] text-[rgba(26,26,26,0.5)]">
              TERJEMAHAN
            </div>
            <div className="flex gap-1">
              {(['id', 'en'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className="rounded border border-[rgba(26,26,26,0.2)] px-2.5 py-0.5 font-mono text-[10px] tracking-wide"
                  style={{
                    background: lang === l ? '#1a1a1a' : 'transparent',
                    color: lang === l ? '#F5F0E8' : 'rgba(26,26,26,0.5)',
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-7 font-serif text-[17px] leading-relaxed text-[#1a1a1a]">
            {lang === 'id' ? entry.translation_id : entry.translation_en}
          </div>

          {entry.relatedKoleksiSlug && (
            <div className="border-t border-[rgba(26,26,26,0.15)] pt-4.5">
              <div className="mb-1.5 font-mono text-[11px] text-[rgba(26,26,26,0.5)]">
                ARTEFAK TERKAIT
              </div>
              <Link
                href={`/koleksi/${entry.relatedKoleksiSlug}`}
                className="font-mono text-xs tracking-wide text-[#1a1a1a] underline"
              >
                Lihat model 3D di Koleksi &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
