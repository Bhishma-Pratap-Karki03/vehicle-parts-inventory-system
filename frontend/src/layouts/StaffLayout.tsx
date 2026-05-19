import { Outlet } from "react-router-dom";
import StaffNavbar from "../components/navbars/StaffNavbar";

function StaffLayout({ children }: { children?: React.ReactNode }) {
    return (
        <div className="staff-layout">
            <StaffNavbar />

            <main className="staff-layout-main">
                {children ?? <Outlet />}
            </main>
        </div>
    );
}

export default StaffLayout;
