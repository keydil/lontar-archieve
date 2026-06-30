'use client';

import { useState, useEffect, useRef } from 'react';

// Daftar model yang ada — tinggal tambah di sini
const DEFAULT_ITEMS = [
  'drajum-super',
  'macan_lonceng',
  'sepatu-koku',
];

function slugToTitle(slug: string) {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ViewerPage() {
  const [items, setItems] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [toast, setToast] = useState('');
  const [loadError, setLoadError] = useState(false);
  const mvRef = useRef<HTMLElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load dari localStorage, fallback ke default
  useEffect(() => {
    const stored = localStorage.getItem('rs_items_v2');
    const parsed: string[] = stored ? JSON.parse(stored) : DEFAULT_ITEMS;
    setItems(parsed);
    if (parsed.length > 0) setActive(parsed[0]);
  }, []);

  // Inject model-viewer web component script sekali
  useEffect(() => {
    if (document.querySelector('script[data-mv]')) return;
    const s = document.createElement('script');
    s.type = 'module';
    s.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    s.setAttribute('data-mv', '1');
    document.head.appendChild(s);
  }, []);

  // Re-mount model-viewer setiap active berubah untuk reset error state
  useEffect(() => {
    setLoadError(false);
  }, [active]);

  function saveItems(newItems: string[]) {
    setItems(newItems);
    localStorage.setItem('rs_items_v2', JSON.stringify(newItems));
  }

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  }

  function addItem() {
    const val = input.trim().replace(/\.glb$/i, '');
    if (!val) { showToast('Masukkan nama barang dulu.'); return; }
    if (items.includes(val)) { showToast(`"${val}" sudah ada.`); return; }
    const next = [...items, val];
    saveItems(next);
    setInput('');
    setActive(val);
  }

  function removeItem(slug: string) {
    const next = items.filter((i) => i !== slug);
    saveItems(next);
    if (active === slug) setActive(next[0] ?? null);
  }

  // Inject model-viewer via dangerouslySetInnerHTML karena custom element
  const modelSrc = active ? `/models/${active}.glb` : '';

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', background: '#0e0e11', color: '#f0f0f0', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 260, borderRight: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Add input */}
        <div style={{ padding: 14, borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              placeholder="nama_barang"
              style={{
                flex: 1, height: 34, padding: '0 10px',
                background: '#222228', border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#f0f0f0', fontSize: 13, outline: 'none', minWidth: 0,
              }}
            />
            <button
              onClick={addItem}
              style={{
                height: 34, padding: '0 12px',
                background: '#f0f0f0', color: '#0e0e11',
                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              + Tambah
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#555560', marginTop: 6 }}>Tanpa .glb · underscore atau dash OK</p>
        </div>

        <p style={{ fontSize: 11, fontWeight: 600, color: '#555560', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '10px 14px 6px' }}>
          Katalog
        </p>

        {/* Item list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 10px' }}>
          {items.length === 0 && (
            <p style={{ fontSize: 13, color: '#555560', textAlign: 'center', marginTop: 24 }}>
              Belum ada item.
            </p>
          )}
          {items.map((slug) => (
            <div
              key={slug}
              onClick={() => setActive(slug)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 3,
                background: active === slug ? '#222228' : 'transparent',
                border: `0.5px solid ${active === slug ? 'rgba(255,255,255,0.18)' : 'transparent'}`,
              }}
            >
              <div style={{
                width: 36, height: 36, background: '#18181c', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
              }}>
                📦
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {slugToTitle(slug)}
                </div>
                <div style={{ fontSize: 11, color: '#555560', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {slug}.glb
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeItem(slug); }}
                style={{ background: 'none', border: 'none', color: '#555560', cursor: 'pointer', padding: 4, borderRadius: 6, fontSize: 14 }}
                title="Hapus"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main viewer ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#18181c' }}>

        {active && (
          <div style={{
            padding: '10px 18px', borderBottom: '0.5px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: 12, background: '#0e0e11',
          }}>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{slugToTitle(active)}</span>
            <span style={{ fontSize: 12, color: '#555560', fontFamily: 'monospace' }}>{active}.glb</span>
            <span style={{
              marginLeft: 'auto', fontSize: 11, padding: '3px 8px',
              background: '#222228', border: '0.5px solid rgba(255,255,255,0.08)',
              borderRadius: 6, color: '#9090a0',
            }}>
              RealityScan
            </span>
          </div>
        )}

        <div style={{ flex: 1, position: 'relative' }}>
          {!active ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#555560' }}>
              <span style={{ fontSize: 48 }}>📭</span>
              <p style={{ fontSize: 14 }}>Pilih atau tambah item untuk preview</p>
              <p style={{ fontSize: 12 }}>File .glb ada di <code style={{ fontFamily: 'monospace' }}>public/models/</code></p>
            </div>
          ) : loadError ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#e05555' }}>
              <span style={{ fontSize: 40 }}>⚠️</span>
              <p style={{ fontSize: 14 }}>File tidak ditemukan: <code style={{ fontFamily: 'monospace' }}>{active}.glb</code></p>
              <p style={{ fontSize: 12, color: '#555560' }}>Pastikan file ada di <code style={{ fontFamily: 'monospace' }}>public/models/{active}.glb</code></p>
            </div>
          ) : (
            // model-viewer sebagai custom element
            <div
              key={active}
              style={{ width: '100%', height: '100%' }}
              dangerouslySetInnerHTML={{
                __html: `
                  <model-viewer
                    src="/models/${active}.glb"
                    alt="${slugToTitle(active)}"
                    auto-rotate
                    camera-controls
                    shadow-intensity="1"
                    environment-image="neutral"
                    exposure="1.1"
                    style="width:100%;height:100%;background:#18181c;"
                  ></model-viewer>
                `,
              }}
            />
          )}
        </div>
      </main>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: '#222228', border: '0.5px solid rgba(255,255,255,0.1)',
          color: '#e05555', padding: '8px 16px', borderRadius: 8, fontSize: 13, zIndex: 100,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
