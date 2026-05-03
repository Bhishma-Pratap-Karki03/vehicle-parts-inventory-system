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
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  )
}

export default App
