import { Routes, Route } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import BookAppointment from "./pages/customer/appointments/BookAppointment";
import MyAppointments from "./pages/customer/appointments/MyAppointments";
import AppointmentDetails from "./pages/customer/appointments/AppointmentDetails";
import RequestPart from "./pages/customer/parts/RequestPart";
import MyPartRequests from "./pages/customer/parts/MyPartRequests";
import PartRequestDetails from "./pages/customer/parts/PartRequestDetails";

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

function App() {
    return (
        <CustomerLayout>
            <Routes>
                <Route path="/" element={<CustomerDashboard />} />
                <Route path="/appointments/book" element={<BookAppointment />} />
                <Route path="/appointments/my" element={<MyAppointments />} />
                <Route path="/appointments/:id" element={<AppointmentDetails />} />
                <Route path="/parts/request" element={<RequestPart />} />
                <Route path="/parts/my" element={<MyPartRequests />} />
                <Route path="/parts/requests/:id" element={<PartRequestDetails />} />
                
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
                <Route element={<NotFoundPage />} path="*" />
            </Routes>
        </CustomerLayout>
    );
}
export default App;