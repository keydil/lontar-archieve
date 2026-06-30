'use client'

import { useState, FormEvent } from 'react'
import PageHeading from '@/components/PageHeading'

const institusiInfo: [string, string][] = [
  ['INSTITUSI', 'Lab Digitalisasi Warisan Budaya'],
  ['ALAMAT', 'Bandung, Jawa Barat, Indonesia'],
  ['EMAIL', 'kontak@arsiplontar.id'],
  ['JAM OPERASIONAL', 'Senin – Jumat\n09.00 – 16.00 WIB'],
  ['KERJA SAMA', 'Terbuka untuk museum, lembaga riset, dan institusi pendidikan'],
]

export default function KontakPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO: wire to actual backend / email service later
    setSent(true)
  }

  return (
    <div>
      <PageHeading kicker="HUBUNGI KAMI" title="Mari" italic="Bicara" />

      <div className="grid grid-cols-1 gap-13 px-12 pb-16 md:grid-cols-[1.2fr_1fr]">
        {/* Form */}
        <div>
          {sent ? (
            <div className="rounded border border-[rgba(26,26,26,0.15)] p-8 text-center">
              <div className="mb-2 font-serif text-[22px] text-[#1a1a1a]">Pesan terkirim</div>
              <div className="font-mono text-[13px] text-[rgba(26,26,26,0.5)]">
                Kami akan merespons dalam 1–2 hari kerja.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="mb-1.5 block font-mono text-[10px] tracking-[0.09em] text-[rgba(26,26,26,0.55)]">
                  NAMA
                </label>
                <input
                  type="text"
                  required
                  className="w-full border-0 border-b border-[rgba(26,26,26,0.2)] bg-transparent py-1.5 font-mono text-sm text-[#1a1a1a] outline-none"
                />
              </div>
              <div className="mb-6">
                <label className="mb-1.5 block font-mono text-[10px] tracking-[0.09em] text-[rgba(26,26,26,0.55)]">
                  EMAIL
                </label>
                <input
                  type="email"
                  required
                  className="w-full border-0 border-b border-[rgba(26,26,26,0.2)] bg-transparent py-1.5 font-mono text-sm text-[#1a1a1a] outline-none"
                />
              </div>
              <div className="mb-6">
                <label className="mb-1.5 block font-mono text-[10px] tracking-[0.09em] text-[rgba(26,26,26,0.55)]">
                  PESAN
                </label>
                <textarea
                  rows={4}
                  required
                  className="w-full resize-none border-0 border-b border-[rgba(26,26,26,0.2)] bg-transparent py-1.5 font-mono text-sm text-[#1a1a1a] outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded bg-[#1a1a1a] px-7 py-2.5 font-mono text-xs tracking-[0.08em] text-[#F5F0E8]"
              >
                KIRIM PESAN
              </button>
            </form>
          )}
        </div>

        {/* Institution info */}
        <div className="border-l border-[rgba(26,26,26,0.15)] pl-9">
          <div className="mb-5 font-serif text-[20px] leading-snug text-[#1a1a1a]">
            Arsip Naskah Lontar
            <br />
            <em className="italic">Digital Archive</em>
          </div>
          {institusiInfo.map(([label, value]) => (
            <div key={label} className="mb-4.5">
              <div className="mb-1 font-mono text-[10px] tracking-[0.09em] text-[rgba(26,26,26,0.5)]">
                {label}
              </div>
              <div className="whitespace-pre-line font-mono text-[13px] leading-relaxed text-[#1a1a1a]">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
