import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../shared/auth/useAuth";
import "./CustomerNavbar.css";

function CustomerNavbar() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const displayName = user?.fullName || "Customer";

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    return (
        <header className="customer-navbar">
            <div className="customer-navbar-container">
                <div className="customer-brand">
                    <Link to="/home">
                        <img
                            src="/images/autocare-logo.jpg"
                            alt="AutoCare IMS Logo"
                            className="customer-logo"
                        />
                    </Link>
                </div>

                <nav className="customer-nav-links">
                    <Link to="/home">Home</Link>

                    <div className="customer-dropdown">
                        <button type="button">Appointments ▾</button>
                        <div className="customer-dropdown-menu">
                            <Link to="/appointments/book">Book Appointment</Link>
                            <Link to="/appointments/my">My Appointments</Link>
                        </div>
                    </div>

                    <div className="customer-dropdown">
                        <button type="button">Part Requests ▾</button>
                        <div className="customer-dropdown-menu">
                            <Link to="/parts/request">Request Part</Link>
                            <Link to="/parts/my">My Part Requests</Link>
                        </div>
                    </div>

                    <div className="customer-dropdown">
                        <button type="button">History ▾</button>
                        <div className="customer-dropdown-menu">
                            <Link to="/customer/service-history">Service History</Link>
                            <Link to="/customer/purchase-history">Purchase History</Link>
                        </div>
                    </div>

                    <div className="customer-dropdown">
                        <button type="button">Vehicles ▾</button>
                        <div className="customer-dropdown-menu">
                            <Link to="/customer/vehicles">My Vehicles</Link>
                        </div>
                    </div>
                </nav>

                <div className="customer-navbar-right">
                    <div className="customer-profile-dropdown">
                        <button className="customer-profile-button" type="button">
                            <div className="customer-avatar">{displayName.charAt(0).toUpperCase()}</div>

                            <div className="customer-profile-text">
                                <strong>{displayName}</strong>
                                <span>My Account</span>
                            </div>

                            <span>▾</span>
                        </button>

                        <div className="customer-profile-menu">
                            <Link to="/customer/profile">My Profile</Link>
                            <Link to="/change-password">Change Password</Link>
                            <hr />
                            <button className="customer-logout" onClick={handleLogout} type="button">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </header>
    );
}

export default CustomerNavbar;
