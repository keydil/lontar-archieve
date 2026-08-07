// ============================================================
// WEB WORKER — kompres tekstur model 3D di browser SEBELUM upload,
// jalan di thread terpisah biar tab gak freeze pas ngolah file
// gede. Geometri TIDAK di-Draco-compress di sini (encoder Draco
// browser belum ada yang portable/teruji buat gltf-transform kita
// — lihat scripts/optimize-model.mjs buat kompresi geometri lokal
// yang lebih lengkap). Cuma tekstur (biasanya penyumbang ukuran
// terbesar hasil scan RealityScan, sering 8192px mentah).
// ============================================================

import { WebIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, weld, textureCompress, prune } from '@gltf-transform/functions'

self.onmessage = async (e: MessageEvent<{ buffer: ArrayBuffer; name: string }>) => {
  const { buffer, name } = e.data
  try {
    const io = new WebIO().registerExtensions(ALL_EXTENSIONS)
    const document = await io.readBinary(new Uint8Array(buffer))

    await document.transform(
      dedup(),
      weld(),
      textureCompress({ targetFormat: 'jpeg', resize: [2048, 2048], quality: 85 }),
      prune(),
    )

    const optimized = await io.writeBinary(document)
    self.postMessage({ ok: true, buffer: optimized.buffer, name }, { transfer: [optimized.buffer] })
  } catch (err) {
    // Gagal optimasi (mis. bentuk .glb yang gak biasa) -> biarin
    // caller fallback ke file asli, jangan sampai upload gagal
    // total gara-gara langkah optimasi yang sebenarnya opsional.
    self.postMessage({ ok: false, error: (err as Error).message })
  }
}
