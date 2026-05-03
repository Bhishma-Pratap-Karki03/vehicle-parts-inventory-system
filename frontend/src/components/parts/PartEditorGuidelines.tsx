type PartEditorGuidelinesProps = {
  guidelines: string[]
}

type GuidelineIcon = 'check_circle' | 'image' | 'warning'

const guidelineIcons: GuidelineIcon[] = ['check_circle', 'warning', 'image']

function PartEditorGuidelines({ guidelines }: PartEditorGuidelinesProps) {
  return (
    <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-5 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
      <h2 className="text-[23px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Quick Guidelines</h2>

      <div className="mt-5 space-y-4">
        {guidelines.map((guideline, index) => {
          const iconName = guidelineIcons[index] ?? 'check_circle'

          return (
            <div className="flex gap-3" key={guideline}>
              <span
                className={`mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl ${
                  iconName === 'warning' ? 'bg-[#FFF3EB] text-[#9A3E0B]' : 'bg-[#EEF5FC] text-[#15558D]'
                }`}
              >
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                  {iconName}
                </span>
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
