import CustomerNavbar from "../components/navbars/CustomerNavbar";

function CustomerLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <CustomerNavbar />
            <main>{children}</main>
        </>
    );
}

export default CustomerLayout;