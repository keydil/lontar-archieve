'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCMS } from '@/lib/cms'
import { BackgroundOrnaments } from '@/components/koleksi/BackgroundOrnaments'
import { Navbar } from '@/components/koleksi/Navbar'
import { ArtifactGrid } from '@/components/koleksi/ArtifactGrid'
import { Artifact as AIArtifact } from '@/components/koleksi/types'

export default function KoleksiPage() {
  const router = useRouter()
  const { data } = useCMS()
  const allArtifacts = data.koleksi

  const [activeCategory, setActiveCategory] = useState<string>('Semua')
  const [query, setQuery] = useState<string>('')
  const [visibleCount, setVisibleCount] = useState<number>(6)

  // Ambil daftar kategori unik dari CMS. SENGAJA cuma `category` (taksonomi
  // resmi, 10 nilai) — bukan `material`, yang deskripsi bahan per-item dan
  // hampir selalu unik (mis. "Besi Pamor, Gagang Kayu & Tanduk"). Nyampur
  // dua-duanya bikin pill filter meledak jadi puluhan, nyaris semua isinya
  // cuma dipake 1 artefak — persis bug yang bikin filter kacau kemarin.
  const categoriesList = useMemo(() => {
    const set = new Set<string>()
    for (const a of allArtifacts) {
      if (a.category) set.add(a.category)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'id'))
  }, [allArtifacts])

  // Filter artifacts
  const filteredArtifacts = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allArtifacts.filter((a) => {
      if (activeCategory !== 'Semua' && a.category?.toLowerCase() !== activeCategory.toLowerCase()) {
        return false
      }
      if (!q) return true
      return [a.name, a.type, a.material, a.year, a.description_id, a.category]
        .some((field) => field?.toLowerCase().includes(q))
    })
  }, [allArtifacts, activeCategory, query])

  // Map to AI Studio Artifact format
  const mappedArtifacts: AIArtifact[] = useMemo(() => {
    return filteredArtifacts.map((a, idx) => ({
      id: a.slug,
      slug: a.slug,
      name: a.name,
      era: a.year || 'Abad ke-13 - ke-14 M',
      material: a.material || 'Perunggu',
      imageUrl: a.thumbnail || (a.media && a.media[0]?.url) || '/images/koleksi/default.jpg',
      featured: idx === 0, // Spotlight first item in Bento Grid
      type: a.type,
      category: a.category,
      description_id: a.description_id,
    }))
  }, [filteredArtifacts])

  const visibleArtifacts = useMemo(() => {
    return mappedArtifacts.slice(0, visibleCount)
  }, [mappedArtifacts, visibleCount])

  const hasMore = visibleCount < mappedArtifacts.length

  const handleTabChange = (tab: 'artefak' | 'naskah') => {
    if (tab === 'naskah') {
      router.push('/arsip')
    }
  }

  return (
    <div className="museum-theme min-h-screen relative font-sans text-[#2C2825] bg-[#F8F5EC] selection:bg-[#E5D2A8] selection:text-[#2A2316]">
      {/* Parchment background & royal ornament borders */}
      <BackgroundOrnaments />

      {/* Main Content Overlay */}
      <div className="relative z-10">
        <Navbar
          activeTab="artefak"
          setActiveTab={handleTabChange}
          selectedCategory={activeCategory}
          setSelectedCategory={setActiveCategory}
          searchQuery={query}
          setSearchQuery={setQuery}
          categoriesList={categoriesList}
          onPortalUtamaClick={() => window.location.href = 'https://museumtalagamanggung.com'}
        />

        <main className="pb-12">
          <ArtifactGrid
            artifacts={visibleArtifacts}
            onSelectArtifact={(item) => router.push(`/koleksi/${item.slug}`)}
            onLoadMore={() => setVisibleCount((prev) => prev + 6)}
            hasMore={hasMore}
          />
        </main>
      </div>
    </div>
  )
}
