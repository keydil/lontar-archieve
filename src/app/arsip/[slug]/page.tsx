'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, Share2, Check } from 'lucide-react'
import { useCMS } from '@/lib/cms'
import LontarReader from '@/components/LontarReader'
import { BackgroundOrnaments } from '@/components/koleksi/BackgroundOrnaments'
import { ArtifactGridSkeleton } from '@/components/koleksi/ArtifactGrid'

const LAST_READ_KEY = 'lontar-last-read'

export default function ArsipDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data, hydrated } = useCMS()
  const active = data.naskah.filter((n) => n.published !== false).find((n) => n.id === slug)
  const [copiedLink, setCopiedLink] = useState(false)

  // Dicatat buat kartu "Terakhir Dibaca" di /arsip — bukan level per-lembar
  // (itu state internal LontarReader yang gak disentuh di sini), cukup
  // "naskah apa yang terakhir dibuka".
  useEffect(() => {
    if (!active) return
    try {
      localStorage.setItem(LAST_READ_KEY, JSON.stringify({ id: active.id, title: active.title }))
    } catch {
      // localStorage gak tersedia — bukan hal fatal, cuma fitur resume yang gak jalan
    }
  }, [active])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen relative bg-[#F8F5EC]">
        <BackgroundOrnaments />
        <div className="relative z-10">
          <ArtifactGridSkeleton count={3} />
        </div>
      </div>
    )
  }

  if (!active) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#F8F5EC]">
        <p className="font-serif text-3xl font-black text-[#2C2825]">Naskah tidak ditemukan</p>
        <Link
          href="/arsip"
          className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-[#8A6D3B] hover:text-[#2C2825] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Arsip
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-[#F8F5EC]">
      <BackgroundOrnaments />
      <div className="relative z-10">
        {/* Breadcrumb & Bagikan */}
        <div className="w-full max-w-4xl mx-auto px-4 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pb-4 border-b border-[#E2DBD0]">
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#6B6356] min-w-0">
              <Link
                href="/arsip"
                className="flex items-center gap-1.5 text-[#8A6D3B] hover:text-[#2C2825] font-semibold transition-colors shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Katalog Naskah</span>
              </Link>
              {active.aksaraType && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-[#B0A798] shrink-0" />
                  <span className="text-[#4A433A] shrink-0">{active.aksaraType}</span>
                </>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-[#B0A798] shrink-0" />
              <span className="font-semibold text-[#2C2825] truncate">{active.title}</span>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFECE1] hover:bg-[#E2DBD0] text-[#4A433A] rounded-full text-xs font-semibold transition-colors border border-[#DCD3C1] cursor-pointer shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-700" />
                  <span className="text-green-800">Tautan Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan Naskah</span>
                </>
              )}
            </button>
          </div>
        </div>

        <LontarReader key={active.id} naskah={active} />
      </div>
    </div>
  )
}
