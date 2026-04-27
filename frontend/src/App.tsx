import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import BookAppointment from "./pages/customer/appointments/BookAppointment";
import MyAppointments from "./pages/customer/appointments/MyAppointments";
import AppointmentDetails from "./pages/customer/appointments/AppointmentDetails";
import RequestPart from "./pages/customer/parts/RequestPart";
import MyPartRequests from "./pages/customer/parts/MyPartRequests";
import PartRequestDetails from "./pages/customer/parts/PartRequestDetails";

function App() {
    return (
        <BrowserRouter>
            <CustomerLayout>
                <Routes>
                    <Route path="/" element={<CustomerDashboard />} />
                    <Route path="/appointments/book" element={<BookAppointment />} />
                    <Route path="/appointments/my" element={<MyAppointments />} />
                    <Route path="/appointments/:id" element={<AppointmentDetails />} />
                    <Route path="/parts/request" element={<RequestPart />} />
                    <Route path="/parts/my" element={<MyPartRequests />} />
                    <Route path="/parts/requests/:id" element={<PartRequestDetails />} />
                </Routes>
            </CustomerLayout>
        </BrowserRouter>
    );
}

export default App;