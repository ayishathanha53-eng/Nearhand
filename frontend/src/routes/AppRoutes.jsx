
import { Routes, Route } from "react-router-dom";

// Public pages
import Home from "../pages/public/Home";
import Services from "../pages/public/Services";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";

// Authentication
import Register from "../pages/auth/Register";
import ProviderRegister from "../pages/auth/ProviderRegister";
import Login from "../pages/auth/Login";

// Dashboards
import ProviderDashboard from "../pages/provider/Dashboard";
import CustomerDashboard from "../pages/customer/Dashboard";

// Customer pages
import BookingDetails from "../pages/customer/BookingDetails";
import IndividualBooking from "../pages/customer/IndividualBooking";
import BookingHistory from "../pages/customer/BookingHistory";
import BookService from "../pages/customer/BookService";
import Favorites from "../pages/customer/Favorites";
import Payment from "../pages/customer/Payment";
import Profile from "../pages/customer/Profile";
import SearchProviders from "../pages/customer/SearchProviders";
import CustomerNotifications from "../pages/customer/Notifications";
import ProviderPublicProfile from "../pages/customer/ProviderPublicProfile";

// Provider pages
import ProviderBookings from "../pages/provider/ProviderBookings";
import Availability from "../pages/provider/Availability";

import ProviderChat from "../pages/provider/Chat";
import Earnings from "../pages/provider/Earnings";
import MyJobs from "../pages/provider/MyJobs";
import ProviderProfile from "../pages/provider/Profile";
import Reviews from "../pages/provider/Reviews";
import ProviderNotifications from "../pages/provider/Notifications";
import ProviderBookingDetails from "../pages/provider/BookingDetails";

// Admin pages
import AdminLogin from "../pages/admin/adminLogin";
import AdminDashboard from "../pages/admin/Dashboard";
import ProviderDetails from "../pages/admin/ProviderDetails";
import AdminProtectedRoute from "../pages/admin/Protected";

import AdminReviews from "../pages/admin/Reviews";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Forgot PassWord */}
      <Route path="/forgot-password" element={<ForgotPassword />}/>
      <Route path="/reset-password" element={<ResetPassword />}/>

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/provider/register"
        element={<ProviderRegister />}
      />

      {/* Provider dashboard */}
      <Route
        path="/provider/dashboard"
        element={<ProviderDashboard />}
      />

      {/* Provider features */}
      <Route
        path="/provider/availability"
        element={<Availability />}
      />
      <Route
        path="/provider/booking-requests"
        element={<ProviderBookings />}
      />
      <Route
        path="/provider/my-jobs"
        element={<MyJobs />}
      />
      <Route
        path="/provider/earnings"
        element={<Earnings />}
      />
      <Route
        path="/provider/reviews"
        element={<Reviews />}
      />
      <Route
        path="/provider/chat"
        element={<ProviderChat />}
      />
     
      <Route
        path="/provider/profile"
        element={<ProviderProfile />}
      />
      <Route
        path="/provider/settings"
        element={<ProviderProfile />}
      />
      <Route
        path="/provider/bookings"
        element={<ProviderBookings />}
      />

      {/* Provider notifications */}
      <Route
        path="/provider/notifications"
        element={<ProviderNotifications />}
      />

      {/* Provider individual booking */}
      <Route
        path="/provider/bookings/:bookingId"
        element={<ProviderBookingDetails />}
      />

      {/* Customer dashboard */}
      <Route
        path="/customer/dashboard"
        element={<CustomerDashboard />}
      />

      {/* Customer features */}
      <Route
        path="/customer/search-providers"
        element={<SearchProviders />}
      />
      <Route
        path="/customer/book-service"
        element={<BookService />}
      />
      <Route
        path="/customer/booking-history"
        element={<BookingHistory />}
      />

      {/* Existing booking details used by Booking History */}
      <Route
        path="/customer/booking-details/:bookingId"
        element={<BookingDetails />}
      />

      {/* Individual booking opened from notifications */}
      <Route
        path="/customer/bookings/:bookingId"
        element={<IndividualBooking />}
      />

      <Route
        path="/customer/favorites"
        element={<Favorites />}
      />
     
      <Route
        path="/customer/profile"
        element={<Profile />}
      />

      {/* Customer notifications */}
      <Route
        path="/customer/notifications"
        element={<CustomerNotifications />}
      />

      {/* Admin pages */}
    <Route
  path="/admin/login"
  element={<AdminLogin />}
/>

<Route element={<AdminProtectedRoute />}>
  <Route
    path="/admin/dashboard"
    element={<AdminDashboard />}
  />

  <Route
    path="/admin/provider/:id"
    element={<ProviderDetails />}
  />
</Route>


      <Route
        path="/customer/provider/:providerId"
        element={<ProviderPublicProfile />}
      />
      <Route path="/admin/reviews" element={<AdminReviews />} />
      <Route
        path="/admin/providers/:id"
        element={<ProviderDetails />}
      />
    </Routes>
  );
}
