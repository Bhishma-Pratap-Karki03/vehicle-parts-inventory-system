import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import AddSalesInvoicePaymentModal from '../../components/salesInvoices/AddSalesInvoicePaymentModal'
import SendSalesInvoiceEmailModal from '../../components/salesInvoices/SendSalesInvoiceEmailModal'
import {
  buildSalesInvoicePaymentPayload,
  buildSendSalesInvoiceEmailPayload,
  formatDateLabel,
  formatRupees,
  getApiErrorMessage,
  getRequestErrorMessage,
  mapSalesInvoiceDetailFromApi,
} from '../../components/salesInvoices/salesInvoices.helpers'
import { apiRequest, apiRequestBlob, downloadBlob } from '../../shared/utils/api'
import type {
  SalesInvoiceDetailApiModel,
  SalesInvoiceDetailRecord,
  SalesInvoiceEmailFormValues,
  SalesInvoicePaymentFormValues,
  SalesInvoicePaymentStatusLabel,
} from '../../shared/interfaces/salesInvoices.interface'
import NotFoundPage from '../NotFoundPage'

const paymentStatusClasses: Record<SalesInvoicePaymentStatusLabel, string> = {
  Overdue: 'border border-[#E7D7D4] bg-[#FFF6F5] text-[#9A5650]',
  Paid: 'border border-[#C9E7D4] bg-[#EEFCF3] text-[#16784A]',
  'Partially Paid': 'border border-[#F0D3B3] bg-[#FFF7EE] text-[#A05A11]',
  Unpaid: 'border border-[#D9E3EE] bg-[#F4F7FA] text-[#516579]',
}

