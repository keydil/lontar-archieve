import React, { useState } from 'react';
import { Artifact } from './types';

interface ArtifactGridProps {
    artifacts: Artifact[];
    onSelectArtifact: (artifact: Artifact) => void;
    onLoadMore: () => void;
    hasMore: boolean;
}

// ============================================================
// Grid rata — SEMUA kartu ukuran & perlakuan sama, gak ada "featured"
// atau split "Koleksi Terkait Lainnya". Ini sesuai spek asli dari Stitch:
// filter/search di atas -> tampilin batch hasil -> "Lihat Koleksi
// Lainnya" cuma paginate SISA hasil filter yang sama, bukan nampilin
// koleksi "lain/beda". Nyebut itu "terkait lainnya" menyesatkan — user
// ngira itu barang beda, padahal cuma belum ke-load.
// ============================================================
export const ArtifactGrid: React.FC<ArtifactGridProps> = ({
    artifacts,
    onSelectArtifact,
    onLoadMore,
    hasMore,
}) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    if (!artifacts || artifacts.length === 0) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center">
                <p className="text-lg font-serif font-semibold text-[#6B6356] mb-2">
                    Tidak ada artefak yang ditemukan
                </p>
                <p className="text-sm text-[#8A8173]">
                    Coba ubah kata kunci pencarian atau pilih kategori lainnya.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {artifacts.map((item) => {
                    const isHovered = hoveredId === item.id;
                    return (
                        <div
                            key={item.id}
                            onClick={() => onSelectArtifact(item)}
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className="group cursor-pointer flex flex-col relative"
                        >
                            <div className="relative overflow-hidden rounded-sm bg-[#EFECE1] border border-[#E2DBD0] shadow-sm aspect-[4/3] flex items-center justify-center p-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover rounded-sm transition-transform duration-500 group-hover:scale-105"
                                />
                                <div
                                    className={`absolute inset-x-0 bottom-0 z-20 transition-all duration-300 ease-out flex flex-col justify-end ${isHovered
                                            ? 'bg-gradient-to-t from-[#A68641] via-[#B89851] to-[#C8A861]/95 p-3 shadow-lg'
                                            : 'bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5'
                                        }`}
                                >
                                    <h4
                                        className={`text-xs sm:text-sm md:text-base font-serif font-bold leading-snug drop-shadow-sm transition-colors duration-300 ${isHovered ? 'text-white' : 'text-[#E8D099]'
                                            }`}
                                    >
                                        {item.name}
                                    </h4>
                                    <div
                                        className={`grid transition-all duration-300 ease-out ${isHovered ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'
                                            }`}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-serif text-white/95 leading-snug mb-1">
                                                {item.era}. {item.material}.
                                            </p>
                                            <div className="inline-flex items-center gap-1 text-xs font-serif font-semibold text-white">
                                                <span>Lihat Detail</span>
                                                <span className="transition-transform group-hover:translate-x-1">→</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Paginate SISA hasil filter/search yang sama — bukan nampilin
                koleksi lain. Cuma muncul kalau beneran masih ada sisa. */}
            {hasMore && (
                <div className="flex flex-col items-center justify-center my-10">
                    <button
                        onClick={onLoadMore}
                        className="px-8 py-2.5 rounded-full border border-[#2C2825] text-[#2C2825] font-semibold text-xs tracking-wider uppercase hover:bg-[#2C2825] hover:text-[#F8F5EC] transition-all cursor-pointer shadow-sm"
                    >
                        LIHAT KOLEKSI LAINNYA
                    </button>
                </div>
            )}

            <footer className="text-center text-xs text-[#6B635B] font-medium pt-4 pb-8 border-t border-[#E8E2D5] mt-8">
                © 2023 Museum Talaga Manggung. All rights reserved.
            </footer>
        </div>
    );
};
