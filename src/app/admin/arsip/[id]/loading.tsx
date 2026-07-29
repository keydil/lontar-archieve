import { Skeleton } from '@/components/admin/AdminUI'

export default function Loading() {
  return (
    <div>
      <Skeleton width="220px" height="32px" style={{ marginBottom: '1.5rem' }} />
      <Skeleton width="100%" height="320px" style={{ borderRadius: '10px' }} />
    </div>
  )
}
