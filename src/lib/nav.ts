// Navigasi utama situs — sumber tunggal agar konsisten di semua halaman.
export interface NavItem {
  label: string
  href: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Koleksi', href: '/koleksi' },
  { label: 'Arsip', href: '/arsip' },
  { label: 'Baca', href: '/baca' },
]
