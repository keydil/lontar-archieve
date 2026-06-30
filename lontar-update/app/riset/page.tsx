'use client'

import { useState } from 'react'
import Link from 'next/link'
import PageHeading from '@/components/PageHeading'
import TeamModal from '@/components/TeamModal'
import { teams, publikasi, getTeamByName } from '@/data/riset'

export default function RisetPage() {
  const [activeTeam, setActiveTeam] = useState<string | null>(null)
  const teamData = activeTeam ? getTeamByName(activeTeam) ?? null : null

  return (
    <div>
      <PageHeading kicker="METODOLOGI & PUBLIKASI" title="Catatan" italic="Riset" />

      {/* Tentang Proyek + Team triggers */}
      <div className="px-12 pb-12">
        <div className="mb-3.5 font-mono text-[11px] tracking-[0.09em] text-[rgba(26,26,26,0.5)]">
          TENTANG PROYEK
        </div>
        <p className="mb-7 max-w-[660px] font-serif text-[19px] leading-relaxed text-[#1a1a1a]">
          Proyek ini mendigitalkan naskah dan artefak Nusantara melalui fotogrametri non-invasif,
          menghasilkan model tiga dimensi yang dapat diakses tanpa membahayakan kondisi fisik
          benda yang rapuh.
        </p>

        <div className="flex flex-wrap gap-0">
          {teams.map((t) => (
            <button
              key={t.nama}
              onClick={() => setActiveTeam(t.nama)}
              className="mr-7 border-b border-transparent py-3 pr-5 text-left transition-colors hover:border-[#1a1a1a]"
            >
              <div className="font-serif text-base text-[#1a1a1a]">{t.nama}</div>
              <div className="mt-0.5 font-mono text-[11px] text-[rgba(26,26,26,0.5)]">
                {t.anggota.length} anggota &middot; lihat detail &#8599;
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Publikasi */}
      <div className="px-12 pb-16">
        <div className="mb-5 border-t border-[rgba(26,26,26,0.15)] pt-9">
          <div className="font-mono text-[11px] tracking-[0.09em] text-[rgba(26,26,26,0.5)]">
            PUBLIKASI
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {publikasi.map((r) => (
            <div
              key={r.slug}
              className="rounded border border-[rgba(26,26,26,0.15)] p-6 transition-colors hover:border-[rgba(26,26,26,0.4)]"
            >
              <div className="mb-2.5 flex items-center justify-between">
                <span className="font-mono text-[11px] text-[rgba(26,26,26,0.5)]">{r.date}</span>
                <span className="rounded bg-[rgba(26,26,26,0.06)] px-2 py-0.5 font-mono text-[10px] tracking-wide text-[rgba(26,26,26,0.5)]">
                  {r.category}
                </span>
              </div>
              <div className="mb-2.5 font-serif text-[19px] leading-snug text-[#1a1a1a]">
                {r.title}
              </div>
              <div className="mb-4 font-mono text-[13px] leading-relaxed text-[rgba(26,26,26,0.62)]">
                {r.summary}
              </div>
              <Link
                href={`/riset/${r.slug}`}
                className="font-mono text-xs tracking-wide text-[#1a1a1a] underline"
              >
                Baca selengkapnya &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>

      <TeamModal team={teamData} onClose={() => setActiveTeam(null)} />
    </div>
  )
}
