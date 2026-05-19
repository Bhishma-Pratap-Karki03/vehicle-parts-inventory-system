import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import TablePagination from '../../components/parts/TablePagination'
import { apiRequest, getApiErrorMessage } from '../../shared/utils/api'
import type {
  AppNotification,
  OverdueCreditReminder,
  OverdueCreditReminderSendResult,
} from '../../types/notification'

function buildClientPagination<T>(items: T[], pageNumber: number, pageSize: number) {
  const totalRecords = items.length
  const totalPages = totalRecords === 0 ? 1 : Math.ceil(totalRecords / pageSize)
  const safePageNumber = Math.min(Math.max(pageNumber, 1), totalPages)
  const startIndex = (safePageNumber - 1) * pageSize
  const endIndex = startIndex + pageSize

  return {
    items: items.slice(startIndex, endIndex),
    pageNumber: safePageNumber,
    pageSize,
    totalRecords,
    totalPages,
    hasPreviousPage: safePageNumber > 1,
    hasNextPage: safePageNumber < totalPages,
  }
}

function formatDateLabel(value?: null | string) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatRupees(value: number) {
  return `Rs. ${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function notificationIcon(notificationType?: string) {
  if (notificationType === 'LowStock') {
    return 'warning'
  }

  if (notificationType === 'CreditReminder') {
    return 'send_money'
  }

  return 'notifications_active'
}

function notificationTone(notificationType?: string) {
  if (notificationType === 'LowStock') {
    return 'border-[#F1DCC0] bg-[#FFF8EF] text-[#A05A11]'
  }

  if (notificationType === 'CreditReminder') {
    return 'border-[#F1D7D3] bg-[#FFF4F3] text-[#A94E48]'
  }

  return 'border-[#DCE5EF] bg-[#F7FAFD] text-[#52677F]'
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [overdueCredits, setOverdueCredits] = useState<OverdueCreditReminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [sendingInvoiceId, setSendingInvoiceId] = useState<null | number>(null)
  const [alertsPageNumber, setAlertsPageNumber] = useState(1)
  const [alertsPageSize, setAlertsPageSize] = useState(10)
  const [overduePageNumber, setOverduePageNumber] = useState(1)
  const [overduePageSize, setOverduePageSize] = useState(10)

  const lowStockNotifications = useMemo(
    () => notifications.filter((notification) => notification.notificationType === 'LowStock'),
    [notifications],
  )

  const totalOutstanding = useMemo(
    () => overdueCredits.reduce((sum, invoice) => sum + invoice.remainingAmount, 0),
    [overdueCredits],
  )

  const alertsPage = useMemo(
    () => buildClientPagination(lowStockNotifications, alertsPageNumber, alertsPageSize),
    [alertsPageNumber, alertsPageSize, lowStockNotifications],
  )

  const overdueCreditsPage = useMemo(
    () => buildClientPagination(overdueCredits, overduePageNumber, overduePageSize),
    [overdueCredits, overduePageNumber, overduePageSize],
  )

  async function loadPageData() {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const [notificationsResponse, overdueCreditsResponse] = await Promise.all([
        apiRequest<AppNotification[]>('/api/notifications'),
        apiRequest<OverdueCreditReminder[]>('/api/notifications/overdue-credits'),
      ])

      if (!notificationsResponse.success) {
        throw new Error(getApiErrorMessage(notificationsResponse))
      }

      if (!overdueCreditsResponse.success) {
        throw new Error(getApiErrorMessage(overdueCreditsResponse))
      }

      setNotifications(notificationsResponse.data ?? [])
      setOverdueCredits(overdueCreditsResponse.data ?? [])
    } catch (error) {
      setNotifications([])
      setOverdueCredits([])
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load the notification center.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadPageData()
  }, [])

  async function handleSendReminder(salesInvoiceId: number) {
    setSendingInvoiceId(salesInvoiceId)

    try {
      const response = await apiRequest<OverdueCreditReminderSendResult>(
        `/api/notifications/overdue-credits/${salesInvoiceId}/send`,
        { method: 'POST' },
      )

      if (!response.success) {
        toast.error(getApiErrorMessage(response))
        return
      }

      toast.success(response.message || 'Reminder email sent successfully.')
      await loadPageData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send the reminder email right now.')
    } finally {
      setSendingInvoiceId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F7FAFD_0%,#EEF4FA_55%,#F9FBFE_100%)] text-[#102B49]">
      <div className="mx-auto w-full max-w-380 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="rounded-[30px] border border-[#DCE5EF] bg-white px-6 py-6 shadow-[0_24px_50px_rgba(18,43,74,0.08)] sm:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Admin Operations</p>
          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-[#0C2544] [font-family:var(--font-display)] sm:text-[44px]">
                Notification Center
              </h1>
              <p className="mt-3 text-[15px] leading-7 text-[#566E87] sm:text-[16px]">
                Review live low-stock alerts and send reminder emails for customers whose credit invoices are already past due.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-[22px] border border-[#DCE5EF] bg-[#F8FBFE] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#71849A]">Total alerts</p>
                <p className="mt-3 text-[26px] font-semibold text-[#102B49] [font-family:var(--font-display)]">{notifications.length}</p>
              </article>
              <article className="rounded-[22px] border border-[#F1DCC0] bg-[#FFF8EF] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A05A11]">Low stock</p>
                <p className="mt-3 text-[26px] font-semibold text-[#A05A11] [font-family:var(--font-display)]">{lowStockNotifications.length}</p>
              </article>
              <article className="rounded-[22px] border border-[#F1D7D3] bg-[#FFF4F3] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A94E48]">Overdue credits</p>
                <p className="mt-3 text-[26px] font-semibold text-[#A94E48] [font-family:var(--font-display)]">{overdueCredits.length}</p>
              </article>
              <article className="rounded-[22px] border border-[#DCE5EF] bg-[#F8FBFE] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#71849A]">Outstanding due</p>
                <p className="mt-3 text-[20px] font-semibold text-[#102B49] [font-family:var(--font-display)]">{formatRupees(totalOutstanding)}</p>
              </article>
            </div>
          </div>
        </section>

        {errorMessage ? (
          <div className="mt-6 rounded-[22px] border border-[#F1D7D3] bg-[#FFF4F3] px-5 py-4 text-[14px] font-medium text-[#A94E48]">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-8 space-y-6">
          <section className="rounded-[30px] border border-[#DCE5EF] bg-white shadow-[0_24px_50px_rgba(18,43,74,0.08)]">
            <div className="flex items-start justify-between gap-5 border-b border-[#E7EEF5] px-5 py-5 sm:px-6">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-13 w-13 items-center justify-center rounded-[20px] bg-[#EEF5FC] text-[#15558D]">
                  <span aria-hidden className="material-symbols-outlined text-[24px] leading-none not-italic">notifications_active</span>
                </span>
                <div>
                  <h2 className="text-[22px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Live System Alerts</h2>
                  <p className="mt-1 text-[14px] leading-6 text-[#597189]">Current low-stock warnings that need admin attention.</p>
                </div>
              </div>
              
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    className="h-28 animate-pulse rounded-[22px] border border-[#E5EDF4] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_100%)]"
                    key={index}
                  />
                ))
              ) : alertsPage.totalRecords > 0 ? (
                alertsPage.items.map((notification) => (
                  <article
                    className={`rounded-[22px] border px-4 py-4 ${notificationTone(notification.notificationType)}`}
                    key={notification.notificationId}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px] leading-none not-italic">
                            {notificationIcon(notification.notificationType)}
                          </span>
                          <h3 className="text-[15px] font-semibold text-[#102B49]">{notification.title || 'System alert'}</h3>
                        </div>
                        <p className="mt-2 text-[14px] leading-6 text-[#52677F]">{notification.message}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="inline-flex min-h-7 items-center justify-center rounded-full border border-[#DCE5EF] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#52677F]">
                            {notification.notificationType || 'Alert'}
                          </span>
                          <span className="text-[12px] font-medium text-[#70849A]">{formatDateLabel(notification.createdAt)}</span>
                        </div>
                      </div>
                      {notification.actionUrl ? (
                        <Link
                          className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#CAD7E5] bg-white px-4 text-[13px] font-semibold text-[#294765] no-underline transition hover:bg-[#F7FBFE]"
                          to={notification.actionUrl}
                        >
                          Open
                        </Link>
                      ) : null}
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-[#D7E3EE] bg-[#F8FBFE] px-5 py-10 text-center">
                  <span className="material-symbols-outlined text-[36px] text-[#8EA2B8]">notifications</span>
                  <p className="mt-4 text-[18px] font-semibold text-[#102B49]">No active alerts right now</p>
                  <p className="mt-2 text-[14px] leading-6 text-[#607790]">
                    Stock levels look healthy.
                  </p>
                </div>
              )}
            </div>

            {!isLoading && alertsPage.totalRecords > 0 ? (
              <TablePagination
                emptyLabel="No alerts found"
                hasNextPage={alertsPage.hasNextPage}
                hasPreviousPage={alertsPage.hasPreviousPage}
                itemLabelPlural="alerts"
                itemLabelSingular="alert"
                onPageChange={setAlertsPageNumber}
                onPageSizeChange={(pageSize) => {
                  setAlertsPageNumber(1)
                  setAlertsPageSize(pageSize)
                }}
                pageNumber={alertsPage.pageNumber}
                pageSize={alertsPage.pageSize}
                totalPages={alertsPage.totalPages}
                totalRecords={alertsPage.totalRecords}
              />
            ) : null}
          </section>

          <section className="rounded-[30px] border border-[#DCE5EF] bg-white shadow-[0_24px_50px_rgba(18,43,74,0.08)]">
            <div className="flex items-start justify-between gap-5 border-b border-[#E7EEF5] px-5 py-5 sm:px-6">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-13 w-13 items-center justify-center rounded-[20px] bg-[#EEF5FC] text-[#15558D]">
                  <span aria-hidden className="material-symbols-outlined text-[24px] leading-none not-italic">send_money</span>
                </span>
                <div>
                  <h2 className="text-[22px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Overdue Credit Reminders</h2>
                  <p className="mt-1 text-[14px] leading-6 text-[#597189]">Send reminder emails to customers whose sales-invoice due dates have already passed.</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto px-5 py-5 sm:px-6 sm:py-6">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">
                    <th className="px-3 py-1">Customer</th>
                    <th className="px-3 py-1">Invoice</th>
                    <th className="px-3 py-1">Due Date</th>
                    <th className="px-3 py-1">Remaining</th>
                    <th className="px-3 py-1">Last Reminder</th>
                    <th className="px-3 py-1 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index}>
                        <td className="rounded-l-[18px] border border-r-0 border-[#E5EDF4] bg-[#FBFDFF] px-3 py-5" colSpan={5}>
                          <div className="h-12 animate-pulse rounded-xl bg-[#F1F6FB]" />
                        </td>
                        <td className="rounded-r-[18px] border border-l-0 border-[#E5EDF4] bg-[#FBFDFF] px-3 py-5">
                          <div className="h-12 animate-pulse rounded-full bg-[#F1F6FB]" />
                        </td>
                      </tr>
                    ))
                  ) : overdueCreditsPage.totalRecords > 0 ? (
                    overdueCreditsPage.items.map((invoice) => (
                      <tr key={invoice.salesInvoiceId}>
                        <td className="rounded-l-[18px] border border-r-0 border-[#E5EDF4] bg-[#FBFDFF] px-3 py-4 align-top">
                          <p className="text-[15px] font-semibold text-[#112B49]">{invoice.customerName}</p>
                          <p className="mt-1 text-[13px] text-[#607790]">{invoice.customerEmail || 'No email address'}</p>
                          {invoice.customerPhoneNumber ? <p className="mt-1 text-[13px] text-[#607790]">{invoice.customerPhoneNumber}</p> : null}
                        </td>
                        <td className="border border-x-0 border-[#E5EDF4] bg-[#FBFDFF] px-3 py-4 align-top">
                          <p className="text-[14px] font-semibold text-[#112B49]">{invoice.invoiceNumber}</p>
                          <p className="mt-1 text-[13px] text-[#607790]">{invoice.vehicleNumber}</p>
                          <p className="mt-2 text-[12px] font-medium text-[#70849A]">
                            Final {formatRupees(invoice.finalAmount)} • Paid {formatRupees(invoice.paidAmount)}
                          </p>
                        </td>
                        <td className="border border-x-0 border-[#E5EDF4] bg-[#FBFDFF] px-3 py-4 align-top">
                          <p className="text-[14px] font-semibold text-[#A94E48]">{formatDateLabel(invoice.dueDate)}</p>
                          <p className="mt-1 text-[12px] text-[#70849A]">Invoice date {formatDateLabel(invoice.invoiceDate)}</p>
                        </td>
                        <td className="border border-x-0 border-[#E5EDF4] bg-[#FBFDFF] px-3 py-4 align-top">
                          <p className="text-[15px] font-semibold text-[#112B49]">{formatRupees(invoice.remainingAmount)}</p>
                        </td>
                        <td className="border border-x-0 border-[#E5EDF4] bg-[#FBFDFF] px-3 py-4 align-top">
                          <p className="text-[13px] text-[#607790]">
                            {invoice.lastReminderSentAt ? formatDateLabel(invoice.lastReminderSentAt) : 'Not sent yet'}
                          </p>
                        </td>
                        <td className="rounded-r-[18px] border border-l-0 border-[#E5EDF4] bg-[#FBFDFF] px-3 py-4 text-right align-top">
                          <button
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#15558D] px-4 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(21,85,141,0.18)] transition hover:bg-[#0E487C] disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={sendingInvoiceId === invoice.salesInvoiceId || !invoice.customerEmail}
                            onClick={() => void handleSendReminder(invoice.salesInvoiceId)}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px] leading-none not-italic">send</span>
                            {sendingInvoiceId === invoice.salesInvoiceId ? 'Sending...' : 'Send Reminder'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="rounded-3xl border border-dashed border-[#D7E3EE] bg-[#F8FBFE] px-4 py-10 text-center" colSpan={6}>
                        <span className="material-symbols-outlined text-[36px] text-[#8EA2B8]">task_alt</span>
                        <p className="mt-4 text-[18px] font-semibold text-[#102B49]">No overdue credits to chase</p>
                        <p className="mt-2 text-[14px] leading-6 text-[#607790]">All open sales invoices are either within their due period or fully paid.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!isLoading && overdueCreditsPage.totalRecords > 0 ? (
              <TablePagination
                emptyLabel="No overdue credit reminders found"
                hasNextPage={overdueCreditsPage.hasNextPage}
                hasPreviousPage={overdueCreditsPage.hasPreviousPage}
                itemLabelPlural="overdue reminders"
                itemLabelSingular="overdue reminder"
                onPageChange={setOverduePageNumber}
                onPageSizeChange={(pageSize) => {
                  setOverduePageNumber(1)
                  setOverduePageSize(pageSize)
                }}
                pageNumber={overdueCreditsPage.pageNumber}
                pageSize={overdueCreditsPage.pageSize}
                totalPages={overdueCreditsPage.totalPages}
                totalRecords={overdueCreditsPage.totalRecords}
              />
            ) : null}
          </section>
        </div>
      </div>
    </main>
  )
}
