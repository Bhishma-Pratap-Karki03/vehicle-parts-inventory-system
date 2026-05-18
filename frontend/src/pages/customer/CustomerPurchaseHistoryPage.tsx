import { useEffect, useMemo, useState } from 'react'

import type {
  CustomerHistorySummary,
  CustomerPurchaseHistoryItem,
  PaymentStatusValue,
} from '../../shared/interfaces/customer.interface'
import { apiRequest, getApiErrorMessage } from '../../shared/utils/api'

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function paymentStatusLabel(status: PaymentStatusValue): string {
  if (typeof status === 'string') {
    if (status === 'PartiallyPaid') {
      return 'Partially Paid'
    }

    return status
  }

  if (status === 0) {
    return 'Unpaid'
  }

  if (status === 1) {
    return 'Partially Paid'
  }

  return 'Paid'
}

function paymentStatusTone(status: PaymentStatusValue): string {
  const label = paymentStatusLabel(status)

  if (label === 'Paid') {
    return 'bg-[#E6F3EC] text-[#1F7A4A]'
  }

  if (label === 'Partially Paid') {
    return 'bg-[#FFF4DE] text-[#9B6A12]'
  }

  return 'bg-[#FBEAE7] text-[#A94E48]'
}

function CustomerPurchaseHistoryPage() {
  const [items, setItems] = useState<CustomerPurchaseHistoryItem[]>([])
  const [summary, setSummary] = useState<CustomerHistorySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<null | number>(null)

  useEffect(() => {
    let isCancelled = false

    const fetchData = async () => {
      setIsLoading(true)

      const [purchasesResponse, summaryResponse] = await Promise.all([
        apiRequest<CustomerPurchaseHistoryItem[]>('/api/customers/me/purchase-history'),
        apiRequest<CustomerHistorySummary>('/api/customers/me/history/summary'),
      ])

      if (isCancelled) {
        return
      }

      if (purchasesResponse.success && purchasesResponse.data) {
        setItems(purchasesResponse.data)
        setErrorMessage(null)
      } else {
        setItems([])
        setErrorMessage(getApiErrorMessage(purchasesResponse))
      }

      if (summaryResponse.success && summaryResponse.data) {
        setSummary(summaryResponse.data)
      }

      setIsLoading(false)
    }

    void fetchData()

    return () => {
      isCancelled = true
    }
  }, [])

  const summaryCards = useMemo(
    () => [
      {
        label: 'Total purchases',
        tone: 'bg-[#EEF4FA] text-[#15558D]',
        value: summary ? String(summary.totalPurchases) : '0',
      },
      {
        label: 'Total spent',
        tone: 'bg-[#E6F3EC] text-[#1F7A4A]',
        value: summary ? formatCurrency(summary.totalSpent) : '0.00',
      },
      {
        label: 'Outstanding',
        tone: summary && summary.outstandingBalance > 0 ? 'bg-[#FBEAE7] text-[#A94E48]' : 'bg-[#EEF4FA] text-[#15558D]',
        value: summary ? formatCurrency(summary.outstandingBalance) : '0.00',
      },
    ],
    [summary],
  )

  return (
    <main className="mx-auto w-full max-w-370 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="mb-6 rounded-4xl border border-[#DCE5EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_58%,#EEF5FC_100%)] px-6 py-7 shadow-[0_28px_60px_rgba(18,43,74,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">Records</p>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)] sm:text-[34px]">
          Purchase history
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#52677F]">
          A complete log of every part you have purchased from our service center.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {summaryCards.map((card) => (
            <div className="rounded-3xl border border-[#E4EBF3] bg-white px-5 py-4 shadow-[0_8px_18px_rgba(18,43,74,0.04)]" key={card.label}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6D8197]">{card.label}</p>
              <p className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-[18px] font-semibold ${card.tone}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-4xl border border-[#DCE5EF] bg-white px-4 py-6 shadow-[0_18px_36px_rgba(18,43,74,0.06)] sm:px-6">
        <h2 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Invoices</h2>

        {isLoading ? (
          <div className="mt-6 flex items-center gap-3 text-[14px] text-[#52677F]">
            <span aria-hidden className="material-symbols-outlined animate-spin text-[#15558D]">
              progress_activity
            </span>
            Loading your purchase history...
          </div>
        ) : errorMessage ? (
          <p className="mt-6 text-[14px] text-[#A94E48]">{errorMessage}</p>
        ) : items.length === 0 ? (
          <p className="mt-6 rounded-3xl bg-[#F7FBFE] px-4 py-8 text-center text-[14px] text-[#52677F]">
            No purchases yet. When you buy a part, it will appear here.
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {items.map((item) => {
              const isExpanded = expandedInvoiceId === item.salesInvoiceId

              return (
                <li
                  className="rounded-3xl border border-[#E4EBF3] bg-[#F8FBFE] px-4 py-4 sm:px-5"
                  key={item.salesInvoiceId}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold text-[#0C2544]">{item.invoiceNumber}</p>
                      <p className="mt-1 text-[12px] text-[#52677F]">
                        {formatDate(item.invoiceDate)} &middot; {item.vehicleNumber} ({item.vehicleBrandModel}) &middot; {item.itemCount}{' '}
                        item{item.itemCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${paymentStatusTone(item.paymentStatus)}`}>
                        {paymentStatusLabel(item.paymentStatus)}
                      </span>
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-3 text-[12px] font-semibold text-[#2E4C70] transition hover:bg-[#F7FBFE]"
                        onClick={() =>
                          setExpandedInvoiceId((current) =>
                            current === item.salesInvoiceId ? null : item.salesInvoiceId,
                          )
                        }
                        type="button"
                      >
                        <span aria-hidden className="material-symbols-outlined text-[18px]">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                        {isExpanded ? 'Hide items' : 'View items'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-[12px] text-[#52677F] sm:grid-cols-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em]">Sub total</p>
                      <p className="text-[14px] font-semibold text-[#0C2544]">{formatCurrency(item.subTotal)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em]">Discount</p>
                      <p className="text-[14px] font-semibold text-[#0C2544]">{formatCurrency(item.discountAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em]">Paid</p>
                      <p className="text-[14px] font-semibold text-[#1F7A4A]">{formatCurrency(item.paidAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em]">Remaining</p>
                      <p className={`text-[14px] font-semibold ${item.remainingAmount > 0 ? 'text-[#A94E48]' : 'text-[#0C2544]'}`}>
                        {formatCurrency(item.remainingAmount)}
                      </p>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-[#E4EBF3] bg-white">
                      <table className="w-full text-left text-[13px]">
                        <thead className="bg-[#F2F7FC] text-[11px] uppercase tracking-[0.12em] text-[#6D8197]">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Part</th>
                            <th className="px-3 py-2 font-semibold">Part #</th>
                            <th className="px-3 py-2 text-right font-semibold">Qty</th>
                            <th className="px-3 py-2 text-right font-semibold">Unit price</th>
                            <th className="px-3 py-2 text-right font-semibold">Line total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.items.map((line, index) => (
                            <tr className="border-t border-[#EEF2F8]" key={`${item.salesInvoiceId}-${index}`}>
                              <td className="px-3 py-2 font-medium text-[#0C2544]">{line.partName}</td>
                              <td className="px-3 py-2 text-[#52677F]">{line.partNumber || '—'}</td>
                              <td className="px-3 py-2 text-right text-[#0C2544]">{line.quantity}</td>
                              <td className="px-3 py-2 text-right text-[#0C2544]">{formatCurrency(line.pricePerUnit)}</td>
                              <td className="px-3 py-2 text-right font-semibold text-[#0C2544]">{formatCurrency(line.lineTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}

export default CustomerPurchaseHistoryPage
