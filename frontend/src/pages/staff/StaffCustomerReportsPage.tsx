import { useEffect, useState } from 'react'

import type {
  HighSpenderReport,
  PendingCreditReport,
  RegularCustomerReport,
} from '../../shared/interfaces/customer.interface'
import { apiRequest, getApiErrorMessage } from '../../shared/utils/api'

type ReportTab = 'high-spenders' | 'pending-credits' | 'regulars'

const TAB_OPTIONS: { description: string; icon: string; id: ReportTab; label: string }[] = [
  {
    description: 'Customers who visit you most often, sorted by purchase count.',
    icon: 'loyalty',
    id: 'regulars',
    label: 'Regular customers',
  },
  {
    description: 'Customers ranked by total amount spent across all invoices.',
    icon: 'paid',
    id: 'high-spenders',
    label: 'High spenders',
  },
  {
    description: 'Customers with outstanding balances and overdue invoices.',
    icon: 'pending_actions',
    id: 'pending-credits',
    label: 'Pending credits',
  },
]

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(value?: null | string): string {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function StaffCustomerReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('regulars')
  const [regulars, setRegulars] = useState<RegularCustomerReport[]>([])
  const [highSpenders, setHighSpenders] = useState<HighSpenderReport[]>([])
  const [pendingCredits, setPendingCredits] = useState<PendingCreditReport[]>([])
  const [loadingTab, setLoadingTab] = useState<null | ReportTab>(null)
  const [tabErrors, setTabErrors] = useState<Partial<Record<ReportTab, string>>>({})
  const [regularsLimit, setRegularsLimit] = useState(10)
  const [highSpendersLimit, setHighSpendersLimit] = useState(10)
  const [overdueDays, setOverdueDays] = useState(30)

  useEffect(() => {
    let isCancelled = false

    const fetchTabData = async () => {
      setLoadingTab(activeTab)

      if (activeTab === 'regulars') {
        const response = await apiRequest<RegularCustomerReport[]>(
          `/api/customer-reports/regulars?limit=${regularsLimit}`,
        )
        if (isCancelled) return

        if (response.success && response.data) {
          setRegulars(response.data)
          setTabErrors((current) => ({ ...current, regulars: undefined }))
        } else {
          setRegulars([])
          setTabErrors((current) => ({ ...current, regulars: getApiErrorMessage(response) }))
        }
      } else if (activeTab === 'high-spenders') {
        const response = await apiRequest<HighSpenderReport[]>(
          `/api/customer-reports/high-spenders?limit=${highSpendersLimit}`,
        )
        if (isCancelled) return

        if (response.success && response.data) {
          setHighSpenders(response.data)
          setTabErrors((current) => ({ ...current, ['high-spenders']: undefined }))
        } else {
          setHighSpenders([])
          setTabErrors((current) => ({ ...current, ['high-spenders']: getApiErrorMessage(response) }))
        }
      } else if (activeTab === 'pending-credits') {
        const response = await apiRequest<PendingCreditReport[]>(
          `/api/customer-reports/pending-credits?overdueDays=${overdueDays}`,
        )
        if (isCancelled) return

        if (response.success && response.data) {
          setPendingCredits(response.data)
          setTabErrors((current) => ({ ...current, ['pending-credits']: undefined }))
        } else {
          setPendingCredits([])
          setTabErrors((current) => ({ ...current, ['pending-credits']: getApiErrorMessage(response) }))
        }
      }

      if (!isCancelled) {
        setLoadingTab(null)
      }
    }

    void fetchTabData()

    return () => {
      isCancelled = true
    }
  }, [activeTab, highSpendersLimit, overdueDays, regularsLimit])

  const isLoading = loadingTab === activeTab
  const currentError = tabErrors[activeTab]

  return (
    <main className="mx-auto w-full max-w-370 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="mb-6 rounded-4xl border border-[#DCE5EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_58%,#EEF5FC_100%)] px-6 py-7 shadow-[0_28px_60px_rgba(18,43,74,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">Reporting workspace</p>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)] sm:text-[34px]">
          Customer reports
        </h1>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#52677F]">
          Quickly identify your most valuable customers and follow up on outstanding balances.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {TAB_OPTIONS.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              className={`group flex h-full flex-col items-start gap-2 rounded-3xl border px-5 py-4 text-left transition ${
                isActive
                  ? 'border-[#15558D] bg-white shadow-[0_18px_36px_rgba(21,85,141,0.18)]'
                  : 'border-[#DCE5EF] bg-white/70 hover:border-[#15558D]/60 hover:bg-white'
              }`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
                  isActive ? 'bg-[#15558D] text-white' : 'bg-[#EEF4FA] text-[#15558D]'
                }`}
              >
                <span aria-hidden className="material-symbols-outlined text-[22px]">
                  {tab.icon}
                </span>
              </span>
              <p className="text-[15px] font-semibold text-[#0C2544]">{tab.label}</p>
              <p className="text-[12px] text-[#52677F]">{tab.description}</p>
            </button>
          )
        })}
      </div>

      <section className="mt-6 rounded-4xl border border-[#DCE5EF] bg-white px-4 py-6 shadow-[0_18px_36px_rgba(18,43,74,0.06)] sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">
            {TAB_OPTIONS.find((tab) => tab.id === activeTab)?.label}
          </h2>

          {activeTab === 'regulars' ? (
            <label className="flex items-center gap-2 text-[12px] font-semibold text-[#52677F]">
              Top
              <input
                className="h-9 w-20 rounded-full border border-[#D7E2ED] bg-[#F8FBFE] px-3 text-[13px] font-semibold text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                min={1}
                max={100}
                onChange={(event) => setRegularsLimit(Number.parseInt(event.target.value || '10', 10))}
                type="number"
                value={regularsLimit}
              />
              customers
            </label>
          ) : null}

          {activeTab === 'high-spenders' ? (
            <label className="flex items-center gap-2 text-[12px] font-semibold text-[#52677F]">
              Top
              <input
                className="h-9 w-20 rounded-full border border-[#D7E2ED] bg-[#F8FBFE] px-3 text-[13px] font-semibold text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                min={1}
                max={100}
                onChange={(event) => setHighSpendersLimit(Number.parseInt(event.target.value || '10', 10))}
                type="number"
                value={highSpendersLimit}
              />
              customers
            </label>
          ) : null}

          {activeTab === 'pending-credits' ? (
            <label className="flex items-center gap-2 text-[12px] font-semibold text-[#52677F]">
              Overdue after
              <input
                className="h-9 w-20 rounded-full border border-[#D7E2ED] bg-[#F8FBFE] px-3 text-[13px] font-semibold text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                min={0}
                max={365}
                onChange={(event) => setOverdueDays(Number.parseInt(event.target.value || '30', 10))}
                type="number"
                value={overdueDays}
              />
              days
            </label>
          ) : null}
        </div>

        {isLoading ? (
          <div className="mt-6 flex items-center gap-3 text-[14px] text-[#52677F]">
            <span aria-hidden className="material-symbols-outlined animate-spin text-[#15558D]">
              progress_activity
            </span>
            Loading report...
          </div>
        ) : currentError ? (
          <p className="mt-6 text-[14px] text-[#A94E48]">{currentError}</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-3xl border border-[#E4EBF3]">
            {activeTab === 'regulars' ? (
              <table className="w-full min-w-160 text-left text-[13px]">
                <thead className="bg-[#F2F7FC] text-[11px] uppercase tracking-[0.12em] text-[#6D8197]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 text-right font-semibold">Purchases</th>
                    <th className="px-4 py-3 text-right font-semibold">Total spent</th>
                    <th className="px-4 py-3 text-right font-semibold">Last purchase</th>
                  </tr>
                </thead>
                <tbody>
                  {regulars.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-[#52677F]" colSpan={6}>
                        No data available yet.
                      </td>
                    </tr>
                  ) : (
                    regulars.map((row, index) => (
                      <tr className="border-t border-[#EEF2F8] bg-white" key={row.customerId}>
                        <td className="px-4 py-3 font-semibold text-[#15558D]">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-[#0C2544]">{row.fullName}</td>
                        <td className="px-4 py-3 text-[#52677F]">
                          <p>{row.email ?? '—'}</p>
                          <p className="text-[12px]">{row.phoneNumber ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-[#0C2544]">{row.purchaseCount}</td>
                        <td className="px-4 py-3 text-right text-[#0C2544]">{formatCurrency(row.totalSpent)}</td>
                        <td className="px-4 py-3 text-right text-[#52677F]">{formatDate(row.lastPurchaseDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : null}

            {activeTab === 'high-spenders' ? (
              <table className="w-full min-w-160 text-left text-[13px]">
                <thead className="bg-[#F2F7FC] text-[11px] uppercase tracking-[0.12em] text-[#6D8197]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 text-right font-semibold">Total spent</th>
                    <th className="px-4 py-3 text-right font-semibold">Invoices</th>
                    <th className="px-4 py-3 text-right font-semibold">Last purchase</th>
                  </tr>
                </thead>
                <tbody>
                  {highSpenders.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-[#52677F]" colSpan={6}>
                        No data available yet.
                      </td>
                    </tr>
                  ) : (
                    highSpenders.map((row, index) => (
                      <tr className="border-t border-[#EEF2F8] bg-white" key={row.customerId}>
                        <td className="px-4 py-3 font-semibold text-[#15558D]">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-[#0C2544]">{row.fullName}</td>
                        <td className="px-4 py-3 text-[#52677F]">
                          <p>{row.email ?? '—'}</p>
                          <p className="text-[12px]">{row.phoneNumber ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-[#1F7A4A]">{formatCurrency(row.totalSpent)}</td>
                        <td className="px-4 py-3 text-right text-[#0C2544]">{row.purchaseCount}</td>
                        <td className="px-4 py-3 text-right text-[#52677F]">{formatDate(row.lastPurchaseDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : null}

            {activeTab === 'pending-credits' ? (
              <table className="w-full min-w-180 text-left text-[13px]">
                <thead className="bg-[#F2F7FC] text-[11px] uppercase tracking-[0.12em] text-[#6D8197]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 text-right font-semibold">Outstanding</th>
                    <th className="px-4 py-3 text-right font-semibold">Unpaid invoices</th>
                    <th className="px-4 py-3 text-right font-semibold">Overdue (&gt; {overdueDays}d)</th>
                    <th className="px-4 py-3 text-right font-semibold">Oldest unpaid</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCredits.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-[#52677F]" colSpan={7}>
                        No pending credits. All caught up!
                      </td>
                    </tr>
                  ) : (
                    pendingCredits.map((row, index) => (
                      <tr className="border-t border-[#EEF2F8] bg-white" key={row.customerId}>
                        <td className="px-4 py-3 font-semibold text-[#15558D]">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-[#0C2544]">{row.fullName}</td>
                        <td className="px-4 py-3 text-[#52677F]">
                          <p>{row.email ?? '—'}</p>
                          <p className="text-[12px]">{row.phoneNumber ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-[#A94E48]">{formatCurrency(row.outstandingBalance)}</td>
                        <td className="px-4 py-3 text-right text-[#0C2544]">{row.unpaidInvoiceCount}</td>
                        <td className="px-4 py-3 text-right text-[#0C2544]">{row.overdueInvoiceCount}</td>
                        <td className="px-4 py-3 text-right text-[#52677F]">{formatDate(row.oldestUnpaidInvoiceDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : null}
          </div>
        )}
      </section>
    </main>
  )
}

export default StaffCustomerReportsPage
