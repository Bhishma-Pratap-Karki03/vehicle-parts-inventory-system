import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiRequest } from '../../shared/utils/api'
import NotFoundPage from '../NotFoundPage'
import {
  formatDateLabel,
  formatQuantityChanged,
  formatRupees,
  getApiErrorMessage,
  getRequestErrorMessage,
  mapPartTransactionFromApi,
} from '../../components/partTransactions/partTransactions.helpers'
import type { PartTransactionApiModel, PartTransactionRecord, PartTransactionTypeLabel } from '../../shared/interfaces/partTransactions.interface'

const typeClasses: Record<PartTransactionTypeLabel, string> = {
  Adjustment: 'border border-[#F0D3B3] bg-[#FFF7EE] text-[#A05A11]',
  Purchase: 'border border-[#C9E7D4] bg-[#EEFCF3] text-[#16784A]',
}

function PartTransactionDetailsPage() {
  const { partTransactionId } = useParams()
  const numericTransactionId = useMemo(() => {
    if (!partTransactionId) {
      return undefined
    }

    return Number.parseInt(partTransactionId, 10)
  }, [partTransactionId])

  const [transaction, setTransaction] = useState<PartTransactionRecord>()
  const [isLoading, setIsLoading] = useState(Boolean(partTransactionId))
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [isNotFound, setIsNotFound] = useState(false)

  const isInvalidId = Boolean(partTransactionId && (!numericTransactionId || Number.isNaN(numericTransactionId)))

  useEffect(() => {
    if (!partTransactionId) {
      setTransaction(undefined)
      setErrorMessage(null)
      setIsNotFound(false)
      setIsLoading(false)
      return
    }

    if (!numericTransactionId || Number.isNaN(numericTransactionId)) {
      setTransaction(undefined)
      setErrorMessage('This stock transaction ID is invalid.')
      setIsNotFound(false)
      setIsLoading(false)
      return
    }

    const transactionIdToLoad = numericTransactionId
    let isCancelled = false

    const fetchTransaction = async () => {
      setIsLoading(true)
      setErrorMessage(null)
      setIsNotFound(false)

      try {
        const result = await apiRequest<PartTransactionApiModel>(`/api/part-transactions/${transactionIdToLoad}`)

        if (isCancelled) {
          return
        }

        if (!result.success || !result.data) {
          setTransaction(undefined)
          setIsNotFound(result.statusCode === 404)
          setErrorMessage(getApiErrorMessage(result.message, result.errors))
          return
        }

        setTransaction(mapPartTransactionFromApi(result.data))
      } catch (error) {
        if (isCancelled) {
          return
        }

        setTransaction(undefined)
        setIsNotFound(error instanceof Error && error.message.includes('404'))
        setErrorMessage(getRequestErrorMessage(error, 'Unable to load this stock transaction from the backend.'))
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchTransaction()

    return () => {
      isCancelled = true
    }
  }, [numericTransactionId, partTransactionId])

  if (isInvalidId || isNotFound) {
    return <NotFoundPage />
  }

  if (partTransactionId && errorMessage && !transaction && !isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F8FB] p-6 text-[#00235C]">
        <section className="w-full max-w-xl rounded-3xl border border-[#DCE5EF] bg-white p-8 shadow-[0_20px_48px_rgba(18,43,74,0.08)]">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Backend issue</p>
          <h1 className="text-[28px] font-semibold text-[#102B49] [font-family:var(--font-display)]">We couldn&apos;t load that stock transaction.</h1>
          <p className="mt-4 text-[15px] leading-7 text-[#556E88]">{errorMessage}</p>
          <div className="mt-6">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white no-underline shadow-[0_14px_30px_rgba(21,85,141,0.2)]"
              to="/stock-transactions"
            >
              Back to Stock Transactions
            </Link>
          </div>
        </section>
      </main>
    )
  }

  if (isLoading || !transaction) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#F7FAFD_0%,#EEF4FA_55%,#F9FBFE_100%)] text-[#102B49]">
        <div className="mx-auto flex min-h-screen w-full max-w-380 items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="rounded-[28px] border border-[#DCE5EF] bg-white px-8 py-10 text-center shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Backend sync</p>
            <h1 className="mt-3 text-[30px] font-semibold text-[#102B49] [font-family:var(--font-display)]">Loading transaction details</h1>
            <p className="mt-3 text-[15px] leading-7 text-[#566E87]">Pulling the latest stock movement information from the backend...</p>
          </div>
        </div>
      </main>
    )
  }

  const quantityTone = transaction.quantityChanged >= 0 ? 'text-[#16784A]' : 'text-[#A05A11]'

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F7FAFD_0%,#EEF4FA_55%,#F9FBFE_100%)] text-[#102B49]">
      <div className="mx-auto w-full max-w-380 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-6 border-b border-[#DCE5EF] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <Link
              className="inline-flex items-center gap-2 text-[15px] font-medium text-[#45637F] transition hover:text-[#163E66]"
              to={transaction.partId ? `/stock-transactions?partId=${transaction.partId}` : '/stock-transactions'}
            >
              <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                arrow_back
              </span>
              Back to Stock History
            </Link>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#0C2544] [font-family:var(--font-display)] sm:text-[42px]">
                {transaction.partName}
              </h1>
              <span className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] ${typeClasses[transaction.transactionType]}`}>
                {transaction.transactionType}
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#566E87] sm:text-[16px]">
              Inspect this stock movement exactly as it was recorded in the backend transaction history.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#C8D6E5] bg-white px-5 text-[14px] font-semibold text-[#24405E] no-underline shadow-[0_10px_24px_rgba(18,43,74,0.05)] transition hover:border-[#AEC3D9] hover:bg-[#F7FBFE]"
              to={`/parts/${transaction.partId}`}
            >
              View Part
            </Link>
            {transaction.purchaseInvoiceId && transaction.purchaseInvoiceNumber ? (
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white no-underline shadow-[0_14px_30px_rgba(21,85,141,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0E487C]"
                to={`/purchase-invoices/${transaction.purchaseInvoiceId}`}
              >
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                  receipt_long
                </span>
                View Invoice
              </Link>
            ) : (
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white no-underline shadow-[0_14px_30px_rgba(21,85,141,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0E487C]"
                to={`/stock-transactions/create?partId=${transaction.partId}`}
              >
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                  sync_alt
                </span>
                Adjust Stock Again
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="mb-5 flex items-center gap-3 border-b border-[#E6EEF5] pb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                  <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                    receipt
                  </span>
                </span>
                <div>
                  <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Transaction Overview</h2>
                  <p className="mt-1 text-[14px] text-[#678099]">Core metadata saved with this stock movement.</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Part Name</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{transaction.partName}</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Part Number</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{transaction.partNumber}</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Created By</p>
                  <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{transaction.createdByName}</p>
                  <p className="mt-1 text-[13px] text-[#6F849B]">{transaction.createdById}</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Created At</p>
                  <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{formatDateLabel(transaction.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="mb-5 flex items-center gap-3 border-b border-[#E6EEF5] pb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                  <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                    sync_alt
                  </span>
                </span>
                <div>
                  <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Stock Movement</h2>
                  <p className="mt-1 text-[14px] text-[#678099]">Quantity change, resulting stock, and related reference information.</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Quantity Changed</p>
                  <p className={`mt-2 text-[20px] font-semibold ${quantityTone}`}>{formatQuantityChanged(transaction.quantityChanged)} units</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Stock Before</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{transaction.stockBefore} units</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Stock After</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{transaction.stockAfter} units</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Cost / Unit</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{formatRupees(transaction.costPricePerUnit)}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Reference</p>
                  {transaction.purchaseInvoiceId && transaction.purchaseInvoiceNumber ? (
                    <Link className="mt-2 inline-flex text-[18px] font-semibold text-[#123E69] no-underline hover:underline" to={`/purchase-invoices/${transaction.purchaseInvoiceId}`}>
                      {transaction.purchaseInvoiceNumber}
                    </Link>
                  ) : (
                    <p className="mt-2 text-[18px] font-semibold text-[#112B49]">Manual adjustment</p>
                  )}
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Remarks</p>
                  <p className="mt-2 text-[15px] leading-7 text-[#52677F]">{transaction.remarks || 'No manual remarks were stored for this transaction.'}</p>
                </div>
              </div>
            </section>
          </section>

          <aside className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-[#DCE5EF] bg-white shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="flex items-center justify-between bg-[#123E69] px-5 py-4 text-white">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Transaction Snapshot</p>
                  <h2 className="mt-1 text-[23px] font-semibold tracking-[-0.02em] [font-family:var(--font-display)]">Result</h2>
                </div>
                <span className={`inline-flex min-h-8 items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${typeClasses[transaction.transactionType]}`}>
                  {transaction.transactionType}
                </span>
              </div>

              <div className="space-y-4 p-5">
                <div className="rounded-3xl border border-[#DCE7F2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Quantity Result</p>
                  <p className={`mt-3 text-[34px] font-semibold leading-none [font-family:var(--font-display)] ${quantityTone}`}>
                    {formatQuantityChanged(transaction.quantityChanged)}
                  </p>
                  <p className="mt-2 text-[13px] text-[#627A93]">Final stock is {transaction.stockAfter} units after this movement.</p>
                </div>

                <div className="rounded-3xl border border-[#E3EAF2] bg-[#FBFDFF] p-4 text-[14px] text-[#4D6580]">
                  <p><span className="font-semibold text-[#123052]">Part ID:</span> {transaction.partId}</p>
                  <p className="mt-2"><span className="font-semibold text-[#123052]">Type:</span> {transaction.transactionType}</p>
                  <p className="mt-2"><span className="font-semibold text-[#123052]">Invoice link:</span> {transaction.purchaseInvoiceNumber || 'Not tied to a purchase invoice'}</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default PartTransactionDetailsPage
