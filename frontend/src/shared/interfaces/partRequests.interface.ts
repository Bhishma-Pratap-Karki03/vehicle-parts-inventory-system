export type PartRequestStatus =
  | 'Available'
  | 'Cancelled'
  | 'Pending'
  | 'Reviewed'
  | 'Unavailable'
  | string

export interface PartRequestRecord {
  adminResponse?: null | string
  category: string
  customerId: string
  description: string
  partName: string
  partNumber?: null | string
  partRequestId: number
  requestedAt: string
  status: PartRequestStatus
  updatedAt?: null | string
  urgency: string
  vehicleId?: null | number
  vehicleName: string
  vehicleNumber: string
}

export interface StaffPartRequestRecord extends PartRequestRecord {
  customerEmail: string
  customerName: string
  customerPhoneNumber: string
}

export interface UpdatePartRequestStatusRequest {
  adminResponse?: null | string
  status: 'Available' | 'Reviewed' | 'Unavailable'
}
