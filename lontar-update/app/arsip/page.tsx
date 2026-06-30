import Link from 'next/link'
import PageHeading from '@/components/PageHeading'
import { arsipEntries } from '@/data/arsip'

export default function ArsipPage() {
  return (
    <div>
      <PageHeading kicker="DIGITAL ARCHIVE — TEKS & TRANSKRIPSI" title="Arsip" italic="Naskah" />

      <div className="px-12 pb-16">
        {arsipEntries.map((entry) => (
          <Link
            key={entry.slug}
            href={`/arsip/${entry.slug}`}
            className="-mt-px block border-y border-[rgba(26,26,26,0.15)] py-7 first:mt-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-2 font-mono text-[11px] tracking-[0.07em] text-[rgba(26,26,26,0.5)]">
                  {entry.script} &middot; {entry.period}
                </div>
                <div className="mb-2 font-serif text-[26px] text-[#1a1a1a]">{entry.title}</div>
                <div className="max-w-[560px] font-mono text-[13px] leading-relaxed text-[rgba(26,26,26,0.6)]">
                  {entry.excerpt}
                </div>
              </div>
              <div className="ml-5 whitespace-nowrap font-mono text-[11px] tracking-[0.06em] text-[#1a1a1a]">
                BACA &rarr;
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
