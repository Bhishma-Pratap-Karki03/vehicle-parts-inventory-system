import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'
import type { PartRecord, VendorOption } from '../../shared/interfaces/parts.interface'
import type { PurchaseInvoiceFormItemValues, PurchaseInvoiceFormValues } from '../../shared/interfaces/purchaseInvoices.interface'
import { createEmptyPurchaseInvoiceFormValues, formatDateLabel, formatRupees, getLineTotal } from './purchaseInvoices.helpers'

type PurchaseInvoiceFormProps = {
  initialValues: PurchaseInvoiceFormValues
  vendorOptions: VendorOption[]
  partOptions: PartRecord[]
  isOptionsLoading: boolean
  isPartsLoading: boolean
  isSubmitting: boolean
  onVendorSelected: (vendorId: string) => void
  onSubmitInvoice: (values: PurchaseInvoiceFormValues) => Promise<void> | void
}

function buildEmptyItem(): PurchaseInvoiceFormItemValues {
  return createEmptyPurchaseInvoiceFormValues().items[0]
}

function PurchaseInvoiceForm({
  initialValues,
  vendorOptions,
  partOptions,
  isOptionsLoading,
  isPartsLoading,
  isSubmitting,
  onVendorSelected,
  onSubmitInvoice,
}: PurchaseInvoiceFormProps) {
  const {
    register,
    control,
    handleSubmit,
    getValues,
    reset,
    trigger,
    formState: { errors },
  } = useForm<PurchaseInvoiceFormValues>({
    defaultValues: initialValues,
    mode: 'onSubmit',
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items',
  })

  useEffect(() => {
    reset(initialValues)
  }, [initialValues, reset])

  const watchedVendorId = useWatch({
    control,
    name: 'vendorId',
  })
  const watchedPurchaseDate = useWatch({
    control,
    name: 'purchaseDate',
  })
  const watchedItems = useWatch({
    control,
    name: 'items',
  })
  const invoiceItems = useMemo(() => watchedItems ?? [], [watchedItems])

  const selectedVendor = useMemo(
    () => vendorOptions.find((option) => String(option.id) === watchedVendorId),
    [vendorOptions, watchedVendorId],
  )

  const partLookup = useMemo(
    () => new Map(partOptions.map((part) => [String(part.partId), part])),
    [partOptions],
  )

  const summary = useMemo(() => {
    const selectedItems = invoiceItems.filter((item) => item.partId)
    const totalLines = selectedItems.length
    const totalQuantity = selectedItems.reduce((sum, item) => sum + Number.parseInt(item.quantity || '0', 10), 0)
    const totalAmount = selectedItems.reduce((sum, item) => sum + getLineTotal(item.quantity, item.costPricePerUnit), 0)

    return {
      totalAmount,
      totalLines,
      totalQuantity,
    }
  }, [invoiceItems])

  const vendorField = register('vendorId', {
    required: {
      value: true,
      message: 'Vendor is required.',
    },
  })

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F7FAFD_0%,#EEF4FA_55%,#F9FBFE_100%)] text-[#102B49]">
      <form className="mx-auto w-full max-w-380 px-4 py-8 sm:px-6 lg:px-8 lg:py-10" onSubmit={handleSubmit(onSubmitInvoice)}>
        <div className="flex flex-col gap-6 border-b border-[#DCE5EF] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <Link
              className="inline-flex items-center gap-2 text-[15px] font-medium text-[#45637F] transition hover:text-[#163E66]"
              to="/purchase-invoices"
            >
              <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                arrow_back
              </span>
              Back to Purchase Invoices
            </Link>

           
            <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#0C2544] [font-family:var(--font-display)] sm:text-[42px]">
              Create Purchase Invoice
            </h1>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#566E87] sm:text-[16px]">
              Receive stock from one vendor, record each restocked part, and send the audited invoice.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#C8D6E5] bg-white px-5 text-[14px] font-semibold text-[#24405E] no-underline shadow-[0_10px_24px_rgba(18,43,74,0.05)] transition hover:border-[#AEC3D9] hover:bg-[#F7FBFE]"
              to="/purchase-invoices"
            >
              Cancel
            </Link>
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(21,85,141,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0E487C] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting || isOptionsLoading}
              type="submit"
            >
              <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                receipt_long
              </span>
              {isSubmitting ? 'Creating Invoice...' : 'Create Purchase Invoice'}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="mb-5 flex items-center gap-3 border-b border-[#E6EEF5] pb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                  <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                    storefront
                  </span>
                </span>
                <div>
                  <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Invoice Basics</h2>
                  <p className="mt-1 text-[14px] text-[#678099]">Choose the vendor first, then set the purchase date for this restock invoice.</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="relative">
                  <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="purchase-invoice-vendor">
                    Vendor
                  </label>
                  <div className="relative">
                    <select
                      {...vendorField}
                      className="h-13 w-full appearance-none rounded-[18px] border border-[#D8E3EE] bg-[#FBFDFF] px-4 pr-11 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:bg-white focus:ring-4 focus:ring-[#15558D]/10"
                      disabled={isOptionsLoading || isSubmitting}
                      id="purchase-invoice-vendor"
                      onChange={(event) => {
                        const nextVendorId = event.target.value
                        const currentVendorId = getValues('vendorId')
                        vendorField.onChange(event)
                        onVendorSelected(nextVendorId)

                        if (nextVendorId !== currentVendorId) {
                          replace([buildEmptyItem()])
                        }
                      }}
                    >
                      <option value="">{isOptionsLoading ? 'Loading vendors...' : 'Select a vendor'}</option>
                      {vendorOptions.map((option) => (
                        <option key={option.id} value={String(option.id)}>
                          {option.name}
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
                  {errors.vendorId ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.vendorId.message}</p> : null}
                </div>

                <div className="relative">
                  <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="purchase-invoice-date">
                    Purchase Date
                  </label>
                  <input
                    {...register('purchaseDate', {
                      required: {
                        value: true,
                        message: 'Purchase date is required.',
                      },
                    })}
                    className="h-13 w-full rounded-[18px] border border-[#D8E3EE] bg-[#FBFDFF] px-4 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:bg-white focus:ring-4 focus:ring-[#15558D]/10"
                    disabled={isSubmitting}
                    id="purchase-invoice-date"
                    type="date"
                  />
                  {errors.purchaseDate ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.purchaseDate.message}</p> : null}
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
                  <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Invoice Items</h2>
                  <p className="mt-1 text-[14px] text-[#678099]">Add each part that arrived in this restock delivery.</p>
                </div>
              </div>

              {!watchedVendorId ? (
                <div className="rounded-[22px] border border-dashed border-[#D5E1EC] bg-[#F8FBFE] px-5 py-6 text-[15px] leading-7 text-[#5F768F]">
                  Choose a vendor first and we&apos;ll load the matching parts for this invoice.
                </div>
              ) : null}

              {watchedVendorId && !isPartsLoading && partOptions.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-[#D5E1EC] bg-[#F8FBFE] px-5 py-6 text-[15px] leading-7 text-[#5F768F]">
                  No active parts were found for the selected vendor yet.
                </div>
              ) : null}

              <div className="space-y-4">
                {fields.map((field, index) => {
                  const watchedItem = invoiceItems[index]
                  const selectedPart = watchedItem?.partId ? partLookup.get(watchedItem.partId) : undefined
                  const quantityFieldName = `items.${index}.quantity` as const
                  const costFieldName = `items.${index}.costPricePerUnit` as const
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
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Invoice Item {index + 1}</p>
                          <p className="mt-1 text-[14px] text-[#566E87]">Choose one vendor-owned part and record the received quantity and unit cost.</p>
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

                      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)_124px_144px_148px]">
                        <div>
                          <label className="mb-2 block text-[13px] font-semibold text-[#1B3554]" htmlFor={`purchase-invoice-part-${index}`}>
                            Part
                          </label>
                          <div className="relative">
                            <select
                              {...partField}
                              className="h-13 w-full appearance-none rounded-[18px] border border-[#D8E3EE] bg-white px-4 pr-11 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10"
                              disabled={!watchedVendorId || isPartsLoading || isSubmitting || partOptions.length === 0}
                              id={`purchase-invoice-part-${index}`}
                              onChange={(event) => {
                                partField.onChange(event)
                                void trigger(fields.map((_, fieldIndex) => `items.${fieldIndex}.partId` as const))
                              }}
                            >
                              <option value="">{isPartsLoading ? 'Loading parts...' : 'Select a part'}</option>
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
                              {selectedPart.partNumber} • Current cost {formatRupees(selectedPart.costPricePerUnit)} • Retail {formatRupees(selectedPart.sellingPricePerUnit)}
                            </p>
                          ) : null}
                          {errors.items?.[index]?.partId ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.items[index]?.partId?.message}</p> : null}
                        </div>

                        <div className="rounded-[18px] border border-[#E3EAF2] bg-[#F8FBFE] px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Current Stock</p>
                          <p className="mt-3 text-[15px] font-semibold text-[#16314F]">{selectedPart ? `${selectedPart.stockQuantity} units in stock` : 'Choose a part'}</p>
                          <p className="mt-1 text-[13px] text-[#627A93]">{selectedPart ? `Min reorder ${selectedPart.minimumStockLevel} units` : 'Stock details appear here'}</p>
                        </div>

                        <div>
                          <label className="mb-2 block text-[13px] font-semibold text-[#1B3554]" htmlFor={`purchase-invoice-quantity-${index}`}>
                            Quantity
                          </label>
                          <input
                            {...register(quantityFieldName, {
                              required: {
                                value: true,
                                message: 'Quantity is required.',
                              },
                              validate: (value) => Number.parseInt(value || '0', 10) > 0 || 'Quantity must be greater than 0.',
                            })}
                            className="h-13 w-full rounded-[18px] border border-[#D8E3EE] bg-white px-4 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10"
                            disabled={isSubmitting}
                            id={`purchase-invoice-quantity-${index}`}
                            inputMode="numeric"
                            min="1"
                            step="1"
                            type="number"
                          />
                          {errors.items?.[index]?.quantity ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.items[index]?.quantity?.message}</p> : null}
                        </div>

                        <div>
                          <label className="mb-2 block text-[13px] font-semibold text-[#1B3554]" htmlFor={`purchase-invoice-cost-${index}`}>
                            Cost / Unit
                          </label>
                          <input
                            {...register(costFieldName, {
                              required: {
                                value: true,
                                message: 'Cost price is required.',
                              },
                              validate: (value) => Number.parseFloat(value || '0') > 0 || 'Cost price must be greater than 0.',
                            })}
                            className="h-13 w-full rounded-[18px] border border-[#D8E3EE] bg-white px-4 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10"
                            disabled={isSubmitting}
                            id={`purchase-invoice-cost-${index}`}
                            inputMode="decimal"
                            min="0.01"
                            step="0.01"
                            type="number"
                          />
                          {errors.items?.[index]?.costPricePerUnit ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.items[index]?.costPricePerUnit?.message}</p> : null}
                        </div>

                        <div className="rounded-[18px] border border-[#DCE7F2] bg-white px-4 py-3 shadow-[0_10px_20px_rgba(18,43,74,0.04)]">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Line Total</p>
                          <p className="mt-3 text-[18px] font-semibold text-[#123052]">
                            {formatRupees(getLineTotal(watchedItem?.quantity ?? 0, watchedItem?.costPricePerUnit ?? 0))}
                          </p>
                    
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5">
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-dashed border-[#ADC2D8] bg-[#F8FBFE] px-4 text-[14px] font-semibold text-[#1D4A77] transition hover:bg-[#F1F7FD] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!watchedVendorId || isPartsLoading || isSubmitting}
                  onClick={() => append(buildEmptyItem())}
                  type="button"
                >
                  <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                    add
                  </span>
                  Add Another Item
                </button>
              </div>
            </section>
          </section>

          <aside className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-[#DCE5EF] bg-white shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="flex items-center justify-between bg-[#123E69] px-5 py-4 text-white">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Live Preview</p>
                  <h2 className="mt-1 text-[23px] font-semibold tracking-[-0.02em] [font-family:var(--font-display)]">Invoice Summary</h2>
                </div>
                <span className="inline-flex min-h-8 items-center justify-center rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/88">
                  Draft
                </span>
              </div>

              <div className="p-5">
                <div className="rounded-3xl border border-[#DCE7F2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Selected Vendor</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{selectedVendor?.name || 'Choose a vendor'}</p>
                  <p className="mt-1 text-[13px] text-[#627A93]">
                    {watchedPurchaseDate ? `Purchase date ${formatDateLabel(watchedPurchaseDate)}` : 'Add a purchase date to continue'}
                  </p>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#FBFDFF] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Invoice Lines</p>
                    <p className="mt-3 text-[28px] font-semibold leading-none text-[#102B49] [font-family:var(--font-display)]">{summary.totalLines}</p>
                    <p className="mt-2 text-[13px] text-[#627A93]">Distinct parts on this invoice.</p>
                  </div>
                  <div className="rounded-[22px] border border-[#E3EAF2] bg-[#FBFDFF] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Units Received</p>
                    <p className="mt-3 text-[28px] font-semibold leading-none text-[#102B49] [font-family:var(--font-display)]">{summary.totalQuantity}</p>
                    <p className="mt-2 text-[13px] text-[#627A93]">Sum of quantities across all rows.</p>
                  </div>
                </div>

                <div className="mt-4 rounded-3xl border border-[#DCE7F2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Total Amount Preview</p>
                  <p className="mt-3 text-[34px] font-semibold leading-none text-[#123E69] [font-family:var(--font-display)]">{formatRupees(summary.totalAmount)}</p>
                  
                </div>
              </div>
            </section>
          </aside>
        </div>
      </form>
    </main>
  )
}

export default PurchaseInvoiceForm
