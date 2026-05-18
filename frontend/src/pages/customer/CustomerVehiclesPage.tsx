import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import type {
  CustomerVehicle,
  CustomerVehicleInput,
} from '../../shared/interfaces/customer.interface'
import { apiRequest, getApiErrorMessage } from '../../shared/utils/api'

interface VehicleFormState {
  brand: string
  mileage: string
  model: string
  vehicleNumber: string
  year: string
}

const EMPTY_FORM: VehicleFormState = {
  brand: '',
  mileage: '',
  model: '',
  vehicleNumber: '',
  year: String(new Date().getFullYear()),
}

function toFormState(vehicle: CustomerVehicle): VehicleFormState {
  return {
    brand: vehicle.brand,
    mileage: String(vehicle.mileage),
    model: vehicle.model,
    vehicleNumber: vehicle.vehicleNumber,
    year: String(vehicle.year),
  }
}

function parseFormState(formState: VehicleFormState): CustomerVehicleInput | null {
  const year = Number.parseInt(formState.year, 10)
  const mileage = Number.parseInt(formState.mileage || '0', 10)

  if (!formState.vehicleNumber.trim() || !formState.brand.trim() || !formState.model.trim()) {
    return null
  }

  if (!Number.isFinite(year) || year < 1900 || year > 2100) {
    return null
  }

  if (!Number.isFinite(mileage) || mileage < 0) {
    return null
  }

  return {
    brand: formState.brand.trim(),
    mileage,
    model: formState.model.trim(),
    vehicleNumber: formState.vehicleNumber.trim(),
    year,
  }
}

