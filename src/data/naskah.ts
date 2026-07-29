// ============================================================
// NASKAH DATA — Reading texts (transkripsi interaktif per ayat)
//
// Ini adalah "lensa teks bacaan" dari sebuah lontar: 1 Naskah =
// 1 Buku, terdiri dari beberapa Lembar/Halaman. Tiap lembar punya
// foto scan-nya sendiri + ayat-ayat yang ditranskripsi dari lembar
// itu (aksara, latin, terjemah, makna, catatan filologi). Diisi
// oleh ahli lewat Panel Admin (/admin) — bukan lagi hardcode di
// file ini.
//
// Seed di bawah dipakai sebagai data awal. Begitu ahli menyimpan
// lewat admin, data tersimpan di Supabase & dipakai situs.
// ============================================================

export interface LontarWord {
  id: string
  aksara: string       // Aksara asli (Aksara Sunda / lontar)
  latin: string        // Latinisasi / transliterasi
  terjemah: string     // Terjemah per kata
  kelas?: string       // Kelas kata: 'kata kerja' | 'kata benda' | dst
}

export interface LontarVerse {
  id: string
  verseNumber: number     // nomor ayat — berurutan untuk SATU BUKU (lintas lembar)
  words: LontarWord[]
  terjemahVerse: string   // Terjemah ayat lengkap
  makna?: string          // Makna / tafsir (opsional)
  catatan?: string        // Catatan filologi (opsional)
}

export interface LontarLembar {
  id: string
  lembarNumber: number    // urutan halaman/lembar dalam buku
  scanImage?: string      // foto scan daun lontar untuk lembar ini
  verses: LontarVerse[]   // ayat-ayat yang ditranskripsi dari lembar ini
}

export interface LontarNaskah {
  id: string
  title: string
  sumber: string
  tahun: string
  aksaraType?: string     // mis. "Aksara Sunda Kuno"
  coverImage?: string     // gambar sampul (data URL / path)
  sinopsis?: string       // deskripsi singkat naskah
  published?: boolean     // tampil di publik atau masih draft
  finalized?: boolean     // true = struktur (jumlah lembar & ayat) terkunci; isi teks tetap bisa diedit
  lembar: LontarLembar[]
}

