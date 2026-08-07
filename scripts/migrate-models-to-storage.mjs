#!/usr/bin/env node
// ============================================================
// MIGRASI MODEL 3D LAMA -> OBJECT STORAGE (sekali jalan)
//
// Upload file .glb + tekstur eksternal yang direferensikan (dibaca
// otomatis dari JSON chunk .glb-nya) ke bucket (Cloudflare R2, S3-
// compatible), lalu update field modelUrl di record koleksi Supabase
// yang sesuai.
//
// Jalankan: node --env-file=.env scripts/migrate-models-to-storage.mjs
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'

const required = [
  'STORAGE_KEY_ID', 'STORAGE_SECRET_KEY', 'STORAGE_BUCKET_NAME', 'STORAGE_ENDPOINT', 'STORAGE_REGION', 'STORAGE_PUBLIC_URL',
  'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
]
for (const k of required) {
  if (!process.env[k]) {
    console.error(`Env "${k}" belum diisi di .env`)
    process.exit(1)
  }
}

const s3 = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,
  region: process.env.STORAGE_REGION,
  forcePathStyle: true,
  credentials: { accessKeyId: process.env.STORAGE_KEY_ID, secretAccessKey: process.env.STORAGE_SECRET_KEY },
})
// Service role key -> bypass RLS, gak butuh sesi login browser buat script sekali-jalan ini.
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const MODELS_DIR = path.resolve(process.cwd(), 'public/models')
const BUCKET = process.env.STORAGE_BUCKET_NAME
const PUBLIC_URL = process.env.STORAGE_PUBLIC_URL.replace(/\/$/, '')

// panci_sakti.glb SENGAJA TIDAK dimigrasi — mesh-nya bolong (RealityScan
// gagal merekonstruksi sebagian permukaan, lihat diskusi & catatan di
// src/data/koleksi.ts pada entri "goong-renteng"). Jangan dipublikasikan
// sampai artefaknya discan ulang.
const migrations = [
  { file: 'buddha_fix.glb', slug: 'genta-teratai-buddha' },
  { file: 'macan_lonceng.glb', slug: 'genta-singha-talaga' },
]

function extractExternalImageUris(glbBuffer) {
  const magic = glbBuffer.readUInt32LE(0)
  if (magic !== 0x46546c67) throw new Error('Bukan file .glb yang valid (magic number salah)')
  const jsonLen = glbBuffer.readUInt32LE(12)
  const json = JSON.parse(glbBuffer.subarray(20, 20 + jsonLen).toString('utf-8'))
  return (json.images ?? []).map((img) => img.uri).filter((u) => typeof u === 'string')
}

async function uploadFile(localPath, key, contentType) {
  const body = fs.readFileSync(localPath)
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }))
  console.log(`  -> ${key} (${(body.length / 1024 / 1024).toFixed(1)} MB)`)
  return `${PUBLIC_URL}/${key}`
}

for (const { file, slug } of migrations) {
  const glbPath = path.join(MODELS_DIR, file)
  if (!fs.existsSync(glbPath)) {
    console.warn(`Lewati "${file}": tidak ditemukan di ${MODELS_DIR}`)
    continue
  }

  console.log(`\n=== ${file} -> koleksi "${slug}" ===`)
  const glbBuffer = fs.readFileSync(glbPath)
  // Subfolder per-model, biar file tekstur "u0_v0_diffuse.png" dari
  // model berbeda-beda gak saling timpa di bucket yang sama.
  const prefix = `models/${path.basename(file, '.glb')}`

  const glbUrl = await uploadFile(glbPath, `${prefix}/${file}`, 'model/gltf-binary')

  for (const uri of extractExternalImageUris(glbBuffer)) {
    const texPath = path.join(MODELS_DIR, uri)
    if (!fs.existsSync(texPath)) {
      console.warn(`  PERINGATAN: tekstur "${uri}" direferensikan tapi tidak ketemu lokal, dilewati!`)
      continue
    }
    const ext = path.extname(uri).toLowerCase()
    await uploadFile(texPath, `${prefix}/${uri}`, ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png')
  }

  const { data, error: fetchErr } = await supabase.from('koleksi').select('data').eq('slug', slug).maybeSingle()
  if (fetchErr || !data) {
    console.error(`  Gagal ambil record koleksi "${slug}":`, fetchErr?.message ?? 'record tidak ditemukan')
    continue
  }
  const updatedData = { ...data.data, modelUrl: glbUrl }
  const { error: upsertErr } = await supabase.from('koleksi').upsert({ slug, name: updatedData.name, data: updatedData })
  if (upsertErr) {
    console.error(`  Gagal update record "${slug}":`, upsertErr.message)
    continue
  }
  console.log(`  Record "${slug}" ter-update -> modelUrl: ${glbUrl}`)
}

console.log('\nSelesai. Buka tiap modelUrl di atas langsung di tab browser baru — harus kedownload/stream file binary, BUKAN halaman error/HTML.')
