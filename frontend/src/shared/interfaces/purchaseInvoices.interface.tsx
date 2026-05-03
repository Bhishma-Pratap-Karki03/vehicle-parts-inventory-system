export type BackendPurchaseInvoiceStatus = 1 | 2 | 'Cancelled' | 'Completed'

export type PurchaseInvoiceStatusLabel = 'Cancelled' | 'Completed'

export interface PurchaseInvoiceItemApiModel {
  purchaseInvoiceItemId: number
  partId: number
  partName: string
  partNumber: string
  quantity: number
  costPricePerUnit: number
  lineTotal: number
}

export interface PurchaseInvoiceListItemApiModel {
  purchaseInvoiceId: number
  invoiceNumber: string
  vendorId: number
  vendorName: string
  purchaseDate: string
  totalAmount: number
  status: BackendPurchaseInvoiceStatus
  pdfPublicId: null | string
  isEmailSent: boolean
  emailSentAt: null | string
  createdAt: string
}

export interface PurchaseInvoiceDetailApiModel extends PurchaseInvoiceListItemApiModel {
  vendorEmail: string
  createdById: string
  createdByName: string
  items: PurchaseInvoiceItemApiModel[]
}

export type PurchaseInvoiceItemRecord = PurchaseInvoiceItemApiModel

export interface PurchaseInvoiceListItemRecord extends Omit<PurchaseInvoiceListItemApiModel, 'status'> {
  status: PurchaseInvoiceStatusLabel
}

export interface PurchaseInvoiceDetailRecord extends Omit<PurchaseInvoiceDetailApiModel, 'items' | 'status'> {
  items: PurchaseInvoiceItemRecord[]
  status: PurchaseInvoiceStatusLabel
}

export interface PurchaseInvoiceFiltersState {
  searchTerm: string
  pageNumber: number
  pageSize: number
}

export interface PurchaseInvoiceFormItemValues {
  partId: string
  quantity: string
  costPricePerUnit: string
}

export interface PurchaseInvoiceFormValues {
  vendorId: string
  purchaseDate: string
  items: PurchaseInvoiceFormItemValues[]
}

export interface CreatePurchaseInvoiceItemPayload {
  partId: number
  quantity: number
  costPricePerUnit: number
}

export interface CreatePurchaseInvoicePayload {
  vendorId: number
  purchaseDate: string
  items: CreatePurchaseInvoiceItemPayload[]
}
