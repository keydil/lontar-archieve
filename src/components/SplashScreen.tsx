'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'

// ─── Warrior silhouette SVGs (Nusantara-inspired) ───
const WarriorGatotkaca = () => (
  <svg viewBox="0 0 200 400" fill="currentColor" className="splash-warrior warrior-1">
    {/* Gatotkaca-inspired flying warrior */}
    <path d="M100 20 L120 60 L140 50 L130 90 L160 100 L130 120 L150 160 L120 150 L110 190 L100 170 L90 190 L80 150 L50 160 L70 120 L40 100 L70 90 L60 50 L80 60 Z" />
    {/* Cape flowing */}
    <path d="M70 120 Q40 200 30 280 Q50 260 70 300 Q60 240 80 200 Z" opacity="0.7" />
    <path d="M130 120 Q160 200 170 280 Q150 260 130 300 Q140 240 120 200 Z" opacity="0.7" />
    {/* Body */}
    <rect x="85" y="190" width="30" height="80" rx="5" />
    {/* Legs */}
    <path d="M85 270 L75 350 L85 355 L95 280 Z" />
    <path d="M115 270 L125 350 L115 355 L105 280 Z" />
    {/* Arms */}
    <path d="M85 200 L45 230 L50 240 L90 215 Z" />
    <path d="M115 200 L155 210 L160 220 L120 215 Z" />
    {/* Crown/Mahkota */}
    <path d="M80 25 L100 5 L120 25 L115 30 L100 15 L85 30 Z" />
  </svg>
)

const WarriorArjuna = () => (
  <svg viewBox="0 0 200 400" fill="currentColor" className="splash-warrior warrior-2">
    {/* Arjuna-inspired archer warrior */}
    <circle cx="100" cy="40" r="20" />
    {/* Crown */}
    <path d="M80 25 L90 10 L100 20 L110 10 L120 25 Z" />
    {/* Body */}
    <path d="M80 60 L75 180 L125 180 L120 60 Z" />
    {/* Bow arm extended */}
    <path d="M75 80 L20 120 L15 115 L18 110 L70 75 Z" />
    {/* Arrow arm */}
    <path d="M125 90 L180 70 L185 65 L190 68 L130 85 Z" />
    {/* Bow */}
    <path d="M20 60 Q5 120 20 180" fill="none" stroke="currentColor" strokeWidth="3" />
    {/* Arrow */}
    <line x1="20" y1="120" x2="190" y2="67" stroke="currentColor" strokeWidth="2" />
    {/* Legs in dynamic pose */}
    <path d="M85 180 L60 300 L70 310 L95 200 Z" />
    <path d="M115 180 L140 280 L150 270 L120 195 Z" />
    {/* Cloth/Kain */}
    <path d="M75 160 Q50 220 60 280 Q70 250 75 200 Z" opacity="0.6" />
  </svg>
)

const WarriorBima = () => (
  <svg viewBox="0 0 200 400" fill="currentColor" className="splash-warrior warrior-3">
    {/* Bima-inspired powerful warrior with gada (mace) */}
    <circle cx="100" cy="45" r="25" />
    {/* Headband */}
    <rect x="75" y="35" width="50" height="8" rx="4" />
    {/* Muscular body */}
    <path d="M70 70 L65 200 L135 200 L130 70 Z" />
    {/* Right arm holding gada overhead */}
    <path d="M130 85 L170 50 L175 55 L135 95 Z" />
    {/* Gada (mace) */}
    <rect x="165" y="20" width="12" height="60" rx="4" />
    <circle cx="171" cy="15" r="14" />
    {/* Left arm */}
    <path d="M70 100 L30 140 L35 150 L75 115 Z" />
    {/* Legs — powerful stance */}
    <path d="M80 200 L55 330 L70 335 L100 210 Z" />
    <path d="M120 200 L145 330 L130 335 L100 210 Z" />
    {/* Kain batik */}
    <path d="M65 180 Q45 250 55 320 Q65 280 70 230 Z" opacity="0.5" />
    <path d="M135 180 Q155 250 145 320 Q135 280 130 230 Z" opacity="0.5" />
  </svg>
)

