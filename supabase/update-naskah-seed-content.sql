-- ============================================================
-- Timpa isi 3 entry naskah lama (termasuk testing "Carita
-- Parahyangan" 14 lembar) dengan data contoh yang lebih lengkap:
--   1) Carita Parahyangan          → Naskah Lontar Carita Parahyangan & Talaga
--   2) Sanghyang Siksa Kandang Karesian → Kitab Siksa Kandang ng Karesian
--   3) Bujangga Manik              → Babad Kedatuan Talaga Manggung (Naskah Pegon)
--
-- Jalankan di Supabase Dashboard: SQL Editor → New query → tempel → Run
--
-- Tiap UPDATE cuma nyentuh SATU baris yang cocok id ATAU title lama-nya.
-- 'id' di dalam data JSON dipertahankan sama dengan id baris yang sudah
-- ada, jadi URL /arsip/<id-lama> yang mungkin udah kesebar tetap jalan.
-- ============================================================

-- 0) Cek dulu baris mana aja yang bakal kena (opsional, buat verifikasi):
select id, title, published from public.naskah
where id in ('carita-parahyangan-001', 'sanghyang-siksa-002', 'bujangga-manik-003')
   or title in ('Carita Parahyangan', 'Sanghyang Siksa Kandang Karesian', 'Bujangga Manik');


