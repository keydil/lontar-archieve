// Versi server-only buat baca pengaturan SEO di generateMetadata()
// (root layout). Sengaja terpisah dari lib/cms.ts — itu 'use client'
// (pakai persistSession/autoRefreshToken yang butuh window), gak aman
// dipanggil dari Server Component. Client di sini baca-doang, tanpa
// fitur sesi browser.
import { createClient } from '@supabase/supabase-js'
import { defaultSettings, type SiteSettings } from '@/data/settings'

export async function getSiteSettingsServer(): Promise<SiteSettings> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return defaultSettings

  try {
    const supabase = createClient(url, anonKey)
    const { data, error } = await supabase.from('settings').select('data').eq('id', 'global').maybeSingle()
    if (error || !data) return defaultSettings
    return { ...defaultSettings, ...(data.data as Partial<SiteSettings>) }
  } catch {
    return defaultSettings
  }
}
