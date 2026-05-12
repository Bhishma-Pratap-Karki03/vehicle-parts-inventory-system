import { Navigate, Route, Routes } from 'react-router-dom'
import NotFoundPage from './pages/NotFoundPage'
import PartDetailsPage from './pages/parts/PartDetailsPage'
import PartEditorPage from './pages/parts/PartEditorPage'
import PartsManagementPage from './pages/parts/PartsManagementPage'
import PartTransactionDetailsPage from './pages/partTransactions/PartTransactionDetailsPage'
import PartTransactionListPage from './pages/partTransactions/PartTransactionListPage'
import StockAdjustmentPage from './pages/partTransactions/StockAdjustmentPage'
import PurchaseInvoiceCreatePage from './pages/purchaseInvoices/PurchaseInvoiceCreatePage'
import PurchaseInvoiceDetailsPage from './pages/purchaseInvoices/PurchaseInvoiceDetailsPage'
import PurchaseInvoiceListPage from './pages/purchaseInvoices/PurchaseInvoiceListPage'
import SalesInvoiceCreatePage from './pages/salesInvoices/SalesInvoiceCreatePage'
import SalesInvoiceDetailsPage from './pages/salesInvoices/SalesInvoiceDetailsPage'
import SalesInvoiceListPage from './pages/salesInvoices/SalesInvoiceListPage'

import CustomerCreatePage from './pages/customers/CustomerCreatePage'
import CustomerSearchPage from './pages/customers/CustomerSearchPage'
import CustomerDetailsPage from './pages/customers/CustomerDetailsPage'

function App() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/parts" />} path="/" />

      <Route element={<PartsManagementPage />} path="/parts" />
      <Route element={<PartEditorPage />} path="/parts/new" />
      <Route element={<PartDetailsPage />} path="/parts/:partId" />
      <Route element={<PartEditorPage />} path="/parts/:partId/edit" />

      <Route element={<PartTransactionListPage />} path="/part-transactions" />
      <Route element={<StockAdjustmentPage />} path="/part-transactions/create" />
      <Route element={<PartTransactionDetailsPage />} path="/part-transactions/:partTransactionId" />

      <Route element={<PurchaseInvoiceListPage />} path="/purchase-invoices" />
      <Route element={<PurchaseInvoiceCreatePage />} path="/purchase-invoices/create" />
      <Route element={<PurchaseInvoiceDetailsPage />} path="/purchase-invoices/:purchaseInvoiceId" />

      <Route element={<SalesInvoiceListPage />} path="/sales-invoices" />
      <Route element={<SalesInvoiceCreatePage />} path="/sales-invoices/create" />
      <Route element={<SalesInvoiceDetailsPage />} path="/sales-invoices/:salesInvoiceId" />

      <Route element={<CustomerCreatePage />} path="/customers/create" />
      <Route element={<CustomerSearchPage />} path="/customers/search" />
      <Route element={<CustomerDetailsPage />} path="/customers/:id" />

      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  )
}

export default App