-- 1) Carita Parahyangan → Naskah Lontar Carita Parahyangan & Talaga (3 lembar, 5 ayat)
update public.naskah
set
  title = 'Naskah Lontar Carita Parahyangan & Talaga',
  published = true,
  data = jsonb_build_object(
    'id', id,
    'title', 'Naskah Lontar Carita Parahyangan & Talaga',
    'sumber', 'Koleksi Pusaka Keraton Talaga Manggung (Register #NSK-TLG-001)',
    'tahun', 'Tahun 1580 M',
    'aksaraType', 'Aksara Sunda Kuno',
    'published', true,
    'coverImage', '/images/carita-parahyangan.jpg',
    'sinopsis', 'Naskah lontar pusaka utama Kerajaan Talaga Manggung. Berisi silsilah raja-raja, kisah kepemimpinan Ratu Simbar Kancana, hukum adat kemakmuran agraris, serta legenda Danau Sangiang.',
    'lembar', jsonb_build_array(
      jsonb_build_object(
        'id', 'ctp-l1', 'lembarNumber', 1, 'judul', 'Pembukaan & Penghormatan Kepada Sang Pencipta',
        'verses', jsonb_build_array(
          jsonb_build_object(
            'id', 'ctp-v1', 'verseNumber', 1,
            'verseAksara', 'ᮃᮓᮤ ᮔᮤᮀ ᮘᮥᮙᮤ ᮒᮜᮌ ᮙᮀᮌᮥᮀ',
            'verseLatin', 'Adi ning bumi Talaga Manggung',
            'terjemahVerse', 'Inilah permulaan penceritaan tanah dan peradaban Kerajaan Talaga Manggung.',
            'makna', 'Ayat pembuka ini menegaskan posisi spiritual Kerajaan Talaga Manggung sebagai wilayah berdaulat yang dinaungi keberkahan alam dan ketenteraman.',
            'catatan', 'Kata "Adi" berasal dari bahasa Sanskerta (आदि) yang bermakna awal/mula. Ditulis dengan gaya aksara Sunda Kuno periode Parahyangan Tengah.',
            'words', jsonb_build_array(
              jsonb_build_object('id', 'ctp-v1w1', 'aksara', 'ᮃᮓᮤ', 'latin', 'Adi', 'terjemah', 'Permulaan / Awal', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'ctp-v1w2', 'aksara', 'ᮔᮤᮀ', 'latin', 'ning', 'terjemah', 'Dari / Pada', 'kelas', 'partikel'),
              jsonb_build_object('id', 'ctp-v1w3', 'aksara', 'ᮘᮥᮙᮤ', 'latin', 'bumi', 'terjemah', 'Tanah / Negeri / Bumi', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'ctp-v1w4', 'aksara', 'ᮒᮜᮌ', 'latin', 'Talaga', 'terjemah', 'Telaga / Danau Suci', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'ctp-v1w5', 'aksara', 'ᮙᮀᮌᮥᮀ', 'latin', 'Manggung', 'terjemah', 'Yang Dijunjung / Tinggi', 'kelas', 'kata sifat')
            )
          ),
          jsonb_build_object(
            'id', 'ctp-v2', 'verseNumber', 2,
            'verseAksara', 'ᮛᮓᮨᮔ᮪ ᮞᮤᮙ᮪ᮘᮁ ᮊᮔ᮪ᮎᮔ ᮙᮀᮌᮜ ᮛᮒᮥ',
            'verseLatin', 'Raden Simbar Kancana manggala ratu',
            'terjemahVerse', 'Raden Simbar Kancana memerintah sebagai ratu pelindung rakyat yang arif dan bijaksana.',
            'makna', 'Simbar Kancana adalah ratu legendaris Talaga Manggung yang terkenal membawa kedamaian, kemakmuran pertanian, dan hukum yang adil.',
            'catatan', 'Gelar "Manggala Ratu" menunjukkan kepemimpinan ganda: sebagai kepala pemerintahan sekuler sekaligus pemimpin spiritual.',
            'words', jsonb_build_array(
              jsonb_build_object('id', 'ctp-v2w1', 'aksara', 'ᮛᮓᮨᮔ᮪', 'latin', 'Raden', 'terjemah', 'Gelar Bangsawan / Pangeran', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'ctp-v2w2', 'aksara', 'ᮞᮤᮙ᮪ᮘᮁ', 'latin', 'Simbar', 'terjemah', 'Mahkota Hias / Daun Mas', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'ctp-v2w3', 'aksara', 'ᮊᮔ᮪ᮎᮔ', 'latin', 'Kancana', 'terjemah', 'Emas Murni / Keindahan', 'kelas', 'kata sifat'),
              jsonb_build_object('id', 'ctp-v2w4', 'aksara', 'ᮙᮀᮌᮜ', 'latin', 'manggala', 'terjemah', 'Pelindung / Pemimpin Utama', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'ctp-v2w5', 'aksara', 'ᮛᮒᮥ', 'latin', 'ratu', 'terjemah', 'Raja / Penguasa', 'kelas', 'kata benda')
            )
          )
        )
      ),
      jsonb_build_object(
        'id', 'ctp-l2', 'lembarNumber', 2, 'judul', 'Pedoman Moral & Kemakmuran Agraris',
        'verses', jsonb_build_array(
          jsonb_build_object(
            'id', 'ctp-v3', 'verseNumber', 3,
            'verseAksara', 'ᮙᮝ ᮌᮨᮙᮂ ᮛᮤᮕᮂ ᮜᮧᮂ ᮏᮤᮔᮝᮤ ᮊᮁᮒ ᮛᮠᮁᮏ',
            'verseLatin', 'Mawa gemah ripah loh jinawi karta raharja',
            'terjemahVerse', 'Mewujudkan kemakmuran, kesuburan tanah yang melimpah, serta ketenteraman bagi seluruh warga.',
            'makna', 'Semboyan klasik Parahyangan yang mencerminkan keseimbangan ekologis antara pemanfaatan sumber daya alam dan kedamaian sosial.',
            'catatan', 'Penggunaan aliterasi rima kata "karta raharja" merupakan ciri khas sastra lisan Sunda Kuno yang dibukukan.',
            'words', jsonb_build_array(
              jsonb_build_object('id', 'ctp-v3w1', 'aksara', 'ᮙᮝ', 'latin', 'Mawa', 'terjemah', 'Membawa / Mewujudkan', 'kelas', 'kata kerja'),
              jsonb_build_object('id', 'ctp-v3w2', 'aksara', 'ᮌᮨᮙᮂ', 'latin', 'gemah', 'terjemah', 'Subur / Makmur', 'kelas', 'kata sifat'),
              jsonb_build_object('id', 'ctp-v3w3', 'aksara', 'ᮛᮤᮕᮂ', 'latin', 'ripah', 'terjemah', 'Serba Cukup / Melimpah', 'kelas', 'kata sifat'),
              jsonb_build_object('id', 'ctp-v3w4', 'aksara', 'ᮜᮧᮂ', 'latin', 'loh', 'terjemah', 'Air Melimpah / Hijau', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'ctp-v3w5', 'aksara', 'ᮏᮤᮔᮝᮤ', 'latin', 'jinawi', 'terjemah', 'Tanah Subur Gemah', 'kelas', 'kata sifat'),
              jsonb_build_object('id', 'ctp-v3w6', 'aksara', 'ᮊᮁᮒ', 'latin', 'karta', 'terjemah', 'Aman / Tentram', 'kelas', 'kata sifat'),
              jsonb_build_object('id', 'ctp-v3w7', 'aksara', 'ᮛᮠᮁᮏ', 'latin', 'raharja', 'terjemah', 'Sejahtera / Selamat', 'kelas', 'kata sifat')
            )
          ),
          jsonb_build_object(
            'id', 'ctp-v4', 'verseNumber', 4,
            'verseAksara', 'ᮒᮒ ᮒᮔᮤ ᮞᮥᮊ ᮞᮀ ᮠᮡᮀ ᮃᮞᮢᮤ',
            'verseLatin', 'Tata tani suka Sang Hyang Asri',
            'terjemahVerse', 'Sistem tata kelola pertanian membawa sukacita atas limpahan berkah Sang Hyang Asri (Dewi Padi).',
            'makna', 'Pentingnya upacara seren taun dan penghormatan pada kearifan lokal pertanian huma tradisional Sunda.',
            'catatan', 'Frasa "Sang Hyang Asri" merupakan sebutan kuno untuk dewi kesuburan dan hasil panen.',
            'words', jsonb_build_array(
              jsonb_build_object('id', 'ctp-v4w1', 'aksara', 'ᮒᮒ', 'latin', 'Tata', 'terjemah', 'Aturan / Kelola', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'ctp-v4w2', 'aksara', 'ᮒᮔᮤ', 'latin', 'tani', 'terjemah', 'Pertanian / Ladang', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'ctp-v4w3', 'aksara', 'ᮞᮥᮊ', 'latin', 'suka', 'terjemah', 'Sukacita / Bahagia', 'kelas', 'kata sifat'),
              jsonb_build_object('id', 'ctp-v4w4', 'aksara', 'ᮞᮀ ᮠᮡᮀ', 'latin', 'Sang Hyang', 'terjemah', 'Yang Maha Mulia / Suci', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'ctp-v4w5', 'aksara', 'ᮃᮞᮢᮤ', 'latin', 'Asri', 'terjemah', 'Dewi Padi / Kesuburan', 'kelas', 'kata benda')
            )
          )
        )
      ),
      jsonb_build_object(
        'id', 'ctp-l3', 'lembarNumber', 3, 'judul', 'Saluran Silsilah Trah Kerajaan',
        'verses', jsonb_build_array(
          jsonb_build_object(
            'id', 'ctp-v5', 'verseNumber', 5,
            'verseAksara', 'ᮒᮥᮛᮥᮔᮔ᮪ ᮞᮥᮔᮔ᮪ ᮕᮔ᮪ᮏᮜᮥ ᮞᮁᮒ ᮒᮜᮌ',
            'verseLatin', 'Turunan Sunan Panjalu sarta Talaga',
            'terjemahVerse', 'Trah garis keturunan luhur Sunan Panjalu yang bersatu erat dengan keluarga istana Talaga.',
            'makna', 'Menjelaskan aliansi pernikahan diplomatik antara dua pusat kebudayaan besar Parahyangan Timur.',
            'catatan', 'Terdapat jejak koreksi oleh scribes (penulis lontar) berupa titik ganda pada aksara "Panjalu".',
            'words', jsonb_build_array(
              jsonb_build_object('id', 'ctp-v5w1', 'aksara', 'ᮒᮥᮛᮥᮔᮔ᮪', 'latin', 'Turunan', 'terjemah', 'Garis Keturunan / Trah', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'ctp-v5w2', 'aksara', 'ᮞᮥᮔᮔ᮪', 'latin', 'Sunan', 'terjemah', 'Yang Dipertuan / Penguasa', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'ctp-v5w3', 'aksara', 'ᮕᮔ᮪ᮏᮜᮥ', 'latin', 'Panjalu', 'terjemah', 'Wilayah Panjalu Antik', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'ctp-v5w4', 'aksara', 'ᮞᮁᮒ', 'latin', 'sarta', 'terjemah', 'Serta / Dan Bersama', 'kelas', 'partikel'),
              jsonb_build_object('id', 'ctp-v5w5', 'aksara', 'ᮒᮜᮌ', 'latin', 'Talaga', 'terjemah', 'Kedatuan Talaga Manggung', 'kelas', 'kata benda')
            )
          )
        )
      )
    )
  )
