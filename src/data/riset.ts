// ============================================================
// RISET DATA — Team info + research publications
// ============================================================

export interface TeamMember {
  nama: string
  peran: string
}

export interface Team {
  nama: string
  deskripsi: string
  anggota: TeamMember[]
}

export interface Publikasi {
  slug: string
  title: string
  date: string
  category: string
  author: string
  summary: string
  content: string // paragraphs separated by \n\n
}

export const teams: Team[] = [
  {
    nama: 'Tim Riset',
    deskripsi:
      'Bertanggung jawab atas identifikasi, transkripsi, dan kontekstualisasi historis seluruh naskah dalam koleksi digital ini.',
    anggota: [
      { nama: 'Dr. Siti Rahayu', peran: 'Ahli Filologi Sunda' },
      { nama: 'Ahmad Fauzi, M.Hum', peran: 'Peneliti Aksara Nusantara' },
    ],
  },
  {
    nama: 'Tim Lapangan',
    deskripsi:
      'Menjalankan akuisisi data 3D langsung di lokasi museum dan situs arkeologi menggunakan kamera DSLR dan perangkat lunak fotogrametri.',
    anggota: [
      { nama: 'Fadhil', peran: 'Operator Fotogrametri & Web Dev' },
      { nama: 'Koordinator Museum', peran: 'Liaison & Akses Artefak' },
    ],
  },
]

export const publikasi: Publikasi[] = [
  {
    slug: 'metodologi-fotogrametri',
    title: 'Fotogrametri untuk Artefak Rapuh',
    date: 'Juni 2026',
    category: 'Metodologi',
    author: 'Tim Digitalisasi',
    summary:
      'Pendekatan non-invasif dalam mendigitalkan naskah lontar tanpa kontak fisik langsung, menggunakan kombinasi photogrammetry dan structured light scanning.',
    content: `Proses digitalisasi artefak yang rapuh seperti naskah lontar memerlukan pendekatan yang sangat berhati-hati. Metode fotogrametri yang kami terapkan menggunakan 80–120 foto per artefak dari berbagai sudut, yang kemudian diproses untuk menghasilkan model tiga dimensi berpresisi tinggi.

Kamera yang digunakan adalah Nikon D7100 dengan lensa 35mm prime pada aperture f/8, menghasilkan resolusi 6000×4000 piksel per frame. Pencahayaan studio menggunakan dua lampu payung difus dari sudut 45° kiri dan kanan untuk meminimalkan bayangan keras yang dapat mengganggu proses rekonstruksi geometri.

Hasil model 3D kemudian dikompresi menggunakan algoritma Draco dari Google sebelum diintegrasikan ke dalam antarmuka web berbasis React Three Fiber, memungkinkan akses interaktif oleh publik tanpa memerlukan perangkat lunak khusus.`,
  },
  {
    slug: 'tipologi-aksara-kaganga',
    title: 'Tipologi Aksara Kaganga di Jawa Barat',
    date: 'Mei 2026',
    category: 'Linguistik',
    author: 'Tim Riset',
    summary:
      'Studi komparatif variasi bentuk aksara Kaganga dari lima situs penemuan naskah lontar di wilayah Priangan.',
    content: `Aksara Kaganga merupakan sistem tulisan yang digunakan dalam naskah-naskah kuno Sunda, memiliki kemiripan dengan aksara Pallawa dari India Selatan yang masuk ke Nusantara melalui jalur perdagangan abad ke-4 hingga ke-7 Masehi.

Penelitian ini membandingkan variasi morfologi huruf dari lima koleksi naskah lontar yang ditemukan di kawasan Priangan: Ciamis, Majalengka, Tasikmalaya, Garut, dan Sumedang. Setiap lokasi menunjukkan karakteristik regional yang unik, khususnya pada bentuk huruf konsonan nasal dan vokal panjang.

Temuan awal menunjukkan adanya dua aliran besar gaya penulisan: aliran barat yang lebih tegak dan geometris, serta aliran timur yang lebih melengkung dan organik. Perbedaan ini kemungkinan besar mencerminkan perbedaan tradisi guru-murid dalam pewarisan ilmu tulis di masing-masing daerah.`,
  },
]

export function getTeamByName(nama: string): Team | undefined {
  return teams.find((t) => t.nama === nama)
}

export function getPublikasiBySlug(slug: string): Publikasi | undefined {
  return publikasi.find((p) => p.slug === slug)
}
