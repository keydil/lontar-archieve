'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCMS, upsertKoleksi } from '@/lib/cms'
import KoleksiEditor from '@/components/admin/KoleksiEditor'
import { toast, confirmDialog } from '@/components/admin/Feedback'
import { setEditorDirty, getEditorDirty } from '@/components/admin/editorDirtyStore'
import { ListViewSkeleton } from '@/components/admin/AdminViews'

const mono = "'DM Mono', monospace"

export default function Koleksi3DEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data, hydrated } = useCMS()

  if (!hydrated) return <ListViewSkeleton />

  const found = data.koleksi.find((k) => k.slug === params.id)
  if (!found) {
    return (
      <div>
        <p style={{ fontFamily: mono, fontSize: '15px', color: 'var(--warm)', marginBottom: '1rem' }}>
          Artefak dengan slug "{params.id}" tidak ditemukan.
        </p>
        <Link href="/admin/koleksi-3d" style={{ fontFamily: mono, fontSize: '13px', color: 'var(--charcoal)', textDecoration: 'underline' }}>
          ← Kembali ke Koleksi
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
    router.push('/admin/koleksi-3d')
  }

  return (
    <KoleksiEditor
      key={found.slug}
      initial={found}
      isNew={false}
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
