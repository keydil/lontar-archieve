'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertKoleksi } from '@/lib/cms'
import KoleksiEditor, { blankKoleksi } from '@/components/admin/KoleksiEditor'
import { toast, confirmDialog } from '@/components/admin/Feedback'
import { setEditorDirty, getEditorDirty } from '@/components/admin/editorDirtyStore'

export default function Koleksi3DNewPage() {
  const router = useRouter()
  const [initial] = useState(() => blankKoleksi())

  async function handleCancel() {
    if (getEditorDirty()) {
      const ok = await confirmDialog(
        'Ada perubahan yang belum disimpan. Kalau batal sekarang, perubahan itu akan hilang.',
        { danger: true, confirmLabel: 'Ya, Buang Perubahan' }
      )
      if (!ok) return
    }
    router.push('/admin/koleksi-3d')
  }

  return (
    <KoleksiEditor
      initial={initial}
      isNew
      onDirtyChange={setEditorDirty}
      onCancel={handleCancel}
      onSave={async (a) => {
        try {
          await upsertKoleksi(a)
          setEditorDirty(false)
          toast('Artefak tersimpan.', 'success')
          router.push('/admin/koleksi-3d')
        } catch (e) {
          toast('Gagal menyimpan: ' + (e as Error).message, 'error')
        }
      }}
    />
  )
}
