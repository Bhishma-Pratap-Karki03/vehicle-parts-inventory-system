import { useEffect, type ReactNode } from 'react'

type DialogIcon = 'delete' | 'image' | 'mail' | 'warning'

type ConfirmationDialogProps = {
  eyebrow: string
  title: string
  description: ReactNode
  details?: ReactNode
  confirmLabel: string
  cancelLabel?: string
  confirmTone?: 'danger' | 'primary'
  icon?: DialogIcon
  isBusy?: boolean
  onCancel: () => void
  onConfirm: () => void
}

const confirmToneClasses: Record<NonNullable<ConfirmationDialogProps['confirmTone']>, string> = {
  danger: 'bg-[#B84C45] text-white shadow-[0_14px_30px_rgba(184,76,69,0.2)] hover:bg-[#A23F39]',
  primary: 'bg-[#15558D] text-white shadow-[0_14px_30px_rgba(21,85,141,0.2)] hover:bg-[#0E487C]',
}

const iconToneClasses: Record<DialogIcon, string> = {
  delete: 'bg-[#FFF1E8] text-[#9A3E0B]',
  image: 'bg-[#FFF1E8] text-[#9A3E0B]',
  mail: 'bg-[#EEF5FC] text-[#15558D]',
  warning: 'bg-[#FFF1E8] text-[#9A3E0B]',
}

function ConfirmationDialog({
  eyebrow,
  title,
  description,
  details,
  confirmLabel,
  cancelLabel = 'Cancel',
  confirmTone = 'danger',
  icon = 'warning',
  isBusy = false,
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) {
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
          <span className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] ${iconToneClasses[icon]}`}>
            <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[24px] not-italic">
              {icon}
            </span>
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A8DA3]">{eyebrow}</p>
            <h2 className="mt-2 text-[24px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#102B49] [font-family:var(--font-display)] sm:text-[32px]">
              {title}
            </h2>
          </div>
        </div>

        <div className="mt-5 text-[15px] leading-7 text-[#556E88] sm:text-[16px]">{description}</div>

        {details ? (
          <div className="mt-6 rounded-3xl border border-[#E3EAF2] bg-[#F8FBFE] p-5">
            {details}
          </div>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#CAD7E5] bg-white px-5 text-[14px] font-semibold text-[#294765] transition hover:bg-[#F7FBFE] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isBusy}
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 text-[14px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${confirmToneClasses[confirmTone]}`}
            disabled={isBusy}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog
