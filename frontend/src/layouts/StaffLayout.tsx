import { Outlet } from "react-router-dom";
import StaffNavbar from "../components/navbars/StaffNavbar";

function StaffLayout() {
    return (
        <>
            <StaffNavbar />

            <main style={{ marginLeft: "280px", paddingTop: "72px" }}>
                <Outlet />
            </main>
        </>
    );
}

export default StaffLayout;