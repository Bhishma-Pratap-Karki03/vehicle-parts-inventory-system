import Icon from '../icons/Icon'
import type { CategoryOption, PartStatusFilter, VendorOption } from '../../shared/interfaces/parts.interface'

type PartsToolbarProps = {
  searchTerm: string
  vendorId: string
  vendorOptions: VendorOption[]
  category: string
  categoryOptions: CategoryOption[]
  status: PartStatusFilter
  includeDeleted: boolean
  onSearchTermChange: (value: string) => void
  onVendorIdChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onStatusChange: (value: PartStatusFilter) => void
  onIncludeDeletedChange: (checked: boolean) => void
  onResetFilters: () => void
}

const inputClassName =
  'h-12 w-full rounded-2xl border border-[#DDE6EF] bg-[#F7FAFC] px-4 text-[15px] font-medium text-[#1F3551] outline-none transition placeholder:text-[#7A8798] focus:border-[#9CB9D8] focus:bg-white focus:ring-4 focus:ring-[#15558D]/10'

const filterablePartStatuses: PartStatusFilter[] = ['all', 'Available', 'Low Stock', 'Unavailable', 'Discontinued']

function PartsToolbar({
  searchTerm,
  vendorId,
  vendorOptions,
  category,
  categoryOptions,
  status,
  includeDeleted,
  onSearchTermChange,
  onVendorIdChange,
  onCategoryChange,
  onStatusChange,
  onIncludeDeletedChange,
  onResetFilters,
}: PartsToolbarProps) {
  return (
    <div className="border-b border-[#E2EAF2] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFDFF_100%)] p-5 sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6C8096]">Inventory workspace</p>
            <h2 className="text-[20px] font-semibold text-[#0F2746] [font-family:var(--font-display)]">Browse, filter, and act on every active part.</h2>
          </div>

          <label className="relative block">
            <Icon
              name="search"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-[#7A8798]"
            />
            <input
              className="h-13 w-full rounded-[20px] border border-[#DDE6EF] bg-[#F7FAFC] pl-12 pr-4 text-[15px] text-[#1F3551] outline-none transition placeholder:text-[#7A8798] focus:border-[#9CB9D8] focus:bg-white focus:ring-4 focus:ring-[#15558D]/10"
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="Search by part name, part number, or category"
              type="search"
              value={searchTerm}
            />
          </label>
        </div>

        <div className="flex flex-col gap-4 xl:min-w-60tems-end">
          <label className="flex items-center gap-3 rounded-full border border-[#D9E3EE] bg-white px-4 py-3 text-[14px] font-medium text-[#435B75] shadow-[0_8px_20px_rgba(19,46,79,0.04)]">
            <input
              checked={includeDeleted}
              className="h-4 w-4 rounded border-[#94A3B8] text-[#15558D] focus:ring-[#15558D]/20"
              onChange={(event) => onIncludeDeletedChange(event.target.checked)}
              type="checkbox"
            />
            Include deleted parts
          </label>

          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D9E5F2] bg-white px-4 text-[14px] font-semibold text-[#154A79] shadow-[0_8px_20px_rgba(19,46,79,0.04)] transition hover:border-[#BCD2EA] hover:bg-[#F7FBFF]"
            onClick={onResetFilters}
            type="button"
          >
            <Icon name="filterOff" className="text-[20px]" />
            Clear filters
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px]">
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6A7A8A]">Vendor ID</span>
          <div className="relative">
            <select
              aria-label="Vendor filter"
              className={`${inputClassName} appearance-none pr-11`}
              onChange={(event) => onVendorIdChange(event.target.value)}
              value={vendorId}
            >
              <option value="">All vendors</option>
              {vendorOptions.map((option) => (
                <option key={option.id} value={String(option.id)}>
                  {option.name}
                </option>
              ))}
            </select>
            <Icon
              name="expandMore"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[22px] text-[#607389]"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6A7A8A]">Category</span>
          <div className="relative">
            <select
              aria-label="Category filter"
              className={`${inputClassName} appearance-none pr-11`}
              onChange={(event) => onCategoryChange(event.target.value)}
              value={category}
            >
              <option value="">All categories</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Icon
              name="expandMore"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[22px] text-[#607389]"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6A7A8A]">Status</span>
          <div className="relative">
            <select
              aria-label="Status filter"
              className={`${inputClassName} appearance-none pr-11`}
              onChange={(event) => onStatusChange(event.target.value as PartStatusFilter)}
              value={status}
            >
              {filterablePartStatuses.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All statuses' : option}
                </option>
              ))}
            </select>
            <Icon
              name="expandMore"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[22px] text-[#607389]"
            />
          </div>
        </label>
      </div>

      <p className="mt-4 text-[13px] leading-6 text-[#70859A]">Vendor and category options are loaded from backend dropdown endpoints.</p>
    </div>
  )
}

export default PartsToolbar
