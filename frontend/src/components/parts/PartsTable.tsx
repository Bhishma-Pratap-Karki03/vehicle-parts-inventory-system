import { Link } from 'react-router-dom'
import type { PartDisplayStatus, PartRecord } from '../../shared/interfaces/parts.interface'
import { formatPartCode, getPartDisplayStatus } from './parts.helpers'

type PartsTableProps = {
  parts: PartRecord[]
  isLoading: boolean
  errorMessage?: string | null
  deletingPartId?: null | number
  onDeletePart: (part: PartRecord) => void
}

const statusClasses: Record<PartDisplayStatus, string> = {
  Available: 'border border-[#C9E7D4] bg-[#EEFCF3] text-[#16784A]',
  Deleted: 'border border-[#DADFE7] bg-[#F4F7FA] text-[#5B6D80]',
  'Low Stock': 'border border-[#F0C7AF] bg-[#FFF3EB] text-[#9A3E0B]',
  Discontinued: 'border border-[#F0C4C4] bg-[#FFF1F1] text-[#C54141]',
  Unavailable: 'border border-[#D9E3EE] bg-[#F4F7FA] text-[#516579]',
}

const stockBarClasses: Record<PartDisplayStatus, string> = {
  Available: 'bg-[#2AA364]',
  Deleted: 'bg-[#93A3B5]',
  'Low Stock': 'bg-[#D27A2A]',
  Discontinued: 'bg-[#D06060]',
  Unavailable: 'bg-[#8D9BAB]',
}

const actionButtons = [
  {
    icon: 'visibility' as const,
    label: 'View',
    className: 'border-[#D8E3EF] bg-white text-[#5A7190] hover:bg-[#F5F8FC] hover:text-[#2E4C70]',
  },
  {
    icon: 'edit' as const,
    label: 'Edit',
    className: 'border-[#D8E3EF] bg-white text-[#627893] hover:bg-[#F5F8FC] hover:text-[#324B67]',
  },
  {
    icon: 'delete' as const,
    label: 'Delete',
    className: 'border-[#EFD8D4] bg-[#FFF8F7] text-[#C1776C] hover:bg-[#FFF0EE] hover:text-[#AE5A4E]',
  },
]

function getStockFill(part: PartRecord) {
  const ratio = part.minimumStockLevel === 0 ? 0 : part.stockQuantity / part.minimumStockLevel
  return Math.max(10, Math.min(ratio * 55, 100))
}

function CategoryPill({ category }: { category: null | string }) {
  return (
    <span className="inline-flex min-h-9 max-w-27.5 items-center justify-center rounded-[18px] border border-[#DCE6F1] bg-[#F7FAFD] px-3 py-1.5 text-center text-[12px] font-medium leading-4 text-[#36516D]">
      {category || 'Uncategorized'}
    </span>
  )
}

