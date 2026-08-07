'use client'

import { useState } from 'react'
import type { MediaItem } from '@/data/koleksi'

interface MediaGalleryProps {
  media: MediaItem[]
  title: string
}

// Ubah daftar URL foto polos (dipakai naskah/daun lontar) jadi MediaItem
// supaya bisa memakai galeri yang sama tanpa perlu tipe media lain.
export function imagesToMedia(urls: string[]): MediaItem[] {
  return urls.map((url, i) => ({ id: `img-${i}`, type: 'image', url }))
}

function MediaPreview({ item }: { item: MediaItem }) {
  if (item.type === 'video') {
    return (
      <video
        src={item.url}
        controls
        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#1A1918' }}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.url}
      alt={item.caption || 'Media'}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  )
}

export default function MediaGallery({ media, title }: MediaGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = media[activeIdx] || media[0]

  if (!media.length) return null

  return (
    <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
      {/* Main display */}
      <div style={{
        width: '100%',
        aspectRatio: '16 / 10',
        border: '6px solid var(--charcoal)',
        background: '#1A1918',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <MediaPreview item={active} />
        {/* Caption overlay */}
        {active.caption && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '0.75rem 1rem',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            color: 'var(--bone)',
            fontFamily: "'DM Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.05em',
          }}>
            {active.caption}
          </div>
        )}
        {/* Counter */}
        <span style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          background: 'rgba(0,0,0,0.6)',
          color: 'var(--bone)',
          fontFamily: "'DM Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.1em',
          padding: '4px 10px',
        }}>
          {activeIdx + 1} / {media.length}
        </span>
      </div>

      {/* Thumbnail strip */}
      {media.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '12px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}>
          {media.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveIdx(idx)}
              style={{
                width: '72px',
                height: '72px',
                flexShrink: 0,
                border: idx === activeIdx ? '3px solid var(--charcoal)' : '2px solid var(--border)',
                background: '#E8E4DC',
                padding: 0,
                cursor: 'pointer',
                overflow: 'hidden',
                opacity: idx === activeIdx ? 1 : 0.6,
                transition: 'opacity 0.2s, border-color 0.2s',
              }}
            >
              {item.type === 'video' && !item.thumbnail ? (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#1A1918', color: 'var(--bone)', fontSize: '20px',
                }}>
                  ▶
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnail || item.url}
                  alt={item.caption || `Media ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
