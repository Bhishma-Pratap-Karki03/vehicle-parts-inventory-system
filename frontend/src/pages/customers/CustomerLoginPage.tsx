import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { useAuth } from '../../shared/auth/useAuth'
import type { AuthResponse } from '../../shared/interfaces/customer.interface'
import { apiRequest, getApiErrorMessage } from '../../shared/utils/api'

function CustomerLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      const result = await apiRequest<AuthResponse>('/api/auth/login', {
        body: formData,
        method: 'POST',
        skipAuth: true,
      })

      if (!result.success || !result.data) {
        toast.error(getApiErrorMessage(result))
        return
      }

      login(result.data)
      toast.success('Login successful.')
      navigate('/home', { replace: true })
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F8FB] px-7 py-8 text-[#17324F]">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-4xl border border-[#DCE5EF] bg-white p-10 shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
          <h1 className="text-[52px] font-semibold tracking-[-0.03em] text-[#17324F]">
            Customer Login
          </h1>

          <p className="mt-4 text-[17px] leading-8 text-[#5B7189]">
            Login using your registered email and password.
          </p>

          <form
            className="mt-10 space-y-6"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="mb-3 block text-[15px] font-semibold text-[#17324F]">
                Email Address
              </label>

              <input
                className="h-16 w-full rounded-[20px] border border-[#D4E0EC] bg-white px-5 text-[16px] outline-none transition focus:border-[#15558D]"
                name="email"
                onChange={handleChange}
                placeholder="Enter your email"
                type="email"
                value={formData.email}
              />
            </div>

            <div>
              <label className="mb-3 block text-[15px] font-semibold text-[#17324F]">
                Password
              </label>

              <input
                className="h-16 w-full rounded-[20px] border border-[#D4E0EC] bg-white px-5 text-[16px] outline-none transition focus:border-[#15558D]"
                name="password"
                onChange={handleChange}
                placeholder="Enter your password"
                type="password"
                value={formData.password}
              />
            </div>

            <button
              className="inline-flex h-16 w-full items-center justify-center rounded-full bg-[#15558D] px-10 text-[16px] font-semibold text-white shadow-[0_18px_36px_rgba(21,85,141,0.22)] transition hover:bg-[#0E4778] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default CustomerLoginPage
