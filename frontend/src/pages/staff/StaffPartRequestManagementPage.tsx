import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

import type { PagedResult } from '../../shared/interfaces/api.interface'
import type {
  StaffPartRequestRecord,
  UpdatePartRequestStatusRequest,
} from '../../shared/interfaces/partRequests.interface'
import { apiRequest, getApiErrorMessage } from '../../shared/utils/api'

type ManagedPartRequestStatus = 'Available' | 'Reviewed' | 'Unavailable'

type SummaryTone = 'danger' | 'neutral' | 'primary' | 'success' | 'warning'

type SummaryCardDefinition = {
  detail: string
  icon: string
  label: string
  tone: SummaryTone
  value: string
}

const STATUS_FILTERS = ['All Status', 'Pending', 'Reviewed', 'Available', 'Unavailable', 'Cancelled'] as const

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
          <span aria-hidden className="material-symbols-outlined text-[24px]">
            {card.icon}
          </span>
        </span>
      </div>
      <p className="mt-4 text-[14px] leading-6 text-[#52677F]">{card.detail}</p>
    </article>
  )
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === 'Pending'
      ? 'bg-orange-100 text-orange-700'
      : status === 'Reviewed'
        ? 'bg-blue-100 text-blue-700'
        : status === 'Available'
          ? 'bg-emerald-100 text-emerald-700'
          : status === 'Unavailable'
            ? 'bg-[#ffdbca] text-[#783200]'
            : status === 'Cancelled'
              ? 'bg-red-100 text-red-700'
              : 'bg-slate-100 text-slate-600'

  return (
    <span className={`inline-flex min-h-7 items-center justify-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${className}`}>
      {status}
    </span>
  )
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const className =
    urgency === 'Emergency'
      ? 'bg-red-100 text-red-700'
      : urgency === 'Urgent'
        ? 'bg-orange-100 text-orange-700'
        : 'bg-slate-100 text-slate-600'

  return (
    <span className={`inline-flex min-h-7 items-center justify-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${className}`}>
      {urgency}
    </span>
  )
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6D8197]">{label}</p>
      <p className="mt-2 text-[15px] font-semibold text-[#102B49]">{value}</p>
    </div>
  )
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTimeOrDash(value?: null | string) {
  return value ? formatDateTime(value) : '-'
}

function getStatusOptions(status: string): ManagedPartRequestStatus[] {
  if (status === 'Pending') {
    return ['Reviewed', 'Available', 'Unavailable']
  }

  if (status === 'Reviewed') {
    return ['Reviewed', 'Available', 'Unavailable']
  }

  if (status === 'Available') {
    return ['Available']
  }

  if (status === 'Unavailable') {
    return ['Unavailable']
  }

  return []
}

function getPreferredManagedStatus(status: string): ManagedPartRequestStatus {
  if (status === 'Reviewed' || status === 'Available' || status === 'Unavailable') {
    return status
  }

  return 'Reviewed'
}

