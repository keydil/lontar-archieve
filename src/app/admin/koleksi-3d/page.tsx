'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCMS, deleteKoleksi } from '@/lib/cms'
import { ListView, ListViewSkeleton } from '@/components/admin/AdminViews'
import { toast } from '@/components/admin/Feedback'

export default function Koleksi3DListPage() {
  const { data, hydrated } = useCMS()
  const router = useRouter()
  const searchParams = useSearchParams()

  // next.config.js redirects lama ?tab=koleksi kesini tapi nyisain query-nya
  // (perilaku default Next.js redirects) — bersihin biar url-nya rapi.
  useEffect(() => {
    if (searchParams.has('tab')) router.replace('/admin/koleksi-3d')
  }, [searchParams, router])

  if (!hydrated) return <ListViewSkeleton />

  return (
    <ListView
      title="Koleksi"
      desc="Artefak museum beserta foto & videonya. Tampil di halaman Koleksi."
      items={data.koleksi.map((k) => ({
        key: k.slug,
        primary: k.name,
        secondary: `${k.type} · ${k.year} · ${k.media?.length ?? 0} media`,
        thumb: k.thumbnail,
      }))}
      onNew={() => router.push('/admin/koleksi-3d/new')}
      onEdit={(key) => router.push(`/admin/koleksi-3d/${key}`)}
      onDelete={async (key) => {
        try { await deleteKoleksi(key); toast('Artefak dihapus.', 'success') }
        catch (e) { toast('Gagal menghapus: ' + (e as Error).message, 'error') }
      }}
    />
  )
}