where id = 'carita-parahyangan-001' or title = 'Carita Parahyangan';


-- 2) Sanghyang Siksa Kandang Karesian → Kitab Siksa Kandang ng Karesian (1 lembar, 1 ayat)
update public.naskah
set
  title = 'Kitab Siksa Kandang ng Karesian',
  published = true,
  data = jsonb_build_object(
    'id', id,
    'title', 'Kitab Siksa Kandang ng Karesian',
    'sumber', 'Perpustakaan Digital Keraton & Koleksi Museum Nasional (Register #NSK-SKK-002)',
    'tahun', 'Tahun 1518 M',
    'aksaraType', 'Aksara Sunda Kuno',
    'published', true,
    'coverImage', '/images/sanghyang-siksa.jpg',
    'sinopsis', 'Naskah panduan etika, moralitas kesatria, aturan kerajinan, seni pertunjukan, dan filsafat hidup bagi masyarakat Sunda klasik.',
    'lembar', jsonb_build_array(
      jsonb_build_object(
        'id', 'skk-l1', 'lembarNumber', 1, 'judul', 'Dasar Etika & Kejujuran Dalam Bekerja',
        'verses', jsonb_build_array(
          jsonb_build_object(
            'id', 'skk-v1', 'verseNumber', 1,
            'verseAksara', 'ᮄᮔᮤ ᮕᮊᮨᮔ᮪ ᮅᮛᮀ ᮓᮤ ᮛᮨᮅᮙ ᮕᮊᮨᮔ᮪ ᮓᮤ ᮞᮅᮀ',
            'verseLatin', 'Ini pakeun urang di reuma, pakeun di saung',
            'terjemahVerse', 'Inilah pedoman hidup kita saat berada di ladang, maupun saat berada di dalam rumah/pondok.',
            'makna', 'Pakeun bermakna pegangan moral yang berlaku di mana saja, tanpa membedakan ruang publik dan privat.',
            'catatan', 'Kata "reuma" bermakna ladang tempat bercocok tanam huma.',
            'words', jsonb_build_array(
              jsonb_build_object('id', 'skk-v1w1', 'aksara', 'ᮄᮔᮤ', 'latin', 'Ini', 'terjemah', 'Inilah', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'skk-v1w2', 'aksara', 'ᮕᮊᮨᮔ᮪', 'latin', 'pakeun', 'terjemah', 'Pedoman / Pegangan Hidup', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'skk-v1w3', 'aksara', 'ᮅᮛᮀ', 'latin', 'urang', 'terjemah', 'Kita / Manusia', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'skk-v1w4', 'aksara', 'ᮓᮤ', 'latin', 'di', 'terjemah', 'Di / Pada', 'kelas', 'partikel'),
              jsonb_build_object('id', 'skk-v1w5', 'aksara', 'ᮛᮨᮅᮙ', 'latin', 'reuma', 'terjemah', 'Ladang Huma / Kebun', 'kelas', 'kata benda')
            )
          )
        )
      )
    )
  )
