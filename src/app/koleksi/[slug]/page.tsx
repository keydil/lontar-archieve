'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  ArrowLeft,
  ChevronRight,
  Share2,
  Check,
  Clock,
  Layers,
  Scale,
  Compass,
  Box,
  Image as ImageIcon,
  BookOpen,
} from 'lucide-react'
import { getKoleksiBySlug, useCMS } from '@/lib/cms'
import type { Artifact } from '@/data/koleksi'
import { BackgroundOrnaments } from '@/components/koleksi/BackgroundOrnaments'

const ModelViewer = dynamic(() => import('@/components/ModelViewer'), {
  ssr: false,
})

export default function KoleksiDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data } = useCMS()
  const [artifact, setArtifact] = useState<Artifact | null>(null)
  // Status eksplisit — "belum ketemu" beda sama "masih dicari". Tanpa ini,
  // halaman selalu kedip nampilin "Artefak tidak ditemukan" sesaat sebelum
  // fetch-nya kelar, karena artifact awalnya emang null.
  const [status, setStatus] = useState<'loading' | 'found' | 'not-found'>('loading')
  const [langId, setLangId] = useState(true) // true = Indonesia, false = English
  const [activeMedia, setActiveMedia] = useState(0)
  const [showModel, setShowModel] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    let active = true
    setStatus('loading')
    getKoleksiBySlug(slug).then((found) => {
      if (!active) return
      if (found) {
        setArtifact(found)
        setStatus('found')
      } else {
        setStatus('not-found')
      }
    })
    return () => { active = false }
  }, [slug])

  useEffect(() => {
    if (!artifact) return
    setActiveMedia(0)
    setShowModel(false)
    setCopiedLink(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [artifact])

  // Rekomendasi: prioritaskan kategori yang sama, isi sisanya dari koleksi
  // lain kalau kategori ini tipis — dan jujur dilabel "Koleksi Lainnya",
  // bukan "Terkait", biar gak menyesatkan kayak bug sebelumnya.
  const related = useMemo(() => {
    if (!artifact) return []
    const rest = data.koleksi.filter((a) => a.slug !== artifact.slug)
    const sameCategory = rest.filter((a) => a.category === artifact.category)
    const others = rest.filter((a) => a.category !== artifact.category)
    return [...sameCategory, ...others].slice(0, 3)
  }, [data.koleksi, artifact])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  if (status === 'loading') {
    return <DetailSkeleton />
  }

  if (status === 'not-found' || !artifact) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#F8F5EC]">
        <p className="font-serif text-3xl font-black text-[#2C2825]">Artefak tidak ditemukan</p>
        <Link
          href="/koleksi"
          className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-[#8A6D3B] hover:text-[#2C2825] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Koleksi
        </Link>
      </div>
    )
  }

  const media = artifact.media ?? []
  const has3D = Boolean(artifact.modelUrl)
  const current = media[activeMedia]
  const show3D = showModel || (has3D && media.length === 0)

  return (
    <div className="min-h-screen relative bg-[#F8F5EC]">
      <BackgroundOrnaments />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb & Bagikan */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#E2DBD0]">
          <div className="flex items-center gap-2 text-xs md:text-sm text-[#6B6356] min-w-0">
            <Link
              href="/koleksi"
              className="flex items-center gap-1.5 text-[#8A6D3B] hover:text-[#2C2825] font-semibold transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Koleksi</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#B0A798] shrink-0" />
            <span className="text-[#4A433A] shrink-0">{artifact.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#B0A798] shrink-0" />
            <span className="font-semibold text-[#2C2825] truncate">{artifact.name}</span>
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
                <span>Bagikan Artefak</span>
              </>
            )}
          </button>
        </div>

        {/* Kartu Utama */}
        <div className="bg-white border border-[#DCD3C1] rounded-sm shadow-sm overflow-hidden flex flex-col lg:flex-row">
          {/* Panggung Visual */}
          <div className="w-full lg:w-1/2 bg-[#F3EFE4] border-b lg:border-b-0 lg:border-r border-[#E0D7C6] p-5 sm:p-6 flex flex-col justify-between relative min-h-[420px]">
            <div className="w-full flex items-center justify-end gap-2 mb-4 flex-wrap">
              {has3D ? (
                <div className="flex items-center gap-1 bg-[#E2D8C3] p-1 rounded-full border border-[#D0C4AC]">
                  <button
                    onClick={() => setShowModel(false)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${!show3D ? 'bg-[#2C2825] text-white shadow-sm' : 'text-[#52493E] hover:text-[#1A1816]'
                      }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Foto</span>
                  </button>
                  <button
                    onClick={() => setShowModel(true)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${show3D ? 'bg-[#8A6D3B] text-white shadow-sm' : 'text-[#52493E] hover:text-[#1A1816]'
                      }`}
                  >
                    <Box className="w-3.5 h-3.5 text-[#FFD966]" />
                    <span>Model 3D</span>
                  </button>
                </div>
              ) : (
                <span className="text-xs text-[#8A8172] italic font-serif">Foto Dokumentasi 2D</span>
              )}
            </div>

            <div className="relative flex-1 my-2 min-h-[260px]">
              {has3D && (
                <div className={`absolute inset-0 ${show3D ? 'visible' : 'invisible'}`}>
                  <ModelViewer modelUrl={artifact.modelUrl!} rotation={artifact.modelRotation} />
                </div>
              )}

              {!show3D && (
                current ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {current.type === 'video' ? (
                      <video
                        src={current.url}
                        controls
                        className="w-full h-full object-contain rounded-sm bg-black"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={current.url}
                        alt={current.caption || artifact.name}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain drop-shadow-lg rounded-sm"
                      />
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#8A6D3B]">
                    <span className="text-3xl opacity-50">&#9707;</span>
                    <span className="font-mono text-[11px] tracking-[0.2em] uppercase">
                      Dokumentasi belum tersedia
                    </span>
                  </div>
                )
              )}
            </div>

            {!show3D && current?.caption && (
              <p className="text-center text-xs font-mono tracking-wide text-[#8A8172] mb-2">
                {current.caption}
              </p>
            )}

            {!show3D && media.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 mb-2">
                {media.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMedia(idx)}
                    title={m.caption || `Foto ${idx + 1}`}
                    className={`w-14 h-14 shrink-0 rounded-sm overflow-hidden border-2 transition-colors cursor-pointer ${activeMedia === idx ? 'border-[#8A6D3B]' : 'border-transparent'
                      }`}
                  >
                    {m.type === 'video' && !m.thumbnail ? (
                      <span className="w-full h-full flex items-center justify-center bg-[#1A1816] text-white text-sm">
                        &#9654;
                      </span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.thumbnail || m.url}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="w-full text-center mt-1">
              {show3D ? (
                <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E8D099]/30 border border-[#B09971]/50 text-[#6B501F] text-xs font-semibold">
                  <Box className="w-3.5 h-3.5 text-[#8A6D3B]" />
                  Model 3D Interaktif — drag buat putar, scroll buat zoom
                </span>
              ) : has3D ? (
                <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E8D099]/30 border border-[#B09971]/50 text-[#6B501F] text-xs font-semibold">
                  <Box className="w-3.5 h-3.5 text-[#8A6D3B]" />
                  Tampilan 3D Interaktif Tersedia untuk Publik
                </span>
              ) : (
                <span className="text-xs text-[#8A8172]">
                  Dokumentasi Resmi Museum Talaga Manggung
                </span>
              )}
            </div>
          </div>

          {/* Panel Info */}
          <div className="w-full lg:w-1/2 p-5 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-bold tracking-wider uppercase text-[#8A6D3B]">
                {artifact.category} • Museum Talaga Manggung
              </span>
              {has3D && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#2C2825] text-[#FFD966] text-[10px] font-bold border border-[#FFD966]/40 inline-flex items-center gap-1">
                  <Box className="w-3 h-3 text-[#FFD966]" />
                  <span>3D</span>
                </span>
              )}
            </div>

            <h1 className="font-serif font-bold text-3xl md:text-4xl text-[#2C2825] leading-tight mb-4">
              {artifact.name}
            </h1>

            {/* Grid metadata berikon */}
            <div className="grid grid-cols-2 gap-3 mb-5 p-4 bg-[#F5F1E6] border border-[#E0D7C6] rounded-sm text-xs md:text-sm">
              <div className="flex items-center gap-2.5 text-[#3D3730]">
                <Clock className="w-4 h-4 text-[#8A6D3B] shrink-0" />
                <div>
                  <span className="block text-[10px] text-[#8A8172] uppercase font-medium">Era</span>
                  <span className="font-semibold">{artifact.year}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-[#3D3730]">
                <Layers className="w-4 h-4 text-[#8A6D3B] shrink-0" />
                <div>
                  <span className="block text-[10px] text-[#8A8172] uppercase font-medium">Material</span>
                  <span className="font-semibold">{artifact.material}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-[#3D3730]">
                <Scale className="w-4 h-4 text-[#8A6D3B] shrink-0" />
                <div>
                  <span className="block text-[10px] text-[#8A8172] uppercase font-medium">Dimensi</span>
                  <span className="font-semibold">{artifact.dimensions}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-[#3D3730]">
                <Compass className="w-4 h-4 text-[#8A6D3B] shrink-0" />
                <div>
                  <span className="block text-[10px] text-[#8A8172] uppercase font-medium">Pengrajin / Asal</span>
                  <span className="font-semibold">{artifact.artist}</span>
                </div>
              </div>
            </div>

            {/* Toggle bahasa + deskripsi */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setLangId(true)}
                className={`font-mono text-[11px] tracking-[0.18em] uppercase px-3 py-1.5 border border-[#DCD3C1] transition-colors cursor-pointer ${langId ? 'bg-[#2C2825] text-[#F8F5EC]' : 'text-[#8A6D3B] hover:text-[#2C2825]'
                  }`}
              >
                ID
              </button>
              <button
                onClick={() => setLangId(false)}
                className={`font-mono text-[11px] tracking-[0.18em] uppercase px-3 py-1.5 border border-[#DCD3C1] transition-colors cursor-pointer ${!langId ? 'bg-[#2C2825] text-[#F8F5EC]' : 'text-[#8A6D3B] hover:text-[#2C2825]'
                  }`}
              >
                EN
              </button>
            </div>
            <p className="text-sm md:text-base text-[#4A433A] leading-relaxed mb-6">
              {langId ? artifact.description_id : artifact.description_en}
            </p>

            {/* Lokasi & jenis */}
            <div className="border-t border-[#E2DBD0] pt-4 space-y-2.5">
              {[
                { label: 'Jenis', value: artifact.type },
                { label: 'Lokasi Penyimpanan', value: artifact.address },
                { label: 'Ruang Pamer', value: artifact.location },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 text-xs md:text-sm">
                  <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#8A8172] shrink-0">
                    {item.label}
                  </span>
                  <span className="text-[#2C2825] text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Koleksi lainnya */}
        {related.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[#E2DBD0]">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-[#8A6D3B]" />
              <h3 className="font-serif font-bold text-xl text-[#2C2825]">Jelajahi Koleksi Lainnya</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/koleksi/${item.slug}`}
                  className="group bg-white border border-[#DCD3C1] rounded-sm overflow-hidden hover:border-[#B09971] transition-all p-3 flex flex-col shadow-sm hover:shadow-md"
                >
                  <div className="h-32 w-full flex items-center justify-center bg-[#F3EFE4] rounded-sm mb-3 overflow-hidden p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail || item.media?.[0]?.url || '/images/koleksi/default.jpg'}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#8A6D3B] block">
                    {item.category} • {item.year}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#2C2825] group-hover:text-[#8A6D3B] transition-colors truncate">
                    {item.name}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-12 pt-6 border-t border-[#E2DBD0] flex justify-between items-center text-xs text-[#6B635B] font-medium">
          <span>© 2023 Museum Talaga Manggung. All rights reserved.</span>
          <Link
            href="/koleksi"
            className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#8A6D3B] hover:text-[#2C2825] transition-colors"
          >
            Semua Koleksi ↗
          </Link>
        </footer>
      </div>
    </div>
  )
}

// Skeleton nge-mirrorin bentuk kartu asli (bukan spinner generik) biar gak
// ada lompatan layout pas data-nya kelar dimuat.
function DetailSkeleton() {
  return (
    <div className="min-h-screen relative bg-[#F8F5EC]">
      <BackgroundOrnaments />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 animate-pulse">
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#E2DBD0]">
          <div className="h-4 w-56 rounded-full bg-[#E8E2D3]" />
          <div className="h-7 w-32 rounded-full bg-[#E8E2D3]" />
        </div>

        <div className="bg-white border border-[#DCD3C1] rounded-sm shadow-sm overflow-hidden flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 bg-[#F3EFE4] border-b lg:border-b-0 lg:border-r border-[#E0D7C6] p-5 sm:p-6 min-h-[420px] flex flex-col justify-between">
            <div className="h-7 w-40 rounded-full bg-[#E8E2D3]" />
            <div className="flex-1 my-2 rounded-sm bg-[#E8E2D3]" />
            <div className="h-6 w-64 mx-auto rounded-full bg-[#E8E2D3]" />
          </div>

          <div className="w-full lg:w-1/2 p-5 sm:p-6 md:p-8">
            <div className="h-4 w-40 rounded-full bg-[#E8E2D3] mb-3" />
            <div className="h-9 w-3/4 rounded-sm bg-[#E8E2D3] mb-5" />
            <div className="grid grid-cols-2 gap-3 mb-5 p-4 bg-[#F5F1E6] border border-[#E0D7C6] rounded-sm">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-sm bg-[#E8E2D3]" />
              ))}
            </div>
            <div className="space-y-2 mb-6">
              <div className="h-3.5 w-full rounded-full bg-[#E8E2D3]" />
              <div className="h-3.5 w-full rounded-full bg-[#E8E2D3]" />
              <div className="h-3.5 w-2/3 rounded-full bg-[#E8E2D3]" />
            </div>
            <div className="space-y-2.5 border-t border-[#E2DBD0] pt-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-4 w-full rounded-full bg-[#E8E2D3]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
