import { Link } from 'react-router-dom'
import type { SalesInvoiceListItemRecord, SalesInvoicePaymentStatusLabel } from '../../shared/interfaces/salesInvoices.interface'
import { formatDateLabel, formatRupees } from './salesInvoices.helpers'

type SalesInvoicesTableProps = {
  invoices: SalesInvoiceListItemRecord[]
  isLoading: boolean
  errorMessage?: null | string
  sendingInvoiceId?: null | number
  preparingInvoiceId?: null | number
  downloadingInvoiceId?: null | number
  onDownloadPdf: (invoice: SalesInvoiceListItemRecord) => void
  onRequestSendEmail: (invoice: SalesInvoiceListItemRecord) => void
}

const paymentStatusClasses: Record<SalesInvoicePaymentStatusLabel, string> = {
  Overdue: 'border border-[#E7D7D4] bg-[#FFF6F5] text-[#9A5650]',
  Paid: 'border border-[#C9E7D4] bg-[#EEFCF3] text-[#16784A]',
  'Partially Paid': 'border border-[#F0D3B3] bg-[#FFF7EE] text-[#A05A11]',
  Unpaid: 'border border-[#D9E3EE] bg-[#F4F7FA] text-[#516579]',
}

function PaymentStatusPill({ paymentStatus }: { paymentStatus: SalesInvoicePaymentStatusLabel }) {
  return (
    <span className={`inline-flex min-h-7.5 items-center justify-center rounded-full px-2.5 py-1 text-[11px] leading-none font-semibold uppercase tracking-[0.08em] ${paymentStatusClasses[paymentStatus]}`}>
      {paymentStatus}
    </span>
  )
}

function LoadingIndicator() {
  return (
    <div className="flex min-h-80 items-center justify-center px-6 py-10" role="status" aria-live="polite">
      <span className="sr-only">Loading sales invoices</span>
      <span
        aria-hidden
        className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[#DDE7F2] border-t-[#15558D]"
      />
    </div>
  )
}

function LoadingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/55 px-6 py-10 backdrop-blur-[1px]">
      <div className="inline-flex h-11 w-11 animate-spin rounded-full border-4 border-[#DDE7F2] border-t-[#15558D]" aria-hidden />
      <span className="sr-only">Loading sales invoices</span>
    </div>
  )
}

function TableState({ message, tone = 'default' }: { message: string; tone?: 'default' | 'error' }) {
  return (
    <div className={`flex min-h-80 items-center justify-center px-6 py-10 text-center ${tone === 'error' ? 'text-[#A94E48]' : 'text-[#60758E]'}`}>
      <div className="max-w-md">
        <p className="text-[18px] font-semibold text-[#123052]">{tone === 'error' ? 'Unable to load sales invoices' : 'No sales invoices yet'}</p>
        <p className="mt-2 text-[15px] leading-7">{message}</p>
      </div>
    </div>
  )
}

