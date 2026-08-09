import type { Metadata } from 'next'
import './globals.css'
import { ClientMusicWrapper } from '@/components/ClientMusicWrapper'
import { getSiteSettingsServer } from '@/lib/settings-server'

// Refresh dari Supabase tiap jam — biar perubahan di panel admin SEO
// gak nunggu deploy ulang buat kepakai (halaman-halaman ini statis).
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsServer()
  return {
    title: settings.siteTitle,
    description: settings.siteDescription,
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettingsServer()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Museum',
    name: settings.orgName,
    description: settings.orgDescription,
    url: 'https://museumtalagamanggung.com',
  }

  return (
    <html lang="id">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ClientMusicWrapper>
          {children}
        </ClientMusicWrapper>
      </body>
    </html>
  )
}
