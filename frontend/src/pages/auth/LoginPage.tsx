import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { useAuth } from '../../shared/auth/useAuth'
import type { AuthResponse } from '../../shared/interfaces/customer.interface'
import { apiRequest, getApiErrorMessage } from '../../shared/utils/api'

interface LocationState {
  from?: string
}

function resolveRedirectPath(roles: string[], from?: string): string {
  if (from && from !== '/login' && from !== '/register') {
    return from
  }

  if (roles.includes('Customer')) {
    return '/customer/profile'
  }

  if (roles.includes('Staff') || roles.includes('Admin')) {
    return '/parts'
  }

  return '/'
}

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || !password) {
      toast.error('Please enter both email and password.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await apiRequest<AuthResponse>('/api/auth/login', {
        body: { email: email.trim(), password },
        method: 'POST',
        skipAuth: true,
      })

      if (!response.success || !response.data) {
        toast.error(getApiErrorMessage(response))
        return
      }

      login(response.data)
      toast.success('Welcome back!')
      navigate(resolveRedirectPath(response.data.user.roles, state?.from), {
        replace: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#F4F8FC_0%,#EEF4FA_46%,#F8FBFE_100%)] px-4 py-10 text-[#102B49]">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-stretch">
        <section className="hidden flex-col justify-between rounded-4xl bg-[linear-gradient(135deg,#0C2544_0%,#15558D_55%,#1F77C7_100%)] px-9 py-10 text-white shadow-[0_28px_60px_rgba(18,43,74,0.18)] lg:flex">
          <div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <span aria-hidden className="material-symbols-outlined text-[26px]">
                directions_car
              </span>
            </span>
            <h1 className="mt-8 text-[34px] font-semibold leading-tight [font-family:var(--font-display)]">
              AutoCare Inventory &amp; Service
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-white/85">
              Manage parts, sales, and customer history from a single workspace. Sign in to continue where you left off.
            </p>
          </div>

          <ul className="mt-12 flex flex-col gap-3 text-[14px] text-white/85">
            <li className="flex items-center gap-3">
              <span aria-hidden className="material-symbols-outlined text-white text-[20px]">
                check_circle
              </span>
              Track customer purchases &amp; service records.
            </li>
            <li className="flex items-center gap-3">
              <span aria-hidden className="material-symbols-outlined text-white text-[20px]">
                check_circle
              </span>
              Generate reports for top spenders &amp; pending credits.
            </li>
            <li className="flex items-center gap-3">
              <span aria-hidden className="material-symbols-outlined text-white text-[20px]">
                check_circle
              </span>
              Self-serve vehicle profiles for customers.
            </li>
          </ul>
        </section>

        <section className="rounded-4xl border border-[#DCE5EF] bg-white px-6 py-9 shadow-[0_28px_60px_rgba(18,43,74,0.08)] sm:px-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">Welcome back</p>
          <h2 className="mt-2 text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)]">
            Sign in to your account
          </h2>
          <p className="mt-2 text-[14px] text-[#52677F]">
            Don&apos;t have an account?{' '}
            <Link className="font-semibold text-[#15558D] no-underline hover:underline" to="/register">
              Create one
            </Link>
          </p>

          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Email address</span>
              <input
                autoComplete="email"
                className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Password</span>
              <input
                autoComplete="current-password"
                className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type="password"
                value={password}
              />
            </label>

            <button
              className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#15558D] text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(21,85,141,0.25)] transition hover:-translate-y-0.5 hover:bg-[#0B4376] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <span aria-hidden className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  Signing in...
                </>
              ) : (
                <>
                  <span aria-hidden className="material-symbols-outlined text-[18px]">
                    login
                  </span>
                  Sign in
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
