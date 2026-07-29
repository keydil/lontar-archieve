'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertNaskah } from '@/lib/cms'
import NaskahEditor, { blankNaskah } from '@/components/admin/NaskahEditor'
import { toast, confirmDialog } from '@/components/admin/Feedback'
import { setEditorDirty, getEditorDirty } from '@/components/admin/editorDirtyStore'

export default function ArsipNewPage() {
  const router = useRouter()
  const [initial] = useState(() => blankNaskah())

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
      initial={initial}
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
