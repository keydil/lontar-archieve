'use client'

import { createClient } from '@supabase/supabase-js'

// Kredensial publik (aman diekspos): dilindungi Row Level Security (RLS).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && anonKey)

// Bila env belum diisi, client tetap dibuat dengan placeholder agar build
// tidak error; halaman akan fallback ke data seed.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)

// Nama bucket Supabase Storage untuk gambar (scan, sampul, foto artefak).
export const MEDIA_BUCKET = 'media'
