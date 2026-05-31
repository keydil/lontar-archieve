import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Arsip Naskah Lontar — Digital Archive',
  description: 'Digitalisasi dan pelestarian naskah-naskah kuno yang tertulis di atas daun lontar — artefak tak ternilai dari peradaban Nusantara.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
