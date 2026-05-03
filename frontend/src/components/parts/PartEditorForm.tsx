import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import type {
  CategoryOption,
  PartBaseStatus,
  PartDisplayStatus,
  PartEditorFormValues,
  PartEditorMode,
  PartRecord,
  VendorOption,
} from '../../shared/interfaces/parts.interface'
import { getCloudinaryImageUrl } from '../../shared/utils/cloudinary'
import ConfirmationDialog from './ConfirmationDialog'
import PartFormField from './PartFormField'
import PartFormSection from './PartFormSection'
import PartImageUploader from './PartImageUploader'
import PartLivePreview from './PartLivePreview'
import { buildPartEditorDefaultValues, getPartDisplayStatus } from './parts.helpers'

type PartEditorFormProps = {
  mode: PartEditorMode
  part?: PartRecord
  isLoading?: boolean
  isOptionsLoading?: boolean
  vendorOptions: VendorOption[]
  categoryOptions: CategoryOption[]
  onSubmitPart: (values: PartEditorFormValues, imageFile?: File) => Promise<void>
  onDeleteImage?: () => Promise<boolean>
  isDeletingImage?: boolean
}

const inputClassName =
  'h-14 w-full rounded-[18px] border border-[#D7E1EC] bg-white px-4 text-[15px] text-[#17324F] outline-none transition placeholder:text-[#8A9AAC] focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10'

const textareaClassName =
  'min-h-[170px] w-full rounded-[20px] border border-[#D7E1EC] bg-white px-4 py-3 text-[15px] text-[#17324F] outline-none transition placeholder:text-[#8A9AAC] focus:border-[#9CB9D8] focus:ring-4 focus:ring-[#15558D]/10'

const selectClassName = `${inputClassName} appearance-none pr-11`


const editablePartStatuses: PartBaseStatus[] = ['Available', 'Unavailable', 'Discontinued']

function parseInteger(value: string) {
  return Number.parseInt(value, 10)
}

function SelectChevron() {
  return (
    <span
      aria-hidden
      className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 inline-flex -translate-y-1/2 select-none items-center justify-center leading-none text-[22px] text-[#607389] not-italic"
    >
      expand_more
    </span>
  )
}

function EditorLoadingState() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F7FAFD_0%,#EEF4FA_55%,#F9FBFE_100%)] text-[#102B49]">
      <div className="mx-auto flex min-h-screen w-full max-w-380 items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="rounded-[28px] border border-[#DCE5EF] bg-white px-8 py-10 text-center shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Backend sync</p>
          <h1 className="mt-3 text-[30px] font-semibold text-[#102B49] [font-family:var(--font-display)]">Loading part editor</h1>
          <p className="mt-3 text-[15px] leading-7 text-[#566E87]">Pulling the latest part details from the backend...</p>
        </div>
      </div>
    </main>
  )
}

