// Dipakai admin (deteksi live pas ngetik URL) & halaman publik (render
// iframe YouTube vs <video> file langsung) — satu sumber kebenaran biar
// dua sisi selalu sepakat soal "ini YouTube atau bukan".
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null
  const match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)
  return match && match[2].length === 11 ? match[2] : null
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeVideoId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}

// Thumbnail bawaan YouTube — gak perlu API key, gak perlu upload manual.
export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeVideoId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}
