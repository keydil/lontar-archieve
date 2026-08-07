// ============================================================
// PRESIGN — buat URL upload sementara (langsung ke object storage,
// S3-compatible — Cloudflare R2, bisa juga Backblaze B2 dkk tanpa
// ubah kode, tinggal ganti env).
//
// Browser TIDAK pernah pegang secret key. Alurnya:
//  1. Client kirim access token Supabase-nya ke sini (login wajib).
//  2. Kita verifikasi token itu ke Supabase Auth server-side.
//  3. Kalau valid, generate presigned PUT URL (S3-compatible SDK)
//     yang cuma berlaku beberapa menit buat SATU object key.
//  4. Client PUT file `.glb`-nya LANGSUNG ke URL itu (gak lewat
//     server kita — file bisa ratusan MB, Vercel function ada limit
//     ukuran/durasi kalau direlay lewat sini).
//
// STORAGE_ENDPOINT = endpoint API S3-compatible (buat autentikasi
// upload). STORAGE_PUBLIC_URL = base URL BEDA yang dipakai publik
// buat baca file (mis. R2: "https://pub-xxxx.r2.dev" — bukan endpoint
// API-nya, R2 gak bisa diakses publik langsung dari situ).
// ============================================================

import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@supabase/supabase-js'

const STORAGE_KEY_ID = process.env.STORAGE_KEY_ID
const STORAGE_SECRET_KEY = process.env.STORAGE_SECRET_KEY
const STORAGE_BUCKET_NAME = process.env.STORAGE_BUCKET_NAME
const STORAGE_ENDPOINT = process.env.STORAGE_ENDPOINT // mis. https://<account_id>.r2.cloudflarestorage.com
const STORAGE_REGION = process.env.STORAGE_REGION // R2: "auto"
const STORAGE_PUBLIC_URL = process.env.STORAGE_PUBLIC_URL // mis. https://pub-xxxx.r2.dev

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request: Request) {
  if (!STORAGE_KEY_ID || !STORAGE_SECRET_KEY || !STORAGE_BUCKET_NAME || !STORAGE_ENDPOINT || !STORAGE_REGION || !STORAGE_PUBLIC_URL) {
    return NextResponse.json(
      { error: 'Storage belum dikonfigurasi di server (.env: STORAGE_KEY_ID, STORAGE_SECRET_KEY, STORAGE_BUCKET_NAME, STORAGE_ENDPOINT, STORAGE_REGION, STORAGE_PUBLIC_URL).' },
      { status: 500 },
    )
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Supabase belum dikonfigurasi.' }, { status: 500 })
  }

  // ── 1. Wajib login — verifikasi token ke Supabase Auth ──
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return NextResponse.json({ error: 'Belum login.' }, { status: 401 })
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Sesi login tidak valid, silakan login ulang.' }, { status: 401 })
  }

  // ── 2. Validasi input ──
  const body = await request.json().catch(() => null) as { filename?: string } | null
  const filename = body?.filename
  if (!filename || !filename.toLowerCase().endsWith('.glb')) {
    return NextResponse.json({ error: 'Nama file harus berakhiran .glb' }, { status: 400 })
  }

  // Nama object unik — hindari tabrakan/timpa file lama.
  const safeName = filename.toLowerCase().replace(/[^a-z0-9.-]+/g, '-')
  const key = `models/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`

  // ── 3. Generate presigned PUT URL ──
  const s3 = new S3Client({
    endpoint: STORAGE_ENDPOINT,
    region: STORAGE_REGION,
    forcePathStyle: true,
    credentials: {
      accessKeyId: STORAGE_KEY_ID,
      secretAccessKey: STORAGE_SECRET_KEY,
    },
  })

  const command = new PutObjectCommand({
    Bucket: STORAGE_BUCKET_NAME,
    Key: key,
    ContentType: 'model/gltf-binary',
  })
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 }) // 10 menit — cukup buat file ratusan MB di koneksi lambat

  const publicUrl = `${STORAGE_PUBLIC_URL.replace(/\/$/, '')}/${key}`

  return NextResponse.json({ uploadUrl, publicUrl, key })
}