where id = 'sanghyang-siksa-002' or title = 'Sanghyang Siksa Kandang Karesian';


-- 3) Bujangga Manik → Babad Kedatuan Talaga Manggung (Naskah Pegon) (1 lembar, 1 ayat, aksara Pegon)
update public.naskah
set
  title = 'Babad Kedatuan Talaga Manggung (Naskah Pegon)',
  published = true,
  data = jsonb_build_object(
    'id', id,
    'title', 'Babad Kedatuan Talaga Manggung (Naskah Pegon)',
    'sumber', 'Koleksi Keluarga Keturunan Raden Panglurah (Register #NSK-BBD-003)',
    'tahun', 'Tahun 1642 M',
    'aksaraType', 'Pegon',
    'published', true,
    'coverImage', '/images/bujangga-manik.jpg',
    'sinopsis', 'Naskah babad peradaban berisi hikayat Raden Panglurah, legenda Danau Sangiang, dan asal usul tradisi penyucian pusaka.',
    'lembar', jsonb_build_array(
      jsonb_build_object(
        'id', 'bbd-l1', 'lembarNumber', 1, 'judul', 'Pembukaan Babad Kasultanan',
        'verses', jsonb_build_array(
          jsonb_build_object(
            'id', 'bbd-v1', 'verseNumber', 1,
            'verseAksara', 'كسورة إڠ دينا سبتو مانيس',
            'verseLatin', 'Kasurat ing dina Saptu manis',
            'terjemahVerse', 'Ditulis pada hari Sabtu Manis (Pahing) di keraton pusat Kerajaan Talaga.',
            'makna', 'Penanggalan kombinasi wuku dan pasaran tradisional Jawa-Sunda.',
            'catatan', 'Gaya penulisan Pegon dengan harakat lengkap (fathah, kasrah, dammah).',
            'words', jsonb_build_array(
              jsonb_build_object('id', 'bbd-v1w1', 'aksara', 'كسورة', 'latin', 'Kasurat', 'terjemah', 'Tersurat / Ditulis', 'kelas', 'kata kerja'),
              jsonb_build_object('id', 'bbd-v1w2', 'aksara', 'إڠ', 'latin', 'ing', 'terjemah', 'Pada / Di', 'kelas', 'partikel'),
              jsonb_build_object('id', 'bbd-v1w3', 'aksara', 'دينا', 'latin', 'dina', 'terjemah', 'Hari', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'bbd-v1w4', 'aksara', 'سبتو', 'latin', 'Saptu', 'terjemah', 'Sabtu', 'kelas', 'kata benda'),
              jsonb_build_object('id', 'bbd-v1w5', 'aksara', 'مانيس', 'latin', 'manis', 'terjemah', 'Manis / Pasaran Pahing', 'kelas', 'kata benda')
            )
          )
        )
      )
    )
  )
where id = 'bujangga-manik-003' or title = 'Bujangga Manik';


-- 4) Cek hasil akhir semuanya:
select id, title, published, data->'aksaraType' as aksara_type, jsonb_array_length(data->'lembar') as jumlah_lembar
from public.naskah
where title in (
  'Naskah Lontar Carita Parahyangan & Talaga',
  'Kitab Siksa Kandang ng Karesian',
  'Babad Kedatuan Talaga Manggung (Naskah Pegon)'
);
