// ============================================================
// AKSARA SUNDA — palet karakter Unicode untuk papan ketik on-screen
//
// Keyboard fisik tidak bisa mengetik Aksara Sunda, jadi ahli
// memilih karakter dari palet ini di editor admin. Unicode block:
// U+1B80–U+1BBF (Sundanese) + U+1CC0–U+1CC7 (Sundanese Supplement)
// ============================================================

export interface AksaraGroup {
  label: string
  hint: string
  chars: { char: string; name: string }[]
}

export const aksaraSundaGroups: AksaraGroup[] = [
  {
    label: 'Ngalagena (Konsonan)',
    hint: 'Aksara dasar berbunyi /a/',
    chars: [
      { char: 'ᮊ', name: 'ka' },
      { char: 'ᮌ', name: 'ga' },
      { char: 'ᮍ', name: 'nga' },
      { char: 'ᮎ', name: 'ca' },
      { char: 'ᮏ', name: 'ja' },
      { char: 'ᮑ', name: 'nya' },
      { char: 'ᮒ', name: 'ta' },
      { char: 'ᮓ', name: 'da' },
      { char: 'ᮔ', name: 'na' },
      { char: 'ᮕ', name: 'pa' },
      { char: 'ᮘ', name: 'ba' },
      { char: 'ᮙ', name: 'ma' },
      { char: 'ᮚ', name: 'ya' },
      { char: 'ᮛ', name: 'ra' },
      { char: 'ᮜ', name: 'la' },
      { char: 'ᮝ', name: 'wa' },
      { char: 'ᮞ', name: 'sa' },
      { char: 'ᮠ', name: 'ha' },
      { char: 'ᮖ', name: 'fa' },
      { char: 'ᮋ', name: 'qa' },
      { char: 'ᮗ', name: 'va' },
      { char: 'ᮚ', name: 'ya' },
      { char: 'ᮐ', name: 'za' },
      { char: 'ᮔ᮪ᮌ', name: 'ngga' },
    ],
  },
  {
    label: 'Swara (Vokal Mandiri)',
    hint: 'Aksara vokal berdiri sendiri',
    chars: [
      { char: 'ᮃ', name: 'a' },
      { char: 'ᮄ', name: 'i' },
      { char: 'ᮅ', name: 'u' },
      { char: 'ᮆ', name: 'é' },
      { char: 'ᮇ', name: 'o' },
      { char: 'ᮈ', name: 'e (pepet)' },
      { char: 'ᮉ', name: 'eu' },
    ],
  },
  {
    label: 'Rarangkén (Vokal & Pengubah)',
    hint: 'Tanda yang menempel pada aksara dasar',
    chars: [
      { char: 'ᮤ', name: 'panghulu -i' },
      { char: 'ᮥ', name: 'panyuku -u' },
      { char: 'ᮦ', name: 'panéléng -é' },
      { char: 'ᮧ', name: 'panolong -o' },
      { char: 'ᮨ', name: 'pamepet -e' },
      { char: 'ᮩ', name: 'paneuleung -eu' },
      { char: 'ᮡ', name: 'panyakra -ra' },
      { char: 'ᮢ', name: 'panyiku -la' },
      { char: 'ᮣ', name: 'pamingkal -ya' },
      { char: 'ᮁ', name: 'panglayar -r' },
      { char: 'ᮀ', name: 'panyecek -ng' },
      { char: 'ᮂ', name: 'pangwisad -h' },
      { char: '᮪', name: 'pamaeh (mati)' },
    ],
  },
  {
    label: 'Angka',
    hint: 'Angka Sunda 0–9',
    chars: [
      { char: '᮰', name: '0' },
      { char: '᮱', name: '1' },
      { char: '᮲', name: '2' },
      { char: '᮳', name: '3' },
      { char: '᮴', name: '4' },
      { char: '᮵', name: '5' },
      { char: '᮶', name: '6' },
      { char: '᮷', name: '7' },
      { char: '᮸', name: '8' },
      { char: '᮹', name: '9' },
    ],
  },
]

export const kelasKataOptions = [
  'kata benda',
  'kata kerja',
  'kata sifat',
  'kata depan',
  'partikel',
  'nama diri',
  'kata bilangan',
  'kata keterangan',
]
