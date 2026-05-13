import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { useAuth } from '../../shared/auth/useAuth'
import type { AuthResponse } from '../../shared/interfaces/customer.interface'
import { apiRequest, getApiErrorMessage } from '../../shared/utils/api'

interface RegisterFormState {
  address: string
  confirmPassword: string
  email: string
  fullName: string
  password: string
  phoneNumber: string
}

const INITIAL_STATE: RegisterFormState = {
  address: '',
  confirmPassword: '',
  email: '',
  fullName: '',
  password: '',
  phoneNumber: '',
}

function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formState, setFormState] = useState<RegisterFormState>(INITIAL_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<TKey extends keyof RegisterFormState>(
    field: TKey,
    value: RegisterFormState[TKey],
  ) {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!formState.fullName.trim()) {
      toast.error('Please enter your full name.')
      return
    }

    if (formState.password !== formState.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await apiRequest<AuthResponse>('/api/auth/register-customer', {
        body: {
          address: formState.address.trim() || null,
          email: formState.email.trim(),
          fullName: formState.fullName.trim(),
          password: formState.password,
          phoneNumber: formState.phoneNumber.trim() || null,
        },
        method: 'POST',
        skipAuth: true,
      })

      if (!response.success || !response.data) {
        toast.error(getApiErrorMessage(response))
        return
      }

      login(response.data)
      toast.success('Welcome to AutoCare! Your account is ready.')
      navigate('/customer/profile', { replace: true })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#F4F8FC_0%,#EEF4FA_46%,#F8FBFE_100%)] px-4 py-10 text-[#102B49]">
      <section className="w-full max-w-3xl rounded-4xl border border-[#DCE5EF] bg-white px-6 py-9 shadow-[0_28px_60px_rgba(18,43,74,0.08)] sm:px-10">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EEF4FA] text-[#15558D]">
            <span aria-hidden className="material-symbols-outlined text-[24px]">
              person_add
            </span>
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">Customer self-registration</p>
            <h1 className="text-[26px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)]">
              Create your AutoCare account
            </h1>
          </div>
        </div>

        <p className="mt-3 text-[14px] text-[#52677F]">
          Already have an account?{' '}
          <Link className="font-semibold text-[#15558D] no-underline hover:underline" to="/login">
            Sign in
          </Link>
        </p>

        <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Full name</span>
            <input
              autoComplete="name"
              className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
              maxLength={100}
              onChange={(event) => updateField('fullName', event.target.value)}
              placeholder="Your full name"
              required
              value={formState.fullName}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Email</span>
            <input
              autoComplete="email"
              className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={formState.email}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Phone number</span>
            <input
              autoComplete="tel"
              className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
              maxLength={30}
              onChange={(event) => updateField('phoneNumber', event.target.value)}
              placeholder="+977 98XXXXXXXX"
              type="tel"
              value={formState.phoneNumber}
            />
          </label>

          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Address (optional)</span>
            <input
              autoComplete="street-address"
              className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
              maxLength={250}
              onChange={(event) => updateField('address', event.target.value)}
              placeholder="Street, City"
              value={formState.address}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Password</span>
            <input
              autoComplete="new-password"
              className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
              minLength={6}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="At least 6 characters"
              required
              type="password"
              value={formState.password}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Confirm password</span>
            <input
              autoComplete="new-password"
              className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
              minLength={6}
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              placeholder="Repeat your password"
              required
              type="password"
              value={formState.confirmPassword}
            />
          </label>

          <button
            className="sm:col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#15558D] text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(21,85,141,0.25)] transition hover:-translate-y-0.5 hover:bg-[#0B4376] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <span aria-hidden className="material-symbols-outlined animate-spin text-[18px]">
                  progress_activity
                </span>
                Creating account...
              </>
            ) : (
              <>
                <span aria-hidden className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>
                Create my account
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  )
}

export default RegisterPage
