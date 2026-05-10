import { BrowserRouter, Routes, Route } from "react-router-dom";

import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import BookAppointment from "./pages/customer/appointments/BookAppointment";
import MyAppointments from "./pages/customer/appointments/MyAppointments";
import AppointmentDetails from "./pages/customer/appointments/AppointmentDetails";
import RequestPart from "./pages/customer/parts/RequestPart";
import MyPartRequests from "./pages/customer/parts/MyPartRequests";
import PartRequestDetails from "./pages/customer/parts/PartRequestDetails";

import StaffDashboard from "./pages/staff/StaffDashboard";

import FinancialReports from "./pages/admin/reports/FinancialReports";

function App() {
    return (
        <BrowserRouter>
            <Routes>
             {/* Customer Routes */}
                <Route
                    path="/"
                    element={
                        <CustomerLayout>
                            <CustomerDashboard />
                        </CustomerLayout>
                    }
                />

                <Route
                    path="/appointments/book"
                    element={
                        <CustomerLayout>
                            <BookAppointment />
                        </CustomerLayout>
                    }
                />

                <Route
                    path="/appointments/my"
                    element={
                        <CustomerLayout>
                            <MyAppointments />
                        </CustomerLayout>
                    }
                />

                <Route
                    path="/appointments/:id"
                    element={
                        <CustomerLayout>
                            <AppointmentDetails />
                        </CustomerLayout>
                    }
                />

                <Route
                    path="/parts/request"
                    element={
                        <CustomerLayout>
                            <RequestPart />
                        </CustomerLayout>
                    }
                />

                <Route
                    path="/parts/my"
                    element={
                        <CustomerLayout>
                            <MyPartRequests />
                        </CustomerLayout>
                    }
                />

                <Route
                    path="/parts/requests/:id"
                    element={
                        <CustomerLayout>
                            <PartRequestDetails />
                        </CustomerLayout>
                    }
                />

                <Route path="/staff" element={<StaffLayout />}>
                    <Route index element={<StaffDashboard />} />
                </Route>

                {/* Admin Routes */}
                <Route
                    path="/admin/reports/financial"
                    element={
                        <AdminLayout>
                            <FinancialReports />
                        </AdminLayout>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;