import type { PartTransactionTypeFilter } from '../../shared/interfaces/partTransactions.interface'

type PartTransactionToolbarProps = {
  searchTerm: string
  transactionType: PartTransactionTypeFilter
  partFilterLabel?: string
  onSearchTermChange: (value: string) => void
  onTransactionTypeChange: (value: PartTransactionTypeFilter) => void
  onResetFilters: () => void
  onClearPartFilter?: () => void
}

function PartTransactionToolbar({
  searchTerm,
  transactionType,
  partFilterLabel,
  onSearchTermChange,
  onTransactionTypeChange,
  onResetFilters,
  onClearPartFilter,
}: PartTransactionToolbarProps) {
  return (
    <div className="border-b border-[#E2EAF2] px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full max-w-2xl">
          <span
            aria-hidden
            className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 inline-flex -translate-y-1/2 select-none items-center justify-center leading-none text-[22px] text-[#7A8798] not-italic"
          >
            search
          </span>
          <input
            className="h-13 w-full rounded-full border border-[#DFE8F1] bg-[#F8FBFE] pl-12 pr-4 text-[15px] text-[#17314F] outline-none transition placeholder:text-[#7A8FA5] focus:border-[#9CB9D8] focus:bg-white focus:ring-4 focus:ring-[#15558D]/10"
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search by part, part number, invoice, or remarks..."
            type="text"
            value={searchTerm}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <select
              className="h-10 min-w-43 appearance-none rounded-full border border-[#D7E2ED] bg-white px-4 pr-10 text-[13px] font-semibold text-[#35506B] outline-none transition focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10"
              onChange={(event) => onTransactionTypeChange(event.target.value as PartTransactionTypeFilter)}
              value={transactionType}
            >
              <option value="all">All Transactions</option>
              <option value="Purchase">Purchase</option>
              <option value="Adjustment">Adjustment</option>
            </select>
            <span
              aria-hidden
              className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 inline-flex -translate-y-1/2 select-none items-center justify-center leading-none text-[20px] text-[#607389] not-italic"
            >
              expand_more
            </span>
          </div>

          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#35506B] transition hover:bg-[#F7FBFE]"
            onClick={onResetFilters}
            type="button"
          >
            <span aria-hidden className="material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none text-[18px] not-italic">
              filter_alt_off
            </span>
            Reset Filters
          </button>
        </div>
      </div>

      {partFilterLabel ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#D7E2ED] bg-[#F8FBFE] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#33506A]">
            Part Filter: {partFilterLabel}
          </span>
          {onClearPartFilter ? (
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-4 text-[12px] font-semibold text-[#35506B] transition hover:bg-[#F7FBFE]"
              onClick={onClearPartFilter}
              type="button"
            >
              <span aria-hidden className="material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none text-[16px] not-italic">
                close
              </span>
              Clear Part Filter
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default PartTransactionToolbar
