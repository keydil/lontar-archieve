'use client'

import { useMemo, useState } from 'react'
import { Search, Plus, Edit, Eye, Trash2, Box, Video } from 'lucide-react'
import type { Artifact } from '@/data/koleksi'
import { confirmDialog } from '../Feedback'

export function KoleksiList({
  items,
  onNew,
  onEdit,
  onPreview,
  onDelete,
}: {
  items: Artifact[]
  onNew: () => void
  onEdit: (slug: string) => void
  onPreview: (slug: string) => void
  onDelete: (slug: string) => void
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((a) =>
      [a.name, a.category, a.material, a.type].some((f) => f?.toLowerCase().includes(q))
    )
  }, [items, query])

  return (
    <div className="space-y-4 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[36px] font-['Playfair_Display',serif] font-black text-[#1A1816] leading-tight">Daftar Koleksi Artefak</h1>
          <p className="text-sm text-[#6B5E4C] mt-1">
            Kelola data artefak, foto, model 3D interaktif, dan video dokumentasi
          </p>
        </div>
        <button
          onClick={onNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#8A7144] hover:bg-[#725C34] text-white font-semibold text-sm rounded-sm transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Artefak Baru</span>
        </button>
      </div>

      <div className="relative bg-[#FFFDF9] p-3 border border-[#DCD3C1] rounded-sm">
        <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-[#8A8172]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari berdasarkan nama, kategori, jenis, atau material..."
          className="w-full pl-9 pr-3 py-2 bg-[#F9F6EE] border border-[#DCD3C1] rounded-sm text-sm text-[#2C2825] outline-none focus:border-[#8A7144]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#FFFDF9] border border-dashed border-[#DCD3C1] rounded-sm p-10 text-center text-xs text-[#8A8172]">
          {items.length === 0 ? 'Belum ada artefak. Klik "Tambah Artefak Baru".' : 'Gak ada artefak yang cocok sama pencarian ini.'}
        </div>
      ) : (
        <div className="bg-[#FFFDF9] border border-[#DCD3C1] rounded-sm overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-[#3D3730]">
              <thead className="bg-[#F3EFE4] text-[#6B5E4C] uppercase text-[11px] font-bold border-b border-[#DCD3C1]">
                <tr>
                  <th className="p-3">Media / Preview</th>
                  <th className="p-3">Nama Artefak & Slug</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Era / Pengrajin</th>
                  <th className="p-3">Fitur Media</th>
                  <th className="p-3">Aksi CMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D3]">
                {filtered.map((item) => {
                  const hasVideo = (item.media ?? []).some((m) => m.type === 'video')
                  const thumb = item.thumbnail || item.media?.[0]?.url
                  return (
                    <tr key={item.slug} className="hover:bg-[#F9F6EE] transition-colors">
                      <td className="p-3">
                        <div className="relative w-14 h-14 bg-[#F3EFE4] rounded-sm border border-[#D5C9B2] flex items-center justify-center overflow-hidden">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumb} alt={item.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-[#B0A798] text-lg">◇</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-['Playfair_Display',serif] font-bold text-[#1A1816] block text-lg">{item.name}</span>
                        <span className="text-xs text-[#8A7144] font-mono">#{item.slug}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-[#EAE3D3] text-[#4A433A] rounded-full text-xs font-bold whitespace-nowrap">
                          {item.category || '—'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="block font-medium">{item.year}</span>
                        <span className="text-xs text-[#7A7163]">{item.artist}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          {item.modelUrl ? (
                            <span className="px-2 py-0.5 bg-[#2C2825] text-[#FFD966] text-xs font-bold rounded-sm flex items-center gap-1">
                              <Box className="w-3 h-3" />
                              <span>3D</span>
                            </span>
                          ) : null}
                          {hasVideo ? (
                            <span className="px-2 py-0.5 bg-[#8A7144] text-white text-xs font-bold rounded-sm flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              <span>Video</span>
                            </span>
                          ) : null}
                          {!item.modelUrl && !hasVideo && <span className="text-xs text-[#A0988A]">—</span>}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onEdit(item.slug)}
                            title="Edit Artefak"
                            className="px-2 py-1.5 bg-[#EAE3D3] hover:bg-[#DDD2BA] text-[#2C2825] rounded-sm font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => onPreview(item.slug)}
                            title="Lihat di Situs"
                            className="px-2 py-1.5 bg-[#2C2825] hover:bg-[#1A1816] text-[#FFD966] rounded-sm font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={async () => {
                              const ok = await confirmDialog(`Hapus "${item.name}"? Tindakan ini tidak bisa dibatalkan.`, {
                                danger: true,
                                confirmLabel: 'Hapus',
                              })
                              if (ok) onDelete(item.slug)
                            }}
                            title="Hapus Artefak"
                            className="p-1.5 text-red-700 hover:bg-red-50 rounded-sm cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export function KoleksiListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between gap-3 bg-[#FFFDF9] p-5 border border-[#DCD3C1] rounded-sm">
        <div className="space-y-2">
          <div className="h-5 w-48 rounded-full bg-[#E8E2D3]" />
          <div className="h-3 w-72 rounded-full bg-[#E8E2D3]" />
        </div>
        <div className="h-9 w-40 rounded-sm bg-[#E8E2D3]" />
      </div>
      <div className="h-11 rounded-sm bg-[#FFFDF9] border border-[#DCD3C1]" />
      <div className="bg-[#FFFDF9] border border-[#DCD3C1] rounded-sm overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3 border-b border-[#EAE3D3] last:border-b-0">
            <div className="w-12 h-12 rounded-sm bg-[#E8E2D3] shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-40 rounded-full bg-[#E8E2D3]" />
              <div className="h-3 w-24 rounded-full bg-[#E8E2D3]" />
            </div>
            <div className="h-6 w-20 rounded-full bg-[#E8E2D3]" />
          </div>
        ))}
      </div>
    </div>
  )
}
