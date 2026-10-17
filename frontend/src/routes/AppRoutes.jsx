
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
import BookingHistory from "../pages/customer/BookingHistory";
import BookService from "../pages/customer/BookService";
import Chat from "../pages/customer/Chat";
import Favorites from "../pages/customer/Favorites";
import LiveTracking from "../pages/customer/LiveTracking";
import Notifications from "../pages/customer/Notifications";
import Payment from "../pages/customer/Payment";
import Profile from "../pages/customer/Profile";
import SearchProviders from "../pages/customer/SearchProviders";


import Availability from "../pages/provider/Availability";
import BookingRequests from "../pages/provider/BookingRequests";
import ProviderChat from "../pages/provider/Chat";
import Earnings from "../pages/provider/Earnings";
import MyJobs from "../pages/provider/MyJobs";
import Portfolio from "../pages/provider/Portfolio";
import ProviderProfile from "../pages/provider/Profile";
import Reviews from "../pages/provider/Reviews";


import AdminDashboard from "../pages/admin/Dashboard";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

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
  element={<BookingRequests />}
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
  path="/provider/portfolio"
  element={<Portfolio />}
/>
<Route
  path="/provider/profile"
  element={<ProviderProfile />}
/>
<Route
  path="/provider/settings"
  element={<ProviderProfile />}
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
      <Route
        path="/customer/booking-details"
        element={<BookingDetails />}
      />
      <Route
        path="/customer/favorites"
        element={<Favorites />}
      />
      <Route
        path="/customer/chat"
        element={<Chat />}
      />
      <Route
        path="/customer/notifications"
        element={<Notifications />}
      />
      <Route
        path="/customer/live-tracking"
        element={<LiveTracking />}
      />
      <Route
        path="/customer/payment"
        element={<Payment />}
      />
      <Route
        path="/customer/profile"
        element={<Profile />}
      />


      <Route path="/admin/Dashboard" element={<AdminDashboard />} />

    </Routes>

    
  );
}
