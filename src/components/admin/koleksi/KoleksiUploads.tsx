'use client'

import { useState } from 'react'
import { UploadCloud, Trash2, Box, RotateCw, Maximize2, Video, Play, X } from 'lucide-react'
import { uploadImage, uploadModel, uploadVideo, getExternalTextureUris } from '@/lib/cms'
import { getYouTubeEmbedUrl } from '@/lib/youtube'
import { toast, confirmDialog } from '../Feedback'

const slotInputCls = 'w-full p-2 bg-[#F9F6EE] border border-[#DCD3C1] rounded-sm text-xs text-[#2C2825] outline-none focus:border-[#8A7144]'

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
          <span className="text-xs font-bold text-[#1A1816] font-mono break-all block">{value.split('/').pop()}</span>

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
            <a
              href="/viewer"
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2 bg-[#2C2825] hover:bg-[#1A1816] text-[#FFD966] text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Maximize2 className="w-4 h-4" />
              Uji Coba Viewer 3D
            </a>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="px-3 py-2 border border-[#DCD3C1] hover:bg-red-50 text-red-600 text-xs font-semibold rounded-sm transition-colors cursor-pointer"
            >
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
                  onChange={(e) => onChange({ youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className={slotInputCls}
                />
              </div>
              {embedUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2C2825] hover:bg-[#1A1816] text-[#FFD966] text-xs font-bold rounded-sm cursor-pointer transition-colors shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  Pratinjau Video
                </button>
              )}
            </div>
          ) : busy ? (
            <div className="space-y-1">
              <p className="text-[11px] font-mono text-[#6B5E4C]">Mengunggah… {progress}%</p>
              <div className="h-1.5 rounded-full bg-[#DCD3C1] overflow-hidden">
                <div className="h-full bg-[#8A7144] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : fileUrl ? (
            // ── Video hasil upload — tampilin nama file & player, BUKAN URL mentah ──
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#1A1816] block truncate">{fileName}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2C2825] hover:bg-[#1A1816] text-[#FFD966] text-xs font-bold rounded-sm cursor-pointer transition-colors shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  Pratinjau Video
                </button>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#DCD3C1] hover:bg-[#F3EFE4] text-[#2C2825] text-xs font-semibold rounded-sm cursor-pointer transition-colors">
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
              </div>
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

          <input
            value={caption ?? ''}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Keterangan / caption (opsional)"
            className={slotInputCls}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#DCD3C1] hover:bg-red-50 text-red-600 text-xs font-semibold rounded-sm transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus Video
          </button>
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
