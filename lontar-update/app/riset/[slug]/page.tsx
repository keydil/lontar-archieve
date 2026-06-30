import Link from 'next/link'
import { getPublikasiBySlug } from '@/data/riset'

export default function ArtikelDetailPage({ params }: { params: { slug: string } }) {
  const artikel = getPublikasiBySlug(params.slug)

  if (!artikel) {
    return (
      <div className="px-12 py-16 font-mono text-sm text-[rgba(26,26,26,0.5)]">
        Artikel tidak ditemukan.{' '}
        <Link href="/riset" className="underline">
          Kembali ke Riset
        </Link>
      </div>
    )
  }

  const paragraphs = artikel.content.split('\n\n')

  return (
    <div className="px-10 py-10">
      <Link
        href="/riset"
        className="mb-7 inline-block font-mono text-xs tracking-[0.06em] text-[rgba(26,26,26,0.6)]"
      >
        &larr; RISET
      </Link>

      <div className="mb-2.5 flex items-center gap-3">
        <span className="font-mono text-[11px] text-[rgba(26,26,26,0.5)]">{artikel.date}</span>
        <span className="rounded bg-[rgba(26,26,26,0.06)] px-2 py-0.5 font-mono text-[10px] tracking-wide text-[rgba(26,26,26,0.5)]">
          {artikel.category}
        </span>
      </div>

      <h1 className="mb-2 font-serif text-[38px] leading-tight text-[#1a1a1a]">{artikel.title}</h1>
      <div className="mb-9 font-mono text-xs text-[rgba(26,26,26,0.5)]">Oleh {artikel.author}</div>

      <div className="max-w-[680px] border-t border-[rgba(26,26,26,0.15)] pt-8">
        {paragraphs.map((para, i) => (
          <p key={i} className="mb-5 font-serif text-lg leading-[1.78] text-[#1a1a1a]">
            {para}
          </p>
        ))}
      </div>
    </div>
  )
}
