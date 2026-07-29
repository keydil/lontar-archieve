'use client'

import { useEffect, useState } from 'react'

// ============================================================
// FEEDBACK — toast notifications & confirm modal buat ganti
// alert()/confirm() bawaan browser di seluruh Panel Admin.
// Pola singleton + subscriber, senada sama pub/sub di lib/cms.ts
// (biar ga perlu Context/Provider wiring).
// ============================================================

const mono = "'DM Mono', monospace"

type ToastType = 'success' | 'error' | 'info'
type ToastItem = { id: string; message: string; type: ToastType }
type ConfirmState = {
  message: string
  danger?: boolean
  confirmLabel?: string
  resolve: (v: boolean) => void
} | null

let toasts: ToastItem[] = []
const toastListeners = new Set<() => void>()
function emitToasts() {
  toastListeners.forEach((l) => l())
}

let confirmState: ConfirmState = null
const confirmListeners = new Set<() => void>()
function emitConfirm() {
  confirmListeners.forEach((l) => l())
}

export function toast(message: string, type: ToastType = 'info') {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  toasts = [...toasts, { id, message, type }]
  emitToasts()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    emitToasts()
  }, 4000)
}

export function confirmDialog(
  message: string,
  opts?: { danger?: boolean; confirmLabel?: string }
): Promise<boolean> {
  return new Promise((resolve) => {
    confirmState = { message, danger: opts?.danger, confirmLabel: opts?.confirmLabel, resolve }
    emitConfirm()
  })
}

const toastColor: Record<ToastType, string> = {
  success: '#3f6b46',
  error: '#a03434',
  info: 'var(--border)',
}

// Mount sekali di root Panel Admin — render toast stack + confirm overlay.
export function FeedbackHost() {
  const [, force] = useState(0)

  useEffect(() => {
    const rerender = () => force((x) => x + 1)
    toastListeners.add(rerender)
    confirmListeners.add(rerender)
    return () => {
      toastListeners.delete(rerender)
      confirmListeners.delete(rerender)
    }
  }, [])

  const resolveConfirm = (result: boolean) => {
    confirmState?.resolve(result)
    confirmState = null
    emitConfirm()
  }

  return (
    <>
      {/* Toast stack */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          maxWidth: 'calc(100vw - 3rem)',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              minWidth: '260px',
              maxWidth: '360px',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              background: 'var(--charcoal)',
              color: 'var(--bone)',
              borderLeft: `3px solid ${toastColor[t.type]}`,
              fontFamily: mono,
              fontSize: '12px',
              lineHeight: 1.5,
              boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
              animation: 'toast-in 0.25s ease',
            }}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirmState && (
        <div
          onClick={() => resolveConfirm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(17,17,16,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'overlay-in 0.15s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '380px',
              maxWidth: '100%',
              background: 'var(--bone)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
              animation: 'modal-in 0.2s ease',
            }}
          >
            <p style={{ fontFamily: mono, fontSize: '13px', color: 'var(--charcoal)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {confirmState.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                onClick={() => resolveConfirm(false)}
                style={{
                  fontFamily: mono, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '0.65rem 1.2rem', borderRadius: '6px', cursor: 'pointer',
                  background: 'transparent', color: 'var(--charcoal)', border: '1px solid var(--border)',
                }}
              >
                Batal
              </button>
              <button
                onClick={() => resolveConfirm(true)}
                style={{
                  fontFamily: mono, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '0.65rem 1.2rem', borderRadius: '6px', cursor: 'pointer',
                  background: confirmState.danger ? 'transparent' : 'var(--charcoal)',
                  color: confirmState.danger ? '#a03434' : 'var(--bone)',
                  border: confirmState.danger ? '1px solid rgba(160,52,52,0.4)' : '1px solid var(--charcoal)',
                }}
              >
                {confirmState.confirmLabel ?? 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
