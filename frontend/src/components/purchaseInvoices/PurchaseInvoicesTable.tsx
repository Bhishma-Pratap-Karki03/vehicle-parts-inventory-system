import { Link } from 'react-router-dom'
import type { PurchaseInvoiceListItemRecord, PurchaseInvoiceStatusLabel } from '../../shared/interfaces/purchaseInvoices.interface'
import { formatDateLabel, formatRupees } from './purchaseInvoices.helpers'

type PurchaseInvoicesTableProps = {
  invoices: PurchaseInvoiceListItemRecord[]
  isLoading: boolean
  errorMessage?: null | string
  sendingInvoiceId?: null | number
  preparingInvoiceId?: null | number
  downloadingInvoiceId?: null | number
  onDownloadPdf: (invoice: PurchaseInvoiceListItemRecord) => void
  onRequestSendEmail: (invoice: PurchaseInvoiceListItemRecord) => void
}

const statusClasses: Record<PurchaseInvoiceStatusLabel, string> = {
  Cancelled: 'border border-[#E7D7D4] bg-[#FFF6F5] text-[#9A5650]',
  Completed: 'border border-[#C9E7D4] bg-[#EEFCF3] text-[#16784A]',
}

function EmailStatusPill({ isEmailSent }: { isEmailSent: boolean }) {
  return (
    <span
      className={`inline-flex min-h-7.5 items-center justify-center rounded-full px-2.5 py-1 text-[11px] leading-none font-semibold uppercase tracking-[0.08em] ${
        isEmailSent
          ? 'border border-[#C9E7D4] bg-[#EEFCF3] text-[#16784A]'
          : 'border border-[#F0D3B3] bg-[#FFF7EE] text-[#A05A11]'
      }`}
    >
      {isEmailSent ? 'Sent' : 'Pending'}
    </span>
  )
}

function TableState({ message, tone = 'default' }: { message: string; tone?: 'default' | 'error' }) {
  return (
    <div className={`flex min-h-80 items-center justify-center px-6 py-10 text-center ${tone === 'error' ? 'text-[#A94E48]' : 'text-[#60758E]'}`}>
      <div className="max-w-md">
        <p className="text-[18px] font-semibold text-[#123052]">{tone === 'error' ? 'Unable to load invoices' : 'No purchase invoices yet'}</p>
        <p className="mt-2 text-[15px] leading-7">{message}</p>
      </div>
    </div>
  )
}

