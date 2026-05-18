export type BackendPartTransactionType = 1 | 2 | 'Adjustment' | 'Purchase'

export type PartTransactionTypeLabel = 'Adjustment' | 'Purchase'

export type PartTransactionTypeFilter = 'all' | PartTransactionTypeLabel

export type StockAdjustmentDirection = 'Decrease' | 'Increase'

export interface PartTransactionApiModel {
  partTransactionId: number
  partId: number
  partName: string
  partNumber: string
  transactionType: BackendPartTransactionType
  quantityChanged: number
  stockBefore: number
  stockAfter: number
  costPricePerUnit: null | number
  purchaseInvoiceId: null | number
  purchaseInvoiceNumber: null | string
  remarks: null | string
  createdById: string
  createdByName: string
  createdAt: string
}

export interface PartTransactionRecord extends Omit<PartTransactionApiModel, 'transactionType'> {
  transactionType: PartTransactionTypeLabel
}

export interface PartTransactionFiltersState {
  pageNumber: number
  pageSize: number
  searchTerm: string
  transactionType: PartTransactionTypeFilter
}

export interface StockAdjustmentFormValues {
  adjustmentType: StockAdjustmentDirection
  partId: string
  quantity: string
  remarks: string
}

export interface AdjustStockPayload {
  partId: number
  quantityChanged: number
  remarks: string
}
