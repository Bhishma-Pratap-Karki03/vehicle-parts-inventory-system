import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import PurchaseInvoiceForm from '../../components/purchaseInvoices/PurchaseInvoiceForm'
import {
  buildPurchaseInvoicePayload,
  createEmptyPurchaseInvoiceFormValues,
  getApiErrorMessage,
  getRequestErrorMessage,
  mapPurchaseInvoiceDetailFromApi,
  readApiResponse,
} from '../../components/purchaseInvoices/purchaseInvoices.helpers'
import { mapPartFromApi } from '../../components/parts/parts.helpers'
import type { PagedResult } from '../../shared/interfaces/api.interface'
import type { PartApiModel, PartRecord, VendorOption } from '../../shared/interfaces/parts.interface'
import type { PurchaseInvoiceDetailApiModel, PurchaseInvoiceFormValues } from '../../shared/interfaces/purchaseInvoices.interface'

import backendUrl from '../../config';

function PurchaseInvoiceCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [vendorOptions, setVendorOptions] = useState<VendorOption[]>([])
  const [partOptions, setPartOptions] = useState<PartRecord[]>([])
  const [isOptionsLoading, setIsOptionsLoading] = useState(true)
  const [isPartsLoading, setIsPartsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedVendorId, setSelectedVendorId] = useState(() => searchParams.get('vendorId') ?? '')

  const prefilledVendorId = searchParams.get('vendorId') ?? ''
  const prefilledPartId = searchParams.get('partId') ?? ''

  const initialValues = useMemo<PurchaseInvoiceFormValues>(
    () => createEmptyPurchaseInvoiceFormValues(prefilledVendorId, prefilledPartId),
    [prefilledPartId, prefilledVendorId],
  )

  useEffect(() => {
    let isCancelled = false

    const fetchVendorOptions = async () => {
      setIsOptionsLoading(true)

      try {
        const response = await fetch(`${backendUrl}/api/Parts/vendors/options`)
        const result = await readApiResponse<VendorOption[]>(response)

        if (isCancelled) {
          return
        }

        if (!result.success || !result.data) {
          setVendorOptions([])
          toast.error(getApiErrorMessage(result.message, result.errors))
          return
        }

        setVendorOptions(result.data)
      } catch (error) {
        if (isCancelled) {
          return
        }

        setVendorOptions([])
        toast.error(getRequestErrorMessage(error, 'Unable to load vendors for the invoice form.'))
      } finally {
        if (!isCancelled) {
          setIsOptionsLoading(false)
        }
      }
    }

    void fetchVendorOptions()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedVendorId) {
      setPartOptions([])
      setIsPartsLoading(false)
      return
    }

    const numericVendorId = Number.parseInt(selectedVendorId, 10)

    if (!numericVendorId || Number.isNaN(numericVendorId)) {
      setPartOptions([])
      setIsPartsLoading(false)
      return
    }

    let isCancelled = false

    const fetchVendorParts = async () => {
      setIsPartsLoading(true)

      try {
        const collectedParts: PartRecord[] = []
        let pageNumber = 1
        let hasNextPage = true

        while (hasNextPage) {
          const query = new URLSearchParams({
            includeDeleted: 'false',
            pageNumber: String(pageNumber),
            pageSize: '100',
            vendorId: String(numericVendorId),
          })

          const response = await fetch(`${backendUrl}/api/Parts?${query.toString()}`)
          const result = await readApiResponse<PagedResult<PartApiModel>>(response)

          if (!result.success || !result.data) {
            throw new Error(getApiErrorMessage(result.message, result.errors))
          }

          collectedParts.push(...result.data.items.map(mapPartFromApi))
          hasNextPage = result.data.hasNextPage
          pageNumber += 1
        }

        if (isCancelled) {
          return
        }

        setPartOptions(
          collectedParts
            .filter((part) => !part.isDeleted)
            .sort((left, right) => left.partName.localeCompare(right.partName)),
        )
      } catch (error) {
        if (isCancelled) {
          return
        }

        setPartOptions([])
        toast.error(getRequestErrorMessage(error, 'Unable to load parts for the selected vendor.'))
      } finally {
        if (!isCancelled) {
          setIsPartsLoading(false)
        }
      }
    }

    void fetchVendorParts()

    return () => {
      isCancelled = true
    }
  }, [selectedVendorId])

  async function handleSubmitInvoice(values: PurchaseInvoiceFormValues) {
    setIsSubmitting(true)

    try {
      const response = await fetch(`${backendUrl}/api/purchase-invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildPurchaseInvoicePayload(values)),
      })

      const result = await readApiResponse<PurchaseInvoiceDetailApiModel>(response)

      if (!result.success || !result.data) {
        toast.error(getApiErrorMessage(result.message, result.errors))
        return
      }

      const createdInvoice = mapPurchaseInvoiceDetailFromApi(result.data)
      toast.success(result.message || 'Purchase invoice created successfully.')
      navigate(`/purchase-invoices/${createdInvoice.purchaseInvoiceId}`)
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to create this purchase invoice right now.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PurchaseInvoiceForm
      initialValues={initialValues}
      isOptionsLoading={isOptionsLoading}
      isPartsLoading={isPartsLoading}
      isSubmitting={isSubmitting}
      onSubmitInvoice={handleSubmitInvoice}
      onVendorSelected={setSelectedVendorId}
      partOptions={partOptions}
      vendorOptions={vendorOptions}
    />
  )
}

export default PurchaseInvoiceCreatePage