function ActionStrip({
  part,
  deletingPartId,
  onDeletePart,
}: {
  part: PartRecord
  deletingPartId?: null | number
  onDeletePart: (part: PartRecord) => void
}) {
  if (part.isDeleted) {
    return (
      <span className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#DCE5EF] bg-[#F8FAFC] px-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7D8F]">
        Deleted record
      </span>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E7EEF5] bg-[#FCFDFE] p-1.5 shadow-[0_8px_18px_rgba(20,43,74,0.035)]">
      {actionButtons.map((action) => {
        if (action.label === 'Delete') {
          return (
            <button
              aria-label={action.label}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${action.className}`}
              disabled={deletingPartId === part.partId}
              key={action.label}
              onClick={() => onDeletePart(part)}
              title={deletingPartId === part.partId ? 'Deleting...' : action.label}
              type="button"
            >
              <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[16px] not-italic">
                {action.icon}
              </span>
            </button>
          )
        }

        return (
          <Link
            aria-label={action.label}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${action.className}`}
            key={action.label}
            title={action.label}
            to={action.label === 'View' ? `/parts/${part.partId}` : `/parts/${part.partId}/edit`}
          >
            <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[16px] not-italic">
              {action.icon}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

function StockHealth({ part }: { part: PartRecord }) {
  const displayStatus = getPartDisplayStatus(part)

  return (
    <div className="max-w-47.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[17px] font-semibold text-[#132C49]">{part.stockQuantity} units</span>
        <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#8192A3]">Min {part.minimumStockLevel}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[#E8EEF5]">
        <div className={`h-2 rounded-full ${stockBarClasses[displayStatus]}`} style={{ width: `${getStockFill(part)}%` }} />
      </div>
    </div>
  )
}

function PartStatusPill({ status }: { status: PartDisplayStatus }) {
  return (
    <span
      className={`inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] ${statusClasses[status]}`}
    >
      {status}
    </span>
  )
}

function MobilePartCard({
  part,
  deletingPartId,
  onDeletePart,
}: {
  part: PartRecord
  deletingPartId?: null | number
  onDeletePart: (part: PartRecord) => void
}) {
  const displayStatus = getPartDisplayStatus(part)
  const cardClasses =
    displayStatus === 'Low Stock'
      ? 'border-[#F0C7AF] bg-[#FFF9F5]'
      : displayStatus === 'Deleted'
        ? 'border-[#DCE5EF] bg-[#F8FAFC]'
        : 'border-[#E5EDF4] bg-white'

  return (
    <article className={`rounded-[22px] border p-4 shadow-[0_10px_24px_rgba(20,43,74,0.05)] ${cardClasses}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FA] text-[11px] font-semibold text-[#2B4A67]">
            {String(part.partId).padStart(4, '0')}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[17px] font-semibold text-[#112B49]" title={part.partName}>
                {part.partName}
              </h3>
              {displayStatus === 'Low Stock' ? (
                <span
                  aria-label="Low stock"
                  className="material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none text-[18px] text-[#9A3E0B] not-italic"
                  role="img"
                >
                  warning
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[13px] text-[#58708A]">{part.partNumber}</p>
          </div>
        </div>
        <PartStatusPill status={displayStatus} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Supplier</p>
          <p className="mt-1 text-[15px] font-medium text-[#203852]">{part.vendorName}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Category</p>
          <div className="mt-1">
            <CategoryPill category={part.category} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Stock health</p>
        <StockHealth part={part} />
      </div>

      <div className="mt-4 flex justify-end">
        <ActionStrip deletingPartId={deletingPartId} onDeletePart={onDeletePart} part={part} />
      </div>
    </article>
  )
}

function TableState({ message, tone = 'default' }: { message: string; tone?: 'default' | 'error' }) {
  return (
    <div className={`flex min-h-80 items-center justify-center px-6 py-10 text-center ${tone === 'error' ? 'text-[#A94E48]' : 'text-[#60758E]'}`}>
      <div className="max-w-md">
        <p className="text-[18px] font-semibold text-[#123052]">{tone === 'error' ? 'Unable to load parts' : 'No parts to show yet'}</p>
        <p className="mt-2 text-[15px] leading-7">{message}</p>
      </div>
    </div>
  )
}

function PartsTable({ parts, isLoading, errorMessage, deletingPartId, onDeletePart }: PartsTableProps) {
  if (isLoading) {
    return <TableState message="Loading live inventory data from the backend..." />
  }

  if (errorMessage) {
    return <TableState message={errorMessage} tone="error" />
  }

  if (parts.length === 0) {
    return <TableState message="Try broadening your filters or add a new part to populate the table." />
  }

  return (
    <>
      <div className="space-y-4 p-4 lg:hidden">
        {parts.map((part) => (
          <MobilePartCard deletingPartId={deletingPartId} key={part.partId} onDeletePart={onDeletePart} part={part} />
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-270 border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E2EAF2] bg-[#F7FAFC]">
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Part</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Supplier</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Category</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Stock health</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Status</th>
              <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part) => {
              const displayStatus = getPartDisplayStatus(part)

              return (
                <tr
                  className={`border-b border-[#EDF2F7] transition hover:bg-[#FBFDFF] ${
                    displayStatus === 'Low Stock'
                      ? 'bg-[#FFF9F5]'
                      : displayStatus === 'Deleted'
                        ? 'bg-[#F8FAFC]'
                        : 'bg-white'
                  }`}
                  key={part.partId}
                >
                  <td className="px-6 py-5 align-middle">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex min-h-11.5 min-w-11.5 items-center justify-center rounded-2xl bg-[#EEF4FA] text-[11px] font-semibold text-[#2B4A67]">
                        {String(part.partId).padStart(4, '0')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[16px] font-semibold text-[#112B49]" title={part.partName}>
                            {part.partName}
                          </span>
                          {displayStatus === 'Low Stock' ? (
                            <span
                              aria-label="Low stock"
                              className="material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none text-[18px] text-[#9A3E0B] not-italic"
                              role="img"
                            >
                              warning
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[13px] text-[#58708A]">{part.partNumber}</p>
                        <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.14em] text-[#7D8EA1]">{formatPartCode(part.partId)}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 align-middle">
                    <div className="text-[15px] font-medium text-[#203852]">{part.vendorName}</div>
                    <p className="mt-1 text-[13px] text-[#708397]">Vendor ID {part.vendorId}</p>
                  </td>

                  <td className="px-6 py-5 align-middle">
                    <CategoryPill category={part.category} />
                  </td>

                  <td className="px-6 py-5 align-middle">
                    <StockHealth part={part} />
                  </td>

                  <td className="px-6 py-5 align-middle">
                    <PartStatusPill status={displayStatus} />
                  </td>

                  <td className="px-6 py-5 align-middle">
                    <div className="flex justify-end">
                      <ActionStrip deletingPartId={deletingPartId} onDeletePart={onDeletePart} part={part} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default PartsTable
