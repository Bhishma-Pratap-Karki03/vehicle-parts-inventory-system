import { Link } from 'react-router-dom'
import Icon from '../icons/Icon'
import type { LowStockAlert } from '../../shared/interfaces/parts.interface'

type PartsSidebarProps = {
  alerts: LowStockAlert[]
  guidelines: string[]
  isLoading?: boolean
  onReviewAllAlerts: () => void
}

function PartsSidebar({ alerts, guidelines, isLoading = false, onReviewAllAlerts }: PartsSidebarProps) {
  return (
    <aside className="grid gap-6 lg:grid-cols-2 xl:block xl:space-y-6" aria-label="Parts insights">
      <section className="rounded-[24px] border border-[#DCE5EF] bg-white p-5 shadow-[0_18px_36px_rgba(18,43,74,0.07)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Watchlist</p>
            <h2 className="text-[19px] font-semibold text-[#102B49] [font-family:var(--font-display)]">Low stock alerts</h2>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#9A3E0B]">
            <Icon name="bell" className="text-[22px]" />
          </span>
        </div>

        {isLoading ? (
          <p className="rounded-[18px] border border-[#E5EDF4] bg-[#FAFCFE] p-4 text-[14px] leading-6 text-[#60758E]">
            Pulling low-stock items from the backend...
          </p>
        ) : alerts.length === 0 ? (
          <p className="rounded-[18px] border border-[#E5EDF4] bg-[#FAFCFE] p-4 text-[14px] leading-6 text-[#60758E]">
            No low-stock alerts are coming back from the backend right now.
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div className="rounded-[18px] border border-[#E5EDF4] bg-[#FAFCFE] p-4" key={alert.partId}>
                <strong className="block text-[15px] font-semibold text-[#183350]">{alert.partName}</strong>
                <p className="mt-1 text-[13px] text-[#6F8397]">{alert.partNumber}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-[13px] text-[#7B5936]">Only {alert.quantity} units left</span>
                  <Link
                    className="inline-flex min-h-8 items-center justify-center rounded-full bg-[#EEF4FA] px-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#154A79] no-underline transition hover:bg-[#E4EEF8]"
                    to={`/parts/${alert.partId}`}
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-dashed border-[#BFD0E2] bg-[#F8FBFE] px-4 text-[14px] font-semibold text-[#154A79] transition hover:bg-[#EEF5FC]"
          onClick={onReviewAllAlerts}
          type="button"
        >
          Review all low-stock items
        </button>
      </section>

      <section className="rounded-[24px] border border-[#DCE5EF] bg-white p-5 shadow-[0_18px_36px_rgba(18,43,74,0.07)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7D8F]">Playbook</p>
            <h2 className="text-[19px] font-semibold text-[#102B49] [font-family:var(--font-display)]">Inventory guidelines</h2>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF4FA] text-[#35506B]">
            <Icon name="book" className="text-[22px]" />
          </span>
        </div>

        <ul className="space-y-4">
          {guidelines.map((guideline) => (
            <li className="flex items-start gap-3 text-[14px] leading-6 text-[#52677F]" key={guideline}>
              <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ECFAF1] text-[#1D8F56]">
                <Icon name="check" className="text-[16px]" />
              </span>
              <span>{guideline}</span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}

export default PartsSidebar
