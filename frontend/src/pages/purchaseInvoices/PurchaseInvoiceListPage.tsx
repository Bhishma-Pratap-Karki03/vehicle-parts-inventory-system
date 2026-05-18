import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import PurchaseInvoicesTable from '../../components/purchaseInvoices/PurchaseInvoicesTable'
import PurchaseInvoiceToolbar from '../../components/purchaseInvoices/PurchaseInvoiceToolbar'
import SendPurchaseInvoiceEmailModal from '../../components/purchaseInvoices/SendPurchaseInvoiceEmailModal'
import TablePagination from '../../components/parts/TablePagination'
import {
  buildPurchaseInvoiceQueryString,
  createDefaultPurchaseInvoiceFilters,
  getApiErrorMessage,
  getRequestErrorMessage,
  mapPurchaseInvoiceDetailFromApi,
  mapPurchaseInvoiceListFromApi,
  readApiResponse,
} from '../../components/purchaseInvoices/purchaseInvoices.helpers'
import type { PagedResult } from '../../shared/interfaces/api.interface'
import type {
  PurchaseInvoiceDetailApiModel,
  PurchaseInvoiceDetailRecord,
  PurchaseInvoiceFiltersState,
  PurchaseInvoiceListItemApiModel,
  PurchaseInvoiceListItemRecord,
} from '../../shared/interfaces/purchaseInvoices.interface'

import backendUrl from '../../config';

