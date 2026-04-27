import type { ApiResponse } from '../../shared/interfaces/api.interface'
import type {
  BackendPartStatus,
  InventorySummaryData,
  LowStockAlert,
  PartApiModel,
  PartBaseStatus,
  PartDisplayStatus,
  PartEditorFormValues,
  PartMutationPayload,
  PartRecord,
  SummaryCard,
} from '../../shared/interfaces/parts.interface'

const statusLabelMap: Record<BackendPartStatus, PartBaseStatus> = {
  1: 'Available',
  2: 'Unavailable',
  3: 'Discontinued',
}

const statusValueMap: Record<PartBaseStatus, BackendPartStatus> = {
  Available: 1,
  Unavailable: 2,
  Discontinued: 3,
}

export function formatPartCode(partId: number) {
  return `#PRT-${String(partId).padStart(4, '0')}`
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

export function mapApiStatusToLabel(status: BackendPartStatus): PartBaseStatus {
  return statusLabelMap[status]
}

export function mapStatusLabelToApi(status: PartBaseStatus): BackendPartStatus {
  return statusValueMap[status]
}

export function mapPartFromApi(part: PartApiModel): PartRecord {
  return {
    ...part,
    status: mapApiStatusToLabel(part.status),
  }
}

export function getPartDisplayStatus(part: Pick<PartRecord, 'isLowStock' | 'status'>): PartDisplayStatus {
  if (part.isLowStock && part.status === 'Available') {
    return 'Low Stock'
  }

  return part.status
}

export function buildPartMutationPayload(values: PartEditorFormValues): PartMutationPayload {
  const normalizedCategory = values.category.trim()
  const normalizedDescription = values.description.trim()

  return {
    vendorId: Number.parseInt(values.vendorId, 10),
    partName: values.name.trim(),
    partNumber: values.partNumber.trim(),
    category: normalizedCategory || undefined,
    description: normalizedDescription || undefined,
    sellingPricePerUnit: Number.parseFloat(values.retailPrice),
    minimumStockLevel: Number.parseInt(values.minimumReorderPoint, 10),
    status: mapStatusLabelToApi(values.status),
  }
}

export function buildPartEditorDefaultValues(part?: PartRecord): Omit<PartEditorFormValues, 'image'> {
  return {
    vendorId: part ? String(part.vendorId) : '',
    name: part?.partName ?? '',
    partNumber: part?.partNumber ?? '',
    category: part?.category ?? '',
    description: part?.description ?? '',
    retailPrice: part ? part.sellingPricePerUnit.toFixed(2) : '',
    minimumReorderPoint: part ? String(part.minimumStockLevel) : '10',
    status: part?.status ?? 'Available',
  }
}

export function buildLowStockAlerts(parts: PartRecord[]): LowStockAlert[] {
  return parts.slice(0, 3).map((part) => ({
    partId: part.partId,
    partName: part.partName,
    partNumber: part.partNumber,
    quantity: part.stockQuantity,
    vendorName: part.vendorName,
  }))
}

export function buildSummaryCards(summary: InventorySummaryData): SummaryCard[] {
  return [
    {
      label: 'Total Parts',
      value: summary.totalParts.toLocaleString(),
      detail: 'Active catalog records currently available in the backend.',
      icon: 'box',
      tone: 'primary',
    },
    {
      label: 'Available',
      value: summary.availableParts.toLocaleString(),
      detail: 'Parts currently marked available in the backend catalog.',
      icon: 'checkCircle',
      tone: 'success',
    },
    {
      label: 'Low Stock',
      value: summary.lowStockParts.toLocaleString(),
      detail: 'Items below their minimum reorder threshold right now.',
      icon: 'warning',
      tone: 'warning',
    },
    {
      label: 'Unavailable',
      value: summary.unavailableParts.toLocaleString(),
      detail: 'Parts marked unavailable or discontinued in the backend catalog.',
      icon: 'alert',
      tone: 'danger',
    },
  ]
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
