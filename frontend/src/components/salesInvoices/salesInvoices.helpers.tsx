import type { ApiResponse } from '../../shared/interfaces/api.interface'
import type {
  BackendPaymentStatus,
  CreateSalesInvoicePayload,
  SalesInvoiceDetailApiModel,
  SalesInvoiceDetailRecord,
  SalesInvoiceEmailFormValues,
  SalesInvoiceFiltersState,
  SalesInvoiceFormValues,
  SalesInvoiceListItemApiModel,
  SalesInvoiceListItemRecord,
  SalesInvoicePaymentStatusFilter,
  SalesInvoicePaymentStatusLabel,
  SendSalesInvoiceEmailPayload,
} from '../../shared/interfaces/salesInvoices.interface'

const paymentStatusLabelMap: Record<1 | 2 | 3 | 4, SalesInvoicePaymentStatusLabel> = {
  1: 'Unpaid',
  2: 'Partially Paid',
  3: 'Paid',
  4: 'Overdue',
}

const paymentStatusQueryMap: Record<SalesInvoicePaymentStatusLabel, 1 | 2 | 3 | 4> = {
  Overdue: 4,
  Paid: 3,
  'Partially Paid': 2,
  Unpaid: 1,
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

export function getTodayDateInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getSalesInvoicePaymentStatusLabel(status: BackendPaymentStatus): SalesInvoicePaymentStatusLabel {
  if (status === 'Paid' || status === 'Unpaid' || status === 'Overdue') {
    return status
  }

  if (status === 'PartiallyPaid') {
    return 'Partially Paid'
  }

  return paymentStatusLabelMap[status] ?? 'Unpaid'
}

export function mapSalesInvoiceListFromApi(invoice: SalesInvoiceListItemApiModel): SalesInvoiceListItemRecord {
  return {
    ...invoice,
    paymentStatus: getSalesInvoicePaymentStatusLabel(invoice.paymentStatus),
  }
}

export function mapSalesInvoiceDetailFromApi(invoice: SalesInvoiceDetailApiModel): SalesInvoiceDetailRecord {
  return {
    ...invoice,
    paymentStatus: getSalesInvoicePaymentStatusLabel(invoice.paymentStatus),
  }
}

export function createDefaultSalesInvoiceFilters(): SalesInvoiceFiltersState {
  return {
    pageNumber: 1,
    pageSize: 10,
    paymentStatus: 'all',
    searchTerm: '',
  }
}

export function createEmptySalesInvoiceFormValues(
  prefilledCustomerId = '',
  prefilledVehicleId = '',
  prefilledPartId = '',
): SalesInvoiceFormValues {
  return {
    customerId: prefilledCustomerId,
    vehicleId: prefilledVehicleId,
    discountAmount: '0',
    dueDate: '',
    items: [
      {
        partId: prefilledPartId,
        quantity: '1',
      },
    ],
    paidAmount: '0',
  }
}

export function getSalesLineTotal(quantity: number | string, pricePerUnit: number | string) {
  const normalizedQuantity = typeof quantity === 'number' ? quantity : Number.parseFloat(quantity || '0')
  const normalizedPrice = typeof pricePerUnit === 'number' ? pricePerUnit : Number.parseFloat(pricePerUnit || '0')

  if (Number.isNaN(normalizedQuantity) || Number.isNaN(normalizedPrice)) {
    return 0
  }

  return normalizedQuantity * normalizedPrice
}

export function buildSalesInvoicePayload(values: SalesInvoiceFormValues): CreateSalesInvoicePayload {
  const normalizedDiscountAmount = Number.parseFloat(values.discountAmount || '0')
  const normalizedPaidAmount = Number.parseFloat(values.paidAmount || '0')

  return {
    customerId: values.customerId.trim(),
    vehicleId: Number.parseInt(values.vehicleId, 10),
    discountAmount: Number.isNaN(normalizedDiscountAmount) ? 0 : normalizedDiscountAmount,
    paidAmount: Number.isNaN(normalizedPaidAmount) ? 0 : normalizedPaidAmount,
    dueDate: values.dueDate ? `${values.dueDate}T00:00:00Z` : null,
    items: values.items.map((item) => ({
      partId: Number.parseInt(item.partId, 10),
      quantity: Number.parseInt(item.quantity, 10),
    })),
  }
}

export function buildSendSalesInvoiceEmailPayload(values: SalesInvoiceEmailFormValues): SendSalesInvoiceEmailPayload {
  const payload: SendSalesInvoiceEmailPayload = {}
  const trimmedEmail = values.toEmail.trim()
  const trimmedMessage = values.message.trim()

  if (trimmedEmail) {
    payload.toEmail = trimmedEmail
  }

  if (trimmedMessage) {
    payload.message = trimmedMessage
  }

  return payload
}

export function buildSalesInvoiceQueryString(query: Pick<SalesInvoiceFiltersState, 'pageNumber' | 'pageSize' | 'paymentStatus' | 'searchTerm'>) {
  const params = new URLSearchParams()

  if (query.searchTerm.trim()) {
    params.set('searchTerm', query.searchTerm.trim())
  }

  if (query.paymentStatus !== 'all') {
    params.set('paymentStatus', String(paymentStatusQueryMap[query.paymentStatus]))
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

export function getPaymentFilterFromQueryValue(value: null | string): SalesInvoicePaymentStatusFilter {
  if (value === '1' || value === 'Unpaid') {
    return 'Unpaid'
  }

  if (value === '2' || value === 'PartiallyPaid' || value === 'Partially Paid') {
    return 'Partially Paid'
  }

  if (value === '3' || value === 'Paid') {
    return 'Paid'
  }

  if (value === '4' || value === 'Overdue') {
    return 'Overdue'
  }

  return 'all'
}
