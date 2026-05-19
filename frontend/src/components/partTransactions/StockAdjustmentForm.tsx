import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'
import type { PartRecord } from '../../shared/interfaces/parts.interface'
import type { StockAdjustmentDirection, StockAdjustmentFormValues } from '../../shared/interfaces/partTransactions.interface'
import { formatQuantityChanged, formatRupees } from './partTransactions.helpers'

type StockAdjustmentFormProps = {
  initialValues: StockAdjustmentFormValues
  partOptions: PartRecord[]
  isOptionsLoading: boolean
  isSubmitting: boolean
  cancelHref: string
  onSubmitAdjustment: (values: StockAdjustmentFormValues) => Promise<void> | void
}

const adjustmentTypeButtonClasses: Record<StockAdjustmentDirection, string> = {
  Decrease: 'border-[#F0D3B3] bg-[#FFF7EE] text-[#A05A11] hover:bg-[#FFF2E6]',
  Increase: 'border-[#C9E7D4] bg-[#EEFCF3] text-[#16784A] hover:bg-[#E6F8EC]',
}

function StockAdjustmentForm({
  initialValues,
  partOptions,
  isOptionsLoading,
  isSubmitting,
  onSubmitAdjustment,
}: StockAdjustmentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    control,
    formState: { errors },
  } = useForm<StockAdjustmentFormValues>({
    defaultValues: initialValues,
    mode: 'onSubmit',
  })

  useEffect(() => {
    reset(initialValues)
  }, [initialValues, reset])

  const watchedPartId = useWatch({
    control,
    name: 'partId',
  })
  const watchedAdjustmentType = useWatch({
    control,
    name: 'adjustmentType',
  })
  const watchedQuantity = useWatch({
    control,
    name: 'quantity',
  })
  const watchedRemarks = useWatch({
    control,
    name: 'remarks',
  })

  const selectedPart = useMemo(
    () => partOptions.find((part) => String(part.partId) === watchedPartId),
    [partOptions, watchedPartId],
  )

  const adjustmentPreview = useMemo(() => {
    const numericQuantity = Number.parseInt(watchedQuantity || '0', 10)

    if (Number.isNaN(numericQuantity) || numericQuantity <= 0) {
      return 0
    }

    return watchedAdjustmentType === 'Increase' ? numericQuantity : numericQuantity * -1
  }, [watchedAdjustmentType, watchedQuantity])

  const resultingStock = useMemo(() => {
    if (!selectedPart) {
      return 0
    }

    return selectedPart.stockQuantity + adjustmentPreview
  }, [adjustmentPreview, selectedPart])

  useEffect(() => {
    void trigger('quantity')
  }, [selectedPart?.partId, trigger, watchedAdjustmentType])

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F7FAFD_0%,#EEF4FA_55%,#F9FBFE_100%)] text-[#102B49]">
      <form className="mx-auto w-full max-w-380 px-4 py-8 sm:px-6 lg:px-8 lg:py-10" onSubmit={handleSubmit(onSubmitAdjustment)}>
        <div className="flex flex-col gap-6 border-b border-[#DCE5EF] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">

            <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#0C2544] [font-family:var(--font-display)] sm:text-[42px]">
              Adjust Stock
            </h1>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#566E87] sm:text-[16px]">
              Apply a manual stock correction when physical counts, damaged items, or reconciliation work need to update the backend ledger.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(21,85,141,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0E487C] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting || isOptionsLoading}
              type="submit"
            >
              <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                sync_alt
              </span>
              {isSubmitting ? 'Applying Adjustment...' : 'Apply Adjustment'}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="mb-5 flex items-center gap-3 border-b border-[#E6EEF5] pb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                  <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                    inventory
                  </span>
                </span>
                <div>
                  <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Adjustment Details</h2>
                  <p className="mt-1 text-[14px] text-[#678099]">Choose a part, define whether stock goes up or down, then record the reason for the correction.</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="relative md:col-span-2">
                  <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="stock-adjustment-part">
                    Part
                  </label>
                  <div className="relative">
                    <select
                      {...register('partId', {
                        required: {
                          value: true,
                          message: 'Part is required.',
                        },
                      })}
                      className="h-13 w-full appearance-none rounded-[18px] border border-[#D8E3EE] bg-[#FBFDFF] px-4 pr-11 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:bg-white focus:ring-4 focus:ring-[#15558D]/10"
                      disabled={isOptionsLoading || isSubmitting}
                      id="stock-adjustment-part"
                    >
                      <option value="">{isOptionsLoading ? 'Loading parts...' : 'Select a part'}</option>
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
                      {selectedPart.vendorName} • {selectedPart.partNumber} • Cost {formatRupees(selectedPart.costPricePerUnit)}
                    </p>
                  ) : null}
                  {errors.partId ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.partId.message}</p> : null}
                </div>

                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Current Stock</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{selectedPart ? `${selectedPart.stockQuantity} units` : 'Choose a part'}</p>
                  <p className="mt-1 text-[13px] text-[#6F849B]">{selectedPart ? `Minimum reorder ${selectedPart.minimumStockLevel} units` : 'Stock details appear here'}</p>
                </div>

                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Cost At Record</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{selectedPart ? formatRupees(selectedPart.costPricePerUnit) : 'Choose a part'}</p>
                  <p className="mt-1 text-[13px] text-[#6F849B]">This adjustment does not change cost price.</p>
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 block text-[14px] font-semibold text-[#1B3554]">Adjustment Type</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(['Increase', 'Decrease'] as const).map((direction) => {
                    const isActive = watchedAdjustmentType === direction

                    return (
                      <button
                        className={`inline-flex min-h-13 items-center justify-center gap-2 rounded-[18px] border px-4 text-[14px] font-semibold transition ${
                          isActive
                            ? adjustmentTypeButtonClasses[direction]
                            : 'border-[#D8E3EE] bg-white text-[#35506B] hover:bg-[#F7FBFE]'
                        }`}
                        key={direction}
                        onClick={() => {
                          setValue('adjustmentType', direction, { shouldValidate: true })
                        }}
                        type="button"
                      >
                        <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                          {direction === 'Increase' ? 'add_circle' : 'remove_circle'}
                        </span>
                        {direction}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
                <div className="relative">
                  <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="stock-adjustment-quantity">
                    Quantity
                  </label>
                  <input
                    {...register('quantity', {
                      required: {
                        value: true,
                        message: 'Quantity is required.',
                      },
                      validate: (value) => {
                        const numericQuantity = Number.parseInt(value || '0', 10)

                        if (Number.isNaN(numericQuantity) || numericQuantity <= 0) {
                          return 'Quantity must be greater than 0.'
                        }

                        if (watchedAdjustmentType === 'Decrease' && selectedPart && numericQuantity > selectedPart.stockQuantity) {
                          return 'Quantity cannot reduce stock below zero.'
                        }

                        return true
                      },
                    })}
                    className="h-13 w-full rounded-[18px] border border-[#D8E3EE] bg-[#FBFDFF] px-4 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:bg-white focus:ring-4 focus:ring-[#15558D]/10"
                    disabled={isSubmitting}
                    id="stock-adjustment-quantity"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    type="number"
                  />
                  {errors.quantity ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.quantity.message}</p> : null}
                </div>

                <div className="relative">
                  <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="stock-adjustment-remarks">
                    Remarks
                  </label>
                  <textarea
                    {...register('remarks', {
                      required: {
                        value: true,
                        message: 'Remarks are required.',
                      },
                      maxLength: {
                        value: 500,
                        message: 'Remarks cannot exceed 500 characters.',
                      },
                    })}
                    className="min-h-30 w-full rounded-[18px] border border-[#D8E3EE] bg-[#FBFDFF] px-4 py-3 text-[15px] leading-7 text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:bg-white focus:ring-4 focus:ring-[#15558D]/10"
                    disabled={isSubmitting}
                    id="stock-adjustment-remarks"
                    placeholder="Explain why this stock correction is needed..."
                  />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    {errors.remarks ? <p className="text-[13px] text-[#C54141]">{errors.remarks.message}</p> : <span className="text-[13px] text-[#6F849B]">This note will be stored on the transaction record.</span>}
                    <span className="text-[12px] text-[#7A8DA3]">{watchedRemarks?.length ?? 0}/500</span>
                  </div>
                </div>
              </div>
            </section>
          </section>

          <aside className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-[#DCE5EF] bg-white shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="flex items-center justify-between bg-[#123E69] px-5 py-4 text-white">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Adjustment Preview</p>
                  <h2 className="mt-1 text-[23px] font-semibold tracking-[-0.02em] [font-family:var(--font-display)]">Stock Result</h2>
                </div>
                <span className={`inline-flex min-h-8 items-center justify-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                  watchedAdjustmentType === 'Increase'
                    ? 'border-[#C9E7D4] bg-[#EEFCF3] text-[#16784A]'
                    : 'border-[#F0D3B3] bg-[#FFF7EE] text-[#A05A11]'
                }`}>
                  {watchedAdjustmentType}
                </span>
              </div>

              <div className="space-y-4 p-5">
                <div className="rounded-[24px] border border-[#DCE7F2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Selected Part</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{selectedPart?.partName || 'Choose a part'}</p>
                  <p className="mt-1 text-[13px] text-[#627A93]">{selectedPart ? `${selectedPart.partNumber} • ${selectedPart.vendorName}` : 'Part details appear here'}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[24px] border border-[#E3EAF2] bg-[#FBFDFF] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Quantity Changed</p>
                    <p className={`mt-3 text-[28px] font-semibold leading-none [font-family:var(--font-display)] ${adjustmentPreview >= 0 ? 'text-[#16784A]' : 'text-[#A05A11]'}`}>
                      {formatQuantityChanged(adjustmentPreview)}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-[#E3EAF2] bg-[#FBFDFF] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Resulting Stock</p>
                    <p className="mt-3 text-[28px] font-semibold leading-none text-[#123E69] [font-family:var(--font-display)]">
                      {selectedPart ? `${resultingStock} units` : '—'}
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#E3EAF2] bg-[#FBFDFF] p-4 text-[14px] leading-7 text-[#4D6580]">
                  <p><span className="font-semibold text-[#123052]">Stock before:</span> {selectedPart ? `${selectedPart.stockQuantity} units` : '—'}</p>
                  <p className="mt-2"><span className="font-semibold text-[#123052]">Cost at record:</span> {selectedPart ? formatRupees(selectedPart.costPricePerUnit) : '—'}</p>
                  <p className="mt-2"><span className="font-semibold text-[#123052]">Remarks preview:</span> {watchedRemarks?.trim() ? watchedRemarks.trim() : 'Add a short explanation for the correction.'}</p>
                </div>

                {selectedPart ? (
                  <div className="flex flex-nowrap items-center gap-3">
                    <Link
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-3 py-2 text-[12px] font-medium text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                      to={`/parts/${selectedPart.partId}`}
                    >
                      <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[15px] not-italic">
                        inventory_2
                      </span>
                      View Part
                    </Link>
                    <Link
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D7E2ED] bg-white px-3 py-2 text-[12px] font-medium text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                      to={`/stock-transactions?partId=${selectedPart.partId}`}
                    >
                      <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[15px] not-italic">
                        history
                      </span>
                      View Stock History
                    </Link>
                  </div>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </form>
    </main>
  )
}

export default StockAdjustmentForm
