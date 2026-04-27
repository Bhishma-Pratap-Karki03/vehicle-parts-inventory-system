import type { ReactNode } from 'react'
import Icon from '../icons/Icon'
import type { IconName } from '../icons/Icon'

type PartFormSectionProps = {
  icon: IconName
  title: string
  description?: string
  children: ReactNode
}

function PartFormSection({ icon, title, description, children }: PartFormSectionProps) {
  return (
    <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-5 shadow-[0_20px_48px_rgba(18,43,74,0.07)] sm:p-6">
      <div className="flex flex-col gap-3 border-b border-[#E6EEF5] pb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
            <Icon name={icon} className="text-[20px]" />
          </span>
          <div>
            <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">{title}</h2>
            {description ? <p className="mt-1 text-[14px] text-[#678099]">{description}</p> : null}
          </div>
        </div>
      </div>

      <div className="pt-5">{children}</div>
    </section>
  )
}

export default PartFormSection
