'use client'

import { useSyncExternalStore } from 'react'

// ============================================================
// EDITOR DIRTY STORE — pub/sub singleton (pola yang sama kayak
// listeners/emit() di lib/cms.ts) buat ngasih tau layout/sidebar
// ada editor yang lagi punya perubahan belum disimpan.
//
// Perlu store terpisah karena di App Router, layout.tsx (sidebar)
// dan page.tsx (editor arsip/koleksi) itu pohon komponen yang beda —
// ga bisa lift state lewat props biasa dari page ke layout-nya.
// ============================================================

let dirty = false
const listeners = new Set<() => void>()

export function setEditorDirty(value: boolean) {
  if (dirty === value) return
  dirty = value
  listeners.forEach((l) => l())
}

export function getEditorDirty() {
  return dirty
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useEditorDirty(): boolean {
  return useSyncExternalStore(subscribe, getEditorDirty, () => false)
}
