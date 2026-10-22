
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Search,
  CalendarDays,
  ClipboardList,
  FileText,
  Heart,
  MessageCircle,
  Bell,
  MapPin,
  CreditCard,
  UserRound,
  LogOut,
  LoaderCircle,
  CheckCircle,
  Clock,
  BriefcaseBusiness,
} from "lucide-react";

import "./CustomerDashboard.css";

const API_URL = "http://localhost:5000";

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view your dashboard.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/api/customer/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load dashboard.");
        }

        setData(result);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="customer-loading">
        <LoaderCircle size={32} />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      
<aside className="customer-sidebar">
  <h2 className="customer-brand">NearHand</h2>
  <p className="customer-tagline">Your Service, Near You</p>

  <nav className="customer-navigation">
    <button
      className="customer-nav active"
      onClick={() => navigate("/customer/dashboard")}
    >
      <LayoutDashboard size={19} />
      Dashboard
    </button>

    <button
      className="customer-nav"
      onClick={() => navigate("/customer/search-providers")}
    >
      <Search size={19} />
      Search Providers
    </button>

    <button
      className="customer-nav"
      onClick={() => navigate("/customer/book-service")}
    >
      <BriefcaseBusiness size={19} />
      Book Service
    </button>

    <button
      className="customer-nav"
      onClick={() => navigate("/customer/booking-history")}
    >
      <ClipboardList size={19} />
      Booking History
    </button>

    

    <button
      className="customer-nav"
      onClick={() => navigate("/customer/favorites")}
    >
      <Heart size={19} />
      Favorites
    </button>

    <button
      className="customer-nav"
      onClick={() => navigate("/customer/chat")}
    >
      <MessageCircle size={19} />
      Chat
    </button>

    <button
      className="customer-nav"
      onClick={() => navigate("/customer/notifications")}
    >
      <Bell size={19} />
      Notifications
    </button>

    <button
      className="customer-nav"
      onClick={() => navigate("/customer/live-tracking")}
    >
      <MapPin size={19} />
      Live Tracking
    </button>

    <button
      className="customer-nav"
      onClick={() => navigate("/customer/payment")}
    >
      <CreditCard size={19} />
      Payment
    </button>

    <button
      className="customer-nav"
      onClick={() => navigate("/customer/profile")}
    >
      <UserRound size={19} />
      Profile
    </button>
  </nav>

  <button
    className="customer-nav customer-logout"
    onClick={handleLogout}
  >
    <LogOut size={19} />
    Logout
  </button>
</aside>


      <main className="customer-main">
        <header className="customer-header">
          <div>
            <p className="customer-eyebrow">CUSTOMER DASHBOARD</p>
            <h1>Welcome to NearHand!</h1>
            <p>Find trusted professionals for your everyday needs.</p>
          </div>

          <button
            className="customer-primary-btn"
            onClick={() => navigate("/services")}
          >
            <Search size={18} />
            Find a Service
          </button>
        </header>

        {error ? (
          <div className="customer-error">
            <p>{error}</p>
            <button onClick={() => navigate("/login")}>
              Go to Login
            </button>
          </div>
        ) : (
          <>
            <section className="customer-stats">
              <div className="customer-stat-card">
                <div className="customer-stat-icon">
                  <CalendarDays size={22} />
                </div>
                <p>Total Bookings</p>
                <h2>{data?.stats?.totalBookings ?? 0}</h2>
              </div>

              <div className="customer-stat-card">
                <div className="customer-stat-icon">
                  <CheckCircle size={22} />
                </div>
                <p>Completed Bookings</p>
                <h2>{data?.stats?.completedBookings ?? 0}</h2>
              </div>

              <div className="customer-stat-card">
                <div className="customer-stat-icon">
                  <Clock size={22} />
                </div>
                <p>Upcoming Bookings</p>
                <h2>{data?.stats?.upcomingCount ?? 0}</h2>
              </div>
            </section>

            <section className="customer-bookings-section">
              <div className="customer-section-heading">
                <div>
                  <h2>Upcoming Bookings</h2>
                  <p>Your upcoming service appointments</p>
                </div>
              </div>

              {data?.upcomingBookings?.length > 0 ? (
                <div className="customer-booking-list">
                  {data.upcomingBookings.map((booking) => (
                    <article
                      className="customer-booking-card"
                      key={booking._id}
                    >
                      <div className="customer-booking-icon">
                        <CalendarDays size={23} />
                      </div>

                      <div className="customer-booking-details">
                        <h3>
                          {booking.serviceName || "Home Service"}
                        </h3>
                        <p>
                          Provider:{" "}
                          {booking.provider?.fullName || "Provider"}
                        </p>
                        <p>
                          {booking.bookingDate
                            ? new Date(
                                booking.bookingDate
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Date not available"}
                        </p>
                        <p>Address: {booking.address || "Not provided"}</p>
                      </div>

                      <div className="customer-booking-meta">
                        <strong>
                          ₹{Number(booking.price || 0).toLocaleString("en-IN")}
                        </strong>
                        <span className="customer-status">
                          {booking.status || "Pending"}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="customer-empty-state">
                  <CalendarDays size={38} />
                  <h3>No upcoming bookings yet</h3>
                  <p>
                    When you book a service, your appointment will appear here.
                  </p>
                  <button
                    className="customer-primary-btn"
                    onClick={() => navigate("/services")}
                  >
                    Explore Services
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
