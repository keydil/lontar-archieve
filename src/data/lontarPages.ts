// ============================================================
// LONTAR PAGES DATA
// 
// CARA INPUT DATA ASLI NANTI:
// 1. Buka foto scan di tool anotasi (atau built-in admin nanti)
// 2. Ukuran koordinat pakai persentase (%) dari lebar/tinggi gambar
//    supaya responsive di semua layar
// 3. x, y = pojok kiri atas area kata (dalam %)
// 4. w, h = lebar & tinggi area kata (dalam %)
//
// FASE SELANJUTNYA:
// - Opsi manual: admin klik foto → drag area → input terjemah
// - Opsi ML: model aksara Sunda deteksi otomatis posisi kata
// ============================================================

export interface WordAnnotation {
  id: string
  aksara: string          // Teks aksara asli
  latin: string           // Latinisasi/transliterasi
  terjemah: string        // Terjemah per kata
  kelas?: string          // Kelas kata
  // Koordinat dalam persen (%) relatif terhadap ukuran gambar
  x: number               // left %
  y: number               // top %
  w: number               // width %
  h: number               // height %
}

export interface PhraseAnnotation {
  id: string
  words: string[]         // Array of WordAnnotation ids
  terjemah: string        // Terjemah frasa/kalimat
  makna?: string          // Makna/tafsir (tidak semua kalimat punya)
  catatan?: string        // Catatan filologi
}

export interface LontarPage {
  id: string
  pageNumber: number
  title: string
  imagePath: string       // Path ke /public/scans/
  imageWidth: number      // Lebar asli gambar (px) — untuk rasio
  imageHeight: number     // Tinggi asli gambar (px)
  words: WordAnnotation[]
  phrases: PhraseAnnotation[]
}

