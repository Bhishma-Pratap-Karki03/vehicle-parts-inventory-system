import type { ApiResponse } from '../../shared/interfaces/api.interface'
import type {
  AdjustStockPayload,
  BackendPartTransactionType,
  PartTransactionApiModel,
  PartTransactionFiltersState,
  PartTransactionRecord,
  PartTransactionTypeFilter,
  PartTransactionTypeLabel,
  StockAdjustmentFormValues,
} from '../../shared/interfaces/partTransactions.interface'

const partTransactionTypeLabelMap: Record<1 | 2, PartTransactionTypeLabel> = {
  1: 'Purchase',
  2: 'Adjustment',
}

const partTransactionTypeValueMap: Record<PartTransactionTypeLabel, 1 | 2> = {
  Adjustment: 2,
  Purchase: 1,
}

export function formatDateLabel(
  value: null | string | undefined,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-US', options ?? {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatRupees(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return '—'
  }

  const normalizedValue = typeof value === 'number' ? value : Number.parseFloat(String(value).replaceAll(',', ''))

  if (Number.isNaN(normalizedValue)) {
    return 'Rs. 0.00'
  }

  return `Rs. ${normalizedValue.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatQuantityChanged(quantityChanged: number) {
  if (quantityChanged > 0) {
    return `+${quantityChanged}`
  }

  return String(quantityChanged)
}

export function getPartTransactionTypeLabel(status: BackendPartTransactionType): PartTransactionTypeLabel {
  if (status === 'Purchase' || status === 'Adjustment') {
    return status
  }

  return partTransactionTypeLabelMap[status] ?? 'Adjustment'
}

export function mapPartTransactionFromApi(transaction: PartTransactionApiModel): PartTransactionRecord {
  return {
    ...transaction,
    transactionType: getPartTransactionTypeLabel(transaction.transactionType),
  }
}

export function createDefaultPartTransactionFilters(
  transactionType: PartTransactionTypeFilter = 'all',
): PartTransactionFiltersState {
  return {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    transactionType,
  }
}

export function createEmptyStockAdjustmentFormValues(partId = ''): StockAdjustmentFormValues {
  return {
    adjustmentType: 'Increase',
    partId,
    quantity: '1',
    remarks: '',
  }
}

export function buildPartTransactionQueryString(
  query: Pick<PartTransactionFiltersState, 'pageNumber' | 'pageSize' | 'searchTerm' | 'transactionType'> & {
    partId?: string
  },
) {
  const params = new URLSearchParams()

  if (query.searchTerm.trim()) {
    params.set('searchTerm', query.searchTerm.trim())
  }

  if (query.partId?.trim()) {
    params.set('partId', query.partId.trim())
  }

  if (query.transactionType !== 'all') {
    params.set('transactionType', String(partTransactionTypeValueMap[query.transactionType]))
  }

  params.set('pageNumber', String(query.pageNumber))
  params.set('pageSize', String(query.pageSize))

  return `?${params.toString()}`
}

export function buildAdjustStockPayload(values: StockAdjustmentFormValues): AdjustStockPayload {
  const numericQuantity = Number.parseInt(values.quantity, 10)

  return {
    partId: Number.parseInt(values.partId, 10),
    quantityChanged: values.adjustmentType === 'Increase' ? numericQuantity : numericQuantity * -1,
    remarks: values.remarks.trim(),
  }
}

export function getApiErrorMessage(message?: string, errors?: string[]) {
  if (errors && errors.length > 0) {
    return errors.join(' ')
  }

  return message || 'Something went wrong while talking to the backend.'
}

export function getRequestErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export async function readApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    const payload = await response.json()

    if (
      payload &&
      typeof payload === 'object' &&
      'title' in payload &&
      !('success' in payload)
    ) {
      const flattenedErrors =
        payload.errors && typeof payload.errors === 'object'
          ? Object.values(payload.errors as Record<string, string[]>).flat()
          : undefined

      return {
        success: false,
        message:
          (typeof payload.detail === 'string' && payload.detail) ||
          (typeof payload.title === 'string' && payload.title) ||
          `Request failed with status ${response.status}.`,
        errors: flattenedErrors,
        statusCode: typeof payload.status === 'number' ? payload.status : response.status,
      }
    }

    if (payload && typeof payload === 'object' && 'success' in payload) {
      return payload as ApiResponse<T>
    }

    if (!response.ok) {
      return {
        success: false,
        message: `Request failed with status ${response.status}.`,
        statusCode: response.status,
      }
    }

    return {
      success: true,
      message: 'Request completed successfully.',
      data: payload as T,
      statusCode: response.status,
    }
  } catch {
    return {
      success: false,
      message: `Request failed with status ${response.status}.`,
      statusCode: response.status,
    }
  }
}
