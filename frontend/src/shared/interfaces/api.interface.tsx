export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  errors?: string[]
  statusCode: number
}

export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalRecords: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
