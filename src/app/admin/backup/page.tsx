'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTab } from '@/components/admin/AdminViews'

export default function AdminBackupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // next.config.js redirects lama ?tab=data kesini tapi nyisain query-nya
  // (perilaku default Next.js redirects) — bersihin biar url-nya rapi.
  useEffect(() => {
    if (searchParams.has('tab')) router.replace('/admin/backup')
  }, [searchParams, router])

  return <DataTab />
}
