import type { SalesInvoicePaymentStatusFilter } from '../../shared/interfaces/salesInvoices.interface'

type SalesInvoiceToolbarProps = {
  searchTerm: string
  paymentStatus: SalesInvoicePaymentStatusFilter
  onSearchTermChange: (value: string) => void
  onPaymentStatusChange: (value: SalesInvoicePaymentStatusFilter) => void
  onResetFilters: () => void
}

function SalesInvoiceToolbar({
  searchTerm,
  paymentStatus,
  onSearchTermChange,
  onPaymentStatusChange,
  onResetFilters,
}: SalesInvoiceToolbarProps) {
  return (
    <div className="border-b border-[#E2EAF2] px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-4">
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
              placeholder="Search by invoice number, customer, or vehicle..."
              type="text"
              value={searchTerm}
            />
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

        <div className="grid gap-3 lg:grid-cols-[220px]">
          <div className="relative">
            <select
              className="h-10 w-full appearance-none rounded-full border border-[#D7E2ED] bg-white px-4 pr-10 text-[13px] font-semibold text-[#35506B] outline-none transition focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10"
              onChange={(event) => onPaymentStatusChange(event.target.value as SalesInvoicePaymentStatusFilter)}
              value={paymentStatus}
            >
              <option value="all">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
            </select>
            <span
              aria-hidden
              className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 inline-flex -translate-y-1/2 select-none items-center justify-center leading-none text-[20px] text-[#607389] not-italic"
            >
              expand_more
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesInvoiceToolbar
