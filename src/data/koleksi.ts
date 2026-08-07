// ============================================================
// KOLEKSI DATA — artefak fisik Museum Talaga Manggung.
//
// FOTO dulu, 3D belakangan. Sebagian besar artefak baru punya foto
// (diambil langsung di museum, Juni 2026, lalu dirapikan dari katalog
// PDF). Model 3D hasil fotogrametri baru jadi untuk segelintir benda,
// jadi `modelUrl` sengaja dikosongkan sampai modelnya benar-benar
// siap — halaman detail otomatis menyesuaikan.
// ============================================================

// Galeri media — foto & video dokumentasi artefak.
// Model 3D TIDAK masuk sini; sumbernya cuma `modelUrl` di Artifact.
export interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  caption?: string
  thumbnail?: string  // gambar sampul untuk video (JPG/PNG)
}

export interface Artifact {
  slug: string
  name: string
  year: string
  type: string
  category: string   // kategori besar: 'Arca', 'Senjata Pusaka', 'Karya Seni', 'Senjata Berledak', 'Batu'
  material: string
  dimensions: string
  artist: string
  country: string
  address: string
  location: string   // lokasi penyimpanan di museum
  description_id: string
  description_en: string
  modelUrl?: string    // URL publik file .glb di Cloudflare R2 — kosong = belum ada 3D
  // Rotasi koreksi model 3D (derajat, urutan X/Y/Z). Tool scan yang beda
  // (KIRI Engine vs RealityScan) punya konvensi sumbu "atas" yang beda,
  // jadi satu rotasi bawaan gak selalu cocok buat semua model. Kosong =
  // pakai bawaan [-90, 0, 0].
  modelRotation?: [number, number, number]
  thumbnail?: string   // gambar kartu (JPG/PNG) untuk daftar koleksi
  media?: MediaItem[]  // galeri foto & video
}

