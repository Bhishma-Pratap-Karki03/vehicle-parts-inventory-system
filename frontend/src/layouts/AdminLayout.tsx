import AdminNavbar from "../components/navbars/AdminNavbar";

function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="admin-layout">
            <AdminNavbar />

            <main
                style={{
                    marginLeft: "280px",
                    paddingTop: "72px",
                    minHeight: "100vh",
                    background: "#f7f9fb",
                }}
            >
                {children}
            </main>
        </div>
    );
}

export default AdminLayout;