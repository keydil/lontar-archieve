'use client'

import dynamic from 'next/dynamic'
import { MusicProvider } from './MusicPlayer'

const MusicToggle = dynamic(() => import('./MusicPlayer'), { ssr: false })

export function ClientMusicWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MusicProvider>
      {children}
      <MusicToggle />
    </MusicProvider>
  )
}