const WarriorSrikandi = () => (
  <svg viewBox="0 0 200 400" fill="currentColor" className="splash-warrior warrior-4">
    {/* Srikandi-inspired female warrior */}
    <circle cx="100" cy="35" r="18" />
    {/* Hair flowing */}
    <path d="M82 30 Q60 60 55 120 Q65 100 75 50 Z" opacity="0.6" />
    <path d="M118 30 Q140 60 145 120 Q135 100 125 50 Z" opacity="0.6" />
    {/* Crown/tiara */}
    <path d="M85 20 L95 8 L100 15 L105 8 L115 20 Z" />
    {/* Slim body */}
    <path d="M82 53 L78 180 L122 180 L118 53 Z" />
    {/* Spear arm */}
    <path d="M118 70 L160 40 L165 45 L125 80 Z" />
    {/* Spear */}
    <line x1="160" y1="40" x2="185" y2="10" stroke="currentColor" strokeWidth="3" />
    <polygon points="185,5 195,10 185,15" />
    {/* Shield arm */}
    <path d="M82 80 L50 100 L55 110 L85 95 Z" />
    {/* Small shield */}
    <ellipse cx="45" cy="105" rx="15" ry="20" opacity="0.8" />
    {/* Legs */}
    <path d="M88 180 L75 310 L85 315 L100 195 Z" />
    <path d="M112 180 L125 310 L115 315 L100 195 Z" />
  </svg>
)

