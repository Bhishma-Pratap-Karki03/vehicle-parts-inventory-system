import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import type {
  CustomerHistorySummary,
  CustomerProfile,
  CustomerVehicle,
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

function CustomerHomePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [summary, setSummary] = useState<CustomerHistorySummary | null>(null)
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)

  useEffect(() => {
    let isCancelled = false

    const fetchDashboardData = async () => {
      setIsLoading(true)

      const [profileResponse, summaryResponse, vehiclesResponse] = await Promise.all([
        apiRequest<CustomerProfile>('/api/customers/me'),
        apiRequest<CustomerHistorySummary>('/api/customers/me/history/summary'),
        apiRequest<CustomerVehicle[]>('/api/customers/me/vehicles'),
      ])

      if (isCancelled) {
        return
      }

      if (profileResponse.success && profileResponse.data) {
        setProfile(profileResponse.data)
        setErrorMessage(null)
      } else {
        setProfile(null)
        setErrorMessage(getApiErrorMessage(profileResponse))
      }

      if (summaryResponse.success && summaryResponse.data) {
        setSummary(summaryResponse.data)
      } else {
        setSummary(null)
      }

      if (vehiclesResponse.success && vehiclesResponse.data) {
        setVehicles(vehiclesResponse.data)
      } else {
        setVehicles([])
      }

      setIsLoading(false)
    }

    void fetchDashboardData()

    return () => {
      isCancelled = true
    }
  }, [])

  const statCards = useMemo(
    () => [
      {
        accent: 'bg-[#EEF4FA] text-[#15558D]',
        icon: 'directions_car',
        label: 'Vehicles',
        value: summary ? String(summary.vehicleCount) : '0',
      },
      {
        accent: 'bg-[#E6F3EC] text-[#1F7A4A]',
        icon: 'shopping_bag',
        label: 'Purchases',
        value: summary ? String(summary.totalPurchases) : '0',
      },
      {
        accent: 'bg-[#F4EEFF] text-[#7150B8]',
        icon: 'build_circle',
        label: 'Services',
        value: summary ? String(summary.totalServices) : '0',
      },
      {
        accent:
          summary && summary.outstandingBalance > 0
            ? 'bg-[#FBEAE7] text-[#A94E48]'
            : 'bg-[#EEF4FA] text-[#15558D]',
        icon: 'payments',
        label: 'Outstanding',
        value: summary ? `Rs. ${formatCurrency(summary.outstandingBalance)}` : 'Rs. 0.00',
      },
    ],
    [summary],
  )

  const quickActions = [
    {
      description: 'Schedule workshop time for diagnostics, repair, or routine service.',
      icon: 'calendar_month',
      title: 'Book Appointment',
      to: '/appointments/book',
    },
    {
      description: 'Request a part if it is not currently available in the store.',
      icon: 'inventory_2',
      title: 'Request Part',
      to: '/parts/request',
    },
    {
      description: 'Keep your registered vehicles updated so service and invoices stay accurate.',
      icon: 'garage',
      title: 'Manage Vehicles',
      to: '/customer/vehicles',
    },
    {
      description: 'Review invoices, balances, and your latest purchase activity.',
      icon: 'receipt_long',
      title: 'Purchase History',
      to: '/customer/purchase-history',
    },
  ]

  return (
    <main className="mx-auto w-full max-w-370 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-4xl border border-[#DCE5EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F5FAFE_52%,#EAF3FC_100%)] px-6 py-7 shadow-[0_28px_60px_rgba(18,43,74,0.08)] sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">Customer home</p>
            <h1 className="mt-1 text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)] sm:text-[36px]">
              {profile ? `Welcome back, ${profile.fullName.split(' ')[0]}` : 'Welcome back'}
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#52677F]">
              Keep track of your vehicles, bookings, purchases, and outstanding balances from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-5 text-[14px] font-semibold text-[#2E4C70] shadow-[0_12px_24px_rgba(18,43,74,0.06)] transition hover:bg-[#F7FBFE]"
              to="/customer/profile"
            >
              <span aria-hidden className="material-symbols-outlined text-[18px]">
                person
              </span>
              Profile
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#15558D] px-6 text-[14px] font-semibold text-white shadow-[0_16px_30px_rgba(21,85,141,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0B4376]"
              to="/appointments/book"
            >
              <span aria-hidden className="material-symbols-outlined text-[18px]">
                add_circle
              </span>
              Book appointment
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div
              className="rounded-3xl border border-[#E4EBF3] bg-white px-5 py-4 shadow-[0_10px_18px_rgba(18,43,74,0.04)]"
              key={card.label}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6D8197]">{card.label}</p>
                <span className={`grid h-10 w-10 place-items-center rounded-2xl ${card.accent}`}>
                  <span aria-hidden className="material-symbols-outlined text-[19px]">
                    {card.icon}
                  </span>
                </span>
              </div>
              <p className="mt-3 text-[24px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {isLoading ? (
        <section className="mt-6 rounded-4xl border border-[#DCE5EF] bg-white px-6 py-10 shadow-[0_18px_36px_rgba(18,43,74,0.06)]">
          <div className="flex items-center gap-3 text-[14px] text-[#52677F]">
            <span aria-hidden className="material-symbols-outlined animate-spin text-[#15558D]">
              progress_activity
            </span>
            Loading your dashboard...
          </div>
        </section>
      ) : errorMessage ? (
        <section className="mt-6 rounded-4xl border border-[#EBC7C2] bg-white px-6 py-8 shadow-[0_18px_36px_rgba(18,43,74,0.05)]">
          <h2 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">
            Unable to load home
          </h2>
          <p className="mt-3 text-[14px] leading-7 text-[#A94E48]">{errorMessage}</p>
        </section>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-4xl border border-[#DCE5EF] bg-white px-6 py-7 shadow-[0_18px_36px_rgba(18,43,74,0.06)]">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EEF4FA] text-[#15558D]">
                <span aria-hidden className="material-symbols-outlined text-[22px]">bolt</span>
              </span>
              <div>
                <h2 className="text-[20px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">
                  Quick actions
                </h2>
                <p className="text-[14px] text-[#52677F]">Jump into the things customers use most.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {quickActions.map((action) => (
                <Link
                  className="group rounded-3xl border border-[#E4EBF3] bg-[linear-gradient(180deg,#FFFFFF_0%,#F9FBFE_100%)] px-5 py-5 no-underline shadow-[0_10px_18px_rgba(18,43,74,0.04)] transition hover:-translate-y-0.5 hover:border-[#C6D7E8]"
                  key={action.to}
                  to={action.to}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#EEF4FA] text-[#15558D] transition group-hover:bg-[#15558D] group-hover:text-white">
                    <span aria-hidden className="material-symbols-outlined text-[20px]">
                      {action.icon}
                    </span>
                  </span>
                  <h3 className="mt-4 text-[17px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">
                    {action.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-[#52677F]">{action.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <section className="rounded-4xl border border-[#DCE5EF] bg-white px-6 py-7 shadow-[0_18px_36px_rgba(18,43,74,0.06)]">
              <h2 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Account snapshot</h2>
              <dl className="mt-5 flex flex-col gap-4 text-[14px] text-[#102B49]">
                <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F8] pb-3">
                  <dt className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6D8197]">Email</dt>
                  <dd className="break-all text-right font-medium text-[#0C2544]">{profile?.email || '—'}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F8] pb-3">
                  <dt className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6D8197]">Phone</dt>
                  <dd className="text-right font-medium text-[#0C2544]">{profile?.phoneNumber || 'Not added yet'}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6D8197]">Member since</dt>
                  <dd className="font-medium text-[#0C2544]">{profile ? formatDate(profile.createdAt) : '—'}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-4xl border border-[#DCE5EF] bg-white px-6 py-7 shadow-[0_18px_36px_rgba(18,43,74,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Garage overview</h2>
                <Link className="text-[13px] font-semibold text-[#15558D] no-underline hover:underline" to="/customer/vehicles">
                  Manage
                </Link>
              </div>

              {vehicles.length === 0 ? (
                <p className="mt-5 rounded-3xl bg-[#F7FBFE] px-4 py-6 text-[14px] leading-7 text-[#52677F]">
                  No vehicles added yet. Add your first vehicle to start booking appointments and linking purchases correctly.
                </p>
              ) : (
                <div className="mt-5 flex flex-col gap-3">
                  {vehicles.slice(0, 3).map((vehicle) => (
                    <div
                      className="rounded-3xl border border-[#E4EBF3] bg-[#F8FBFE] px-4 py-4"
                      key={vehicle.vehicleId}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-semibold text-[#0C2544]">{vehicle.vehicleNumber}</p>
                          <p className="mt-1 text-[13px] text-[#52677F]">
                            {vehicle.brand} {vehicle.model}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#EEF4FA] px-3 py-1 text-[12px] font-semibold text-[#15558D]">
                          {vehicle.year}
                        </span>
                      </div>
                      <p className="mt-3 text-[12px] uppercase tracking-[0.12em] text-[#6D8197]">
                        Mileage
                      </p>
                      <p className="mt-1 text-[14px] font-medium text-[#0C2544]">
                        {vehicle.mileage.toLocaleString()} km
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      )}
    </main>
  )
}

export default CustomerHomePage
