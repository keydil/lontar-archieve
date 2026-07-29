// Navigasi utama situs — sumber tunggal agar konsisten di semua halaman.
export interface NavItem {
  label: string
  href: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Koleksi', href: '/koleksi' },
  { label: 'Arsip', href: '/arsip' },
]

// Navigasi sidebar Panel Admin — sumber tunggal buat layout + link.
export interface AdminNavItem {
  id: 'dashboard' | 'arsip' | 'koleksi' | 'backup'
  label: string
  href: string
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin' },
  { id: 'arsip', label: 'Arsip', href: '/admin/arsip' },
  { id: 'koleksi', label: 'Koleksi 3D', href: '/admin/koleksi-3d' },
  { id: 'backup', label: 'Data & Backup', href: '/admin/backup' },
]
