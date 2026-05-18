export type BackendPartStatus = 1 | 2 | 3

export type PartBaseStatus = 'Available' | 'Unavailable' | 'Discontinued'

export type PartDisplayStatus = PartBaseStatus | 'Deleted' | 'Low Stock'

export type PartStatusFilter = 'all' | 'Available' | 'Low Stock' | 'Unavailable' | 'Discontinued'

export type PartEditorMode = 'create' | 'edit'

export interface PartApiModel {
  partId: number
  vendorId: number
  vendorName: string
  partName: string
  partNumber: string
  category: null | string
  description: null | string
  imagePublicId: null | string
  costPricePerUnit: number
  sellingPricePerUnit: number
  stockQuantity: number
  minimumStockLevel: number
  isLowStock: boolean
  status: BackendPartStatus
  isDeleted: boolean
  deletedAt: null | string
  createdAt: string
  updatedAt: null | string
}

export interface PartRecord {
  partId: number
  vendorId: number
  vendorName: string
  partName: string
  partNumber: string
  category: null | string
  description: null | string
  imagePublicId: null | string
  costPricePerUnit: number
  sellingPricePerUnit: number
  stockQuantity: number
  minimumStockLevel: number
  isLowStock: boolean
  status: PartBaseStatus
  isDeleted: boolean
  deletedAt: null | string
  createdAt: string
  updatedAt: null | string
}

export interface PartQueryParams {
  searchTerm?: string
  vendorId?: number
  category?: string
  status?: BackendPartStatus
  lowStockOnly?: boolean
  includeDeleted?: boolean
  pageNumber?: number
  pageSize?: number
}

export interface PartsFiltersState {
  searchTerm: string
  vendorId: string
  category: string
  status: PartStatusFilter
  includeDeleted: boolean
  pageNumber: number
  pageSize: number
}

export interface PartMutationPayload {
  vendorId: number
  partName: string
  partNumber: string
  category?: string
  description?: string
  sellingPricePerUnit: number
  minimumStockLevel: number
  status: BackendPartStatus
}

export interface DeletePartResult {
  partId: number
  deletedAt: string
}

export interface UploadPartImageResult {
  partId: number
  imagePublicId: string
}

export interface PartEditorFormValues {
  vendorId: string
  name: string
  partNumber: string
  category: string
  description: string
  retailPrice: string
  minimumReorderPoint: string
  status: PartBaseStatus
  image?: FileList
}

export interface InventorySummaryData {
  totalParts: number
  availableParts: number
  lowStockParts: number
  unavailableParts: number
}

export interface PartSummaryApiModel {
  totalParts: number
  availableParts: number
  lowStockParts: number
  unavailableParts: number
}

export interface SummaryCard {
  label: string
  value: string
  detail: string
  icon: 'alert' | 'box' | 'checkCircle' | 'warning'
  tone: 'danger' | 'primary' | 'success' | 'warning'
}

export interface VendorOption {
  id: number
  name: string
}

export interface CategoryOption {
  value: string
  label: string
}

export interface LowStockAlert {
  partId: number
  partName: string
  partNumber: string
  quantity: number
  vendorName: string
}