function createEmptyPagination(pageNumber: number, pageSize: number): PagedResult<PurchaseInvoiceListItemRecord> {
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

function PurchaseInvoiceListPage() {
  const [filters, setFilters] = useState<PurchaseInvoiceFiltersState>(() => createDefaultPurchaseInvoiceFilters())
  const [invoicePage, setInvoicePage] = useState<PagedResult<PurchaseInvoiceListItemRecord>>(() => createEmptyPagination(1, 10))
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [sendingInvoiceId, setSendingInvoiceId] = useState<null | number>(null)
  const [preparingInvoiceId, setPreparingInvoiceId] = useState<null | number>(null)
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<null | number>(null)
  const [invoicePendingEmail, setInvoicePendingEmail] = useState<null | PurchaseInvoiceDetailRecord>(null)

  const debouncedSearchTerm = useDebouncedValue(filters.searchTerm, 350)

  const queryString = useMemo(() => buildPurchaseInvoiceQueryString({
    pageNumber: filters.pageNumber,
    pageSize: filters.pageSize,
    searchTerm: debouncedSearchTerm,
  }), [debouncedSearchTerm, filters.pageNumber, filters.pageSize])

  useEffect(() => {
    let isCancelled = false

    const fetchInvoices = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await fetch(`${backendUrl}/api/purchase-invoices${queryString}`)
        const result = await readApiResponse<PagedResult<PurchaseInvoiceListItemApiModel>>(response)

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
          items: result.data.items.map(mapPurchaseInvoiceListFromApi),
        })
      } catch (error) {
        if (isCancelled) {
          return
        }

        setInvoicePage(createEmptyPagination(filters.pageNumber, filters.pageSize))
        setErrorMessage(getRequestErrorMessage(error, 'Unable to load purchase invoices right now.'))
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

  async function handleRequestSendEmail(invoice: PurchaseInvoiceListItemRecord) {
    setPreparingInvoiceId(invoice.purchaseInvoiceId)

    try {
      const response = await fetch(`${backendUrl}/api/purchase-invoices/${invoice.purchaseInvoiceId}`)
      const result = await readApiResponse<PurchaseInvoiceDetailApiModel>(response)

      if (!result.success || !result.data) {
        toast.error(getApiErrorMessage(result.message, result.errors))
        return
      }

      setInvoicePendingEmail(mapPurchaseInvoiceDetailFromApi(result.data))
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to load invoice details for email confirmation.'))
    } finally {
      setPreparingInvoiceId(null)
    }
  }

  async function handleConfirmSendEmail() {
    if (!invoicePendingEmail) {
      return
    }

    setSendingInvoiceId(invoicePendingEmail.purchaseInvoiceId)

    try {
      const response = await fetch(`${backendUrl}/api/purchase-invoices/${invoicePendingEmail.purchaseInvoiceId}/send-email`, {
        method: 'POST',
      })

      const result = await readApiResponse<string>(response)

      if (!result.success) {
        toast.error(getApiErrorMessage(result.message, result.errors))
        return
      }

      toast.success(result.message || 'Purchase invoice email sent successfully.')
      setInvoicePendingEmail(null)
      setReloadToken((current) => current + 1)
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to send this purchase invoice email.'))
    } finally {
      setSendingInvoiceId(null)
    }
  }

  async function handleDownloadPdf(invoice: PurchaseInvoiceListItemRecord) {
    setDownloadingInvoiceId(invoice.purchaseInvoiceId)

    try {
      const response = await fetch(`${backendUrl}/api/purchase-invoices/${invoice.purchaseInvoiceId}/download-pdf`)

      if (!response.ok) {
        const result = await readApiResponse<never>(response)
        throw new Error(getApiErrorMessage(result.message, result.errors))
      }

      const pdfBlob = await response.blob()
      const objectUrl = window.URL.createObjectURL(pdfBlob)
      const downloadLink = document.createElement('a')

      downloadLink.href = objectUrl
      downloadLink.download = `${invoice.invoiceNumber || `purchase-invoice-${invoice.purchaseInvoiceId}`}.pdf`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      downloadLink.remove()
      window.URL.revokeObjectURL(objectUrl)
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to download this purchase invoice PDF.'))
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
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">Inventory transactions</p>
              <h1 className="text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)] sm:text-[38px]">
                Purchase Invoices
              </h1>
              <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#52677F] sm:text-[16px]">
                Track restock history, inspect invoice details, and manually send vendor copies whenever you need them.
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
                to="/sales-invoices"
              >
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                  request_quote
                </span>
                Sales Invoices
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white no-underline shadow-[0_14px_30px_rgba(21,85,141,0.25)] transition hover:-translate-y-0.5 hover:bg-[#0B4376]"
                to="/purchase-invoices/create"
              >
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                  add
                </span>
                Create Purchase Invoice
              </Link>
            </div>
          </div>
        </section>

        <div>
          <section className="overflow-hidden rounded-[28px] border border-[#DCE5EF] bg-white shadow-[0_22px_48px_rgba(18,43,74,0.08)]">
            <PurchaseInvoiceToolbar
              isLoading={isLoading}
              onResetFilters={() => setFilters(createDefaultPurchaseInvoiceFilters())}
              onSearchTermChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  pageNumber: 1,
                  searchTerm: value,
                }))
              }
              searchTerm={filters.searchTerm}
            />
            <PurchaseInvoicesTable
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
              emptyLabel="No purchase invoices found"
              hasNextPage={invoicePage.hasNextPage}
              hasPreviousPage={invoicePage.hasPreviousPage}
              isLoading={isLoading}
              itemLabelPlural="purchase invoices"
              itemLabelSingular="purchase invoice"
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
      </div>

      {invoicePendingEmail ? (
        <SendPurchaseInvoiceEmailModal
          emailSentAt={invoicePendingEmail.emailSentAt}
          invoiceNumber={invoicePendingEmail.invoiceNumber}
          isBusy={sendingInvoiceId === invoicePendingEmail.purchaseInvoiceId}
          isEmailSent={invoicePendingEmail.isEmailSent}
          onCancel={() => {
            if (!sendingInvoiceId) {
              setInvoicePendingEmail(null)
            }
          }}
          onConfirm={handleConfirmSendEmail}
          vendorEmail={invoicePendingEmail.vendorEmail || 'the vendor on file'}
          vendorName={invoicePendingEmail.vendorName}
        />
      ) : null}
    </main>
  )
}

export default PurchaseInvoiceListPage
