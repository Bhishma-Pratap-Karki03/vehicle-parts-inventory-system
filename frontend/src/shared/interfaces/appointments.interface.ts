export type AppointmentStatus =
  | 'Cancelled'
  | 'Completed'
  | 'Confirmed'
  | 'Pending'
  | 'Rejected'
  | string

export interface AppointmentRecord {
  adminRemarks?: null | string
  alternativeAppointmentDate: null | string
  appointmentDate: string
  appointmentId: number
  createdAt?: string
  customerId: string
  issueDescription: string
  serviceType: string
  status: AppointmentStatus
  updatedAt?: null | string
  urgency: string
  vehicleId: number
  vehicleName: string
  vehicleNumber: string
}

export interface StaffAppointmentRecord extends AppointmentRecord {
  customerEmail: string
  customerName: string
  customerPhoneNumber: string
  serviceRecord?: null | StaffAppointmentServiceRecord
}

export interface UpdateAppointmentStatusRequest {
  adminRemarks?: null | string
  laborCost?: number
  partsChangedOrSuggested?: null | string
  serviceDescription?: null | string
  status: 'Completed' | 'Confirmed' | 'Rejected'
}

export interface StaffAppointmentServiceRecord {
  serviceRecordId: number
  serviceDate: string
  serviceDescription: string
  partsChangedOrSuggested?: null | string
  laborCost: number
  status: string
}
