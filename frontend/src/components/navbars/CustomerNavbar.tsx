import React from "react";
import { Link } from "react-router-dom";
import "./CustomerNavbar.css";

function CustomerNavbar() {
    return (
        <header className="customer-navbar">
            <div className="customer-navbar-container">

                {/* LOGO */}
                <div className="customer-brand">
                    <img
                        src="/images/autocare-logo.jpg"
                        alt="AutoCare IMS Logo"
                        className="customer-logo"
                    />
                </div>

                {/* NAVIGATION */}
                <nav className="customer-nav-links">

                    {/* HOME */}
                    <Link to="/">Home</Link>

                    {/* APPOINTMENTS */}
                    <div className="customer-dropdown">
                        <button>Appointments ▾</button>
                        <div className="customer-dropdown-menu">
                            <Link to="/appointments/book">Book Appointment</Link>
                            <Link to="/appointments/my">My Appointments</Link>
                        </div>
                    </div>

                    {/* PART REQUESTS */}
                    <div className="customer-dropdown">
                        <button>Part Requests ▾</button>
                        <div className="customer-dropdown-menu">
                            <Link to="/parts/request">Request Part</Link>
                            <Link to="/parts/my">My Part Requests</Link>
                        </div>
                    </div>

                    {/* REVIEWS */}
                    <div className="customer-dropdown">
                        <button>Reviews ▾</button>
                        <div className="customer-dropdown-menu">
                            <Link to="/reviews/my">My Reviews</Link>
                            <p>Reviews are linked to completed appointments.</p>
                        </div>
                    </div>

                    {/* HISTORY */}
                    <div className="customer-dropdown">
                        <button>History ▾</button>
                        <div className="customer-dropdown-menu">
                            <Link to="/history/service">Service History</Link>
                            <Link to="/history/purchase">Purchase History</Link>
                        </div>
                    </div>

                    {/* VEHICLES */}
                    <div className="customer-dropdown">
                        <button>Vehicles ▾</button>
                        <div className="customer-dropdown-menu">
                            <Link to="/vehicles">My Vehicles</Link>
                            <Link to="/vehicles/add">Add Vehicle</Link>
                        </div>
                    </div>

                </nav>

                {/* RIGHT SIDE */}
                <div className="customer-navbar-right">
                    <button className="customer-notification">🔔</button>

                    <div className="customer-profile-dropdown">
                        <button className="customer-profile-button">
                            <div className="customer-avatar">C</div>

                            <div className="customer-profile-text">
                                <strong>Customer</strong>
                                <span>My Account</span>
                            </div>

                            <span>▾</span>
                        </button>

                        <div className="customer-profile-menu">
                            <Link to="/profile">My Profile</Link>
                            <Link to="/profile/edit">Edit Profile</Link>
                            <hr />
                            <Link to="/logout" className="customer-logout">
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </header>
    );
}

export default CustomerNavbar;