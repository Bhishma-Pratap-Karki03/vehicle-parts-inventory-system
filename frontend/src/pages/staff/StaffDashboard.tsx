import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  formatDateLabel,
  formatRupees,
  mapSalesInvoiceListFromApi,
} from '../../components/salesInvoices/salesInvoices.helpers'
import type {
  HighSpenderReport,
  PendingCreditReport,
  RegularCustomerReport,
} from '../../shared/interfaces/customer.interface'
import type { PagedResult } from '../../shared/interfaces/api.interface'
import type {
  SalesInvoiceCustomerOption,
  SalesInvoiceListItemApiModel,
  SalesInvoiceListItemRecord,
} from '../../shared/interfaces/salesInvoices.interface'
import { useAuth } from '../../shared/auth/useAuth'
import { apiRequest } from '../../shared/utils/api'

type SummaryTone = 'danger' | 'neutral' | 'primary' | 'success' | 'warning'

type SummaryCardDefinition = {
  detail: string
  icon: string
  label: string
  tone: SummaryTone
  value: string
}

type QuickAction = {
  description: string
  icon: string
  label: string
  to: string
}

function toneClasses(tone: SummaryTone) {
  switch (tone) {
    case 'danger':
      return {
        accent: 'text-[#A94E48]',
        badge: 'bg-[#FFF2F1] text-[#A94E48]',
        border: 'border-[#F1D7D3]',
      }
    case 'primary':
      return {
        accent: 'text-[#15558D]',
        badge: 'bg-[#EAF3FB] text-[#15558D]',
        border: 'border-[#D3E4F4]',
      }
    case 'success':
      return {
        accent: 'text-[#16784A]',
        badge: 'bg-[#ECFAF1] text-[#16784A]',
        border: 'border-[#D1ECD9]',
      }
    case 'warning':
      return {
        accent: 'text-[#A05A11]',
        badge: 'bg-[#FFF5EA] text-[#A05A11]',
        border: 'border-[#F1DCC0]',
      }
    default:
      return {
        accent: 'text-[#52677F]',
        badge: 'bg-[#F3F7FA] text-[#52677F]',
        border: 'border-[#DCE5EF]',
      }
  }
}

