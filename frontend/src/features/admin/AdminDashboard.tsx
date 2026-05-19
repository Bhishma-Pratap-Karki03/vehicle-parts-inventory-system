import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  formatDateLabel,
  mapPurchaseInvoiceListFromApi,
  formatRupees,
} from '../../components/purchaseInvoices/purchaseInvoices.helpers'
import type { PagedResult } from '../../shared/interfaces/api.interface'
import type {
  InventorySummaryData,
  PartSummaryApiModel,
} from '../../shared/interfaces/parts.interface'
import type {
  PurchaseInvoiceListItemApiModel,
  PurchaseInvoiceListItemRecord,
} from '../../shared/interfaces/purchaseInvoices.interface'
import { useAuth } from '../../shared/auth/useAuth'
import { apiRequest } from '../../shared/utils/api'
import type { AppNotification } from '../../types/notification'
import type { Staff } from '../../types/staff'
import type { Vendor } from '../../types/vendor'

const emptyInventorySummary: InventorySummaryData = {
  totalParts: 0,
  availableParts: 0,
  lowStockParts: 0,
  unavailableParts: 0,
}

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
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-42 animate-pulse rounded-[24px] border border-[#E5EDF5] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_100%)]"
        />
      ))}
    </div>
  )
}

function InvoiceListItem({
  eyebrow,
  amount,
  title,
  meta,
  status,
}: {
  amount: string
  eyebrow: string
  meta: string
  status: string
  title: string
}) {
  return (
    <div className="rounded-[22px] border border-[#E5EDF4] bg-[#FBFDFF] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#71849A]">{eyebrow}</p>
          <h3 className="mt-2 text-[16px] font-semibold text-[#112B49]">{title}</h3>
        </div>
        <span className="inline-flex min-h-7 items-center justify-center rounded-full border border-[#DCE5EF] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#52677F]">
          {status}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-[14px] leading-6 text-[#597189]">{meta}</p>
        <p className="shrink-0 text-[15px] font-semibold text-[#123052]">{amount}</p>
      </div>
    </div>
  )
}

function NotificationItem({ notification }: { notification: AppNotification }) {
  const isUnread = notification.isRead === false

  return (
    <div className="rounded-[22px] border border-[#E5EDF4] bg-[#FBFDFF] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-[#112B49]">
              {notification.title?.trim() || 'System notification'}
            </h3>
            {isUnread ? <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#15558D]" /> : null}
          </div>
          <p className="mt-2 text-[14px] leading-6 text-[#597189]">{notification.message}</p>
        </div>
        <span className="inline-flex min-h-7 items-center justify-center rounded-full border border-[#DCE5EF] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#52677F]">
          {notification.notificationType || 'Alert'}
        </span>
      </div>
      <p className="mt-4 text-[12px] font-medium text-[#73859A]">
        {formatDateLabel(notification.createdAt, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </p>
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [partsSummary, setPartsSummary] = useState<InventorySummaryData>(emptyInventorySummary)
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoiceListItemRecord[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [vendorCount, setVendorCount] = useState(0)
  const [staffCount, setStaffCount] = useState(0)
  const [purchaseInvoiceTotal, setPurchaseInvoiceTotal] = useState(0)

  useEffect(() => {
    let isCancelled = false

    async function loadDashboard() {
      setIsLoading(true)
      setErrorMessage(null)

      const [
        partsResponse,
        purchaseInvoicesResponse,
        vendorsResponse,
        staffResponse,
        notificationsResponse,
      ] = await Promise.all([
        apiRequest<PartSummaryApiModel>('/api/Parts/summary'),
        apiRequest<PagedResult<PurchaseInvoiceListItemApiModel>>('/api/purchase-invoices?pageNumber=1&pageSize=4'),
        apiRequest<Vendor[]>('/api/admin/vendors'),
        apiRequest<Staff[]>('/api/admin/staff'),
        apiRequest<AppNotification[]>('/api/notifications'),
      ])

      if (isCancelled) {
        return
      }

      let hadPartialFailure = false

      if (partsResponse.success && partsResponse.data) {
        setPartsSummary(partsResponse.data)
      } else {
        hadPartialFailure = true
      }

      if (purchaseInvoicesResponse.success && purchaseInvoicesResponse.data) {
        setPurchaseInvoiceTotal(purchaseInvoicesResponse.data.totalRecords)
        setPurchaseInvoices(
          purchaseInvoicesResponse.data.items.map(mapPurchaseInvoiceListFromApi),
        )
      } else {
        hadPartialFailure = true
        setPurchaseInvoiceTotal(0)
        setPurchaseInvoices([])
      }

      if (vendorsResponse.success && vendorsResponse.data) {
        setVendorCount(vendorsResponse.data.filter((vendor) => vendor.isActive).length)
      } else {
        hadPartialFailure = true
        setVendorCount(0)
      }

      if (staffResponse.success && staffResponse.data) {
        setStaffCount(staffResponse.data.filter((staffMember) => staffMember.isActive !== false).length)
      } else {
        hadPartialFailure = true
        setStaffCount(0)
      }

      if (notificationsResponse.success && notificationsResponse.data) {
        setNotifications(notificationsResponse.data.slice(0, 5))
      } else {
        hadPartialFailure = true
        setNotifications([])
      }

      setErrorMessage(
        hadPartialFailure
          ? 'A few admin insights could not be refreshed just now, but the dashboard is still ready to use.'
          : null,
      )
      setIsLoading(false)
    }

    void loadDashboard()

    return () => {
      isCancelled = true
    }
  }, [])

  const summaryCards = useMemo<SummaryCardDefinition[]>(() => {
    const unreadNotifications = notifications.filter((notification) => notification.isRead === false).length

    return [
      {
        detail: 'Catalog records currently available for inventory and billing workflows.',
        icon: 'inventory_2',
        label: 'Total Parts',
        tone: 'primary',
        value: String(partsSummary.totalParts),
      },
      {
        detail: 'Parts currently available for sale or ongoing workshop operations.',
        icon: 'check_circle',
        label: 'Available',
        tone: 'success',
        value: String(partsSummary.availableParts),
      },
      {
        detail: 'Items that need procurement attention before they disrupt customer orders.',
        icon: 'warning',
        label: 'Low Stock',
        tone: 'warning',
        value: String(partsSummary.lowStockParts),
      },
      {
        detail: 'Restock records tracked through vendor purchasing and stock updates.',
        icon: 'receipt_long',
        label: 'Purchase Invoices',
        tone: 'neutral',
        value: String(purchaseInvoiceTotal),
      },
      {
        detail: unreadNotifications > 0
          ? `${unreadNotifications} notification${unreadNotifications === 1 ? '' : 's'} still waiting for review.`
          : 'No unread admin notifications are waiting right now.',
        icon: 'notifications',
        label: 'Admin Signals',
        tone: unreadNotifications > 0 ? 'danger' : 'success',
        value: String(unreadNotifications),
      },
    ]
  }, [notifications, partsSummary, purchaseInvoiceTotal])

  const quickActions = useMemo<QuickAction[]>(() => [
    {
      description: 'Review live catalog records, low-stock items, and part status at a glance.',
      icon: 'inventory',
      label: 'Parts Management',
      to: '/parts',
    },
    {
      description: 'Create a vendor restock invoice and push stock updates into inventory.',
      icon: 'local_shipping',
      label: 'Purchase Invoices',
      to: '/purchase-invoices',
    },
    {
      description: 'Maintain vendor records, contact details, and availability for procurement.',
      icon: 'storefront',
      label: 'Vendor Directory',
      to: '/admin/vendors',
    },
    {
      description: 'Manage staff accounts, onboarding, and access roles for daily operations.',
      icon: 'manage_accounts',
      label: 'Staff Management',
      to: '/admin/staff',
    },
    {
      description: 'Open finance summaries and keep an eye on revenue and operational performance.',
      icon: 'payments',
      label: 'Financial Reports',
      to: '/admin/reports/financial',
    },
    {
      description: 'Review low-stock and credit reminder alerts from one admin queue.',
      icon: 'notifications_active',
      label: 'Notifications',
      to: '/admin/notifications',
    },
  ], [])

  const welcomeName = user?.fullName?.trim() || 'Admin'
  const latestNotification = notifications[0]

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F4F8FC_0%,#EEF4FA_46%,#F8FBFE_100%)] text-[#102B49]">
      <div className="mx-auto w-full max-w-380 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="mb-8 rounded-4xl border border-[#DCE5EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_58%,#EEF5FC_100%)] px-5 py-6 shadow-[0_28px_60px_rgba(18,43,74,0.08)] sm:px-7 sm:py-7">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">
                Admin operations hub
              </p>
              <h1 className="text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)] sm:text-[40px]">
                Welcome back, {welcomeName}
              </h1>
              <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#52677F] sm:text-[16px]">
                Keep inventory, procurement, staffing, and system alerts moving from one clean control surface.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px]">
              <div className="rounded-[22px] border border-[#DCE5EF] bg-white/90 p-4 shadow-[0_12px_28px_rgba(18,43,74,0.05)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Active Vendors</p>
                <p className="mt-3 text-[28px] font-semibold text-[#123052] [font-family:var(--font-display)]">{vendorCount}</p>
                <p className="mt-2 text-[13px] leading-6 text-[#597189]">Suppliers currently active for procurement planning.</p>
              </div>
              <div className="rounded-[22px] border border-[#DCE5EF] bg-white/90 p-4 shadow-[0_12px_28px_rgba(18,43,74,0.05)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Active Staff</p>
                <p className="mt-3 text-[28px] font-semibold text-[#123052] [font-family:var(--font-display)]">{staffCount}</p>
                <p className="mt-2 text-[13px] leading-6 text-[#597189]">Team members currently available in the system.</p>
              </div>
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-6 rounded-[20px] border border-[#F1DDD8] bg-[#FFF7F5] px-4 py-3 text-[14px] leading-6 text-[#9A5650]">
              {errorMessage}
            </div>
          ) : null}

          {latestNotification ? (
            <div className="mt-6 flex flex-col gap-3 rounded-[24px] border border-[#DCE5EF] bg-white/85 px-4 py-4 shadow-[0_12px_28px_rgba(18,43,74,0.05)] sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                  <span
                    aria-hidden
                    className="material-symbols-outlined inline-flex select-none items-center justify-center text-[20px] leading-none not-italic"
                  >
                    notifications_active
                  </span>
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Latest notification</p>
                  <p className="mt-1 text-[15px] font-semibold text-[#123052]">
                    {latestNotification.title?.trim() || 'System alert'}
                  </p>
                  <p className="mt-1 text-[14px] leading-6 text-[#597189]">{latestNotification.message}</p>
                </div>
              </div>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                to="/admin/notifications"
              >
                <span
                  aria-hidden
                  className="material-symbols-outlined inline-flex select-none items-center justify-center text-[18px] leading-none not-italic"
                >
                  east
                </span>
                Review notifications
              </Link>
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

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.25fr_0.9fr]">
          <PanelFrame
            action={
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                to="/admin/dashboard"
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
            subtitle="Jump into the admin workflows that need the most hands-on attention."
            title="Operations Shortcuts"
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
                to="/admin/notifications"
              >
                Open queue
              </Link>
            }
            icon="notifications"
            subtitle="Recent system messages for low stock, reminders, and admin follow-up."
            title="Notification Queue"
          >
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem key={notification.notificationId} notification={notification} />
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-[#D8E4EE] bg-[#FBFDFF] px-4 py-8 text-center text-[14px] text-[#5F748A]">
                  No recent notifications are available right now.
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
                to="/purchase-invoices"
              >
                View all
              </Link>
            }
            icon="receipt_long"
            subtitle="Most recent procurement invoices recorded in the system."
            title="Recent Purchase Invoices"
          >
            <div className="space-y-4">
              {purchaseInvoices.length > 0 ? (
                purchaseInvoices.map((invoice) => (
                  <InvoiceListItem
                    amount={formatRupees(invoice.totalAmount)}
                    eyebrow={invoice.vendorName}
                    key={invoice.purchaseInvoiceId}
                    meta={`${formatDateLabel(invoice.purchaseDate)} • ${invoice.isEmailSent ? 'Email sent' : 'Email pending'}`}
                    status={invoice.status}
                    title={invoice.invoiceNumber}
                  />
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-[#D8E4EE] bg-[#FBFDFF] px-4 py-8 text-center text-[14px] text-[#5F748A]">
                  No purchase invoices have been recorded yet.
                </div>
              )}
            </div>
          </PanelFrame>

          <PanelFrame
            action={
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                to="/parts"
              >
                Open inventory
              </Link>
            }
            icon="inventory"
            subtitle="Keep an eye on the stock conditions that are most likely to trigger procurement work."
            title="Inventory Watch"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[22px] border border-[#E5EDF4] bg-[#FBFDFF] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#71849A]">Low Stock</p>
                <p className="mt-3 text-[24px] font-semibold text-[#A05A11] [font-family:var(--font-display)]">
                  {partsSummary.lowStockParts}
                </p>
                <p className="mt-2 text-[13px] leading-6 text-[#597189]">
                  Parts currently below their minimum reorder threshold.
                </p>
              </div>
              <div className="rounded-[22px] border border-[#E5EDF4] bg-[#FBFDFF] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#71849A]">Unavailable</p>
                <p className="mt-3 text-[24px] font-semibold text-[#52677F] [font-family:var(--font-display)]">
                  {partsSummary.unavailableParts}
                </p>
                <p className="mt-2 text-[13px] leading-6 text-[#597189]">
                  Catalog items that are currently not available for active sale.
                </p>
              </div>
              <div className="rounded-[22px] border border-[#E5EDF4] bg-[#FBFDFF] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#71849A]">Notifications</p>
                <p className="mt-3 text-[24px] font-semibold text-[#15558D] [font-family:var(--font-display)]">
                  {notifications.length}
                </p>
                <p className="mt-2 text-[13px] leading-6 text-[#597189]">
                  Recent admin alerts available for review in the notification queue.
                </p>
              </div>
            </div>
          </PanelFrame>
        </div>
      </div>
    </main>
  )
}
