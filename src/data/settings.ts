// Pengaturan SEO situs — meta title/description & identitas organisasi
// buat schema.org. Dipakai server-side (generateMetadata di layout.tsx,
// baca-doang) dan client-side (form admin, baca+tulis).
export interface SiteSettings {
  siteTitle: string
  siteDescription: string
  orgName: string
  orgDescription: string
}

export const defaultSettings: SiteSettings = {
  siteTitle: 'Arsip Naskah Lontar — Digital Archive',
  siteDescription:
    'Digitalisasi dan pelestarian naskah-naskah kuno yang tertulis di atas daun lontar — artefak tak ternilai dari peradaban Nusantara.',
  orgName: 'Museum Talaga Manggung',
  orgDescription:
    'Museum yang menyimpan koleksi artefak dan naskah kuno Kerajaan Talaga Manggung, Majalengka, Jawa Barat.',
}
