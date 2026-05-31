// ============================================================
// KOLEKSI DATA — Seed data for the collection system
// Each artifact maps to a .glb model in /public/models/[slug].glb
// ============================================================

export interface Hotspot {
  id: string
  label: string
  description_id: string
  description_en: string
  // Normalized position on the model (x, y, z) — adjust per model
  position: [number, number, number]
}

export interface Artifact {
  slug: string
  name: string
  year: string
  type: string
  material: string
  dimensions: string
  artist: string
  country: string
  address: string
  description_id: string
  description_en: string
  hotspots: Hotspot[]
}

export const artifacts: Artifact[] = [
  {
    slug: 'sepatu-koku',
    name: 'Sepatu Boots Koku',
    year: '2024',
    type: 'Footwear',
    material: 'Genuine Leather',
    dimensions: '30 × 12 × 20 cm',
    artist: 'Demo Scan',
    country: 'Indonesia',
    address: 'Lab Digitalisasi, Bandung',
    description_id:
      'Objek demo scan pertama menggunakan Kiri Engine photogrammetry. Sepatu boots kulit asli dengan detail jahitan tangan dan sol karet tebal. Dipindai secara 3D untuk menguji pipeline digitalisasi artefak berbasis video scanning.',
    description_en:
      'First demo scan object using Kiri Engine photogrammetry. Genuine leather boots with hand-stitched details and thick rubber sole. 3D-scanned to test the video-based artifact digitization pipeline.',
    hotspots: [
      {
        id: 'hs-1',
        label: 'Tekstur Kulit',
        description_id: 'Permukaan kulit asli dengan pori-pori alami yang terlihat jelas.',
        description_en: 'Genuine leather surface with visible natural pores.',
        position: [0.5, 0.3, 0.5],
      },
      {
        id: 'hs-2',
        label: 'Lubang Tali',
        description_id: 'Lubang tali berbahan logam yang dipasang sebelum proses finishing.',
        description_en: 'Metal eyelets installed before the finishing process.',
        position: [0, 0.8, 0.3],
      },
      {
        id: 'hs-3',
        label: 'Sol Karet',
        description_id: 'Sol karet tebal dengan pola grip untuk traksi maksimal.',
        description_en: 'Thick rubber sole with grip pattern for maximum traction.',
        position: [0, -0.5, 0],
      },
    ],
  },
  {
    slug: 'daun-lontar-01',
    name: 'Naskah Lontar Sunda Kuno',
    year: 'Abad ke-14',
    type: 'Manuscript',
    material: 'Lontar Leaf',
    dimensions: '30 × 5 × 0.3 cm',
    artist: 'Unknown',
    country: 'Indonesia',
    address: 'Museum Nasional, Jakarta',
    description_id:
      'Naskah kuno aksara Kaganga dari tanah Sunda. Ditulis di atas daun lontar yang telah melalui proses pengawetan tradisional, naskah ini mengandung fragmen teks keagamaan dan panduan kehidupan masyarakat Sunda pada abad ke-14 Masehi.',
    description_en:
      'Ancient Kaganga script manuscript from Sunda. Written on lontar leaves that underwent traditional preservation, this manuscript contains fragments of religious texts and guidelines for Sundanese society in the 14th century CE.',
    hotspots: [
      {
        id: 'hs-1',
        label: 'Aksara Kaganga',
        description_id: 'Goresan aksara Sunda kuno yang diukir menggunakan pisau pengukir.',
        description_en: 'Ancient Sundanese script carved using a stylus knife.',
        position: [0, 0, 0.2],
      },
      {
        id: 'hs-2',
        label: 'Lubang Pengikat',
        description_id: 'Lubang tali pengikat yang menyatukan kumpulan daun lontar.',
        description_en: 'Binding hole that holds the lontar leaf bundle together.',
        position: [-1.2, 0, 0],
      },
      {
        id: 'hs-3',
        label: 'Tepi Daun',
        description_id: 'Tepi daun yang dipotong rata, menunjukkan teknik persiapan tradisional.',
        description_en: 'Evenly cut leaf edge, showing traditional preparation technique.',
        position: [1.5, 0, 0],
      },
    ],
  },
]

export function getArtifactBySlug(slug: string): Artifact | undefined {
  return artifacts.find((a) => a.slug === slug)
}
