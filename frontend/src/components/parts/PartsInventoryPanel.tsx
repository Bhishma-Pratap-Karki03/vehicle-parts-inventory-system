import PartsTable from './PartsTable'
import PartsToolbar from './PartsToolbar'
import TablePagination from './TablePagination'
import type { CategoryOption, PartRecord, PartsFiltersState, VendorOption } from '../../shared/interfaces/parts.interface'
import type { PagedResult } from '../../shared/interfaces/api.interface'

type PartsInventoryPanelProps = {
  categoryOptions: CategoryOption[]
  parts: PartRecord[]
  filters: PartsFiltersState
  vendorOptions: VendorOption[]
  pagination: Pick<PagedResult<PartRecord>, 'hasNextPage' | 'hasPreviousPage' | 'pageNumber' | 'pageSize' | 'totalPages' | 'totalRecords'>
  isLoading: boolean
  errorMessage?: null | string
  deletingPartId?: null | number
  onSearchTermChange: (value: string) => void
  onVendorIdChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onStatusChange: (value: PartsFiltersState['status']) => void
  onIncludeDeletedChange: (checked: boolean) => void
  onResetFilters: () => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onDeletePart: (part: PartRecord) => void
}

function PartsInventoryPanel({
  categoryOptions,
  parts,
  filters,
  vendorOptions,
  pagination,
  isLoading,
  errorMessage,
  deletingPartId,
  onSearchTermChange,
  onVendorIdChange,
  onCategoryChange,
  onStatusChange,
  onIncludeDeletedChange,
  onResetFilters,
  onPageChange,
  onPageSizeChange,
  onDeletePart,
}: PartsInventoryPanelProps) {
  return (
    <section
      className="overflow-hidden rounded-[28px] border border-[#DCE5EF] bg-white shadow-[0_22px_48px_rgba(18,43,74,0.08)]"
      aria-label="Parts inventory"
    >
      <PartsToolbar
        category={filters.category}
        categoryOptions={categoryOptions}
        includeDeleted={filters.includeDeleted}
        onCategoryChange={onCategoryChange}
        onIncludeDeletedChange={onIncludeDeletedChange}
        onResetFilters={onResetFilters}
        onSearchTermChange={onSearchTermChange}
        onStatusChange={onStatusChange}
        onVendorIdChange={onVendorIdChange}
        searchTerm={filters.searchTerm}
        status={filters.status}
        vendorId={filters.vendorId}
        vendorOptions={vendorOptions}
      />
      <PartsTable
        deletingPartId={deletingPartId}
        errorMessage={errorMessage}
        isLoading={isLoading}
        onDeletePart={onDeletePart}
        parts={parts}
      />
      <TablePagination
        hasNextPage={pagination.hasNextPage}
        hasPreviousPage={pagination.hasPreviousPage}
        isLoading={isLoading}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageNumber={pagination.pageNumber}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        totalRecords={pagination.totalRecords}
      />
    </section>
  )
}

export default PartsInventoryPanel
