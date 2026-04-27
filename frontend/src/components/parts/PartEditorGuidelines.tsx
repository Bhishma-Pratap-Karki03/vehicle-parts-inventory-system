import Icon from '../icons/Icon'
import type { IconName } from '../icons/Icon'

type PartEditorGuidelinesProps = {
  guidelines: string[]
}

const guidelineIcons: IconName[] = ['checkCircle', 'warning', 'image']

function PartEditorGuidelines({ guidelines }: PartEditorGuidelinesProps) {
  return (
    <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-5 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
      <h2 className="text-[23px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Quick Guidelines</h2>

      <div className="mt-5 space-y-4">
        {guidelines.map((guideline, index) => {
          const iconName = guidelineIcons[index] ?? 'checkCircle'

          return (
            <div className="flex gap-3" key={guideline}>
              <span
                className={`mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl ${
                  iconName === 'warning' ? 'bg-[#FFF3EB] text-[#9A3E0B]' : 'bg-[#EEF5FC] text-[#15558D]'
                }`}
              >
                <Icon name={iconName} className="text-[18px]" />
              </span>
              <p className="text-[15px] leading-7 text-[#4A6280]">{guideline}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default PartEditorGuidelines