function SummaryCard({ card }: { card: SummaryCardDefinition }) {
  const tone = toneClasses(card.tone)

  return (
    <article className={`rounded-[24px] border ${tone.border} bg-white p-5 shadow-[0_14px_34px_rgba(18,43,74,0.05)]`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">
            {card.label}
          </p>
          <p className={`mt-3 text-[30px] font-semibold leading-none ${tone.accent} [font-family:var(--font-display)]`}>
            {card.value}
          </p>
        </div>
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${tone.badge}`}>
          <span
            aria-hidden
            className="material-symbols-outlined inline-flex select-none items-center justify-center text-[24px] leading-none not-italic"
          >
            {card.icon}
          </span>
        </span>
      </div>
      <p className="mt-4 text-[14px] leading-6 text-[#52677F]">{card.detail}</p>
    </article>
  )
}

function PanelFrame({
  children,
  title,
  subtitle,
  icon,
  action,
}: {
  action?: React.ReactNode
  children: React.ReactNode
  icon: string
  subtitle: string
  title: string
}) {
  return (
    <section className="rounded-[30px] border border-[#DCE5EF] bg-white shadow-[0_24px_50px_rgba(18,43,74,0.08)]">
      <div className="flex items-start justify-between gap-5 border-b border-[#E7EEF5] px-5 py-5 sm:px-6">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-13 w-13 items-center justify-center rounded-[20px] bg-[#EEF5FC] text-[#15558D]">
            <span
              aria-hidden
              className="material-symbols-outlined inline-flex select-none items-center justify-center text-[24px] leading-none not-italic"
            >
              {icon}
            </span>
          </span>
          <div>
            <h2 className="text-[22px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)]">
              {title}
            </h2>
            <p className="mt-1 text-[14px] leading-6 text-[#597189]">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  )
}

function QuickActionCard({ action }: { action: QuickAction }) {
  return (
    <Link
      className="group rounded-[22px] border border-[#DCE5EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F8FBFE_100%)] p-4 no-underline shadow-[0_14px_32px_rgba(18,43,74,0.05)] transition hover:-translate-y-0.5 hover:border-[#C8D9EA] hover:shadow-[0_18px_34px_rgba(18,43,74,0.08)]"
      to={action.to}
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D] transition group-hover:bg-[#15558D] group-hover:text-white">
        <span
          aria-hidden
          className="material-symbols-outlined inline-flex select-none items-center justify-center text-[22px] leading-none not-italic"
        >
          {action.icon}
        </span>
      </span>
      <h3 className="mt-4 text-[16px] font-semibold text-[#112B49]">{action.label}</h3>
      <p className="mt-2 text-[13px] leading-6 text-[#5A7188]">{action.description}</p>
    </Link>
  )
}

function LoadingGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-42 animate-pulse rounded-[24px] border border-[#E5EDF5] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_100%)]"
        />
      ))}
    </div>
  )
}

function SalesInvoiceItem({ invoice }: { invoice: SalesInvoiceListItemRecord }) {
  return (
    <div className="rounded-[22px] border border-[#E5EDF4] bg-[#FBFDFF] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#71849A]">{invoice.customerName}</p>
          <h3 className="mt-2 text-[16px] font-semibold text-[#112B49]">{invoice.invoiceNumber}</h3>
        </div>
        <span className="inline-flex min-h-7 items-center justify-center rounded-full border border-[#DCE5EF] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#52677F]">
          {invoice.paymentStatus}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-[14px] leading-6 text-[#597189]">
          {invoice.vehicleNumber} • {formatDateLabel(invoice.invoiceDate)}
        </p>
        <p className="shrink-0 text-[15px] font-semibold text-[#123052]">{formatRupees(invoice.finalAmount)}</p>
      </div>
    </div>
  )
}

function CreditFollowUpItem({ customer }: { customer: PendingCreditReport }) {
  return (
    <div className="rounded-[22px] border border-[#E5EDF4] bg-[#FBFDFF] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#112B49]">{customer.fullName}</h3>
          <p className="mt-1 text-[13px] text-[#5F748A]">{customer.phoneNumber || customer.email || 'No contact details'}</p>
        </div>
        <span className="inline-flex min-h-7 items-center justify-center rounded-full border border-[#F1D7D3] bg-[#FFF5F3] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A94E48]">
          {customer.overdueInvoiceCount} overdue
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-[14px] leading-6 text-[#597189]">
          {customer.unpaidInvoiceCount} unpaid invoice{customer.unpaidInvoiceCount === 1 ? '' : 's'} • oldest {formatDateLabel(customer.oldestUnpaidInvoiceDate)}
        </p>
        <p className="shrink-0 text-[15px] font-semibold text-[#A94E48]">{formatRupees(customer.outstandingBalance)}</p>
      </div>
    </div>
  )
}

function SpotlightItem({
  label,
  name,
  supportingText,
  value,
}: {
  label: string
  name: string
  supportingText: string
  value: string
}) {
  return (
    <div className="rounded-[22px] border border-[#E5EDF4] bg-[#FBFDFF] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#71849A]">{label}</p>
      <h3 className="mt-3 text-[17px] font-semibold text-[#112B49]">{name}</h3>
      <p className="mt-2 text-[13px] leading-6 text-[#597189]">{supportingText}</p>
      <p className="mt-4 text-[15px] font-semibold text-[#123052]">{value}</p>
    </div>
  )
}

export default function StaffDashboard() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [customerCount, setCustomerCount] = useState(0)
  const [salesInvoiceTotal, setSalesInvoiceTotal] = useState(0)
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoiceListItemRecord[]>([])
  const [regularCustomers, setRegularCustomers] = useState<RegularCustomerReport[]>([])
  const [highSpenders, setHighSpenders] = useState<HighSpenderReport[]>([])
  const [pendingCredits, setPendingCredits] = useState<PendingCreditReport[]>([])

  useEffect(() => {
    let isCancelled = false

    async function loadDashboard() {
      setIsLoading(true)
      setErrorMessage(null)

      const [
        customerOptionsResponse,
        salesInvoicesResponse,
        regularCustomersResponse,
        highSpendersResponse,
        pendingCreditsResponse,
      ] = await Promise.all([
        apiRequest<SalesInvoiceCustomerOption[]>('/api/sales-invoices/customers/options'),
        apiRequest<PagedResult<SalesInvoiceListItemApiModel>>('/api/sales-invoices?pageNumber=1&pageSize=4'),
        apiRequest<RegularCustomerReport[]>('/api/customer-reports/regulars?limit=5'),
        apiRequest<HighSpenderReport[]>('/api/customer-reports/high-spenders?limit=5'),
        apiRequest<PendingCreditReport[]>('/api/customer-reports/pending-credits?overdueDays=30'),
      ])

      if (isCancelled) {
        return
      }

      let hadPartialFailure = false

      if (customerOptionsResponse.success && customerOptionsResponse.data) {
        setCustomerCount(customerOptionsResponse.data.length)
      } else {
        hadPartialFailure = true
        setCustomerCount(0)
      }

      if (salesInvoicesResponse.success && salesInvoicesResponse.data) {
        setSalesInvoiceTotal(salesInvoicesResponse.data.totalRecords)
        setSalesInvoices(salesInvoicesResponse.data.items.map(mapSalesInvoiceListFromApi))
      } else {
        hadPartialFailure = true
        setSalesInvoiceTotal(0)
        setSalesInvoices([])
      }

      if (regularCustomersResponse.success && regularCustomersResponse.data) {
        setRegularCustomers(regularCustomersResponse.data)
      } else {
        hadPartialFailure = true
        setRegularCustomers([])
      }

      if (highSpendersResponse.success && highSpendersResponse.data) {
        setHighSpenders(highSpendersResponse.data)
      } else {
        hadPartialFailure = true
        setHighSpenders([])
      }

      if (pendingCreditsResponse.success && pendingCreditsResponse.data) {
        setPendingCredits(pendingCreditsResponse.data)
      } else {
        hadPartialFailure = true
        setPendingCredits([])
      }

      setErrorMessage(
        hadPartialFailure
          ? 'A few staff insights could not be refreshed just now, but your workspace is still ready to use.'
          : null,
      )
      setIsLoading(false)
    }

    void loadDashboard()

    return () => {
      isCancelled = true
    }
  }, [])

  const totalOutstandingBalance = useMemo(
    () => pendingCredits.reduce((sum, customer) => sum + customer.outstandingBalance, 0),
    [pendingCredits],
  )

  const summaryCards = useMemo<SummaryCardDefinition[]>(() => [
    {
      detail: 'Customers currently available in the billing and search workflow.',
      icon: 'groups',
      label: 'Customer Directory',
      tone: 'primary',
      value: String(customerCount),
    },
    {
      detail: 'Sales invoices already created by staff and tracked in the system.',
      icon: 'point_of_sale',
      label: 'Sales Invoices',
      tone: 'success',
      value: String(salesInvoiceTotal),
    },
    {
      detail: 'Customers who currently need payment follow-up after overdue purchases.',
      icon: 'pending_actions',
      label: 'Pending Credits',
      tone: pendingCredits.length > 0 ? 'warning' : 'success',
      value: String(pendingCredits.length),
    },
    {
      detail: 'Outstanding balance still sitting in customer credit accounts.',
      icon: 'payments',
      label: 'Credit Exposure',
      tone: totalOutstandingBalance > 0 ? 'danger' : 'neutral',
      value: formatRupees(totalOutstandingBalance),
    },
    {
      detail: 'Customers showing strong repeat buying behavior in the latest report view.',
      icon: 'loyalty',
      label: 'Regulars Tracked',
      tone: 'neutral',
      value: String(regularCustomers.length),
    },
    {
      detail: 'Top spenders currently surfaced for relationship follow-up and service planning.',
      icon: 'workspace_premium',
      label: 'High Spenders',
      tone: 'primary',
      value: String(highSpenders.length),
    },
  ], [customerCount, highSpenders.length, pendingCredits.length, regularCustomers.length, salesInvoiceTotal, totalOutstandingBalance])

  const quickActions = useMemo<QuickAction[]>(() => [
    {
      description: 'Create a new customer record and capture their first vehicle details.',
      icon: 'person_add',
      label: 'Add Customer',
      to: '/customers/create',
    },
    {
      description: 'Find customers quickly by name, phone number, vehicle number, or ID.',
      icon: 'search',
      label: 'Search Customers',
      to: '/customers/search',
    },
    {
      description: 'Review completed sales and create new invoices from the sales workspace.',
      icon: 'request_quote',
      label: 'Sales Invoices',
      to: '/sales-invoices',
    },
    {
      description: 'Open customer reports for regulars, high spenders, and pending credits.',
      icon: 'analytics',
      label: 'Customer Reports',
      to: '/staff/customer-reports',
    },
    {
      description: 'Start a fresh billing flow for a customer purchase right away.',
      icon: 'add_shopping_cart',
      label: 'Create Invoice',
      to: '/sales-invoices/create',
    },
    {
      description: 'Keep your own access details secure without leaving the staff workspace.',
      icon: 'lock_reset',
      label: 'Change Password',
      to: '/change-password',
    },
  ], [])

  const welcomeName = user?.fullName?.trim() || 'Staff'
  const topRegular = regularCustomers[0]
  const topSpender = highSpenders[0]

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F4F8FC_0%,#EEF4FA_46%,#F8FBFE_100%)] text-[#102B49]">
      <div className="mx-auto w-full max-w-380 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="mb-8 rounded-4xl border border-[#DCE5EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_58%,#EEF5FC_100%)] px-5 py-6 shadow-[0_28px_60px_rgba(18,43,74,0.08)] sm:px-7 sm:py-7">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">
                Staff sales desk
              </p>
              <h1 className="text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)] sm:text-[40px]">
                Good to see you, {welcomeName}
              </h1>
              <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#52677F] sm:text-[16px]">
                Stay on top of customer needs, new invoices, and credit follow-ups from one clean front-of-house workspace.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px]">
              <div className="rounded-[22px] border border-[#DCE5EF] bg-white/90 p-4 shadow-[0_12px_28px_rgba(18,43,74,0.05)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Today&apos;s Focus</p>
                <p className="mt-3 text-[20px] font-semibold text-[#123052] [font-family:var(--font-display)]">
                  Customer support and billing
                </p>
                <p className="mt-2 text-[13px] leading-6 text-[#597189]">
                  Prioritize accurate invoices, strong service, and quick follow-up on unpaid credits.
                </p>
              </div>
              <div className="rounded-[22px] border border-[#DCE5EF] bg-white/90 p-4 shadow-[0_12px_28px_rgba(18,43,74,0.05)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Open Credit Balance</p>
                <p className="mt-3 text-[28px] font-semibold text-[#A94E48] [font-family:var(--font-display)]">
                  {formatRupees(totalOutstandingBalance)}
                </p>
                <p className="mt-2 text-[13px] leading-6 text-[#597189]">
                  Current exposure across overdue and unpaid customer invoices.
                </p>
              </div>
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-6 rounded-[20px] border border-[#F1DDD8] bg-[#FFF7F5] px-4 py-3 text-[14px] leading-6 text-[#9A5650]">
              {errorMessage}
            </div>
          ) : null}
        </section>

        {isLoading ? (
          <LoadingGrid />
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <SummaryCard card={card} key={card.label} />
            ))}
          </section>
        )}

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.95fr]">
          <PanelFrame
            action={
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                to="/staff"
              >
                <span
                  aria-hidden
                  className="material-symbols-outlined inline-flex select-none items-center justify-center text-[18px] leading-none not-italic"
                >
                  refresh
                </span>
                Snapshot
              </Link>
            }
            icon="dashboard"
            subtitle="Jump into the customer-facing actions that staff use most often."
            title="Daily Workflow"
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((action) => (
                <QuickActionCard action={action} key={action.label} />
              ))}
            </div>
          </PanelFrame>

          <PanelFrame
            action={
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                to="/staff/customer-reports"
              >
                Open reports
              </Link>
            }
            icon="trending_up"
            subtitle="Quick relationship signals from the latest customer report data."
            title="Customer Spotlight"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {topRegular ? (
                <SpotlightItem
                  label="Top regular"
                  name={topRegular.fullName}
                  supportingText={`${topRegular.purchaseCount} purchases • last order ${formatDateLabel(topRegular.lastPurchaseDate)}`}
                  value={formatRupees(topRegular.totalSpent)}
                />
              ) : (
                <div className="rounded-[22px] border border-dashed border-[#D8E4EE] bg-[#FBFDFF] px-4 py-8 text-center text-[14px] text-[#5F748A]">
                  No regular-customer data yet.
                </div>
              )}

              {topSpender ? (
                <SpotlightItem
                  label="Top spender"
                  name={topSpender.fullName}
                  supportingText={`${topSpender.purchaseCount} purchases • last order ${formatDateLabel(topSpender.lastPurchaseDate)}`}
                  value={formatRupees(topSpender.totalSpent)}
                />
              ) : (
                <div className="rounded-[22px] border border-dashed border-[#D8E4EE] bg-[#FBFDFF] px-4 py-8 text-center text-[14px] text-[#5F748A]">
                  No high-spender data yet.
                </div>
              )}
            </div>
          </PanelFrame>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          <PanelFrame
            action={
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                to="/sales-invoices"
              >
                View all
              </Link>
            }
            icon="request_quote"
            subtitle="Most recent customer invoices created through the sales workflow."
            title="Recent Sales Invoices"
          >
            <div className="space-y-4">
              {salesInvoices.length > 0 ? (
                salesInvoices.map((invoice) => (
                  <SalesInvoiceItem invoice={invoice} key={invoice.salesInvoiceId} />
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-[#D8E4EE] bg-[#FBFDFF] px-4 py-8 text-center text-[14px] text-[#5F748A]">
                  No sales invoices have been recorded yet.
                </div>
              )}
            </div>
          </PanelFrame>

          <PanelFrame
            action={
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                to="/staff/customer-reports"
              >
                Review credits
              </Link>
            }
            icon="pending_actions"
            subtitle="Customers who currently need follow-up on unpaid or overdue balances."
            title="Credit Follow-up"
          >
            <div className="space-y-4">
              {pendingCredits.length > 0 ? (
                pendingCredits.slice(0, 5).map((customer) => (
                  <CreditFollowUpItem customer={customer} key={customer.customerId} />
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-[#D8E4EE] bg-[#FBFDFF] px-4 py-8 text-center text-[14px] text-[#5F748A]">
                  No pending credit follow-ups are waiting right now.
                </div>
              )}
            </div>
          </PanelFrame>
        </div>
      </div>
    </main>
  )
}
