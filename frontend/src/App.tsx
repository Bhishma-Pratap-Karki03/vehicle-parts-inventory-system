import { Navigate, Route, Routes } from 'react-router-dom'

import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CustomerProfilePage from './pages/customer/CustomerProfilePage'
import CustomerPurchaseHistoryPage from './pages/customer/CustomerPurchaseHistoryPage'
import CustomerServiceHistoryPage from './pages/customer/CustomerServiceHistoryPage'
import CustomerVehiclesPage from './pages/customer/CustomerVehiclesPage'
import PartTransactionDetailsPage from './pages/partTransactions/PartTransactionDetailsPage'
import PartTransactionListPage from './pages/partTransactions/PartTransactionListPage'
import StockAdjustmentPage from './pages/partTransactions/StockAdjustmentPage'
import PartDetailsPage from './pages/parts/PartDetailsPage'
import PartEditorPage from './pages/parts/PartEditorPage'
import PartsManagementPage from './pages/parts/PartsManagementPage'
import PurchaseInvoiceCreatePage from './pages/purchaseInvoices/PurchaseInvoiceCreatePage'
import PurchaseInvoiceDetailsPage from './pages/purchaseInvoices/PurchaseInvoiceDetailsPage'
import PurchaseInvoiceListPage from './pages/purchaseInvoices/PurchaseInvoiceListPage'
import SalesInvoiceCreatePage from './pages/salesInvoices/SalesInvoiceCreatePage'
import SalesInvoiceDetailsPage from './pages/salesInvoices/SalesInvoiceDetailsPage'
import SalesInvoiceListPage from './pages/salesInvoices/SalesInvoiceListPage'
import StaffCustomerReportsPage from './pages/staff/StaffCustomerReportsPage'
import { useAuth } from './shared/auth/useAuth'
import { ProtectedRoute } from './shared/auth/ProtectedRoute'
import AppLayout from './shared/layout/AppLayout'

function RootRedirect() {
  const { hasAnyRole, isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  if (hasAnyRole(['Customer'])) {
    return <Navigate replace to="/customer/profile" />
  }

  return <Navigate replace to="/parts" />
}

function UnauthorizedPage() {
  return (
    <main className="grid min-h-[60vh] place-items-center px-4 py-12 text-center">
      <div>
        <span aria-hidden className="material-symbols-outlined text-[40px] text-[#A94E48]">
          lock
        </span>
        <h1 className="mt-2 text-[26px] font-semibold text-[#0C2544] [font-family:var(--font-display)]">
          You can&apos;t access this page
        </h1>
        <p className="mt-2 text-[14px] text-[#52677F]">
          Your account doesn&apos;t have permission to view this resource.
        </p>
      </div>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/register" />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route element={<RootRedirect />} path="/" />
        <Route element={<UnauthorizedPage />} path="/unauthorized" />

        <Route
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <PartsManagementPage />
            </ProtectedRoute>
          }
          path="/parts"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <PartEditorPage />
            </ProtectedRoute>
          }
          path="/parts/new"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <PartDetailsPage />
            </ProtectedRoute>
          }
          path="/parts/:partId"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <PartEditorPage />
            </ProtectedRoute>
          }
          path="/parts/:partId/edit"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <PartTransactionListPage />
            </ProtectedRoute>
          }
          path="/part-transactions"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <StockAdjustmentPage />
            </ProtectedRoute>
          }
          path="/part-transactions/create"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <PartTransactionDetailsPage />
            </ProtectedRoute>
          }
          path="/part-transactions/:partTransactionId"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <PurchaseInvoiceListPage />
            </ProtectedRoute>
          }
          path="/purchase-invoices"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <PurchaseInvoiceCreatePage />
            </ProtectedRoute>
          }
          path="/purchase-invoices/create"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <PurchaseInvoiceDetailsPage />
            </ProtectedRoute>
          }
          path="/purchase-invoices/:purchaseInvoiceId"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <SalesInvoiceListPage />
            </ProtectedRoute>
          }
          path="/sales-invoices"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <SalesInvoiceCreatePage />
            </ProtectedRoute>
          }
          path="/sales-invoices/create"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <SalesInvoiceDetailsPage />
            </ProtectedRoute>
          }
          path="/sales-invoices/:salesInvoiceId"
        />

        <Route
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <StaffCustomerReportsPage />
            </ProtectedRoute>
          }
          path="/staff/customer-reports"
        />

        <Route
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <CustomerProfilePage />
            </ProtectedRoute>
          }
          path="/customer/profile"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <CustomerVehiclesPage />
            </ProtectedRoute>
          }
          path="/customer/vehicles"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <CustomerPurchaseHistoryPage />
            </ProtectedRoute>
          }
          path="/customer/purchase-history"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <CustomerServiceHistoryPage />
            </ProtectedRoute>
          }
          path="/customer/service-history"
        />
      </Route>

      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  )
}

export default App
