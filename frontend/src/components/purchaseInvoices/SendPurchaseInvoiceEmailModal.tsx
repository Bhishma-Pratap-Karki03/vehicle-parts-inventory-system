import ConfirmationDialog from '../parts/ConfirmationDialog'

type SendPurchaseInvoiceEmailModalProps = {
  invoiceNumber: string
  vendorName: string
  vendorEmail: string
  isEmailSent?: boolean
  emailSentAt?: null | string
  isBusy?: boolean
  onCancel: () => void
  onConfirm: () => void
}

function SendPurchaseInvoiceEmailModal({
  invoiceNumber,
  vendorName,
  vendorEmail,
  isEmailSent = false,
  emailSentAt,
  isBusy = false,
  onCancel,
  onConfirm,
}: SendPurchaseInvoiceEmailModalProps) {
  return (
    <ConfirmationDialog
      cancelLabel="Not Yet"
      confirmLabel={isEmailSent ? 'Resend Email' : 'Send Email'}
      confirmTone="primary"
      description={
        <p>
          {isEmailSent ? 'Resend' : 'Send'} the latest purchase invoice PDF for <span className="font-semibold text-[#17314F]">{invoiceNumber}</span> to{' '}
          <span className="font-semibold text-[#17314F]">{vendorEmail}</span>.
        </p>
      }
      details={
        <div className="space-y-3 text-[14px] text-[#4D6580]">
          <p><span className="font-semibold text-[#123052]">Vendor:</span> {vendorName}</p>
          <p><span className="font-semibold text-[#123052]">Invoice:</span> {invoiceNumber}</p>
          <p><span className="font-semibold text-[#123052]">Recipient:</span> {vendorEmail}</p>
          {emailSentAt ? <p><span className="font-semibold text-[#123052]">Last sent:</span> {new Date(emailSentAt).toLocaleString()}</p> : null}
        </div>
      }
      eyebrow="Email confirmation"
      icon="mail"
      isBusy={isBusy}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={isEmailSent ? 'Resend this invoice email?' : 'Send this invoice email?'}
    />
  )
}

export default SendPurchaseInvoiceEmailModal
