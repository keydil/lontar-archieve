#!/usr/bin/env node
// ============================================================
// OPTIMASI MODEL 3D — jalankan ini di hasil export RealityScan
// MENTAH (biasanya puluhan-ratusan MB) sebelum diunggah lewat
// admin panel. Draco compression buat geometri (visually lossless
// di setting wajar, dipakai luas — Google, Sketchfab, dll) + resize
// & re-encode tekstur ke ukuran yang masuk akal buat web.
//
// Jalankan: node scripts/optimize-model.mjs public/models/nama.glb
// Hasil: public/models/nama.optimized.glb (satu file, tekstur
// ter-embed — gak perlu lagi upload file PNG terpisah)
// ============================================================

import path from 'node:path'
import sharp from 'sharp'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, weld, draco, textureCompress, prune } from '@gltf-transform/functions'
import draco3d from 'draco3dgltf'

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Pakai: node scripts/optimize-model.mjs <path-ke-file.glb>')
  process.exit(1)
}

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
  })

console.log(`Membaca ${inputPath}...`)
const document = await io.read(inputPath)

await document.transform(
  dedup(),
  weld(),
  // Resize + kompres semua tekstur (diffuse, normal map, dll) ke JPEG,
  // maksimal 2048px — cukup buat model yang diliat/diputer di browser,
  // gak perlu detail resolusi mentah hasil scan (biasanya 8192px+).
  textureCompress({ encoder: sharp, targetFormat: 'jpeg', resize: [2048, 2048], quality: 85 }),
  // Kompresi geometri Draco — quantization standar, gak keliatan
  // bedanya secara visual tapi biasanya motong ukuran 80-95%.
  draco({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }),
  prune(),
)

const ext = path.extname(inputPath)
const outputPath = inputPath.replace(new RegExp(`${ext}$`), `.optimized${ext}`)
await io.write(outputPath, document)

const fs = await import('node:fs')
const beforeMb = (fs.statSync(inputPath).size / 1024 / 1024).toFixed(1)
const afterMb = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(1)
console.log(`\n${inputPath}: ${beforeMb} MB -> ${outputPath}: ${afterMb} MB`)
console.log('Tekstur udah ter-embed di dalam file ini — tinggal upload SATU file .glb ini lewat admin panel.')
