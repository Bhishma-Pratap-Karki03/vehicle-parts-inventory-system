import type { UseFormRegisterReturn } from 'react-hook-form'
import PartArtwork from './PartArtwork'

type PartImageUploaderProps = {
  resolvedImageUrl?: string | null
  category?: string
  title: string
  fileName?: string
  registration: UseFormRegisterReturn
  onDeleteCurrentImage?: () => void
  isDeletingImage?: boolean
}

function PartImageUploader({
  resolvedImageUrl,
  category,
  title,
  fileName,
  registration,
  onDeleteCurrentImage,
  isDeletingImage = false,
}: PartImageUploaderProps) {
  return (
    <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-5 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
          <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
            image
          </span>
        </span>
        <div>
          <h2 className="text-[23px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Part Image</h2>
          <p className="mt-1 text-[14px] text-[#678099]">Upload one primary image for the catalog preview.</p>
        </div>
      </div>

      <div className="mt-5">
        <PartArtwork category={category || 'Uploader'} className="aspect-5/3" resolvedImageUrl={resolvedImageUrl} title={title || 'Primary image'} />
      </div>

      <div className="relative mt-5">
        <label className="flex cursor-pointer flex-col rounded-[22px] border border-dashed border-[#B7CAE0] bg-[#F8FBFE] p-4 pr-4 transition hover:border-[#8FB0D3] hover:bg-[#F3F8FD] sm:pr-32">
          <input accept="image/png,image/jpeg,image/webp" className="sr-only" type="file" {...registration} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#15558D] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(21,85,141,0.2)]">
              <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                image
              </span>
              Choose Image
            </span>
          </div>

          <span className="mt-5 text-[14px] font-medium text-[#1E3550]">
            {fileName ? fileName : 'PNG, JPG, or WEBP up to 2 MB'}
          </span>
          <span className="mt-1 text-[12px] text-[#748AA1]">The top live preview updates instantly after you select a file.</span>
        </label>

        {onDeleteCurrentImage ? (
          <button
            className="absolute right-4 top-4 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#E7CFCB] bg-white/92 px-3 py-2 text-[12px] font-semibold text-[#A4564B] shadow-[0_10px_20px_rgba(164,86,75,0.08)] backdrop-blur transition hover:bg-[#FFF5F2] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isDeletingImage}
            onClick={onDeleteCurrentImage}
            type="button"
          >
            <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[16px] not-italic">
              delete
            </span>
            {isDeletingImage ? 'Deleting...' : 'Delete'}
          </button>
        ) : null}
      </div>
    </section>
  )
}

export default PartImageUploader
