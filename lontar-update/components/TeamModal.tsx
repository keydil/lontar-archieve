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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,26,26,0.55)]"
      onClick={onClose}
    >
      <div
        className="relative w-[90%] max-w-[440px] rounded bg-[#F5F0E8] p-9"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 font-mono text-xs tracking-wide text-[rgba(26,26,26,0.5)]"
        >
          ✕ TUTUP
        </button>

        <div className="mb-2 font-mono text-[10px] tracking-[0.09em] text-[rgba(26,26,26,0.5)]">
          TIM
        </div>
        <div className="mb-3 font-serif text-[26px] text-[#1a1a1a]">
          {team.nama}
        </div>
        <div className="mb-6 font-mono text-[13px] leading-relaxed text-[rgba(26,26,26,0.65)]">
          {team.deskripsi}
        </div>

        <div className="border-t border-[rgba(26,26,26,0.15)] pt-5">
          <div className="mb-3.5 font-mono text-[10px] tracking-[0.09em] text-[rgba(26,26,26,0.5)]">
            ANGGOTA
          </div>
          {team.anggota.map((a) => (
            <div
              key={a.nama}
              className="flex justify-between border-b border-[rgba(26,26,26,0.15)] py-2.5 last:border-b-0"
            >
              <span className="font-serif text-base text-[#1a1a1a]">{a.nama}</span>
              <span className="font-mono text-[11px] text-[rgba(26,26,26,0.5)]">{a.peran}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
