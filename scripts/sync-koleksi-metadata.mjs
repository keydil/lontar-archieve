#!/usr/bin/env node
// ============================================================
// SYNC METADATA KOLEKSI: src/data/koleksi.ts -> Supabase
//
// Dipakai kalau perbaikan teks/taksonomi dilakukan di file seed dan
// perlu diterapkan ke record Supabase yang sudah hidup.
//
// MERGE, BUKAN REPLACE. Cuma field di FIELDS_FROM_SEED yang ditimpa;
// field lain di record Supabase (modelUrl, modelRotation, media,
// thumbnail — hasil upload lewat panel admin) DIPERTAHANKAN apa adanya.
// Ini bedanya dengan tombol "Muat Data Awal" di panel admin, yang nimpa
// seluruh objek dan bakal ngilangin modelUrl.
//
// Jalankan: node --env-file=.env scripts/sync-koleksi-metadata.mjs
// Tambah --dry-run buat lihat perubahannya dulu tanpa nulis apa-apa.
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { artifacts } from '../src/data/koleksi.ts'

const DRY_RUN = process.argv.includes('--dry-run')

const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
for (const k of required) {
  if (!process.env[k]) {
    console.error(`Env "${k}" belum diisi di .env`)
    process.exit(1)
  }
}

// Field yang dianggap "dimiliki" file seed. Sisanya milik database.
const FIELDS_FROM_SEED = [
  'name', 'year', 'type', 'category', 'material', 'dimensions',
  'artist', 'country', 'address', 'location',
  'description_id', 'description_en',
]

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data: rows, error } = await supabase.from('koleksi').select('slug, data')
if (error) {
  console.error('Gagal baca tabel koleksi:', error.message)
  process.exit(1)
}

const bySlug = new Map(rows.map((r) => [r.slug, r.data]))
console.log(`${rows.length} record di Supabase, ${artifacts.length} artefak di file seed.${DRY_RUN ? '  [DRY RUN]' : ''}\n`)

let updated = 0
let unchanged = 0
const missing = []

for (const seed of artifacts) {
  const existing = bySlug.get(seed.slug)
  if (!existing) {
    missing.push(seed.slug)
    continue
  }

  const changes = {}
  for (const field of FIELDS_FROM_SEED) {
    if (seed[field] !== undefined && seed[field] !== existing[field]) {
      changes[field] = { dari: existing[field], jadi: seed[field] }
    }
  }

  if (Object.keys(changes).length === 0) {
    unchanged++
    continue
  }

  console.log(`${seed.slug}`)
  for (const [field, { dari, jadi }] of Object.entries(changes)) {
    const potong = (v) => {
      const s = String(v ?? '(kosong)')
      return s.length > 70 ? s.slice(0, 70) + '…' : s
    }
    console.log(`   ${field}:`)
    console.log(`     - ${potong(dari)}`)
    console.log(`     + ${potong(jadi)}`)
  }

  if (!DRY_RUN) {
    const merged = { ...existing }
    for (const field of Object.keys(changes)) merged[field] = seed[field]

    const { error: upErr } = await supabase
      .from('koleksi')
      .update({ name: merged.name, data: merged })
      .eq('slug', seed.slug)

    if (upErr) {
      console.error(`   GAGAL update: ${upErr.message}`)
      continue
    }
    // Sanity check: pastiin field yang bukan milik seed gak ikut keubah.
    for (const kept of ['modelUrl', 'modelRotation', 'thumbnail']) {
      if (JSON.stringify(existing[kept]) !== JSON.stringify(merged[kept])) {
        console.error(`   PERINGATAN: "${kept}" ikut berubah — ini gak seharusnya terjadi!`)
      }
    }
  }
  updated++
  console.log()
}

console.log('─'.repeat(50))
console.log(`${updated} record ${DRY_RUN ? 'akan di-update' : 'ter-update'}, ${unchanged} sudah sesuai.`)

if (missing.length) {
  console.log(`\n${missing.length} artefak ada di seed tapi TIDAK ada di Supabase (dilewati, gak dibuat baru):`)
  for (const slug of missing) console.log(`  - ${slug}`)
  console.log('Kalau memang harus ada, tambahkan lewat panel admin.')
}

const extra = rows.map((r) => r.slug).filter((slug) => !artifacts.some((a) => a.slug === slug))
if (extra.length) {
  console.log(`\n${extra.length} record ada di Supabase tapi TIDAK ada di seed (dibiarkan, tidak dihapus):`)
  for (const slug of extra) console.log(`  - ${slug}`)
}
