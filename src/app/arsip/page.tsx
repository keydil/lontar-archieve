'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCMS } from '@/lib/cms'
import { BackgroundOrnaments } from '@/components/koleksi/BackgroundOrnaments'
import { Navbar } from '@/components/koleksi/Navbar'
import { ArrowRight, ArrowLeft, BookOpen, Sparkles } from 'lucide-react'

export default function ArsipPage() {
  const router = useRouter()
  const { data } = useCMS()
  const naskahList = data.naskah.filter((n) => n.published !== false)

  const [query, setQuery] = useState('')

  const filteredNaskah = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return naskahList
    return naskahList.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.aksaraType?.toLowerCase().includes(q) ||
        n.tahun?.toLowerCase().includes(q) ||
        n.sumber?.toLowerCase().includes(q)
    )
  }, [naskahList, query])

  const handleTabChange = (tab: 'artefak' | 'naskah') => {
    if (tab === 'artefak') {
      router.push('/koleksi')
    }
  }

  return (
    <div className="museum-theme min-h-screen relative font-sans text-[#2C2825] bg-[#F8F5EC] selection:bg-[#E5D2A8] selection:text-[#2A2316]">
      {/* Parchment background & royal ornament borders */}
      <BackgroundOrnaments />

      {/* Main Content Overlay */}
      <div className="relative z-10">
        <Navbar
          activeTab="naskah"
          setActiveTab={handleTabChange}
          selectedCategory="Semua"
          setSelectedCategory={() => {}}
          searchQuery={query}
          setSearchQuery={setQuery}
          onPortalUtamaClick={() => (window.location.href = 'https://museumtalagamanggung.com')}
        />

        <main className="w-full max-w-6xl mx-auto px-4 py-6 pb-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#2C2825] mb-2 tracking-tight">
              Katalog Naskah & Transkripsi Lontar
            </h2>
            <p className="text-sm sm:text-base font-serif text-[#6B635B] max-w-2xl mx-auto">
              Dokumentasi digital naskah-naskah kuno Nusantara lengkap dengan transliterasi aksara, terjemahan, dan catatan filologi.
            </p>
          </div>

          {filteredNaskah.length === 0 ? (
            <div className="w-full max-w-3xl mx-auto py-16 text-center bg-[#F3EFE5]/80 border border-[#E0D7C6] rounded-xs p-8">
              <p className="text-lg font-serif font-semibold text-[#6B6356] mb-2">
                Tidak ada naskah yang ditemukan
              </p>
              <p className="text-sm text-[#8A8173]">
                Coba ubah kata kunci pencarian Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNaskah.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/arsip/${entry.id}`}
                  className="group cursor-pointer bg-[#F3EFE5]/90 border border-[#E0D7C6] rounded-xs p-5 sm:p-6 transition-all duration-300 hover:shadow-md hover:bg-[#FAF6EE] hover:border-[#C5A86A] flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Subtle golden corner accent */}
                  <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[#C5A86A]/20 to-transparent pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8E1D1] text-[#4A433A] text-xs font-mono font-medium border border-[#D8CEB8]">
                        <BookOpen className="w-3.5 h-3.5 text-[#8A6D3B]" />
                        <span>{entry.aksaraType || 'Naskah Kuno'}</span>
                      </span>
                      <span className="text-xs font-mono text-[#8A8173]">
                        {entry.tahun}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2C2825] group-hover:text-[#8A6D3B] transition-colors leading-snug mb-2">
                      {entry.title}
                    </h3>

                    {entry.sumber && (
                      <p className="text-xs sm:text-sm font-serif text-[#6B6356] line-clamp-2 leading-relaxed mb-4">
                        {entry.sumber}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#E2DBD0] flex items-center justify-between text-xs sm:text-sm font-serif font-semibold text-[#8A6D3B] group-hover:text-[#B08C42]">
                    <span>Baca Transkripsi Naskah</span>
                    <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

        <footer className="text-center text-xs text-[#6B635B] font-medium pt-4 pb-8 border-t border-[#E8E2D5] mt-8 max-w-7xl mx-auto px-4">
          © 2023 Museum Talaga Manggung. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
