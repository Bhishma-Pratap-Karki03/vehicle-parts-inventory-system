import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  User,
  Car,
  ClipboardList,
} from 'lucide-react'
import backendUrl from '../../config'
import type {
  CustomerPurchaseHistoryItem,
  PaymentStatusValue,
  ServiceStatusValue,
  StaffCustomerDetails,
} from '../../shared/interfaces/customer.interface'
import { apiRequest, getApiErrorMessage } from '../../shared/utils/api'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function paymentStatusLabel(status: PaymentStatusValue): string {
  if (typeof status === 'string') {
    if (status === 'PartiallyPaid') {
      return 'Partially Paid'
    }

    return status
  }

  if (status === 0) {
    return 'Unpaid'
  }

  if (status === 1) {
    return 'Partially Paid'
  }

  return 'Paid'
}

function paymentStatusTone(status: PaymentStatusValue): string {
  const label = paymentStatusLabel(status)

  if (label === 'Paid') {
    return 'bg-[#E6F3EC] text-[#1F7A4A]'
  }

  if (label === 'Partially Paid') {
    return 'bg-[#FFF4DE] text-[#9B6A12]'
  }

  return 'bg-[#FBEAE7] text-[#A94E48]'
}

function serviceStatusLabel(status: ServiceStatusValue): string {
  if (typeof status === 'string') {
    return status
  }

  if (status === 0) {
    return 'Pending'
  }

  if (status === 1) {
    return 'InProgress'
  }

  return 'Completed'
}

function serviceStatusTone(status: ServiceStatusValue): string {
  const label = serviceStatusLabel(status)

  if (label === 'Completed') {
    return 'bg-[#E6F3EC] text-[#1F7A4A]'
  }

  if (label === 'InProgress') {
    return 'bg-[#E6EEFB] text-[#15558D]'
  }

  return 'bg-[#FFF4DE] text-[#9B6A12]'
}

