import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { useAuth } from '../../shared/auth/useAuth'
import type { CustomerProfile } from '../../shared/interfaces/customer.interface'
import { apiRequest, getApiErrorMessage } from '../../shared/utils/api'

interface ProfileFormState {
  address: string
  fullName: string
  phoneNumber: string
}

function CustomerProfilePage() {
  const { refreshCurrentUser } = useAuth()
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [formState, setFormState] = useState<ProfileFormState>({
    address: '',
    fullName: '',
    phoneNumber: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)

  useEffect(() => {
    let isCancelled = false

    const fetchProfile = async () => {
      setIsLoading(true)
      const response = await apiRequest<CustomerProfile>('/api/customers/me')

      if (isCancelled) {
        return
      }

      if (response.success && response.data) {
        setProfile(response.data)
        setFormState({
          address: response.data.address ?? '',
          fullName: response.data.fullName,
          phoneNumber: response.data.phoneNumber ?? '',
        })
        setErrorMessage(null)
      } else {
        setErrorMessage(getApiErrorMessage(response))
      }

      setIsLoading(false)
    }

    void fetchProfile()

    return () => {
      isCancelled = true
    }
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)

    try {
      const response = await apiRequest<CustomerProfile>('/api/customers/me', {
        body: {
          address: formState.address.trim() || null,
          fullName: formState.fullName.trim(),
          phoneNumber: formState.phoneNumber.trim() || null,
        },
        method: 'PUT',
      })

      if (!response.success || !response.data) {
        toast.error(getApiErrorMessage(response))
        return
      }

      setProfile(response.data)
      toast.success('Profile updated successfully.')
      void refreshCurrentUser()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-370 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="mb-6 rounded-4xl border border-[#DCE5EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_58%,#EEF5FC_100%)] px-6 py-7 shadow-[0_28px_60px_rgba(18,43,74,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">My account</p>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)] sm:text-[34px]">
          Profile &amp; account details
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#52677F]">
          Keep your contact information up to date so we can reach you quickly when your service or order is ready.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-4xl border border-[#DCE5EF] bg-white px-6 py-7 shadow-[0_18px_36px_rgba(18,43,74,0.06)]">
          <h2 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Edit details</h2>

          {isLoading ? (
            <div className="mt-6 flex items-center gap-3 text-[14px] text-[#52677F]">
              <span aria-hidden className="material-symbols-outlined animate-spin text-[#15558D]">
                progress_activity
              </span>
              Loading your profile...
            </div>
          ) : errorMessage ? (
            <p className="mt-6 text-[14px] text-[#A94E48]">{errorMessage}</p>
          ) : (
            <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Full name</span>
                <input
                  className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                  maxLength={100}
                  onChange={(event) => setFormState((current) => ({ ...current, fullName: event.target.value }))}
                  required
                  value={formState.fullName}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Phone number</span>
                <input
                  className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                  maxLength={30}
                  onChange={(event) => setFormState((current) => ({ ...current, phoneNumber: event.target.value }))}
                  placeholder="Optional"
                  type="tel"
                  value={formState.phoneNumber}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Address</span>
                <textarea
                  className="min-h-[110px] rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 py-3 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                  maxLength={250}
                  onChange={(event) => setFormState((current) => ({ ...current, address: event.target.value }))}
                  placeholder="Street, City (optional)"
                  value={formState.address}
                />
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
                    Saving...
                  </>
                ) : (
                  <>
                    <span aria-hidden className="material-symbols-outlined text-[18px]">
                      save
                    </span>
                    Save changes
                  </>
                )}
              </button>
            </form>
          )}
        </section>

        <aside className="flex flex-col gap-4 rounded-4xl border border-[#DCE5EF] bg-white px-6 py-7 shadow-[0_18px_36px_rgba(18,43,74,0.06)]">
          <h2 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Account summary</h2>

          {profile ? (
            <dl className="flex flex-col gap-4 text-[14px] text-[#102B49]">
              <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F8] pb-3">
                <dt className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6D8197]">Email</dt>
                <dd className="font-medium text-[#0C2544]">{profile.email}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F8] pb-3">
                <dt className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6D8197]">Customer ID</dt>
                <dd className="break-all text-right font-medium text-[#0C2544]">{profile.customerId}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F8] pb-3">
                <dt className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6D8197]">Member since</dt>
                <dd className="font-medium text-[#0C2544]">
                  {new Date(profile.createdAt).toLocaleDateString(undefined, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6D8197]">Last updated</dt>
                <dd className="font-medium text-[#0C2544]">
                  {profile.updatedAt
                    ? new Date(profile.updatedAt).toLocaleDateString(undefined, {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Never'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-[14px] text-[#52677F]">Profile information will appear once it loads.</p>
          )}
        </aside>
      </div>
    </main>
  )
}

export default CustomerProfilePage
