import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import SendPurchaseInvoiceEmailModal from '../../components/purchaseInvoices/SendPurchaseInvoiceEmailModal'
import {
  formatDateLabel,
  formatRupees,
  getApiErrorMessage,
  getRequestErrorMessage,
  mapPurchaseInvoiceDetailFromApi,
  readApiResponse,
} from '../../components/purchaseInvoices/purchaseInvoices.helpers'
import NotFoundPage from '../NotFoundPage'
import type { PurchaseInvoiceDetailApiModel, PurchaseInvoiceDetailRecord, PurchaseInvoiceStatusLabel } from '../../shared/interfaces/purchaseInvoices.interface'

import backendUrl from '../../config';

const statusClasses: Record<PurchaseInvoiceStatusLabel, string> = {
  Cancelled: 'border border-[#E7D7D4] bg-[#FFF6F5] text-[#9A5650]',
  Completed: 'border border-[#C9E7D4] bg-[#EEFCF3] text-[#16784A]',
}

function PurchaseInvoiceDetailsPage() {
  const { purchaseInvoiceId } = useParams()
  const numericInvoiceId = useMemo(() => {
    if (!purchaseInvoiceId) {
      return undefined
    }

    return Number.parseInt(purchaseInvoiceId, 10)
  }, [purchaseInvoiceId])

  const [invoice, setInvoice] = useState<PurchaseInvoiceDetailRecord>()
  const [isLoading, setIsLoading] = useState(Boolean(purchaseInvoiceId))
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [isNotFound, setIsNotFound] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<null | string>(null)
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [pdfErrorMessage, setPdfErrorMessage] = useState<null | string>(null)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)

  const isInvalidId = Boolean(purchaseInvoiceId && (!numericInvoiceId || Number.isNaN(numericInvoiceId)))

  useEffect(() => {
    if (!purchaseInvoiceId) {
      setInvoice(undefined)
      setErrorMessage(null)
      setIsNotFound(false)
      setIsLoading(false)
      return
    }

    if (!numericInvoiceId || Number.isNaN(numericInvoiceId)) {
      setInvoice(undefined)
      setErrorMessage('This purchase invoice ID is invalid.')
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
        const response = await fetch(`${backendUrl}/api/purchase-invoices/${invoiceIdToLoad}`)
        const result = await readApiResponse<PurchaseInvoiceDetailApiModel>(response)

        if (isCancelled) {
          return
        }

        if (!result.success || !result.data) {
          setInvoice(undefined)
          setIsNotFound(result.statusCode === 404)
          setErrorMessage(getApiErrorMessage(result.message, result.errors))
          return
        }

        setInvoice(mapPurchaseInvoiceDetailFromApi(result.data))
      } catch (error) {
        if (isCancelled) {
          return
        }

        setInvoice(undefined)
        setIsNotFound(false)
        setErrorMessage(getRequestErrorMessage(error, 'Unable to load this purchase invoice from the backend.'))
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
  }, [numericInvoiceId, purchaseInvoiceId, reloadToken])

  useEffect(() => {
    if (!invoice?.purchaseInvoiceId) {
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
        const response = await fetch(`${backendUrl}/api/purchase-invoices/${invoice.purchaseInvoiceId}/pdf-url`)
        const result = await readApiResponse<string>(response)

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
  }, [invoice?.purchaseInvoiceId, reloadToken])

  async function handleConfirmSendEmail() {
    if (!invoice) {
      return
    }

    setIsSendingEmail(true)

    try {
      const response = await fetch(`${backendUrl}/api/purchase-invoices/${invoice.purchaseInvoiceId}/send-email`, {
        method: 'POST',
      })

      const result = await readApiResponse<string>(response)

      if (!result.success) {
        toast.error(getApiErrorMessage(result.message, result.errors))
        return
      }

      toast.success(result.message || 'Purchase invoice email sent successfully.')
      setIsSendModalOpen(false)
      setReloadToken((current) => current + 1)
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to send this purchase invoice email.'))
    } finally {
      setIsSendingEmail(false)
    }
  }

  async function handleDownloadPdf() {
    if (!invoice?.pdfPublicId) {
      toast.error('Invoice PDF is not available right now.')
      return
    }

    setIsDownloadingPdf(true)

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
      toast.error(getRequestErrorMessage(error, 'Unable to download this invoice PDF right now.'))
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  if (isInvalidId || isNotFound) {
    return <NotFoundPage />
  }

  if (purchaseInvoiceId && errorMessage && !invoice && !isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F8FB] p-6 text-[#00235C]">
        <section className="w-full max-w-xl rounded-3xl border border-[#DCE5EF] bg-white p-8 shadow-[0_20px_48px_rgba(18,43,74,0.08)]">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Backend issue</p>
          <h1 className="text-[28px] font-semibold text-[#102B49] [font-family:var(--font-display)]">We couldn&apos;t load that purchase invoice.</h1>
          <p className="mt-4 text-[15px] leading-7 text-[#556E88]">{errorMessage}</p>
          <div className="mt-6">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white no-underline shadow-[0_14px_30px_rgba(21,85,141,0.2)]"
              to="/purchase-invoices"
            >
              Back to Purchase Invoices
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Backend sync</p>
            <h1 className="mt-3 text-[30px] font-semibold text-[#102B49] [font-family:var(--font-display)]">Loading invoice details</h1>
            <p className="mt-3 text-[15px] leading-7 text-[#566E87]">Pulling the latest purchase invoice information from the backend...</p>
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
              to="/purchase-invoices"
            >
              <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                arrow_back
              </span>
              Back to Purchase Invoices
            </Link>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#0C2544] [font-family:var(--font-display)] sm:text-[42px]">
                {invoice.invoiceNumber}
              </h1>
              <span className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] ${statusClasses[invoice.status]}`}>
                {invoice.status}
              </span>
              <span className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] ${
                invoice.isEmailSent
                  ? 'border border-[#C9E7D4] bg-[#EEFCF3] text-[#16784A]'
                  : 'border border-[#F0D3B3] bg-[#FFF7EE] text-[#A05A11]'
              }`}>
                {invoice.isEmailSent ? 'Email Sent' : 'Email Pending'}
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#566E87] sm:text-[16px]">
              Review the full restock invoice, inspect each line item, and send the vendor copy whenever you&apos;re ready.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#C8D6E5] bg-white px-5 text-[14px] font-semibold text-[#24405E] no-underline shadow-[0_10px_24px_rgba(18,43,74,0.05)] transition hover:border-[#AEC3D9] hover:bg-[#F7FBFE]"
              to="/purchase-invoices"
            >
              Back to List
            </Link>
            {invoice.pdfPublicId ? (
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
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(21,85,141,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0E487C] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSendingEmail}
              onClick={() => setIsSendModalOpen(true)}
              type="button"
            >
              <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                outgoing_mail
              </span>
              {invoice.isEmailSent ? 'Resend Email' : 'Send Email'}
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="mb-5 flex items-center gap-3 border-b border-[#E6EEF5] pb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                  <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                    receipt_long
                  </span>
                </span>
                <div>
                  <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Invoice Overview</h2>
                  <p className="mt-1 text-[14px] text-[#678099]">Header information exactly as the backend currently stores it.</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Vendor</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{invoice.vendorName}</p>
                  <p className="mt-1 text-[13px] text-[#6F849B]">Vendor ID {invoice.vendorId}</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Vendor Email</p>
                  <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{invoice.vendorEmail || 'No email on record'}</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Created By</p>
                  <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{invoice.createdByName}</p>
                  <p className="mt-1 text-[13px] text-[#6F849B]">{invoice.createdById}</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Purchase Date</p>
                  <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{formatDateLabel(invoice.purchaseDate)}</p>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-[#DCE5EF] bg-white shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="flex items-center justify-between bg-[#123E69] px-5 py-4 text-white">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Invoice Summary</p>
                  <h2 className="mt-1 text-[23px] font-semibold tracking-[-0.02em] [font-family:var(--font-display)]">Snapshot</h2>
                </div>
                <span className={`inline-flex min-h-8 items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${invoice.isEmailSent ? 'border border-[#C9E7D4] bg-[#EEFCF3] text-[#16784A]' : 'border border-[#F0D3B3] bg-[#FFF7EE] text-[#A05A11]'}`}>
                  {invoice.isEmailSent ? 'Sent' : 'Pending'}
                </span>
              </div>

              <div className="space-y-4 p-5">
                <div className="rounded-3xl border border-[#DCE7F2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Total Amount</p>
                  <p className="mt-3 text-[34px] font-semibold leading-none text-[#123E69] [font-family:var(--font-display)]">{formatRupees(invoice.totalAmount)}</p>
                  <p className="mt-2 text-[13px] text-[#627A93]">{invoice.items.length} line item{invoice.items.length === 1 ? '' : 's'} in this invoice.</p>
                </div>

                <div className="rounded-3xl border border-[#E3EAF2] bg-[#FBFDFF] p-4 text-[14px] text-[#4D6580]">
                  <p><span className="font-semibold text-[#123052]">Created:</span> {formatDateLabel(invoice.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  <p className="mt-3"><span className="font-semibold text-[#123052]">Email Sent At:</span> {invoice.emailSentAt ? formatDateLabel(invoice.emailSentAt, { dateStyle: 'medium', timeStyle: 'short' }) : 'Not sent yet'}</p>
                </div>
              </div>
            </section>
            </aside>
          </div>

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
                  <p className="mt-1 text-[14px] text-[#678099]">Preview the generated invoice document and save a local copy whenever needed.</p>
                </div>
              </div>

            </div>

            {isPdfLoading ? (
              <div className="flex min-h-105 items-center justify-center rounded-3xl border border-[#E2EAF2] bg-[#F8FBFE]">
                <span
                  aria-hidden
                  className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[#DDE7F2] border-t-[#15558D]"
                />
                <span className="sr-only">Loading invoice PDF</span>
              </div>
            ) : pdfUrl ? (
              <div className="overflow-hidden rounded-3xl border border-[#E2EAF2] bg-[#F8FBFE]">
                <iframe
                  className="h-205 w-full bg-white"
                  src={pdfUrl}
                  title={`${invoice.invoiceNumber} PDF`}
                />
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#D7E2ED] bg-[#FAFCFE] px-6 py-12 text-center">
                <span className="material-symbols-outlined inline-flex select-none items-center justify-center rounded-2xl bg-[#EEF5FC] p-3 text-[28px] text-[#6B7D8F] not-italic">
                  picture_as_pdf
                </span>
                <p className="mt-4 text-[18px] font-semibold text-[#123052]">Invoice PDF not available</p>
                <p className="mt-2 text-[15px] leading-7 text-[#627A93]">{pdfErrorMessage || 'This invoice does not currently have a generated PDF on file.'}</p>
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
            <div className="mb-5 flex items-center gap-3 border-b border-[#E6EEF5] pb-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                  list_alt
                </span>
              </span>
              <div>
                <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Invoice Items</h2>
                <p className="mt-1 text-[14px] text-[#678099]">All parts restocked in this invoice.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-260 border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E2EAF2] bg-[#F7FAFC]">
                    <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Part</th>
                    <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Part Number</th>
                    <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Quantity</th>
                    <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Cost / Unit</th>
                    <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr className="border-b border-[#EDF2F7] bg-white" key={item.purchaseInvoiceItemId}>
                      <td className="px-5 py-4">
                        <Link className="text-[15px] font-semibold text-[#123E69] no-underline hover:underline" to={`/parts/${item.partId}`}>
                          {item.partName}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-[14px] text-[#516579]">{item.partNumber}</td>
                      <td className="px-5 py-4 text-[15px] font-semibold text-[#17314F]">{item.quantity}</td>
                      <td className="px-5 py-4 text-[15px] text-[#203852]">{formatRupees(item.costPricePerUnit)}</td>
                      <td className="px-5 py-4 text-right text-[15px] font-semibold text-[#123052]">{formatRupees(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {isSendModalOpen ? (
        <SendPurchaseInvoiceEmailModal
          emailSentAt={invoice.emailSentAt}
          invoiceNumber={invoice.invoiceNumber}
          isBusy={isSendingEmail}
          isEmailSent={invoice.isEmailSent}
          onCancel={() => {
            if (!isSendingEmail) {
              setIsSendModalOpen(false)
            }
          }}
          onConfirm={handleConfirmSendEmail}
          vendorEmail={invoice.vendorEmail || 'the vendor on file'}
          vendorName={invoice.vendorName}
        />
      ) : null}
    </main>
  )
}

export default PurchaseInvoiceDetailsPage