function CustomerVehiclesPage() {
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [formState, setFormState] = useState<VehicleFormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<null | number>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<null | number>(null)

  async function fetchVehicles() {
    setIsLoading(true)
    const response = await apiRequest<CustomerVehicle[]>('/api/customers/me/vehicles')

    if (response.success && response.data) {
      setVehicles(response.data)
      setErrorMessage(null)
    } else {
      setErrorMessage(getApiErrorMessage(response))
    }

    setIsLoading(false)
  }

  useEffect(() => {
    void fetchVehicles()
  }, [])

  function resetForm() {
    setFormState(EMPTY_FORM)
    setEditingId(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = parseFormState(formState)

    if (!payload) {
      toast.error('Please fill out all required vehicle fields.')
      return
    }

    setIsSaving(true)

    try {
      const isEditing = editingId !== null
      const response = isEditing
        ? await apiRequest<CustomerVehicle>(`/api/customers/me/vehicles/${editingId}`, {
            body: payload,
            method: 'PUT',
          })
        : await apiRequest<CustomerVehicle>('/api/customers/me/vehicles', {
            body: payload,
            method: 'POST',
          })

      if (!response.success || !response.data) {
        toast.error(getApiErrorMessage(response))
        return
      }

      toast.success(isEditing ? 'Vehicle updated successfully.' : 'Vehicle added successfully.')
      resetForm()
      await fetchVehicles()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(vehicle: CustomerVehicle) {
    if (!window.confirm(`Remove vehicle ${vehicle.vehicleNumber}?`)) {
      return
    }

    setDeletingId(vehicle.vehicleId)

    try {
      const response = await apiRequest<number>(
        `/api/customers/me/vehicles/${vehicle.vehicleId}`,
        { method: 'DELETE' },
      )

      if (!response.success) {
        toast.error(getApiErrorMessage(response))
        return
      }

      toast.success('Vehicle removed.')

      if (editingId === vehicle.vehicleId) {
        resetForm()
      }

      await fetchVehicles()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="mx-auto w-full max-w-370 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="mb-6 rounded-4xl border border-[#DCE5EF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F6FAFD_58%,#EEF5FC_100%)] px-6 py-7 shadow-[0_28px_60px_rgba(18,43,74,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D8197]">Garage</p>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight text-[#0C2544] [font-family:var(--font-display)] sm:text-[34px]">
          My vehicles
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#52677F]">
          Add the vehicles you own so we can track services and parts accurately for each one.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-4xl border border-[#DCE5EF] bg-white px-6 py-7 shadow-[0_18px_36px_rgba(18,43,74,0.06)]">
          <h2 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">
            {editingId === null ? 'Add a vehicle' : 'Edit vehicle'}
          </h2>

          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Vehicle number</span>
              <input
                className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium uppercase tracking-wider text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                maxLength={50}
                onChange={(event) => setFormState((current) => ({ ...current, vehicleNumber: event.target.value }))}
                placeholder="BA 2 CHA 1234"
                required
                value={formState.vehicleNumber}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Brand</span>
              <input
                className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                maxLength={100}
                onChange={(event) => setFormState((current) => ({ ...current, brand: event.target.value }))}
                placeholder="Toyota"
                required
                value={formState.brand}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Model</span>
              <input
                className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                maxLength={100}
                onChange={(event) => setFormState((current) => ({ ...current, model: event.target.value }))}
                placeholder="Corolla"
                required
                value={formState.model}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Year</span>
              <input
                className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                max={2100}
                min={1900}
                onChange={(event) => setFormState((current) => ({ ...current, year: event.target.value }))}
                required
                type="number"
                value={formState.year}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#52677F]">Mileage (km)</span>
              <input
                className="h-12 rounded-2xl border border-[#D7E2ED] bg-[#F8FBFE] px-4 text-[14px] font-medium text-[#0C2544] outline-none transition focus:border-[#15558D] focus:bg-white"
                min={0}
                onChange={(event) => setFormState((current) => ({ ...current, mileage: event.target.value }))}
                placeholder="0"
                type="number"
                value={formState.mileage}
              />
            </label>

            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#15558D] px-6 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(21,85,141,0.25)] transition hover:-translate-y-0.5 hover:bg-[#0B4376] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSaving}
                type="submit"
              >
                <span aria-hidden className="material-symbols-outlined text-[18px]">
                  {editingId === null ? 'add' : 'save'}
                </span>
                {editingId === null ? 'Add vehicle' : 'Save changes'}
              </button>
              {editingId !== null ? (
                <button
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-5 text-[14px] font-semibold text-[#2E4C70] transition hover:bg-[#F7FBFE]"
                  onClick={resetForm}
                  type="button"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-4xl border border-[#DCE5EF] bg-white px-6 py-7 shadow-[0_18px_36px_rgba(18,43,74,0.06)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-[18px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">Saved vehicles</h2>
            <span className="rounded-full bg-[#EEF4FA] px-3 py-1 text-[12px] font-semibold text-[#15558D]">
              {vehicles.length} total
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 text-[14px] text-[#52677F]">
              <span aria-hidden className="material-symbols-outlined animate-spin text-[#15558D]">
                progress_activity
              </span>
              Loading vehicles...
            </div>
          ) : errorMessage ? (
            <p className="text-[14px] text-[#A94E48]">{errorMessage}</p>
          ) : vehicles.length === 0 ? (
            <p className="rounded-2xl bg-[#F7FBFE] px-4 py-6 text-center text-[14px] text-[#52677F]">
              You haven&apos;t added any vehicles yet. Use the form to add your first vehicle.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {vehicles.map((vehicle) => (
                <li
                  className="flex flex-col gap-3 rounded-3xl border border-[#E4EBF3] bg-[#F8FBFE] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  key={vehicle.vehicleId}
                >
                  <div>
                    <p className="text-[15px] font-semibold text-[#0C2544]">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-[13px] text-[#52677F]">
                      <span className="font-semibold uppercase tracking-wider text-[#15558D]">
                        {vehicle.vehicleNumber}
                      </span>{' '}
                      &middot; {vehicle.year} &middot; {vehicle.mileage.toLocaleString()} km
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#2E4C70] transition hover:bg-[#F7FBFE]"
                      onClick={() => {
                        setFormState(toFormState(vehicle))
                        setEditingId(vehicle.vehicleId)
                      }}
                      type="button"
                    >
                      <span aria-hidden className="material-symbols-outlined text-[18px]">
                        edit
                      </span>
                      Edit
                    </button>
                    <button
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-[#F1D6D2] bg-white px-4 text-[13px] font-semibold text-[#A94E48] transition hover:bg-[#FBF1EF] disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={deletingId === vehicle.vehicleId}
                      onClick={() => handleDelete(vehicle)}
                      type="button"
                    >
                      <span aria-hidden className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default CustomerVehiclesPage
