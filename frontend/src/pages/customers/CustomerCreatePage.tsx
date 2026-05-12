import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { User, Car } from 'lucide-react'
import backendUrl from '../../config'

function CustomerCreatePage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    vehicles: [
      {
        vehicleNumber: '',
        brand: '',
        model: '',
        year: 0,
        mileage: 0,
      },
    ],
  })

  const handleCustomerChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleVehicleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const updatedVehicles = [...formData.vehicles]

    updatedVehicles[index] = {
      ...updatedVehicles[index],
      [e.target.name]:
        e.target.name === 'year' ||
        e.target.name === 'mileage'
          ? Number(e.target.value)
          : e.target.value,
    }

    setFormData({
      ...formData,
      vehicles: updatedVehicles,
    })
  }

  const addVehicle = () => {
    setFormData({
      ...formData,
      vehicles: [
        ...formData.vehicles,
        {
          vehicleNumber: '',
          brand: '',
          model: '',
          year: 0,
          mileage: 0,
        },
      ],
    })
  }

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault()

    try {
      const response = await fetch(
        `${backendUrl}/api/Customers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        },
      )

      if (!response.ok) {
        toast.error('Failed to register customer.')
        return
      }

      await response.json()

      toast.success('Customer registered successfully.')

      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        address: '',
        vehicles: [
          {
            vehicleNumber: '',
            brand: '',
            model: '',
            year: 0,
            mileage: 0,
          },
        ],
      })
    } catch {
      toast.error('Something went wrong.')
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F8FB] px-7 py-8 text-[#17324F]">
      <div className="mx-auto max-w-7xl">
        <Link
          className="inline-flex items-center gap-2 text-[15px] font-medium text-[#4E6B8B] no-underline transition hover:text-[#17324F]"
          to="/customers/search"
        >
          ← Back to Customer Search
        </Link>

        <div className="mt-8 border-b border-[#DCE5EF] pb-10">
          <h1 className="text-[64px] font-semibold tracking-[-0.03em] text-[#0F2744] [font-family:var(--font-display)]">
            Register Customer
          </h1>

          <p className="mt-5 max-w-4xl text-[18px] leading-9 text-[#5B7189]">
            Register customer details and attach one or more
            vehicles to the customer account.
          </p>
        </div>

        <form
          className="mt-10 space-y-8"
          onSubmit={handleSubmit}
        >
          <section className="rounded-[32px] border border-[#DCE5EF] bg-white p-8 shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EDF4FB] text-[#174B7A]">
                <User size={28} />
              </div>

              <div>
                <h2 className="text-[40px] font-semibold tracking-[-0.03em] text-[#17324F]">
                  Customer Information
                </h2>

                <p className="mt-2 text-[16px] text-[#6A8198]">
                  These details will be used for customer
                  records and vehicle ownership.
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-3 block text-[16px] font-semibold text-[#17324F]">
                  Full Name *
                </label>

                <input
                  className="h-16 w-full rounded-[20px] border border-[#D4E0EC] bg-white px-5 text-[16px] text-[#17324F] outline-none transition focus:border-[#15558D]"
                  name="fullName"
                  onChange={handleCustomerChange}
                  placeholder="Enter customer full name"
                  type="text"
                  value={formData.fullName}
                />
              </div>

              <div>
                <label className="mb-3 block text-[16px] font-semibold text-[#17324F]">
                  Phone Number *
                </label>

                <input
                  className="h-16 w-full rounded-[20px] border border-[#D4E0EC] bg-white px-5 text-[16px] text-[#17324F] outline-none transition focus:border-[#15558D]"
                  name="phoneNumber"
                  onChange={handleCustomerChange}
                  placeholder="Enter customer phone number"
                  type="text"
                  value={formData.phoneNumber}
                />
              </div>

              <div>
                <label className="mb-3 block text-[16px] font-semibold text-[#17324F]">
                  Email Address *
                </label>

                <input
                  className="h-16 w-full rounded-[20px] border border-[#D4E0EC] bg-white px-5 text-[16px] text-[#17324F] outline-none transition focus:border-[#15558D]"
                  name="email"
                  onChange={handleCustomerChange}
                  placeholder="Enter customer email address"
                  type="email"
                  value={formData.email}
                />
              </div>

              <div>
                <label className="mb-3 block text-[16px] font-semibold text-[#17324F]">
                  Address
                </label>

                <input
                  className="h-16 w-full rounded-[20px] border border-[#D4E0EC] bg-white px-5 text-[16px] text-[#17324F] outline-none transition focus:border-[#15558D]"
                  name="address"
                  onChange={handleCustomerChange}
                  placeholder="Enter customer address"
                  type="text"
                  value={formData.address}
                />
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-[#DCE5EF] bg-white p-8 shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EDF4FB] text-[#174B7A]">
                  <Car size={28} />
                </div>

                <div>
                  <h2 className="text-[40px] font-semibold tracking-[-0.03em] text-[#17324F]">
                    Vehicle Information
                  </h2>

                  <p className="mt-2 text-[16px] text-[#6A8198]">
                    Add one or more vehicles belonging to this
                    customer.
                  </p>
                </div>
              </div>

              <button
                className="inline-flex h-14 items-center justify-center rounded-full border border-[#CFE0EF] bg-white px-6 text-[15px] font-semibold text-[#17324F] transition hover:bg-[#F4F8FC]"
                onClick={addVehicle}
                type="button"
              >
                + Add Vehicle
              </button>
            </div>

            <div className="mt-8 space-y-6">
              {formData.vehicles.map((vehicle, index) => (
                <div
                  className="rounded-[28px] border border-[#DCE5EF] bg-[#FBFDFF] p-7"
                  key={index}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-[28px] font-semibold text-[#17324F]">
                      Vehicle {index + 1}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-3 block text-[15px] font-semibold text-[#17324F]">
                        Vehicle Number *
                      </label>

                      <input
                        className="h-16 w-full rounded-[20px] border border-[#D4E0EC] bg-white px-5 text-[16px] outline-none transition focus:border-[#15558D]"
                        name="vehicleNumber"
                        onChange={(e) =>
                          handleVehicleChange(index, e)
                        }
                        placeholder="Enter vehicle number"
                        type="text"
                        value={vehicle.vehicleNumber}
                      />
                    </div>

                    <div>
                      <label className="mb-3 block text-[15px] font-semibold text-[#17324F]">
                        Vehicle Brand *
                      </label>

                      <input
                        className="h-16 w-full rounded-[20px] border border-[#D4E0EC] bg-white px-5 text-[16px] outline-none transition focus:border-[#15558D]"
                        name="brand"
                        onChange={(e) =>
                          handleVehicleChange(index, e)
                        }
                        placeholder="Enter vehicle brand"
                        type="text"
                        value={vehicle.brand}
                      />
                    </div>

                    <div>
                      <label className="mb-3 block text-[15px] font-semibold text-[#17324F]">
                        Vehicle Model *
                      </label>

                      <input
                        className="h-16 w-full rounded-[20px] border border-[#D4E0EC] bg-white px-5 text-[16px] outline-none transition focus:border-[#15558D]"
                        name="model"
                        onChange={(e) =>
                          handleVehicleChange(index, e)
                        }
                        placeholder="Enter vehicle model"
                        type="text"
                        value={vehicle.model}
                      />
                    </div>

                    <div>
                      <label className="mb-3 block text-[15px] font-semibold text-[#17324F]">
                        Manufactured Year *
                      </label>

                      <input
                        className="h-16 w-full rounded-[20px] border border-[#D4E0EC] bg-white px-5 text-[16px] outline-none transition focus:border-[#15558D]"
                        name="year"
                        onChange={(e) =>
                          handleVehicleChange(index, e)
                        }
                        placeholder="Enter manufactured year"
                        type="number"
                        value={vehicle.year || ''}
                      />
                    </div>

                    <div>
                      <label className="mb-3 block text-[15px] font-semibold text-[#17324F]">
                        Mileage *
                      </label>

                      <input
                        className="h-16 w-full rounded-[20px] border border-[#D4E0EC] bg-white px-5 text-[16px] outline-none transition focus:border-[#15558D]"
                        name="mileage"
                        onChange={(e) =>
                          handleVehicleChange(index, e)
                        }
                        placeholder="Enter vehicle mileage"
                        type="number"
                        value={vehicle.mileage || ''}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <button
              className="inline-flex h-16 items-center justify-center rounded-full bg-[#15558D] px-10 text-[16px] font-semibold text-white shadow-[0_18px_36px_rgba(21,85,141,0.22)] transition hover:bg-[#0E4778]"
              type="submit"
            >
              Register Customer
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default CustomerCreatePage