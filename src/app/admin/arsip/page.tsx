'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCMS, deleteNaskah } from '@/lib/cms'
import { ListView, ListViewSkeleton } from '@/components/admin/AdminViews'
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

  if (!hydrated) return <ListViewSkeleton />

  return (
    <ListView
      title="Arsip"
      desc="Teks bacaan interaktif per-ayat (aksara, latin, terjemah, makna). Ini yang tampil di halaman Arsip."
      items={data.naskah.map((n) => ({
        key: n.id,
        primary: n.title || '(tanpa judul)',
        secondary: `${n.aksaraType ?? ''} · ${n.lembar.length} lembar · ${n.lembar.reduce((sum, l) => sum + l.verses.length, 0)} ayat${n.finalized ? ' · TERKUNCI' : ''}${n.published === false ? ' · DRAFT' : ''}`,
        thumb: n.coverImage,
      }))}
      onNew={() => router.push('/admin/arsip/new')}
      onEdit={(key) => router.push(`/admin/arsip/${key}`)}
      onDelete={async (key) => {
        try { await deleteNaskah(key); toast('Arsip dihapus.', 'success') }
        catch (e) { toast('Gagal menghapus: ' + (e as Error).message, 'error') }
      }}
    />
  )
}
