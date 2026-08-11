'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCMS, deleteNaskah } from '@/lib/cms'
import { NaskahList, NaskahListSkeleton } from '@/components/admin/naskah/NaskahList'
import { toast } from '@/components/admin/Feedback'

export default function ArsipListPage() {
  const { data, hydrated } = useCMS()
  const router = useRouter()
  const searchParams = useSearchParams()

  // next.config.js redirects lama ?tab=naskah kesini tapi nyisain query-nya
  // (perilaku default Next.js redirects) — bersihin biar url-nya rapi.
  useEffect(() => {
    if (searchParams.has('tab')) router.replace('/admin/arsip')
  }, [searchParams, router])

  if (!hydrated) return <NaskahListSkeleton />

  return (
    <NaskahList
      items={data.naskah}
      onNew={() => router.push('/admin/arsip/new')}
      onEdit={(id) => router.push(`/admin/arsip/${id}`)}
      onDelete={async (id) => {
        try { await deleteNaskah(id); toast('Arsip dihapus.', 'success') }
        catch (e) { toast('Gagal menghapus: ' + (e as Error).message, 'error') }
      }}
    />
  )
}