function SalesInvoiceDetailsPage() {
  const { salesInvoiceId } = useParams()
  const numericInvoiceId = useMemo(() => {
    if (!salesInvoiceId) {
      return undefined
    }

    return Number.parseInt(salesInvoiceId, 10)
  }, [salesInvoiceId])

  const [invoice, setInvoice] = useState<SalesInvoiceDetailRecord>()
  const [isLoading, setIsLoading] = useState(Boolean(salesInvoiceId))
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [isNotFound, setIsNotFound] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<null | string>(null)
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [pdfErrorMessage, setPdfErrorMessage] = useState<null | string>(null)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false)
  const [isRecordingPayment, setIsRecordingPayment] = useState(false)

  const isInvalidId = Boolean(salesInvoiceId && (!numericInvoiceId || Number.isNaN(numericInvoiceId)))

  useEffect(() => {
    if (!salesInvoiceId) {
      setInvoice(undefined)
      setErrorMessage(null)
      setIsNotFound(false)
      setIsLoading(false)
      return
    }

    if (!numericInvoiceId || Number.isNaN(numericInvoiceId)) {
      setInvoice(undefined)
      setErrorMessage('This sales invoice ID is invalid.')
      setIsNotFound(false)
      setIsLoading(false)
      return
    }

    const invoiceIdToLoad = numericInvoiceId
    let isCancelled = false

    const fetchInvoice = async () => {
      setIsLoading(true)
      setErrorMessage(null)
      setIsNotFound(false)

      try {
        const result = await apiRequest<SalesInvoiceDetailApiModel>(`/api/sales-invoices/${invoiceIdToLoad}`)

        if (isCancelled) {
          return
        }

        if (!result.success || !result.data) {
          setInvoice(undefined)
          setIsNotFound(result.statusCode === 404)
          setErrorMessage(getApiErrorMessage(result.message, result.errors))
          return
        }

        setInvoice(mapSalesInvoiceDetailFromApi(result.data))
      } catch (error) {
        if (isCancelled) {
          return
        }

        setInvoice(undefined)
        setIsNotFound(false)
        setErrorMessage(getRequestErrorMessage(error, 'Unable to load this sales invoice from the backend.'))
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchInvoice()

    return () => {
      isCancelled = true
    }
  }, [numericInvoiceId, reloadToken, salesInvoiceId])

  useEffect(() => {
    if (!invoice?.hasInvoicePdf) {
      setPdfUrl(null)
      setPdfErrorMessage(null)
      setIsPdfLoading(false)
      return
    }

    let isCancelled = false

    const fetchPdfUrl = async () => {
      setIsPdfLoading(true)
      setPdfErrorMessage(null)

      try {
        const result = await apiRequest<string>(`/api/sales-invoices/${invoice.salesInvoiceId}/download`)

        if (isCancelled) {
          return
        }

        if (!result.success || !result.data) {
          setPdfUrl(null)
          setPdfErrorMessage(getApiErrorMessage(result.message, result.errors))
          return
        }

        setPdfUrl(result.data)
      } catch (error) {
        if (isCancelled) {
          return
        }

        setPdfUrl(null)
        setPdfErrorMessage(getRequestErrorMessage(error, 'Unable to load the invoice PDF right now.'))
      } finally {
        if (!isCancelled) {
          setIsPdfLoading(false)
        }
      }
    }

    void fetchPdfUrl()

    return () => {
      isCancelled = true
    }
  }, [invoice?.hasInvoicePdf, invoice?.salesInvoiceId, reloadToken])

  async function handleConfirmSendEmail(values: SalesInvoiceEmailFormValues) {
    if (!invoice) {
      return
    }

    setIsSendingEmail(true)

    try {
      const result = await apiRequest<string>(`/api/sales-invoices/${invoice.salesInvoiceId}/email`, {
        body: buildSendSalesInvoiceEmailPayload(values),
        method: 'POST',
      })

      if (!result.success) {
        toast.error(getApiErrorMessage(result.message, result.errors))
        return
      }

      toast.success(result.message || 'Sales invoice email sent successfully.')
      setIsSendModalOpen(false)
      setReloadToken((current) => current + 1)
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to send this sales invoice email.'))
    } finally {
      setIsSendingEmail(false)
    }
  }

  async function handleDownloadPdf() {
    if (!invoice?.hasInvoicePdf) {
      toast.error('Invoice PDF is not available right now.')
      return
    }

    setIsDownloadingPdf(true)

    try {
      const result = await apiRequestBlob(`/api/sales-invoices/${invoice.salesInvoiceId}/download-pdf`)

      if (!result.success || !result.data) {
        throw new Error(getApiErrorMessage(result.message, result.errors))
      }

      downloadBlob(result.data, `${invoice.invoiceNumber || `sales-invoice-${invoice.salesInvoiceId}`}.pdf`)
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to download this invoice PDF right now.'))
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  async function handleConfirmAddPayment(values: SalesInvoicePaymentFormValues) {
    if (!invoice) {
      return
    }

    setIsRecordingPayment(true)

    try {
      const result = await apiRequest<SalesInvoiceDetailApiModel>(`/api/sales-invoices/${invoice.salesInvoiceId}/payments`, {
        body: buildSalesInvoicePaymentPayload(values),
        method: 'POST',
      })

      if (!result.success || !result.data) {
        toast.error(getApiErrorMessage(result.message, result.errors))
        return
      }

      setInvoice(mapSalesInvoiceDetailFromApi(result.data))
      setIsAddPaymentModalOpen(false)
      toast.success(result.message || 'Payment recorded successfully.')
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to record this payment right now.'))
    } finally {
      setIsRecordingPayment(false)
    }
  }

  if (isInvalidId || isNotFound) {
    return <NotFoundPage />
  }

  if (salesInvoiceId && errorMessage && !invoice && !isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F8FB] p-6 text-[#00235C]">
        <section className="w-full max-w-xl rounded-3xl border border-[#DCE5EF] bg-white p-8 shadow-[0_20px_48px_rgba(18,43,74,0.08)]">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Load issue</p>
          <h1 className="text-[28px] font-semibold text-[#102B49] [font-family:var(--font-display)]">We couldn&apos;t load that sales invoice.</h1>
          <p className="mt-4 text-[15px] leading-7 text-[#556E88]">{errorMessage}</p>
          <div className="mt-6">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white no-underline shadow-[0_14px_30px_rgba(21,85,141,0.2)]"
              to="/sales-invoices"
            >
              Back to Sales Invoices
            </Link>
          </div>
        </section>
      </main>
    )
  }

  if (isLoading || !invoice) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#F7FAFD_0%,#EEF4FA_55%,#F9FBFE_100%)] text-[#102B49]">
        <div className="mx-auto flex min-h-screen w-full max-w-380 items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="rounded-[28px] border border-[#DCE5EF] bg-white px-8 py-10 text-center shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Loading</p>
            <h1 className="mt-3 text-[30px] font-semibold text-[#102B49] [font-family:var(--font-display)]">Loading invoice details</h1>
            <p className="mt-3 text-[15px] leading-7 text-[#566E87]">Loading the latest sales invoice information...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F7FAFD_0%,#EEF4FA_55%,#F9FBFE_100%)] text-[#102B49]">
      <div className="mx-auto w-full max-w-380 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-6 border-b border-[#DCE5EF] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <Link
              className="inline-flex items-center gap-2 text-[15px] font-medium text-[#45637F] transition hover:text-[#163E66]"
              to="/sales-invoices"
            >
              <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                arrow_back
              </span>
              Back to Sales Invoices
            </Link>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#0C2544] [font-family:var(--font-display)] sm:text-[42px]">
                {invoice.invoiceNumber}
              </h1>
              <span className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] ${paymentStatusClasses[invoice.paymentStatus]}`}>
                {invoice.paymentStatus}
              </span>
              <span className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] ${
                invoice.hasInvoicePdf
                  ? 'border border-[#C9E7D4] bg-[#EEFCF3] text-[#16784A]'
                  : 'border border-[#D9E3EE] bg-[#F4F7FA] text-[#516579]'
              }`}>
                {invoice.hasInvoicePdf ? 'PDF Ready' : 'PDF Pending'}
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#566E87] sm:text-[16px]">
              Review the saved customer invoice, inspect each sold part, and access the generated PDF whenever you need it.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
           
            {invoice.hasInvoicePdf ? (
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-5 text-[14px] font-semibold text-[#2E4C70] shadow-[0_10px_24px_rgba(18,43,74,0.05)] transition hover:bg-[#F7FBFE] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isDownloadingPdf}
                onClick={handleDownloadPdf}
                type="button"
              >
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                  download
                </span>
                {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
              </button>
            ) : null}
            {invoice.remainingAmount > 0 ? (
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-5 text-[14px] font-semibold text-[#2E4C70] shadow-[0_10px_24px_rgba(18,43,74,0.05)] transition hover:bg-[#F7FBFE] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isRecordingPayment}
                onClick={() => setIsAddPaymentModalOpen(true)}
                type="button"
              >
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                  payments
                </span>
                Record Payment
              </button>
            ) : null}
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(21,85,141,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0E487C] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSendingEmail}
              onClick={() => setIsSendModalOpen(true)}
              type="button"
            >
              <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                outgoing_mail
              </span>
              Email Invoice
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
                <div className="mb-5 flex items-center gap-3 border-b border-[#E6EEF5] pb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                    <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                      person
                    </span>
                  </span>
                  <div>
                    <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Customer & Vehicle</h2>
                    <p className="mt-1 text-[14px] text-[#678099]">Customer identity and the vehicle linked to this sale.</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Customer</p>
                    <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{invoice.customerName}</p>
                    <p className="mt-1 text-[13px] text-[#6F849B]">{invoice.customerId}</p>
                  </div>
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Customer Email</p>
                    <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{invoice.customerEmail || 'No email on record'}</p>
                  </div>
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Phone</p>
                    <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{invoice.customerPhoneNumber || 'No phone on record'}</p>
                  </div>
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Vehicle Number</p>
                    <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{invoice.vehicleNumber}</p>
                    <p className="mt-1 text-[13px] text-[#6F849B]">Vehicle ID {invoice.vehicleId}</p>
                  </div>
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Brand</p>
                    <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{invoice.vehicleBrand}</p>
                  </div>
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Model</p>
                    <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{invoice.vehicleModel}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
                <div className="mb-5 flex items-center gap-3 border-b border-[#E6EEF5] pb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                    <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                      badge
                    </span>
                  </span>
                  <div>
                    <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Staff & Payment</h2>
                    <p className="mt-1 text-[14px] text-[#678099]">Stored staff assignment and payment amounts calculated for this invoice.</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Staff</p>
                    <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{invoice.staffName}</p>
                    <p className="mt-1 text-[13px] text-[#6F849B]">{invoice.staffId}</p>
                  </div>
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Invoice Date</p>
                    <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{formatDateLabel(invoice.invoiceDate)}</p>
                  </div>
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Due Date</p>
                    <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{formatDateLabel(invoice.dueDate)}</p>
                  </div>
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Sub Total</p>
                    <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{formatRupees(invoice.subTotal)}</p>
                  </div>
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Discount</p>
                    <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{formatRupees(invoice.discountAmount)}</p>
                  </div>
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Created</p>
                    <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{formatDateLabel(invoice.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </div>
              </section>

              
            </div>

            <aside className="space-y-6">
              <section className="overflow-hidden rounded-[28px] border border-[#DCE5EF] bg-white shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
                <div className="bg-[#143F6B] px-6 py-5 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Invoice summary</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-[22px] font-semibold leading-tight [font-family:var(--font-display)]">Snapshot</h2>
                      <p className="mt-1 text-[14px] text-white/80">Key totals and payment progress.</p>
                    </div>
                    <span className={`inline-flex min-h-8 items-center justify-center rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.12em] ${paymentStatusClasses[invoice.paymentStatus]}`}>
                      {invoice.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 px-6 py-6">
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Final Amount</p>
                    <p className="mt-3 text-[19px] font-semibold text-[#112B49]">{formatRupees(invoice.finalAmount)}</p>
                    <p className="mt-1 text-[13px] text-[#627A93]">{invoice.items.length} line items in this invoice.</p>
                  </div>

                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Payment Progress</p>
                    <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{formatRupees(invoice.paidAmount)} paid</p>
                    <p className="mt-1 text-[13px] text-[#627A93]">{formatRupees(invoice.remainingAmount)} remaining</p>
                  </div>

                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <div className="space-y-3 text-[14px] text-[#4F6881]">
                      <p><span className="font-semibold text-[#123052]">Customer:</span> {invoice.customerName}</p>
                      <p><span className="font-semibold text-[#123052]">Vehicle:</span> {invoice.vehicleNumber}</p>
                      <p><span className="font-semibold text-[#123052]">Due Date:</span> {formatDateLabel(invoice.dueDate)}</p>
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>

          <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
                <div className="mb-5 flex items-center gap-3 border-b border-[#E6EEF5] pb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                    <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                      account_balance_wallet
                    </span>
                  </span>
                  <div>
                    <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Payment History</h2>
                    <p className="mt-1 text-[14px] text-[#678099]">Every payment recorded against this invoice, including method, date, and notes.</p>
                  </div>
                </div>

                {invoice.payments.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-[#D6E1EC] bg-[#F8FBFE] px-5 py-8 text-center text-[14px] text-[#647B93]">
                    No payment records have been stored for this invoice yet.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-[22px] border border-[#E4EBF3]">
                    <div className="hidden grid-cols-[1.1fr_0.9fr_0.9fr_1fr] gap-4 bg-[#F7FAFD] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6E8298] md:grid">
                      <span>Paid At</span>
                      <span>Amount</span>
                      <span>Method</span>
                      <span>Remarks</span>
                    </div>
                    <ul className="divide-y divide-[#E6EDF5]">
                      {invoice.payments.map((payment) => (
                        <li className="px-5 py-4" key={payment.paymentId}>
                          <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr_0.9fr_1fr] md:items-start md:gap-4">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E8298] md:hidden">Paid At</p>
                              <p className="text-[15px] font-semibold text-[#102B49]">
                                {formatDateLabel(payment.paymentDate, { dateStyle: 'medium', timeStyle: 'short' })}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E8298] md:hidden">Amount</p>
                              <p className="text-[15px] font-semibold text-[#102B49]">{formatRupees(payment.amount)}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E8298] md:hidden">Method</p>
                              <p className="text-[15px] font-semibold text-[#102B49]">{payment.paymentMethod}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E8298] md:hidden">Remarks</p>
                              <p className="text-[14px] leading-7 text-[#566E87]">{payment.remarks?.trim() || 'No remarks added.'}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

          <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
            <div className="mb-5 flex items-center gap-3 border-b border-[#E6EEF5] pb-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                  inventory_2
                </span>
              </span>
              <div>
                <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Sold Parts</h2>
                <p className="mt-1 text-[14px] text-[#678099]">Every part line stored on this invoice.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-250 border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E2EAF2] bg-[#F7FAFC]">
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Part</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Part Number</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Quantity</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Price / Unit</th>
                    <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr className="border-b border-[#EDF2F7] bg-white transition hover:bg-[#FBFDFF]" key={item.salesInvoiceItemId}>
                      <td className="px-6 py-5 align-middle">
                        <p className="text-[16px] font-semibold text-[#123E69]">{item.partName}</p>
                      </td>
                      <td className="px-6 py-5 align-middle text-[14px] text-[#58708A]">{item.partNumber}</td>
                      <td className="px-6 py-5 align-middle text-[14px] font-semibold text-[#203852]">{item.quantity}</td>
                      <td className="px-6 py-5 align-middle text-[14px] text-[#203852]">{formatRupees(item.pricePerUnit)}</td>
                      <td className="px-6 py-5 text-right align-middle text-[14px] font-semibold text-[#123052]">{formatRupees(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#E6EEF5] pb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                  <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                    picture_as_pdf
                  </span>
                </span>
                <div>
                  <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Invoice PDF</h2>
                  <p className="mt-1 text-[14px] text-[#678099]">Preview the generated customer invoice and save a local copy when needed.</p>
                </div>
              </div>

              {invoice.hasInvoicePdf ? (
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-4 text-[14px] font-semibold text-[#2E4C70] transition hover:bg-[#F7FBFE] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isDownloadingPdf}
                  onClick={handleDownloadPdf}
                  type="button"
                >
                  <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                    download
                  </span>
                  {isDownloadingPdf ? 'Downloading...' : 'Download'}
                </button>
              ) : null}
            </div>

            {!invoice.hasInvoicePdf ? (
              <div className="rounded-[22px] border border-dashed border-[#D5E1EC] bg-[#F8FBFE] px-5 py-6 text-[15px] leading-7 text-[#5F768F]">
                This sales invoice does not have a generated PDF yet.
              </div>
            ) : isPdfLoading ? (
              <div className="flex min-h-110 items-center justify-center rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE]" role="status" aria-live="polite">
                <span className="sr-only">Loading invoice PDF</span>
                <span
                  aria-hidden
                  className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[#DDE7F2] border-t-[#15558D]"
                />
              </div>
            ) : pdfErrorMessage ? (
              <div className="rounded-[22px] border border-[#ECD6D0] bg-[#FFF8F7] px-5 py-6 text-[15px] leading-7 text-[#A94E48]">
                {pdfErrorMessage}
              </div>
            ) : pdfUrl ? (
              <div className="overflow-hidden rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE]">
                <iframe
                  className="h-215 w-full bg-white"
                  src={pdfUrl}
                  title={`${invoice.invoiceNumber} PDF preview`}
                />
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-[#D5E1EC] bg-[#F8FBFE] px-5 py-6 text-[15px] leading-7 text-[#5F768F]">
                The invoice PDF is not ready to preview yet.
              </div>
            )}
          </section>
        </div>
      </div>

      {isSendModalOpen ? (
        <SendSalesInvoiceEmailModal
          customerEmail={invoice.customerEmail}
          customerName={invoice.customerName}
          invoiceNumber={invoice.invoiceNumber}
          isBusy={isSendingEmail}
          onCancel={() => {
            if (!isSendingEmail) {
              setIsSendModalOpen(false)
            }
          }}
          onConfirm={handleConfirmSendEmail}
        />
      ) : null}
      {isAddPaymentModalOpen ? (
        <AddSalesInvoicePaymentModal
          invoiceNumber={invoice.invoiceNumber}
          isBusy={isRecordingPayment}
          onCancel={() => {
            if (!isRecordingPayment) {
              setIsAddPaymentModalOpen(false)
            }
          }}
          onConfirm={handleConfirmAddPayment}
          remainingAmount={invoice.remainingAmount}
        />
      ) : null}
    </main>
  )
}

export default SalesInvoiceDetailsPage
