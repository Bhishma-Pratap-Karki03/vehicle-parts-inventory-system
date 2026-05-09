import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'
import type { PartRecord } from '../../shared/interfaces/parts.interface'
import type {
  SalesInvoiceCustomerOption,
  SalesInvoiceFormItemValues,
  SalesInvoiceFormValues,
  SalesInvoiceVehicleOption,
} from '../../shared/interfaces/salesInvoices.interface'
import {
  createEmptySalesInvoiceFormValues,
  formatDateLabel,
  formatRupees,
  getSalesLineTotal,
} from './salesInvoices.helpers'

type SalesInvoiceFormProps = {
  customerOptions: SalesInvoiceCustomerOption[]
  initialValues: SalesInvoiceFormValues
  partOptions: PartRecord[]
  vehicleOptions: SalesInvoiceVehicleOption[]
  isCustomerOptionsLoading: boolean
  isPartOptionsLoading: boolean
  isVehiclesLoading: boolean
  isSubmitting: boolean
  onCustomerSelected: (customerId: string) => void
  onSubmitInvoice: (values: SalesInvoiceFormValues) => Promise<void> | void
}

function buildEmptyItem(): SalesInvoiceFormItemValues {
  return createEmptySalesInvoiceFormValues().items[0]
}

function SalesInvoiceForm({
  customerOptions,
  initialValues,
  partOptions,
  vehicleOptions,
  isCustomerOptionsLoading,
  isPartOptionsLoading,
  isVehiclesLoading,
  isSubmitting,
  onCustomerSelected,
  onSubmitInvoice,
}: SalesInvoiceFormProps) {
  const {
    register,
    clearErrors,
    control,
    handleSubmit,
    getValues,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<SalesInvoiceFormValues>({
    defaultValues: initialValues,
    mode: 'onSubmit',
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  useEffect(() => {
    reset(initialValues)
  }, [initialValues, reset])

  const watchedCustomerId = useWatch({
    control,
    name: 'customerId',
  })
  const watchedVehicleId = useWatch({
    control,
    name: 'vehicleId',
  })
  const watchedDiscountAmount = useWatch({
    control,
    name: 'discountAmount',
  })
  const watchedPaidAmount = useWatch({
    control,
    name: 'paidAmount',
  })
  const watchedDueDate = useWatch({
    control,
    name: 'dueDate',
  })
  const watchedItems = useWatch({
    control,
    name: 'items',
  })

  const invoiceItems = useMemo(() => watchedItems ?? [], [watchedItems])

  const selectedCustomer = useMemo(
    () => customerOptions.find((option) => option.customerId === watchedCustomerId),
    [customerOptions, watchedCustomerId],
  )

  const selectedVehicle = useMemo(
    () => vehicleOptions.find((option) => String(option.vehicleId) === watchedVehicleId),
    [vehicleOptions, watchedVehicleId],
  )

  const partLookup = useMemo(
    () => new Map(partOptions.map((part) => [String(part.partId), part])),
    [partOptions],
  )

  const summary = useMemo(() => {
    const selectedItems = invoiceItems.filter((item) => item.partId)
    const totalLines = selectedItems.length
    const totalQuantity = selectedItems.reduce((sum, item) => sum + Number.parseInt(item.quantity || '0', 10), 0)
    const subTotal = selectedItems.reduce((sum, item) => {
      const selectedPart = partLookup.get(item.partId)
      return sum + getSalesLineTotal(item.quantity, selectedPart?.sellingPricePerUnit ?? 0)
    }, 0)

    const normalizedDiscountAmount = Number.parseFloat(watchedDiscountAmount || '0')
    const discountAmount = Number.isNaN(normalizedDiscountAmount) ? 0 : normalizedDiscountAmount
    const finalAmount = Math.max(subTotal - discountAmount, 0)
    const normalizedPaidAmount = Number.parseFloat(watchedPaidAmount || '0')
    const paidAmount = Number.isNaN(normalizedPaidAmount) ? 0 : normalizedPaidAmount
    const remainingAmount = Math.max(finalAmount - paidAmount, 0)

    return {
      discountAmount,
      finalAmount,
      paidAmount,
      remainingAmount,
      subTotal,
      totalLines,
      totalQuantity,
    }
  }, [invoiceItems, partLookup, watchedDiscountAmount, watchedPaidAmount])

  const customerField = register('customerId', {
    required: {
      value: true,
      message: 'Customer is required.',
    },
  })
  const vehicleField = register('vehicleId', {
    required: {
      value: true,
      message: 'Vehicle is required.',
    },
    validate: (value) => Number.parseInt(value || '0', 10) > 0 || 'Vehicle is required.',
  })

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F7FAFD_0%,#EEF4FA_55%,#F9FBFE_100%)] text-[#102B49]">
      <form className="mx-auto w-full max-w-380 px-4 py-8 sm:px-6 lg:px-8 lg:py-10" onSubmit={handleSubmit(onSubmitInvoice)}>
        <div className="flex flex-col gap-6 border-b border-[#DCE5EF] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <Link
              className="inline-flex items-center gap-2 text-[15px] font-medium text-[#45637F] transition hover:text-[#163E66]"
              to="/sales-invoices"
            >
              <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                arrow_back
              </span>
              Back to Sales Invoices
            </Link>

            <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#0C2544] [font-family:var(--font-display)] sm:text-[42px]">
              Create Sales Invoice
            </h1>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#566E87] sm:text-[16px]">
              Record a customer sale, choose the sold parts, and let the system calculate the invoice totals, stock movements, and PDF.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#C8D6E5] bg-white px-5 text-[14px] font-semibold text-[#24405E] no-underline shadow-[0_10px_24px_rgba(18,43,74,0.05)] transition hover:border-[#AEC3D9] hover:bg-[#F7FBFE]"
              to="/sales-invoices"
            >
              Cancel
            </Link>
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(21,85,141,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0E487C] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting || isCustomerOptionsLoading || isPartOptionsLoading}
              type="submit"
            >
              <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                receipt_long
              </span>
              {isSubmitting ? 'Creating Invoice...' : 'Create Sales Invoice'}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="mb-5 flex items-center gap-3 border-b border-[#E6EEF5] pb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                  <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                    badge
                  </span>
                </span>
                <div>
                  <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Customer & Vehicle</h2>
                  <p className="mt-1 text-[14px] text-[#678099]">Choose the customer first, then select one of their registered vehicles for this sale.</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="relative">
                  <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="sales-invoice-customer-id">
                    Customer
                  </label>
                  <div className="relative">
                    <select
                      {...customerField}
                      className="h-13 w-full appearance-none rounded-[18px] border border-[#D8E3EE] bg-[#FBFDFF] px-4 pr-11 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:bg-white focus:ring-4 focus:ring-[#15558D]/10"
                      disabled={isCustomerOptionsLoading || isSubmitting}
                      id="sales-invoice-customer-id"
                      onChange={(event) => {
                        const nextCustomerId = event.target.value
                        const currentCustomerId = getValues('customerId')
                        customerField.onChange(event)
                        onCustomerSelected(nextCustomerId)

                        if (nextCustomerId !== currentCustomerId) {
                          setValue('vehicleId', '', { shouldValidate: true })
                        }
                      }}
                    >
                      <option value="">{isCustomerOptionsLoading ? 'Loading customers...' : 'Select a customer'}</option>
                      {customerOptions.map((option) => (
                        <option key={option.customerId} value={option.customerId}>
                          {option.customerName}{option.customerEmail ? ` (${option.customerEmail})` : ''}
                        </option>
                      ))}
                    </select>
                    <span
                      aria-hidden
                      className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 inline-flex -translate-y-1/2 select-none items-center justify-center leading-none text-[22px] text-[#607389] not-italic"
                    >
                      expand_more
                    </span>
                  </div>
                  {errors.customerId ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.customerId.message}</p> : null}
                </div>

                <div className="relative">
                  <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="sales-invoice-vehicle-id">
                    Vehicle
                  </label>
                  <div className="relative">
                    <select
                      {...vehicleField}
                      className="h-13 w-full appearance-none rounded-[18px] border border-[#D8E3EE] bg-[#FBFDFF] px-4 pr-11 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:bg-white focus:ring-4 focus:ring-[#15558D]/10"
                      disabled={!watchedCustomerId || isVehiclesLoading || isSubmitting}
                      id="sales-invoice-vehicle-id"
                      onChange={(event) => {
                        vehicleField.onChange(event)
                        clearErrors('vehicleId')
                        void trigger('vehicleId')
                      }}
                    >
                      <option value="">
                        {!watchedCustomerId
                          ? 'Select a customer first'
                          : isVehiclesLoading
                            ? 'Loading vehicles...'
                            : 'Select a vehicle'}
                      </option>
                      {vehicleOptions.map((option) => (
                        <option key={option.vehicleId} value={String(option.vehicleId)}>
                          {option.vehicleNumber} ({option.brand} {option.model})
                        </option>
                      ))}
                    </select>
                    <span
                      aria-hidden
                      className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 inline-flex -translate-y-1/2 select-none items-center justify-center leading-none text-[22px] text-[#607389] not-italic"
                    >
                      expand_more
                    </span>
                  </div>
                  {errors.vehicleId ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.vehicleId.message}</p> : null}
                </div>

                <div className="relative">
                  <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="sales-invoice-due-date">
                    Due Date
                  </label>
                  <input
                    {...register('dueDate')}
                    className="h-13 w-full rounded-[18px] border border-[#D8E3EE] bg-[#FBFDFF] px-4 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:bg-white focus:ring-4 focus:ring-[#15558D]/10"
                    disabled={isSubmitting}
                    id="sales-invoice-due-date"
                    type="date"
                  />
                </div>

                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Invoice Timing</p>
                  <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{formatDateLabel(new Date().toISOString())}</p>
                  <p className="mt-1 text-[13px] text-[#6F849B]">{watchedDueDate ? `Due ${formatDateLabel(watchedDueDate)}` : 'No due date selected yet'}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="mb-5 flex items-center gap-3 border-b border-[#E6EEF5] pb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                  <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                    payments
                  </span>
                </span>
                <div>
                  <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Payment Preview</h2>
                  <p className="mt-1 text-[14px] text-[#678099]">These amounts are previews only. The final invoice values are confirmed after submission.</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="relative">
                  <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="sales-invoice-discount">
                    Discount Amount
                  </label>
                  <input
                    {...register('discountAmount', {
                      validate: (value) => {
                        const numericValue = Number.parseFloat(value || '0')

                        if (Number.isNaN(numericValue) || numericValue < 0) {
                          return 'Discount amount cannot be negative.'
                        }

                        if (numericValue > summary.subTotal) {
                          return 'Discount amount cannot be greater than subtotal.'
                        }

                        return true
                      },
                    })}
                    className="h-13 w-full rounded-[18px] border border-[#D8E3EE] bg-[#FBFDFF] px-4 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:bg-white focus:ring-4 focus:ring-[#15558D]/10"
                    disabled={isSubmitting}
                    id="sales-invoice-discount"
                    inputMode="decimal"
                    min="0"
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                  />
                  {errors.discountAmount ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.discountAmount.message}</p> : null}
                </div>

                <div className="relative">
                  <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="sales-invoice-paid">
                    Paid Amount
                  </label>
                  <input
                    {...register('paidAmount', {
                      validate: (value) => {
                        const numericValue = Number.parseFloat(value || '0')

                        if (Number.isNaN(numericValue) || numericValue < 0) {
                          return 'Paid amount cannot be negative.'
                        }

                        if (numericValue > summary.finalAmount) {
                          return 'Paid amount cannot be greater than final amount.'
                        }

                        return true
                      },
                    })}
                    className="h-13 w-full rounded-[18px] border border-[#D8E3EE] bg-[#FBFDFF] px-4 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:bg-white focus:ring-4 focus:ring-[#15558D]/10"
                    disabled={isSubmitting}
                    id="sales-invoice-paid"
                    inputMode="decimal"
                    min="0"
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                  />
                  {errors.paidAmount ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.paidAmount.message}</p> : null}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="mb-5 flex items-center gap-3 border-b border-[#E6EEF5] pb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                  <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                    inventory_2
                  </span>
                </span>
                <div>
                  <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Sold Parts</h2>
                  <p className="mt-1 text-[14px] text-[#678099]">Choose the parts being sold and set the requested quantity for each line.</p>
                </div>
              </div>

              {isPartOptionsLoading ? (
                <div className="rounded-[22px] border border-dashed border-[#D5E1EC] bg-[#F8FBFE] px-5 py-6 text-[15px] leading-7 text-[#5F768F]">
                  Loading active parts for the sales invoice form...
                </div>
              ) : null}

              {!isPartOptionsLoading && partOptions.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-[#D5E1EC] bg-[#F8FBFE] px-5 py-6 text-[15px] leading-7 text-[#5F768F]">
                  No sale-ready parts were found in the catalog yet.
                </div>
              ) : null}

              <div className="space-y-4">
                {fields.map((field, index) => {
                  const watchedItem = invoiceItems[index]
                  const selectedPart = watchedItem?.partId ? partLookup.get(watchedItem.partId) : undefined
                  const lineTotal = getSalesLineTotal(watchedItem?.quantity || '0', selectedPart?.sellingPricePerUnit ?? 0)
                  const quantityFieldName = `items.${index}.quantity` as const
                  const partFieldName = `items.${index}.partId` as const
                  const partField = register(partFieldName, {
                    required: {
                      value: true,
                      message: 'Part is required.',
                    },
                    validate: (value) => {
                      if (!value) {
                        return true
                      }

                      const duplicateCount = getValues('items').filter((item) => item.partId === value).length
                      return duplicateCount <= 1 || 'Duplicate part rows are not allowed.'
                    },
                  })

                  return (
                    <div className="rounded-3xl border border-[#E3EAF2] bg-[#FBFDFF] p-4 shadow-[0_10px_24px_rgba(18,43,74,0.04)]" key={field.id}>
                      <div className="flex items-center justify-between gap-3 border-b border-[#E8EEF5] pb-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Sale Item {index + 1}</p>
                          <p className="mt-1 text-[14px] text-[#566E87]">Choose one active part and enter the quantity being sold.</p>
                        </div>
                        <button
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E4D7D4] bg-[#FFF8F7] text-[#B76458] transition hover:bg-[#FFF0EE] disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={fields.length === 1 || isSubmitting}
                          onClick={() => remove(index)}
                          title="Remove item"
                          type="button"
                        >
                          <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                            delete
                          </span>
                        </button>
                      </div>

                      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)_124px_148px]">
                        <div>
                          <label className="mb-2 block text-[13px] font-semibold text-[#1B3554]" htmlFor={`sales-invoice-part-${index}`}>
                            Part
                          </label>
                          <div className="relative">
                            <select
                              {...partField}
                              className="h-13 w-full appearance-none rounded-[18px] border border-[#D8E3EE] bg-white px-4 pr-11 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10"
                              disabled={isPartOptionsLoading || isSubmitting || partOptions.length === 0}
                              id={`sales-invoice-part-${index}`}
                              onChange={(event) => {
                                partField.onChange(event)
                                void trigger(fields.map((_, fieldIndex) => `items.${fieldIndex}.partId` as const))
                                void trigger(quantityFieldName)
                              }}
                            >
                              <option value="">{isPartOptionsLoading ? 'Loading parts...' : 'Select a part'}</option>
                              {partOptions.map((partOption) => (
                                <option key={partOption.partId} value={String(partOption.partId)}>
                                  {partOption.partName} ({partOption.partNumber})
                                </option>
                              ))}
                            </select>
                            <span
                              aria-hidden
                              className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 inline-flex -translate-y-1/2 select-none items-center justify-center leading-none text-[22px] text-[#607389] not-italic"
                            >
                              expand_more
                            </span>
                          </div>
                          {selectedPart ? (
                            <p className="mt-2 text-[13px] text-[#627A93]">
                              {selectedPart.partNumber} • Selling price {formatRupees(selectedPart.sellingPricePerUnit)}
                            </p>
                          ) : null}
                          {errors.items?.[index]?.partId ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.items[index]?.partId?.message}</p> : null}
                        </div>

                        <div className="rounded-[18px] border border-[#E3EAF2] bg-[#F8FBFE] px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Available Stock</p>
                          <p className="mt-3 text-[15px] font-semibold text-[#16314F]">{selectedPart ? `${selectedPart.stockQuantity} units in stock` : 'Choose a part'}</p>
                          <p className="mt-1 text-[13px] text-[#627A93]">{selectedPart ? `Retail ${formatRupees(selectedPart.sellingPricePerUnit)}` : 'Stock details appear here'}</p>
                        </div>

                        <div>
                          <label className="mb-2 block text-[13px] font-semibold text-[#1B3554]" htmlFor={`sales-invoice-quantity-${index}`}>
                            Quantity
                          </label>
                          <input
                            {...register(quantityFieldName, {
                              required: {
                                value: true,
                                message: 'Quantity is required.',
                              },
                              validate: (value) => {
                                const numericQuantity = Number.parseInt(value || '0', 10)

                                if (Number.isNaN(numericQuantity) || numericQuantity <= 0) {
                                  return 'Quantity must be greater than 0.'
                                }

                                if (selectedPart && numericQuantity > selectedPart.stockQuantity) {
                                  return `Only ${selectedPart.stockQuantity} units are currently in stock.`
                                }

                                return true
                              },
                            })}
                            className="h-13 w-full rounded-[18px] border border-[#D8E3EE] bg-white px-4 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10"
                            disabled={isSubmitting}
                            id={`sales-invoice-quantity-${index}`}
                            inputMode="numeric"
                            min="1"
                            step="1"
                            type="number"
                          />
                          {errors.items?.[index]?.quantity ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.items[index]?.quantity?.message}</p> : null}
                        </div>

                        <div className="rounded-[18px] border border-[#E3EAF2] bg-[#F8FBFE] px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Line Total</p>
                          <p className="mt-3 text-[16px] font-semibold text-[#16314F]">{formatRupees(lineTotal)}</p>
                          <p className="mt-1 text-[13px] text-[#627A93]">{selectedPart ? `${watchedItem?.quantity || '0'} x ${formatRupees(selectedPart.sellingPricePerUnit)}` : 'Choose a part first'}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-dashed border-[#BFD0E1] bg-[#F8FBFE] px-5 text-[14px] font-semibold text-[#2E4C70] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting || isPartOptionsLoading || partOptions.length === 0}
                onClick={() => append(buildEmptyItem())}
                type="button"
              >
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                  add
                </span>
                Add Another Part
              </button>
            </section>
          </section>

          <aside className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-[#DCE5EF] bg-white shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="bg-[#143F6B] px-6 py-5 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Sales summary</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[22px] font-semibold leading-tight [font-family:var(--font-display)]">Preview</h2>
                    <p className="mt-1 text-[14px] text-white/80">Estimated totals before final invoice confirmation.</p>
                  </div>
                  <span className="inline-flex min-h-8 items-center justify-center rounded-full border border-white/25 bg-white/10 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90">
                    Draft
                  </span>
                </div>
              </div>

              <div className="space-y-4 px-6 py-6">
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Sub Total</p>
                  <p className="mt-3 text-[19px] font-semibold text-[#112B49]">{formatRupees(summary.subTotal)}</p>
                  <p className="mt-1 text-[13px] text-[#627A93]">{summary.totalLines} line items • {summary.totalQuantity} units</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Final Amount</p>
                    <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{formatRupees(summary.finalAmount)}</p>
                    <p className="mt-1 text-[13px] text-[#627A93]">After {formatRupees(summary.discountAmount)} discount</p>
                  </div>

                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Remaining</p>
                    <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{formatRupees(summary.remainingAmount)}</p>
                    <p className="mt-1 text-[13px] text-[#627A93]">{formatRupees(summary.paidAmount)} marked as paid</p>
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <div className="space-y-3 text-[14px] text-[#4F6881]">
                    <p>
                      <span className="font-semibold text-[#123052]">Customer:</span>{' '}
                      {selectedCustomer ? selectedCustomer.customerName : 'Not selected yet'}
                    </p>
                    <p>
                      <span className="font-semibold text-[#123052]">Vehicle:</span>{' '}
                      {selectedVehicle ? `${selectedVehicle.vehicleNumber} • ${selectedVehicle.brand} ${selectedVehicle.model}` : 'Not selected yet'}
                    </p>
                    <p><span className="font-semibold text-[#123052]">Due Date:</span> {watchedDueDate ? formatDateLabel(watchedDueDate) : 'No due date selected'}</p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </form>
    </main>
  )
}

export default SalesInvoiceForm
