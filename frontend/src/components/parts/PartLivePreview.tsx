import PartArtwork from './PartArtwork'
import type { PartDisplayStatus, PartEditorMode } from '../../shared/interfaces/parts.interface'
import { formatRupees } from './parts.helpers'

type PartLivePreviewProps = {
  mode: PartEditorMode
  name: string
  partNumber: string
  vendor: string
  category: string
  retailPrice: string
  stockQuantity: number
  status: PartDisplayStatus
  resolvedImageUrl?: string | null
}

const statusLabelClasses: Record<PartDisplayStatus, string> = {
  Available: 'bg-[#EEFCF3] text-[#16784A]',
  'Low Stock': 'bg-[#FFF3EB] text-[#9A3E0B]',
  Discontinued: 'bg-[#FFF1F1] text-[#C54141]',
  Unavailable: 'bg-[#F4F7FA] text-[#516579]',
}

function PartLivePreview({
  mode,
  name,
  partNumber,
  vendor,
  category,
  retailPrice,
  stockQuantity,
  status,
  resolvedImageUrl,
}: PartLivePreviewProps) {
  const previewStatusLabel = mode === 'create' ? 'New Item' : status

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#DCE5EF] bg-white shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
      <div className="flex items-center justify-between bg-[#123E69] px-5 py-4 text-white">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Sidebar</p>
          <h2 className="mt-1 text-[23px] font-semibold tracking-[-0.02em] [font-family:var(--font-display)]">Live Preview</h2>
        </div>

        <span
          className={`inline-flex min-h-8 items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
            mode === 'create' ? 'bg-[#FFD9C8] text-[#6F2C00]' : statusLabelClasses[status]
          }`}
        >
          {previewStatusLabel}
        </span>
      </div>

      <div className="space-y-5 p-5">
        <PartArtwork category={category || 'Preview'} resolvedImageUrl={resolvedImageUrl} title={name || 'New catalog item'} />

        <div>
          <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-[#112B49] [font-family:var(--font-display)]">
            {name || 'Part name will appear here'}
          </h3>
          <p className="mt-2 text-[14px] text-[#5E7690]">MPN: {partNumber || 'BP-000000'}</p>
          <p className="mt-1 text-[14px] text-[#6F849B]">{vendor || 'Choose a supplier to complete the preview card.'}</p>
        </div>

        <div className="grid gap-4 rounded-[24px] border border-[#E3EAF2] bg-[#F8FBFE] p-4 sm:grid-cols-2">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#74879A]">Retail Price</p>
            <p className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-[#0F4275] [font-family:var(--font-display)]">
              {formatRupees(retailPrice)}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#74879A]">Current Stock</p>
            <p className="mt-2 text-[18px] font-semibold text-[#132D4B]">{stockQuantity} Units</p>
            <p className="mt-1 text-[13px] text-[#6C8197]">{category || 'Select a category to classify this part.'}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PartLivePreview
