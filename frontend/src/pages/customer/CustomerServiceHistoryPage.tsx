import { useEffect, useState } from 'react'

import type {
  CustomerServiceHistoryItem,
  ServiceStatusValue,
} from '../../shared/interfaces/customer.interface'
import { apiRequest, getApiErrorMessage } from '../../shared/utils/api'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function serviceStatusLabel(status: ServiceStatusValue): string {
  if (typeof status === 'string') {
    return status
  }

  if (status === 0) {
    return 'Pending'
  }

  if (status === 1) {
    return 'InProgress'
  }

  return 'Completed'
}

function serviceStatusTone(status: ServiceStatusValue): string {
  const label = serviceStatusLabel(status)

  if (label === 'Completed') {
    return 'bg-[#E6F3EC] text-[#1F7A4A]'
  }

  if (label === 'InProgress') {
    return 'bg-[#E6EEFB] text-[#15558D]'
  }

  return 'bg-[#FFF4DE] text-[#9B6A12]'
}

function CustomerServiceHistoryPage() {
  const [records, setRecords] = useState<CustomerServiceHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)

  useEffect(() => {
    let isCancelled = false

    const fetchData = async () => {
      setIsLoading(true)
      const response = await apiRequest<CustomerServiceHistoryItem[]>(
        '/api/customers/me/service-history',
      )

      if (isCancelled) {
        return
      }

      if (response.success && response.data) {
        setRecords(response.data)
        setErrorMessage(null)
      } else {
        setRecords([])
        setErrorMessage(getApiErrorMessage(response))
      }

      setIsLoading(false)
    }

    void fetchData()

    return () => {
      isCancelled = true
    }
  }, [])

  return (
    <main className="mx-auto w-full max-w-370 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="mb-6 rounded-4xl border border-[#DCE5EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_58%,#EEF5FC_100%)] px-6 py-7 shadow-[0_28px_60px_rgba(18,43,74,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">Records</p>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)] sm:text-[34px]">
          Service history
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#52677F]">
          Review every service performed on your vehicles, including the parts changed and labor charges.
        </p>
      </section>

      <section className="rounded-4xl border border-[#DCE5EF] bg-white px-4 py-6 shadow-[0_18px_36px_rgba(18,43,74,0.06)] sm:px-6">
        {isLoading ? (
          <div className="flex items-center gap-3 text-[14px] text-[#52677F]">
            <span aria-hidden className="material-symbols-outlined animate-spin text-[#15558D]">
              progress_activity
            </span>
            Loading your service history...
          </div>
        ) : errorMessage ? (
          <p className="text-[14px] text-[#A94E48]">{errorMessage}</p>
        ) : records.length === 0 ? (
          <p className="rounded-3xl bg-[#F7FBFE] px-4 py-8 text-center text-[14px] text-[#52677F]">
            No service records yet. After your first appointment is completed, you&apos;ll see it here.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {records.map((record) => (
              <li
                className="rounded-3xl border border-[#E4EBF3] bg-[#F8FBFE] px-4 py-4 sm:px-5"
                key={record.serviceRecordId}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold text-[#0C2544]">{record.serviceDescription}</p>
                    <p className="mt-1 text-[12px] text-[#52677F]">
                      {formatDate(record.serviceDate)} &middot; {record.vehicleNumber} ({record.vehicleBrandModel}) &middot; Staff:{' '}
                      {record.staffName}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${serviceStatusTone(record.status)}`}>
                    {serviceStatusLabel(record.status)}
                  </span>
                </div>

                <div className="mt-3 grid gap-3 text-[13px] text-[#52677F] sm:grid-cols-[2fr_1fr]">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em]">Parts changed / suggested</p>
                    <p className="mt-1 text-[#0C2544]">{record.partsChangedOrSuggested?.trim() || 'None recorded'}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em]">Labor cost</p>
                    <p className="text-[15px] font-semibold text-[#0C2544]">{formatCurrency(record.laborCost)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default CustomerServiceHistoryPage
