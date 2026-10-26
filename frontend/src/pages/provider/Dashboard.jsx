
import { useEffect, useState } from "react";
import NotificationBell from "../../components/NotificationBell";

import {
  Home,
  User,
  Settings,
  LayoutDashboard,
  CalendarDays,
  BriefcaseBusiness,
  IndianRupee,
  CheckCircle,
  Clock,
  UserRound,
  UserRoundPen,
  LogOut,
  Menu,
  Bell,
  ArrowUpRight,
  MapPin,
  Star,
  LoaderCircle,
  MessageCircle,
  Image,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ProviderDashboard.css";

const API_URL = "http://localhost:5000";

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view your dashboard.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/api/providers/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();


        console.log("Provider dashboard response:", result);
console.log("Rejection reason:", result.provider?.rejectionReason);

        if (!response.ok) {
          throw new Error(result.message || "Unable to load dashboard");
        }

        setData(result);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return "Date not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  if (loading) {
    return (
      <div className="provider-loading">
        <LoaderCircle className="spin-icon" size={32} />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="provider-error">
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  const stats = data.stats || {};
  const bookings = data.upcomingBookings || [];
  const provider = data.provider || {};

  return (
    <div className="provider-dashboard">
      <aside className={`provider-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="provider-brand">
          <div className="brand-symbol">N</div>
          <div>
            <h2>NearHand</h2>
            <span>Provider Portal</span>
          </div>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        
<button
  className="provider-nav active"
  onClick={() => navigate("/provider/dashboard")}
>
  <LayoutDashboard size={19} />
  Dashboard
</button>

<button
  className="provider-nav"
  onClick={() => navigate("/provider/availability")}
>
  <Clock size={19} />
  Availability
</button>
<button
  className="provider-nav"
  onClick={() => {
    setSidebarOpen(false);
    navigate("/provider/bookings");
  }}
>
  <CalendarDays size={19} />
  Booking Requests
</button>


<button
  className="provider-nav"
  onClick={() => navigate("/provider/notifications")}
>
  <Bell size={19} />
  Notifications
</button>


<button
  className="provider-nav"
  onClick={() => navigate("/provider/earnings")}
>
  <IndianRupee size={19} />
  Earnings
</button>

<button
  className="provider-nav"
  onClick={() => navigate("/provider/reviews")}
>
  <Star size={19} />
  Reviews
</button>

<button
  className="provider-nav"
  onClick={() => navigate("/provider/profile")}
>
  <UserRound size={19} />
  My Profile
</button>




        <div className="provider-sidebar-bottom">
          <div className="provider-help">
            <div className="help-icon">
              <Star size={20} />
            </div>
            <strong>Grow with NearHand</strong>
            <p>Keep your profile updated to attract more customers.</p>
          </div>

          <button className="provider-nav logout" onClick={handleLogout}>
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="provider-overlay"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="provider-main">
        
      <header className="provider-header">
        <button
          className="provider-menu-button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>

        <div className="provider-breadcrumb">
          <span>Workspace</span>
          <span>/</span>
          <strong>Dashboard</strong>
        </div>

        <div className="provider-header-right">
          <NotificationBell role="provider" />

          <div className="provider-status">
            <span
              className={`status-dot ${
                provider.verificationStatus === "Approved" ? "approved" : ""
              }`}
            />
            {provider.verificationStatus || "Pending"}
          </div>

          <button
            type="button"
            className="provider-avatar"
            onClick={() => navigate("/provider/profile")}
            aria-label="Open my provider profile"
            title="My Profile"
          >
           {(provider.fullName || "P").charAt(0).toUpperCase()}
          </button>
        </div>
      </header>


        <section className="provider-content">
          <div className="provider-welcome">
            <div>
              <p className="provider-eyebrow">YOUR BUSINESS AT A GLANCE</p>
              <h1>Welcome back, {provider.fullName || "Provider"}!</h1>
              <p>Here's what's happening with your services today.</p>
            </div>

            <button
              className="provider-primary-button"
              onClick={() => navigate("/provider/profile")}
            >
              <UserRound size={17} />
              View Profile
              <ArrowUpRight size={17} />
            </button>
          </div>

          
{provider.verificationStatus === "Rejected" ? (
  <div className="provider-rejection-notice">
    <div className="rejection-notice-icon">
      <span>!</span>
    </div>

    <div className="rejection-notice-content">
      <strong>Your provider application was rejected</strong>

      <p>
        Unfortunately, your application has not been approved.
        Please review the reason below.
      </p>

      <div className="rejection-reason-box">
        <strong>Reason for rejection</strong>
        <p>
          {provider.rejectionReason?.trim() ||
            "No rejection reason was provided. Please contact the NearHand admin team."}
        </p>
      </div>

      <p className="rejection-contact-message">
        If you need clarification, please contact the admin team.
      </p>
    </div>
  </div>
) : provider.verificationStatus !== "Approved" ? (
  <div className="provider-verification-notice">
    <Clock size={21} />

    <div>
      <strong>
        Verification status: {provider.verificationStatus || "Pending"}
      </strong>

      <p>
        Your provider account must be approved before you can
        be presented as a verified service provider.
      </p>
    </div>
  </div>
) : null}


          <div className="provider-stats-grid">
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings ?? 0}
              subtitle="All booking requests"
              icon={<CalendarDays size={22} />}
              color="green"
            />

            <StatCard
              title="Pending Bookings"
              value={stats.pendingBookings ?? 0}
              subtitle="Awaiting your action"
              icon={<Clock size={22} />}
              color="orange"
            />

            <StatCard
              title="Completed Jobs"
              value={stats.completedBookings ?? 0}
              subtitle="Successfully completed"
              icon={<CheckCircle size={22} />}
              color="blue"
            />

            <StatCard
              title="Total Earnings"
              value={formatCurrency(stats.totalEarnings)}
              subtitle="From completed bookings"
              icon={<IndianRupee size={22} />}
              color="purple"
            />
          </div>

          <div className="provider-content-grid">
            <section className="provider-panel upcoming-panel">
              <div className="provider-panel-heading">
                <div>
                  <h2>Upcoming Bookings</h2>
                  <p>Your next scheduled appointments</p>
                </div>

                <button
                  className="provider-text-button"
                  onClick={() => navigate("/provider/bookings")}
                >
                  View all <ArrowUpRight size={16} />
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="provider-empty-state">
                  <div className="empty-calendar">
                    <CalendarDays size={27} />
                  </div>
                  <h3>No upcoming bookings yet</h3>
                  <p>
                    New appointments will appear here when customers book
                    your services.
                  </p>
                </div>
              ) : (
                <div className="provider-booking-list">
                  {bookings.map((booking) => (
                    <div
                      className="provider-booking-item"
                      key={booking._id}
                    >
                      <div className="booking-date-icon">
                        <CalendarDays size={21} />
                      </div>

                      <div className="booking-details">
                        <strong>
                          {booking.serviceName || provider.serviceCategory}
                        </strong>
                        <span>
                          {booking.customer?.fullName || "Customer"}
                        </span>
                        <span className="booking-date">
                          {formatDate(booking.bookingDate)}
                        </span>
                      </div>

                      <div className="booking-right">
                        <strong>{formatCurrency(booking.price)}</strong>
                        <span
                          className={`booking-status ${(
                            booking.status || "Pending"
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {booking.status || "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="profile-card">
  <div className="profile-icon">
    <UserRoundPen size={28} />
  </div>

  <div className="profile-info">
    <h3>Your Service Profile</h3>
    <p>Manage your service details, skills, pricing, and availability.</p>
  </div>

  <button
    className="update-profile-btn"
    onClick={() => navigate("/provider/Availability")}
  >
    Update Profile <ArrowRight size={18} />
  </button>
</div>
          </div>

          <section className="provider-panel provider-business-card">
            <div className="business-card-icon">
              <MapPin size={23} />
            </div>
            <div>
              <p className="provider-eyebrow">YOUR SERVICE</p>
              <h2>{provider.serviceCategory || "Service category not set"}</h2>
              <p>
                Your service details and verification status are managed
                through your provider profile.
              </p>
            </div>
            
          </section>

          <footer className="provider-footer">
            <span>© {new Date().getFullYear()} NearHand</span>
            <span>Your Service, Near You.</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="provider-stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <p className="stat-title">{title}</p>
      <h2>{value}</h2>
      <p className="stat-subtitle">{subtitle}</p>
    </div>
  );
}
