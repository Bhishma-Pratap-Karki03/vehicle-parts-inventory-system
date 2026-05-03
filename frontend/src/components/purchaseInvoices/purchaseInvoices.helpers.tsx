import type { ApiResponse } from '../../shared/interfaces/api.interface'
import type {
  BackendPurchaseInvoiceStatus,
  CreatePurchaseInvoicePayload,
  PurchaseInvoiceDetailApiModel,
  PurchaseInvoiceDetailRecord,
  PurchaseInvoiceFiltersState,
  PurchaseInvoiceFormValues,
  PurchaseInvoiceListItemApiModel,
  PurchaseInvoiceListItemRecord,
  PurchaseInvoiceStatusLabel,
} from '../../shared/interfaces/purchaseInvoices.interface'

const purchaseInvoiceStatusMap: Record<1 | 2, PurchaseInvoiceStatusLabel> = {
  1: 'Completed',
  2: 'Cancelled',
}

export function formatRupees(value: number | string) {
  const normalizedValue = typeof value === 'number' ? value : Number.parseFloat(String(value).replaceAll(',', ''))

  if (Number.isNaN(normalizedValue)) {
    return 'Rs. 0.00'
  }

  return `Rs. ${normalizedValue.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
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

export function getTodayDateInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getPurchaseInvoiceStatusLabel(status: BackendPurchaseInvoiceStatus): PurchaseInvoiceStatusLabel {
  if (status === 'Completed' || status === 'Cancelled') {
    return status
  }

  return purchaseInvoiceStatusMap[status] ?? 'Completed'
}

export function mapPurchaseInvoiceListFromApi(invoice: PurchaseInvoiceListItemApiModel): PurchaseInvoiceListItemRecord {
  return {
    ...invoice,
    status: getPurchaseInvoiceStatusLabel(invoice.status),
  }
}

export function mapPurchaseInvoiceDetailFromApi(invoice: PurchaseInvoiceDetailApiModel): PurchaseInvoiceDetailRecord {
  return {
    ...invoice,
    status: getPurchaseInvoiceStatusLabel(invoice.status),
  }
}

export function createDefaultPurchaseInvoiceFilters(): PurchaseInvoiceFiltersState {
  return {
    searchTerm: '',
    pageNumber: 1,
    pageSize: 10,
  }
}

export function createEmptyPurchaseInvoiceFormValues(
  vendorId = '',
  partId = '',
): PurchaseInvoiceFormValues {
  return {
    vendorId,
    purchaseDate: getTodayDateInputValue(),
    items: [
      {
        partId,
        quantity: '1',
        costPricePerUnit: '',
      },
    ],
  }
}

export function getLineTotal(quantity: number | string, costPricePerUnit: number | string) {
  const normalizedQuantity = typeof quantity === 'number' ? quantity : Number.parseFloat(quantity || '0')
  const normalizedCostPrice = typeof costPricePerUnit === 'number' ? costPricePerUnit : Number.parseFloat(costPricePerUnit || '0')

  if (Number.isNaN(normalizedQuantity) || Number.isNaN(normalizedCostPrice)) {
    return 0
  }

  return normalizedQuantity * normalizedCostPrice
}

export function buildPurchaseInvoicePayload(values: PurchaseInvoiceFormValues): CreatePurchaseInvoicePayload {
  return {
    vendorId: Number.parseInt(values.vendorId, 10),
    purchaseDate: `${values.purchaseDate}T00:00:00Z`,
    items: values.items.map((item) => ({
      partId: Number.parseInt(item.partId, 10),
      quantity: Number.parseInt(item.quantity, 10),
      costPricePerUnit: Number.parseFloat(item.costPricePerUnit),
    })),
  }
}

export function buildPurchaseInvoiceQueryString(query: Pick<PurchaseInvoiceFiltersState, 'pageNumber' | 'pageSize' | 'searchTerm'>) {
  const params = new URLSearchParams()

  if (query.searchTerm.trim()) {
    params.set('searchTerm', query.searchTerm.trim())
  }

  params.set('pageNumber', String(query.pageNumber))
  params.set('pageSize', String(query.pageSize))

  return `?${params.toString()}`
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