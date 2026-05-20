import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import DeletePartModal from '../../components/parts/DeletePartModal'
import PartsInventoryPanel from '../../components/parts/PartsInventoryPanel'
import PartsSidebar from '../../components/parts/PartsSidebar'
import SummaryStats from '../../components/parts/SummaryStats'
import {
  buildLowStockAlerts,
  buildSummaryCards,
  getApiErrorMessage,
  getRequestErrorMessage,
  mapPartFromApi,
  mapStatusLabelToApi,
} from '../../components/parts/parts.helpers'
import { apiRequest } from '../../shared/utils/api'
import type { PagedResult } from '../../shared/interfaces/api.interface'
import type {
  CategoryOption,
  InventorySummaryData,
  PartApiModel,
  PartQueryParams,
  PartRecord,
  PartSummaryApiModel,
  PartsFiltersState,
  VendorOption,
} from '../../shared/interfaces/parts.interface'
function createEmptyPagination(pageNumber: number, pageSize: number): PagedResult<PartRecord> {
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

function createEmptySummary(): InventorySummaryData {
  return {
    totalParts: 0,
    availableParts: 0,
    lowStockParts: 0,
    unavailableParts: 0,
  }
}

function createDefaultPartsFilters(): PartsFiltersState {
  return {
    searchTerm: '',
    vendorId: '',
    category: '',
    status: 'all',
    includeDeleted: false,
    pageNumber: 1,
    pageSize: 10,
  }
}

function buildPartsQueryString(query: PartQueryParams) {
  const params = new URLSearchParams()

  if (query.searchTerm) {
    params.set('searchTerm', query.searchTerm)
  }

  if (query.vendorId !== undefined) {
    params.set('vendorId', String(query.vendorId))
  }

  if (query.category) {
    params.set('category', query.category)
  }

  if (query.status !== undefined) {
    params.set('status', String(query.status))
  }

  if (query.lowStockOnly !== undefined) {
    params.set('lowStockOnly', String(query.lowStockOnly))
  }

  if (query.includeDeleted !== undefined) {
    params.set('includeDeleted', String(query.includeDeleted))
  }

  if (query.pageNumber !== undefined) {
    params.set('pageNumber', String(query.pageNumber))
  }

  if (query.pageSize !== undefined) {
    params.set('pageSize', String(query.pageSize))
  }

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
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

const inventoryGuidelines = [
  'Update stock immediately upon delivery receipt.',
  'Audit high-value engine parts weekly.',
  "Tag obsolete items as 'Discontinued' for archiving.",
]

function PartsManagementPage() {
  const [filters, setFilters] = useState<PartsFiltersState>(() => createDefaultPartsFilters())
  const [vendorOptions, setVendorOptions] = useState<VendorOption[]>([])
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])
  const [partsPage, setPartsPage] = useState<PagedResult<PartRecord>>(() => createEmptyPagination(1, 10))
  const [summary, setSummary] = useState<InventorySummaryData>(() => createEmptySummary())
  const [alerts, setAlerts] = useState(() => buildLowStockAlerts([]))
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarLoading, setIsSidebarLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [summaryError, setSummaryError] = useState<null | string>(null)
  const [deletingPartId, setDeletingPartId] = useState<null | number>(null)
  const [partPendingDelete, setPartPendingDelete] = useState<PartRecord | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const debouncedSearchTerm = useDebouncedValue(filters.searchTerm, 350)
  const { category, includeDeleted, pageNumber, pageSize, status, vendorId } = filters

  const listQuery = useMemo(() => {
    const query: PartQueryParams = {
      includeDeleted,
      pageNumber,
      pageSize,
    }

    if (debouncedSearchTerm.trim()) {
      query.searchTerm = debouncedSearchTerm.trim()
    }

    if (vendorId.trim()) {
      query.vendorId = Number.parseInt(vendorId, 10)
    }

    if (category.trim()) {
      query.category = category.trim()
    }

    if (status === 'Low Stock') {
      query.lowStockOnly = true
    } else if (status !== 'all') {
      query.status = mapStatusLabelToApi(status)
    }

    return query
  }, [category, debouncedSearchTerm, includeDeleted, pageNumber, pageSize, status, vendorId])

  useEffect(() => {
    let isCancelled = false

    const fetchFilterOptions = async () => {
      try {
        const [vendorsResult, categoriesResult] = await Promise.all([
          apiRequest<VendorOption[]>('/api/Parts/vendors/options'),
          apiRequest<CategoryOption[]>('/api/Parts/categories/options'),
        ])

        if (isCancelled) {
          return
        }

        setVendorOptions(vendorsResult.success && vendorsResult.data ? vendorsResult.data : [])
        setCategoryOptions(categoriesResult.success && categoriesResult.data ? categoriesResult.data : [])
      } catch {
        if (isCancelled) {
          return
        }

        setVendorOptions([])
        setCategoryOptions([])
      }
    }

    void fetchFilterOptions()

    return () => {
      isCancelled = true
    }
  }, [reloadToken])

  useEffect(() => {
    let isCancelled = false

    const fetchParts = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await apiRequest<PagedResult<PartApiModel>>(`/api/Parts${buildPartsQueryString(listQuery)}`)

        if (isCancelled) {
          return
        }

        if (!result.success || !result.data) {
          setPartsPage(createEmptyPagination(listQuery.pageNumber ?? 1, listQuery.pageSize ?? 10))
          setErrorMessage(getApiErrorMessage(result.message, result.errors))
          return
        }

        setPartsPage({
          ...result.data,
          items: result.data.items.map(mapPartFromApi),
        })
      } catch (error) {
        if (isCancelled) {
          return
        }

        setPartsPage(createEmptyPagination(listQuery.pageNumber ?? 1, listQuery.pageSize ?? 10))
        setErrorMessage(getRequestErrorMessage(error, 'Unable to reach the parts API.'))
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchParts()

    return () => {
      isCancelled = true
    }
  }, [listQuery, reloadToken])

  useEffect(() => {
    let isCancelled = false

    const fetchInsights = async () => {
      setIsSidebarLoading(true)
      setSummaryError(null)

      try {
        const [summaryResult, lowStockResult] = await Promise.all([
          apiRequest<PartSummaryApiModel>('/api/Parts/summary'),
          apiRequest<PartApiModel[]>('/api/Parts/low-stock'),
        ])

        if (isCancelled) {
          return
        }

        if (!summaryResult.success || !summaryResult.data) {
          throw new Error(getApiErrorMessage(summaryResult.message, summaryResult.errors))
        }

        if (!lowStockResult.success || !lowStockResult.data) {
          throw new Error(getApiErrorMessage(lowStockResult.message, lowStockResult.errors))
        }

        const lowStockParts = lowStockResult.data.map(mapPartFromApi)

        setSummary({
          totalParts: summaryResult.data.totalParts,
          availableParts: summaryResult.data.availableParts,
          lowStockParts: summaryResult.data.lowStockParts,
          unavailableParts: summaryResult.data.unavailableParts,
        })
        setAlerts(buildLowStockAlerts(lowStockParts))
      } catch (error) {
        if (isCancelled) {
          return
        }

        setSummary(createEmptySummary())
        setAlerts([])
        setSummaryError(getRequestErrorMessage(error, 'Unable to load summary data from the backend.'))
      } finally {
        if (!isCancelled) {
          setIsSidebarLoading(false)
        }
      }
    }

    void fetchInsights()

    return () => {
      isCancelled = true
    }
  }, [reloadToken])

  const summaryCards = useMemo(() => buildSummaryCards(summary), [summary])

  function updateFilters(updater: (current: PartsFiltersState) => PartsFiltersState) {
    setFilters((current) => updater(current))
  }

  function handleDeleteRequest(part: PartRecord) {
    setPartPendingDelete(part)
  }

  async function handleConfirmDelete() {
    if (!partPendingDelete) {
      return
    }

    const pendingPart = partPendingDelete
    setDeletingPartId(pendingPart.partId)

    try {
      const result = await apiRequest<{ deletedAt: string; partId: number }>(`/api/Parts/${pendingPart.partId}`, {
        method: 'DELETE',
      })

      if (!result.success) {
        toast.error(getApiErrorMessage(result.message, result.errors))
        return
      }

      toast.success(result.message || 'Part deleted successfully.')
      setPartPendingDelete(null)

      if (partsPage.items.length === 1 && filters.pageNumber > 1) {
        setFilters((current) => ({
          ...current,
          pageNumber: current.pageNumber - 1,
        }))
      }

      setReloadToken((current) => current + 1)
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to delete this part right now.'))
    } finally {
      setDeletingPartId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F4F8FC_0%,#EEF4FA_46%,#F8FBFE_100%)] text-[#102B49]">
      <div className="mx-auto w-full max-w-370 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="mb-8 rounded-4xl border border-[#DCE5EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_58%,#EEF5FC_100%)] px-5 py-6 shadow-[0_28px_60px_rgba(18,43,74,0.08)] sm:px-7 sm:py-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">Operations dashboard</p>
              <h1 className="text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)] sm:text-[38px]">
                Parts Management
              </h1>
              <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#52677F] sm:text-[16px]">
                Manage the parts of the inventory.
              </p>
            </div>

            <div className="grid w-full max-w-98 grid-cols-2 gap-3 xl:justify-items-end">
              <Link
                className="inline-flex h-12 w-full min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#2E4C70] no-underline shadow-[0_10px_24px_rgba(18,43,74,0.05)] transition hover:bg-[#F7FBFE] sm:px-5 sm:text-[14px]"
                to="/purchase-invoices"
              >
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                  receipt_long
                </span>
                Purchase Invoices
              </Link>
              <Link
                className="inline-flex h-12 w-full min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#15558D] px-4 text-[13px] font-semibold text-white no-underline shadow-[0_14px_30px_rgba(21,85,141,0.25)] transition hover:-translate-y-0.5 hover:bg-[#0B4376] sm:px-5 sm:text-[14px]"
                to="/parts/new"
              >
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                  add
                </span>
                Add New Part
              </Link>
            </div>
          </div>

          {summaryError ? <p className="mt-4 text-[14px] text-[#A94E48]">{summaryError}</p> : null}
        </section>

        <SummaryStats cards={summaryCards} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <PartsInventoryPanel
            categoryOptions={categoryOptions}
            deletingPartId={deletingPartId}
            errorMessage={errorMessage}
            filters={filters}
            isLoading={isLoading}
            onCategoryChange={(value) =>
              updateFilters((current) => ({
                ...current,
                category: value,
                pageNumber: 1,
              }))
            }
            onDeletePart={handleDeleteRequest}
            onIncludeDeletedChange={(checked) =>
              updateFilters((current) => ({
                ...current,
                includeDeleted: checked,
                pageNumber: 1,
              }))
            }
            onPageChange={(page) =>
              updateFilters((current) => ({
                ...current,
                pageNumber: page,
              }))
            }
            onPageSizeChange={(newPageSize) =>
              updateFilters((current) => ({
                ...current,
                pageSize: newPageSize,
                pageNumber: 1,
              }))
            }
            onResetFilters={() => setFilters(createDefaultPartsFilters())}
            onSearchTermChange={(value) =>
              updateFilters((current) => ({
                ...current,
                searchTerm: value,
                pageNumber: 1,
              }))
            }
            onStatusChange={(value) =>
              updateFilters((current) => ({
                ...current,
                status: value,
                pageNumber: 1,
              }))
            }
            onVendorIdChange={(value) =>
              updateFilters((current) => ({
                ...current,
                vendorId: value,
                pageNumber: 1,
              }))
            }
            pagination={partsPage}
            parts={partsPage.items}
            vendorOptions={vendorOptions}
          />

          <PartsSidebar
            alerts={alerts}
            guidelines={inventoryGuidelines}
            isLoading={isSidebarLoading}
            onReviewAllAlerts={() =>
              setFilters((current) => ({
                ...current,
                pageNumber: 1,
                status: 'Low Stock',
              }))
            }
          />
        </div>
      </div>

      {partPendingDelete ? (
        <DeletePartModal
          part={partPendingDelete}
          isDeleting={deletingPartId === partPendingDelete.partId}
          onCancel={() => {
            if (!deletingPartId) {
              setPartPendingDelete(null)
            }
          }}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </main>
  )
}

export default PartsManagementPage
