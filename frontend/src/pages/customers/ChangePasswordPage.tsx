import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { useAuth } from '../../shared/auth/useAuth'
import { apiRequest, getApiErrorMessage } from '../../shared/utils/api'

interface ChangePasswordFormValues {
  confirmPassword: string
  currentPassword: string
  newPassword: string
}

const EMPTY_FORM: ChangePasswordFormValues = {
  confirmPassword: '',
  currentPassword: '',
  newPassword: '',
}

function ChangePasswordPage() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<ChangePasswordFormValues>({
    defaultValues: EMPTY_FORM,
    mode: 'onSubmit',
  })

  const newPasswordValue = watch('newPassword')

  async function handlePasswordSubmit(
    formValues: ChangePasswordFormValues,
  ) {
    setIsSaving(true)

    try {
      const response = await apiRequest<boolean>('/api/account/change-password', {
        body: {
          confirmPassword: formValues.confirmPassword,
          currentPassword: formValues.currentPassword,
          newPassword: formValues.newPassword,
        },
        method: 'PUT',
      })

      if (!response.success) {
        toast.error(getApiErrorMessage(response))
        return
      }

      toast.success(response.message || 'Password changed successfully.')
      reset(EMPTY_FORM)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-370 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="mb-6 rounded-4xl border border-[#DCE5EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_58%,#EEF5FC_100%)] px-6 py-7 shadow-[0_28px_60px_rgba(18,43,74,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">Security</p>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)] sm:text-[34px]">
          Change password
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#52677F]">
          Update your sign-in password securely for the current account.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-4xl border border-[#DCE5EF] bg-white px-6 py-7 shadow-[0_18px_36px_rgba(18,43,74,0.06)]">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EEF4FA] text-[#15558D]">
              <span aria-hidden className="material-symbols-outlined text-[22px]">
                lock_reset
              </span>
            </span>

            <div>
              <h2 className="text-[20px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">
                Password details
              </h2>
              <p className="mt-2 text-[14px] leading-7 text-[#52677F]">
                Enter your current password and choose a new one that you can remember securely.
              </p>
            </div>
          </div>

          <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit(handlePasswordSubmit)}>
            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">
                Current password
              </span>
              <input
                className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                placeholder="Enter current password"
                type="password"
                {...register('currentPassword', {
                  required: 'Current password is required.',
                })}
              />
              {errors.currentPassword ? <p className="text-[13px] text-[#C54141]">{errors.currentPassword.message}</p> : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">
                New password
              </span>
              <input
                className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                placeholder="Enter new password"
                type="password"
                {...register('newPassword', {
                  minLength: {
                    message: 'New password must be at least 6 characters long.',
                    value: 6,
                  },
                  required: 'New password is required.',
                })}
              />
              {errors.newPassword ? <p className="text-[13px] text-[#C54141]">{errors.newPassword.message}</p> : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">
                Confirm password
              </span>
              <input
                className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                placeholder="Re-enter new password"
                type="password"
                {...register('confirmPassword', {
                  required: 'Confirm password is required.',
                  validate: (value) => value === newPasswordValue || 'New password and confirm password must match.',
                })}
              />
              {errors.confirmPassword ? <p className="text-[13px] text-[#C54141]">{errors.confirmPassword.message}</p> : null}
            </label>

            <button
              className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-full bg-[#15558D] px-6 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(21,85,141,0.25)] transition hover:-translate-y-0.5 hover:bg-[#0B4376] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? (
                <>
                  <span aria-hidden className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  Updating...
                </>
              ) : (
                <>
                  <span aria-hidden className="material-symbols-outlined text-[18px]">
                    key
                  </span>
                  Update password
                </>
              )}
            </button>
          </form>
        </section>

        <aside className="rounded-4xl border border-[#DCE5EF] bg-white px-6 py-7 shadow-[0_18px_36px_rgba(18,43,74,0.06)]">
          <h2 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">
            Account overview
          </h2>

          <dl className="mt-5 flex flex-col gap-4 text-[14px] text-[#102B49]">
            <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F8] pb-3">
              <dt className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6D8197]">Account</dt>
              <dd className="text-right font-medium text-[#0C2544]">{user?.fullName || 'Current user'}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F8] pb-3">
              <dt className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6D8197]">Email</dt>
              <dd className="break-all text-right font-medium text-[#0C2544]">{user?.email || '—'}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6D8197]">Roles</dt>
              <dd className="text-right font-medium text-[#0C2544]">{user?.roles.join(', ') || '—'}</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-3xl bg-[#F7FBFE] px-4 py-5 text-[13px] leading-6 text-[#52677F]">
            Use a strong password you do not reuse on other accounts. After it is changed, you can continue using the same login email.
          </div>
        </aside>
      </div>
    </main>
  )
}

export default ChangePasswordPage
