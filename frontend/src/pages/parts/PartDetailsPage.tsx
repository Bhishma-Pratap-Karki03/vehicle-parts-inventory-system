import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icon from '../../components/icons/Icon'
import { formatPartCode, formatRupees, getApiErrorMessage, getPartDisplayStatus, getRequestErrorMessage, mapPartFromApi, readApiResponse } from '../../components/parts/parts.helpers'
import NotFoundPage from '../../pages/NotFoundPage'
import type { PartApiModel, PartRecord } from '../../shared/interfaces/parts.interface'
import { getCloudinaryImageUrl } from '../../shared/utils/cloudinary'

const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, '') ?? ''

const statusClasses = {
  Available: 'border border-[#C9E7D4] bg-[#EEFCF3] text-[#16784A]',
  'Low Stock': 'border border-[#F0C7AF] bg-[#FFF3EB] text-[#9A3E0B]',
  Discontinued: 'border border-[#F0C4C4] bg-[#FFF1F1] text-[#C54141]',
  Unavailable: 'border border-[#D9E3EE] bg-[#F4F7FA] text-[#516579]',
}

function PartDetailsPage() {
  const { partId } = useParams()
  const numericPartId = useMemo(() => {
    if (!partId) {
      return undefined
    }

    return Number.parseInt(partId, 10)
  }, [partId])

  const [part, setPart] = useState<PartRecord>()
  const [isLoading, setIsLoading] = useState(Boolean(partId))
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [isNotFound, setIsNotFound] = useState(false)

  const isInvalidId = Boolean(partId && (!numericPartId || Number.isNaN(numericPartId)))

  useEffect(() => {
    if (!partId) {
      setPart(undefined)
      setErrorMessage(null)
      setIsNotFound(false)
      setIsLoading(false)
      return
    }

    if (!numericPartId || Number.isNaN(numericPartId)) {
      setPart(undefined)
      setErrorMessage('This part ID is invalid.')
      setIsNotFound(false)
      setIsLoading(false)
      return
    }

    const partIdToLoad = numericPartId
    let isCancelled = false

    const fetchPart = async () => {
      setIsLoading(true)
      setErrorMessage(null)
      setIsNotFound(false)

      try {
        const response = await fetch(`${backendUrl}/api/Parts/${partIdToLoad}`)
        const result = await readApiResponse<PartApiModel>(response)

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
          setIsLoading(false)
        }
      }
    }

    void fetchPart()

    return () => {
      isCancelled = true
    }
  }, [numericPartId, partId])

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

  if (isLoading || !part) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#F7FAFD_0%,#EEF4FA_55%,#F9FBFE_100%)] text-[#102B49]">
        <div className="mx-auto flex min-h-screen w-full max-w-380 items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="rounded-[28px] border border-[#DCE5EF] bg-white px-8 py-10 text-center shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D8197]">Backend sync</p>
            <h1 className="mt-3 text-[30px] font-semibold text-[#102B49] [font-family:var(--font-display)]">Loading part details</h1>
            <p className="mt-3 text-[15px] leading-7 text-[#566E87]">Pulling the latest part information from the backend...</p>
          </div>
        </div>
      </main>
    )
  }

  const displayStatus = getPartDisplayStatus(part)
  const partImageUrl = getCloudinaryImageUrl(part.imagePublicId, {
    width: 960,
    height: 576,
  })

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F7FAFD_0%,#EEF4FA_55%,#F9FBFE_100%)] text-[#102B49]">
      <div className="mx-auto w-full max-w-380 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-6 border-b border-[#DCE5EF] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <Link
              className="inline-flex items-center gap-2 text-[15px] font-medium text-[#45637F] transition hover:text-[#163E66]"
              to="/parts"
            >
              <Icon name="arrowBack" className="text-[18px]" />
              Back to Parts Management
            </Link>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[#0C2544] [font-family:var(--font-display)] sm:text-[42px]">
                {part.partName}
              </h1>
              <span className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] ${statusClasses[displayStatus]}`}>
                {displayStatus}
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#566E87] sm:text-[16px]">
              View the saved catalog information exactly as it currently exists in the backend.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#C8D6E5] bg-white px-5 text-[14px] font-semibold text-[#24405E] no-underline shadow-[0_10px_24px_rgba(18,43,74,0.05)] transition hover:border-[#AEC3D9] hover:bg-[#F7FBFE]"
              to="/parts"
            >
              Close
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#15558D] px-5 text-[14px] font-semibold text-white no-underline shadow-[0_14px_30px_rgba(21,85,141,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0E487C]"
              to={`/parts/${part.partId}/edit`}
            >
              <Icon name="edit" className="text-[18px]" />
              Edit Part
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-6">
            <div className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="mb-5 flex items-center gap-3 border-b border-[#E6EEF5] pb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                  <Icon name="info" className="text-[20px]" />
                </span>
                <div>
                  <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Part Details</h2>
                  <p className="mt-1 text-[14px] text-[#678099]">Core information currently stored on the backend record.</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Part Name</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{part.partName}</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Part Number</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{part.partNumber}</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Vendor</p>
                  <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{part.vendorName}</p>
                  <p className="mt-1 text-[13px] text-[#6F849B]">Vendor ID {part.vendorId}</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Category</p>
                  <p className="mt-2 text-[18px] font-semibold text-[#112B49]">{part.category || 'Uncategorized'}</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4 md:col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Description</p>
                  <p className="mt-2 text-[15px] leading-7 text-[#52677F]">{part.description || 'No description has been saved for this part yet.'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#DCE5EF] bg-white p-6 shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="mb-5 flex items-center gap-3 border-b border-[#E6EEF5] pb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FC] text-[#15558D]">
                  <Icon name="payments" className="text-[20px]" />
                </span>
                <div>
                  <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#102B49] [font-family:var(--font-display)]">Pricing & Stock</h2>
                  <p className="mt-1 text-[14px] text-[#678099]">Commercial values and stock health from the current record.</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Purchase Price</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{formatRupees(part.costPricePerUnit)}</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Retail Price</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{formatRupees(part.sellingPricePerUnit)}</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Current Stock</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{part.stockQuantity} units</p>
                </div>
                <div className="rounded-[22px] border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Minimum Reorder</p>
                  <p className="mt-2 text-[20px] font-semibold text-[#112B49]">{part.minimumStockLevel} units</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-[#DCE5EF] bg-white shadow-[0_20px_48px_rgba(18,43,74,0.07)]">
              <div className="flex items-center justify-between bg-[#123E69] px-5 py-4 text-white">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Catalog record</p>
                  <h2 className="mt-1 text-[23px] font-semibold tracking-[-0.02em] [font-family:var(--font-display)]">Preview</h2>
                </div>
                <span className={`inline-flex min-h-8 items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${statusClasses[displayStatus]}`}>
                  {displayStatus}
                </span>
              </div>

              <div className="p-5">
                {partImageUrl ? (
                  <div className="overflow-hidden rounded-3xl border border-[#D8E3EE] bg-[#F7FAFD]">
                    <img alt={part.partName} className="aspect-[5/3] w-full object-cover" src={partImageUrl} />
                  </div>
                ) : (
                  <div className="flex aspect-[5/3] items-center justify-center rounded-3xl border border-[#D8E3EE] bg-[linear-gradient(135deg,#0F2949_0%,#22466D_42%,#A7BED5_100%)] text-white">
                    <div className="text-center">
                      <Icon name="box" className="mx-auto text-[34px]" />
                      <p className="mt-3 text-[14px] font-medium text-white/86">No image uploaded yet</p>
                    </div>
                  </div>
                )}

                <div className="mt-5 rounded-3xl border border-[#E3EAF2] bg-[#F8FBFE] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70849A]">Record references</p>
                  <div className="mt-3 space-y-3 text-[14px] text-[#4D6580]">
                    <p><span className="font-semibold text-[#123052]">Code:</span> {formatPartCode(part.partId)}</p>
                    <p><span className="font-semibold text-[#123052]">Created:</span> {new Date(part.createdAt).toLocaleString()}</p>
                    <p><span className="font-semibold text-[#123052]">Updated:</span> {part.updatedAt ? new Date(part.updatedAt).toLocaleString() : 'Not updated yet'}</p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default PartDetailsPage
