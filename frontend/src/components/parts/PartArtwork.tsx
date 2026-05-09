type PartArtworkProps = {
  resolvedImageUrl?: string | null
  title: string
  category?: string
  className?: string
}

function PartArtwork({ resolvedImageUrl, title, category, className = 'aspect-5/3' }: PartArtworkProps) {
  if (resolvedImageUrl) {
    return (
      <div className={`overflow-hidden rounded-3xlrder border-[#D8E3EE] bg-[#F7FAFD] ${className}`}>
        <img alt={title || 'Part preview'} className="h-full w-full object-cover" src={resolvedImageUrl} />
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-[#D8E3EE] bg-[radial-gradient(circle_at_24%_20%,rgba(255,255,255,0.42),transparent_22%),linear-gradient(135deg,#0F2949_0%,#22466D_42%,#A7BED5_100%)] ${className}`}
    >
      <div className="absolute -right-10 top-5 h-28 w-28 rounded-full border border-white/20 bg-white/10 blur-[2px]" />
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(180deg,rgba(7,20,36,0.04)_0%,rgba(7,20,36,0.18)_100%)]" />

      <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
        <div className="flex justify-end">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
            {category || 'Preview'}
          </span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-white/72">Awaiting image upload</p>
            <p className="mt-2 max-w-56 wrap-break-word text-[20px] font-semibold leading-tight text-white [font-family:var(--font-display)]">
              {title || 'New catalog item'}
            </p>
          </div>

          <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border border-white/18 bg-white/12 text-white shadow-[0_14px_30px_rgba(10,20,34,0.2)] backdrop-blur-sm">
            <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[32px] not-italic">
              inventory_2
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default PartArtwork
