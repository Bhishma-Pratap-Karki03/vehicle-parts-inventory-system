import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { mapPartFromApi } from '../../components/parts/parts.helpers'
import SalesInvoiceForm from '../../components/salesInvoices/SalesInvoiceForm'
import {
  buildSalesInvoicePayload,
  createEmptySalesInvoiceFormValues,
  getApiErrorMessage,
  getRequestErrorMessage,
  mapSalesInvoiceDetailFromApi,
  readApiResponse,
} from '../../components/salesInvoices/salesInvoices.helpers'
import backendUrl from '../../config'
import type { PagedResult } from '../../shared/interfaces/api.interface'
import type { PartApiModel, PartRecord } from '../../shared/interfaces/parts.interface'
import type {
  SalesInvoiceCustomerOption,
  SalesInvoiceDetailApiModel,
  SalesInvoiceFormValues,
  SalesInvoiceVehicleOption,
} from '../../shared/interfaces/salesInvoices.interface'

function SalesInvoiceCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefilledCustomerId = searchParams.get('customerId') ?? ''
  const prefilledVehicleId = searchParams.get('vehicleId') ?? ''
  const prefilledPartId = searchParams.get('partId') ?? ''

  const [customerOptions, setCustomerOptions] = useState<SalesInvoiceCustomerOption[]>([])
  const [vehicleOptions, setVehicleOptions] = useState<SalesInvoiceVehicleOption[]>([])
  const [partOptions, setPartOptions] = useState<PartRecord[]>([])
  const [isCustomerOptionsLoading, setIsCustomerOptionsLoading] = useState(true)
  const [isPartOptionsLoading, setIsPartOptionsLoading] = useState(true)
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState(prefilledCustomerId)

  const initialValues = useMemo(
    () => createEmptySalesInvoiceFormValues(prefilledCustomerId, prefilledVehicleId, prefilledPartId),
    [prefilledCustomerId, prefilledVehicleId, prefilledPartId],
  )

  useEffect(() => {
    let isCancelled = false

    const fetchCustomerOptions = async () => {
      setIsCustomerOptionsLoading(true)

      try {
        const response = await fetch(`${backendUrl}/api/sales-invoices/customers/options`)
        const result = await readApiResponse<SalesInvoiceCustomerOption[]>(response)

        if (isCancelled) {
          return
        }

        if (!result.success || !result.data) {
          setCustomerOptions([])
          toast.error(getApiErrorMessage(result.message, result.errors))
          return
        }

        setCustomerOptions(result.data)
      } catch (error) {
        if (isCancelled) {
          return
        }

        setCustomerOptions([])
        toast.error(getRequestErrorMessage(error, 'Unable to load customers for the sales invoice form.'))
      } finally {
        if (!isCancelled) {
          setIsCustomerOptionsLoading(false)
        }
      }
    }

    void fetchCustomerOptions()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedCustomerId) {
      setVehicleOptions([])
      setIsVehiclesLoading(false)
      return
    }

    let isCancelled = false

    const fetchCustomerVehicles = async () => {
      setVehicleOptions([])
      setIsVehiclesLoading(true)

      try {
        const response = await fetch(
          `${backendUrl}/api/sales-invoices/customers/${encodeURIComponent(selectedCustomerId)}/vehicles/options`,
        )
        const result = await readApiResponse<SalesInvoiceVehicleOption[]>(response)

        if (isCancelled) {
          return
        }

        if (!result.success || !result.data) {
          setVehicleOptions([])
          toast.error(getApiErrorMessage(result.message, result.errors))
          return
        }

        setVehicleOptions(result.data)
      } catch (error) {
        if (isCancelled) {
          return
        }

        setVehicleOptions([])
        toast.error(getRequestErrorMessage(error, 'Unable to load vehicles for the selected customer.'))
      } finally {
        if (!isCancelled) {
          setIsVehiclesLoading(false)
        }
      }
    }

    void fetchCustomerVehicles()

    return () => {
      isCancelled = true
    }
  }, [selectedCustomerId])

  useEffect(() => {
    let isCancelled = false

    const fetchParts = async () => {
      setIsPartOptionsLoading(true)

      try {
        const collectedParts: PartRecord[] = []
        let pageNumber = 1
        let hasNextPage = true

        while (hasNextPage) {
          const query = new URLSearchParams({
            includeDeleted: 'false',
            pageNumber: String(pageNumber),
            pageSize: '100',
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
            .filter((part) => !part.isDeleted && part.status === 'Available')
            .sort((left, right) => left.partName.localeCompare(right.partName)),
        )
      } catch (error) {
        if (isCancelled) {
          return
        }

        setPartOptions([])
        toast.error(getRequestErrorMessage(error, 'Unable to load parts for the sales invoice form.'))
      } finally {
        if (!isCancelled) {
          setIsPartOptionsLoading(false)
        }
      }
    }

    void fetchParts()

    return () => {
      isCancelled = true
    }
  }, [])

  async function handleSubmitInvoice(values: SalesInvoiceFormValues) {
    setIsSubmitting(true)

    try {
      const response = await fetch(`${backendUrl}/api/sales-invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildSalesInvoicePayload(values)),
      })

      const result = await readApiResponse<SalesInvoiceDetailApiModel>(response)

      if (!result.success || !result.data) {
        toast.error(getApiErrorMessage(result.message, result.errors))
        return
      }

      const createdInvoice = mapSalesInvoiceDetailFromApi(result.data)
      toast.success(result.message || 'Sales invoice created successfully.')
      navigate(`/sales-invoices/${createdInvoice.salesInvoiceId}`)
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to create this sales invoice right now.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SalesInvoiceForm
      customerOptions={customerOptions}
      initialValues={initialValues}
      isCustomerOptionsLoading={isCustomerOptionsLoading}
      isPartOptionsLoading={isPartOptionsLoading}
      isVehiclesLoading={isVehiclesLoading}
      isSubmitting={isSubmitting}
      onCustomerSelected={setSelectedCustomerId}
      onSubmitInvoice={handleSubmitInvoice}
      partOptions={partOptions}
      vehicleOptions={vehicleOptions}
    />
  )
}

export default SalesInvoiceCreatePage
