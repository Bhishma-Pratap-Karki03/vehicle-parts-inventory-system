type PurchaseInvoiceToolbarProps = {
  searchTerm: string
  isLoading?: boolean
  onSearchTermChange: (value: string) => void
  onResetFilters: () => void
}

function PurchaseInvoiceToolbar({
  searchTerm,
  isLoading = false,
  onSearchTermChange,
  onResetFilters,
}: PurchaseInvoiceToolbarProps) {
  return (
    <div className="border-b border-[#E2EAF2] px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-2xl">
          <span
            aria-hidden
            className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 inline-flex -translate-y-1/2 select-none items-center justify-center leading-none text-[22px] text-[#7A8798] not-italic"
          >
            search
          </span>
          <input
            className="h-13 w-full rounded-full border border-[#DFE8F1] bg-[#F8FBFE] pl-12 pr-4 text-[15px] text-[#17314F] outline-none transition placeholder:text-[#7A8FA5] focus:border-[#9CB9D8] focus:bg-white focus:ring-4 focus:ring-[#15558D]/10"
            disabled={isLoading}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search by invoice number or vendor..."
            type="text"
            value={searchTerm}
          />
        </div>

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#35506B] transition hover:bg-[#F7FBFE] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          onClick={onResetFilters}
          type="button"
        >
          <span aria-hidden className="material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none text-[18px] not-italic">
            filter_alt_off
          </span>
          Reset Search
        </button>
      </div>
    </div>
  )
}

export default PurchaseInvoiceToolbar
