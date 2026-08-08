import React, { useState } from 'react';
import { Artifact } from './types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ArtifactGridProps {
    artifacts: Artifact[];
    onSelectArtifact: (artifact: Artifact) => void;
    onLoadMore: () => void;
    hasMore: boolean;
}

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
                    Coba ubah kata kunci pencarian atau pilih kategori materi lainnya.
                </p>
            </div>
        );
    }

    // Pick unique featured item (or first item)
    const featuredItem = artifacts.find((a) => a.featured) || artifacts[0];

    // Unique list of remaining artifacts excluding the featured item
    const otherItems = artifacts.filter((a) => a.id !== featuredItem.id);

    // Distribute items into unique bento slots
    const slot0 = otherItems[0]; // Top Left
    const slot1 = otherItems[1]; // Bottom Left 1
    const slot2 = otherItems[2]; // Bottom Left 2
    const slot3 = otherItems[3]; // Top Right
    const slot4 = otherItems[4]; // Bottom Right

    // Set of IDs used in the top bento grid
    const bentoItemIds = new Set(
        [featuredItem?.id, slot0?.id, slot1?.id, slot2?.id, slot3?.id, slot4?.id].filter(Boolean)
    );

    // Remaining artifacts beyond the bento grid
    const remainingArtifacts = artifacts.filter((a) => !bentoItemIds.has(a.id));

    const renderCardOverlay = (item: Artifact, isHovered: boolean) => {
        return (
            <div
                className={`absolute inset-x-0 bottom-0 z-20 transition-all duration-300 ease-out flex flex-col justify-end ${isHovered
                        ? 'bg-gradient-to-t from-[#A68641] via-[#B89851] to-[#C8A861]/95 p-3.5 sm:p-4 shadow-lg'
                        : 'bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 sm:p-3.5'
                    }`}
            >
                <h4
                    className={`text-sm sm:text-base md:text-lg font-serif font-bold leading-snug drop-shadow-xs transition-colors duration-300 ${isHovered ? 'text-white' : 'text-[#E8D099]'
                        }`}
                >
                    {item.name}
                </h4>

                <div
                    className={`grid transition-all duration-300 ease-out ${isHovered ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'
                        }`}
                >
                    <div className="overflow-hidden">
                        <p className="text-xs sm:text-sm font-serif text-white/95 leading-snug mb-1.5">
                            {item.era}. {item.material}.
                        </p>
                        <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-serif font-semibold text-white">
                            <span>Lihat Detail</span>
                            <span className="transition-transform group-hover:translate-x-1">→</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const hasLeftCol = Boolean(slot0 || slot1 || slot2);
    const hasRightCol = Boolean(slot3 || slot4);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
            {/* Main Grid matching layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

                {/* Left Column (5 cols on lg) */}
                {hasLeftCol && (
                    <div className="md:col-span-12 lg:col-span-5 flex flex-col gap-6">
                        {/* Top Left: slot0 */}
                        {slot0 && (
                            <div
                                onClick={() => onSelectArtifact(slot0)}
                                onMouseEnter={() => setHoveredId(slot0.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                className="group cursor-pointer flex flex-col relative"
                            >
                                <div className="relative overflow-hidden rounded-xs bg-[#EFECE1] border border-[#E2DBD0] shadow-xs aspect-4/3 flex items-center justify-center p-3">
                                    <img
                                        src={slot0.imageUrl}
                                        alt={slot0.name}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover rounded-xs transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {renderCardOverlay(slot0, hoveredId === slot0.id)}
                                </div>
                            </div>
                        )}

                        {/* Bottom Left: slot1 & slot2 */}
                        {(slot1 || slot2) && (
                            <div className={`grid ${slot1 && slot2 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 items-end`}>
                                {slot1 && (
                                    <div
                                        onClick={() => onSelectArtifact(slot1)}
                                        onMouseEnter={() => setHoveredId(slot1.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        className="group cursor-pointer flex flex-col relative"
                                    >
                                        <div className="relative overflow-hidden rounded-xs bg-[#EFECE1] border border-[#E2DBD0] shadow-xs aspect-3/4 flex items-center justify-center p-2">
                                            <img
                                                src={slot1.imageUrl}
                                                alt={slot1.name}
                                                referrerPolicy="no-referrer"
                                                className="w-full h-full object-cover rounded-xs transition-transform duration-500 group-hover:scale-105"
                                            />
                                            {renderCardOverlay(slot1, hoveredId === slot1.id)}
                                        </div>
                                    </div>
                                )}

                                {slot2 && (
                                    <div
                                        onClick={() => onSelectArtifact(slot2)}
                                        onMouseEnter={() => setHoveredId(slot2.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        className="group cursor-pointer flex flex-col relative"
                                    >
                                        <div className="relative overflow-hidden rounded-xs bg-[#EFECE1] border border-[#E2DBD0] shadow-xs aspect-4/3 flex items-center justify-center p-2">
                                            <img
                                                src={slot2.imageUrl}
                                                alt={slot2.name}
                                                referrerPolicy="no-referrer"
                                                className="w-full h-full object-cover rounded-xs transition-transform duration-500 group-hover:scale-105"
                                            />
                                            {renderCardOverlay(slot2, hoveredId === slot2.id)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Center Spotlight Column */}
                {featuredItem && (
                    <div
                        className={`md:col-span-12 ${hasLeftCol && hasRightCol
                                ? 'lg:col-span-4'
                                : hasLeftCol || hasRightCol
                                    ? 'lg:col-span-7'
                                    : 'lg:col-span-12'
                            } flex flex-col items-center`}
                    >
                        <div
                            onClick={() => onSelectArtifact(featuredItem)}
                            onMouseEnter={() => setHoveredId(featuredItem.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className="group cursor-pointer flex flex-col w-full relative"
                        >
                            {/* Image Box Container */}
                            <div className="relative w-full overflow-hidden rounded-xs bg-[#EFECE1] border border-[#E2DBD0] shadow-xs aspect-3/4 md:aspect-auto md:h-[420px] flex items-center justify-center p-3">
                                {/* Radial spotlight effect behind featured vase */}
                                <div className="absolute inset-0 bg-radial from-[#FFFDF8] via-[#F3EFE3] to-[#E3DCCB] opacity-90" />

                                {/* Featured Artifact Image */}
                                <img
                                    src={featuredItem.imageUrl}
                                    alt={featuredItem.name}
                                    referrerPolicy="no-referrer"
                                    className="relative z-10 w-full h-full object-cover rounded-xs transition-transform duration-500 group-hover:scale-105"
                                />

                                {renderCardOverlay(featuredItem, hoveredId === featuredItem.id)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Right Column (3 cols on lg) */}
                {hasRightCol && (
                    <div className="md:col-span-12 lg:col-span-3 flex flex-col gap-6">
                        {slot3 && (
                            <div
                                onClick={() => onSelectArtifact(slot3)}
                                onMouseEnter={() => setHoveredId(slot3.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                className="group cursor-pointer flex flex-col relative"
                            >
                                <div className="relative overflow-hidden rounded-xs bg-[#EFECE1] border border-[#E2DBD0] shadow-xs aspect-4/3 flex items-center justify-center p-2">
                                    <img
                                        src={slot3.imageUrl}
                                        alt={slot3.name}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover rounded-xs transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {renderCardOverlay(slot3, hoveredId === slot3.id)}
                                </div>
                            </div>
                        )}

                        {slot4 && (
                            <div
                                onClick={() => onSelectArtifact(slot4)}
                                onMouseEnter={() => setHoveredId(slot4.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                className="group cursor-pointer flex flex-col relative"
                            >
                                <div className="relative overflow-hidden rounded-xs bg-[#EFECE1] border border-[#E2DBD0] shadow-xs aspect-3/4 flex items-center justify-center p-3">
                                    <img
                                        src={slot4.imageUrl}
                                        alt={slot4.name}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover rounded-xs transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {renderCardOverlay(slot4, hoveredId === slot4.id)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Expanded Grid for additional artifacts */}
            {remainingArtifacts.length > 0 && (
                <div className="mt-12 pt-8 border-t border-[#E8E2D5]">
                    <h3 className="text-xl font-serif font-bold text-[#1A1816] mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#B09971]" />
                        <span>Koleksi Terkait Lainnya</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {remainingArtifacts.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => onSelectArtifact(item)}
                                onMouseEnter={() => setHoveredId(item.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                className="group cursor-pointer bg-[#F3EFE5] border border-[#E0D7C6] rounded-xs p-3 transition-all hover:shadow-md hover:bg-[#F8F5EC] relative overflow-hidden flex flex-col justify-between"
                            >
                                <div className="aspect-4/3 overflow-hidden rounded-xs bg-[#E8E2D5] mb-3 relative">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {renderCardOverlay(item, hoveredId === item.id)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom Center Button: LIHAT KOLEKSI LAINNYA */}
            {hasMore && (
                <div className="flex flex-col items-center justify-center my-10">
                    <button
                        onClick={onLoadMore}
                        className="px-8 py-2.5 rounded-full border border-[#2C2825] text-[#2C2825] font-semibold text-xs tracking-wider uppercase hover:bg-[#2C2825] hover:text-[#F8F5EC] transition-all cursor-pointer shadow-2xs"
                    >
                        LIHAT KOLEKSI LAINNYA
                    </button>
                </div>
            )}

            {/* Footer copyright */}
            <footer className="text-center text-xs text-[#6B635B] font-medium pt-4 pb-8 border-t border-[#E8E2D5] mt-8">
                © 2023 Museum Talaga Manggung. All rights reserved.
            </footer>
        </div>
    );
};
