'use client'

import { useMemo, useState } from 'react'
import { Search, Plus, Edit, Trash2, ScrollText, EyeOff } from 'lucide-react'
import type { LontarNaskah } from '@/data/naskah'
import { confirmDialog } from '../Feedback'

export function NaskahList({
  items,
  onNew,
  onEdit,
  onDelete,
}: {
  items: LontarNaskah[]
  onNew: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((n) => [n.title, n.aksaraType, n.sumber, n.tahun].some((f) => f?.toLowerCase().includes(q)))
  }, [items, query])

  return (
    <div className="space-y-4 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF9] p-5 border border-[#DCD3C1] rounded-sm shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8A7144] mb-1">
            <ScrollText className="w-3.5 h-3.5" />
            Panel Alih Aksara &amp; Transkripsi Naskah
          </span>
          <h1 className="text-[28px] font-['Playfair_Display',serif] font-bold text-[#1A1816]">
            Manajemen Digitalisasi Naskah Kuno
          </h1>
          <p className="text-xs text-[#6B5E4C] mt-1">
            Kelola koleksi lontar, pemindaian, transkripsi per kata, dan status publikasi naskah.
          </p>
        </div>
        <button
          onClick={onNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#8A7144] hover:bg-[#725C34] text-white font-semibold text-sm rounded-sm transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Naskah Kuno Baru</span>
        </button>
      </div>

      <div className="relative bg-[#FFFDF9] p-3 border border-[#DCD3C1] rounded-sm">
        <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-[#8A8172]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari berdasarkan judul, aksara, sumber, atau tahun..."
          className="w-full pl-9 pr-3 py-2 bg-[#F9F6EE] border border-[#DCD3C1] rounded-sm text-sm text-[#2C2825] outline-none focus:border-[#8A7144]"
        />
      </div>

      <div className="bg-[#FFFDF9] border border-[#DCD3C1] rounded-sm overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 bg-[#F3EFE4] border-b border-[#DCD3C1]">
          <span className="text-sm font-bold text-[#1A1816]">Daftar Koleksi Naskah Kuno Terdaftar ({filtered.length})</span>
          <span className="text-[11px] text-[#8A7144] font-semibold">Modul Alih Aksara &amp; Translasi</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#8A8172]">
            {items.length === 0 ? 'Belum ada naskah. Klik "Tambah Naskah Kuno Baru".' : 'Gak ada naskah yang cocok sama pencarian ini.'}
          </div>
        ) : (
          <div className="divide-y divide-[#EAE3D3]">
            {filtered.map((n) => {
              const totalAyat = n.lembar.reduce((sum, l) => sum + l.verses.length, 0)
              return (
                <div key={n.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F9F6EE] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-16 h-12 shrink-0 bg-[#EAE2D0] rounded-sm border border-[#DCD3C1] flex items-center justify-center overflow-hidden shadow-sm">
                      {n.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={n.coverImage} alt={n.title} className="w-full h-full object-cover" />
                      ) : (
                        <ScrollText className="w-5 h-5 text-[#B0A798]" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {n.aksaraType && (
                          <span className="px-2 py-0.5 bg-[#8A7144] text-white text-[10px] font-bold rounded-sm">
                            {n.aksaraType}
                          </span>
                        )}
                        {n.tahun && <span className="text-xs font-bold text-[#8A7144]">{n.tahun}</span>}
                        <span className="text-[10px] text-[#7A7163] bg-[#EAE2D0] px-1.5 py-0.5 rounded-sm">
                          {n.lembar.length} Lembar Lontar &bull; {totalAyat} Ayat
                        </span>
                        {n.published === false && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-sm text-[10px] font-bold">
                            <EyeOff className="w-3 h-3" />
                            Draft
                          </span>
                        )}
                      </div>
                      <h3 className="font-['Playfair_Display',serif] font-bold text-base text-[#1A1816] truncate">
                        {n.title || '(Tanpa Judul)'}
                      </h3>
                      {(n.sinopsis || n.sumber) && (
                        <p className="text-xs text-[#6B5E4C] line-clamp-1">{n.sinopsis || n.sumber}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onEdit(n.id)}
                      className="px-3 py-1.5 bg-[#8A7144] hover:bg-[#725C34] text-white font-bold text-xs rounded-sm flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit / Transkripsi</span>
                    </button>
                    <button
                      onClick={async () => {
                        const ok = await confirmDialog(`Hapus "${n.title}"? Tindakan ini tidak bisa dibatalkan.`, {
                          danger: true,
                          confirmLabel: 'Hapus',
                        })
                        if (ok) onDelete(n.id)
                      }}
                      title="Hapus Naskah"
                      className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-sm cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export function NaskahListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between gap-3 bg-[#FFFDF9] p-5 border border-[#DCD3C1] rounded-sm">
        <div className="space-y-2">
          <div className="h-3 w-56 rounded-full bg-[#E8E2D3]" />
          <div className="h-6 w-72 rounded-full bg-[#E8E2D3]" />
        </div>
        <div className="h-10 w-52 rounded-sm bg-[#E8E2D3]" />
      </div>
      <div className="h-11 rounded-sm bg-[#FFFDF9] border border-[#DCD3C1]" />
      <div className="bg-[#FFFDF9] border border-[#DCD3C1] rounded-sm overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-[#EAE3D3] last:border-b-0">
            <div className="w-16 h-16 rounded-sm bg-[#E8E2D3] shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-40 rounded-full bg-[#E8E2D3]" />
              <div className="h-3 w-64 rounded-full bg-[#E8E2D3]" />
            </div>
            <div className="h-8 w-28 rounded-sm bg-[#E8E2D3]" />
          </div>
        ))}
      </div>
    </div>
  )
}
