import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { SalesInvoicePaymentFormValues } from '../../shared/interfaces/salesInvoices.interface'
import {
  createDefaultSalesInvoicePaymentValues,
  formatRupees,
} from './salesInvoices.helpers'

type AddSalesInvoicePaymentModalProps = {
  invoiceNumber: string
  remainingAmount: number
  isBusy?: boolean
  onCancel: () => void
  onConfirm: (values: SalesInvoicePaymentFormValues) => Promise<void> | void
}

function AddSalesInvoicePaymentModal({
  invoiceNumber,
  remainingAmount,
  isBusy = false,
  onCancel,
  onConfirm,
}: AddSalesInvoicePaymentModalProps) {
  const defaultValues = createDefaultSalesInvoicePaymentValues(remainingAmount)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SalesInvoicePaymentFormValues>({
    defaultValues,
    mode: 'onSubmit',
  })

  useEffect(() => {
    reset(createDefaultSalesInvoicePaymentValues(remainingAmount))
  }, [remainingAmount, reset])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isBusy) {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isBusy, onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1B31]/50 px-4 py-8 backdrop-blur-[3px]"
      onClick={() => {
        if (!isBusy) {
          onCancel()
        }
      }}
      role="presentation"
    >
      <div
        aria-modal="true"
        className="w-full max-w-145 rounded-[30px] border border-[#DCE5EF] bg-white p-6 shadow-[0_28px_70px_rgba(8,25,48,0.22)] sm:p-7"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-center gap-4">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-[#EEF5FC] text-[#15558D]">
            <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[24px] not-italic">
              payments
            </span>
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A8DA3]">Record payment</p>
            <h2 className="mt-2 text-[24px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#102B49] [font-family:var(--font-display)] sm:text-[32px]">
              Add a payment to this invoice
            </h2>
          </div>
        </div>

        <p className="mt-5 text-[15px] leading-7 text-[#556E88] sm:text-[16px]">
          Record a follow-up payment for invoice <span className="font-semibold text-[#17314F]">{invoiceNumber}</span>. The remaining due right now is{' '}
          <span className="font-semibold text-[#17314F]">{formatRupees(remainingAmount)}</span>.
        </p>

        <div className="mt-6 rounded-3xl border border-[#E3EAF2] bg-[#F8FBFE] p-5">
          <form className="space-y-4" onSubmit={handleSubmit(onConfirm)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="sales-invoice-payment-amount">
                  Amount
                </label>
                <input
                  {...register('amount', {
                    required: 'Payment amount is required.',
                    validate: (value) => {
                      const amount = Number.parseFloat(value || '0')

                      if (Number.isNaN(amount) || amount <= 0) {
                        return 'Payment amount must be greater than zero.'
                      }

                      if (amount > remainingAmount) {
                        return 'Payment amount cannot exceed the remaining due.'
                      }

                      return true
                    },
                  })}
                  className="h-12 w-full rounded-[18px] border border-[#D8E3EE] bg-white px-4 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10"
                  disabled={isBusy}
                  id="sales-invoice-payment-amount"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                />
                {errors.amount ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.amount.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="sales-invoice-payment-date">
                  Payment Date
                </label>
                <input
                  {...register('paymentDate', {
                    required: 'Payment date is required.',
                  })}
                  className="h-12 w-full rounded-[18px] border border-[#D8E3EE] bg-white px-4 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10"
                  disabled={isBusy}
                  id="sales-invoice-payment-date"
                  type="date"
                />
                {errors.paymentDate ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.paymentDate.message}</p> : null}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="sales-invoice-payment-method">
                Payment Method
              </label>
              <select
                {...register('paymentMethod', {
                  required: 'Payment method is required.',
                })}
                className="h-12 w-full rounded-[18px] border border-[#D8E3EE] bg-white px-4 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10"
                disabled={isBusy}
                id="sales-invoice-payment-method"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Online Transfer">Online Transfer</option>
                <option value="Credit">Credit</option>
              </select>
              {errors.paymentMethod ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.paymentMethod.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="sales-invoice-payment-remarks">
                Remarks
              </label>
              <textarea
                {...register('remarks', {
                  maxLength: {
                    value: 250,
                    message: 'Remarks must be 250 characters or fewer.',
                  },
                })}
                className="min-h-28 w-full rounded-[20px] border border-[#D8E3EE] bg-white px-4 py-3 text-[15px] leading-7 text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10"
                disabled={isBusy}
                id="sales-invoice-payment-remarks"
                placeholder="Add an optional note about this payment..."
              />
              {errors.remarks ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.remarks.message}</p> : null}
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#CAD7E5] bg-white px-5 text-[14px] font-semibold text-[#294765] transition hover:bg-[#F7FBFE] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isBusy}
                onClick={onCancel}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(21,85,141,0.2)] transition hover:bg-[#0E487C] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isBusy}
                type="submit"
              >
                {isBusy ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddSalesInvoicePaymentModal
