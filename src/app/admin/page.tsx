'use client'

import { useCMS } from '@/lib/cms'
import { Dashboard, DashboardSkeleton } from '@/components/admin/AdminViews'

export default function AdminDashboardPage() {
  const { data, hydrated } = useCMS()
  if (!hydrated) return <DashboardSkeleton />
  return <Dashboard data={data} />
}
