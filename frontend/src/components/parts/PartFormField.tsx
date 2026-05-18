import type { ReactNode } from 'react'

type PartFormFieldProps = {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}

function PartFormField({ label, required = false, error, hint, children }: PartFormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-[15px] font-medium text-[#17324F]">
        {label}
        {required ? <span className="ml-1 text-[#D25B5B]">*</span> : null}
      </span>

      {children}

      {error ? <p className="mt-2 text-[12px] font-medium text-[#C34F4F]">{error}</p> : null}
      {!error && hint ? <p className="mt-2 text-[12px] text-[#7990A7]">{hint}</p> : null}
    </label>
  )
}

export default PartFormField
