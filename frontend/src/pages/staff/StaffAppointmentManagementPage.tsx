import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

import type { PagedResult } from '../../shared/interfaces/api.interface'
import type {
  StaffAppointmentRecord,
  UpdateAppointmentStatusRequest,
} from '../../shared/interfaces/appointments.interface'
import type { ReviewRecord } from '../../shared/interfaces/reviews.interface'
import { apiRequest, getApiErrorMessage } from '../../shared/utils/api'

type ManagedAppointmentStatus = 'Completed' | 'Confirmed' | 'Rejected'

type SummaryTone = 'danger' | 'neutral' | 'primary' | 'success' | 'warning'

type SummaryCardDefinition = {
  detail: string
  icon: string
  label: string
  tone: SummaryTone
  value: string
}

const STATUS_FILTERS = ['All Status', 'Pending', 'Confirmed', 'Completed', 'Rejected', 'Cancelled'] as const

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
    <article className={`rounded-3xl border ${tone.border} bg-white p-5 shadow-[0_14px_34px_rgba(18,43,74,0.05)]`}>
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
      : status === 'Confirmed'
        ? 'bg-blue-100 text-blue-700'
        : status === 'Completed'
          ? 'bg-emerald-100 text-emerald-700'
          : status === 'Rejected'
            ? 'bg-rose-100 text-rose-700'
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          aria-hidden
          className={`material-symbols-outlined text-[22px] ${star <= rating ? 'text-yellow-500' : 'text-slate-300'}`}
        >
          star
        </span>
      ))}
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

function getStatusOptions(status: string): ManagedAppointmentStatus[] {
  if (status === 'Pending') {
    return ['Confirmed', 'Rejected']
  }

  if (status === 'Confirmed') {
    return ['Confirmed', 'Completed', 'Rejected']
  }

  if (status === 'Completed') {
    return ['Completed']
  }

  if (status === 'Rejected') {
    return ['Rejected']
  }

  return []
}

function getPreferredManagedStatus(status: string): ManagedAppointmentStatus {
  if (status === 'Completed' || status === 'Confirmed' || status === 'Rejected') {
    return status
  }

  return 'Confirmed'
}

function buildDefaultServiceDescription(appointment: StaffAppointmentRecord) {
  const serviceType = appointment.serviceType.trim()
  const issueDescription = appointment.issueDescription.trim()

  if (!issueDescription) {
    return serviceType
  }

  return `${serviceType} - ${issueDescription}`
}

export default function StaffAppointmentManagementPage() {
  const [appointments, setAppointments] = useState<StaffAppointmentRecord[]>([])
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [existingReview, setExistingReview] = useState<null | ReviewRecord>(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingReview, setIsLoadingReview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [reviewErrorMessage, setReviewErrorMessage] = useState<null | string>(null)
  const [searchInput, setSearchInput] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState<null | StaffAppointmentRecord>(null)
  const [selectedStatus, setSelectedStatus] = useState<ManagedAppointmentStatus>('Confirmed')
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('All Status')
  const [staffRemarks, setStaffRemarks] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [submittedStatus, setSubmittedStatus] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [servicePartsChangedOrSuggested, setServicePartsChangedOrSuggested] = useState('')
  const [serviceLaborCost, setServiceLaborCost] = useState('')
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  useEffect(() => {
    let isCancelled = false

    async function loadAppointments() {
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

      const response = await apiRequest<PagedResult<StaffAppointmentRecord>>(`/api/appointments/staff?${query.toString()}`)

      if (isCancelled) {
        return
      }

      if (response.success && response.data) {
        setAppointments(response.data.items)
        setHasNextPage(response.data.hasNextPage)
        setHasPreviousPage(response.data.hasPreviousPage)
        setTotalPages(response.data.totalPages || 1)
        setTotalRecords(response.data.totalRecords)
      } else {
        setAppointments([])
        setHasNextPage(false)
        setHasPreviousPage(false)
        setTotalPages(1)
        setTotalRecords(0)
        setErrorMessage(getApiErrorMessage(response))
      }

      setIsLoading(false)
    }

    void loadAppointments()

    return () => {
      isCancelled = true
    }
  }, [pageNumber, pageSize, submittedSearch, submittedStatus])

  useEffect(() => {
    let isCancelled = false

    async function loadReviewForAppointment() {
      if (!selectedAppointment || selectedAppointment.status !== 'Completed') {
        setExistingReview(null)
        setReviewErrorMessage(null)
        return
      }

      setIsLoadingReview(true)
      setExistingReview(null)
      setReviewErrorMessage(null)

      const response = await apiRequest<ReviewRecord>(`/api/reviews/appointment/${selectedAppointment.appointmentId}/staff`)

      if (isCancelled) {
        return
      }

      if (response.success && response.data) {
        setExistingReview(response.data)
      } else {
        setReviewErrorMessage(getApiErrorMessage(response))
      }

      setIsLoadingReview(false)
    }

    void loadReviewForAppointment()

    return () => {
      isCancelled = true
    }
  }, [selectedAppointment])

  const summaryCards = useMemo<SummaryCardDefinition[]>(() => {
    const pendingCount = appointments.filter((appointment) => appointment.status === 'Pending').length
    const confirmedCount = appointments.filter((appointment) => appointment.status === 'Confirmed').length
    const completedCount = appointments.filter((appointment) => appointment.status === 'Completed').length
    const rejectedCount = appointments.filter((appointment) => appointment.status === 'Rejected').length

    return [
      {
        detail: 'Appointments matching the current search and status filters.',
        icon: 'event_note',
        label: 'Visible Requests',
        tone: 'primary',
        value: String(totalRecords),
      },
      {
        detail: 'Requests still waiting for a staff response or scheduling decision.',
        icon: 'pending_actions',
        label: 'Pending On Page',
        tone: pendingCount > 0 ? 'warning' : 'neutral',
        value: String(pendingCount),
      },
      {
        detail: 'Appointments already acknowledged and ready for service preparation.',
        icon: 'approval',
        label: 'Confirmed On Page',
        tone: 'primary',
        value: String(confirmedCount),
      },
      {
        detail: 'Jobs already marked as completed from the current result set.',
        icon: 'task_alt',
        label: 'Completed On Page',
        tone: 'success',
        value: String(completedCount),
      },
      {
        detail: 'Requests turned down or closed out with a staff decision.',
        icon: 'cancel',
        label: 'Rejected On Page',
        tone: rejectedCount > 0 ? 'danger' : 'neutral',
        value: String(rejectedCount),
      },
    ]
  }, [appointments, totalRecords])

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

  function openManagementDrawer(appointment: StaffAppointmentRecord) {
    setSelectedAppointment(appointment)
    setSelectedStatus(getPreferredManagedStatus(appointment.status))
    setStaffRemarks(appointment.adminRemarks ?? '')
    setServiceDescription(appointment.serviceRecord?.serviceDescription ?? buildDefaultServiceDescription(appointment))
    setServicePartsChangedOrSuggested(appointment.serviceRecord?.partsChangedOrSuggested ?? '')
    setServiceLaborCost(appointment.serviceRecord ? String(appointment.serviceRecord.laborCost) : '')
  }

  async function saveStatusUpdate() {
    if (!selectedAppointment) {
      return
    }

    const payload: UpdateAppointmentStatusRequest = {
      adminRemarks: staffRemarks.trim() ? staffRemarks.trim() : null,
      status: selectedStatus,
    }

    if (selectedStatus === 'Completed') {
      const trimmedServiceDescription = serviceDescription.trim()
      const trimmedPartsChangedOrSuggested = servicePartsChangedOrSuggested.trim()
      const trimmedLaborCost = serviceLaborCost.trim()
      const normalizedLaborCost = Number.parseFloat(serviceLaborCost || '0')

      if (!trimmedServiceDescription) {
        toast.error('Service description is required before marking the appointment as completed.')
        return
      }

      if (!trimmedPartsChangedOrSuggested) {
        toast.error('Please record the parts changed or suggested before completing the appointment.')
        return
      }

      if (!trimmedLaborCost) {
        toast.error('Please enter the labor cost before completing the appointment.')
        return
      }

      if (Number.isNaN(normalizedLaborCost) || normalizedLaborCost < 0) {
        toast.error('Labor cost must be zero or greater.')
        return
      }

      payload.serviceDescription = trimmedServiceDescription
      payload.partsChangedOrSuggested = trimmedPartsChangedOrSuggested
      payload.laborCost = normalizedLaborCost
    }

    try {
      setIsSaving(true)

      const response = await apiRequest<StaffAppointmentRecord>(
        `/api/appointments/${selectedAppointment.appointmentId}/status`,
        {
          body: payload,
          method: 'PATCH',
        },
      )

      if (!response.success || !response.data) {
        throw new Error(getApiErrorMessage(response))
      }

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.appointmentId === response.data?.appointmentId ? response.data : appointment,
        ),
      )

      setSelectedAppointment(response.data)
      setSelectedStatus(getPreferredManagedStatus(response.data.status))
      setStaffRemarks(response.data.adminRemarks ?? '')
      setServiceDescription(response.data.serviceRecord?.serviceDescription ?? buildDefaultServiceDescription(response.data))
      setServicePartsChangedOrSuggested(response.data.serviceRecord?.partsChangedOrSuggested ?? '')
      setServiceLaborCost(response.data.serviceRecord ? String(response.data.serviceRecord.laborCost) : '')
      toast.success(response.message || 'Appointment updated successfully.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update the appointment status.')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedOptions = selectedAppointment ? getStatusOptions(selectedAppointment.status) : []
  const canSave = selectedAppointment !== null && selectedOptions.length > 0
  const showReviewPanel = selectedAppointment?.status === 'Completed'
  const shouldShowServiceRecordFields = selectedAppointment !== null && selectedStatus === 'Completed'

  return (
    <main className="mx-auto w-full max-w-380 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="mb-6 rounded-4xl border border-[#DCE5EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_58%,#EEF5FC_100%)] px-6 py-7 shadow-[0_28px_60px_rgba(18,43,74,0.08)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">Service scheduling desk</p>
            <h1 className="mt-1 text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)] sm:text-[34px]">
              Appointment requests
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-[#52677F]">
              Review incoming booking requests, confirm workable slots, close completed services, and leave clear staff notes for follow-up.
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
                placeholder="Search by customer, vehicle number, service type, or issue..."
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
            Staff appointment queue
          </h2>
          <p className="mt-1 text-[14px] leading-6 text-[#597189]">
            Track booking progress, inspect customer requests, and keep every appointment updated from one place.
          </p>
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center text-[14px] text-[#52677F]">
            <span aria-hidden className="material-symbols-outlined animate-spin text-[36px] text-[#15558D]">
              progress_activity
            </span>
            <p className="mt-3">Loading appointment requests...</p>
          </div>
        ) : errorMessage ? (
          <div className="px-6 py-12 text-center text-[14px] text-[#A94E48]">{errorMessage}</div>
        ) : appointments.length === 0 ? (
          <div className="px-6 py-12 text-center text-[14px] text-[#52677F]">
            No appointments match the current staff filter view.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-280 text-left text-[13px]">
                <thead className="bg-[#F2F7FC] text-[11px] uppercase tracking-[0.12em] text-[#6D8197]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Schedule</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Vehicle</th>
                    <th className="px-6 py-4 font-semibold">Request</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Urgency</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr className="border-t border-[#EEF2F8] bg-white align-top" key={appointment.appointmentId}>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#102B49]">{formatDateTime(appointment.appointmentDate)}</p>
                        <p className="mt-1 text-[12px] text-[#5F748A]">
                          Alt: {formatDateTimeOrDash(appointment.alternativeAppointmentDate)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#102B49]">{appointment.customerName}</p>
                        <p className="mt-1 text-[12px] text-[#5F748A]">{appointment.customerPhoneNumber || appointment.customerEmail || 'No contact details'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#102B49]">{appointment.vehicleNumber}</p>
                        <p className="mt-1 text-[12px] text-[#5F748A]">{appointment.vehicleName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#102B49]">{appointment.serviceType}</p>
                        <p className="mt-1 max-w-[320px] text-[12px] leading-6 text-[#5F748A]">{appointment.issueDescription}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={appointment.status} />
                      </td>
                      <td className="px-6 py-4">
                        <UrgencyBadge urgency={appointment.urgency} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#D7E2ED] px-3 text-[12px] font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                            to={`/customers/${appointment.customerId}`}
                          >
                            Customer
                          </Link>
                          <button
                            className="inline-flex min-h-9 items-center justify-center rounded-full bg-[#15558D] px-4 text-[12px] font-semibold text-white transition hover:bg-[#104873]"
                            onClick={() => openManagementDrawer(appointment)}
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
              {appointments.map((appointment) => (
                <article className="space-y-4 px-5 py-5" key={appointment.appointmentId}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[16px] font-semibold text-[#102B49]">{appointment.customerName}</p>
                      <p className="mt-1 text-[13px] text-[#5F748A]">{appointment.vehicleNumber} - {appointment.vehicleName}</p>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailBlock label="Scheduled For" value={formatDateTime(appointment.appointmentDate)} />
                    <DetailBlock label="Service Type" value={appointment.serviceType} />
                  </div>
                  <p className="text-[13px] leading-6 text-[#52677F]">{appointment.issueDescription}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#D7E2ED] px-4 text-[12px] font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                      to={`/customers/${appointment.customerId}`}
                    >
                      Customer details
                    </Link>
                    <button
                      className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#15558D] px-4 text-[12px] font-semibold text-white transition hover:bg-[#104873]"
                      onClick={() => openManagementDrawer(appointment)}
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
                Showing {appointments.length} of {totalRecords} appointment requests
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

      {selectedAppointment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#081728]/45 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[30px] border border-[#DCE5EF] bg-white shadow-[0_32px_64px_rgba(12,37,68,0.22)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#E7EEF5] px-5 py-5 sm:px-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Appointment #{selectedAppointment.appointmentId}</p>
                <h2 className="mt-2 text-[24px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">
                  Manage appointment request
                </h2>
                <p className="mt-2 text-[14px] leading-6 text-[#597189]">
                  Review the request details, update the appointment status, and record staff notes for the customer file.
                </p>
              </div>
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#D7E2ED] text-[#2E4C70] transition hover:bg-[#F7FBFE]"
                onClick={() => setSelectedAppointment(null)}
                type="button"
              >
                <span aria-hidden className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[1.25fr_0.95fr]">
              <section className="space-y-6">
                <div className="rounded-3xl border border-[#E4EBF3] bg-[#FBFDFF] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Current status</p>
                      <div className="mt-3">
                        <StatusBadge status={selectedAppointment.status} />
                      </div>
                    </div>
                    <UrgencyBadge urgency={selectedAppointment.urgency} />
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <DetailBlock label="Preferred Slot" value={formatDateTime(selectedAppointment.appointmentDate)} />
                    <DetailBlock label="Alternative Slot" value={formatDateTimeOrDash(selectedAppointment.alternativeAppointmentDate)} />
                  </div>
                </div>

                <div className="rounded-3xl border border-[#E4EBF3] bg-white p-5">
                  <h3 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Customer and vehicle</h3>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <DetailBlock label="Customer" value={selectedAppointment.customerName} />
                    <DetailBlock label="Phone" value={selectedAppointment.customerPhoneNumber || '-'} />
                    <DetailBlock label="Email" value={selectedAppointment.customerEmail || '-'} />
                    <DetailBlock label="Vehicle Number" value={selectedAppointment.vehicleNumber} />
                    <DetailBlock label="Vehicle" value={selectedAppointment.vehicleName} />
                    <DetailBlock label="Service Type" value={selectedAppointment.serviceType} />
                  </div>
                </div>

                <div className="rounded-3xl border border-[#E4EBF3] bg-white p-5">
                  <h3 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Customer issue description</h3>
                  <p className="mt-4 rounded-[20px] bg-[#F6FAFD] px-4 py-4 text-[14px] leading-7 text-[#52677F]">
                    {selectedAppointment.issueDescription}
                  </p>
                </div>

                {showReviewPanel ? (
                  <div className="rounded-3xl border border-[#D9E8F6] bg-[#F7FBFF] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Submitted customer review</h3>
                        <p className="mt-2 text-[14px] leading-6 text-[#597189]">
                          Review feedback is visible after the service is completed.
                        </p>
                      </div>
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF3FB] text-[#15558D]">
                        <span aria-hidden className="material-symbols-outlined text-[22px]">
                          rate_review
                        </span>
                      </span>
                    </div>

                    {isLoadingReview ? (
                      <div className="mt-5 flex items-center gap-3 text-[14px] text-[#52677F]">
                        <span aria-hidden className="material-symbols-outlined animate-spin text-[22px] text-[#15558D]">
                          progress_activity
                        </span>
                        Loading submitted review...
                      </div>
                    ) : existingReview ? (
                      <div className="mt-5 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#DCE5EF] bg-white px-4 py-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6D8197]">Customer rating</p>
                            <div className="mt-2">
                              <StarRating rating={existingReview.rating} />
                            </div>
                          </div>
                          <p className="text-[13px] font-medium text-[#597189]">
                            Submitted on {formatDateTime(existingReview.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6D8197]">Review comment</p>
                          <p className="mt-2 rounded-[20px] border border-[#DCE5EF] bg-white px-4 py-4 text-[14px] leading-7 text-[#52677F]">
                            {existingReview.comment}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-[20px] border border-dashed border-[#D7E2ED] bg-white px-4 py-5 text-[14px] text-[#5F748A]">
                        {reviewErrorMessage || 'No review has been submitted for this completed appointment yet.'}
                      </div>
                    )}
                  </div>
                ) : null}
              </section>

              <section className="space-y-6">
                <div className="rounded-3xl border border-[#E4EBF3] bg-white p-5">
                  <h3 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Staff action</h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#597189]">
                    Confirm the booking, close a finished service, or reject the request with a clear note.
                  </p>

                  <div className="mt-5 space-y-4">
                    <label className="block">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Update status</span>
                      <select
                        className="mt-2 h-12 w-full rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#123052] outline-none transition focus:border-[#15558D] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!canSave || isSaving}
                        onChange={(event) => setSelectedStatus(event.target.value as ManagedAppointmentStatus)}
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
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Staff notes</span>
                      <textarea
                        className="mt-2 h-36 w-full rounded-[20px] border border-[#D7E2ED] bg-[#F8FBFE] px-4 py-3 text-[14px] leading-6 text-[#123052] outline-none transition focus:border-[#15558D] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!canSave || isSaving}
                        onChange={(event) => setStaffRemarks(event.target.value)}
                        placeholder="Add a scheduling note, completion remark, or rejection reason for the customer record..."
                        value={staffRemarks}
                      />
                    </label>

                    {shouldShowServiceRecordFields ? (
                      <div className="space-y-4 rounded-[20px] border border-[#D9E8F6] bg-[#F7FBFF] px-4 py-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Service record details</p>
                          <p className="mt-2 text-[13px] leading-6 text-[#597189]">
                            Complete the service notes that should be saved to the customer&apos;s history when this appointment is closed.
                          </p>
                        </div>

                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Service description</span>
                          <textarea
                            className="mt-2 h-28 w-full rounded-[20px] border border-[#D7E2ED] bg-white px-4 py-3 text-[14px] leading-6 text-[#123052] outline-none transition focus:border-[#15558D] disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isSaving}
                            onChange={(event) => setServiceDescription(event.target.value)}
                            placeholder="Summarize the work completed for this appointment..."
                            value={serviceDescription}
                          />
                        </label>

                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Parts changed or suggested</span>
                          <textarea
                            className="mt-2 h-24 w-full rounded-[20px] border border-[#D7E2ED] bg-white px-4 py-3 text-[14px] leading-6 text-[#123052] outline-none transition focus:border-[#15558D] disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isSaving}
                            onChange={(event) => setServicePartsChangedOrSuggested(event.target.value)}
                            placeholder="List replaced parts, recommended follow-up items, or leave blank if none..."
                            value={servicePartsChangedOrSuggested}
                          />
                        </label>

                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Labor cost</span>
                          <input
                            className="mt-2 h-12 w-full rounded-2xl border border-[#D7E2ED] bg-white px-4 text-[14px] font-medium text-[#123052] outline-none transition focus:border-[#15558D] disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isSaving}
                            min="0"
                            onChange={(event) => setServiceLaborCost(event.target.value)}
                            step="0.01"
                            type="number"
                            value={serviceLaborCost}
                          />
                        </label>

                        {selectedAppointment.serviceRecord ? (
                          <p className="text-[12px] text-[#6A8198]">
                            Existing record saved on {formatDateTime(selectedAppointment.serviceRecord.serviceDate)} will be updated when you save this completion.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
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
                      onClick={() => setSelectedAppointment(null)}
                      type="button"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#E4EBF3] bg-[#FBFDFF] p-5">
                  <h3 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Timeline</h3>
                  <div className="mt-5 grid gap-4">
                    <DetailBlock label="Requested On" value={formatDateTime(selectedAppointment.createdAt || selectedAppointment.appointmentDate)} />
                    <DetailBlock label="Last Updated" value={formatDateTimeOrDash(selectedAppointment.updatedAt)} />
                    <DetailBlock label="Customer Record" value={`#${selectedAppointment.customerId}`} />
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
