'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { UploadCloud, Trash2, Box, RotateCw, Maximize2, Video, Play, X } from 'lucide-react'
import { uploadImage, uploadModel, uploadVideo, getExternalTextureUris } from '@/lib/cms'
import { getYouTubeEmbedUrl } from '@/lib/youtube'
import { toast, confirmDialog } from '../Feedback'

const ModelViewer = dynamic(() => import('@/components/ModelViewer'), {
  ssr: false,
})

const slotInputCls = 'w-full p-2 bg-[#F9F6EE] border border-[#DCD3C1] rounded-sm text-xs text-[#2C2825] outline-none focus:border-[#8A7144]'

// ============================================================
// METADATA AUTO-EXTRACTOR HOOKS (.glb & .mp4)
// ============================================================
function useGlbMetadata(url?: string) {
  const [meta, setMeta] = useState<{ size: string; polygons: string; pbr: string; loading: boolean }>({
    size: '',
    polygons: '',
    pbr: '',
    loading: false,
  })

  useEffect(() => {
    if (!url) {
      setMeta({ size: '', polygons: '', pbr: '', loading: false })
      return
    }

    let active = true
    setMeta({ size: '', polygons: '', pbr: '', loading: true })

    async function analyzeGlb() {
      let fileSize = 0
      let polyCount = 0
      let pbrType = ''

      try {
        const headRes = await fetch(url!, { method: 'HEAD' }).catch(() => null)
        if (headRes?.ok) {
          const cl = headRes.headers.get('content-length')
          if (cl) fileSize = parseInt(cl, 10)
        }

        const rangeRes = await fetch(url!, {
          headers: { Range: 'bytes=0-131071' },
        }).catch(() => null)

        if (rangeRes && (rangeRes.ok || rangeRes.status === 206)) {
          const buffer = await rangeRes.arrayBuffer()

          if (!fileSize) {
            const cr = rangeRes.headers.get('content-range')
            if (cr) {
              const total = cr.split('/')[1]
              if (total && !isNaN(Number(total))) fileSize = Number(total)
            }
          }

          if (buffer.byteLength >= 20) {
            const view = new DataView(buffer)
            const magic = view.getUint32(0, true)
            if (magic === 0x46546c67) {
              const jsonLength = view.getUint32(12, true)
              const jsonType = view.getUint32(16, true)
              if (jsonType === 0x4e4f5353 || jsonType === 0x4f53534e) {
                const jsonBytes = new Uint8Array(buffer, 20, Math.min(jsonLength, buffer.byteLength - 20))
                const jsonStr = new TextDecoder('utf-8').decode(jsonBytes)
                const gltf = JSON.parse(jsonStr)

                if (gltf.meshes && Array.isArray(gltf.meshes)) {
                  for (const mesh of gltf.meshes) {
                    if (!mesh.primitives) continue
                    for (const prim of mesh.primitives) {
                      if (prim.indices !== undefined && gltf.accessors?.[prim.indices]) {
                        polyCount += Math.floor(gltf.accessors[prim.indices].count / 3)
                      } else if (prim.attributes?.POSITION !== undefined && gltf.accessors?.[prim.attributes.POSITION]) {
                        polyCount += Math.floor(gltf.accessors[prim.attributes.POSITION].count / 3)
                      }
                    }
                  }
                }

                if (gltf.materials && gltf.materials.length > 0) {
                  const hasTex = gltf.textures && gltf.textures.length > 0
                  pbrType = hasTex ? 'PBR 2K' : 'PBR'
                }
              }
            }
          }
        }

        if (!active) return

        const sizeStr = fileSize ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB` : ''
        const polyStr =
          polyCount > 0
            ? polyCount >= 1000
              ? `${(polyCount / 1000).toFixed(1)}K Polygons`
              : `${polyCount} Polygons`
            : '3D Model'
        const pbrStr = pbrType || 'PBR'

        setMeta({ size: sizeStr, polygons: polyStr, pbr: pbrStr, loading: false })
      } catch {
        if (active) {
          setMeta({ size: '', polygons: '3D Model', pbr: 'GLB', loading: false })
        }
      }
    }

    analyzeGlb()

    return () => {
      active = false
    }
  }, [url])

  return meta
}

function useVideoMetadata(url?: string) {
  const [meta, setMeta] = useState<{ size: string; duration: string; resolution: string; loading: boolean }>({
    size: '',
    duration: '',
    resolution: '',
    loading: false,
  })

  useEffect(() => {
    if (!url) {
      setMeta({ size: '', duration: '', resolution: '', loading: false })
      return
    }

    let active = true
    setMeta({ size: '', duration: '', resolution: '', loading: true })

    async function analyzeVideo() {
      let fileSize = 0

      try {
        const headRes = await fetch(url!, { method: 'HEAD' })
        if (headRes.ok) {
          const cl = headRes.headers.get('content-length')
          if (cl) fileSize = parseInt(cl, 10)
        }
      } catch {
        // ignore HEAD failure
      }

      const sizeStr = fileSize ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB` : ''

      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true
      video.playsInline = true
      video.src = url!

      const cleanup = () => {
        video.onloadedmetadata = null
        video.onerror = null
        video.src = ''
        video.remove()
      }

      video.onloadedmetadata = () => {
        if (!active) {
          cleanup()
          return
        }

        const dSec = Math.round(video.duration || 0)
        const m = Math.floor(dSec / 60)
        const s = dSec % 60
        const durationStr = dSec > 0 ? `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} Min` : ''

        const h = video.videoHeight
        const w = video.videoWidth
        let resStr = ''
        if (h >= 2160 || w >= 3840) resStr = '4K Ultra HD'
        else if (h >= 1440 || w >= 2560) resStr = '2K QHD'
        else if (h >= 1080 || w >= 1920) resStr = '1080p Full HD'
        else if (h >= 720 || w >= 1280) resStr = '720p HD'
        else if (h > 0) resStr = `${h}p SD`

        setMeta({ size: sizeStr, duration: durationStr, resolution: resStr, loading: false })
        cleanup()
      }

      video.onerror = () => {
        if (!active) {
          cleanup()
          return
        }
        setMeta({ size: sizeStr || 'File MP4', duration: '', resolution: 'HD', loading: false })
        cleanup()
      }
    }

    analyzeVideo()

    return () => {
      active = false
    }
  }, [url])

  return meta
}

// ============================================================
// FOTO — dipakai buat gambar kartu & tiap item galeri media.
// ============================================================
export function KoleksiPhotoUpload({
  value,
  onChange,
  label,
  hint,
}: {
  value?: string
  onChange: (url: string | undefined) => void
  label: string
  hint?: string
}) {
  const [busy, setBusy] = useState(false)

  return (
    <div>
      <span className="block text-xs font-bold text-[#3D3730] mb-1.5">{label}</span>
      <div className="flex items-start gap-3">
        <div className="relative w-20 h-20 shrink-0 bg-[#F3EFE4] border border-[#D5C9B2] rounded-sm overflow-hidden flex items-center justify-center">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-[#A0988A] text-center px-1">{busy ? 'Memproses…' : 'Kosong'}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                setBusy(true)
                try {
                  const url = await uploadImage(file)
                  onChange(url)
                } catch (err) {
                  toast('Gagal mengunggah gambar: ' + (err as Error).message, 'error')
                } finally {
                  setBusy(false)
                }
              }}
            />
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8A7144] hover:bg-[#725C34] text-white text-xs font-bold rounded-sm cursor-pointer transition-colors shadow-sm">
              <UploadCloud className="w-3.5 h-3.5" />
              Unggah
            </span>
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#DCD3C1] hover:bg-red-50 text-red-600 text-xs font-semibold rounded-sm cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus
            </button>
          )}
        </div>
      </div>
      {hint && <p className="text-[11px] text-[#8A8172] mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  )
}

