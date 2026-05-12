import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  User,
  Car,
  ClipboardList,
} from 'lucide-react'

function CustomerDetailsPage() {
  const { id } = useParams()

  const [customer, setCustomer] = useState<any>(null)

  useEffect(() => {
    void fetchCustomer()
  }, [])

  const fetchCustomer = async () => {
    try {
      const response = await fetch(
        `http://localhost:5220/api/Customers/${id}`,
      )

      const data = await response.json()

      setCustomer(data)
    } catch (error) {
      console.log(error)
    }
  }

  if (!customer) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F8FB]">
        <div className="rounded-[30px] border border-[#DCE5EF] bg-white px-10 py-8 shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
          <h2 className="text-[28px] font-semibold text-[#17324F]">
            Loading customer details...
          </h2>
        </div>
      </main>
    )
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

        <div className="mt-8 rounded-[32px] border border-[#DCE5EF] bg-white px-10 py-10 shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-[64px] font-semibold tracking-[-0.03em] text-[#0F2744] [font-family:var(--font-display)]">
                Customer Details
              </h1>

              <p className="mt-5 max-w-4xl text-[18px] leading-9 text-[#5B7189]">
                View customer details, registered
                vehicles, and customer history.
              </p>
            </div>

            <div className="rounded-[28px] bg-[#EDF4FB] px-8 py-6">
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#5A7A99]">
                Customer ID
              </p>

              <p className="mt-3 text-[18px] font-semibold text-[#17324F]">
                {customer.id}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr]">
          <section className="rounded-[32px] border border-[#DCE5EF] bg-white p-8 shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EDF4FB] text-[#174B7A]">
                <User size={28} />
              </div>

              <div>
                <h2 className="text-[38px] font-semibold tracking-[-0.03em] text-[#17324F]">
                  Customer Information
                </h2>

                <p className="mt-2 text-[16px] text-[#6A8198]">
                  Personal and contact information of the
                  customer.
                </p>
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <div className="rounded-[24px] border border-[#E3ECF5] bg-[#FBFDFF] p-6">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                  Full Name
                </p>

                <h3 className="mt-3 text-[26px] font-semibold text-[#17324F]">
                  {customer.fullName}
                </h3>
              </div>

              <div className="rounded-[24px] border border-[#E3ECF5] bg-[#FBFDFF] p-6">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                  Email Address
                </p>

                <h3 className="mt-3 text-[20px] font-medium text-[#17324F]">
                  {customer.email}
                </h3>
              </div>

              <div className="rounded-[24px] border border-[#E3ECF5] bg-[#FBFDFF] p-6">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                  Phone Number
                </p>

                <h3 className="mt-3 text-[20px] font-medium text-[#17324F]">
                  {customer.phoneNumber}
                </h3>
              </div>

              <div className="rounded-[24px] border border-[#E3ECF5] bg-[#FBFDFF] p-6">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                  Address
                </p>

                <h3 className="mt-3 text-[20px] font-medium text-[#17324F]">
                  {customer.address || 'No address provided'}
                </h3>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-[#DCE5EF] bg-white p-8 shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EDF4FB] text-[#174B7A]">
                <Car size={28} />
              </div>

              <div>
                <h2 className="text-[38px] font-semibold tracking-[-0.03em] text-[#17324F]">
                  Vehicle Information
                </h2>

                <p className="mt-2 text-[16px] text-[#6A8198]">
                  Vehicles registered under this customer.
                </p>
              </div>
            </div>

            <div className="mt-10 space-y-6">
              {customer.vehicles.map((vehicle: any, index: number) => (
                <div
                  className="rounded-[28px] border border-[#DCE5EF] bg-[#FBFDFF] p-7"
                  key={vehicle.vehicleId}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-[28px] font-semibold text-[#17324F]">
                      Vehicle {index + 1}
                    </h3>

                    <div className="rounded-full bg-[#EDF4FB] px-4 py-2 text-[14px] font-semibold text-[#15558D]">
                      {vehicle.vehicleNumber}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="rounded-[22px] border border-[#E3ECF5] bg-white p-5">
                      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                        Brand
                      </p>

                      <h4 className="mt-3 text-[22px] font-semibold text-[#17324F]">
                        {vehicle.brand}
                      </h4>
                    </div>

                    <div className="rounded-[22px] border border-[#E3ECF5] bg-white p-5">
                      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                        Model
                      </p>

                      <h4 className="mt-3 text-[22px] font-semibold text-[#17324F]">
                        {vehicle.model}
                      </h4>
                    </div>

                    <div className="rounded-[22px] border border-[#E3ECF5] bg-white p-5">
                      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                        Manufactured Year
                      </p>

                      <h4 className="mt-3 text-[22px] font-semibold text-[#17324F]">
                        {vehicle.year}
                      </h4>
                    </div>

                    <div className="rounded-[22px] border border-[#E3ECF5] bg-white p-5">
                      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                        Mileage
                      </p>

                      <h4 className="mt-3 text-[22px] font-semibold text-[#17324F]">
                        {vehicle.mileage} km
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[32px] border border-[#DCE5EF] bg-white p-8 shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EDF4FB] text-[#174B7A]">
              <ClipboardList size={28} />
            </div>

            <div>
              <h2 className="text-[38px] font-semibold tracking-[-0.03em] text-[#17324F]">
                Customer History
              </h2>

              <p className="mt-2 text-[16px] text-[#6A8198]">
                Service history and activity records for this
                customer.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-[28px] border border-dashed border-[#D4E0EC] bg-[#FBFDFF] px-8 py-16 text-center">
            <h3 className="text-[30px] font-semibold text-[#17324F]">
              No service history available
            </h3>

            <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-8 text-[#6A8198]">
              This customer does not have any service or
              maintenance history recorded yet.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default CustomerDetailsPage