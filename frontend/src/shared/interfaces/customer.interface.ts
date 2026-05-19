export type UserRole = 'Admin' | 'Customer' | 'Staff'

export interface AuthenticatedUser {
  userId: string
  fullName: string
  email: string
  phoneNumber?: null | string
  address?: null | string
  roles: UserRole[]
}

export interface AuthResponse {
  token: string
  expiresAt: string
  user: AuthenticatedUser
}

export interface CustomerProfile {
  customerId: string
  fullName: string
  email: string
  phoneNumber?: null | string
  address?: null | string
  createdAt: string
  updatedAt?: null | string
}

export interface CustomerVehicle {
  vehicleId: number
  vehicleNumber: string
  brand: string
  model: string
  year: number
  mileage: number
  createdAt: string
  updatedAt?: null | string
}

export interface CustomerVehicleInput {
  vehicleNumber: string
  brand: string
  model: string
  year: number
  mileage: number
}

export interface CustomerPurchaseHistoryLine {
  partName: string
  partNumber: string
  quantity: number
  pricePerUnit: number
  lineTotal: number
}

export type PaymentStatusValue = 0 | 1 | 2 | 'PartiallyPaid' | 'Paid' | 'Unpaid'

export interface CustomerPurchaseHistoryItem {
  salesInvoiceId: number
  invoiceNumber: string
  invoiceDate: string
  vehicleNumber: string
  vehicleBrandModel: string
  subTotal: number
  discountAmount: number
  finalAmount: number
  paidAmount: number
  remainingAmount: number
  paymentStatus: PaymentStatusValue
  hasInvoicePdf: boolean
  dueDate?: null | string
  itemCount: number
  items: CustomerPurchaseHistoryLine[]
}

export type ServiceStatusValue =
  | 'Completed'
  | 'InProgress'
  | 'Pending'
  | 0
  | 1
  | 2

export interface CustomerServiceHistoryItem {
  serviceRecordId: number
  serviceDate: string
  vehicleNumber: string
  vehicleBrandModel: string
  serviceDescription: string
  partsChangedOrSuggested?: null | string
  laborCost: number
  status: ServiceStatusValue
  staffName: string
}

export interface CustomerHistorySummary {
  totalPurchases: number
  totalSpent: number
  outstandingBalance: number
  totalServices: number
  vehicleCount: number
}

export interface StaffCustomerDetails {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  address?: null | string
  vehicles: Array<{
    vehicleId: number
    vehicleNumber: string
    brand: string
    model: string
    year: number
    mileage: number
  }>
  historySummary: CustomerHistorySummary
  purchaseHistory: CustomerPurchaseHistoryItem[]
  serviceHistory: CustomerServiceHistoryItem[]
}

export interface RegularCustomerReport {
  customerId: string
  fullName: string
  email?: null | string
  phoneNumber?: null | string
  purchaseCount: number
  totalSpent: number
  lastPurchaseDate?: null | string
}

export interface HighSpenderReport {
  customerId: string
  fullName: string
  email?: null | string
  phoneNumber?: null | string
  totalSpent: number
  purchaseCount: number
  lastPurchaseDate?: null | string
}

export interface PendingCreditReport {
  customerId: string
  fullName: string
  email?: null | string
  phoneNumber?: null | string
  outstandingBalance: number
  unpaidInvoiceCount: number
  overdueInvoiceCount: number
  oldestUnpaidInvoiceDate?: null | string
}