// ============================================================
// MODEL 3D (.glb) — upload + koreksi rotasi sumbu awal.
// ============================================================
const ROTATION_PRESETS: { label: string; value: [number, number, number] }[] = [
  { label: 'Tegakkan (+90° X)', value: [90, 0, 0] },
  { label: 'Reset Netral (0°)', value: [0, 0, 0] },
  { label: 'Putar Muka (180° Y)', value: [-90, 180, 0] },
  { label: 'Bawaan (-90° X)', value: [-90, 0, 0] },
]

export function KoleksiModelUpload({
  value,
  onChange,
  rotation,
  onRotationChange,
  enabled,
  onEnabledChange,
}: {
  value?: string
  onChange: (url: string | undefined) => void
  rotation: [number, number, number]
  onRotationChange: (r: [number, number, number]) => void
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
}) {
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState<'optimizing' | 'uploading'>('optimizing')
  const [progress, setProgress] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [tempRotation, setTempRotation] = useState<[number, number, number]>(rotation)
  const glbMeta = useGlbMetadata(value)

  return (
    <div className="p-4 bg-[#F3EFE4] border border-[#D5C9B2] rounded-sm space-y-3">
      <div className="flex items-center justify-between border-b border-[#D5C9B2] pb-2">
        <span className="text-xs font-bold text-[#1A1816] flex items-center gap-1.5">
          <Box className="w-4 h-4 text-[#8A7144]" />
          Model 3D Interaktif (.glb)
        </span>
        {value && (
          <label className="flex items-center gap-1.5 cursor-pointer" title="Tampil/sembunyi di situs — file & rotasi tetap tersimpan">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onEnabledChange(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#8A7144] cursor-pointer"
            />
            <span className="text-[11px] font-bold text-[#3D3730]">Tampil di situs</span>
          </label>
        )}
      </div>

      {busy && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-mono text-[#6B5E4C]">
            {phase === 'optimizing' ? 'Mengoptimasi tekstur…' : `Mengunggah… ${progress}%`}
          </p>
          <div className="h-1.5 rounded-full bg-[#DCD3C1] overflow-hidden">
            <div
              className="h-full bg-[#8A7144] transition-all"
              style={{ width: phase === 'optimizing' ? '100%' : `${progress}%` }}
            />
          </div>
        </div>
      )}

      {!busy && value ? (
        <div className="bg-[#FFFDF9] p-3.5 border border-[#DCD3C1] rounded-sm space-y-3">
          <div className="p-3 bg-[#F8F5EC] border border-[#D5C9B2] rounded-sm space-y-1">
            <span className="text-xs font-bold text-[#1A1816] font-mono break-all block">{value.split('/').pop()}</span>
            {glbMeta.loading ? (
              <span className="text-[11px] font-mono text-[#8A7144] opacity-70 animate-pulse block">Membaca info 3D…</span>
            ) : (
              (glbMeta.size || glbMeta.polygons) && (
                <div className="flex items-center gap-1.5 text-xs text-[#8A7144]">
                  {glbMeta.size && <span className="font-semibold">{glbMeta.size}</span>}
                  {glbMeta.size && glbMeta.polygons && <span className="text-[#A0988A]">•</span>}
                  <span className="text-[#7A7163]">{glbMeta.polygons} ({glbMeta.pbr})</span>
                </div>
              )
            )}
          </div>

          <div className="p-3 bg-[#F8F5EC] border border-[#D5C9B2] rounded-sm space-y-2.5">
            <span className="text-[11px] font-bold text-[#1A1816] flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5 text-[#8A7144]" />
              Koreksi Postur & Sumbu Awal
            </span>
            <p className="text-[10px] text-[#6B5E4C] leading-snug">
              Kalau model tampil miring/rebah, pakai preset di bawah biar tegak pas rotasi 360°:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {ROTATION_PRESETS.map((p) => {
                const active = rotation[0] === p.value[0] && rotation[1] === p.value[1] && rotation[2] === p.value[2]
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => onRotationChange(p.value)}
                    className={`px-2 py-1.5 text-[10px] font-bold rounded-sm border transition-all cursor-pointer text-center ${
                      active
                        ? 'bg-[#8A7144] text-white border-[#8A7144] shadow-sm'
                        : 'bg-[#FFFDF9] text-[#2C2825] border-[#D5C9B2] hover:border-[#8A7144]'
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {(['X', 'Y', 'Z'] as const).map((axis, idx) => (
                <div key={axis} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#5C4D32] font-semibold">{axis}</span>
                    <span className="font-mono font-bold text-[#8A7144]">{rotation[idx]}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={rotation[idx]}
                    onChange={(e) => {
                      const next: [number, number, number] = [...rotation]
                      next[idx] = parseInt(e.target.value, 10)
                      onRotationChange(next)
                    }}
                    className="w-full accent-[#8A7144] cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTempRotation([...rotation])
                setPreviewOpen(true)
              }}
              className="flex-1 py-2 bg-[#2C2825] hover:bg-[#1A1816] text-[#FFD966] text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Maximize2 className="w-4 h-4" />
              Uji Coba Viewer 3D
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="px-3 py-2 border border-[#DCD3C1] hover:bg-red-50 text-red-600 text-xs font-semibold rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus
            </button>
          </div>
        </div>
      ) : !busy ? (
        <label className="block border-2 border-dashed border-[#C5A86A]/60 hover:border-[#8A7144] p-4 text-center rounded-sm bg-[#FFFDF9] transition-all cursor-pointer group">
          <input
            type="file"
            accept=".glb,model/gltf-binary"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return

              const externalTextures = await getExternalTextureUris(file)
              if (externalTextures.length > 0) {
                const lanjut = await confirmDialog(
                  `File ini belum lengkap — tekstur/warnanya (${externalTextures.length} file gambar) ada di file terpisah yang tidak ikut terpilih. Kalau lanjut, model akan tampil TANPA tekstur (polos, warna dasar doang) di situs. Sebaiknya batalkan dulu, lalu minta pihak yang membuat scan 3D ini meng-export ulang dengan opsi "Embed Textures" / "Pack Textures into Binary" dicentang, supaya jadi satu file yang lengkap.`,
                  { danger: true, confirmLabel: 'Lanjut Tanpa Tekstur' },
                )
                if (!lanjut) return
              }

              setBusy(true)
              setPhase('optimizing')
              setProgress(0)
              try {
                const url = await uploadModel(file, setProgress, setPhase)
                onChange(url)
                toast('Model 3D berhasil diunggah.', 'success')
              } catch (err) {
                toast('Gagal mengunggah model: ' + (err as Error).message, 'error')
              } finally {
                setBusy(false)
              }
            }}
          />
          <Box className="w-6 h-6 mx-auto text-[#8A7144] group-hover:scale-110 transition-transform mb-1" />
          <span className="text-xs font-bold text-[#1A1816] block">Unggah File Model 3D (.glb)</span>
          <span className="text-[10px] text-[#7A7163]">Hasil scan Photogrammetry / LiDAR, ukuran berapapun</span>
        </label>
      ) : null}

      {previewOpen && value && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-[#FFFDF9] rounded-sm overflow-hidden shadow-2xl border border-[#D5C9B2] flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-[#F3EFE4] border-b border-[#D5C9B2] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <Box className="w-5 h-5 text-[#8A7144] shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-serif font-bold text-[#2C2825]">
                    Pratinjau & Koreksi Postur 3D
                  </p>
                  <p className="text-[11px] font-mono text-[#8A7144] truncate">
                    {value.split('/').pop()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1 text-[#6B5E4C] hover:text-[#1A1816] transition-colors cursor-pointer shrink-0"
                aria-label="Tutup tanpa menyimpan"
                title="Batal / Tutup tanpa menyimpan posisi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
              <div className="w-full lg:w-2/3 bg-[#F3EFE4] relative min-h-[360px] lg:min-h-[420px] border-b lg:border-b-0 lg:border-r border-[#D5C9B2]">
                <ModelViewer modelUrl={value} rotation={tempRotation} />
              </div>

              <div className="w-full lg:w-1/3 p-4 bg-[#F8F5EC] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-[#D5C9B2] pb-2">
                    <RotateCw className="w-4 h-4 text-[#8A7144]" />
                    <span className="text-xs font-bold text-[#1A1816]">Koreksi Postur Real-Time</span>
                  </div>

                  <p className="text-[11px] text-[#6B5E4C] leading-relaxed">
                    Atur preset atau geser slider X/Y/Z hingga model berdiri tegak & menghadap depan:
                  </p>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[#5C4D32] uppercase tracking-wider block">Preset Cepat</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ROTATION_PRESETS.map((p) => {
                        const active = tempRotation[0] === p.value[0] && tempRotation[1] === p.value[1] && tempRotation[2] === p.value[2]
                        return (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setTempRotation(p.value)}
                            className={`px-2 py-1.5 text-[10px] font-bold rounded-sm border transition-all cursor-pointer text-center ${
                              active
                                ? 'bg-[#8A7144] text-white border-[#8A7144] shadow-sm'
                                : 'bg-[#FFFDF9] text-[#2C2825] border-[#D5C9B2] hover:border-[#8A7144]'
                            }`}
                          >
                            {p.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-[#E2DBD0]">
                    <span className="text-[10px] font-bold text-[#5C4D32] uppercase tracking-wider block">Penyesuaian Presisi Sumbu</span>
                    {(['X', 'Y', 'Z'] as const).map((axis, idx) => (
                      <div key={axis} className="space-y-1 bg-[#FFFDF9] p-2 border border-[#E2DBD0] rounded-sm">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#5C4D32] font-bold">Sumbu {axis}</span>
                          <span className="font-mono font-bold text-[#8A7144]">{tempRotation[idx]}°</span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          step="5"
                          value={tempRotation[idx]}
                          onChange={(e) => {
                            const next: [number, number, number] = [...tempRotation]
                            next[idx] = parseInt(e.target.value, 10)
                            setTempRotation(next)
                          }}
                          className="w-full accent-[#8A7144] cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 bg-[#FFFDF9] border border-[#D5C9B2] rounded-sm text-center">
                  <span className="text-[10px] text-[#7A7163] uppercase font-mono block">Rotasi Sementara</span>
                  <span className="text-xs font-mono font-bold text-[#8A7144]">
                    [{tempRotation[0]}°, {tempRotation[1]}°, {tempRotation[2]}°]
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-3 bg-[#F3EFE4] border-t border-[#D5C9B2] shrink-0">
              <p className="text-[11px] font-mono text-[#6B5E4C] hidden sm:block">
                Drag/geser panggung 3D untuk memutar 360°, scroll untuk zoom
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="px-3.5 py-2 border border-[#D5C9B2] hover:bg-[#EFECE1] text-[#4A433A] text-xs font-semibold rounded-sm cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onRotationChange(tempRotation)
                    setPreviewOpen(false)
                    toast('Posisi & rotasi postur 3D berhasil dikunci.', 'success')
                  }}
                  className="px-5 py-2 bg-[#8A7144] hover:bg-[#725C34] text-white text-xs font-bold rounded-sm cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>🔒 Tutup & Kunci Posisi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// TAMBAH FOTO — langsung unggah & jadi item baru (bukan placeholder
// kosong yang diisi belakangan).
// ============================================================
export function KoleksiAddPhotoButton({ onAdd }: { onAdd: (url: string) => void }) {
  const [busy, setBusy] = useState(false)
  return (
    <label className={`block border-2 border-dashed border-[#C5A86A]/60 hover:border-[#8A7144] p-4 text-center rounded-sm bg-[#FFFDF9] transition-all group ${busy ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          setBusy(true)
          try {
            const url = await uploadImage(file)
            onAdd(url)
          } catch (err) {
            toast('Gagal mengunggah foto: ' + (err as Error).message, 'error')
          } finally {
            setBusy(false)
          }
        }}
      />
      <UploadCloud className="w-6 h-6 mx-auto text-[#8A7144] group-hover:scale-110 transition-transform mb-1" />
      <span className="text-xs font-bold text-[#1A1816] block">{busy ? 'Mengunggah…' : 'Klik untuk Unggah Foto Baru'}</span>
      <span className="text-[10px] text-[#7A7163]">JPG / PNG / WEBP</span>
    </label>
  )
}

// ============================================================
// VIDEO — satu slot doang (bukan array bebas). Belum ada 1 artefak
// yang beneran butuh lebih dari 1 video; kalau nanti ada revisi
// kuratorial yang perlu banyak, baru diubah jadi array lagi.
//
// Dua cara ngisi URL: tempel link YouTube, ATAU unggah file (.mp4/
// .webm/.mov) yang naik ke R2 lewat presign yang sama kayak model 3D.
// Sampul video OTOMATIS — YouTube punya thumbnail bawaan (gak perlu
// upload), file langsung fallback ke ikon play. Gak ada upload gambar
// manual di sini sama sekali.
// ============================================================
export function KoleksiVideoSlot({
  active,
  videoSource,
  youtubeUrl,
  fileUrl,
  caption,
  enabled,
  onEnabledChange,
  onChange,
}: {
  // Slot-nya ADA (item video udah dibuat) — beda sama field-fieldnya
  // yang wajar masih kosong pas baru diklik "Tambah".
  active: boolean
  videoSource: 'youtube' | 'file'
  youtubeUrl: string
  fileUrl: string
  caption?: string
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  onChange: (fields: { youtubeUrl?: string; url?: string; caption?: string; videoSource?: 'youtube' | 'file' } | null) => void
}) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const embedUrl = getYouTubeEmbedUrl(youtubeUrl)
  const videoMeta = useVideoMetadata(fileUrl)
  // URL teknis (domain R2, hash, dll) gak perlu & gak boleh keliatan
  // sama admin — cukup nama filenya doang.
  const fileName = fileUrl ? fileUrl.split('/').pop()?.replace(/^\d+-[a-z0-9]+-/, '') : ''

  async function handleUpload(file: File) {
    setBusy(true)
    setProgress(0)
    try {
      const videoUrl = await uploadVideo(file, setProgress)
      onChange({ url: videoUrl, videoSource: 'file' })
      toast('Video berhasil diunggah.', 'success')
    } catch (err) {
      toast('Gagal mengunggah video: ' + (err as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-4 bg-[#F3EFE4] border border-[#D5C9B2] rounded-sm space-y-3">
      <div className="flex items-center justify-between border-b border-[#D5C9B2] pb-2">
        <span className="text-xs font-bold text-[#1A1816] flex items-center gap-1.5">
          <Video className="w-4 h-4 text-[#8A7144]" />
          Video Dokumentasi
        </span>
        {active && (
          <label className="flex items-center gap-1.5 cursor-pointer" title="Tampil/sembunyi di situs — data tetap tersimpan">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onEnabledChange(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#8A7144] cursor-pointer"
            />
            <span className="text-[11px] font-bold text-[#3D3730]">Tampil di situs</span>
          </label>
        )}
      </div>

      {active ? (
        <div className="bg-[#FFFDF9] p-3.5 border border-[#DCD3C1] rounded-sm space-y-2.5">
          {/* Tab: YouTube vs File — cuma nentuin mana yang AKTIF tampil
              di publik. Ganti tab gak ngapus isi tab satunya. */}
          <div className="flex items-center gap-1.5 bg-[#EAE3D3] p-1 rounded-sm border border-[#D5C9B2]">
            <button
              type="button"
              onClick={() => onChange({ videoSource: 'youtube' })}
              className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-sm transition-all cursor-pointer ${videoSource === 'youtube' ? 'bg-[#8A7144] text-white' : 'text-[#5C4D32] hover:text-[#1A1816]'
                }`}
            >
              🔴 Link YouTube
            </button>
            <button
              type="button"
              onClick={() => onChange({ videoSource: 'file' })}
              className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-sm transition-all cursor-pointer ${videoSource === 'file' ? 'bg-[#8A7144] text-white' : 'text-[#5C4D32] hover:text-[#1A1816]'
                }`}
            >
              🎞️ File Direct (.MP4)
            </button>
          </div>

          {videoSource === 'youtube' ? (
            <div className="space-y-2">
              <div>
                <span className="block text-[11px] font-bold text-[#3D3730] mb-1">Link YouTube</span>
                <input
                  value={youtubeUrl}
                  onChange={(e) => onChange({ youtubeUrl: e.target.value, videoSource: 'youtube' })}
                  placeholder="https://youtube.com/watch?v=..."
                  className={slotInputCls}
                />
              </div>
            </div>
          ) : busy ? (
            <div className="space-y-1">
              <p className="text-[11px] font-mono text-[#6B5E4C]">Mengunggah… {progress}%</p>
              <div className="h-1.5 rounded-full bg-[#DCD3C1] overflow-hidden">
                <div className="h-full bg-[#8A7144] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : fileUrl ? (
            // ── Video hasil upload — tampilin nama file & metadata real-time di Card ──
            <div className="p-3 bg-[#F8F5EC] border border-[#D5C9B2] rounded-sm space-y-1">
              <span className="text-xs font-bold text-[#1A1816] font-mono block truncate">{fileName}</span>
              {videoMeta.loading ? (
                <span className="text-[11px] font-mono text-[#8A7144] opacity-70 animate-pulse block">Membaca metadata video…</span>
              ) : (
                (videoMeta.size || videoMeta.duration || videoMeta.resolution) && (
                  <div className="flex items-center gap-1.5 text-xs text-[#8A7144]">
                    {videoMeta.size && <span className="font-semibold">{videoMeta.size}</span>}
                    {videoMeta.size && videoMeta.duration && <span className="text-[#A0988A]">•</span>}
                    {videoMeta.duration && <span className="text-[#7A7163]">{videoMeta.duration}</span>}
                    {(videoMeta.size || videoMeta.duration) && videoMeta.resolution && <span className="text-[#A0988A]">•</span>}
                    {videoMeta.resolution && <span className="text-[#7A7163]">{videoMeta.resolution}</span>}
                  </div>
                )
              )}
            </div>
          ) : (
            <label className="block border-2 border-dashed border-[#D5C9B2] hover:border-[#8A7144] p-4 text-center rounded-sm bg-[#FFFDF9] cursor-pointer transition-colors">
              <input
                type="file"
                accept=".mp4,.webm,.mov,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (file) handleUpload(file)
                }}
              />
              <UploadCloud className="w-6 h-6 mx-auto text-[#8A7144] mb-1" />
              <span className="text-xs font-bold text-[#1A1816] block">Unggah File Video (.mp4/.webm/.mov)</span>
            </label>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              disabled={videoSource === 'youtube' ? !embedUrl : !fileUrl}
              className="flex-1 py-2 bg-[#2C2825] hover:bg-[#1A1816] text-[#FFD966] text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-[#FFD966]" />
              Pratinjau Video
            </button>
            {videoSource === 'file' && fileUrl && (
              <label className="px-3 py-2 border border-[#DCD3C1] hover:bg-[#F3EFE4] text-[#2C2825] text-xs font-semibold rounded-sm cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                <input
                  type="file"
                  accept=".mp4,.webm,.mov,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (file) handleUpload(file)
                  }}
                />
                <UploadCloud className="w-3.5 h-3.5" />
                Ganti File
              </label>
            )}
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-3 py-2 border border-[#DCD3C1] hover:bg-red-50 text-red-600 text-xs font-semibold rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onChange({ youtubeUrl: '', videoSource: 'youtube' })}
          className="w-full border-2 border-dashed border-[#D5C9B2] hover:border-[#8A7144] p-4 text-center rounded-sm bg-[#FFFDF9] transition-colors cursor-pointer"
        >
          <Video className="w-6 h-6 mx-auto text-[#8A7144] mb-1" />
          <span className="text-xs font-bold text-[#1A1816] block">Tambah Video Dokumentasi</span>
          <span className="text-[10px] text-[#7A7163]">Tempel link YouTube, atau unggah file .mp4/.webm/.mov</span>
        </button>
      )}

      {/* Modal pratinjau — bukan nampilin player langsung nempel di form,
          biar form-nya tetep ringkes. Baru muncul kalau diklik. */}
      {previewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-2xl bg-[#1A1816] rounded-sm overflow-hidden shadow-2xl">
            <div className="flex items-start justify-between gap-3 px-5 py-4 bg-[#2C2825]">
              <div className="flex items-start gap-2.5 min-w-0">
                <Video className="w-5 h-5 text-[#FFD966] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-['Playfair_Display',serif] font-bold text-white">
                    Pratinjau Video ({videoSource === 'youtube' ? 'YouTube' : 'File MP4 Direct'})
                  </p>
                  <p className="text-[11px] font-mono text-[#B0A798] truncate">
                    {videoSource === 'youtube' ? youtubeUrl : fileName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1 text-[#B0A798] hover:text-white cursor-pointer shrink-0"
                aria-label="Tutup pratinjau"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black">
              {videoSource === 'youtube' && embedUrl ? (
                <iframe
                  src={embedUrl}
                  title="Pratinjau video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <video src={fileUrl} controls autoPlay className="w-full h-full" />
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-3 bg-[#2C2825]">
              <p className="text-[11px] text-[#B0A798]">Terintegrasi langsung pada tampilan detail artefak publik.</p>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-1.5 bg-[#8A7144] hover:bg-[#725C34] text-white text-xs font-bold rounded-sm cursor-pointer transition-colors shrink-0"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
