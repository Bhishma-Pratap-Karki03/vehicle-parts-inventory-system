import { Link } from 'react-router-dom'
import type { PartTransactionRecord, PartTransactionTypeLabel } from '../../shared/interfaces/partTransactions.interface'
import { formatDateLabel, formatQuantityChanged, formatRupees } from './partTransactions.helpers'

type PartTransactionsTableProps = {
  transactions: PartTransactionRecord[]
  isLoading: boolean
  errorMessage?: null | string
}

const typeClasses: Record<PartTransactionTypeLabel, string> = {
  Adjustment: 'border border-[#F0D3B3] bg-[#FFF7EE] text-[#A05A11]',
  Purchase: 'border border-[#C9E7D4] bg-[#EEFCF3] text-[#16784A]',
}

function TransactionTypePill({ type }: { type: PartTransactionTypeLabel }) {
  return (
    <span className={`inline-flex min-h-8 items-center justify-center rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] ${typeClasses[type]}`}>
      {type}
    </span>
  )
}

function QuantityChange({ quantityChanged }: { quantityChanged: number }) {
  const tone = quantityChanged >= 0 ? 'text-[#16784A]' : 'text-[#A05A11]'

  return <span className={`text-[16px] font-semibold ${tone}`}>{formatQuantityChanged(quantityChanged)} units</span>
}

function LoadingIndicator() {
  return (
    <div className="flex min-h-80 items-center justify-center px-6 py-10" role="status" aria-live="polite">
      <span className="sr-only">Loading transactions</span>
      <span
        aria-hidden
        className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[#DDE7F2] border-t-[#15558D]"
      />
    </div>
  )
}

function LoadingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/55 px-6 py-10 backdrop-blur-[1px]">
      <div className="inline-flex h-11 w-11 animate-spin rounded-full border-4 border-[#DDE7F2] border-t-[#15558D]" aria-hidden />
      <span className="sr-only">Loading transactions</span>
    </div>
  )
}

function TableState({ message, tone = 'default' }: { message: string; tone?: 'default' | 'error' }) {
  return (
    <div className={`flex min-h-80 items-center justify-center px-6 py-10 text-center ${tone === 'error' ? 'text-[#A94E48]' : 'text-[#60758E]'}`}>
      <div className="max-w-md">
        <p className="text-[18px] font-semibold text-[#123052]">{tone === 'error' ? 'Unable to load transactions' : 'No transactions to show yet'}</p>
        <p className="mt-2 text-[15px] leading-7">{message}</p>
      </div>
    </div>
  )
}

function MobileTransactionCard({ transaction }: { transaction: PartTransactionRecord }) {
  return (
    <article className="rounded-[22px] border border-[#E5EDF4] bg-white p-4 shadow-[0_10px_24px_rgba(20,43,74,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Part</p>
          <h3 className="mt-1 text-[18px] font-semibold text-[#112B49]">{transaction.partName}</h3>
          <p className="mt-1 text-[14px] text-[#58708A]">{transaction.partNumber}</p>
        </div>
        <TransactionTypePill type={transaction.transactionType} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Quantity Change</p>
          <div className="mt-1">
            <QuantityChange quantityChanged={transaction.quantityChanged} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Stock Flow</p>
          <p className="mt-1 text-[15px] font-medium text-[#203852]">{transaction.stockBefore} to {transaction.stockAfter}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Reference</p>
          {transaction.purchaseInvoiceId && transaction.purchaseInvoiceNumber ? (
            <Link className="mt-1 inline-flex text-[15px] font-semibold text-[#123E69] no-underline hover:underline" to={`/purchase-invoices/${transaction.purchaseInvoiceId}`}>
              {transaction.purchaseInvoiceNumber}
            </Link>
          ) : (
            <p className="mt-1 text-[14px] text-[#58708A]">{transaction.remarks || 'Manual stock adjustment'}</p>
          )}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Created</p>
          <p className="mt-1 text-[14px] text-[#58708A]">{formatDateLabel(transaction.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-[13px] text-[#627A93]">
          Cost at transaction: <span className="font-semibold text-[#16314F]">{formatRupees(transaction.costPricePerUnit)}</span>
        </div>
        <Link
          className="inline-flex h-9 min-w-23 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#D7E2ED] bg-white px-4 text-[12px] font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
          to={`/stock-transactions/${transaction.partTransactionId}`}
        >
          <span aria-hidden className="material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none text-[18px] not-italic">
            visibility
          </span>
          View
        </Link>
      </div>
    </article>
  )
}

function PartTransactionsTable({ transactions, isLoading, errorMessage }: PartTransactionsTableProps) {
  if (isLoading && transactions.length === 0) {
    return <LoadingIndicator />
  }

  if (errorMessage) {
    return <TableState message={errorMessage} tone="error" />
  }

  if (transactions.length === 0) {
    return <TableState message="Try broadening your filters or create a stock adjustment to start the history." />
  }

  return (
    <div className="relative">
      {isLoading ? <LoadingOverlay /> : null}

      <div className="space-y-4 p-4 lg:hidden">
        {transactions.map((transaction) => (
          <MobileTransactionCard key={transaction.partTransactionId} transaction={transaction} />
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-7xl border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E2EAF2] bg-[#F7FAFC]">
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Part</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Type</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Quantity Change</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Stock Flow</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Cost / Unit</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Reference</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Created At</th>
              <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7D8F]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr className="border-b border-[#EDF2F7] bg-white transition hover:bg-[#FBFDFF]" key={transaction.partTransactionId}>
                <td className="px-6 py-5 align-middle">
                  <Link className="text-[16px] font-semibold text-[#123E69] no-underline hover:underline" to={`/parts/${transaction.partId}`}>
                    {transaction.partName}
                  </Link>
                  <p className="mt-1 text-[13px] text-[#58708A]">{transaction.partNumber}</p>
                </td>
                <td className="px-6 py-5 align-middle">
                  <TransactionTypePill type={transaction.transactionType} />
                </td>
                <td className="px-6 py-5 align-middle">
                  <QuantityChange quantityChanged={transaction.quantityChanged} />
                </td>
                <td className="px-6 py-5 align-middle text-[14px] font-medium text-[#203852]">
                  {transaction.stockBefore} to {transaction.stockAfter}
                </td>
                <td className="px-6 py-5 align-middle text-[14px] text-[#203852]">
                  {formatRupees(transaction.costPricePerUnit)}
                </td>
                <td className="px-6 py-5 align-middle">
                  {transaction.purchaseInvoiceId && transaction.purchaseInvoiceNumber ? (
                    <Link className="text-[14px] font-semibold text-[#123E69] no-underline hover:underline" to={`/purchase-invoices/${transaction.purchaseInvoiceId}`}>
                      {transaction.purchaseInvoiceNumber}
                    </Link>
                  ) : (
                    <p className="max-w-52 text-[14px] leading-6 text-[#58708A]">{transaction.remarks || 'Manual stock adjustment'}</p>
                  )}
                </td>
                <td className="px-6 py-5 align-middle text-[13px] text-[#405470]">
                  {formatDateLabel(transaction.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td className="px-6 py-5 align-middle">
                  <div className="flex justify-end">
                    <Link
                      className="inline-flex h-9 min-w-23 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#D7E2ED] bg-white px-4 text-[12px] font-semibold text-[#2E4C70] no-underline transition hover:bg-[#F7FBFE]"
                      to={`/stock-transactions/${transaction.partTransactionId}`}
                    >
                      <span aria-hidden className="material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none text-[18px] not-italic">
                        visibility
                      </span>
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PartTransactionsTable