function MobileInvoiceCard({
  invoice,
  sendingInvoiceId,
  preparingInvoiceId,
  downloadingInvoiceId,
  onDownloadPdf,
  onRequestSendEmail,
}: {
  invoice: PurchaseInvoiceListItemRecord
  sendingInvoiceId?: null | number
  preparingInvoiceId?: null | number
  downloadingInvoiceId?: null | number
  onDownloadPdf: (invoice: PurchaseInvoiceListItemRecord) => void
  onRequestSendEmail: (invoice: PurchaseInvoiceListItemRecord) => void
}) {
  const isEmailBusy = sendingInvoiceId === invoice.purchaseInvoiceId || preparingInvoiceId === invoice.purchaseInvoiceId
  const isDownloadBusy = downloadingInvoiceId === invoice.purchaseInvoiceId

  return (
    <article className="rounded-[22px] border border-[#E5EDF4] bg-white p-4 shadow-[0_10px_24px_rgba(20,43,74,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Invoice</p>
          <h3 className="mt-1 text-[18px] font-semibold text-[#112B49]">{invoice.invoiceNumber}</h3>
          <p className="mt-1 text-[14px] text-[#58708A]">{invoice.vendorName}</p>
        </div>
        <span className={`inline-flex min-h-8 items-center justify-center rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] ${statusClasses[invoice.status]}`}>
          {invoice.status}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Purchase Date</p>
          <p className="mt-1 text-[15px] font-medium text-[#203852]">{formatDateLabel(invoice.purchaseDate)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Created</p>
          <p className="mt-1 text-[15px] font-medium text-[#203852]">{formatDateLabel(invoice.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Total Amount</p>
          <p className="mt-1 text-[17px] font-semibold text-[#123052]">{formatRupees(invoice.totalAmount)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Email</p>
          <div className="mt-1">
            <EmailStatusPill isEmailSent={invoice.isEmailSent} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Link
          className="inline-flex h-9 min-w-23 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#D7E2ED] bg-white px-4 text-[12px] leading-none font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
          to={`/purchase-invoices/${invoice.purchaseInvoiceId}`}
        >
          <span aria-hidden className="material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none text-[18px] not-italic">
            visibility
          </span>
          View
        </Link>
        {invoice.pdfPublicId ? (
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
          {invoice.isEmailSent ? 'Resend' : 'Send Email'}
        </button>
      </div>
    </article>
  )
}

function PurchaseInvoicesTable({
  invoices,
  isLoading,
  errorMessage,
  sendingInvoiceId,
  preparingInvoiceId,
  downloadingInvoiceId,
  onDownloadPdf,
  onRequestSendEmail,
}: PurchaseInvoicesTableProps) {
  if (isLoading) {
    return <TableState message="Loading purchase invoices from the backend..." />
  }

  if (errorMessage) {
    return <TableState message={errorMessage} tone="error" />
  }

  if (invoices.length === 0) {
    return <TableState message="Create the first restock invoice to start building inventory history." />
  }

  return (
    <>
      <div className="space-y-4 p-4 lg:hidden">
        {invoices.map((invoice) => (
          <MobileInvoiceCard
            downloadingInvoiceId={downloadingInvoiceId}
            invoice={invoice}
            key={invoice.purchaseInvoiceId}
            onDownloadPdf={onDownloadPdf}
            onRequestSendEmail={onRequestSendEmail}
            preparingInvoiceId={preparingInvoiceId}
            sendingInvoiceId={sendingInvoiceId}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-300 border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E2EAF2] bg-[#F7FAFC]">
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Invoice</th>
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Vendor</th>
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Purchase Date</th>
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Total Amount</th>
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Status</th>
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Email</th>
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Created At</th>
              <th className="px-6 py-3.5 align-middle text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const isEmailBusy = sendingInvoiceId === invoice.purchaseInvoiceId || preparingInvoiceId === invoice.purchaseInvoiceId
              const isDownloadBusy = downloadingInvoiceId === invoice.purchaseInvoiceId

              return (
                <tr className="border-b border-[#EDF2F7] bg-white transition hover:bg-[#FBFDFF]" key={invoice.purchaseInvoiceId}>
                  <td className="px-6 py-4.5 align-middle">
                    <div className="flex flex-col items-center text-center">
                      <p className="text-[16px] font-semibold text-[#112B49]">{invoice.invoiceNumber}</p>
                      <p className="mt-1 text-[13px] text-[#617A95]">Invoice ID {invoice.purchaseInvoiceId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 align-middle">
                    <div className="flex flex-col items-center text-center">
                      <p className="text-[15px] font-semibold text-[#17314F]">{invoice.vendorName}</p>
                      <p className="mt-1 text-[13px] text-[#617A95]">Vendor ID {invoice.vendorId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-center align-middle text-[14px] text-[#203852]">{formatDateLabel(invoice.purchaseDate)}</td>
                  <td className="px-6 py-4.5 text-center align-middle text-[14px] font-semibold text-[#123052]">{formatRupees(invoice.totalAmount)}</td>
                  <td className="px-6 py-4.5 text-center align-middle">
                    <span className={`inline-flex min-h-8 items-center justify-center rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] ${statusClasses[invoice.status]}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-center align-middle">
                    <EmailStatusPill isEmailSent={invoice.isEmailSent} />
                  </td>
                  <td className="px-6 py-4.5 text-center align-middle text-[13px] text-[#405470]">{formatDateLabel(invoice.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className="px-6 py-4.5 align-middle">
                    <div className="flex items-center justify-center gap-3 whitespace-nowrap">
                      <Link
                        className="inline-flex h-9 min-w-23 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#D7E2ED] bg-white px-4 text-[12px] leading-none font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                        to={`/purchase-invoices/${invoice.purchaseInvoiceId}`}
                      >
                        <span aria-hidden className="material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none text-[18px] not-italic">
                          visibility
                        </span>
                        View
                      </Link>
                      {invoice.pdfPublicId ? (
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
                        {invoice.isEmailSent ? 'Resend' : 'Send Email'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default PurchaseInvoicesTable
