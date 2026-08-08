import React from 'react';
import { motion } from 'framer-motion';

interface FireflyProps {
    count?: number;
}

export const FireflyIndicator: React.FC<FireflyProps> = ({ count = 9 }) => {
    // Generate subtle golden firefly particles with soft floating trajectories
    const particles = React.useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            // Distribute particles subtly across the tab width
            x: (i - (count - 1) / 2) * 20 + (i % 2 === 0 ? 4 : -4),
            y: (i % 3) * 4 - 5,
            delay: i * 0.3,
            duration: 2.8 + (i % 4) * 0.5,
            size: i % 3 === 0 ? 'w-1 h-1' : i % 2 === 0 ? 'w-1.5 h-1.5' : 'w-1 h-1',
            opacityPeak: 0.75 + (i % 3) * 0.1,
        }));
    }, [count]);

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-10">
            {/* Soft warm golden ambient glow behind active tab */}
            <motion.div
                layoutId="activeGlowBg"
                className="absolute inset-x-1 -inset-y-1 rounded-full bg-[#D4AF37]/10 blur-sm -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />

            {/* Subtle Floating Golden Particles */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                        x: [p.x - 4, p.x + 5, p.x - 3, p.x],
                        y: [p.y - 3, p.y - 8, p.y + 2, p.y],
                        opacity: [0.1, p.opacityPeak, 0.25, p.opacityPeak * 0.8, 0.1],
                        scale: [0.7, 1.1, 0.8, 1.2, 0.7],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                        delay: p.delay,
                    }}
                >
                    {/* Subtle Particle Dot */}
                    <div className="relative">
                        <div className={`absolute inset-0 rounded-full bg-[#E6C200] blur-[1px] opacity-60 ${p.size}`} />
                        <div className={`relative rounded-full bg-[#FFF8CC] shadow-[0_0_4px_1px_#D4AF37] ${p.size}`} />
                    </div>
                </motion.div>
            ))}

            {/* Thin, subtle golden underline */}
            <motion.div
                layoutId="activeTabUnderline"
                className="absolute -bottom-1 left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-[#C5A86A] to-transparent rounded-full shadow-[0_0_6px_#D4AF37]"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
        </div>
    );
};



