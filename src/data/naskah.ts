// ============================================================
// NASKAH DATA — Reading texts (transkripsi interaktif per ayat)
//
// Ini adalah "lensa teks bacaan" dari sebuah lontar: dibagi
// per-ayat, per-kata, lengkap dengan aksara, latin, terjemah,
// makna, dan catatan filologi. Diisi oleh ahli lewat Panel Admin
// (/admin) — bukan lagi hardcode di file ini.
//
// Seed di bawah dipakai sebagai data awal. Begitu ahli menyimpan
// lewat admin, data tersimpan di localStorage & dipakai situs.
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
  verseNumber: number
  words: LontarWord[]
  terjemahVerse: string   // Terjemah ayat lengkap
  makna?: string          // Makna / tafsir (opsional)
  catatan?: string        // Catatan filologi (opsional)
}

export interface LontarNaskah {
  id: string
  title: string
  sumber: string
  tahun: string
  aksaraType?: string     // mis. "Aksara Sunda Kuno"
  coverImage?: string     // gambar sampul (data URL / path)
  scanImages?: string[]   // foto scan daun lontar (data URL / path)
  published?: boolean     // tampil di publik atau masih draft
  verses: LontarVerse[]
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
    coverImage: '/images/carita-parahyangan.jpg',
    scanImages: [],
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
]
