import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import PartEditorForm from '../../components/parts/PartEditorForm'
import {
  buildPartMutationPayload,
  getApiErrorMessage,
  getRequestErrorMessage,
  mapPartFromApi,
} from '../../components/parts/parts.helpers'
import NotFoundPage from '../../pages/NotFoundPage'
import type { CategoryOption, PartApiModel, PartEditorFormValues, PartRecord, UploadPartImageResult, VendorOption } from '../../shared/interfaces/parts.interface'
import { apiRequest } from '../../shared/utils/api'

function PartEditorPage() {
  const navigate = useNavigate()
  const { partId } = useParams()
  const numericPartId = useMemo(() => {
    if (!partId) {
      return undefined
    }

    return Number.parseInt(partId, 10)
  }, [partId])

  const [part, setPart] = useState<PartRecord>()
  const [vendorOptions, setVendorOptions] = useState<VendorOption[]>([])
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])
  const [isPartLoading, setIsPartLoading] = useState(Boolean(partId))
  const [isOptionsLoading, setIsOptionsLoading] = useState(true)
  const [isDeletingImage, setIsDeletingImage] = useState(false)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [isNotFound, setIsNotFound] = useState(false)

  const isInvalidId = Boolean(partId && (!numericPartId || Number.isNaN(numericPartId)))
  const isLoading = isPartLoading || isOptionsLoading

  useEffect(() => {
    if (!partId) {
      setPart(undefined)
      setErrorMessage(null)
      setIsPartLoading(false)
      setIsNotFound(false)
      return
    }

    if (!numericPartId || Number.isNaN(numericPartId)) {
      setPart(undefined)
      setErrorMessage('This part ID is invalid.')
      setIsPartLoading(false)
      setIsNotFound(false)
      return
    }

    const partIdToLoad = numericPartId
    let isCancelled = false

    const fetchPart = async () => {
      setIsPartLoading(true)
      setErrorMessage(null)
      setIsNotFound(false)

      try {
        const result = await apiRequest<PartApiModel>(`/api/Parts/${partIdToLoad}`)

        if (isCancelled) {
          return
        }

        if (!result.success || !result.data) {
          setPart(undefined)
          setIsNotFound(result.statusCode === 404)
          setErrorMessage(getApiErrorMessage(result.message, result.errors))
          return
        }

        setPart(mapPartFromApi(result.data))
      } catch (error) {
        if (isCancelled) {
          return
        }

        setPart(undefined)
        setIsNotFound(false)
        setErrorMessage(getRequestErrorMessage(error, 'Unable to load this part from the backend.'))
      } finally {
        if (!isCancelled) {
          setIsPartLoading(false)
        }
      }
    }

    void fetchPart()

    return () => {
      isCancelled = true
    }
  }, [numericPartId, partId])

  useEffect(() => {
    let isCancelled = false

    const fetchEditorOptions = async () => {
      setIsOptionsLoading(true)

      try {
        const [vendorsResult, categoriesResult] = await Promise.all([
          apiRequest<VendorOption[]>('/api/Parts/vendors/options'),
          apiRequest<CategoryOption[]>('/api/Parts/categories/options'),
        ])

        if (isCancelled) {
          return
        }

        setVendorOptions(vendorsResult.success && vendorsResult.data ? vendorsResult.data : [])
        setCategoryOptions(categoriesResult.success && categoriesResult.data ? categoriesResult.data : [])
      } catch {
        if (isCancelled) {
          return
        }

        setVendorOptions([])
        setCategoryOptions([])
      } finally {
        if (!isCancelled) {
          setIsOptionsLoading(false)
        }
      }
    }

    void fetchEditorOptions()

    return () => {
      isCancelled = true
    }
  }, [])

  async function handleSubmitPart(values: PartEditorFormValues, imageFile?: File) {
    const payload = buildPartMutationPayload(values)
    const isEditingExistingPart = Boolean(partId && part)

    try {
      const result = await apiRequest<PartApiModel>(`/api/Parts${isEditingExistingPart ? `/${part!.partId}` : ''}`, {
        method: isEditingExistingPart ? 'PUT' : 'POST',
        body: payload,
      })

      if (!result.success || !result.data) {
        toast.error(getApiErrorMessage(result.message, result.errors))
        return
      }

      let savedPart = mapPartFromApi(result.data)

      if (imageFile) {
        const imageFormData = new FormData()
        imageFormData.append('image', imageFile)

        const imageResult = await apiRequest<UploadPartImageResult>(`/api/Parts/${savedPart.partId}/image`, {
          method: part?.imagePublicId ? 'PATCH' : 'POST',
          body: imageFormData,
        })

        if (!imageResult.success || !imageResult.data) {
          toast.warn(`Part saved, but image upload failed. ${getApiErrorMessage(imageResult.message, imageResult.errors)}`)
        } else {
          savedPart = {
            ...savedPart,
            imagePublicId: imageResult.data.imagePublicId,
          }
        }
      }

      setPart(savedPart)
      toast.success(isEditingExistingPart ? 'Part updated successfully.' : 'Part created successfully.')

      if (!isEditingExistingPart) {
        navigate(`/parts/${savedPart.partId}/edit`, { replace: true })
      }
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to save this part right now.'))
    }
  }

  async function handleDeleteImage() {
    if (!part) {
      return false
    }

    setIsDeletingImage(true)

    try {
      const result = await apiRequest<string>(`/api/Parts/${part.partId}/image`, {
        method: 'DELETE',
      })

      if (!result.success) {
        toast.error(getApiErrorMessage(result.message, result.errors))
        return false
      }

      setPart({
        ...part,
        imagePublicId: null,
      })
      toast.success(result.message || 'Image deleted successfully.')
      return true
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to delete the current image.'))
      return false
    } finally {
      setIsDeletingImage(false)
    }
  }

  if (isInvalidId || isNotFound) {
    return <NotFoundPage />
  }

  if (partId && errorMessage && !part && !isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F8FB] p-6 text-[#00235C]">
        <section className="w-full max-w-xl rounded-3xl border border-[#DCE5EF] bg-white p-8 shadow-[0_20px_48px_rgba(18,43,74,0.08)]">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Backend issue</p>
          <h1 className="text-[28px] font-semibold text-[#102B49] [font-family:var(--font-display)]">We couldn&apos;t load that part.</h1>
          <p className="mt-4 text-[15px] leading-7 text-[#556E88]">{errorMessage}</p>

          <div className="mt-6">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white no-underline shadow-[0_14px_30px_rgba(21,85,141,0.2)]"
              to="/parts"
            >
              Back to Parts Management
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <PartEditorForm
      categoryOptions={categoryOptions}
      isDeletingImage={isDeletingImage}
      isLoading={isLoading}
      isOptionsLoading={isOptionsLoading}
      mode={partId ? 'edit' : 'create'}
      onDeleteImage={part?.imagePublicId ? handleDeleteImage : undefined}
      onSubmitPart={handleSubmitPart}
      part={part}
      vendorOptions={vendorOptions}
    />
  )
}

export default PartEditorPage
