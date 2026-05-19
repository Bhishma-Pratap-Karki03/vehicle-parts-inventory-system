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
}

export interface UpdateAppointmentStatusRequest {
  adminRemarks?: null | string
  status: 'Completed' | 'Confirmed' | 'Rejected'
}
