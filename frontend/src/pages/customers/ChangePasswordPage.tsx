import { useState } from 'react'
import { toast } from 'react-toastify'
import backendUrl from '../../config'

function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
  })

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

    const email =
      localStorage.getItem('customerEmail')

    if (!email) {
      toast.error('Please login first.')

      return
    }

    try {
      const response = await fetch(
        `${backendUrl}/api/Auth/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            currentPassword:
              formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        },
      )

      const result = await response.json()

      if (!result.success) {
        toast.error(
          result.message ||
            'Password change failed.',
        )

        return
      }

      toast.success(
        'Password changed successfully.',
      )

      setFormData({
        currentPassword: '',
        newPassword: '',
      })
    } catch {
      toast.error('Something went wrong.')
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F8FB] px-7 py-8 text-[#17324F]">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[32px] border border-[#DCE5EF] bg-white p-10 shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
          <h1 className="text-[52px] font-semibold tracking-[-0.03em] text-[#17324F]">
            Change Password
          </h1>

          <p className="mt-4 text-[17px] leading-8 text-[#5B7189]">
            Update your account password securely.
          </p>

          <form
            className="mt-10 space-y-6"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="mb-3 block text-[15px] font-semibold text-[#17324F]">
                Current Password
              </label>

              <input
                className="h-16 w-full rounded-[20px] border border-[#D4E0EC] bg-white px-5 text-[16px] outline-none transition focus:border-[#15558D]"
                name="currentPassword"
                onChange={handleChange}
                placeholder="Enter current password"
                type="password"
                value={formData.currentPassword}
              />
            </div>

            <div>
              <label className="mb-3 block text-[15px] font-semibold text-[#17324F]">
                New Password
              </label>

              <input
                className="h-16 w-full rounded-[20px] border border-[#D4E0EC] bg-white px-5 text-[16px] outline-none transition focus:border-[#15558D]"
                name="newPassword"
                onChange={handleChange}
                placeholder="Enter new password"
                type="password"
                value={formData.newPassword}
              />
            </div>

            <button
              className="inline-flex h-16 w-full items-center justify-center rounded-full bg-[#15558D] px-10 text-[16px] font-semibold text-white shadow-[0_18px_36px_rgba(21,85,141,0.22)] transition hover:bg-[#0E4778]"
              type="submit"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default ChangePasswordPage