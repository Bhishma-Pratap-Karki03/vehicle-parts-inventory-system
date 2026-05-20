import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import TablePagination from '../../components/parts/TablePagination'
import SalesInvoiceToolbar from '../../components/salesInvoices/SalesInvoiceToolbar'
import SalesInvoicesTable from '../../components/salesInvoices/SalesInvoicesTable'
import SendSalesInvoiceEmailModal from '../../components/salesInvoices/SendSalesInvoiceEmailModal'
import {
  buildSalesInvoiceQueryString,
  buildSendSalesInvoiceEmailPayload,
  createDefaultSalesInvoiceFilters,
  getApiErrorMessage,
  getPaymentFilterFromQueryValue,
  getRequestErrorMessage,
  mapSalesInvoiceDetailFromApi,
  mapSalesInvoiceListFromApi,
} from '../../components/salesInvoices/salesInvoices.helpers'
import { apiRequest, apiRequestBlob, downloadBlob } from '../../shared/utils/api'
import type { PagedResult } from '../../shared/interfaces/api.interface'
import type {
  SalesInvoiceDetailApiModel,
  SalesInvoiceDetailRecord,
  SalesInvoiceEmailFormValues,
  SalesInvoiceFiltersState,
  SalesInvoiceListItemApiModel,
  SalesInvoiceListItemRecord,
} from '../../shared/interfaces/salesInvoices.interface'