// ============================================================
// DUMMY DATA — Koordinat placeholder, ganti dengan data asli
// Gambar placeholder pakai warna solid sampai scan asli ada
// ============================================================
export const lontarPages: LontarPage[] = [
  {
    id: 'page-001',
    pageNumber: 1,
    title: 'Carita Parahyangan — Lembar 1',
    imagePath: '/scans/page-001.jpg',   // Ganti dengan path scan asli
    imageWidth: 3677,
    imageHeight: 4838,
    words: [
      // Baris 1 — "Adi ning bumi Sunda"
      { id: 'w1', aksara: 'ᮃᮓᮤ', latin: 'Adi', terjemah: 'Permulaan / Awal', kelas: 'kata benda', x: 8, y: 12, w: 6, h: 3.5 },
      { id: 'w2', aksara: 'ᮊᮤᮒ', latin: 'ning', terjemah: 'dari / milik', kelas: 'kata depan', x: 15.5, y: 12, w: 5, h: 3.5 },
      { id: 'w3', aksara: 'ᮘᮥᮙᮤ', latin: 'bumi', terjemah: 'bumi / tanah', kelas: 'kata benda', x: 22, y: 12, w: 6, h: 3.5 },
      { id: 'w4', aksara: 'ᮞᮥᮔ᮪ᮓ', latin: 'Sunda', terjemah: 'Sunda (nama wilayah)', kelas: 'nama diri', x: 29.5, y: 12, w: 7, h: 3.5 },
      // Baris 2 — "Si Raja mulia bulana"
      { id: 'w5', aksara: 'ᮞᮤ', latin: 'Si', terjemah: 'Sang / Si (penanda subjek)', kelas: 'partikel', x: 8, y: 18.5, w: 3.5, h: 3.5 },
      { id: 'w6', aksara: 'ᮛᮏ', latin: 'Raja', terjemah: 'Raja / Pemimpin', kelas: 'kata benda', x: 13, y: 18.5, w: 5.5, h: 3.5 },
      { id: 'w7', aksara: 'ᮙᮥᮜᮤᮃ', latin: 'mulia', terjemah: 'mulia / terhormat', kelas: 'kata sifat', x: 20, y: 18.5, w: 6.5, h: 3.5 },
      { id: 'w8', aksara: 'ᮘᮥᮜᮔ᮪', latin: 'bulana', terjemah: 'bulannya / pada masanya', kelas: 'kata benda', x: 28, y: 18.5, w: 7, h: 3.5 },
      // Baris 3
      { id: 'w9', aksara: 'ᮙᮔ᮪ᮓᮜ᮪', latin: 'Mandal', terjemah: 'Menetapkan', kelas: 'kata kerja', x: 8, y: 25, w: 7, h: 3.5 },
      { id: 'w10', aksara: 'ᮊᮥ', latin: 'ku', terjemah: 'oleh / dengan', kelas: 'kata depan', x: 17, y: 25, w: 3.5, h: 3.5 },
      { id: 'w11', aksara: 'ᮠᮥᮊᮥᮙ᮪', latin: 'hukum', terjemah: 'hukum / aturan', kelas: 'kata benda', x: 22, y: 25, w: 6.5, h: 3.5 },
      { id: 'w12', aksara: 'ᮃᮓᮒ᮪', latin: 'adat', terjemah: 'adat / tradisi', kelas: 'kata benda', x: 30, y: 25, w: 5.5, h: 3.5 },
      { id: 'w13', aksara: 'ᮜᮊ᮪ᮞᮔ', latin: 'laksana', terjemah: 'yang dijalankan', kelas: 'kata kerja', x: 37.5, y: 25, w: 8, h: 3.5 },
      // Baris 4
      { id: 'w14', aksara: 'ᮕᮛᮠᮡᮀ', latin: 'Parahyang', terjemah: 'tanah/wilayah yang dimuliakan', kelas: 'nama diri', x: 8, y: 31.5, w: 10, h: 3.5 },
      { id: 'w15', aksara: 'ᮌᮥᮔᮥᮀ', latin: 'gunung', terjemah: 'gunung / pegunungan', kelas: 'kata benda', x: 20.5, y: 31.5, w: 7, h: 3.5 },
      { id: 'w16', aksara: 'ᮞᮊᮒᮤ', latin: 'sakti', terjemah: 'sakti / berkekuatan gaib', kelas: 'kata sifat', x: 29.5, y: 31.5, w: 6, h: 3.5 },
    ],
    phrases: [
      {
        id: 'p1',
        words: ['w1', 'w2', 'w3', 'w4'],
        terjemah: 'Permulaan dari bumi Sunda.',
        makna: 'Kalimat pembuka ini menegaskan bahwa kisah yang akan diceritakan berakar dari tanah Sunda — bukan sekadar lokasi geografis, melainkan identitas peradaban yang akan diuraikan sepanjang naskah.',
        catatan: 'Kata "Adi" dalam konteks naskah Sunda kuno sering bermakna ganda: permulaan waktu sekaligus kemuliaan asal-usul.',
      },
      {
        id: 'p2',
        words: ['w5', 'w6', 'w7', 'w8'],
        terjemah: 'Sang Raja yang mulia pada masanya.',
        catatan: 'Frasa "bulana" merujuk pada era pemerintahan, bukan bulan kalender.',
      },
      {
        id: 'p3',
        words: ['w9', 'w10', 'w11', 'w12', 'w13'],
        terjemah: 'Menetapkan tatanan dengan hukum adat yang dijalankan.',
        makna: 'Ayat ini menggambarkan fondasi pemerintahan Sunda kuno yang bersandar pada hukum adat — bukan kekuasaan semata, melainkan legitimasi yang datang dari tradisi leluhur yang hidup di tengah masyarakat.',
        catatan: 'Kombinasi "hukum adat laksana" adalah frasa baku dalam naskah Sunda abad ke-15 hingga ke-17.',
      },
      {
        id: 'p4',
        words: ['w14', 'w15', 'w16'],
        terjemah: 'Parahyang, pegunungan yang sakti.',
        makna: 'Parahyang (Parahyangan) merujuk pada wilayah yang dianggap suci dan penuh kekuatan spiritual — tempat para hyang (roh leluhur) bersemayam, yang hari ini dikenal sebagai Tatar Sunda.',
      },
    ],
  },
  {
    id: 'page-002',
    pageNumber: 2,
    title: 'Carita Parahyangan — Lembar 2',
    imagePath: '/scans/page-002.jpg',
    imageWidth: 3677,
    imageHeight: 4838,
    words: [
      { id: 'w1', aksara: 'ᮓᮦᮝ', latin: 'Déwa', terjemah: 'Dewa / Kekuatan Ilahi', kelas: 'kata benda', x: 8, y: 10, w: 6, h: 3.5 },
      { id: 'w2', aksara: 'ᮕᮛᮙ', latin: 'parama', terjemah: 'tertinggi / agung', kelas: 'kata sifat', x: 16, y: 10, w: 7, h: 3.5 },
      { id: 'w3', aksara: 'ᮞᮥᮌᮤ', latin: 'suci', terjemah: 'suci / murni', kelas: 'kata sifat', x: 25, y: 10, w: 5.5, h: 3.5 },
      { id: 'w4', aksara: 'ᮘᮠᮤᮒ', latin: 'bahagia', terjemah: 'bahagia / sejahtera', kelas: 'kata sifat', x: 32, y: 10, w: 7.5, h: 3.5 },
      { id: 'w5', aksara: 'ᮔᮌᮛ', latin: 'nagara', terjemah: 'negara / kerajaan', kelas: 'kata benda', x: 8, y: 16, w: 7, h: 3.5 },
      { id: 'w6', aksara: 'ᮞᮥᮔ᮪ᮓ', latin: 'Sunda', terjemah: 'Sunda', kelas: 'nama diri', x: 17, y: 16, w: 7, h: 3.5 },
      { id: 'w7', aksara: 'ᮊᮌᮀ', latin: 'kagung', terjemah: 'agung / besar', kelas: 'kata sifat', x: 26, y: 16, w: 6.5, h: 3.5 },
    ],
    phrases: [
      {
        id: 'p1',
        words: ['w1', 'w2', 'w3'],
        terjemah: 'Dewa yang maha agung dan suci.',
        makna: 'Pembukaan lembar kedua ini merujuk pada konsep ketuhanan dalam kepercayaan Sunda kuno — "Déwa parama suci" adalah sebutan untuk kekuatan ilahi tertinggi sebelum pengaruh Hindu-Buddha masuk secara penuh.',
      },
      {
        id: 'p2',
        words: ['w5', 'w6', 'w7'],
        terjemah: 'Negara Sunda yang agung.',
        catatan: 'Sebutan "nagara Sunda kagung" ditemukan berulang dalam berbagai naskah sebagai penanda legitimasi kekuasaan.',
      },
    ],
  },
  {
    id: 'page-003',
    pageNumber: 3,
    title: 'Carita Parahyangan — Lembar 3',
    imagePath: '/scans/page-003.jpg',
    imageWidth: 3677,
    imageHeight: 4838,
    words: [
      { id: 'w1', aksara: 'ᮕᮒᮤ', latin: 'pati', terjemah: 'kematian / akhir', kelas: 'kata benda', x: 8, y: 8, w: 5, h: 3.5 },
      { id: 'w2', aksara: 'ᮠᮤᮓᮥᮕ᮪', latin: 'hidup', terjemah: 'kehidupan / hayat', kelas: 'kata benda', x: 15, y: 8, w: 6.5, h: 3.5 },
      { id: 'w3', aksara: 'ᮕᮥᮒᮁ', latin: 'putar', terjemah: 'berputar / siklus', kelas: 'kata kerja', x: 24, y: 8, w: 6, h: 3.5 },
      { id: 'w4', aksara: 'ᮊᮜᮀ', latin: 'kalang', terjemah: 'langit / cakrawala', kelas: 'kata benda', x: 8, y: 14, w: 6.5, h: 3.5 },
      { id: 'w5', aksara: 'ᮊᮥᮘᮥᮙᮤ', latin: 'kubumi', terjemah: 'di bumi / di tanah', kelas: 'kata depan', x: 17, y: 14, w: 8, h: 3.5 },
    ],
    phrases: [
      {
        id: 'p1',
        words: ['w1', 'w2', 'w3'],
        terjemah: 'Kematian dan kehidupan berputar.',
        makna: 'Filosofi siklus hidup-mati dalam kosmologi Sunda kuno — tidak ada akhir yang benar-benar final, melainkan pergantian yang terus berlanjut seperti putaran roda waktu (kala).',
      },
      {
        id: 'p2',
        words: ['w4', 'w5'],
        terjemah: 'Langit dan bumi (saling menopang).',
        catatan: 'Pasangan "kalang-kubumi" adalah dikotomi kosmologis klasik Sunda yang setara dengan konsep atas-bawah, langit-bumi, maskulin-feminin.',
      },
    ],
  },
]
