'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCMS, upsertNaskah } from '@/lib/cms'
import NaskahEditor from '@/components/admin/NaskahEditor'
import { toast, confirmDialog } from '@/components/admin/Feedback'
import { setEditorDirty, getEditorDirty } from '@/components/admin/editorDirtyStore'
import { ListViewSkeleton } from '@/components/admin/AdminViews'

const mono = "'DM Mono', monospace"

export default function ArsipEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data, hydrated } = useCMS()

  if (!hydrated) return <ListViewSkeleton />

  const found = data.naskah.find((n) => n.id === params.id)
  if (!found) {
    return (
      <div>
        <p style={{ fontFamily: mono, fontSize: '15px', color: 'var(--warm)', marginBottom: '1rem' }}>
          Arsip dengan id "{params.id}" tidak ditemukan.
        </p>
        <Link href="/admin/arsip" style={{ fontFamily: mono, fontSize: '13px', color: 'var(--charcoal)', textDecoration: 'underline' }}>
          ← Kembali ke Arsip
        </Link>
      </div>
    )
  }

  async function handleCancel() {
    if (getEditorDirty()) {
      const ok = await confirmDialog(
        'Ada perubahan yang belum disimpan. Kalau batal sekarang, perubahan itu akan hilang.',
        { danger: true, confirmLabel: 'Ya, Buang Perubahan' }
      )
      if (!ok) return
    }
    router.push('/admin/arsip')
  }

  return (
    <NaskahEditor
      key={found.id}
      initial={found}
      onDirtyChange={setEditorDirty}
      onCancel={handleCancel}
      onSave={async (n) => {
        try {
          await upsertNaskah(n)
          setEditorDirty(false)
          toast('Arsip tersimpan.', 'success')
          router.push('/admin/arsip')
        } catch (e) {
          toast('Gagal menyimpan: ' + (e as Error).message, 'error')
        }
      }}
    />
  )
}
