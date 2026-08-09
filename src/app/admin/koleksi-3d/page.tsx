'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCMS, deleteKoleksi } from '@/lib/cms'
import { KoleksiList, KoleksiListSkeleton } from '@/components/admin/koleksi/KoleksiList'
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

  if (!hydrated) return <KoleksiListSkeleton />

  return (
    <KoleksiList
      items={[...data.koleksi].sort((a, b) => Number(Boolean(b.modelUrl)) - Number(Boolean(a.modelUrl)))}
      onNew={() => router.push('/admin/koleksi-3d/new')}
      onEdit={(slug) => router.push(`/admin/koleksi-3d/${slug}`)}
      onPreview={(slug) => window.open(`/koleksi/${slug}`, '_blank')}
      onDelete={async (slug) => {
        try { await deleteKoleksi(slug); toast('Artefak dihapus.', 'success') }
        catch (e) { toast('Gagal menghapus: ' + (e as Error).message, 'error') }
      }}
    />
  )
}
