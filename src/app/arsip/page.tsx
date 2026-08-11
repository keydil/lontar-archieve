'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCMS } from '@/lib/cms'
import { BackgroundOrnaments } from '@/components/koleksi/BackgroundOrnaments'
import { Navbar } from '@/components/koleksi/Navbar'
import { ArtifactGridSkeleton } from '@/components/koleksi/ArtifactGrid'
import { BookOpen, Bookmark, ArrowRight, ScrollText, Landmark } from 'lucide-react'

const LAST_READ_KEY = 'lontar-last-read'

export default function ArsipPage() {
  const router = useRouter()
  const { data, hydrated } = useCMS()
  const naskahList = data.naskah.filter((n) => n.published !== false)

  const [query, setQuery] = useState('')
  const [aksaraFilter, setAksaraFilter] = useState('Semua')
  const [lastRead, setLastRead] = useState<{ id: string; title: string } | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_READ_KEY)
      if (raw) setLastRead(JSON.parse(raw))
    } catch {
      // localStorage gak tersedia (mis. private mode) — biarin kosong, gak fatal
    }
  }, [])

  const aksaraTypes = useMemo(() => {
    const set = new Set<string>()
    for (const n of naskahList) {
      if (n.aksaraType) set.add(n.aksaraType)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'id'))
  }, [naskahList])

  const filteredNaskah = useMemo(() => {
    const q = query.trim().toLowerCase()
    return naskahList.filter((n) => {
      if (aksaraFilter !== 'Semua' && n.aksaraType !== aksaraFilter) return false
      if (!q) return true
      return [n.title, n.aksaraType, n.tahun, n.sumber, n.sinopsis].some((f) => f?.toLowerCase().includes(q))
    })
  }, [naskahList, query, aksaraFilter])

  const handleTabChange = (tab: 'artefak' | 'naskah') => {
    if (tab === 'artefak') router.push('/koleksi')
  }

  return (
    <div className="museum-theme min-h-screen relative font-sans text-[#2C2825] bg-[#F8F5EC] selection:bg-[#E5D2A8] selection:text-[#2A2316]">
      <BackgroundOrnaments />

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
          {/* Hero */}
          <div className="bg-[#FFFDF9]/90 border border-[#DCD3C1] rounded-sm p-6 sm:p-8 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#8A6D3B] mb-2">
                <ScrollText className="w-4 h-4" />
                Arsip Perpustakaan Digital Naskah &amp; Lontar Suci
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#2C2825] tracking-tight mb-2">
                Koleksi Naskah Kuno Talaga Manggung
              </h1>
              <p className="text-sm sm:text-base text-[#6B635B] max-w-2xl leading-relaxed">
                Pilih salah satu naskah lontar pusaka di bawah ini untuk membuka Pembaca Interaktif dengan
                transliterasi kata per kata, terjemahan, dan tafsir filologi sejarah.
              </p>
            </div>

            {lastRead && (
              <Link
                href={`/arsip/${lastRead.id}`}
                className="shrink-0 bg-[#F3EFE4] border border-[#D5C9B2] rounded-sm p-4 min-w-[240px] hover:border-[#8A7144] transition-colors"
              >
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8A7144] mb-1">
                  <Bookmark className="w-3.5 h-3.5" />
                  Terakhir Dibaca
                </span>
                <p className="text-sm font-serif font-bold text-[#1A1816] mb-2 leading-snug">{lastRead.title}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A6D3B]">
                  Lanjutkan Membaca
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            )}
          </div>

          {/* Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B635B] shrink-0">
                <BookOpen className="w-4 h-4" />
                Filter Jenis Aksara:
              </span>
              {['Semua', ...aksaraTypes].map((t) => (
                <button
                  key={t}
                  onClick={() => setAksaraFilter(t)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    aksaraFilter === t
                      ? 'bg-[#E5D2A8] text-[#2A2316] font-bold border border-[#C5A86A] shadow-sm'
                      : 'bg-[#ECE5D6]/90 text-[#4A433A] hover:bg-[#E0D7C4]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <span className="text-xs text-[#8A8172] shrink-0">Menampilkan {filteredNaskah.length} Naskah</span>
          </div>

          {!hydrated ? (
            <ArtifactGridSkeleton count={6} />
          ) : filteredNaskah.length === 0 ? (
            <div className="w-full max-w-3xl mx-auto py-16 text-center bg-[#F3EFE5]/80 border border-[#E0D7C6] rounded-sm p-8">
              <p className="text-lg font-serif font-semibold text-[#6B6356] mb-2">Tidak ada naskah yang ditemukan</p>
              <p className="text-sm text-[#8A8173]">Coba ubah kata kunci pencarian atau filter aksara.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNaskah.map((entry) => {
                const totalAyat = entry.lembar.reduce((sum, l) => sum + l.verses.length, 0)
                return (
                  <Link
                    key={entry.id}
                    href={`/arsip/${entry.id}`}
                    className="group bg-white border border-[#DCD3C1] rounded-sm overflow-hidden hover:border-[#B09971] transition-all shadow-sm hover:shadow-md flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-[#F3EFE4] overflow-hidden">
                      {entry.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={entry.coverImage}
                          alt={entry.title}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#B0A798]">
                          <ScrollText className="w-10 h-10" />
                        </div>
                      )}
                      {entry.aksaraType && (
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#2C2825]/90 text-[#E8D099] text-[10px] font-bold uppercase tracking-wide">
                          {entry.aksaraType}
                        </span>
                      )}
                      {entry.tahun && (
                        <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-sm bg-black/70 text-white text-[11px] font-semibold">
                          Tahun {entry.tahun}
                        </span>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                      {entry.sumber && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#8A7144] font-semibold mb-1.5">
                          <Landmark className="w-3.5 h-3.5" />
                          {entry.sumber}
                        </span>
                      )}
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2C2825] group-hover:text-[#8A6D3B] transition-colors leading-snug mb-2">
                        {entry.title}
                      </h3>
                      {entry.sinopsis && (
                        <p className="text-xs sm:text-sm text-[#6B6356] line-clamp-2 leading-relaxed mb-4">
                          {entry.sinopsis}
                        </p>
                      )}

                      <div className="mt-auto pt-3 border-t border-[#E2DBD0] flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-[#8A8172]">
                          {entry.lembar.length} Lembar &bull; {totalAyat} Ayat
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-[#8A6D3B] group-hover:text-[#B08C42]">
                          Buka &amp; Baca
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
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