// ============================================================
// SEED DATA — data contoh awal (Carita Parahyangan)
// ============================================================
export const naskahSeed: LontarNaskah[] = [
  {
    id: 'carita-parahyangan-001',
    title: 'Carita Parahyangan',
    sumber: 'Koleksi Pribadi — Arsip Lontar Sunda',
    tahun: 'Abad ke-16 M',
    aksaraType: 'Aksara Sunda Kuno',
    published: true,
    finalized: true,
    coverImage: '/images/carita-parahyangan.jpg',
    sinopsis: 'Carita Parahyangan adalah salah satu naskah kuno Sunda terpenting yang berisi sejarah kerajaan Sunda dan Galuh, menceritakan silsilah serta peristiwa politik dan keagamaan masa lampau.',
    lembar: [
      {
        id: 'carita-parahyangan-001-l1',
        lembarNumber: 1,
        verses: [
          {
            id: 'v1',
            verseNumber: 1,
            words: [
              { id: 'v1w1', aksara: 'ᮃᮓᮤ', latin: 'Adi', terjemah: 'Permulaan / Awal', kelas: 'kata benda' },
              { id: 'v1w2', aksara: 'ᮊᮤᮒ', latin: 'ning', terjemah: 'dari / milik', kelas: 'kata depan' },
              { id: 'v1w3', aksara: 'ᮘᮥᮙᮤ', latin: 'bumi', terjemah: 'bumi / tanah', kelas: 'kata benda' },
              { id: 'v1w4', aksara: 'ᮞᮥᮔ᮪ᮓ', latin: 'Sunda', terjemah: 'Sunda (nama wilayah)', kelas: 'nama diri' },
            ],
            terjemahVerse: 'Permulaan dari bumi Sunda.',
            makna: 'Kalimat pembuka ini menegaskan bahwa kisah yang akan diceritakan berakar dari tanah Sunda — bukan sekadar lokasi geografis, melainkan identitas peradaban yang akan diuraikan sepanjang naskah.',
            catatan: 'Kata "Adi" dalam konteks naskah Sunda kuno sering bermakna ganda: permulaan waktu sekaligus kemuliaan asal-usul.',
          },
          {
            id: 'v2',
            verseNumber: 2,
            words: [
              { id: 'v2w1', aksara: 'ᮞᮤ', latin: 'Si', terjemah: 'Sang / Si (penanda subjek)', kelas: 'partikel' },
              { id: 'v2w2', aksara: 'ᮛᮏ', latin: 'Raja', terjemah: 'Raja / Pemimpin', kelas: 'kata benda' },
              { id: 'v2w3', aksara: 'ᮙᮥᮜᮤᮃ', latin: 'mulia', terjemah: 'mulia / terhormat', kelas: 'kata sifat' },
              { id: 'v2w4', aksara: 'ᮘᮥᮜᮔ᮪', latin: 'bulana', terjemah: 'bulannya / pada masanya', kelas: 'kata benda' },
            ],
            terjemahVerse: 'Sang Raja yang mulia pada masanya.',
            catatan: 'Frasa "bulana" merujuk pada era pemerintahan, bukan bulan kalender.',
          },
          {
            id: 'v3',
            verseNumber: 3,
            words: [
              { id: 'v3w1', aksara: 'ᮙᮔ᮪ᮓᮜ᮪', latin: 'Mandal', terjemah: 'Menetapkan / Menentukan', kelas: 'kata kerja' },
              { id: 'v3w2', aksara: 'ᮊᮥ', latin: 'ku', terjemah: 'oleh / dengan', kelas: 'kata depan' },
              { id: 'v3w3', aksara: 'ᮠᮥᮊᮥᮙ᮪', latin: 'hukum', terjemah: 'hukum / aturan', kelas: 'kata benda' },
              { id: 'v3w4', aksara: 'ᮃᮓᮒ᮪', latin: 'adat', terjemah: 'adat / tradisi', kelas: 'kata benda' },
              { id: 'v3w5', aksara: 'ᮜᮊ᮪ᮞᮔ', latin: 'laksana', terjemah: 'yang dijalankan / sesuai', kelas: 'kata kerja' },
            ],
            terjemahVerse: 'Menetapkan tatanan dengan hukum adat yang dijalankan.',
            makna: 'Ayat ini menggambarkan fondasi pemerintahan Sunda kuno yang bersandar pada hukum adat — bukan kekuasaan semata, melainkan legitimasi yang datang dari tradisi leluhur yang hidup di tengah masyarakat.',
            catatan: 'Kombinasi "hukum adat laksana" adalah frasa baku dalam naskah-naskah Sunda abad ke-15 hingga ke-17 yang menandai sistem yurisprudensi adat.',
          },
        ],
      },
    ],
  },
  {
    id: 'sanghyang-siksa-002',
    title: 'Sanghyang Siksa Kandang Karesian',
    sumber: 'Koleksi Museum Sri Baduga',
    tahun: '1518 M',
    aksaraType: 'Aksara Sunda Kuno',
    published: true,
    finalized: true,
    coverImage: '/images/sanghyang-siksa.jpg',
    sinopsis: 'Naskah didaktis berisi pedoman moral, aturan bermasyarakat, serta pengetahuan ensiklopedis mengenai budaya Sunda di abad ke-16.',
    lembar: [
      {
        id: 'sanghyang-siksa-002-l1',
        lembarNumber: 1,
        verses: [
          {
            id: 'v1',
            verseNumber: 1,
            words: [
              { id: 'v1w1', aksara: 'ᮞᮀᮠᮡᮀ', latin: 'Sanghyang', terjemah: 'Yang Suci', kelas: 'kata sifat' },
              { id: 'v1w2', aksara: 'ᮞᮤᮊ᮪ᮞ', latin: 'Siksa', terjemah: 'Ajaran', kelas: 'kata benda' },
            ],
            terjemahVerse: 'Ajaran suci bagi pandita.',
          },
        ],
      },
    ],
  },
  {
    id: 'bujangga-manik-003',
    title: 'Bujangga Manik',
    sumber: 'Koleksi Bodleian Library',
    tahun: 'Abad ke-15 M',
    aksaraType: 'Aksara Sunda Kuno',
    published: true,
    finalized: true,
    coverImage: '/images/bujangga-manik.jpg',
    sinopsis: 'Kisah perjalanan (itinerari) seorang resi peziarah dari Kerajaan Sunda yang mengelilingi pulau Jawa hingga Bali.',
    lembar: [
      {
        id: 'bujangga-manik-003-l1',
        lembarNumber: 1,
        verses: [
          {
            id: 'v1',
            verseNumber: 1,
            words: [
              { id: 'v1w1', aksara: 'ᮘᮥᮏᮀᮌ', latin: 'Bujangga', terjemah: 'Bujangga / Resi', kelas: 'kata benda' },
              { id: 'v1w2', aksara: 'ᮙᮔᮤᮊ᮪', latin: 'Manik', terjemah: 'Manik (Permata)', kelas: 'nama diri' },
            ],
            terjemahVerse: 'Bujangga Manik memulai perjalanannya.',
          },
        ],
      },
    ],
  },
]