function CustomerDetailsPage() {
  const { id } = useParams()

  const [customer, setCustomer] = useState<null | StaffCustomerDetails>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<null | number>(null)
  const [openingInvoiceId, setOpeningInvoiceId] = useState<null | number>(null)
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<null | number>(null)

  useEffect(() => {
    void fetchCustomer()
  }, [id])

  const fetchCustomer = async () => {
    try {
      setIsLoading(true)

      const result = await apiRequest<StaffCustomerDetails>(
        `/api/customers/${id}`,
      )

      if (!result.success || !result.data) {
        setErrorMessage(
          getApiErrorMessage(result) ||
            'Customer not found.',
        )

        setCustomer(null)
        return
      }

      setCustomer(result.data)
      setErrorMessage('')
    } catch {
      setErrorMessage(
        'Failed to load customer details.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleOpenInvoicePdf(
    salesInvoiceId: number,
  ) {
    setOpeningInvoiceId(salesInvoiceId)

    try {
      const response = await apiRequest<string>(
        `/api/sales-invoices/${salesInvoiceId}/download`,
      )

      if (!response.success || !response.data) {
        toast.error(getApiErrorMessage(response))
        return
      }

      window.open(
        response.data,
        '_blank',
        'noopener,noreferrer',
      )
    } catch {
      toast.error('Unable to open the invoice PDF.')
    } finally {
      setOpeningInvoiceId(null)
    }
  }

  async function handleDownloadInvoicePdf(
    invoice: CustomerPurchaseHistoryItem,
  ) {
    setDownloadingInvoiceId(invoice.salesInvoiceId)

    try {
      const response = await fetch(
        `${backendUrl}/api/sales-invoices/${invoice.salesInvoiceId}/download-pdf`,
      )

      if (!response.ok) {
        let message = `Request failed with status ${response.status}.`

        try {
          const result = (await response.json()) as {
            errors?: string[]
            message?: string
          }

          if (result.errors?.length) {
            message = result.errors.join(' ')
          } else if (result.message) {
            message = result.message
          }
        } catch {
          // ignore json parsing and keep generic message
        }

        throw new Error(message)
      }

      const pdfBlob = await response.blob()
      const objectUrl =
        window.URL.createObjectURL(pdfBlob)
      const downloadLink =
        document.createElement('a')

      downloadLink.href = objectUrl
      downloadLink.download = `${
        invoice.invoiceNumber ||
        `sales-invoice-${invoice.salesInvoiceId}`
      }.pdf`

      document.body.appendChild(downloadLink)
      downloadLink.click()
      downloadLink.remove()
      window.URL.revokeObjectURL(objectUrl)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to download the invoice PDF.',
      )
    } finally {
      setDownloadingInvoiceId(null)
    }
  }

  if (isLoading) {
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

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F8FB] px-6">
        <div className="w-full max-w-2xl rounded-4xl border border-[#DCE5EF] bg-white p-10 text-center shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
          <h2 className="text-[36px] font-semibold text-[#17324F]">
            Unable to Load Customer
          </h2>

          <p className="mt-5 text-[17px] leading-8 text-[#6A8198]">
            {errorMessage}
          </p>

          <Link
            className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-[#15558D] px-8 text-[15px] font-semibold text-white no-underline transition hover:bg-[#0E4778]"
            to="/customers/search"
          >
            Back to Search
          </Link>
        </div>
      </main>
    )
  }

  if (!customer) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F8FB] px-6">
        <div className="w-full max-w-2xl rounded-4xl border border-[#DCE5EF] bg-white p-10 text-center shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
          <h2 className="text-[36px] font-semibold text-[#17324F]">
            Customer Not Found
          </h2>

          <p className="mt-5 text-[17px] leading-8 text-[#6A8198]">
            The customer you are looking for does not exist.
          </p>

          <Link
            className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-[#15558D] px-8 text-[15px] font-semibold text-white no-underline transition hover:bg-[#0E4778]"
            to="/customers/search"
          >
            Back to Search
          </Link>
        </div>
      </main>
    )
  }

  const summaryCards = [
    {
      label: 'Total Purchases',
      tone: 'bg-[#EEF4FA] text-[#15558D]',
      value: String(customer.historySummary.totalPurchases),
    },
    {
      label: 'Paid Amount',
      tone: 'bg-[#E6F3EC] text-[#1F7A4A]',
      value: formatCurrency(customer.historySummary.totalSpent),
    },
    {
      label: 'Outstanding',
      tone:
        customer.historySummary.outstandingBalance > 0
          ? 'bg-[#FBEAE7] text-[#A94E48]'
          : 'bg-[#EEF4FA] text-[#15558D]',
      value: formatCurrency(
        customer.historySummary.outstandingBalance,
      ),
    },
    {
      label: 'Service Records',
      tone: 'bg-[#EEF4FA] text-[#15558D]',
      value: String(customer.historySummary.totalServices),
    },
  ]

  return (
    <main className="min-h-screen bg-[#F5F8FB] px-7 py-8 text-[#17324F]">
      <div className="mx-auto max-w-7xl">
        <Link
          className="inline-flex items-center gap-2 text-[15px] font-medium text-[#4E6B8B] no-underline transition hover:text-[#17324F]"
          to="/customers/search"
        >
          ← Back to Customer Search
        </Link>

        <div className="mt-8 rounded-4xl border border-[#DCE5EF] bg-white px-10 py-10 shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-[64px] font-semibold tracking-[-0.03em] text-[#0F2744] [font-family:var(--font-display)]">
                Customer Details
              </h1>

              <p className="mt-5 max-w-4xl text-[18px] leading-9 text-[#5B7189]">
                View customer details, registered
                vehicles, purchase invoices, and service
                history in one place.
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
          <section className="rounded-4xl border border-[#DCE5EF] bg-white p-8 shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
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
              <div className="rounded-3xl border border-[#E3ECF5] bg-[#FBFDFF] p-6">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                  Full Name
                </p>

                <h3 className="mt-3 text-[26px] font-semibold text-[#17324F]">
                  {customer.fullName}
                </h3>
              </div>

              <div className="rounded-3xl border border-[#E3ECF5] bg-[#FBFDFF] p-6">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                  Email Address
                </p>

                <h3 className="mt-3 text-[20px] font-medium text-[#17324F]">
                  {customer.email}
                </h3>
              </div>

              <div className="rounded-3xl border border-[#E3ECF5] bg-[#FBFDFF] p-6">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                  Phone Number
                </p>

                <h3 className="mt-3 text-[20px] font-medium text-[#17324F]">
                  {customer.phoneNumber}
                </h3>
              </div>

              <div className="rounded-3xl border border-[#E3ECF5] bg-[#FBFDFF] p-6">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                  Address
                </p>

                <h3 className="mt-3 text-[20px] font-medium text-[#17324F]">
                  {customer.address || 'No address provided'}
                </h3>
              </div>
            </div>
          </section>

          <section className="rounded-4xl border border-[#DCE5EF] bg-white p-8 shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
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
              {customer.vehicles?.map((vehicle, index) => (
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

        <section className="mt-8 rounded-4xl border border-[#DCE5EF] bg-white p-8 shadow-[0_18px_40px_rgba(15,39,68,0.04)]">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EDF4FB] text-[#174B7A]">
              <ClipboardList size={28} />
            </div>

            <div>
              <h2 className="text-[38px] font-semibold tracking-[-0.03em] text-[#17324F]">
                Customer History
              </h2>

              <p className="mt-2 text-[16px] text-[#6A8198]">
                Purchases, outstanding balances, and service
                records for this customer.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                className="rounded-[24px] border border-[#E3ECF5] bg-[#FBFDFF] p-5"
                key={card.label}
              >
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                  {card.label}
                </p>

                <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-[18px] font-semibold ${card.tone}`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[30px] border border-[#DCE5EF] bg-[#FBFDFF] p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[30px] font-semibold text-[#17324F]">
                    Purchase History
                  </h3>
                  <p className="mt-2 text-[15px] text-[#6A8198]">
                    Sold parts, invoice totals, and bill
                    access for every purchase.
                  </p>
                </div>

                <div className="rounded-full bg-[#EDF4FB] px-4 py-2 text-[14px] font-semibold text-[#15558D]">
                  {customer.purchaseHistory.length} invoice
                  {customer.purchaseHistory.length === 1
                    ? ''
                    : 's'}
                </div>
              </div>

              {customer.purchaseHistory.length === 0 ? (
                <div className="mt-8 rounded-[24px] border border-dashed border-[#D4E0EC] bg-white px-6 py-12 text-center">
                  <h4 className="text-[24px] font-semibold text-[#17324F]">
                    No purchase history
                  </h4>

                  <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[#6A8198]">
                    This customer has not completed any
                    parts purchase yet.
                  </p>
                </div>
              ) : (
                <div className="mt-8 space-y-5">
                  {customer.purchaseHistory.map((invoice) => {
                    const isExpanded =
                      expandedInvoiceId ===
                      invoice.salesInvoiceId

                    return (
                      <div
                        className="rounded-[24px] border border-[#E3ECF5] bg-white p-5"
                        key={invoice.salesInvoiceId}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-[22px] font-semibold text-[#17324F]">
                                {invoice.invoiceNumber}
                              </h4>
                              <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${paymentStatusTone(invoice.paymentStatus)}`}>
                                {paymentStatusLabel(
                                  invoice.paymentStatus,
                                )}
                              </span>
                            </div>

                            <p className="mt-2 text-[14px] text-[#6A8198]">
                              {formatDate(
                                invoice.invoiceDate,
                              )}{' '}
                              &middot;{' '}
                              {invoice.vehicleNumber} (
                              {invoice.vehicleBrandModel})
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {invoice.hasInvoicePdf ? (
                              <>
                                <button
                                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#2E4C70] transition hover:bg-[#F7FBFE] disabled:cursor-not-allowed disabled:opacity-70"
                                  disabled={
                                    openingInvoiceId ===
                                    invoice.salesInvoiceId
                                  }
                                  onClick={() =>
                                    void handleOpenInvoicePdf(
                                      invoice.salesInvoiceId,
                                    )
                                  }
                                  type="button"
                                >
                                  {openingInvoiceId ===
                                  invoice.salesInvoiceId
                                    ? 'Opening...'
                                    : 'Open Bill'}
                                </button>
                                <button
                                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#15558D] px-4 text-[13px] font-semibold text-white transition hover:bg-[#0E4778] disabled:cursor-not-allowed disabled:opacity-70"
                                  disabled={
                                    downloadingInvoiceId ===
                                    invoice.salesInvoiceId
                                  }
                                  onClick={() =>
                                    void handleDownloadInvoicePdf(
                                      invoice,
                                    )
                                  }
                                  type="button"
                                >
                                  {downloadingInvoiceId ===
                                  invoice.salesInvoiceId
                                    ? 'Downloading...'
                                    : 'Download Bill'}
                                </button>
                              </>
                            ) : null}

                            <button
                              className="inline-flex h-11 items-center justify-center rounded-full border border-[#D7E2ED] bg-white px-4 text-[13px] font-semibold text-[#17324F] transition hover:bg-[#F7FBFE]"
                              onClick={() =>
                                setExpandedInvoiceId(
                                  isExpanded
                                    ? null
                                    : invoice.salesInvoiceId,
                                )
                              }
                              type="button"
                            >
                              {isExpanded
                                ? 'Hide Items'
                                : 'View Items'}
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                          <div className="rounded-[18px] bg-[#FBFDFF] p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                              Final Amount
                            </p>
                            <p className="mt-2 text-[18px] font-semibold text-[#17324F]">
                              {formatCurrency(
                                invoice.finalAmount,
                              )}
                            </p>
                          </div>

                          <div className="rounded-[18px] bg-[#FBFDFF] p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                              Paid
                            </p>
                            <p className="mt-2 text-[18px] font-semibold text-[#1F7A4A]">
                              {formatCurrency(
                                invoice.paidAmount,
                              )}
                            </p>
                          </div>

                          <div className="rounded-[18px] bg-[#FBFDFF] p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                              Remaining
                            </p>
                            <p className="mt-2 text-[18px] font-semibold text-[#A94E48]">
                              {formatCurrency(
                                invoice.remainingAmount,
                              )}
                            </p>
                          </div>

                          <div className="rounded-[18px] bg-[#FBFDFF] p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                              Items
                            </p>
                            <p className="mt-2 text-[18px] font-semibold text-[#17324F]">
                              {invoice.itemCount}
                            </p>
                          </div>
                        </div>

                        {isExpanded ? (
                          <div className="mt-5 overflow-hidden rounded-[22px] border border-[#E3ECF5]">
                            <table className="w-full text-left text-[14px]">
                              <thead className="bg-[#F2F7FC] text-[11px] uppercase tracking-[0.14em] text-[#6D8197]">
                                <tr>
                                  <th className="px-4 py-3 font-semibold">
                                    Part
                                  </th>
                                  <th className="px-4 py-3 font-semibold">
                                    Part #
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold">
                                    Qty
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold">
                                    Unit Price
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold">
                                    Line Total
                                  </th>
                                </tr>
                              </thead>

                              <tbody className="bg-white">
                                {invoice.items.map(
                                  (item, index) => (
                                    <tr
                                      className="border-t border-[#EEF2F8]"
                                      key={`${invoice.salesInvoiceId}-${index}`}
                                    >
                                      <td className="px-4 py-3 font-medium text-[#17324F]">
                                        {item.partName}
                                      </td>
                                      <td className="px-4 py-3 text-[#6A8198]">
                                        {item.partNumber}
                                      </td>
                                      <td className="px-4 py-3 text-right text-[#17324F]">
                                        {item.quantity}
                                      </td>
                                      <td className="px-4 py-3 text-right text-[#17324F]">
                                        {formatCurrency(
                                          item.pricePerUnit,
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-right font-semibold text-[#17324F]">
                                        {formatCurrency(
                                          item.lineTotal,
                                        )}
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="rounded-[30px] border border-[#DCE5EF] bg-[#FBFDFF] p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[30px] font-semibold text-[#17324F]">
                    Service History
                  </h3>
                  <p className="mt-2 text-[15px] text-[#6A8198]">
                    Recorded services, labor cost, and
                    parts changed or suggested.
                  </p>
                </div>

                <div className="rounded-full bg-[#EDF4FB] px-4 py-2 text-[14px] font-semibold text-[#15558D]">
                  {customer.serviceHistory.length} record
                  {customer.serviceHistory.length === 1
                    ? ''
                    : 's'}
                </div>
              </div>

              {customer.serviceHistory.length === 0 ? (
                <div className="mt-8 rounded-[24px] border border-dashed border-[#D4E0EC] bg-white px-6 py-12 text-center">
                  <h4 className="text-[24px] font-semibold text-[#17324F]">
                    No service history
                  </h4>

                  <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[#6A8198]">
                    This customer does not have any
                    service or maintenance history
                    recorded yet.
                  </p>
                </div>
              ) : (
                <div className="mt-8 space-y-5">
                  {customer.serviceHistory.map((record) => (
                    <div
                      className="rounded-[24px] border border-[#E3ECF5] bg-white p-5"
                      key={record.serviceRecordId}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="text-[20px] font-semibold text-[#17324F]">
                            {record.serviceDescription}
                          </h4>

                          <p className="mt-2 text-[14px] text-[#6A8198]">
                            {formatDate(
                              record.serviceDate,
                            )}{' '}
                            &middot;{' '}
                            {record.vehicleNumber} (
                            {record.vehicleBrandModel})
                          </p>
                        </div>

                        <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${serviceStatusTone(record.status)}`}>
                          {serviceStatusLabel(record.status)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-4">
                        <div className="rounded-[18px] bg-[#FBFDFF] p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                            Parts Changed / Suggested
                          </p>
                          <p className="mt-2 text-[15px] text-[#17324F]">
                            {record.partsChangedOrSuggested?.trim() ||
                              'None recorded'}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="rounded-[18px] bg-[#FBFDFF] p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                              Labor Cost
                            </p>
                            <p className="mt-2 text-[18px] font-semibold text-[#17324F]">
                              {formatCurrency(
                                record.laborCost,
                              )}
                            </p>
                          </div>

                          <div className="rounded-[18px] bg-[#FBFDFF] p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6D8197]">
                              Staff
                            </p>
                            <p className="mt-2 text-[18px] font-semibold text-[#17324F]">
                              {record.staffName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}

export default CustomerDetailsPage
