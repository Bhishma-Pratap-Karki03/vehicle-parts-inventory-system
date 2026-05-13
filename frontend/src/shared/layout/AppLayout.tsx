import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import type { UserRole } from '../interfaces/customer.interface'

interface NavItem {
  icon: string
  label: string
  roles?: UserRole[]
  to: string
}

const NAV_ITEMS: NavItem[] = [
  { icon: 'inventory_2', label: 'Parts', roles: ['Admin', 'Staff'], to: '/parts' },
  { icon: 'receipt_long', label: 'Purchase Invoices', roles: ['Admin'], to: '/purchase-invoices' },
  { icon: 'point_of_sale', label: 'Sales Invoices', roles: ['Admin', 'Staff'], to: '/sales-invoices' },
  { icon: 'sync_alt', label: 'Stock Transactions', roles: ['Admin', 'Staff'], to: '/part-transactions' },
  { icon: 'insights', label: 'Customer Reports', roles: ['Admin', 'Staff'], to: '/staff/customer-reports' },
  { icon: 'person', label: 'My Profile', roles: ['Customer'], to: '/customer/profile' },
  { icon: 'directions_car', label: 'My Vehicles', roles: ['Customer'], to: '/customer/vehicles' },
  { icon: 'shopping_bag', label: 'Purchase History', roles: ['Customer'], to: '/customer/purchase-history' },
  { icon: 'build_circle', label: 'Service History', roles: ['Customer'], to: '/customer/service-history' },
]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return '?'
  }

  if (parts.length === 1) {
    return parts[0]!.charAt(0).toUpperCase()
  }

  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
}

function AppLayout() {
  const { hasAnyRole, logout, user } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const visibleNavItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (!item.roles || item.roles.length === 0) {
          return true
        }

        return hasAnyRole(item.roles)
      }),
    [hasAnyRole],
  )

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F4F8FC_0%,#EEF4FA_46%,#F8FBFE_100%)] text-[#102B49]">
      <header className="sticky top-0 z-30 border-b border-[#DCE5EF] bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-370 items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3 no-underline" to="/">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#15558D] text-white shadow-[0_8px_18px_rgba(21,85,141,0.25)]">
              <span aria-hidden className="material-symbols-outlined text-[22px]">
                directions_car
              </span>
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">AutoCare IMS</span>
              <span className="text-[16px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Vehicle Parts &amp; Service</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {visibleNavItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold no-underline transition ${
                    isActive
                      ? 'bg-[#15558D] text-white shadow-[0_10px_22px_rgba(21,85,141,0.22)]'
                      : 'text-[#2E4C70] hover:bg-[#EEF4FA]'
                  }`
                }
                key={item.to}
                to={item.to}
              >
                <span aria-hidden className="material-symbols-outlined text-[18px]">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle menu"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#D7E2ED] bg-white text-[#2E4C70] shadow-[0_8px_18px_rgba(18,43,74,0.08)] lg:hidden"
              onClick={() => setIsMenuOpen((current) => !current)}
              type="button"
            >
              <span aria-hidden className="material-symbols-outlined text-[20px]">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>

            {user ? (
              <div className="hidden items-center gap-3 sm:flex">
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-[13px] font-semibold text-[#0C2544]">{user.fullName}</span>
                  <span className="text-[11px] uppercase tracking-[0.15em] text-[#6D8197]">{user.roles.join(', ')}</span>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#EEF4FA] text-[13px] font-semibold text-[#15558D]">
                  {getInitials(user.fullName)}
                </div>
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#2E4C70] shadow-[0_8px_18px_rgba(18,43,74,0.05)] transition hover:bg-[#F7FBFE]"
                  onClick={handleLogout}
                  type="button"
                >
                  <span aria-hidden className="material-symbols-outlined text-[18px]">
                    logout
                  </span>
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-[#DCE5EF] bg-white px-4 py-3 sm:px-6 lg:hidden">
            <div className="flex flex-col gap-1">
              {visibleNavItems.map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    `inline-flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[14px] font-semibold no-underline transition ${
                      isActive ? 'bg-[#15558D] text-white' : 'text-[#2E4C70] hover:bg-[#EEF4FA]'
                    }`
                  }
                  key={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  to={item.to}
                >
                  <span aria-hidden className="material-symbols-outlined text-[20px]">
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              ))}

              {user ? (
                <button
                  className="mt-1 inline-flex items-center gap-3 rounded-2xl border border-[#D7E2ED] bg-white px-3 py-2.5 text-left text-[14px] font-semibold text-[#2E4C70]"
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleLogout()
                  }}
                  type="button"
                >
                  <span aria-hidden className="material-symbols-outlined text-[20px]">
                    logout
                  </span>
                  Logout
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>

      <Outlet />
    </div>
  )
}

export default AppLayout
