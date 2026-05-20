import type { PartRecord } from '../../shared/interfaces/parts.interface'
import ConfirmationDialog from './ConfirmationDialog'

type DeletePartModalProps = {
  part: PartRecord
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function DeletePartModal({ part, isDeleting, onCancel, onConfirm }: DeletePartModalProps) {
  return (
    <ConfirmationDialog
      confirmLabel={isDeleting ? 'Deleting Part...' : 'Delete Part'}
      description={(
        <>
          <span className="font-semibold text-[#123052]">{part.partName}</span> will be removed from the active inventory view only if it has no remaining stock and no purchase, sales, or stock-history records. You can still bring it back into view later with the
          <span className="font-semibold text-[#123052]"> Include deleted parts </span>
          filter.
        </>
      )}
      details={(
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Selected record</p>
          <div className="mt-4 grid gap-3 text-[14px] text-[#4D6580] sm:grid-cols-2">
            <div className="rounded-[18px] border border-[#E3EAF2] bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#70849A]">Part number</p>
              <p className="mt-1 font-semibold text-[#123052]">{part.partNumber}</p>
            </div>
            <div className="rounded-[18px] border border-[#E3EAF2] bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#70849A]">Vendor</p>
              <p className="mt-1 font-semibold text-[#123052]">{part.vendorName}</p>
            </div>
          </div>
        </>
      )}
      eyebrow="Delete confirmation"
      icon="delete"
      isBusy={isDeleting}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title="Delete this part?"
    />
  )
}

export default DeletePartModal