function createEmptyPagination(pageNumber: number, pageSize: number): PagedResult<SalesInvoiceListItemRecord> {
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

function SalesInvoiceListPage() {
  const [filters, setFilters] = useState<SalesInvoiceFiltersState>(() => createDefaultSalesInvoiceFilters())
  const [invoicePage, setInvoicePage] = useState<PagedResult<SalesInvoiceListItemRecord>>(() => createEmptyPagination(1, 10))
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [sendingInvoiceId, setSendingInvoiceId] = useState<null | number>(null)
  const [preparingInvoiceId, setPreparingInvoiceId] = useState<null | number>(null)
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<null | number>(null)
  const [invoicePendingEmail, setInvoicePendingEmail] = useState<null | SalesInvoiceDetailRecord>(null)

  const debouncedSearchTerm = useDebouncedValue(filters.searchTerm, 350)

  const queryString = useMemo(() => buildSalesInvoiceQueryString({
    pageNumber: filters.pageNumber,
    pageSize: filters.pageSize,
    paymentStatus: filters.paymentStatus,
    searchTerm: debouncedSearchTerm,
  }), [debouncedSearchTerm, filters.pageNumber, filters.pageSize, filters.paymentStatus])

  useEffect(() => {
    let isCancelled = false

    const fetchInvoices = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await apiRequest<PagedResult<SalesInvoiceListItemApiModel>>(`/api/sales-invoices${queryString}`)

        if (isCancelled) {
          return
        }

        if (!result.success || !result.data) {
          setInvoicePage(createEmptyPagination(filters.pageNumber, filters.pageSize))
          setErrorMessage(getApiErrorMessage(result.message, result.errors))
          return
        }

        setInvoicePage({
          ...result.data,
          items: result.data.items.map(mapSalesInvoiceListFromApi),
        })
      } catch (error) {
        if (isCancelled) {
          return
        }

        setInvoicePage(createEmptyPagination(filters.pageNumber, filters.pageSize))
        setErrorMessage(getRequestErrorMessage(error, 'Unable to load sales invoices right now.'))
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchInvoices()

    return () => {
      isCancelled = true
    }
  }, [filters.pageNumber, filters.pageSize, queryString, reloadToken])

  async function handleRequestSendEmail(invoice: SalesInvoiceListItemRecord) {
    setPreparingInvoiceId(invoice.salesInvoiceId)

    try {
      const result = await apiRequest<SalesInvoiceDetailApiModel>(`/api/sales-invoices/${invoice.salesInvoiceId}`)

      if (!result.success || !result.data) {
        toast.error(getApiErrorMessage(result.message, result.errors))
        return
      }

      setInvoicePendingEmail(mapSalesInvoiceDetailFromApi(result.data))
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to load invoice details for email preparation.'))
    } finally {
      setPreparingInvoiceId(null)
    }
  }

  async function handleConfirmSendEmail(values: SalesInvoiceEmailFormValues) {
    if (!invoicePendingEmail) {
      return
    }

    setSendingInvoiceId(invoicePendingEmail.salesInvoiceId)

    try {
      const result = await apiRequest<string>(`/api/sales-invoices/${invoicePendingEmail.salesInvoiceId}/email`, {
        body: buildSendSalesInvoiceEmailPayload(values),
        method: 'POST',
      })

      if (!result.success) {
        toast.error(getApiErrorMessage(result.message, result.errors))
        return
      }

      toast.success(result.message || 'Sales invoice email sent successfully.')
      setInvoicePendingEmail(null)
      setReloadToken((current) => current + 1)
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to send this sales invoice email.'))
    } finally {
      setSendingInvoiceId(null)
    }
  }

  async function handleDownloadPdf(invoice: SalesInvoiceListItemRecord) {
    setDownloadingInvoiceId(invoice.salesInvoiceId)

    try {
      const result = await apiRequestBlob(`/api/sales-invoices/${invoice.salesInvoiceId}/download-pdf`)

      if (!result.success || !result.data) {
        throw new Error(getApiErrorMessage(result.message, result.errors))
      }

      downloadBlob(result.data, `${invoice.invoiceNumber || `sales-invoice-${invoice.salesInvoiceId}`}.pdf`)
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to download this sales invoice PDF.'))
    } finally {
      setDownloadingInvoiceId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F4F8FC_0%,#EEF4FA_46%,#F8FBFE_100%)] text-[#102B49]">
      <div className="mx-auto w-full max-w-380 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="mb-8 rounded-4xl border border-[#DCE5EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_58%,#EEF5FC_100%)] px-5 py-6 shadow-[0_28px_60px_rgba(18,43,74,0.08)] sm:px-7 sm:py-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">Customer billing</p>
              <h1 className="text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)] sm:text-[38px]">
                Sales Invoices
              </h1>
              <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#52677F] sm:text-[16px]">
                Track completed sales, review customer billing details, and access invoice PDFs whenever you need them.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:flex-wrap sm:h-full sm:content-center">
              
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white no-underline shadow-[0_14px_30px_rgba(21,85,141,0.25)] transition hover:-translate-y-0.5 hover:bg-[#0B4376]"
                to="/sales-invoices/create"
              >
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                  add
                </span>
                Create Sales Invoice
              </Link>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-[#DCE5EF] bg-white shadow-[0_22px_48px_rgba(18,43,74,0.08)]">
          <SalesInvoiceToolbar
            onPaymentStatusChange={(value) =>
              setFilters((current) => ({
                ...current,
                pageNumber: 1,
                paymentStatus: getPaymentFilterFromQueryValue(value),
              }))
            }
            onResetFilters={() => setFilters(createDefaultSalesInvoiceFilters())}
            onSearchTermChange={(value) =>
              setFilters((current) => ({
                ...current,
                pageNumber: 1,
                searchTerm: value,
              }))
            }
            paymentStatus={filters.paymentStatus}
            searchTerm={filters.searchTerm}
          />
          <SalesInvoicesTable
            downloadingInvoiceId={downloadingInvoiceId}
            errorMessage={errorMessage}
            invoices={invoicePage.items}
            isLoading={isLoading}
            onDownloadPdf={handleDownloadPdf}
            onRequestSendEmail={handleRequestSendEmail}
            preparingInvoiceId={preparingInvoiceId}
            sendingInvoiceId={sendingInvoiceId}
          />
          <TablePagination
            emptyLabel="No sales invoices found"
            hasNextPage={invoicePage.hasNextPage}
            hasPreviousPage={invoicePage.hasPreviousPage}
            isLoading={isLoading}
            itemLabelPlural="sales invoices"
            itemLabelSingular="sales invoice"
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
            pageNumber={invoicePage.pageNumber}
            pageSize={invoicePage.pageSize}
            totalPages={invoicePage.totalPages}
            totalRecords={invoicePage.totalRecords}
          />
        </section>
      </div>

      {invoicePendingEmail ? (
        <SendSalesInvoiceEmailModal
          customerEmail={invoicePendingEmail.customerEmail}
          customerName={invoicePendingEmail.customerName}
          invoiceNumber={invoicePendingEmail.invoiceNumber}
          isBusy={sendingInvoiceId === invoicePendingEmail.salesInvoiceId}
          onCancel={() => {
            if (!sendingInvoiceId) {
              setInvoicePendingEmail(null)
            }
          }}
          onConfirm={handleConfirmSendEmail}
        />
      ) : null}
    </main>
  )
}

export default SalesInvoiceListPage
