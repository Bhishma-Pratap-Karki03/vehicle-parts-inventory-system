import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiRequest } from '../../shared/utils/api'
import PartTransactionsTable from '../../components/partTransactions/PartTransactionsTable'
import PartTransactionToolbar from '../../components/partTransactions/PartTransactionToolbar'
import TablePagination from '../../components/parts/TablePagination'
import { mapPartFromApi } from '../../components/parts/parts.helpers'
import {
  buildPartTransactionQueryString,
  createDefaultPartTransactionFilters,
  getApiErrorMessage,
  getRequestErrorMessage,
  mapPartTransactionFromApi,
} from '../../components/partTransactions/partTransactions.helpers'
import type { PagedResult } from '../../shared/interfaces/api.interface'
import type { PartApiModel, PartRecord } from '../../shared/interfaces/parts.interface'
import type {
  PartTransactionApiModel,
  PartTransactionFiltersState,
  PartTransactionRecord,
  PartTransactionTypeFilter,
} from '../../shared/interfaces/partTransactions.interface'

function createEmptyPagination(pageNumber: number, pageSize: number): PagedResult<PartTransactionRecord> {
  return {
    items: [],
    pageNumber,
    pageSize,
    totalRecords: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  }
}

function useDebouncedValue<T>(value: T, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [delay, value])

  return debouncedValue
}

function parseInitialTransactionType(value: null | string): PartTransactionTypeFilter {
  if (value === '1' || value === 'Purchase') {
    return 'Purchase'
  }

  if (value === '2' || value === 'Adjustment') {
    return 'Adjustment'
  }

  return 'all'
}

function PartTransactionListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const scopedPartId = searchParams.get('partId') ?? ''
  const initialTransactionType = parseInitialTransactionType(searchParams.get('transactionType'))

  const [filters, setFilters] = useState<PartTransactionFiltersState>(() => createDefaultPartTransactionFilters(initialTransactionType))
  const [transactionPage, setTransactionPage] = useState<PagedResult<PartTransactionRecord>>(() => createEmptyPagination(1, 10))
  const [partContext, setPartContext] = useState<PartRecord>()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [reloadToken] = useState(0)

  const debouncedSearchTerm = useDebouncedValue(filters.searchTerm, 350)

  useEffect(() => {
    setFilters((current) => {
      if (current.transactionType === initialTransactionType) {
        return current
      }

      return {
        ...current,
        pageNumber: 1,
        transactionType: initialTransactionType,
      }
    })
  }, [initialTransactionType])

  const queryString = useMemo(() => buildPartTransactionQueryString({
    pageNumber: filters.pageNumber,
    pageSize: filters.pageSize,
    partId: scopedPartId,
    searchTerm: debouncedSearchTerm,
    transactionType: filters.transactionType,
  }), [debouncedSearchTerm, filters.pageNumber, filters.pageSize, filters.transactionType, scopedPartId])

  useEffect(() => {
    let isCancelled = false

    const fetchTransactions = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await apiRequest<PagedResult<PartTransactionApiModel>>(`/api/part-transactions${queryString}`)

        if (isCancelled) {
          return
        }

        if (!result.success || !result.data) {
          setTransactionPage(createEmptyPagination(filters.pageNumber, filters.pageSize))
          setErrorMessage(getApiErrorMessage(result.message, result.errors))
          return
        }

        setTransactionPage({
          ...result.data,
          items: result.data.items.map(mapPartTransactionFromApi),
        })
      } catch (error) {
        if (isCancelled) {
          return
        }

        setTransactionPage(createEmptyPagination(filters.pageNumber, filters.pageSize))
        setErrorMessage(getRequestErrorMessage(error, 'Unable to load stock transactions right now.'))
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchTransactions()

    return () => {
      isCancelled = true
    }
  }, [filters.pageNumber, filters.pageSize, queryString, reloadToken])

  useEffect(() => {
    if (!scopedPartId) {
      setPartContext(undefined)
      return
    }

    const numericPartId = Number.parseInt(scopedPartId, 10)

    if (!numericPartId || Number.isNaN(numericPartId)) {
      setPartContext(undefined)
      return
    }

    let isCancelled = false

    const fetchPartContext = async () => {
      try {
        const result = await apiRequest<PartApiModel>(`/api/Parts/${numericPartId}`)

        if (isCancelled) {
          return
        }

        if (!result.success || !result.data) {
          setPartContext(undefined)
          return
        }

        setPartContext(mapPartFromApi(result.data))
      } catch {
        if (isCancelled) {
          return
        }

        setPartContext(undefined)
      }
    }

    void fetchPartContext()

    return () => {
      isCancelled = true
    }
  }, [scopedPartId])

  const pageTitle = partContext ? `${partContext.partName} Stock History` : 'Stock Transactions'
  const pageDescription = partContext
    ? `Review purchase and adjustment movements for ${partContext.partName} without leaving the inventory workflow.`
    : 'Track every purchase and manual adjustment that changes stock levels across the inventory catalog.'

  const clearPartFilter = () => {
    setFilters((current) => ({
      ...current,
      pageNumber: 1,
    }))

    const next = new URLSearchParams(searchParams)
    next.delete('partId')
    setSearchParams(next)
  }

  const resetFilters = () => {
    setFilters(createDefaultPartTransactionFilters())

    const next = new URLSearchParams(searchParams)
    next.delete('partId')
    next.delete('transactionType')
    setSearchParams(next)
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F4F8FC_0%,#EEF4FA_46%,#F8FBFE_100%)] text-[#102B49]">
      <div className="mx-auto w-full max-w-380 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="mb-8 rounded-4xl border border-[#DCE5EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_58%,#EEF5FC_100%)] px-5 py-6 shadow-[0_28px_60px_rgba(18,43,74,0.08)] sm:px-7 sm:py-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">Inventory transactions</p>
              <h1 className="text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)] sm:text-[38px]">
                {pageTitle}
              </h1>
              <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#52677F] sm:text-[16px]">
                {pageDescription}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-5 text-[14px] font-semibold text-[#2E4C70] no-underline shadow-[0_10px_24px_rgba(18,43,74,0.05)] transition hover:bg-[#F7FBFE]"
                to="/parts"
              >
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                  inventory
                </span>
                Parts Management
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-5 text-[14px] font-semibold text-[#2E4C70] no-underline shadow-[0_10px_24px_rgba(18,43,74,0.05)] transition hover:bg-[#F7FBFE]"
                to="/purchase-invoices"
              >
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                  receipt_long
                </span>
                Purchase Invoices
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white no-underline shadow-[0_14px_30px_rgba(21,85,141,0.25)] transition hover:-translate-y-0.5 hover:bg-[#0B4376]"
                to={scopedPartId ? `/stock-transactions/create?partId=${scopedPartId}` : '/stock-transactions/adjust'}
              >
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                  add
                </span>
                Adjust Stock
              </Link>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-[#DCE5EF] bg-white shadow-[0_22px_48px_rgba(18,43,74,0.08)]">
          <PartTransactionToolbar
            onClearPartFilter={scopedPartId ? clearPartFilter : undefined}
            onResetFilters={resetFilters}
            onSearchTermChange={(value) =>
              setFilters((current) => ({
                ...current,
                pageNumber: 1,
                searchTerm: value,
              }))
            }
            onTransactionTypeChange={(value) =>
              setFilters((current) => ({
                ...current,
                pageNumber: 1,
                transactionType: value,
              }))
            }
            partFilterLabel={partContext ? `${partContext.partName} (${partContext.partNumber})` : scopedPartId ? `Part ID ${scopedPartId}` : undefined}
            searchTerm={filters.searchTerm}
            transactionType={filters.transactionType}
          />
          <PartTransactionsTable
            errorMessage={errorMessage}
            isLoading={isLoading}
            transactions={transactionPage.items}
          />
          <TablePagination
            emptyLabel="No stock transactions found"
            hasNextPage={transactionPage.hasNextPage}
            hasPreviousPage={transactionPage.hasPreviousPage}
            isLoading={isLoading}
            itemLabelPlural="transactions"
            itemLabelSingular="transaction"
            onPageChange={(page) =>
              setFilters((current) => ({
                ...current,
                pageNumber: page,
              }))
            }
            onPageSizeChange={(pageSize) =>
              setFilters((current) => ({
                ...current,
                pageNumber: 1,
                pageSize,
              }))
            }
            pageNumber={transactionPage.pageNumber}
            pageSize={transactionPage.pageSize}
            totalPages={transactionPage.totalPages}
            totalRecords={transactionPage.totalRecords}
          />
        </section>
      </div>
    </main>
  )
}

export default PartTransactionListPage
