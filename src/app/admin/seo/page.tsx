'use client'

import { useEffect, useState } from 'react'
import { getSettings, upsertSettings, type SiteSettings } from '@/lib/cms'
import { defaultSettings } from '@/data/settings'
import { Field, Input, Textarea, Button, Skeleton } from '@/components/admin/AdminUI'
import { toast } from '@/components/admin/Feedback'

const mono = "'DM Mono', monospace"
const serif = "'Playfair Display', serif"

export default function SeoSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    getSettings().then((s) => { if (active) setSettings(s) })
    return () => { active = false }
  }, [])

  if (!settings) {
    return (
      <div>
        <Skeleton width="220px" height="36px" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="60%" height="14px" style={{ marginBottom: '2rem', maxWidth: '620px' }} />
        <Skeleton width="100%" height="280px" style={{ borderRadius: '10px' }} />
      </div>
    )
  }

  const patch = (p: Partial<SiteSettings>) => setSettings((s) => (s ? { ...s, ...p } : s))

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    try {
      await upsertSettings(settings)
      toast('Pengaturan SEO tersimpan.', 'success')
    } catch (e) {
      toast('Gagal menyimpan: ' + (e as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 style={{ fontFamily: serif, fontSize: '36px', fontWeight: 900, marginBottom: '0.5rem' }}>SEO &amp; Schema</h1>
      <p style={{ fontFamily: mono, fontSize: '14px', color: 'var(--warm)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '620px' }}>
        Judul & deskripsi yang tampil di hasil pencarian Google, plus identitas museum buat data terstruktur
        (schema.org). Perubahan tampil di situs publik dalam beberapa saat (di-cache maksimal 1 jam), gak perlu
        deploy ulang.
      </p>

      <div style={{ maxWidth: '620px' }}>
        <Field
          label="Judul Situs (Meta Title)"
          hint={`Bawaan: "${defaultSettings.siteTitle}"`}
        >
          <Input value={settings.siteTitle} onChange={(e) => patch({ siteTitle: e.target.value })} />
        </Field>

        <Field
          label="Deskripsi Situs (Meta Description)"
          hint="Muncul sebagai cuplikan di bawah judul pada hasil pencarian Google."
        >
          <Textarea value={settings.siteDescription} onChange={(e) => patch({ siteDescription: e.target.value })} style={{ minHeight: '90px' }} />
        </Field>

        <Field label="Nama Organisasi" hint="Dipakai di data terstruktur schema.org (Museum).">
          <Input value={settings.orgName} onChange={(e) => patch({ orgName: e.target.value })} />
        </Field>

        <Field label="Deskripsi Organisasi">
          <Textarea value={settings.orgDescription} onChange={(e) => patch({ orgDescription: e.target.value })} style={{ minHeight: '90px' }} />
        </Field>

        {/* Pratinjau hasil pencarian Google */}
        <p style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--warm)', marginBottom: '0.5rem' }}>
          Pratinjau Google
        </p>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', fontFamily: 'arial, sans-serif' }}>
          <div style={{ fontSize: '12px', color: '#202124' }}>artefak.museumtalagamanggung.com</div>
          <div style={{ fontSize: '18px', color: '#1a0dab', margin: '0.2rem 0' }}>{settings.siteTitle}</div>
          <div style={{ fontSize: '13px', color: '#4d5156', lineHeight: 1.5 }}>{settings.siteDescription}</div>
        </div>

        <Button variant="solid" disabled={saving} onClick={handleSave}>
          {saving ? 'Menyimpan…' : '✓ Simpan Pengaturan'}
        </Button>
      </div>
    </div>
  )
}
