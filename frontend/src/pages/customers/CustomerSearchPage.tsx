import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Phone,
  Car,
} from 'lucide-react'
import { apiRequest, getApiErrorMessage } from '../../shared/utils/api'

function CustomerSearchPage() {
  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [errorMessage, setErrorMessage] = useState('')

  const customersPerPage = 4

  useEffect(() => {
    if (query.trim() !== '') {
      void searchCustomers()
    } else {
      setCustomers([])
      setErrorMessage('')
    }
  }, [query])

  const searchCustomers = async () => {
    try {
      const response = await apiRequest<any[]>(
        `/api/customers/search?query=${encodeURIComponent(
          query.trim(),
        )}`,
      )

      if (!response.success || !response.data) {
        setCustomers([])
        setErrorMessage(getApiErrorMessage(response))
        return
      }

      setCustomers(response.data)
      setErrorMessage('')
      setCurrentPage(1)
    } catch {
      setCustomers([])
      setErrorMessage('Failed to search customers.')
    }
  }

  const totalPages = Math.ceil(
    customers.length / customersPerPage,
  )

  const paginatedCustomers = useMemo(() => {
    const startIndex =
      (currentPage - 1) * customersPerPage

    return customers.slice(
      startIndex,
      startIndex + customersPerPage,
    )
  }, [customers, currentPage])

  return (
    <main className="min-h-screen bg-[#F5F8FB] px-7 py-8 text-[#17324F]">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[32px] border border-[#DCE5EF] bg-white px-10 py-10 shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
          <h1 className="text-[64px] font-semibold tracking-[-0.03em] text-[#0F2744] [font-family:var(--font-display)]">
            Customer Search
          </h1>

          <p className="mt-5 max-w-4xl text-[18px] leading-9 text-[#5B7189]">
            Search customers by customer name, phone
            number, vehicle number, or customer ID.
          </p>
        </div>

        <section className="mt-8 rounded-[32px] border border-[#DCE5EF] bg-white p-8 shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
          <div className="flex items-center gap-4 rounded-[22px] border border-[#D4E0EC] bg-white px-6">
            <Search
              className="text-[#6A8198]"
              size={22}
            />

            <input
              className="h-16 w-full bg-transparent text-[16px] text-[#17324F] outline-none"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customer by name, phone number, vehicle number, or ID..."
              type="text"
              value={query}
            />
          </div>

          {customers.length > 0 && (
            <div className="mt-6">
              <p className="text-[15px] text-[#6A8198]">
                Showing{' '}
                <span className="font-semibold text-[#17324F]">
                  {paginatedCustomers.length}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-[#17324F]">
                  {customers.length}
                </span>{' '}
                customers
              </p>
            </div>
          )}

          <div className="mt-8 space-y-5">
            {errorMessage && query.trim() !== '' && (
              <div className="rounded-[24px] border border-[#F0D2CE] bg-[#FFF8F7] px-6 py-5 text-[15px] font-medium text-[#A94E48]">
                {errorMessage}
              </div>
            )}

            {paginatedCustomers.map((customer) => (
              <div
                className="rounded-[28px] border border-[#DCE5EF] bg-[#FBFDFF] p-7 transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,39,68,0.08)]"
                key={customer.id}
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-[32px] font-semibold tracking-[-0.02em] text-[#17324F]">
                      {customer.fullName}
                    </h2>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 rounded-full bg-[#EEF4FB] px-4 py-2 text-[14px] font-medium text-[#174B7A]">
                        <Phone size={16} />

                        <span>
                          {customer.phoneNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 rounded-full bg-[#F2F7FD] px-4 py-2 text-[14px] font-medium text-[#174B7A]">
                        <Car size={16} />

                        <span>
                          {customer.vehicleNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    className="inline-flex h-14 items-center justify-center rounded-full bg-[#15558D] px-7 text-[15px] font-semibold text-white no-underline shadow-[0_16px_32px_rgba(21,85,141,0.18)] transition hover:bg-[#0E4778]"
                    to={`/customers/${customer.id}`}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {customers.length > 0 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                className="rounded-full border border-[#D4E0EC] bg-white px-5 py-3 text-[14px] font-semibold text-[#17324F] transition hover:bg-[#F4F8FC] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((prev) => prev - 1)
                }
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => (
                  <button
                    className={`h-12 w-12 rounded-full text-[15px] font-semibold transition ${
                      currentPage === index + 1
                        ? 'bg-[#15558D] text-white shadow-[0_12px_24px_rgba(21,85,141,0.2)]'
                        : 'border border-[#D4E0EC] bg-white text-[#17324F] hover:bg-[#F4F8FC]'
                    }`}
                    key={index}
                    onClick={() =>
                      setCurrentPage(index + 1)
                    }
                  >
                    {index + 1}
                  </button>
                ),
              )}

              <button
                className="rounded-full border border-[#D4E0EC] bg-white px-5 py-3 text-[14px] font-semibold text-[#17324F] transition hover:bg-[#F4F8FC] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  currentPage === totalPages ||
                  totalPages === 0
                }
                onClick={() =>
                  setCurrentPage((prev) => prev + 1)
                }
              >
                Next
              </button>
            </div>
          )}

          {query.trim() !== '' &&
            customers.length === 0 && (
              <div className="mt-10 rounded-[28px] border border-dashed border-[#D4E0EC] bg-[#FBFDFF] px-8 py-14 text-center">
                <div className="flex justify-center">
                  <Search
                    className="text-[#7A90A6]"
                    size={52}
                  />
                </div>

                <h3 className="mt-5 text-[30px] font-semibold text-[#17324F]">
                  No customers found
                </h3>

                <p className="mx-auto mt-4 max-w-xl text-[16px] leading-8 text-[#6A8198]">
                  We couldn&apos;t find any customers matching
                  your search query. Try another customer
                  name, phone number, or vehicle number.
                </p>
              </div>
            )}
        </section>
      </div>
    </main>
  )
}

export default CustomerSearchPage
