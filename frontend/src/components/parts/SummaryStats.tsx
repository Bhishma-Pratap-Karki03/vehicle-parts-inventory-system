import Icon from '../icons/Icon'
import type { SummaryCard } from '../../shared/interfaces/parts.interface'

type SummaryStatsProps = {
  cards: SummaryCard[]
}

const toneStyles = {
  primary: {
    card: 'border-[#D7E3F2] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FBFF_100%)]',
    iconWrap: 'bg-[#EAF3FF] text-[#15558D]',
    value: 'text-[#0D2A56]',
    detail: 'text-[#48637E]',
  },
  success: {
    card: 'border-[#D7EBD9] bg-[linear-gradient(180deg,#FFFFFF_0%,#FAFFFB_100%)]',
    iconWrap: 'bg-[#E7F8EC] text-[#119C4A]',
    value: 'text-[#103E2A]',
    detail: 'text-[#4D6F61]',
  },
  warning: {
    card: 'border-[#F1D1BF] bg-[linear-gradient(180deg,#FFFDFC_0%,#FFF6F1_100%)]',
    iconWrap: 'bg-[#FFF1E8] text-[#9A3E0B]',
    value: 'text-[#7C2E00]',
    detail: 'text-[#8D4B1D]',
  },
  danger: {
    card: 'border-[#F2D2CF] bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF7F6_100%)]',
    iconWrap: 'bg-[#FFECEA] text-[#D20C12]',
    value: 'text-[#A32426]',
    detail: 'text-[#75545B]',
  },
}

function SummaryStats({ cards }: SummaryStatsProps) {
  return (
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:mb-10 xl:grid-cols-4" aria-label="Inventory summary">
      {cards.map((card) => {
        const tone = toneStyles[card.tone]

        return (
          <article
            className={`rounded-3xl border p-5 shadow-[0_18px_40px_rgba(23,48,83,0.06)] ${tone.card}`}
            key={card.label}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607389]">{card.label}</span>
                <strong className={`block text-[30px] font-semibold leading-none ${tone.value} [font-family:var(--font-display)]`}>{card.value}</strong>
              </div>
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${tone.iconWrap}`}>
                <Icon name={card.icon} className="text-[24px]" />
              </span>
            </div>
            <p className={`max-w-[22ch] text-[14px] leading-6 ${tone.detail}`}>{card.detail}</p>
          </article>
        )
      })}
    </section>
  )
}

export default SummaryStats
