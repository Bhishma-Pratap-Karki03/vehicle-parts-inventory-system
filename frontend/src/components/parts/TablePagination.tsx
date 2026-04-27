import Icon from '../icons/Icon'

type TablePaginationProps = {
  pageNumber: number
  pageSize: number
  totalRecords: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  isLoading?: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

function buildPageNumbers(pageNumber: number, totalPages: number) {
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (pageNumber <= 2) {
    return [1, 2, 3]
  }

  if (pageNumber >= totalPages - 1) {
    return [totalPages - 2, totalPages - 1, totalPages]
  }

  return [pageNumber - 1, pageNumber, pageNumber + 1]
}

function TablePagination({
  pageNumber,
  pageSize,
  totalRecords,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const pageNumbers = buildPageNumbers(pageNumber, totalPages)
  const rangeStart = totalRecords === 0 ? 0 : (pageNumber - 1) * pageSize + 1
  const rangeEnd = Math.min(pageNumber * pageSize, totalRecords)

  return (
    <footer className="flex flex-col gap-4 border-t border-[#E2EAF2] bg-[#FBFDFF] px-5 py-4 text-[14px] text-[#58708A] sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[13px] font-medium uppercase tracking-[0.12em] text-[#71869D]">Rows per page</span>
        <div className="relative">
          <select
            aria-label="Rows per page"
            className="h-10 appearance-none rounded-full border border-[#D7E2ED] bg-white px-4 pr-10 text-[14px] font-semibold text-[#17314F] outline-none focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10"
            disabled={isLoading}
            onChange={(event) => onPageSizeChange(Number.parseInt(event.target.value, 10))}
            value={pageSize}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <Icon
            name="expandMore"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-[#607389]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:gap-5">
        <span>
          {totalRecords === 0 ? 'No parts found' : `Showing ${rangeStart}-${rangeEnd} of ${totalRecords.toLocaleString()} parts`}
        </span>
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous page"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D7E2ED] bg-white text-[#58708A] transition hover:bg-[#F1F6FB] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!hasPreviousPage || isLoading}
            onClick={() => onPageChange(pageNumber - 1)}
            type="button"
          >
            <Icon name="chevronLeft" className="text-[18px]" />
          </button>

          {pageNumbers.map((page) => (
            <button
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-[13px] font-semibold transition ${
                page === pageNumber
                  ? 'bg-[#15558D] text-white'
                  : 'border border-[#D7E2ED] bg-white text-[#405470] hover:bg-[#F1F6FB]'
              }`}
              disabled={isLoading}
              key={page}
              onClick={() => onPageChange(page)}
              type="button"
            >
              {page}
            </button>
          ))}

          <button
            aria-label="Next page"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D7E2ED] bg-white text-[#58708A] transition hover:bg-[#F1F6FB] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!hasNextPage || isLoading}
            onClick={() => onPageChange(pageNumber + 1)}
            type="button"
          >
            <Icon name="chevronRight" className="text-[18px]" />
          </button>
        </div>
      </div>
    </footer>
  )
}

export default TablePagination