function MobileSalesInvoiceCard({
  invoice,
  sendingInvoiceId,
  preparingInvoiceId,
  downloadingInvoiceId,
  onDownloadPdf,
  onRequestSendEmail,
}: {
  invoice: SalesInvoiceListItemRecord
  sendingInvoiceId?: null | number
  preparingInvoiceId?: null | number
  downloadingInvoiceId?: null | number
  onDownloadPdf: (invoice: SalesInvoiceListItemRecord) => void
  onRequestSendEmail: (invoice: SalesInvoiceListItemRecord) => void
}) {
  const isEmailBusy = sendingInvoiceId === invoice.salesInvoiceId || preparingInvoiceId === invoice.salesInvoiceId
  const isDownloadBusy = downloadingInvoiceId === invoice.salesInvoiceId

  return (
    <article className="rounded-[22px] border border-[#E5EDF4] bg-white p-4 shadow-[0_10px_24px_rgba(20,43,74,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Invoice</p>
          <h3 className="mt-1 text-[18px] font-semibold text-[#112B49]">{invoice.invoiceNumber}</h3>
          <p className="mt-1 text-[14px] text-[#58708A]">{invoice.customerName}</p>
        </div>
        <PaymentStatusPill paymentStatus={invoice.paymentStatus} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Vehicle</p>
          <p className="mt-1 text-[15px] font-medium text-[#203852]">{invoice.vehicleNumber}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Invoice Date</p>
          <p className="mt-1 text-[15px] font-medium text-[#203852]">{formatDateLabel(invoice.invoiceDate)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Final Amount</p>
          <p className="mt-1 text-[17px] font-semibold text-[#123052]">{formatRupees(invoice.finalAmount)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Paid Amount</p>
          <p className="mt-1 text-[17px] font-semibold text-[#123052]">{formatRupees(invoice.paidAmount)}</p>
        </div>
       
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Created</p>
          <p className="mt-1 text-[14px] text-[#58708A]">{formatDateLabel(invoice.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Link
          className="inline-flex h-9 min-w-23 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#D7E2ED] bg-white px-4 text-[12px] leading-none font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
          to={`/sales-invoices/${invoice.salesInvoiceId}`}
        >
          <span aria-hidden className="material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none text-[18px] not-italic">
            visibility
          </span>
          View
        </Link>
        {invoice.hasInvoicePdf ? (
          <button
            className="inline-flex h-9 min-w-26 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#D7E2ED] bg-white px-4 text-[12px] leading-none font-semibold text-[#2E4C70] transition hover:bg-[#F7FBFE] disabled:cursor-not-allowed disabled:opacity-65"
            disabled={isDownloadBusy}
            onClick={() => onDownloadPdf(invoice)}
            type="button"
          >
            <span aria-hidden className="material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none text-[18px] not-italic">
              download
            </span>
            {isDownloadBusy ? 'Downloading...' : 'Download'}
          </button>
        ) : null}
        <button
          className="inline-flex h-9 min-w-31.5 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#15558D] px-4 text-[12px] leading-none font-semibold text-white transition hover:bg-[#0E487C] disabled:cursor-not-allowed disabled:opacity-65"
          disabled={isEmailBusy}
          onClick={() => onRequestSendEmail(invoice)}
          type="button"
        >
          <span aria-hidden className="material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none text-[18px] not-italic">
            outgoing_mail
          </span>
          Email
        </button>
      </div>
    </article>
  )
}

function SalesInvoicesTable({
  invoices,
  isLoading,
  errorMessage,
  sendingInvoiceId,
  preparingInvoiceId,
  downloadingInvoiceId,
  onDownloadPdf,
  onRequestSendEmail,
}: SalesInvoicesTableProps) {
  if (isLoading && invoices.length === 0) {
    return <LoadingIndicator />
  }

  if (errorMessage) {
    return <TableState message={errorMessage} tone="error" />
  }

  if (invoices.length === 0) {
    return <TableState message="Create the first sales invoice to start tracking completed sales and customer billing." />
  }

  return (
    <div className="relative">
      {isLoading ? <LoadingOverlay /> : null}

      <div className="space-y-4 p-4 lg:hidden">
        {invoices.map((invoice) => (
          <MobileSalesInvoiceCard
            downloadingInvoiceId={downloadingInvoiceId}
            invoice={invoice}
            key={invoice.salesInvoiceId}
            onDownloadPdf={onDownloadPdf}
            onRequestSendEmail={onRequestSendEmail}
            preparingInvoiceId={preparingInvoiceId}
            sendingInvoiceId={sendingInvoiceId}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-7xl border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E2EAF2] bg-[#F7FAFC]">
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Invoice</th>
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Customer</th>
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Vehicle</th>
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Invoice Date</th>
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Final Amount</th>
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Paid Amount</th>
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Payment</th>
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Created At</th>
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const isDownloadBusy = downloadingInvoiceId === invoice.salesInvoiceId

              return (
                <tr className="border-b border-[#EDF2F7] bg-white transition hover:bg-[#FBFDFF]" key={invoice.salesInvoiceId}>
                  <td className="px-6 py-4.5 align-middle">
                    <p className="text-center text-[16px] font-semibold text-[#112B49]">{invoice.invoiceNumber}</p>
                  </td>
                  <td className="px-6 py-4.5 align-middle">
                    <p className="text-center text-[15px] font-semibold text-[#17314F]">{invoice.customerName}</p>
                  </td>
                  <td className="px-6 py-4.5 align-middle text-center">
                    <p className="text-[15px] font-semibold text-[#17314F]">{invoice.vehicleNumber}</p>
                  </td>
                  <td className="px-6 py-4.5 text-center align-middle text-[14px] text-[#203852]">{formatDateLabel(invoice.invoiceDate)}</td>
                  <td className="px-6 py-4.5 text-center align-middle text-[14px] font-semibold text-[#123052]">{formatRupees(invoice.finalAmount)}</td>
                  <td className="px-6 py-4.5 text-center align-middle text-[14px] font-semibold text-[#123052]">{formatRupees(invoice.paidAmount)}</td>
                  <td className="px-6 py-4.5 text-center align-middle">
                    <PaymentStatusPill paymentStatus={invoice.paymentStatus} />
                  </td>
                  <td className="px-6 py-4.5 text-center align-middle text-[13px] text-[#405470]">{formatDateLabel(invoice.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className="px-6 py-4.5 align-middle">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <Link
                        className="inline-flex h-9 min-w-22 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#D7E2ED] bg-white px-3.5 text-[12px] leading-none font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                        to={`/sales-invoices/${invoice.salesInvoiceId}`}
                      >
                        <span aria-hidden className="material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none text-[18px] not-italic">
                          visibility
                        </span>
                        View
                      </Link>
                      {invoice.hasInvoicePdf ? (
                        <button
                          className="inline-flex h-9 min-w-24 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#D7E2ED] bg-white px-3.5 text-[12px] leading-none font-semibold text-[#2E4C70] transition hover:bg-[#F7FBFE] disabled:cursor-not-allowed disabled:opacity-65"
                          disabled={isDownloadBusy}
                          onClick={() => onDownloadPdf(invoice)}
                          type="button"
                        >
                          <span aria-hidden className="material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none text-[18px] not-italic">
                            download
                          </span>
                          {isDownloadBusy ? 'Downloading...' : 'Download'}
                        </button>
                      ) : null}
                     
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SalesInvoicesTable
