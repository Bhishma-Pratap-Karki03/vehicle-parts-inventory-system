import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { mapPartFromApi } from '../../components/parts/parts.helpers'
import StockAdjustmentForm from '../../components/partTransactions/StockAdjustmentForm'
import {
  buildAdjustStockPayload,
  createEmptyStockAdjustmentFormValues,
  getApiErrorMessage,
  getRequestErrorMessage,
  mapPartTransactionFromApi,
  readApiResponse,
} from '../../components/partTransactions/partTransactions.helpers'
import backendUrl from '../../config'
import type { PagedResult } from '../../shared/interfaces/api.interface'
import type { PartApiModel, PartRecord } from '../../shared/interfaces/parts.interface'
import type { PartTransactionApiModel, StockAdjustmentFormValues } from '../../shared/interfaces/partTransactions.interface'

function StockAdjustmentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefilledPartId = searchParams.get('partId') ?? ''

  const [partOptions, setPartOptions] = useState<PartRecord[]>([])
  const [isOptionsLoading, setIsOptionsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialValues = useMemo(
    () => createEmptyStockAdjustmentFormValues(prefilledPartId),
    [prefilledPartId],
  )

  useEffect(() => {
    let isCancelled = false

    const fetchParts = async () => {
      setIsOptionsLoading(true)

      try {
        const collectedParts: PartRecord[] = []
        let pageNumber = 1
        let hasNextPage = true

        while (hasNextPage) {
          const query = new URLSearchParams({
            includeDeleted: 'false',
            pageNumber: String(pageNumber),
            pageSize: '100',
          })

          const response = await fetch(`${backendUrl}/api/Parts?${query.toString()}`)
          const result = await readApiResponse<PagedResult<PartApiModel>>(response)

          if (!result.success || !result.data) {
            throw new Error(getApiErrorMessage(result.message, result.errors))
          }

          collectedParts.push(...result.data.items.map(mapPartFromApi))
          hasNextPage = result.data.hasNextPage
          pageNumber += 1
        }

        if (isCancelled) {
          return
        }

        setPartOptions(
          collectedParts
            .filter((part) => !part.isDeleted)
            .sort((left, right) => left.partName.localeCompare(right.partName)),
        )
      } catch (error) {
        if (isCancelled) {
          return
        }

        setPartOptions([])
        toast.error(getRequestErrorMessage(error, 'Unable to load parts for the stock adjustment form.'))
      } finally {
        if (!isCancelled) {
          setIsOptionsLoading(false)
        }
      }
    }

    void fetchParts()

    return () => {
      isCancelled = true
    }
  }, [])

  async function handleSubmitAdjustment(values: StockAdjustmentFormValues) {
    setIsSubmitting(true)

    try {
      const response = await fetch(`${backendUrl}/api/part-transactions/adjust-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildAdjustStockPayload(values)),
      })

      const result = await readApiResponse<PartTransactionApiModel>(response)

      if (!result.success || !result.data) {
        toast.error(getApiErrorMessage(result.message, result.errors))
        return
      }

      const createdTransaction = mapPartTransactionFromApi(result.data)
      toast.success(result.message || 'Stock adjusted successfully.')
      navigate(`/stock-transactions/${createdTransaction.partTransactionId}`)
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to apply this stock adjustment right now.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <StockAdjustmentForm
      cancelHref={prefilledPartId ? `/stock-transactions?partId=${prefilledPartId}` : '/stock-transactions'}
      initialValues={initialValues}
      isOptionsLoading={isOptionsLoading}
      isSubmitting={isSubmitting}
      onSubmitAdjustment={handleSubmitAdjustment}
      partOptions={partOptions}
    />
  )
}

export default StockAdjustmentPage