function PartEditorForm({
  mode,
  part,
  isLoading = false,
  isOptionsLoading = false,
  vendorOptions,
  categoryOptions,
  onSubmitPart,
  onDeleteImage,
  isDeletingImage = false,
}: PartEditorFormProps) {
  const defaultValues = useMemo(() => buildPartEditorDefaultValues(part), [part])
  const [categoryInputMode, setCategoryInputMode] = useState<'custom' | 'dropdown'>('dropdown')
  const [isDeleteImageDialogOpen, setIsDeleteImageDialogOpen] = useState(false)
  const lastImageErrorMessageRef = useRef<null | string>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PartEditorFormValues>({
    mode: 'onSubmit',
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const [watchedVendorId, watchedName, watchedPartNumber, watchedCategory, watchedRetailPrice, watchedStatus, watchedImage] = useWatch({
    control,
    name: ['vendorId', 'name', 'partNumber', 'category', 'retailPrice', 'status', 'image'],
  })

  const selectedFile = watchedImage?.[0]

  const vendorOptionsForSelect = (() => {
    if (!part?.vendorId || !part.vendorName) {
      return vendorOptions
    }

    const currentVendorExists = vendorOptions.some((vendor) => vendor.id === part.vendorId)
    if (currentVendorExists) {
      return vendorOptions
    }

    return [
      {
        id: part.vendorId,
        name: part.vendorName,
      },
      ...vendorOptions,
    ]
  })()

  const normalizedCategory = (watchedCategory ?? '').trim()
  const categoryExists = normalizedCategory ? categoryOptions.some((categoryOption) => categoryOption.value === normalizedCategory) : false
  const categoryOptionsForSelect = normalizedCategory && !categoryExists
    ? [
        {
          value: normalizedCategory,
          label: normalizedCategory,
        },
        ...categoryOptions,
      ]
    : categoryOptions
  const shouldUseCustomCategoryInput = categoryInputMode === 'custom' || Boolean(normalizedCategory && !categoryExists)

  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return getCloudinaryImageUrl(part?.imagePublicId, {
        width: 1200,
        height: 800,
      })
    }

    return URL.createObjectURL(selectedFile)
  }, [part?.imagePublicId, selectedFile])

  useEffect(() => {
    if (!selectedFile || !previewUrl) {
      return
    }

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl, selectedFile])

  useEffect(() => {
    const imageErrorMessage = typeof errors.image?.message === 'string' ? errors.image.message : null

    if (!imageErrorMessage) {
      lastImageErrorMessageRef.current = null
      return
    }

    if (lastImageErrorMessageRef.current === imageErrorMessage) {
      return
    }

    toast.error(imageErrorMessage)
    lastImageErrorMessageRef.current = imageErrorMessage
  }, [errors.image?.message])

  const publishLabel = mode === 'edit' ? 'Update Part' : 'Publish Part'
  const selectedVendor = vendorOptionsForSelect.find((vendor) => String(vendor.id) === watchedVendorId)
  const vendorPreviewText = selectedVendor
    ? `${selectedVendor.name} (Vendor ID ${selectedVendor.id})`
    : part?.vendorName
      ? `${part.vendorName} (Vendor ID ${part.vendorId})`
      : 'Select a supplier from the backend list.'

  const previewStatus: PartDisplayStatus = useMemo(() => {
    if (mode === 'edit' && part) {
      return getPartDisplayStatus({
        isDeleted: part.isDeleted,
        status: watchedStatus || part.status,
        isLowStock: part.isLowStock,
      })
    }

    return watchedStatus || 'Available'
  }, [mode, part, watchedStatus])

  async function onSubmitHandler(data: PartEditorFormValues) {
    await onSubmitPart(data, selectedFile)
  }

  async function handleDeleteImage() {
    if (!onDeleteImage) {
      return
    }

    const deleted = await onDeleteImage()
    if (deleted) {
      setIsDeleteImageDialogOpen(false)
    }
  }

  const imageRegistration = register('image', {
    validate: {
      fileType: (files) => {
        const file = files?.[0]

        if (!file) {
          return true
        }

        return ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || 'Use a PNG, JPG, or WEBP image.'
      },
      fileSize: (files) => {
        const file = files?.[0]

        if (!file) {
          return true
        }

        return file.size <= 2 * 1024 * 1024 || 'Image size must be 2 MB or smaller.'
      },
    },
  })

  if (isLoading) {
    return <EditorLoadingState />
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F7FAFD_0%,#EEF4FA_55%,#F9FBFE_100%)] text-[#102B49]">
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="mx-auto w-full max-w-380 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="flex flex-col gap-6 border-b border-[#DCE5EF] pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <Link
                className="inline-flex items-center gap-2 text-[15px] font-medium text-[#45637F] transition hover:text-[#163E66]"
                to="/parts"
              >
                <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[18px] not-italic">
                  arrow_back
                </span>
                Back to Parts Management
              </Link>

              <h1 className="mt-4 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#0C2544] [font-family:var(--font-display)] sm:text-[42px]">
                {mode === 'edit' ? 'Edit Part' : 'Add New Part'}
              </h1>
              <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#566E87] sm:text-[16px]">
                {mode === 'edit'
                  ? 'Refine the catalog-facing fields the current backend DTO allows, then update the part image if you need to.'
                  : 'Create a new part record with the current backend payload, then add the primary image in the same flow.'}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className="inline-flex min-h-13 items-center justify-center rounded-full bg-[#15558D] px-6 text-[15px] font-semibold text-white shadow-[0_16px_30px_rgba(21,85,141,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0E487C] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? `${publishLabel}...` : publishLabel}
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-6">
              <PartFormSection
                description="These fields map directly to the current backend create and update DTOs."
                icon="info"
                title="Basic Information"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <PartFormField error={errors.name?.message} label="Part Name" required>
                    <input
                      className={inputClassName}
                      placeholder="e.g. High-Performance Brake Pad"
                      type="text"
                      {...register('name', {
                        required: 'Part name is required.',
                        minLength: {
                          value: 3,
                          message: 'Part name should be at least 3 characters long.',
                        },
                        maxLength: {
                          value: 100,
                          message: 'Part name must be 100 characters or fewer.',
                        },
                      })}
                    />
                  </PartFormField>

                  <PartFormField error={errors.partNumber?.message} label="Manufacturer Part Number (MPN)" required>
                    <input
                      className={inputClassName}
                      placeholder="e.g. BP-88902-TR"
                      type="text"
                      {...register('partNumber', {
                        required: 'Manufacturer part number is required.',
                        minLength: {
                          value: 3,
                          message: 'Part number should be at least 3 characters long.',
                        },
                        maxLength: {
                          value: 100,
                          message: 'Part number must be 100 characters or fewer.',
                        },
                      })}
                    />
                  </PartFormField>

                  <PartFormField
                    error={errors.vendorId?.message}
                    hint={
                      isOptionsLoading
                        ? 'Loading vendor options from the backend...'
                        : vendorOptionsForSelect.length > 0
                          ? 'Choose the supplier from the backend vendor list.'
                          : 'No vendors are available from the backend yet.'
                    }
                    label="Vendor"
                    required
                  >
                    <div className="relative">
                      <select
                        className={selectClassName}
                        disabled={isOptionsLoading || vendorOptionsForSelect.length === 0}
                        {...register('vendorId', {
                          required: 'Vendor is required.',
                        })}
                      >
                        <option value="">Select a vendor</option>
                        {vendorOptionsForSelect.map((vendor) => (
                          <option key={vendor.id} value={String(vendor.id)}>
                            {vendor.name}
                          </option>
                        ))}
                      </select>
                      <SelectChevron />
                    </div>
                  </PartFormField>

                  <PartFormField
                    error={errors.category?.message}
                    hint={isOptionsLoading ? 'Loading category options from the backend...' : undefined}
                    label="Category"
                  >
                    <div className="flex flex-col gap-3">
                      {!shouldUseCustomCategoryInput ? (
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <select
                              className={selectClassName}
                              disabled={isOptionsLoading || categoryOptionsForSelect.length === 0}
                              {...register('category', {
                                maxLength: {
                                  value: 100,
                                  message: 'Category must be 100 characters or fewer.',
                                },
                              })}
                            >
                              <option value="">Select a category</option>
                              {categoryOptionsForSelect.map((categoryOption) => (
                                <option key={categoryOption.value} value={categoryOption.value}>
                                  {categoryOption.label}
                                </option>
                              ))}
                            </select>
                            <SelectChevron />
                          </div>
                          <button
                            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#C8D6E5] bg-white text-[#24405E] transition hover:border-[#AEC3D9] hover:bg-[#F7FBFE]"
                            onClick={() => setCategoryInputMode('custom')}
                            title="Add a new category"
                            type="button"
                          >
                            <span aria-hidden className="material-symbols-outlined inline-flex select-none items-center justify-center leading-none text-[20px] not-italic">
                              add
                            </span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            className={inputClassName}
                            placeholder="e.g. Brake Systems"
                            type="text"
                            {...register('category', {
                              maxLength: {
                                value: 100,
                                message: 'Category must be 100 characters or fewer.',
                              },
                            })}
                          />
                          <button
                            className="inline-flex h-12 shrink-0 items-center justify-center rounded-full border border-[#C8D6E5] bg-white px-4 text-[13px] font-semibold text-[#24405E] transition hover:border-[#AEC3D9] hover:bg-[#F7FBFE]"
                            onClick={() => {
                              if (!categoryExists) {
                                setValue('category', '')
                              }

                              setCategoryInputMode('dropdown')
                            }}
                            type="button"
                          >
                            Use dropdown
                          </button>
                        </div>
                      )}
                    </div>
                  </PartFormField>

                  <PartFormField error={errors.status?.message} label="Status" required>
                    <div className="relative">
                      <select
                        className={selectClassName}
                        {...register('status', {
                          required: 'Status is required.',
                        })}
                      >
                        {editablePartStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <SelectChevron />
                    </div>
                  </PartFormField>

                  <div className="md:col-span-2">
                    <PartFormField error={errors.description?.message} label="Description">
                      <textarea
                        className={textareaClassName}
                        placeholder="Detailed technical specifications and usage details..."
                        {...register('description', {
                          maxLength: {
                            value: 500,
                            message: 'Description must be 500 characters or fewer.',
                          },
                        })}
                      />
                    </PartFormField>
                  </div>
                </div>
              </PartFormSection>

              <PartFormSection
                description="Set the retail price for this part."
                icon="payments"
                title="Selling Details"
              >
                <div className="max-w-xl">
                  <PartFormField error={errors.retailPrice?.message} label="Retail Price" required>
                    <input
                      className={inputClassName}
                      placeholder="3800.00"
                      type="text"
                      {...register('retailPrice', {
                        required: 'Retail price is required.',
                        pattern: {
                          value: /^\d+(\.\d{1,2})?$/,
                          message: 'Enter a valid amount with up to 2 decimals.',
                        },
                        validate: (value) => Number.parseFloat(value) > 0 || 'Retail price must be greater than zero.',
                      })}
                    />
                  </PartFormField>
                </div>
              </PartFormSection>

              <PartFormSection
                description={mode === 'edit' ? 'Set the reorder threshold and review the current stock.' : 'Set the reorder threshold for this part.'}
                icon="inventory_2"
                title="Inventory Controls"
              >
                <div className={`grid gap-5 ${mode === 'edit' ? 'md:grid-cols-2' : 'max-w-xl'}`}>
                  <PartFormField error={errors.minimumReorderPoint?.message} label="Minimum Reorder Point" required>
                    <input
                      className={inputClassName}
                      placeholder="10"
                      type="text"
                      {...register('minimumReorderPoint', {
                        required: 'Minimum reorder point is required.',
                        pattern: {
                          value: /^\d+$/,
                          message: 'Minimum reorder point must be a whole number.',
                        },
                        validate: (value) => parseInteger(value) >= 1 || 'Minimum reorder point must be at least 1.',
                      })}
                    />
                  </PartFormField>

                  {mode === 'edit' ? (
                    <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Current stock</p>
                      <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{part ? `${part.stockQuantity} units` : '0 units'}</p>
                    </div>
                  ) : null}
                </div>
              </PartFormSection>
            </div>

            <aside className="space-y-6">
              <PartLivePreview
                category={watchedCategory}
                mode={mode}
                name={watchedName}
                partNumber={watchedPartNumber}
                resolvedImageUrl={previewUrl}
                retailPrice={watchedRetailPrice}
                status={previewStatus}
                stockQuantity={part?.stockQuantity ?? 0}
                vendor={vendorPreviewText}
              />

              <PartImageUploader
                category={watchedCategory}
                fileName={selectedFile?.name}
                isDeletingImage={isDeletingImage}
                onDeleteCurrentImage={part?.imagePublicId && !selectedFile ? () => setIsDeleteImageDialogOpen(true) : undefined}
                registration={imageRegistration}
                resolvedImageUrl={previewUrl}
                title={watchedName || 'Primary image'}
              />

             
            </aside>
          </div>
        </div>
      </form>

      {isDeleteImageDialogOpen && part && onDeleteImage ? (
        <ConfirmationDialog
          confirmLabel={isDeletingImage ? 'Removing Image...' : 'Delete Image'}
          description={(
            <>
              This removes the current image from
              <span className="font-semibold text-[#123052]"> {part.partName}</span>. You can upload a replacement straight away from the same editor.
            </>
          )}
          details={(
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Current image</p>
              <div className="mt-4 rounded-[18px] border border-[#E3EAF2] bg-white px-4 py-3 text-[14px] text-[#4D6580]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#70849A]">Part number</p>
                <p className="mt-1 font-semibold text-[#123052]">{part.partNumber}</p>
              </div>
            </>
          )}
          eyebrow="Image confirmation"
          icon="image"
          isBusy={isDeletingImage}
          onCancel={() => {
            if (!isDeletingImage) {
              setIsDeleteImageDialogOpen(false)
            }
          }}
          onConfirm={handleDeleteImage}
          title="Delete this image?"
        />
      ) : null}
    </main>
  )
}

export default PartEditorForm