// ─── Particle Component ───
function Particles({ count = 60 }: { count?: number }) {
  return (
    <div className="splash-particles">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="splash-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${1 + Math.random() * 3}px`,
            height: `${1 + Math.random() * 3}px`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${3 + Math.random() * 5}s`,
            opacity: 0.2 + Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  )
}

// ─── Main Splash Component ───
interface SplashScreenProps {
  onEnter: () => void
}

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const [showEnter, setShowEnter] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // Init audio
  useEffect(() => {
    const audio = new Audio('/music/tarawangsa.mp3')
    audio.loop = true
    audio.volume = 0.6
    audioRef.current = audio

    // Auto-play on any user interaction (browser policy)
    const tryPlay = () => {
      audio.play().then(() => {
        setAudioReady(true)
      }).catch(() => {
        // Will try again on next interaction
      })
    }

    // Try immediately
    tryPlay()

    // Also try on first click/touch
    const handleInteraction = () => {
      if (!audioReady) tryPlay()
    }
    document.addEventListener('click', handleInteraction, { once: true })
    document.addEventListener('touchstart', handleInteraction, { once: true })

    return () => {
      audio.pause()
      audio.src = ''
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [])

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      // If audio hasn't started, start it
      if (!audioReady) {
        audioRef.current.play().then(() => {
          setAudioReady(true)
          setIsMuted(false)
        }).catch(() => {})
        return
      }
      audioRef.current.muted = !audioRef.current.muted
      setIsMuted(!isMuted)
    }
  }, [isMuted, audioReady])

  // GSAP Timeline — cinematic storyboard
  useEffect(() => {
    if (!containerRef.current) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tlRef.current = tl

    // Phase 1: Dark void → fog reveal
    tl.set('.splash-fog-layer', { opacity: 0 })
    tl.set('.splash-warrior', { opacity: 0, scale: 0.3 })
    tl.set('.splash-title-line', { opacity: 0, y: 80 })
    tl.set('.splash-subtitle', { opacity: 0, y: 30 })
    tl.set('.splash-enter-btn', { opacity: 0, scale: 0.8 })
    tl.set('.splash-kicker', { opacity: 0, y: 20 })
    tl.set('.splash-ground-line', { scaleX: 0 })

    // Phase 2: Fog rises
    tl.to('.splash-fog-layer', { opacity: 0.4, duration: 1.5 }, 0.3)

    // Phase 3: Warriors descend from sky — stagger
    tl.to('.warrior-1', {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.2,
      ease: 'power4.out',
    }, 0.8)

    tl.to('.warrior-2', {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.2,
      ease: 'power4.out',
    }, 1.2)

    tl.to('.warrior-3', {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.2,
      ease: 'power4.out',
    }, 1.0)

    tl.to('.warrior-4', {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.2,
      ease: 'power4.out',
    }, 1.4)

    // Phase 4: Warriors float/hover animation
    tl.to('.warrior-1', {
      y: -30,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    }, 2.0)

    tl.to('.warrior-2', {
      y: -20,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    }, 2.2)

    tl.to('.warrior-3', {
      y: -25,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    }, 2.1)

    tl.to('.warrior-4', {
      y: -15,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    }, 2.3)

    // Phase 5: Ground line sweeps in
    tl.to('.splash-ground-line', {
      scaleX: 1,
      duration: 1,
      ease: 'power2.inOut',
    }, 2.2)

    // Phase 6: Title reveal — epic
    tl.to('.splash-kicker', {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, 2.5)

    tl.to('.splash-title-line', {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.2,
    }, 2.8)

    tl.to('.splash-subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, 3.5)

    // Phase 7: Enter button appears
    tl.to('.splash-enter-btn', {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(1.7)',
      onComplete: () => setShowEnter(true),
    }, 4.0)

    return () => {
      tl.kill()
    }
  }, [])

  // Handle enter — cinematic exit
  const handleEnter = useCallback(() => {
    if (isExiting) return
    setIsExiting(true)

    // Fade out audio
    if (audioRef.current) {
      const fadeAudio = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0.05) {
          audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.05)
        } else {
          clearInterval(fadeAudio)
          audioRef.current?.pause()
        }
      }, 50)
    }

    // Exit animation
    const exitTl = gsap.timeline({
      onComplete: () => onEnter(),
    })

    // Warriors fly upward and vanish
    exitTl.to('.splash-warrior', {
      y: -300,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.in',
    })

    // Everything fades
    exitTl.to('.splash-title-line, .splash-subtitle, .splash-kicker, .splash-enter-btn, .splash-ground-line', {
      opacity: 0,
      y: -30,
      duration: 0.5,
      stagger: 0.05,
    }, 0.2)

    // White flash
    exitTl.to(containerRef.current, {
      backgroundColor: 'var(--bone)',
      duration: 0.6,
      ease: 'power2.in',
    }, 0.6)

    exitTl.to(containerRef.current, {
      opacity: 0,
      duration: 0.4,
    }, 1.0)
  }, [isExiting, onEnter])

  return (
    <div ref={containerRef} className="splash-container">
      {/* Background layers */}
      <div className="splash-bg" />
      <div className="splash-fog-layer" />
      <Particles count={70} />

      {/* Radial glow behind warriors */}
      <div className="splash-glow" />

      {/* Warriors group */}
      <div className="splash-warriors-group">
        <WarriorGatotkaca />
        <WarriorArjuna />
        <WarriorBima />
        <WarriorSrikandi />
      </div>

      {/* Ground line */}
      <div className="splash-ground-line" />

      {/* Title area */}
      <div className="splash-center-text">
        <p className="splash-kicker">Digital Archive — Naskah Daun Lontar</p>
        <h1>
          <span className="splash-title-line">Warisan</span>
          <span className="splash-title-line splash-title-italic">Peradaban</span>
          <span className="splash-title-line">Nusantara</span>
        </h1>
        <p className="splash-subtitle">
          Jelajahi manuskrip kuno yang terukir di atas daun lontar — jendela menuju masa lalu yang agung.
        </p>

        {/* Enter button */}
        <button
          className="splash-enter-btn"
          onClick={handleEnter}
          disabled={isExiting}
        >
          <span className="splash-enter-line" />
          <span>Masuki Arsip</span>
          <span className="splash-enter-line" />
        </button>
      </div>

      {/* Music toggle */}
      <button
        className="splash-music-toggle"
        onClick={toggleMute}
        title={isMuted ? 'Nyalakan musik' : 'Matikan musik'}
      >
        <div className="splash-music-icon">
          {isMuted || !audioReady ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M19.07 4.93a10 10 0 010 14.14" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
            </svg>
          )}
        </div>
        <span className="splash-music-label">
          {isMuted || !audioReady ? 'SOUND OFF' : 'TARAWANGSA'}
        </span>
      </button>

      {/* Bottom corner decoration */}
      <div className="splash-corner-decor splash-corner-bl">
        <span>ARSIP LONTAR</span>
        <span>—</span>
        <span>v0.3</span>
      </div>

      <div className="splash-corner-decor splash-corner-br">
        <span>PROTOTYPE</span>
        <span>—</span>
        <span>2025</span>
      </div>
    </div>
  )
}
