import React, { useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { MaterialType } from './types';
import { FireflyIndicator } from './FireflyIndicator';

interface NavbarProps {
    activeTab: 'artefak' | 'naskah';
    setActiveTab: (tab: 'artefak' | 'naskah') => void;
    selectedCategory: MaterialType;
    setSelectedCategory: (cat: MaterialType) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onPortalUtamaClick?: () => void;
    categoriesList?: string[];
}

export const Navbar: React.FC<NavbarProps> = ({
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    onPortalUtamaClick,
    categoriesList,
}) => {
    const categories: MaterialType[] = categoriesList && categoriesList.length > 0
        ? ['Semua', ...categoriesList]
        : ['Semua', 'Emas', 'Kayu', 'Keramik', 'Perak', 'Logam'];

    // Kasih jeda sekejap biar keliatan responnya sebelum browser beneran
    // pindah ke portal eksternal — tanpa jeda, klik-nya berasa "diem aja".
    const [navigatingToPortal, setNavigatingToPortal] = useState(false);
    const handlePortalClick = () => {
        if (navigatingToPortal) return;
        setNavigatingToPortal(true);
        setTimeout(() => {
            (onPortalUtamaClick || (() => { window.location.href = 'https://museumtalagamanggung.com' }))();
        }, 220);
    };

    return (
        <header className="w-full max-w-4xl mx-auto px-4 pt-4 sm:pt-6 pb-4 flex flex-col items-center relative z-20">
            {/* Top Header Row with Portal Utama & Museum Logo */}
            <div className="w-full relative flex flex-col sm:flex-row items-center justify-center mb-6 md:mb-8">
                {/* Left: Portal Utama */}
                <div className="w-full sm:w-auto flex justify-start sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2 mb-3 sm:mb-0">
                    <button
                        onClick={handlePortalClick}
                        disabled={navigatingToPortal}
                        className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-white/80 hover:bg-white border border-[#C5A86A]/40 text-[#2C2825] hover:text-[#B08C42] text-xs sm:text-sm font-serif font-semibold shadow-sm transition-all group cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                    >
                        <ArrowLeft
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B08C42] transition-transform ${navigatingToPortal ? '-translate-x-1 animate-pulse' : 'group-hover:-translate-x-1'
                                }`}
                        />
                        <span>{navigatingToPortal ? 'Membuka Portal…' : 'Portal Utama'}</span>
                    </button>
                </div>

                {/* Center Emblem & Museum Title replaced with official logo */}
                <div className="flex items-center justify-center gap-2.5 sm:gap-3 text-center">
                    <a href="https://museumtalagamanggung.com" className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/images/logo-museum.png"
                            alt="Museum Talaga Manggung"
                            className="h-14 sm:h-14 md:h-16 w-auto object-contain filter drop-shadow-sm"
                        />
                    </a>
                </div>
            </div>

            {/* 2. Main Navigation Tabs */}
            <div className="w-full flex items-center justify-center gap-6 sm:gap-10 md:gap-14 mb-5 sm:mb-6 text-center px-2">
                <button
                    onClick={() => setActiveTab('artefak')}
                    className={`relative px-4 py-2 text-base sm:text-xl md:text-2xl font-serif tracking-wide transition-all cursor-pointer whitespace-nowrap ${activeTab === 'artefak'
                            ? 'text-[#8A6D3B] font-bold drop-shadow-sm'
                            : 'text-[#2C2825] font-semibold hover:text-[#B08C42]'
                        }`}
                >
                    {activeTab === 'artefak' && <FireflyIndicator count={8} />}
                    <span className="relative z-10">KOLEKSI ARTEFAK</span>
                </button>

                <button
                    onClick={() => setActiveTab('naskah')}
                    className={`relative px-4 py-2 text-base sm:text-xl md:text-2xl font-serif tracking-wide transition-all cursor-pointer whitespace-nowrap ${activeTab === 'naskah'
                            ? 'text-[#8A6D3B] font-bold drop-shadow-sm'
                            : 'text-[#2C2825] font-semibold hover:text-[#B08C42]'
                        }`}
                >
                    {activeTab === 'naskah' && <FireflyIndicator count={8} />}
                    <span className="relative z-10">ARSIP NASKAH</span>
                </button>
            </div>

            {/* 3. Wide Full Search Bar */}
            <div className="relative w-full max-w-2xl mb-4 sm:mb-5">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari Koleksi atau Naskah..."
                    className="w-full bg-white/90 backdrop-blur-sm border border-[#E0D7C8] rounded-md py-2.5 pl-10 sm:pl-11 pr-4 sm:pr-5 text-xs sm:text-sm md:text-base text-[#2C2825] placeholder-[#A0988A] outline-none focus:border-[#B08C42] focus:ring-1 focus:ring-[#B08C42]/30 transition-all shadow-sm"
                />
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#B0A798] absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* 4. Filter Pills — scroll horizontal di mobile (bukan wrap
                berbaris-baris) biar gak makan tinggi layar, wrap-center
                lagi begitu layarnya cukup lebar */}
            {activeTab === 'artefak' && (
                <div className="w-full flex items-center gap-1.5 sm:gap-2 overflow-x-auto sm:flex-wrap sm:justify-center sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {categories.map((cat) => {
                        const isSelected = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${isSelected
                                        ? 'bg-[#E5D2A8] text-[#2A2316] font-bold border border-[#C5A86A] shadow-sm'
                                        : 'bg-[#ECE5D6]/90 text-[#4A433A] hover:bg-[#E0D7C4]'
                                    }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            )}
        </header>
    );
};