// Bantu ringkas: bikin daftar MediaItem dari URL foto.
function fotos(slug: string, count: number, captions: string[] = []): MediaItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${slug}-m${i + 1}`,
    type: 'image' as const,
    url: `/images/koleksi/${slug}-${String(i + 1).padStart(2, '0')}.jpg`,
    caption: captions[i],
  }))
}

export const artifacts: Artifact[] = [
  // ── ARCA PERUNGGU ────────────────────────────────────────────
  {
    slug: 'raden-panglurah',
    name: 'Raden Panglurah',
    year: 'Abad ke-13 M',
    type: 'Arca Perunggu',
    category: 'Arca',
    material: 'Perunggu berlapis emas (croom)',
    dimensions: 'Tinggi 19 cm',
    artist: 'Pengrajin Kerajaan Talaga Manggung',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Pamer Utama',
    description_id: 'Patung perunggu berbentuk Buddha duduk melipat kaki dengan sikap Bhumisparsa Mudra. Dianggap merupakan sketsa dari wujud Raden Panglurah, salah satu tokoh penting di Kerajaan Talaga Manggung. Berlapis emas sebagai simbol keagungan.',
    description_en: 'Bronze statue of a seated Buddha in Bhumisparsa Mudra position, believed to represent Raden Panglurah, an important figure in the Talaga Manggung Kingdom. Gold-plated as a symbol of majesty.',
    thumbnail: '/images/koleksi/raden-panglurah-01.jpg',
    media: fotos('raden-panglurah', 1),
  },
  {
    slug: 'simbar-kancana',
    name: 'Simbar Kancana',
    year: 'Abad ke-13 M',
    type: 'Arca Perunggu',
    category: 'Arca',
    material: 'Perunggu berlapis emas (croom)',
    dimensions: 'Tinggi 36,8 cm',
    artist: 'Pengrajin Kerajaan Talaga Manggung',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Pamer Utama',
    description_id: 'Arca perunggu berbentuk Buddha berdiri tegak dengan sikap Abhaya Mudra (telapak tangan kanan lurus ke depan). Dipercaya merupakan representasi wujud Nyi Ratu Dewi Simbarkancana, Ratu Kerajaan Talaga Manggung. Merupakan salah satu arca perunggu paling penting di koleksi museum.',
    description_en: 'Standing bronze Buddha statue in Abhaya Mudra (right palm facing forward), believed to represent Nyi Ratu Dewi Simbarkancana, Queen of the Talaga Manggung Kingdom. One of the most important bronze statues in the museum collection.',
    thumbnail: '/images/koleksi/simbar-kancana-01.jpg',
    media: fotos('simbar-kancana', 1),
  },
  // ── KARYA SENI DAN BUDAYA ────────────────────────────────────
  {
    slug: 'cawan-zodiak-talaga',
    name: 'Cawan Zodiak Talaga',
    year: '± Abad ke-13 M',
    type: 'Cawan (Wadah Air Suci)',
    category: 'Karya Seni',
    material: 'Perunggu',
    dimensions: 'Tinggi 111 mm · Diameter atas 144 mm · Diameter bawah 133 mm',
    artist: 'Pengrajin Kerajaan Talaga Manggung',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Karya Seni & Budaya',
    description_id: 'Cawan / Prasen pelengkap ritual keagamaan khas Talaga sejak era Batara Gunung Bitung hingga pertengahan era Nyi Ratu Simbarkancana. Pada badan cawan terdapat relief 12 rasi bintang zodiak. Pada awal abad ke-19, Gubernur Jenderal Raffles mengirimkan faksimile naskah kuno terkait zodiak ini ke Tropenmuseum Belanda.',
    description_en: 'Sacred ritual vessel from the Talaga Kingdom, featuring 12 zodiac constellation reliefs on its body. In the early 19th century, Governor-General Raffles sent a facsimile of an ancient Talaga zodiac manuscript to the Tropenmuseum in the Netherlands.',
    thumbnail: '/images/koleksi/cawan-zodiak-talaga-01.jpg',
    media: fotos('cawan-zodiak-talaga', 1),
  },
  {
    slug: 'genta-teratai-buddha',
    name: 'Genta Teratai Buddha',
    year: 'Abad ke-13 — ke-14 M',
    type: 'Lonceng / Genta',
    category: 'Karya Seni',
    material: 'Perunggu',
    dimensions: 'Tinggi 152 mm · Diameter 90 mm',
    artist: 'Pengrajin Tibet / Tiongkok',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Karya Seni & Budaya',
    description_id: 'Genta pelengkap ritual keagamaan bergaya Tibet. Diperkirakan merupakan cendera mata dari raja, biksu, atau tamu negara Tibet yang berkunjung ke Talaga untuk mempelajari ajaran "Dang Upaka Sarwatiwada". Pernah difoto oleh Isidore Van Kinsbergen pada tahun 1856; fotonya kini tersimpan di Tropenmuseum Belanda.',
    description_en: 'Tibetan-style ritual bell, believed to be a gift from Tibetan royalty or monks who visited Talaga to study "Dang Upaka Sarwatiwada" teachings. Photographed by Isidore Van Kinsbergen in 1856; the photograph is now in the Tropenmuseum, Netherlands.',
    thumbnail: '/images/koleksi/genta-teratai-buddha-01.jpg',
    media: fotos('genta-teratai-buddha', 1),
    // modelUrl diisi lewat migrasi ke Cloudflare R2 (lihat
    // scripts/migrate-models-to-storage.mjs) — seed ini fallback doang.
    modelRotation: [-90, 0, 0],
  },
  {
    slug: 'genta-singha-talaga',
    name: 'Genta Singha Talaga',
    year: 'Abad ke-13 — ke-14 M',
    type: 'Lonceng / Genta',
    category: 'Karya Seni',
    material: 'Perunggu',
    dimensions: 'Tinggi 277 mm · Diameter 125 mm',
    artist: 'Pengrajin Tibet / Tiongkok',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Karya Seni & Budaya',
    description_id: 'Genta besar bergaya Tibet dengan motif Singha (singa). Seperti halnya Genta Teratai, genta ini merupakan peninggalan hubungan diplomatik Kerajaan Talaga dengan Tibet dan Tiongkok. Pernah didokumentasikan oleh Isidore Van Kinsbergen (1856) dan kini fotonya tersimpan di Tropenmuseum Belanda.',
    description_en: 'Large Tibetan-style bell with Singha (lion) motifs, a relic of diplomatic relations between the Talaga Kingdom and Tibet/China. Documented by Van Kinsbergen in 1856; photograph preserved at Tropenmuseum, Netherlands.',
    thumbnail: '/images/koleksi/genta-singha-talaga-01.jpg',
    media: fotos('genta-singha-talaga', 1),
    modelRotation: [-90, 0, 0],
  },
  {
    slug: 'terracotta-talaga',
    name: 'Terracotta Talaga Manggung',
    year: 'Abad ke-13 — ke-15 M',
    type: 'Terracotta',
    category: 'Karya Seni',
    material: 'Tanah Liat Bakar (Terracotta)',
    dimensions: 'Beragam',
    artist: 'Pengrajin Kerajaan Talaga',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Karya Seni & Budaya',
    description_id: 'Koleksi benda-benda terracotta dari Kerajaan Talaga Manggung, meliputi berbagai bentuk: peralatan rumah tangga, ornamen bangunan eksterior, dan benda seremonial. Dibuat dari tanah liat pilihan yang dibakar dengan teknik tradisional. Mencerminkan kekayaan seni kriya masyarakat Talaga.',
    description_en: 'Collection of terracotta artifacts from the Talaga Manggung Kingdom, including household items, exterior building ornaments, and ceremonial objects. Made from selected clay fired using traditional techniques, reflecting the rich craft heritage of Talaga society.',
    thumbnail: '/images/koleksi/terracotta-talaga-01.jpg',
    media: fotos('terracotta-talaga', 24),
  },
  {
    slug: 'mata-uang-gobog',
    name: 'Mata Uang Gobog',
    year: 'Abad ke-13 — ke-16 M',
    type: 'Mata Uang / Numismatik',
    category: 'Karya Seni',
    material: 'Perunggu / Tembaga',
    dimensions: 'Diameter beragam (koleksi)',
    artist: 'Pengaruh Tiongkok / Nusantara',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Karya Seni & Budaya',
    description_id: 'Kumpulan mata uang gobog — keping logam bundar berlubang persegi di tengahnya — yang beredar di Nusantara pada masa kerajaan. Selain sebagai alat tukar dalam perdagangan, gobog juga kerap dipakai sebagai perlengkapan upacara dan jimat. Keberadaannya di Talaga menunjukkan bahwa kerajaan ini terhubung dengan jaringan perdagangan antar-pulau maupun mancanegara.',
    description_en: 'A collection of gobog coins — round metal pieces with a square central hole — that circulated across the Nusantara during the kingdom era. Beyond their use as trade currency, gobog were also commonly used in ceremonies and as talismans. Their presence in Talaga shows the kingdom was linked to inter-island and overseas trade networks.',
    thumbnail: '/images/koleksi/mata-uang-gobog-01.jpg',
    media: fotos('mata-uang-gobog', 1, ['Kumpulan mata uang gobog koleksi museum']),
  },
  {
    slug: 'goong-renteng',
    name: 'Goong Renteng',
    year: 'Abad ke-16 M — sekarang',
    type: 'Gamelan / Alat Musik',
    category: 'Karya Seni',
    material: 'Perunggu, Rangka Kayu',
    dimensions: 'Satu perangkat (beberapa rancak)',
    artist: 'Pengrajin Gamelan Sunda',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Karya Seni & Budaya',
    description_id: 'Goong Renteng adalah salah satu bentuk gamelan tertua di Tatar Sunda. Perangkatnya terdiri atas deretan gong kecil (renteng) yang ditata pada rancak kayu, dilengkapi gong besar sebagai penanda irama. Digunakan untuk mengiringi upacara adat dan ritual keagamaan masyarakat Talaga, dan sampai kini masih dibunyikan pada perayaan tradisi tertentu.',
    description_en: 'Goong Renteng is one of the oldest gamelan forms in the Sundanese highlands. The ensemble consists of rows of small gongs (renteng) mounted on wooden racks, accompanied by large gongs that mark the rhythmic cycle. It accompanied traditional ceremonies and religious rituals of the Talaga community, and is still played during certain traditional celebrations today.',
    thumbnail: '/images/koleksi/goong-renteng-01.jpg',
    media: fotos('goong-renteng', 1, ['Perangkat Goong Renteng koleksi museum']),
    // modelUrl sengaja kosong — scan "panci_sakti.glb" mesh-nya bolong
    // (RealityScan gagal rekonstruksi sebagian permukaan), tunggu scan
    // ulang sebelum dipasang lagi.
  },
  // ── SENJATA PUSAKA ───────────────────────────────────────────
  {
    slug: 'keris-talaga',
    name: 'Keris Pusaka Talaga',
    year: 'Abad ke-14 — ke-16 M',
    type: 'Senjata Pusaka',
    category: 'Senjata Pusaka',
    material: 'Besi Pamor, Gagang Kayu & Tanduk',
    dimensions: 'Beragam (koleksi)',
    artist: 'Empu Kerajaan Talaga Manggung',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Senjata Pusaka (Landepan)',
    description_id: 'Koleksi keris pusaka peninggalan Kerajaan Talaga Manggung. Setiap keris memiliki pamor unik yang dipercaya mengandung kekuatan spiritual. Digunakan dalam upacara adat dan prosesi kerajaan. Hingga kini dirawat melalui tradisi Nyiramkeun yang diselenggarakan setiap akhir bulan Safar.',
    description_en: 'Collection of heirloom kris blades from the Talaga Manggung Kingdom. Each kris has a unique pamor pattern believed to carry spiritual power. Used in traditional ceremonies and royal processions. Still maintained through the Nyiramkeun ritual held every end of the month of Safar.',
    thumbnail: '/images/koleksi/keris-talaga-01.jpg',
    media: fotos('keris-talaga', 1, ['Beberapa bentuk keris koleksi Museum Talaga Manggung']),
  },
  {
    slug: 'kujang-talaga',
    name: 'Kujang Pusaka Talaga',
    year: 'Abad ke-13 — ke-16 M',
    type: 'Senjata Pusaka',
    category: 'Senjata Pusaka',
    material: 'Besi Pamor',
    dimensions: 'Beragam',
    artist: 'Empu Kerajaan Talaga Manggung',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Senjata Pusaka (Landepan)',
    description_id: 'Kujang adalah senjata khas Sunda yang sekaligus menjadi simbol identitas budaya. Koleksi kujang di Museum Talaga Manggung merupakan peninggalan langsung para Raja Talaga dan memiliki nilai historis yang tinggi. Bentuknya yang unik melambangkan kekuatan alam dan keseimbangan semesta.',
    description_en: 'The Kujang is the iconic Sundanese weapon and cultural identity symbol. The Kujang collection at Museum Talaga Manggung are direct heirlooms from the Talaga kings and hold high historical value. Its unique form symbolizes the power of nature and cosmic balance.',
    thumbnail: '/images/koleksi/kujang-talaga-01.jpg',
    media: fotos('kujang-talaga', 1),
  },
  {
    slug: 'tombak-talaga',
    name: 'Tombak Pusaka Talaga',
    year: 'Abad ke-13 — ke-16 M',
    type: 'Senjata Pusaka',
    category: 'Senjata Pusaka',
    material: 'Besi Pamor, Kayu Pilihan',
    dimensions: 'Beragam',
    artist: 'Empu Kerajaan Talaga Manggung',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Senjata Pusaka (Landepan)',
    description_id: 'Koleksi tombak pusaka peninggalan Kerajaan Talaga Manggung. Digunakan dalam pertempuran dan upacara adat kerajaan. Mata tombak terbuat dari besi pamor dengan tangkai kayu pilihan yang kuat dan tahan lama.',
    description_en: 'Collection of heirloom spears from the Talaga Manggung Kingdom, used in battle and royal ceremonies. The spearhead is made of pamor iron with a sturdy selected wood handle.',
    thumbnail: '/images/koleksi/tombak-talaga-01.jpg',
    media: fotos('tombak-talaga', 1),
  },
  {
    slug: 'golok-talaga',
    name: 'Golok Pusaka Talaga',
    year: 'Abad ke-14 — ke-17 M',
    type: 'Senjata Pusaka',
    category: 'Senjata Pusaka',
    material: 'Besi Tempa',
    dimensions: 'Beragam',
    artist: 'Empu Kerajaan Talaga Manggung',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Senjata Pusaka (Landepan)',
    description_id: 'Golok pusaka koleksi Museum Talaga Manggung. Senjata sehari-hari masyarakat Sunda yang juga digunakan dalam pertempuran. Beberapa golok dalam koleksi ini memiliki ukiran khas dan dianggap sebagai benda pusaka bertuah.',
    description_en: 'Heirloom machetes from Museum Talaga Manggung collection. An everyday weapon of Sundanese society also used in battle. Some blades in this collection feature unique carvings and are considered spiritually charged heirlooms.',
    thumbnail: '/images/koleksi/golok-talaga-01.jpg',
    media: fotos('golok-talaga', 2, [
      'Golok berhulu ukiran dengan sarung kayu terang',
      'Golok berhulu ukiran dengan sarung kayu gelap',
    ]),
  },
  {
    slug: 'baju-kere',
    name: 'Baju Kere (Zirah)',
    year: 'Abad ke-14 — ke-17 M',
    type: 'Baju Zirah',
    category: 'Senjata Pusaka',
    material: 'Lempeng Logam & Rantai Besi',
    dimensions: 'Ukuran badan dewasa',
    artist: 'Empu Kerajaan Talaga Manggung',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Senjata Pusaka (Landepan)',
    description_id: 'Baju Kere atau baju zirah adalah pelindung tubuh prajurit Kerajaan Talaga Manggung. Tersusun dari lempeng-lempeng logam yang dirangkai satu sama lain menggunakan anyaman rantai besi, sehingga tetap lentur saat dikenakan namun mampu menahan tebasan senjata tajam. Merupakan bukti kesiapan militer dan kemampuan metalurgi para empu Talaga.',
    description_en: 'The Baju Kere, or chain-and-plate armor, protected the warriors of the Talaga Manggung Kingdom. Metal plates are linked together with woven iron chainmail, keeping the garment flexible while resisting blade strikes — evidence of the kingdom\'s military readiness and the metallurgical skill of Talaga smiths.',
    thumbnail: '/images/koleksi/baju-kere-01.jpg',
    media: fotos('baju-kere', 2, [
      'Baju Kere / Zirah utuh — koleksi Museum Talaga Manggung',
      'Lempeng-lempeng zirah saat dibentangkan',
    ]),
  },
  // ── SENJATA BERLEDAK ─────────────────────────────────────────
  {
    slug: 'cetbang-talaga',
    name: 'Cetbang (Meriam Kecil)',
    year: 'Abad ke-14 — ke-16 M',
    type: 'Senjata Berledak',
    category: 'Senjata Berledak',
    material: 'Perunggu / Besi Cor',
    dimensions: 'Beragam',
    artist: 'Pengrajin Kerajaan / Pengaruh Tiongkok',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Senjata',
    description_id: 'Cetbang adalah meriam kecil yang digunakan armada Nusantara pada abad pertengahan. Koleksi cetbang Museum Talaga Manggung mencerminkan kekuatan militer dan jaringan perdagangan kerajaan yang menghubungkan Talaga dengan dunia luar.',
    description_en: 'Cetbang are small cannons used by Nusantaran fleets in the medieval period. The cetbang collection at Museum Talaga Manggung reflects the military strength and trade networks connecting Talaga to the outside world.',
    thumbnail: '/images/koleksi/cetbang-talaga-01.jpg',
    media: fotos('cetbang-talaga', 5),
  },
  {
    slug: 'bedil-dorlok',
    name: 'Arquebush (Bedil Dorlok)',
    year: 'Abad ke-16 — ke-17 M',
    type: 'Senjata Berledak',
    category: 'Senjata Berledak',
    material: 'Besi Tempa, Kayu',
    dimensions: 'Beragam',
    artist: 'Pengaruh Portugis / Eropa',
    country: 'Indonesia',
    address: 'Museum Talaga Manggung, Majalengka',
    location: 'Ruang Senjata',
    description_id: 'Senapan sulut (Arquebush / Bedil Dorlok) merupakan senjata api awal yang masuk ke Nusantara melalui pengaruh Portugis. Keberadaannya di koleksi Talaga Manggung menunjukkan keterlibatan kerajaan dalam jaringan perdagangan dan konflik militer abad ke-16 dan ke-17.',
    description_en: 'The Arquebush (matchlock musket) was an early firearm introduced to the Nusantara through Portuguese influence. Its presence in the Talaga Manggung collection indicates the kingdom\'s involvement in 16th–17th century trade and military networks.',
    thumbnail: '/images/koleksi/bedil-dorlok-01.jpg',
    media: fotos('bedil-dorlok', 2),
  },
  // ── BATU BERSEJARAH ──────────────────────────────────────────
  {
    slug: 'batu-lingga-yoni',
    name: 'Batu Lingga Yoni',
    year: 'Abad ke-12 — ke-14 M',
    type: 'Batu Bersejarah',
    category: 'Batu',
    material: 'Batu Andesit',
    dimensions: 'Beragam',
    artist: 'Pengrajin Hindu-Sunda',
    country: 'Indonesia',
    address: 'Halaman Museum Talaga Manggung, Majalengka',
    location: 'Halaman Depan Museum',
    description_id: 'Batu Lingga Yoni merupakan simbol kesuburan dan kekuatan kosmis dalam kepercayaan Hindu-Sunda. Terdapat di halaman depan Museum Talaga Manggung bersama Batu Palungguhan. Menjadi saksi bisu era pra-Islam di Kerajaan Talaga.',
    description_en: 'Lingga Yoni stone symbolizes fertility and cosmic power in Hindu-Sundanese belief. Located in the front yard of Museum Talaga Manggung alongside the Palungguhan Stone. A silent witness to the pre-Islamic era of the Talaga Kingdom.',
    thumbnail: '/images/koleksi/batu-lingga-yoni-01.jpg',
    media: fotos('batu-lingga-yoni', 1, ['Batu Lingga di halaman Museum Talaga Manggung']),
  },
  {
    slug: 'batu-palungguhan',
    name: 'Batu Pentasbih / Palungguhan',
    year: 'Abad ke-12 — ke-14 M',
    type: 'Batu Bersejarah',
    category: 'Batu',
    material: 'Batu Andesit',
    dimensions: 'Beragam',
    artist: 'Pengrajin Kerajaan Talaga',
    country: 'Indonesia',
    address: 'Halaman Museum Talaga Manggung, Majalengka',
    location: 'Halaman Depan Museum',
    description_id: 'Batu Palungguhan adalah altar tempat penobatan Raja dan Putra Mahkota Kerajaan Talaga Manggung. Merupakan salah satu peninggalan paling sakral yang tersimpan di halaman depan museum. Menjadi bukti nyata tradisi penobatan kerajaan yang penuh keagungan.',
    description_en: 'The Palungguhan Stone is the coronation altar for the King and Crown Prince of the Talaga Manggung Kingdom. One of the most sacred relics in the museum\'s front yard, serving as tangible evidence of the kingdom\'s grand coronation traditions.',
    thumbnail: '/images/koleksi/batu-palungguhan-01.jpg',
    media: fotos('batu-palungguhan', 1, ['Batu Palungguhan di halaman Museum Talaga Manggung']),
  },
]

export function getArtifactBySlug(slug: string): Artifact | undefined {
  return artifacts.find((a) => a.slug === slug)
}
