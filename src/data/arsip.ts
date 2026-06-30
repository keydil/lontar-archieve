// ============================================================
// ARSIP DATA — Textual archive entries (transcriptions/translations)
// Separate from koleksi.ts: this is the TEXT lens on an artifact,
// while koleksi.ts is the 3D OBJECT lens. Same physical item can
// appear in both, linked via relatedKoleksiSlug.
// ============================================================

export interface ArsipEntry {
  slug: string
  title: string
  script: string
  period: string
  excerpt: string
  transliteration: string
  translation_id: string
  translation_en: string
  provenance: string
  condition: string
  relatedKoleksiSlug?: string
}

export const arsipEntries: ArsipEntry[] = [
  {
    slug: 'lontar-kaganga-01',
    title: 'Naskah Kaganga Tanah Sunda',
    script: 'Aksara Kaganga',
    period: 'Abad ke-14',
    excerpt:
      'Fragmen teks keagamaan dan panduan kehidupan masyarakat Sunda, ditulis di atas daun lontar yang telah melalui proses pengawetan tradisional.',
    transliteration:
      'i-na-ka ha-yu ning ja-gat\nsu-nda bu-mi pa-ku-an\nwa-ru-ga si-ra sang hy-ang\npa-ma-na-hna ma-ngi-lang',
    translation_id:
      'Naskah ini memuat ajaran tentang keseimbangan hidup, ditulis oleh seorang resi pada masa peralihan kerajaan. Goresan aksara menunjukkan teknik ukir yang khas dari wilayah pegunungan selatan Priangan. Isi naskah menyinggung upacara agraria dan hubungan manusia dengan alam semesta dalam kepercayaan Sunda kuna.',
    translation_en:
      'This manuscript contains teachings on life balance, written by a sage during a kingdom transition period. The script strokes show carving techniques characteristic of the southern Priangan highland region. The text references agrarian ceremonies and the relationship between humans and the cosmos in ancient Sundanese belief.',
    provenance: 'Museum Talaga Manggung, Majalengka',
    condition: 'Baik (terlindungi dari kelembaban)',
    relatedKoleksiSlug: 'sepatu-koku', // update when lontar 3D model is ready
  },
]

export function getArsipBySlug(slug: string): ArsipEntry | undefined {
  return arsipEntries.find((a) => a.slug === slug)
}