export default function StaffPartRequestManagementPage() {
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [requests, setRequests] = useState<StaffPartRequestRecord[]>([])
  const [responseNotes, setResponseNotes] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<null | StaffPartRequestRecord>(null)
  const [selectedStatus, setSelectedStatus] = useState<ManagedPartRequestStatus>('Reviewed')
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('All Status')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [submittedStatus, setSubmittedStatus] = useState('')
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  useEffect(() => {
    let isCancelled = false

    async function loadPartRequests() {
      setIsLoading(true)
      setErrorMessage(null)

      const query = new URLSearchParams({
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
      })

      if (submittedSearch) {
        query.set('searchTerm', submittedSearch)
      }

      if (submittedStatus) {
        query.set('status', submittedStatus)
      }

      const response = await apiRequest<PagedResult<StaffPartRequestRecord>>(`/api/part-requests/staff?${query.toString()}`)

      if (isCancelled) {
        return
      }

      if (response.success && response.data) {
        setRequests(response.data.items)
        setHasNextPage(response.data.hasNextPage)
        setHasPreviousPage(response.data.hasPreviousPage)
        setTotalPages(response.data.totalPages || 1)
        setTotalRecords(response.data.totalRecords)
      } else {
        setRequests([])
        setHasNextPage(false)
        setHasPreviousPage(false)
        setTotalPages(1)
        setTotalRecords(0)
        setErrorMessage(getApiErrorMessage(response))
      }

      setIsLoading(false)
    }

    void loadPartRequests()

    return () => {
      isCancelled = true
    }
  }, [pageNumber, pageSize, submittedSearch, submittedStatus])

  const summaryCards = useMemo<SummaryCardDefinition[]>(() => {
    const pendingCount = requests.filter((request) => request.status === 'Pending').length
    const reviewedCount = requests.filter((request) => request.status === 'Reviewed').length
    const availableCount = requests.filter((request) => request.status === 'Available').length
    const unavailableCount = requests.filter((request) => request.status === 'Unavailable').length

    return [
      {
        detail: 'Part requests matching the current search and status filters.',
        icon: 'inventory_2',
        label: 'Visible Requests',
        tone: 'primary',
        value: String(totalRecords),
      },
      {
        detail: 'Requests still waiting for staff review or a final supplier decision.',
        icon: 'pending_actions',
        label: 'Pending On Page',
        tone: pendingCount > 0 ? 'warning' : 'neutral',
        value: String(pendingCount),
      },
      {
        detail: 'Requests that have been reviewed and are waiting for an availability decision.',
        icon: 'fact_check',
        label: 'Reviewed On Page',
        tone: reviewedCount > 0 ? 'primary' : 'neutral',
        value: String(reviewedCount),
      },
      {
        detail: 'Requests currently marked as available for customer follow-up.',
        icon: 'task_alt',
        label: 'Available On Page',
        tone: availableCount > 0 ? 'success' : 'neutral',
        value: String(availableCount),
      },
      {
        detail: 'Requests confirmed as unavailable from the current staff queue.',
        icon: 'remove_shopping_cart',
        label: 'Unavailable On Page',
        tone: unavailableCount > 0 ? 'danger' : 'neutral',
        value: String(unavailableCount),
      },
    ]
  }, [requests, totalRecords])

  function applyFilters() {
    setPageNumber(1)
    setSubmittedSearch(searchInput.trim())
    setSubmittedStatus(statusFilter === 'All Status' ? '' : statusFilter)
  }

  function resetFilters() {
    setPageNumber(1)
    setSearchInput('')
    setStatusFilter('All Status')
    setSubmittedSearch('')
    setSubmittedStatus('')
  }

  function openManagementDrawer(request: StaffPartRequestRecord) {
    setSelectedRequest(request)
    setSelectedStatus(getPreferredManagedStatus(request.status))
    setResponseNotes(request.adminResponse ?? '')
  }

  async function saveStatusUpdate() {
    if (!selectedRequest) {
      return
    }

    const payload: UpdatePartRequestStatusRequest = {
      adminResponse: responseNotes.trim() ? responseNotes.trim() : null,
      status: selectedStatus,
    }

    try {
      setIsSaving(true)

      const response = await apiRequest<StaffPartRequestRecord>(
        `/api/part-requests/${selectedRequest.partRequestId}/status`,
        {
          body: payload,
          method: 'PATCH',
        },
      )

      if (!response.success || !response.data) {
        throw new Error(getApiErrorMessage(response))
      }

      setRequests((current) =>
        current.map((request) =>
          request.partRequestId === response.data?.partRequestId ? response.data : request,
        ),
      )

      setSelectedRequest(response.data)
      setSelectedStatus(getPreferredManagedStatus(response.data.status))
      setResponseNotes(response.data.adminResponse ?? '')
      toast.success(response.message || 'Part request updated successfully.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update the part request.')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedOptions = selectedRequest ? getStatusOptions(selectedRequest.status) : []
  const canSave = selectedRequest !== null && selectedOptions.length > 0

  return (
    <main className="mx-auto w-full max-w-380 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="mb-6 rounded-4xl border border-[#DCE5EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_58%,#EEF5FC_100%)] px-6 py-7 shadow-[0_28px_60px_rgba(18,43,74,0.08)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">Parts follow-up desk</p>
            <h1 className="mt-1 text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)] sm:text-[34px]">
              Unavailable part requests
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-[#52677F]">
              Review incoming part requests, confirm supplier availability, and leave clear staff responses for each customer follow-up.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
              to="/staff"
            >
              <span aria-hidden className="material-symbols-outlined text-[18px]">
                dashboard
              </span>
              Staff dashboard
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
              to="/customers/search"
            >
              <span aria-hidden className="material-symbols-outlined text-[18px]">
                groups
              </span>
              Customer search
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <SummaryCard card={card} key={card.label} />
        ))}
      </section>

      <section className="mt-6 rounded-4xl border border-[#DCE5EF] bg-white px-4 py-5 shadow-[0_18px_36px_rgba(18,43,74,0.06)] sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1.6fr)_220px]">
            <div className="relative">
              <span aria-hidden className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7D8FA3]">
                search
              </span>
              <input
                className="h-12 w-full rounded-full border border-[#D7E2ED] bg-[#F8FBFE] pl-12 pr-4 text-[14px] text-[#123052] outline-none transition focus:border-[#15558D] focus:bg-white"
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by customer, part name, part number, category, or vehicle..."
                type="text"
                value={searchInput}
              />
            </div>

            <label className="relative">
              <select
                className="h-12 w-full appearance-none rounded-full border border-[#D7E2ED] bg-[#F8FBFE] px-4 pr-11 text-[14px] font-medium text-[#123052] outline-none transition focus:border-[#15558D] focus:bg-white"
                onChange={(event) => setStatusFilter(event.target.value as (typeof STATUS_FILTERS)[number])}
                value={statusFilter}
              >
                {STATUS_FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <span aria-hidden className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7D8FA3]">
                expand_more
              </span>
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#15558D] px-5 text-[13px] font-semibold text-white transition hover:bg-[#104873]"
              onClick={applyFilters}
              type="button"
            >
              <span aria-hidden className="material-symbols-outlined text-[18px]">
                filter_alt
              </span>
              Apply filters
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-5 text-[13px] font-semibold text-[#2E4C70] transition hover:bg-[#F7FBFE]"
              onClick={resetFilters}
              type="button"
            >
              <span aria-hidden className="material-symbols-outlined text-[18px]">
                restart_alt
              </span>
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-4xl border border-[#DCE5EF] bg-white shadow-[0_18px_36px_rgba(18,43,74,0.06)]">
        <div className="border-b border-[#E7EEF5] px-5 py-5 sm:px-6">
          <h2 className="text-[20px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">
            Staff part request queue
          </h2>
          <p className="mt-1 text-[14px] leading-6 text-[#597189]">
            Track customer part needs, update availability, and keep every supplier response organized from one place.
          </p>
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center text-[14px] text-[#52677F]">
            <span aria-hidden className="material-symbols-outlined animate-spin text-[36px] text-[#15558D]">
              progress_activity
            </span>
            <p className="mt-3">Loading part requests...</p>
          </div>
        ) : errorMessage ? (
          <div className="px-6 py-12 text-center text-[14px] text-[#A94E48]">{errorMessage}</div>
        ) : requests.length === 0 ? (
          <div className="px-6 py-12 text-center text-[14px] text-[#52677F]">
            No part requests match the current staff filter view.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1120px] text-left text-[13px]">
                <thead className="bg-[#F2F7FC] text-[11px] uppercase tracking-[0.12em] text-[#6D8197]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Requested On</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Part Request</th>
                    <th className="px-6 py-4 font-semibold">Vehicle</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Urgency</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr className="border-t border-[#EEF2F8] bg-white align-top" key={request.partRequestId}>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#102B49]">{formatDateTime(request.requestedAt)}</p>
                        <p className="mt-1 text-[12px] text-[#5F748A]">
                          Updated: {formatDateTimeOrDash(request.updatedAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#102B49]">{request.customerName}</p>
                        <p className="mt-1 text-[12px] text-[#5F748A]">{request.customerPhoneNumber || request.customerEmail || 'No contact details'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#102B49]">{request.partName}</p>
                        <p className="mt-1 text-[12px] text-[#5F748A]">{request.partNumber || 'No part number provided'} - {request.category}</p>
                        <p className="mt-2 max-w-[320px] text-[12px] leading-6 text-[#5F748A]">{request.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#102B49]">{request.vehicleNumber}</p>
                        <p className="mt-1 text-[12px] text-[#5F748A]">{request.vehicleName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4">
                        <UrgencyBadge urgency={request.urgency} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#D7E2ED] px-3 text-[12px] font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                            to={`/customers/${request.customerId}`}
                          >
                            Customer
                          </Link>
                          <button
                            className="inline-flex min-h-9 items-center justify-center rounded-full bg-[#15558D] px-4 text-[12px] font-semibold text-white transition hover:bg-[#104873]"
                            onClick={() => openManagementDrawer(request)}
                            type="button"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-[#EEF2F8] lg:hidden">
              {requests.map((request) => (
                <article className="space-y-4 px-5 py-5" key={request.partRequestId}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[16px] font-semibold text-[#102B49]">{request.partName}</p>
                      <p className="mt-1 text-[13px] text-[#5F748A]">{request.customerName} - {request.vehicleNumber}</p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailBlock label="Requested On" value={formatDateTime(request.requestedAt)} />
                    <DetailBlock label="Category" value={request.category} />
                  </div>
                  <p className="text-[13px] leading-6 text-[#52677F]">{request.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#D7E2ED] px-4 text-[12px] font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                      to={`/customers/${request.customerId}`}
                    >
                      Customer details
                    </Link>
                    <button
                      className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#15558D] px-4 text-[12px] font-semibold text-white transition hover:bg-[#104873]"
                      onClick={() => openManagementDrawer(request)}
                      type="button"
                    >
                      Manage request
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex flex-col gap-4 border-t border-[#E7EEF5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-[13px] text-[#5F748A]">
                Showing {requests.length} of {totalRecords} part requests
              </p>
              <div className="flex items-center gap-3">
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D7E2ED] text-[#2E4C70] transition hover:bg-[#F7FBFE] disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!hasPreviousPage}
                  onClick={() => setPageNumber((current) => Math.max(current - 1, 1))}
                  type="button"
                >
                  <span aria-hidden className="material-symbols-outlined text-[18px]">
                    chevron_left
                  </span>
                </button>
                <span className="text-[13px] font-semibold text-[#123052]">
                  Page {pageNumber} of {totalPages}
                </span>
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D7E2ED] text-[#2E4C70] transition hover:bg-[#F7FBFE] disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!hasNextPage}
                  onClick={() => setPageNumber((current) => current + 1)}
                  type="button"
                >
                  <span aria-hidden className="material-symbols-outlined text-[18px]">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {selectedRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#081728]/45 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[30px] border border-[#DCE5EF] bg-white shadow-[0_32px_64px_rgba(12,37,68,0.22)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#E7EEF5] px-5 py-5 sm:px-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Part request #{selectedRequest.partRequestId}</p>
                <h2 className="mt-2 text-[24px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">
                  Manage part request
                </h2>
                <p className="mt-2 text-[14px] leading-6 text-[#597189]">
                  Review the requested part, update availability, and record a clear staff response for customer follow-up.
                </p>
              </div>
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#D7E2ED] text-[#2E4C70] transition hover:bg-[#F7FBFE]"
                onClick={() => setSelectedRequest(null)}
                type="button"
              >
                <span aria-hidden className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[1.25fr_0.95fr]">
              <section className="space-y-6">
                <div className="rounded-[24px] border border-[#E4EBF3] bg-[#FBFDFF] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Current status</p>
                      <div className="mt-3">
                        <StatusBadge status={selectedRequest.status} />
                      </div>
                    </div>
                    <UrgencyBadge urgency={selectedRequest.urgency} />
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <DetailBlock label="Requested On" value={formatDateTime(selectedRequest.requestedAt)} />
                    <DetailBlock label="Last Updated" value={formatDateTimeOrDash(selectedRequest.updatedAt)} />
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#E4EBF3] bg-white p-5">
                  <h3 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Customer and vehicle</h3>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <DetailBlock label="Customer" value={selectedRequest.customerName} />
                    <DetailBlock label="Phone" value={selectedRequest.customerPhoneNumber || '-'} />
                    <DetailBlock label="Email" value={selectedRequest.customerEmail || '-'} />
                    <DetailBlock label="Vehicle Number" value={selectedRequest.vehicleNumber} />
                    <DetailBlock label="Vehicle" value={selectedRequest.vehicleName} />
                    <DetailBlock label="Category" value={selectedRequest.category} />
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#E4EBF3] bg-white p-5">
                  <h3 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Requested part details</h3>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <DetailBlock label="Part Name" value={selectedRequest.partName} />
                    <DetailBlock label="Part Number" value={selectedRequest.partNumber || 'Not provided'} />
                  </div>
                  <p className="mt-5 rounded-[20px] bg-[#F6FAFD] px-4 py-4 text-[14px] leading-7 text-[#52677F]">
                    {selectedRequest.description}
                  </p>
                </div>
              </section>

              <section className="space-y-6">
                <div className="rounded-[24px] border border-[#E4EBF3] bg-white p-5">
                  <h3 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Staff action</h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#597189]">
                    Review the request, mark final availability, and leave a clear response for the customer.
                  </p>

                  <div className="mt-5 space-y-4">
                    <label className="block">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Update status</span>
                      <select
                        className="mt-2 h-12 w-full rounded-[16px] border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#123052] outline-none transition focus:border-[#15558D] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!canSave || isSaving}
                        onChange={(event) => setSelectedStatus(event.target.value as ManagedPartRequestStatus)}
                        value={selectedStatus}
                      >
                        {selectedOptions.length === 0 ? (
                          <option value="">No staff actions available</option>
                        ) : (
                          selectedOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))
                        )}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Staff response</span>
                      <textarea
                        className="mt-2 h-36 w-full rounded-[20px] border border-[#D7E2ED] bg-[#F8FBFE] px-4 py-3 text-[14px] leading-6 text-[#123052] outline-none transition focus:border-[#15558D] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!canSave || isSaving}
                        onChange={(event) => setResponseNotes(event.target.value)}
                        placeholder="Add supplier feedback, estimated next steps, or an availability explanation for the customer..."
                        value={responseNotes}
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#15558D] px-5 text-[13px] font-semibold text-white transition hover:bg-[#104873] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!canSave || isSaving}
                      onClick={saveStatusUpdate}
                      type="button"
                    >
                      <span aria-hidden className="material-symbols-outlined text-[18px]">
                        save
                      </span>
                      {isSaving ? 'Saving...' : 'Save update'}
                    </button>
                    <button
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-5 text-[13px] font-semibold text-[#2E4C70] transition hover:bg-[#F7FBFE]"
                      onClick={() => setSelectedRequest(null)}
                      type="button"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#E4EBF3] bg-[#FBFDFF] p-5">
                  <h3 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Timeline</h3>
                  <div className="mt-5 grid gap-4">
                    <DetailBlock label="Requested On" value={formatDateTime(selectedRequest.requestedAt)} />
                    <DetailBlock label="Last Updated" value={formatDateTimeOrDash(selectedRequest.updatedAt)} />
                    <DetailBlock label="Customer Record" value={`#${selectedRequest.customerId}`} />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
