export type BackendPaymentStatus =
  | 1
  | 2
  | 3
  | 4
  | 'Overdue'
  | 'Paid'
  | 'PartiallyPaid'
  | 'Unpaid'

export type SalesInvoicePaymentStatusLabel = 'Overdue' | 'Paid' | 'Partially Paid' | 'Unpaid'

export type BackendPaymentMethod = 1 | 2 | 3 | 4 | 'Cash' | 'Card' | 'Credit' | 'OnlineTransfer'

export type SalesInvoicePaymentMethodLabel = 'Cash' | 'Card' | 'Credit' | 'Online Transfer'

export type SalesInvoicePaymentStatusFilter = 'all' | SalesInvoicePaymentStatusLabel

export interface SalesInvoiceItemApiModel {
  salesInvoiceItemId: number
  partId: number
  partName: string
  partNumber: string
  quantity: number
  pricePerUnit: number
  lineTotal: number
}

export interface SalesInvoicePaymentApiModel {
  paymentId: number
  amount: number
  paymentMethod: BackendPaymentMethod
  paymentDate: string
  remarks?: null | string
  createdAt: string
}

export interface SalesInvoiceListItemApiModel {
  salesInvoiceId: number
  invoiceNumber: string
  customerId: string
  customerName: string
  staffId: string
  staffName: string
  vehicleId: number
  vehicleNumber: string
  invoiceDate: string
  subTotal: number
  discountAmount: number
  finalAmount: number
  paidAmount: number
  paymentStatus: BackendPaymentStatus
  dueDate: null | string
  hasInvoicePdf: boolean
  createdAt: string
}

export interface SalesInvoiceDetailApiModel extends SalesInvoiceListItemApiModel {
  customerEmail: string
  customerPhoneNumber: null | string
  vehicleBrand: string
  vehicleModel: string
  remainingAmount: number
  items: SalesInvoiceItemApiModel[]
  payments: SalesInvoicePaymentApiModel[]
}

export interface SalesInvoiceListItemRecord extends Omit<SalesInvoiceListItemApiModel, 'paymentStatus'> {
  paymentStatus: SalesInvoicePaymentStatusLabel
}

export interface SalesInvoiceDetailRecord extends Omit<SalesInvoiceDetailApiModel, 'items' | 'paymentStatus' | 'payments'> {
  items: SalesInvoiceItemApiModel[]
  payments: SalesInvoicePaymentRecord[]
  paymentStatus: SalesInvoicePaymentStatusLabel
}

export interface SalesInvoicePaymentRecord extends Omit<SalesInvoicePaymentApiModel, 'paymentMethod'> {
  paymentMethod: SalesInvoicePaymentMethodLabel
}

export interface SalesInvoiceCustomerOption {
  customerId: string
  customerName: string
  customerEmail: null | string
  customerPhoneNumber: null | string
}

export interface SalesInvoiceVehicleOption {
  vehicleId: number
  vehicleNumber: string
  brand: string
  model: string
}

export interface SalesInvoiceFiltersState {
  pageNumber: number
  pageSize: number
  searchTerm: string
  paymentStatus: SalesInvoicePaymentStatusFilter
}

export interface SalesInvoiceFormItemValues {
  partId: string
  quantity: string
}

export interface SalesInvoiceFormValues {
  customerId: string
  vehicleId: string
  discountAmount: string
  paidAmount: string
  paymentMethod: SalesInvoicePaymentMethodLabel
  dueDate: string
  items: SalesInvoiceFormItemValues[]
}

export interface CreateSalesInvoiceItemPayload {
  partId: number
  quantity: number
}

export interface CreateSalesInvoicePayload {
  customerId: string
  vehicleId: number
  paidAmount: number
  paymentMethod: 1 | 2 | 3 | 4
  dueDate: null | string
  items: CreateSalesInvoiceItemPayload[]
}

export interface SendSalesInvoiceEmailPayload {
  message?: string
  toEmail?: string
}

export interface AddSalesInvoicePaymentPayload {
  amount: number
  paymentMethod: 1 | 2 | 3 | 4
  paymentDate: null | string
  remarks?: string
}

export interface SalesInvoiceEmailFormValues {
  message: string
  toEmail: string
}

export interface SalesInvoicePaymentFormValues {
  amount: string
  paymentDate: string
  paymentMethod: SalesInvoicePaymentMethodLabel
  remarks: string
}
