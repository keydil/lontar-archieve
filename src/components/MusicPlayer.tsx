'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react'

// ─── Context ───
interface MusicContextType {
  isMuted: boolean
  isPlaying: boolean
  toggleMute: () => void
  startMusic: () => void
}

const MusicContext = createContext<MusicContextType>({
  isMuted: false,
  isPlaying: false,
  toggleMute: () => {},
  startMusic: () => {},
})

export const useMusic = () => useContext(MusicContext)

// ─── Provider ───
export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Init audio once
  useEffect(() => {
    const audio = new Audio('/music/tarawangsa.mp3')
    audio.loop = true
    audio.volume = 0.6
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  const startMusic = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {})
    }
  }, [isPlaying])

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return

    // If not playing yet, start it
    if (!isPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
        setIsMuted(false)
      }).catch(() => {})
      return
    }

    audioRef.current.muted = !audioRef.current.muted
    setIsMuted(!isMuted)
  }, [isMuted, isPlaying])

  return (
    <MusicContext.Provider value={{ isMuted, isPlaying, toggleMute, startMusic }}>
      {children}
    </MusicContext.Provider>
  )
}

// ─── Floating Toggle Button (visible on all pages) ───
export default function MusicToggle() {
  const { isMuted, isPlaying, toggleMute } = useMusic()

  return (
    <button
      className="music-toggle-global"
      onClick={toggleMute}
      title={isMuted ? 'Nyalakan musik' : 'Matikan musik'}
    >
      <div className="music-toggle-icon">
        {isMuted || !isPlaying ? (
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
      <span className="music-toggle-label">
        {isMuted || !isPlaying ? 'SOUND OFF' : 'TARAWANGSA'}
      </span>
      {isPlaying && !isMuted && (
        <div className="music-bars">
          <span className="music-bar" />
          <span className="music-bar" />
          <span className="music-bar" />
        </div>
      )}
    </button>
  )
}
