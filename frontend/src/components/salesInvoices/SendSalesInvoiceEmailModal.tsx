import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { SalesInvoiceEmailFormValues } from '../../shared/interfaces/salesInvoices.interface'

type SendSalesInvoiceEmailModalProps = {
  invoiceNumber: string
  customerName: string
  customerEmail: string
  isBusy?: boolean
  onCancel: () => void
  onConfirm: (values: SalesInvoiceEmailFormValues) => Promise<void> | void
}

function SendSalesInvoiceEmailModal({
  invoiceNumber,
  customerName,
  customerEmail,
  isBusy = false,
  onCancel,
  onConfirm,
}: SendSalesInvoiceEmailModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SalesInvoiceEmailFormValues>({
    defaultValues: {
      message: '',
      toEmail: customerEmail || '',
    },
    mode: 'onSubmit',
  })

  useEffect(() => {
    reset({
      message: '',
      toEmail: customerEmail || '',
    })
  }, [customerEmail, reset])

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
              outgoing_mail
            </span>
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A8DA3]">Email invoice</p>
            <h2 className="mt-2 text-[24px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#102B49] [font-family:var(--font-display)] sm:text-[32px]">
              Send this sales invoice?
            </h2>
          </div>
        </div>

        <p className="mt-5 text-[15px] leading-7 text-[#556E88] sm:text-[16px]">
          Send invoice <span className="font-semibold text-[#17314F]">{invoiceNumber}</span> for{' '}
          <span className="font-semibold text-[#17314F]">{customerName}</span>. Leave the recipient email empty if you want the saved customer email on record to be used automatically.
        </p>

        <div className="mt-6 rounded-3xl border border-[#E3EAF2] bg-[#F8FBFE] p-5">
          <form className="space-y-4" onSubmit={handleSubmit(onConfirm)}>
            <div>
              <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="sales-invoice-email-to">
                Recipient Email
              </label>
              <input
                {...register('toEmail', {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Recipient email must be valid.',
                  },
                })}
                className="h-12 w-full rounded-[18px] border border-[#D8E3EE] bg-white px-4 text-[15px] text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10"
                disabled={isBusy}
                id="sales-invoice-email-to"
                placeholder={customerEmail || 'Leave empty to use the customer email on record'}
                type="email"
              />
              {errors.toEmail ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.toEmail.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-[#1B3554]" htmlFor="sales-invoice-email-message">
                Message
              </label>
              <textarea
                {...register('message', {
                  maxLength: {
                    value: 500,
                    message: 'Message must be 500 characters or fewer.',
                  },
                })}
                className="min-h-32 w-full rounded-[20px] border border-[#D8E3EE] bg-white px-4 py-3 text-[15px] leading-7 text-[#17314F] outline-none transition focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10"
                disabled={isBusy}
                id="sales-invoice-email-message"
                placeholder="Add an optional note for the customer..."
              />
              {errors.message ? <p className="mt-2 text-[13px] text-[#C54141]">{errors.message.message}</p> : null}
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
                {isBusy ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SendSalesInvoiceEmailModal
