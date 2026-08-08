import React from 'react';

export const BackgroundOrnaments: React.FC = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#F5EFE3]">
            {/* Museum Vintage Parchment Gradient Background */}
            <div
                className="absolute inset-0 opacity-95"
                style={{
                    background: 'radial-gradient(circle at 50% 35%, #FAF6EE 0%, #EFE5D3 60%, #E2D3B8 100%)'
                }}
            />

            {/* Soft Aged Paper Texture Noise Filter */}
            <svg className="absolute inset-0 w-full h-full opacity-15 mix-blend-multiply pointer-events-none">
                <filter id="parchmentTexture">
                    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" result="noise" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0  0 0.95 0 0 0  0 0 0.85 0 0  0 0 0 0.15 0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#parchmentTexture)" />
            </svg>

            {/* SVG Definitions for Side Border Ornaments (Extending 1/3 Along Height) */}
            <svg className="hidden">
                <defs>
                    <g id="side-border-ornament" fill="none" stroke="#78664D">
                        {/* Main Long Vertical Spine Line along the outer margin */}
                        <path
                            d="M 280,0 C 270,80 250,180 230,280 C 210,380 180,480 140,580 C 120,620 90,660 0,700"
                            strokeWidth="2"
                            strokeLinecap="round"
                            opacity="0.85"
                        />
                        <path
                            d="M 280,30 C 265,100 245,190 225,285 C 205,380 175,475 135,570 C 115,610 85,650 0,690"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            opacity="0.6"
                        />

                        {/* ==================== UPPER SECTION (TOP 1/3 EDGE) ==================== */}
                        {/* Top Corner Crown Volute */}
                        <path
                            d="M 280,0 C 240,20 200,45 210,80 C 220,110 250,100 240,75 C 230,55 210,65 220,80"
                            fill="#78664D"
                            fillOpacity="0.1"
                            strokeWidth="1.3"
                        />

                        {/* Upper Leaf Lobe Cluster 1 */}
                        <path
                            d="M 260,110 C 220,95 180,120 175,155 C 170,185 200,195 220,175 C 240,155 235,130 260,110 Z"
                            fill="#78664D"
                            fillOpacity="0.1"
                            strokeWidth="1.2"
                        />
                        <path d="M 260,110 Q 200,150 220,175" strokeWidth="0.8" opacity="0.6" />
                        <circle cx="220" cy="175" r="3" fill="#78664D" stroke="none" opacity="0.8" />

                        {/* ==================== MIDDLE SECTION (EXTENDING DOWN THE SIDE) ==================== */}
                        {/* Middle Wave Lobe Cluster 2 */}
                        <path
                            d="M 240,240 C 195,225 155,250 150,290 C 145,325 180,335 200,310 C 220,285 215,260 240,240 Z"
                            fill="#78664D"
                            fillOpacity="0.1"
                            strokeWidth="1.3"
                        />
                        <path d="M 240,240 Q 175,285 200,310" strokeWidth="0.8" opacity="0.6" />
                        <circle cx="200" cy="310" r="3" fill="#78664D" stroke="none" opacity="0.8" />

                        {/* Sub-spiral Tendril Branching Inward */}
                        <path
                            d="M 150,290 C 120,280 100,305 110,330 C 120,350 145,340 135,320"
                            strokeWidth="1.1"
                            opacity="0.75"
                        />

                        {/* ==================== LOWER SECTION (TAPERED FLOWING TAIL) ==================== */}
                        {/* Lower Wave Lobe Cluster 3 */}
                        <path
                            d="M 210,390 C 165,380 125,410 120,450 C 115,485 150,495 170,470 C 190,445 185,415 210,390 Z"
                            fill="#78664D"
                            fillOpacity="0.09"
                            strokeWidth="1.2"
                        />
                        <path d="M 210,390 Q 145,445 170,470" strokeWidth="0.8" opacity="0.6" />

                        {/* Final Tapering Leaf Curl */}
                        <path
                            d="M 170,510 C 130,500 95,530 90,565 C 85,595 115,605 130,585 C 145,565 140,535 170,510 Z"
                            fill="#78664D"
                            fillOpacity="0.08"
                            strokeWidth="1.1"
                        />

                        {/* Delicate Isen-Isen Accent Dots Along Side Edge */}
                        <circle cx="245" cy="50" r="2.5" fill="#78664D" opacity="0.75" stroke="none" />
                        <circle cx="215" cy="130" r="2.5" fill="#78664D" opacity="0.75" stroke="none" />
                        <circle cx="185" cy="220" r="2.5" fill="#78664D" opacity="0.75" stroke="none" />
                        <circle cx="155" cy="360" r="2.5" fill="#78664D" opacity="0.75" stroke="none" />
                        <circle cx="125" cy="490" r="2.5" fill="#78664D" opacity="0.75" stroke="none" />
                        <circle cx="75" cy="620" r="2" fill="#78664D" opacity="0.6" stroke="none" />
                    </g>
                </defs>
            </svg>

            {/* ========================================================= */}
            {/* 1. SISI KANAN ATAS (PANJANG 1/3 LAYAR DARI ATAS KE BAWAH) */}
            {/* ========================================================= */}
            <div className="absolute top-0 right-0 h-[55vh] sm:h-[65vh] w-48 sm:w-80 md:w-96 pointer-events-none opacity-85 drop-shadow-sm">
                <svg viewBox="0 0 280 700" className="w-full h-full preserve-3d transform scale-x-[-1]" preserveAspectRatio="none">
                    <use href="#side-border-ornament" />
                </svg>
            </div>

            {/* ========================================================= */}
            {/* 2. SISI KIRI BAWAH (PANJANG 1/3 LAYAR DARI BAWAH KE ATAS) */}
            {/* ========================================================= */}
            <div className="absolute bottom-10 left-0 h-[55vh] sm:h-[65vh] w-48 sm:w-80 md:w-96 pointer-events-none opacity-85 drop-shadow-sm">
                <svg viewBox="0 0 280 700" className="w-full h-full preserve-3d transform scale-y-[-1]" preserveAspectRatio="none">
                    <use href="#side-border-ornament" />
                </svg>
            </div>

            {/* ========================================================= */}
            {/* 3. FOOTER (SISI BAWAH BORDER & EMBLEM KERATAAN)           */}
            {/* ========================================================= */}
            <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-14 text-[#78664D] flex items-center justify-between px-3 sm:px-8 pointer-events-none opacity-85">
                {/* Left Decorative Gold Line */}
                <div className="flex-1 h-[1.5px] bg-gradient-to-r from-transparent via-[#78664D]/40 to-[#78664D]/80 relative flex items-center">
                    <div className="absolute right-0 w-2 h-2 rounded-full bg-[#78664D]/60" />
                </div>

                {/* Center Royal Crest Medallion */}
                <div className="px-3 sm:px-6 flex items-center gap-2 text-[#78664D]">
                    <svg viewBox="0 0 240 32" fill="none" className="w-48 h-7 sm:w-64 sm:h-9" stroke="currentColor">
                        {/* Horizontal Line Stems */}
                        <path d="M 0,16 L 45,16 M 195,16 L 240,16" strokeWidth="1.2" strokeLinecap="round" />

                        {/* Central Royal Emblem */}
                        <g transform="translate(120, 16)">
                            <polygon
                                points="0,-12 4,-4 12,0 4,4 0,12 -4,4 -12,0 -4,-4"
                                fill="currentColor"
                                fillOpacity="0.25"
                                strokeWidth="1"
                            />
                            <circle cx="0" cy="0" r="12" fill="currentColor" fillOpacity="0.1" strokeWidth="1.2" />
                            <circle cx="0" cy="0" r="15" strokeWidth="0.8" strokeDasharray="2 2" />
                            <circle cx="0" cy="0" r="3.5" fill="currentColor" stroke="none" />

                            {/* Flanking Curved Wing Petals */}
                            <path d="M -36,0 C -26,-10 -18,-4 -14,0 C -18,4 -26,10 -36,0 Z" fill="currentColor" fillOpacity="0.2" strokeWidth="1" />
                            <path d="M 36,0 C 26,-10 18,-4 14,0 C 18,4 26,10 36,0 Z" fill="currentColor" fillOpacity="0.2" strokeWidth="1" />

                            <circle cx="-42" cy="0" r="2" fill="currentColor" stroke="none" />
                            <circle cx="42" cy="0" r="2" fill="currentColor" stroke="none" />
                        </g>
                    </svg>
                </div>

                {/* Right Decorative Gold Line */}
                <div className="flex-1 h-[1.5px] bg-gradient-to-l from-transparent via-[#78664D]/40 to-[#78664D]/80 relative flex items-center">
                    <div className="absolute left-0 w-2 h-2 rounded-full bg-[#78664D]/60" />
                </div>
            </div>
        </div>
    );
};
