interface PageHeadingProps {
  kicker: string
  title: string
  italic: string
}

export default function PageHeading({ kicker, title, italic }: PageHeadingProps) {
  return (
    <div className="px-12 pb-9 pt-14">
      <div className="mb-2.5 font-mono text-[11px] tracking-[0.12em] text-[rgba(26,26,26,0.55)]">
        {kicker}
      </div>
      <h1 className="m-0 font-serif text-[52px] font-bold leading-[1.05] text-[#1a1a1a]">
        {title}
        <br />
        <em className="font-normal italic">{italic}</em>
      </h1>
    </div>
  )
}
